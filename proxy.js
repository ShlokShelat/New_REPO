/**
 * proxy.js — Local xAI API Proxy for Harmonia
 * Fixed version: better error handling, logging, and CORS
 */
const http  = require('http');
const https = require('https');

// ── YOUR XAI API KEY ──────────────────────────────────
const XAI_API_KEY = 'xai-Qe70VqSGQl6hir1VMvh4ZHWJMX8hqBs5Iv4xQvO7Bp4NtuccFTlyDqNs2ejEKOUGByOX9tsi1qbB7GAC';
// ─────────────────────────────────────────────────────

const PORT      = 3579;
const XAI_HOST  = 'api.x.ai';
const XAI_PATH  = '/v1/chat/completions';
const XAI_MODEL = 'grok-3-latest';

const server = http.createServer((req, res) => {
  // CORS headers — allow any local origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Health check endpoint
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', model: XAI_MODEL }));
    return;
  }

  // Only handle POST /chat
  if (req.method !== 'POST' || req.url !== '/chat') {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found. POST to /chat' }));
    return;
  }

  // Read body
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch(e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid JSON body: ' + e.message }));
      return;
    }

    // Validate required fields
    if (!parsed.messages || !Array.isArray(parsed.messages)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing or invalid "messages" array' }));
      return;
    }

    // Build payload for xAI
    const payload = JSON.stringify({
      model:       parsed.model || XAI_MODEL,
      messages:    parsed.messages,
      max_tokens:  parsed.max_tokens  || 1000,
      temperature: parsed.temperature !== undefined ? parsed.temperature : 0.85,
      stream:      false,
    });

    console.log(`[${new Date().toISOString()}] → xAI | model=${parsed.model || XAI_MODEL} | msgs=${parsed.messages.length} | max_tokens=${parsed.max_tokens || 1000}`);

    const options = {
      hostname: XAI_HOST,
      port:     443,
      path:     XAI_PATH,
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Authorization':  'Bearer ' + XAI_API_KEY,
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const xaiReq = https.request(options, xaiRes => {
      let data = '';
      xaiRes.on('data', chunk => { data += chunk; });
      xaiRes.on('end', () => {
        console.log(`[${new Date().toISOString()}] ← xAI | status=${xaiRes.statusCode} | bytes=${data.length}`);

        // Always forward the real status code so the client can detect errors
        res.writeHead(xaiRes.statusCode, { 'Content-Type': 'application/json' });

        // If xAI returned an error, log it
        if (xaiRes.statusCode !== 200) {
          console.error(`[ERROR] xAI returned ${xaiRes.statusCode}: ${data.slice(0, 300)}`);
        }

        res.end(data);
      });
    });

    xaiReq.on('error', err => {
      console.error(`[${new Date().toISOString()}] [PROXY ERROR] ${err.message}`);
      // Only write headers if not already sent
      if (!res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'application/json' });
      }
      res.end(JSON.stringify({ error: 'Proxy connection error: ' + err.message }));
    });

    xaiReq.setTimeout(30000, () => {
      console.error('[TIMEOUT] xAI request timed out after 30s');
      xaiReq.destroy();
      if (!res.headersSent) {
        res.writeHead(504, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Request to xAI timed out after 30 seconds' }));
      }
    });

    xaiReq.write(payload);
    xaiReq.end();
  });

  req.on('error', err => {
    console.error('[REQUEST ERROR]', err.message);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('\n🎵 Harmonia xAI Proxy running');
  console.log('──────────────────────────────');
  console.log('  URL:    http://localhost:' + PORT);
  console.log('  Health: http://localhost:' + PORT + '/health');
  console.log('  Model:  ' + XAI_MODEL);
  if (!XAI_API_KEY || XAI_API_KEY === 'YOUR_XAI_API_KEY_HERE') {
    console.log('\n  ⚠️  WARNING: API key not set!');
    console.log('  Open proxy.js and set XAI_API_KEY');
  } else {
    console.log('  Key:    ' + XAI_API_KEY.slice(0, 8) + '...' + XAI_API_KEY.slice(-4));
    console.log('\n  ✅ Ready. Open style-transfer.html or lyric-assistant.html');
  }
  console.log('──────────────────────────────\n');
});

server.on('error', err => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use.`);
    console.error('   Kill the existing process: lsof -ti:' + PORT + ' | xargs kill');
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});
