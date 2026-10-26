// Node smoke test: loads every module with a stubbed canvas and steps every playable level through its song.
// Does NOT check GLSL or rendering.
const fs = require('fs');
const path = require.resolve('three').replace(/build.*$/, '');
const ctxStub = new Proxy({}, { get: (t, k) => k === 'measureText' ? () => ({ width: 10 }) : (k === 'createRadialGradient' || k === 'createLinearGradient') ? () => ({ addColorStop() {} }) : () => {}, set: () => true });
global.document = { createElement: () => ({ width: 0, height: 0, getContext: () => ctxStub }) };
global.THREE = require(path);
const levels = fs.readdirSync(__dirname + '/../src/levels').filter((f) => /^[^_].*\.js$/.test(f)).sort().map((f) => 'levels/' + f);
const files = 'w1_core w1b_assets w2b_director w2_engine w3_kit w3b_chars w3c_action w3d_story w4_bar w4_book w5_painted s1a_well s1b_dragon s1c_camp_cross s1d_city'.split(' ').map((f) => f + '.js').concat(levels, ['s0_stories.js']);
files.forEach((f) => require('../src/' + f));
const C = global.__cw;
const W = C.create({ mobile: false });
W.book.setStories(C.stories);
console.log('book pages', C.stories.length, 'playable', C.stories.filter((s) => !s.locked).map((s) => s.level + ':' + s.id).join(' '));
const player = { x: 0, z: 4.4, yaw: 0, pitch: 0 };
let n = 0;
function step(mode, t, extra) { W.update(Object.assign({ mode, t, dt: 0.016, time: t + n++ * 0.016, player, look: { yaw: 0, pitch: 0 } }, extra || {})); }
C.stories.filter((s) => !s.locked).forEach((s) => {
  W.loadStory(s);
  if (s.lineTimes) { const lines = s.cues.reduce((k, c) => k + (c.lines || []).length, 0); if (s.lineTimes.length !== lines) throw new Error(s.id + ': lineTimes has ' + s.lineTimes.length + ' entries for ' + lines + ' lyric lines'); }
  step('walk', -1); step('book', -1, { sit: 1 });
  W.beginRide({ x: 0, y: 1.28, z: -3.2, yaw: 0, pitch: -0.3 });
  for (let t = 0; t <= s.duration; t += 2.5) step('ride', t);
  step('ride', s.duration - 0.1);
  console.log('ok', s.id, 'Dend', W.info.Dend.toFixed(1), 'cam at end', W.camera.position.toArray().map((v) => v.toFixed(1)).join(','));
});
