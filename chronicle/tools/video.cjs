// Render a stretch of a level to mp4 with the song (for Rasmus to review motion). Static server on :5173.
// usage: [LEVEL=<id>] [PY=<python with av>] node tools/video.cjs <out.mp4> <t0> <t1> [fps=24] [w=960] [h=540]
const fs = require('fs'), path = require('path'), os = require('os'), { execFileSync } = require('child_process');
const { chromium } = require('playwright-core');
const [out, t0s, t1s, fpss = '24', ws = '960', hs = '540'] = process.argv.slice(2), t0 = +t0s, t1 = +t1s, fps = +fpss;
(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'chron-'));
  const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: +ws, height: +hs } });
  await p.goto('http://localhost:5173/'); await p.waitForFunction(() => window.__alaron, null, { timeout: 60000 });
  await p.click('#go');
  const audio = await p.evaluate(async (level) => {
    const C = __cw, A = __alaron, W = A.W;
    const st = C.stories.find((s) => s.id === (level || [...C.stories].reverse().find((x) => !x.locked).id));
    await C.loadPacks(st.packs || []); W.loadStory(st); W.beginRide({ x: 0, y: 1.28, z: -3.18, yaw: 0, pitch: -0.3 });
    ['hud', 'top', 'coach'].forEach((id) => { const e = document.getElementById(id); if (e) e.style.display = 'none'; });
    return st.audio;
  }, process.env.LEVEL || '');
  const n = Math.round((t1 - t0) * fps);
  for (let i = 0; i < n; i++) {
    const t = t0 + i / fps;
    await p.evaluate((t) => { const A = __alaron, st = { mode: 'ride', t, dt: 1 / 30, time: t, player: { x: 0, z: 0, yaw: 0, pitch: 0 }, look: { yaw: 0, pitch: 0 } }; A.W.update(st); A.dev.hold = st; A.dev.shot(st); }, t);
    await p.screenshot({ path: path.join(dir, String(i).padStart(6, '0') + '.png') });
    if (i % (fps * 5) === 0) process.stdout.write(`\r${(t - t0).toFixed(0)}/${(t1 - t0).toFixed(0)} s`);
  }
  await b.close();
  const py = process.env.PY || 'python';
  execFileSync(py, [path.join(__dirname, 'encode.py'), dir, String(fps), out, path.join(__dirname, '../../public/chronicle', audio), String(t0)], { stdio: 'inherit' });
  fs.rmSync(dir, { recursive: true, force: true });
})();
