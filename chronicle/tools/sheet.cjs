// contact sheet: node sheet.cjs <dir> <out.png> [cols]  (uses sharp from chronicle/node_modules)
const sharp = require('sharp');
const fs = require('fs');
const [dir, out, cols = 4] = process.argv.slice(2);
(async () => {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.png')).sort((a, b) => parseFloat(a) - parseFloat(b));
  const W = 480, H = 270, c = +cols, rows = Math.ceil(files.length / c);
  const tiles = await Promise.all(files.map(async (f, i) => ({ input: await sharp(dir + '/' + f).resize(W, H).composite([{ input: Buffer.from(`<svg width="${W}" height="${H}"><rect x="0" y="0" width="70" height="26" fill="black" opacity="0.6"/><text x="6" y="19" font-size="18" fill="white" font-family="sans-serif">${f.replace('.png', '')}</text></svg>`), top: 0, left: 0 }]).toBuffer(), left: (i % c) * W, top: Math.floor(i / c) * H })));
  await sharp({ create: { width: W * c, height: H * rows, channels: 3, background: '#000' } }).composite(tiles).png().toFile(out);
  console.log(out, files.length);
})();
