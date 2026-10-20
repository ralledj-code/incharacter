// Concatenates src/*.js into ../public/chronicle/index.html (template + world + ui).
// InCharacter serves it at /chronicle; song.mp3 lives next to it in public/chronicle/.
import fs from 'node:fs';
const out = '../public/chronicle';
const order = 'w1_core w2_engine w3_kit w3b_chars w4_bar w4_book s1a_well s1b_dragon s1c_camp_cross s1d_city s0_stories'.split(' ');
const world = order.map((f) => fs.readFileSync(`src/${f}.js`, 'utf8')).join('\n');
let t = fs.readFileSync('src/template.html', 'utf8').replace('/*__WORLD__*/', () => world).replace('/*__UI__*/', () => fs.readFileSync('src/ui.js', 'utf8'));
t = '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n' + t + '\n</html>';
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(`${out}/index.html`, t);
console.log(`built ${out}/index.html`, (t.length / 1024).toFixed(0) + ' KB');
