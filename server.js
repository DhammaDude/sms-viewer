#!/usr/bin/env node
// Streams a large Android SMS XML file, writing messages to a temp file on disk.
// Only contact metadata (offsets, counts) lives in RAM — thread messages are
// read from disk on demand. Handles arbitrarily large files.

const http = require('http');
const fs   = require('fs');
const path = require('path');
const os   = require('os');

const PORT    = 7700;
const TMP     = path.join(os.tmpdir(), 'sms-viewer-data.jsonl');

// ── Argument ─────────────────────────────────────────────────────────────
const xmlPath = process.argv[2];
if (!xmlPath) { console.error('Usage: node server.js <sms-backup.xml>'); process.exit(1); }
const absPath = path.resolve(xmlPath);
if (!fs.existsSync(absPath)) { console.error('File not found:', absPath); process.exit(1); }
const fileSize = fs.statSync(absPath).size;

// ── Disk-backed message store ─────────────────────────────────────────────
// threads[addr] = { name, address, count, lastDate, lastBody, segs: [{o,l,d}] }
// Each seg is one message: byte offset (o), byte length (l), timestamp (d).
const threads = {};
let totalMessages = 0;
let parseProgress = 0;
let parseDone     = false;
let parseError    = null;

const tmpFd = fs.openSync(TMP, 'w');
let writeOffset = 0;

function storeMessage(addr, name, msg) {
  if (!threads[addr]) threads[addr] = { name: name || addr, address: addr, count: 0, lastDate: 0, lastBody: '', segs: [] };
  if (name && name !== addr) threads[addr].name = name;

  const line = JSON.stringify(msg) + '\n';
  const buf  = Buffer.from(line, 'utf8');
  fs.writeSync(tmpFd, buf, 0, buf.length, writeOffset);

  const t = threads[addr];
  t.segs.push({ o: writeOffset, l: buf.length, d: msg.d });
  writeOffset += buf.length;
  t.count++;
  if (msg.d > t.lastDate) { t.lastDate = msg.d; t.lastBody = (msg.b || '').slice(0, 80); }
  totalMessages++;
}

// ── Attribute parser ─────────────────────────────────────────────────────
function attr(str, key, from) {
  let i = str.indexOf(key + '=', from || 0);
  if (i === -1) return '';
  i += key.length + 1;
  const q = str[i];
  if (q !== '"' && q !== "'") return '';
  const end = str.indexOf(q, i + 1);
  return end === -1 ? '' : str.slice(i + 1, end);
}

function cleanName(n) { return (!n || n === 'null' || n === '(Unknown)') ? '' : n.trim(); }
function normAddr(a) {
  if (!a || a === 'null') return 'Unknown';
  const c = a.replace(/\s+/g, '');
  return c.replace(/^(\+?1)?(\d{10})$/, (_, _p, n) => '+1' + n) || c;
}

function processSms(raw) {
  const address = normAddr(attr(raw, 'address'));
  const name    = cleanName(attr(raw, 'contact_name')) || address;
  storeMessage(address, name, {
    t:  attr(raw, 'type') === '2' ? 's' : 'r',
    b:  attr(raw, 'body'),
    d:  parseInt(attr(raw, 'date') || '0', 10),
    rd: attr(raw, 'readable_date'),
    k:  0,
  });
}

const MMS_SCAN_LIMIT = 256 * 1024; // only scan first 256KB of MMS for text parts
function processMms(raw) {
  const address = normAddr(attr(raw, 'address'));
  const name    = cleanName(attr(raw, 'contact_name')) || address;
  let body = '';
  let pi = 0;
  const limit = Math.min(raw.length, MMS_SCAN_LIMIT);
  while (pi < limit && (pi = raw.indexOf('<part', pi)) !== -1 && pi < limit) {
    const pe = raw.indexOf('/>', pi);
    if (pe === -1 || pe > limit) break;
    const part = raw.slice(pi, pe + 2);
    if (attr(part, 'ct') === 'text/plain') {
      const t = attr(part, 'text');
      if (t && t !== 'null') body = body ? body + '\n' + t : t;
    }
    pi = pe + 2;
  }
  storeMessage(address, name, {
    t:  attr(raw, 'm_type') === '128' ? 's' : 'r',
    b:  body,
    d:  parseInt(attr(raw, 'date') || '0', 10),
    rd: attr(raw, 'readable_date'),
    k:  1,
  });
}

// ── Streaming parser ──────────────────────────────────────────────────────
const MAX_BUF = 16 * 1024 * 1024; // 16MB — if buffer grows past this, skip element

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
      const si = buf.indexOf('<sms ', pos);
      const mi = buf.indexOf('<mms ', pos);

      let idx, isMms;
      if (si === -1 && mi === -1) { pos = buf.length; break; }
      if      (si === -1)  { idx = mi; isMms = true;  }
      else if (mi === -1)  { idx = si; isMms = false; }
      else if (si < mi)    { idx = si; isMms = false; }
      else                 { idx = mi; isMms = true;  }

      if (!isMms) {
        const end = buf.indexOf('/>', idx);
        if (end === -1) { pos = idx; break; }
        processSms(buf.slice(idx, end + 2));
        pos = end + 2;
      } else {
        const end = buf.indexOf('</mms>', idx);
        if (end === -1) {
          if (buf.length - idx > MAX_BUF) {
            // Huge element — grab what text we can then skip
            processMms(buf.slice(idx, idx + MMS_SCAN_LIMIT));
            skipped++;
            const skip = buf.indexOf('</mms>', idx + 1);
            pos = skip !== -1 ? skip + 6 : buf.length;
          } else {
            pos = idx; break; // wait for more data
          }
          break;
        }
        processMms(buf.slice(idx, end + 6));
        pos = end + 6;
      }
    }

    buf = buf.slice(pos);
    setImmediate(() => stream.resume());
  });

  stream.on('end', () => {
    fs.closeSync(tmpFd);
    // Sort each thread's segments by date
    Object.values(threads).forEach(t => t.segs.sort((a, b) => a.d - b.d));
    parseProgress = 100;
    parseDone = true;
    console.log(`\nDone. ${Object.keys(threads).length} contacts, ${totalMessages.toLocaleString()} messages.`);
    if (skipped) console.log(`Skipped ${skipped} oversized MMS (image-only).`);
  });

  stream.on('error', err => { parseError = err.message; });

  // Progress ticker
  const ticker = setInterval(() => {
    if (parseDone || parseError) { clearInterval(ticker); return; }
    process.stdout.write(`\r  ${parseProgress}% — ${totalMessages.toLocaleString()} messages, ${Object.keys(threads).length} contacts...`);
  }, 1000);
}

// ── On-demand thread reader ───────────────────────────────────────────────
function readThread(addr) {
  const t = threads[addr];
  if (!t) return null;
  const fd = fs.openSync(TMP, 'r');
  const messages = t.segs.map(({ o, l }) => {
    const buf = Buffer.alloc(l);
    fs.readSync(fd, buf, 0, l, o);
    const m = JSON.parse(buf.toString('utf8'));
    return { type: m.t === 's' ? 'sent' : 'received', body: m.b || '', date: m.d, readableDate: m.rd || '', kind: m.k === 0 ? 'sms' : 'mms' };
  });
  fs.closeSync(fd);
  return { address: t.address, name: t.name, messages };
}

// ── HTTP server ───────────────────────────────────────────────────────────
const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(indexHtml);
  }

  if (req.url === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ progress: parseProgress, done: parseDone, error: parseError, contacts: Object.keys(threads).length, messages: totalMessages }));
  }

  if (req.url === '/contacts') {
    const list = Object.values(threads)
      .sort((a, b) => b.lastDate - a.lastDate)
      .map(({ address, name, count, lastDate, lastBody }) => ({ address, name, count, lastDate, lastBody }));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(list));
  }

  if (req.url.startsWith('/thread/')) {
    const addr   = decodeURIComponent(req.url.slice(8));
    const thread = readThread(addr);
    if (!thread) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(thread));
  }

  res.writeHead(404); res.end('Not found');
}).listen(PORT, '127.0.0.1', () => {
  console.log(`SMS Viewer  →  http://localhost:${PORT}`);
  console.log(`Parsing: ${absPath}\n`);
  const open = { win32: 'start', darwin: 'open', linux: 'xdg-open' }[process.platform];
  if (open) require('child_process').exec(`${open} http://localhost:${PORT}`);
});

startParse();
