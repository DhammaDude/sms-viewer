#!/usr/bin/env node
// Stream-parses a large Android SMS XML backup and serves it to the browser.
// Usage: node server.js <path-to-sms-backup.xml>  (or via start.bat)

const http  = require('http');
const fs    = require('fs');
const path  = require('path');
const PORT  = 7700;

// ── Argument ────────────────────────────────────────────────────────────
const xmlPath = process.argv[2];
if (!xmlPath) { console.error('Usage: node server.js <sms-backup.xml>'); process.exit(1); }
const absPath = path.resolve(xmlPath);
if (!fs.existsSync(absPath)) { console.error('File not found:', absPath); process.exit(1); }

// ── Parse state ─────────────────────────────────────────────────────────
const threads = {};
let totalMessages = 0;
let parseProgress = 0;
let parseDone = false;
let parseError = null;
const fileSize = fs.statSync(absPath).size;

// ── Fast attribute extractor (no regex, no allocations per call) ─────────
function parseAttr(str, attr, fromIdx) {
  const key = attr + '=';
  let i = str.indexOf(key, fromIdx || 0);
  if (i === -1) return '';
  i += key.length;
  const q = str[i];
  if (q !== '"' && q !== "'") return '';
  const end = str.indexOf(q, i + 1);
  if (end === -1) return '';
  return str.slice(i + 1, end);
}

function cleanName(name) {
  if (!name || name === 'null' || name === '(Unknown)') return '';
  return name.trim();
}

function normalizeAddr(addr) {
  if (!addr || addr === 'null') return 'Unknown';
  const c = addr.replace(/\s+/g, '');
  return c.replace(/^(\+?1)?(\d{10})$/, (_, _p, n) => '+1' + n) || c;
}

function addMessage(addr, name, msg) {
  if (!threads[addr]) threads[addr] = { name: name || addr, address: addr, messages: [] };
  if (name && name !== addr) threads[addr].name = name;
  threads[addr].messages.push(msg);
  totalMessages++;
}

function processSms(raw) {
  const addr  = normalizeAddr(parseAttr(raw, 'address'));
  const name  = cleanName(parseAttr(raw, 'contact_name'));
  const body  = parseAttr(raw, 'body');
  const date  = parseInt(parseAttr(raw, 'date') || '0', 10);
  const type  = parseAttr(raw, 'type');
  const rDate = parseAttr(raw, 'readable_date');
  addMessage(addr, name || addr, {
    t: type === '2' ? 's' : 'r',   // 's'ent / 'r'eceived — compact keys
    b: body,
    d: date,
    rd: rDate,
    k: 0,  // 0=sms
  });
}

const MAX_MMS_RAW = 512 * 1024; // 512 KB — skip image data beyond this

function processMms(raw) {
  const addr  = normalizeAddr(parseAttr(raw, 'address'));
  const name  = cleanName(parseAttr(raw, 'contact_name'));
  const date  = parseInt(parseAttr(raw, 'date') || '0', 10);
  const mType = parseAttr(raw, 'm_type');
  const rDate = parseAttr(raw, 'readable_date');

  let body = '';
  // Only scan for text parts — skip base64 image data
  let pi = 0;
  while ((pi = raw.indexOf('<part', pi)) !== -1) {
    const pEnd = raw.indexOf('/>', pi);
    if (pEnd === -1) break;
    const part = raw.slice(pi, pEnd + 2);
    const ct   = parseAttr(part, 'ct');
    if (ct === 'text/plain') {
      const text = parseAttr(part, 'text');
      if (text && text !== 'null') body = body ? body + '\n' + text : text;
    }
    pi = pEnd + 2;
    if (pi > MAX_MMS_RAW) break; // don't scan entire base64 blob
  }

  addMessage(addr, name || addr, {
    t: mType === '128' ? 's' : 'r',
    b: body,
    d: date,
    rd: rDate,
    k: 1,  // 1=mms
  });
}

// ── Streaming parser ─────────────────────────────────────────────────────
const MAX_BUF = 20 * 1024 * 1024; // 20 MB max buffer before we force-skip

function startParse() {
  const stream = fs.createReadStream(absPath, { highWaterMark: 2 * 1024 * 1024 });
  let buf = '';
  let bytesRead = 0;
  let skipped = 0;

  stream.on('data', chunk => {
    stream.pause();
    buf += chunk.toString('utf8');
    bytesRead += chunk.length;
    parseProgress = Math.min(99, Math.round((bytesRead / fileSize) * 100));

    let pos = 0;
    while (pos < buf.length) {
      const smsIdx = buf.indexOf('<sms ', pos);
      const mmsIdx = buf.indexOf('<mms ', pos);

      let idx, isMms;
      if (smsIdx === -1 && mmsIdx === -1) { pos = buf.length; break; }
      if (smsIdx === -1)        { idx = mmsIdx; isMms = true; }
      else if (mmsIdx === -1)   { idx = smsIdx; isMms = false; }
      else if (smsIdx < mmsIdx) { idx = smsIdx; isMms = false; }
      else                      { idx = mmsIdx; isMms = true; }

      if (!isMms) {
        const end = buf.indexOf('/>', idx);
        if (end === -1) { pos = idx; break; }
        processSms(buf.slice(idx, end + 2));
        pos = end + 2;
      } else {
        const end = buf.indexOf('</mms>', idx);
        if (end === -1) {
          // Element not complete yet — check if buffer is getting too large
          if (buf.length - idx > MAX_BUF) {
            // Huge MMS (likely base64 image data). Parse what we have and skip.
            processMms(buf.slice(idx, idx + MAX_BUF));
            skipped++;
            // Scan forward past this element
            const skip = buf.indexOf('</mms>', idx + MAX_BUF);
            if (skip !== -1) { pos = skip + 6; }
            else { pos = buf.length; } // not found, drop buffer and keep reading
          } else {
            pos = idx; // wait for more data
          }
          break;
        }
        processMms(buf.slice(idx, end + 6));
        pos = end + 6;
      }
    }

    buf = buf.slice(pos);

    if (skipped > 0 && skipped % 10 === 0)
      console.log(`  (skipped ${skipped} oversized MMS image elements)`);

    setImmediate(() => stream.resume());
  });

  stream.on('end', () => {
    Object.values(threads).forEach(t => {
      t.messages.sort((a, b) => a.d - b.d);
      t.lastDate = t.messages.at(-1)?.d || 0;
      t.lastBody = t.messages.at(-1)?.b || '';
      t.count = t.messages.length;
    });
    parseProgress = 100;
    parseDone = true;
    console.log(`Done. ${Object.keys(threads).length} contacts, ${totalMessages.toLocaleString()} messages. Skipped ${skipped} oversized MMS.`);
  });

  stream.on('error', err => {
    parseError = err.message;
    console.error('Parse error:', err.message);
  });
}

// ── HTTP server ──────────────────────────────────────────────────────────
const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

// Expand compact message keys back to full names for the browser
function expandMsg(m) {
  return {
    type: m.t === 's' ? 'sent' : 'received',
    body: m.b || '',
    date: m.d,
    readableDate: m.rd || '',
    kind: m.k === 0 ? 'sms' : 'mms',
  };
}

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(indexHtml);
  }

  if (req.url === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      progress: parseProgress, done: parseDone,
      error: parseError, contacts: Object.keys(threads).length, messages: totalMessages,
    }));
  }

  if (req.url === '/contacts') {
    const list = Object.values(threads)
      .sort((a, b) => b.lastDate - a.lastDate)
      .map(t => ({
        address: t.address, name: t.name, count: t.count,
        lastDate: t.lastDate, lastBody: (t.lastBody || '').slice(0, 80),
      }));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(list));
  }

  if (req.url.startsWith('/thread/')) {
    const addr = decodeURIComponent(req.url.slice(8));
    const thread = threads[addr];
    if (!thread) { res.writeHead(404); return res.end('Not found'); }
    const payload = { ...thread, messages: thread.messages.map(expandMsg) };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(payload));
  }

  res.writeHead(404); res.end('Not found');
}).listen(PORT, '127.0.0.1', () => {
  console.log(`SMS Viewer running at http://localhost:${PORT}`);
  console.log(`Parsing: ${absPath}`);
  const open = { win32: 'start', darwin: 'open', linux: 'xdg-open' }[process.platform];
  if (open) require('child_process').exec(`${open} http://localhost:${PORT}`);
});

startParse();
