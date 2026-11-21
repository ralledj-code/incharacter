// Concatenates src/*.js into ../public/chronicle/index.html (template + painted player + levels + ui).
// InCharacter serves it at /chronicle; level songs live in public/chronicle/levels/.
import fs from 'node:fs';
const out = '../public/chronicle';
// level modules (src/levels/*.js, not starting with _) go after the engine and before the registry
const levels = fs.readdirSync('src/levels').filter((f) => /^[^_].*\.js$/.test(f)).sort().map((f) => 'levels/' + f.slice(0, -3));
const order = ['w1_core', 'w1b_base', 'w5_painted', ...levels, 's0_stories'];
// painted storyboards (painted/<NN-id>.json) go in as C.boards before the registry picks them up
const boards = fs.existsSync('painted') ? fs.readdirSync('painted').filter((f) => /^\d\d-.*\.json$/.test(f)).sort() : [];
const boardJs = boards.map((f) => `__cw.boards[${JSON.stringify(f.slice(0, -5))}] = ${JSON.stringify(JSON.parse(fs.readFileSync('painted/' + f, 'utf8')))};`).join('\n');
const world = order.map((f) => (f === 's0_stories' ? boardJs + '\n' : '') + fs.readFileSync(`src/${f}.js`, 'utf8')).join('\n');
let t = fs.readFileSync('src/template.html', 'utf8').replace('/*__WORLD__*/', () => world).replace('/*__UI__*/', () => fs.readFileSync('src/ui.js', 'utf8'));
t = '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n' + t + '\n</html>';
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(`${out}/index.html`, t);
console.log(`built ${out}/index.html`, (t.length / 1024).toFixed(0) + ' KB', levels.length ? '+ ' + levels.join(', ') : '', boards.length ? '+ painted ' + boards.join(', ') : '');
