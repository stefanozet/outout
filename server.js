/**
 * Server HTTPS locale per sviluppo add-in Outlook.
 * Usa certificati auto-firmati già installati come trusted da office-addin-dev-certs.
 */
const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PORT = 3000;
const ROOT = __dirname;

// Tipi MIME
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.png':  'image/png',
  '.svg':  'image/svg+xml',
  '.xml':  'application/xml',
  '.json': 'application/json',
};

function getCerts() {
  const certsDir = path.join(
    process.env.USERPROFILE || process.env.HOME || '',
    '.office-addin-dev-certs'
  );
  const keyPath  = path.join(certsDir, 'localhost.key');
  const certPath = path.join(certsDir, 'localhost.crt');
  const caPath   = path.join(certsDir, 'ca.crt');

  if (!fs.existsSync(keyPath)) {
    console.error('❌ Certificati non trovati. Esegui prima: npm run setup');
    process.exit(1);
  }
  return {
    key:  fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
    ca:   fs.readFileSync(caPath),
  };
}

const server = https.createServer(getCerts(), (req, res) => {
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/src/taskpane.html';

  const filePath = path.join(ROOT, urlPath);

  // Sicurezza: impedisce path traversal fuori dalla directory root
  if (!filePath.startsWith(ROOT + path.sep) && filePath !== ROOT) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end(`Not found: ${urlPath}`);
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const mimeType = MIME[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': mimeType,
      'Cache-Control': 'no-cache',
      // Header necessari per Outlook add-in
      'Access-Control-Allow-Origin': '*',
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\n✅ Server avviato: https://localhost:${PORT}`);
  console.log(`   Task pane:  https://localhost:${PORT}/src/taskpane.html`);
  console.log(`   Manifest:   https://localhost:${PORT}/manifest.xml\n`);
  console.log('Premi Ctrl+C per fermare il server.');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Porta ${PORT} già in uso. Chiudi l'altro processo e riprova.`);
  } else {
    console.error('❌ Errore server:', err.message);
  }
  process.exit(1);
});
