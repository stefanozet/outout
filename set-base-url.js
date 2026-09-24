/**
 * Aggiorna le URL nel manifest.xml con la tua base URL.
 * Uso: node set-base-url.js https://tuonome.github.io/outout
 */
const fs = require('fs');
const path = require('path');

const newBase = process.argv[2];

if (!newBase) {
  console.error('Uso: node set-base-url.js <BASE_URL>');
  console.error('Es.: node set-base-url.js https://tuonome.github.io/outout');
  process.exit(1);
}

const base = newBase.replace(/\/$/, ''); // rimuove slash finale
const manifestPath = path.join(__dirname, 'manifest.xml');

let content = fs.readFileSync(manifestPath, 'utf8');
content = content.replace(/https:\/\/localhost:3000/g, base);
fs.writeFileSync(manifestPath, content, 'utf8');

console.log(`✓ manifest.xml aggiornato con: ${base}`);
console.log('  Ora fai git add manifest.xml && git commit && git push');
