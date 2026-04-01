/**
 * proxy.js — Local xAI API Proxy for Harmonia
 * 
 * This tiny Node.js server forwards requests from your browser to xAI's API,
 * bypassing CORS restrictions that block direct browser-to-xAI calls.
 *
 * SETUP:
 *   1. Make sure Node.js is installed (https://nodejs.org)
 *   2. Open terminal in the harmonia folder
 *   3. Run:  node proxy.js
 *   4. Proxy will start on http://localhost:3579
 *   5. Open style-transfer.html and lyric-assistant.html normally
 *
 * NO npm install needed — uses only Node.js built-ins.
 */

const http  = require('http');
const https = require('https');

// ── YOUR XAI API KEY ──────────────────────────────────
const XAI_API_KEY = 'YOUR_XAI_API_KEY_HERE'; // ← paste your key here
// ─────────────────────────────────────────────────────

const PORT       = 3579;
const XAI_HOST   = 'api.x.ai';
const XAI_PATH   = '/v1/chat/completions';
const XAI_MODEL  = 'grok-3-latest';

const server = http.createServer((req, res) => {
  // CORS headers — allow any local origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Only handle POST /chat
  if (req.method !== 'POST' || req.url !== '/chat') {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found. POST to /chat' }));
    return;
  }

  // Read body
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    let parsed;
    try { parsed = JSON.parse(body); }
    catch(e) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Invalid JSON body' }));
      return;
    }

    // Forward to xAI
    const payload = JSON.stringify({
      model:      parsed.model || XAI_MODEL,
      messages:   parsed.messages,
      max_tokens: parsed.max_tokens || 1000,
      temperature:parsed.temperature || 0.85,
      stream:     false,
    });

    const options = {
      hostname: XAI_HOST,
      port:     443,
      path:     XAI_PATH,
      method:   'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + XAI_API_KEY,
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const xaiReq = https.request(options, xaiRes => {
      let data = '';
      xaiRes.on('data', chunk => { data += chunk; });
      xaiRes.on('end', () => {
        res.writeHead(xaiRes.statusCode, { 'Content-Type': 'application/json' });
        res.end(data);
      });
    });

    xaiReq.on('error', err => {
      console.error('xAI request error:', err.message);
      res.writeHead(502);
      res.end(JSON.stringify({ error: 'Proxy error: ' + err.message }));
    });

    xaiReq.write(payload);
    xaiReq.end();
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('\n🎵 Harmonia xAI Proxy running');
  console.log('──────────────────────────────');
  console.log('  URL:   http://localhost:' + PORT);
  console.log('  Model: ' + XAI_MODEL);
  if (XAI_API_KEY === 'YOUR_XAI_API_KEY_HERE') {
    console.log('\n  ⚠️  WARNING: API key not set!');
    console.log('  Open proxy.js and replace YOUR_XAI_API_KEY_HERE');
  } else {
    console.log('  Key:   ' + XAI_API_KEY.slice(0,8) + '...' + XAI_API_KEY.slice(-4));
    console.log('\n  ✅ Ready. Open style-transfer.html or lyric-assistant.html');
  }
  console.log('──────────────────────────────\n');
});
