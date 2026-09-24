/**
 * Genera icone PNG minimal per lo sviluppo locale.
 * Usa solo moduli built-in di Node.js (zlib, fs, path).
 * Colore: blu Microsoft #0078D4
 */
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

function crc32(buf) {
  const table = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
  });
  let crc = 0xffffffff;
  for (const byte of buf) crc = (crc >>> 8) ^ table[(crc ^ byte) & 0xff];
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crcBuf]);
}

function makePNG(size, r, g, b) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 2;  // RGB
  // bytes 10,11,12 = 0 (deflate, no filter, no interlace)
  const ihdr = chunk('IHDR', ihdrData);

  const rowLen = 1 + size * 3; // filter byte + RGB per pixel
  const raw = Buffer.alloc(size * rowLen, 0);
  for (let y = 0; y < size; y++) {
    const row = y * rowLen;
    raw[row] = 0; // filter: None
    for (let x = 0; x < size; x++) {
      raw[row + 1 + x * 3] = r;
      raw[row + 1 + x * 3 + 1] = g;
      raw[row + 1 + x * 3 + 2] = b;
    }
  }
  const idat = chunk('IDAT', zlib.deflateSync(raw));
  const iend = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdr, idat, iend]);
}

const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir);

// Blu Microsoft: R=0, G=120, B=212
const [R, G, B] = [0, 120, 212];

for (const size of [16, 32, 64, 80, 128]) {
  const file = path.join(assetsDir, `icon-${size}.png`);
  fs.writeFileSync(file, makePNG(size, R, G, B));
  console.log(`✓ assets/icon-${size}.png`);
}

console.log('\nIcone generate con successo!');
