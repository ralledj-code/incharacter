// Film strip: consecutive frames of a moment, in one image, to judge motion (direction, stride, continuity) by eye.
// usage: [LEVEL=<id>] node tools/strip.cjs <out.png> <t0> <seconds> [frames=12] [--debug]
//   --debug draws per-actor arrows: green = facing, red = velocity (they must agree when walking)
// also: node tools/strip.cjs <out.mp4-frames-dir> ... is not needed; for video use tools/video.cjs
const { chromium } = require('playwright-core');
const sharp = require('sharp');
const args = process.argv.slice(2).filter((a) => !a.startsWith('--')), debug = process.argv.includes('--debug');
const [out, t0s, durs, ns = '12'] = args, t0 = +t0s, dur = +durs, n = +ns;
(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 640, height: 360 } });
  await p.goto('http://localhost:5173/'); await p.waitForFunction(() => window.__alaron, null, { timeout: 60000 });
  await p.click('#go');
  await p.evaluate(async ({ level, debug }) => {
    const C = __cw, THREE = C.THREE, A = __alaron, W = A.W;
    const st = C.stories.find((s) => s.id === (level || [...C.stories].reverse().find((x) => !x.locked).id));
    await C.loadPacks(st.packs || []); W.loadStory(st); W.beginRide({ x: 0, y: 1.28, z: -3.18, yaw: 0, pitch: -0.3 });
    ['hud', 'top', 'coach'].forEach((id) => { const e = document.getElementById(id); if (e) e.style.display = 'none'; });
    window.__dbg = [];
    if (debug) C.act.X.actors.forEach((a) => {
      const f = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(), 1.2, 0x30ff60), v = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(), 1, 0xff3030);
      W.scene.add(f); W.scene.add(v); window.__dbg.push({ a, f, v });
    });
  }, { level: process.env.LEVEL || '', debug });
  const frames = [];
  for (let i = 0; i < n; i++) {
    const t = t0 + dur * i / Math.max(1, n - 1);
    await p.evaluate((t) => {
      const C = __cw, THREE = C.THREE, A = __alaron, W = A.W;
      const st = { mode: 'ride', t, dt: 1 / 30, time: t, player: { x: 0, z: 0, yaw: 0, pitch: 0 }, look: { yaw: 0, pitch: 0 } };
      W.update(st);
      window.__dbg.forEach(({ a, f, v }) => {
        const vis = (() => { let q = a.obj; while (q) { if (!q.visible) return false; q = q.parent; } return true; })();
        f.visible = v.visible = vis; if (!vis) return;
        const p = a.obj.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 0.15, 0)), s = C.act.state(a, t);
        f.position.copy(p); f.setDirection(new THREE.Vector3(Math.sin(s.heading), 0, Math.cos(s.heading)));
        const p0 = C.act.samplePos(a, t - 0.05, new THREE.Vector3()), p1 = C.act.samplePos(a, t + 0.05, new THREE.Vector3()), d = p1.sub(p0);
        v.position.copy(p); v.visible = d.length() > 0.02; if (v.visible) { v.setLength(Math.min(3, d.length() * 10 * 0.6) + 0.2); v.setDirection(d.setY(0).normalize()); }
      });
      A.dev.hold = st; A.dev.shot(st);
    }, t);
    frames.push({ t, buf: await p.screenshot() });
  }
  await b.close();
  const W = 640, H = 360, cols = Math.min(n, 6), rows = Math.ceil(n / cols);
  const tiles = await Promise.all(frames.map(async (f, i) => ({
    input: await sharp(f.buf).composite([{ input: Buffer.from(`<svg width="${W}" height="${H}"><rect width="78" height="24" fill="black" opacity="0.6"/><text x="6" y="17" font-size="16" fill="white" font-family="sans-serif">${f.t.toFixed(2)}</text></svg>`), top: 0, left: 0 }]).toBuffer(),
    left: (i % cols) * W, top: Math.floor(i / cols) * H
  })));
  await sharp({ create: { width: W * cols, height: H * rows, channels: 3, background: '#000' } }).composite(tiles).png().toFile(out);
  console.log(out, n, 'frames', t0, '→', t0 + dur);
})();
