#!/usr/bin/env node
// Stream-parses a 5GB+ Android SMS XML backup and serves it to the browser.
// Usage: node server.js <path-to-sms-backup.xml>
//        or double-click start.bat

const http  = require('http');
const fs    = require('fs');
const path  = require('path');
const PORT  = 7700;

// ── Argument ────────────────────────────────────────────────────────────
const xmlPath = process.argv[2];
if (!xmlPath) {
  console.error('Usage: node server.js <path-to-sms-backup.xml>');
  process.exit(1);
}
const absPath = path.resolve(xmlPath);
if (!fs.existsSync(absPath)) {
  console.error('File not found:', absPath);
  process.exit(1);
}

// ── Parse state ─────────────────────────────────────────────────────────
const threads = {};
let totalMessages = 0;
let parseProgress = 0; // 0–100
let parseDone = false;
let parseError = null;
const fileSize = fs.statSync(absPath).size;

// ── Streaming SAX-lite parser ───────────────────────────────────────────
function parseAttr(str, attr) {
  // Fast attribute extractor — handles both " and ' quotes
  const re = new RegExp(attr + '=["\']([^"\']*)["\']');
  const m = str.match(re);
  return m ? m[1] : '';
}

function cleanName(name) {
  if (!name || name === 'null' || name === '(Unknown)') return '';
  return name.trim();
}

function normalizeAddr(addr) {
  if (!addr || addr === 'null') return 'Unknown';
  const clean = addr.replace(/\s+/g, '');
  return clean.replace(/^(\+?1)?(\d{10})$/, (_, _p, n) => '+1' + n) || clean;
}

function addMessage(addr, name, msg) {
  if (!threads[addr]) threads[addr] = { name: name || addr, address: addr, messages: [] };
  if (name && name !== addr) threads[addr].name = name;
  threads[addr].messages.push(msg);
  totalMessages++;
}

function processSms(raw) {
  const addr = normalizeAddr(parseAttr(raw, 'address'));
  const name = cleanName(parseAttr(raw, 'contact_name'));
  const body = parseAttr(raw, 'body');
  const date = parseInt(parseAttr(raw, 'date') || '0', 10);
  const type = parseAttr(raw, 'type');
  const rDate = parseAttr(raw, 'readable_date');
  addMessage(addr, name || addr, {
    type: type === '2' ? 'sent' : 'received',
    body, date, readableDate: rDate, kind: 'sms'
  });
}

function processMms(raw) {
  const addr = normalizeAddr(parseAttr(raw, 'address'));
  const name = cleanName(parseAttr(raw, 'contact_name'));
  const date = parseInt(parseAttr(raw, 'date') || '0', 10);
  const mType = parseAttr(raw, 'm_type');
  const rDate = parseAttr(raw, 'readable_date');

  let body = '';
  const partRe = /<part\b([^>]*?)\/>/g;
  let pm;
  while ((pm = partRe.exec(raw)) !== null) {
    const ct   = parseAttr(pm[1], 'ct');
    const text = parseAttr(pm[1], 'text');
    if (ct === 'text/plain' && text && text !== 'null') {
      body = body ? body + '\n' + text : text;
    }
  }

  addMessage(addr, name || addr, {
    type: mType === '128' ? 'sent' : 'received',
    body, date, readableDate: rDate, kind: 'mms'
  });
}

// Stream through the file looking for <sms .../> and <mms ...></mms>
function startParse() {
  const stream = fs.createReadStream(absPath, { highWaterMark: 2 * 1024 * 1024 }); // 2MB chunks
  let buf = '';
  let bytesRead = 0;

  stream.on('data', chunk => {
    stream.pause(); // yield event loop so HTTP server can respond
    buf += chunk.toString('utf8');
    bytesRead += chunk.length;
    parseProgress = Math.min(99, Math.round((bytesRead / fileSize) * 100));

    let pos = 0;
    while (pos < buf.length) {
      const smsIdx = buf.indexOf('<sms ', pos);
      const mmsIdx = buf.indexOf('<mms ', pos);

      // Pick whichever element comes first
      let idx, isMms;
      if (smsIdx === -1 && mmsIdx === -1) { pos = buf.length; break; }
      if (smsIdx === -1) { idx = mmsIdx; isMms = true; }
      else if (mmsIdx === -1) { idx = smsIdx; isMms = false; }
      else if (smsIdx < mmsIdx) { idx = smsIdx; isMms = false; }
      else { idx = mmsIdx; isMms = true; }

      if (!isMms) {
        // Self-closing: <sms ... />
        const end = buf.indexOf('/>', idx);
        if (end === -1) { pos = idx; break; } // incomplete, wait for more data
        processSms(buf.slice(idx, end + 2));
        pos = end + 2;
      } else {
        // Multi-line: <mms ...>...</mms>
        const end = buf.indexOf('</mms>', idx);
        if (end === -1) { pos = idx; break; } // incomplete
        processMms(buf.slice(idx, end + 6));
        pos = end + 6;
      }
    }

    // Trim processed portion — keep from last unprocessed element start
    buf = buf.slice(pos);
    setImmediate(() => stream.resume()); // hand back to event loop before reading next chunk
  });

  stream.on('end', () => {
    // Finalise thread metadata
    Object.values(threads).forEach(t => {
      t.messages.sort((a, b) => a.date - b.date);
      t.lastDate = t.messages[t.messages.length - 1]?.date || 0;
      t.lastBody = t.messages[t.messages.length - 1]?.body || '';
    });
    parseProgress = 100;
    parseDone = true;
    console.log(`Done. ${Object.keys(threads).length} contacts, ${totalMessages.toLocaleString()} messages.`);
  });

  stream.on('error', err => {
    parseError = err.message;
    console.error('Parse error:', err.message);
  });
}

// ── HTTP server ─────────────────────────────────────────────────────────
const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

http.createServer((req, res) => {
  // CORS so browser can fetch from same origin
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(indexHtml);
  }

  if (req.url === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      progress: parseProgress,
      done: parseDone,
      error: parseError,
      contacts: Object.keys(threads).length,
      messages: totalMessages,
    }));
  }

  if (req.url === '/contacts') {
    const list = Object.values(threads)
      .sort((a, b) => b.lastDate - a.lastDate)
      .map(t => ({
        address: t.address,
        name: t.name,
        count: t.messages.length,
        lastDate: t.lastDate,
        lastBody: (t.lastBody || '').slice(0, 80),
      }));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(list));
  }

  if (req.url.startsWith('/thread/')) {
    const addr = decodeURIComponent(req.url.slice(8));
    const thread = threads[addr];
    if (!thread) {
      res.writeHead(404); return res.end('Not found');
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(thread));
  }

  res.writeHead(404); res.end('Not found');
}).listen(PORT, '127.0.0.1', () => {
  console.log(`SMS Viewer running at http://localhost:${PORT}`);
  console.log(`Parsing: ${absPath}`);
  // Try to open browser automatically
  const open = { win32: 'start', darwin: 'open', linux: 'xdg-open' }[process.platform];
  if (open) require('child_process').exec(`${open} http://localhost:${PORT}`);
});

startParse();
