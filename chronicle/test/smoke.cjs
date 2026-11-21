// Node smoke test: loads every module the page uses and checks each playable level's data and art.
// Does NOT check GLSL, rendering or the UI (play it headless for that).
const fs = require('fs');
const path = require('path');
global.THREE = require(require.resolve('three').replace(/build.*$/, ''));
globalThis.location = { search: '', pathname: '/chronicle/', href: 'http://localhost/chronicle/', origin: 'http://localhost' };
const levels = fs.readdirSync(__dirname + '/../src/levels').filter((f) => /^[^_].*\.js$/.test(f)).sort().map((f) => 'levels/' + f);
['w1_core.js', 'w1b_base.js', 'w5_painted.js'].concat(levels).forEach((f) => require('../src/' + f));
global.__cw.boards = {};
fs.readdirSync(__dirname + '/../painted').filter((f) => /^\d\d-.*\.json$/.test(f)).forEach((f) => { global.__cw.boards[f.slice(0, -5)] = JSON.parse(fs.readFileSync(__dirname + '/../painted/' + f, 'utf8')); });
require('../src/s0_stories.js');
const C = global.__cw, pub = path.join(__dirname, '../../public/chronicle');
let bad = 0;
const fail = (s, m) => { bad++; console.error('FAIL', s.id + ':', m); };
const playable = C.stories.filter((s) => !s.locked);
console.log('songs', C.stories.length, 'playable', playable.map((s) => s.level + ':' + s.id).join(' '));
playable.forEach((s) => {
  const lines = s.cues.reduce((k, c) => k + (c.lines || []).length, 0);
  if (s.lineTimes && s.lineTimes.length !== lines) fail(s, 'lineTimes has ' + s.lineTimes.length + ' entries for ' + lines + ' lyric lines');
  if (s.voices && s.voices.length !== lines) fail(s, 'voices has ' + s.voices.length + ' entries for ' + lines + ' lines');
  if (!fs.existsSync(path.join(pub, s.audio))) fail(s, 'missing audio ' + s.audio);
  if (!(s.duration > 0) || !(s.silenceT > 0)) fail(s, 'duration/silenceT missing');
  const shots = s.painted.shots, ids = new Set(shots.map((x) => x.id));
  shots.forEach((x, i) => {
    if (i && x.t <= shots[i - 1].t) fail(s, 'shot ' + x.id + ' is not after ' + shots[i - 1].id);
    if (x.img && !ids.has(x.img)) fail(s, 'shot ' + x.id + ' reuses unknown ' + x.img);
    if (!x.img && !fs.existsSync(path.join(pub, s.paintBase, x.id + '.webp'))) fail(s, 'missing painting ' + s.paintBase + x.id + '.webp');
    if (x.clip && !fs.existsSync(path.join(pub, s.paintBase, x.id + '.mp4'))) fail(s, 'missing clip ' + s.paintBase + x.id + '.mp4');
  });
  console.log('ok', s.id, shots.length, 'shots', lines, 'lines');
});
if (bad) { console.error(bad, 'problems'); process.exit(1); }
