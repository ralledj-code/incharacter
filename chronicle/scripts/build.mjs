// Concatenates src/*.js into ../public/chronicle/index.html (template + world + ui).
// InCharacter serves it at /chronicle; level songs live in public/chronicle/levels/.
import fs from 'node:fs';
const out = '../public/chronicle';
// level modules (src/levels/*.js, not starting with _) go after the engine and before the registry
const levels = fs.readdirSync('src/levels').filter((f) => /^[^_].*\.js$/.test(f)).sort().map((f) => 'levels/' + f.slice(0, -3));
const order = ['w1_core', 'w1b_assets', 'w2b_director', 'w2_engine', 'w3_kit', 'w3b_chars', 'w3c_action', 'w4_bar', 'w4_book', 's1a_well', 's1b_dragon', 's1c_camp_cross', 's1d_city', ...levels, 's0_stories'];
const world = order.map((f) => fs.readFileSync(`src/${f}.js`, 'utf8')).join('\n');
let t = fs.readFileSync('src/template.html', 'utf8').replace('/*__WORLD__*/', () => world).replace('/*__UI__*/', () => fs.readFileSync('src/ui.js', 'utf8'));
t = '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n' + t + '\n</html>';
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(`${out}/index.html`, t);
console.log(`built ${out}/index.html`, (t.length / 1024).toFixed(0) + ' KB', levels.length ? '+ ' + levels.join(', ') : '');
