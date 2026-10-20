// usage: node shot.cjs <outdir> <spec> [w h]
// spec: comma list of  walk | book | <t>  (ride time in s), optionally @yaw:pitch, e.g. "book,0,30,177@1.2:0"
const { chromium } = require('playwright-core')  // devDependency of chronicle/;
const [out, spec, w = 1280, h = 720] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage({ viewport: { width: +w, height: +h } });
  const errs = []; p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.text()); }); p.on('pageerror', (e) => errs.push('PAGEERR ' + e.message));
  await p.goto('http://localhost:5173/'); await p.waitForFunction(() => window.__alaron, null, { timeout: 60000 });
  await p.click('#go'); await p.waitForTimeout(200);
  await p.evaluate(async (level) => { const A = __alaron, st = window.__cw.stories.find((s) => s.id === (level || [...__cw.stories].reverse().find((x) => !x.locked).id)); await __cw.loadPacks(st.packs); A.W.loadStory(st); A.W.beginRide({ x: 0, y: 1.28, z: -3.18, yaw: 0, pitch: -0.33 }); }, process.env.LEVEL || '');
  if (process.env.TM) await p.evaluate((tm) => { const [k, e] = tm.split(':'); const A = __alaron; A.renderer.toneMapping = THREE[k + 'ToneMapping']; A.renderer.toneMappingExposure = +e; A.W.scene.traverse((o) => { if (o.material) [].concat(o.material).forEach((m) => { m.needsUpdate = true; }); }); }, process.env.TM);
  for (const item of spec.split(',')) {
    const [k, lk = '0:0'] = item.split('@'); const [yaw, pitch] = lk.split(':').map(Number);
    await p.evaluate(({ k, yaw, pitch }) => {
      const A = __alaron, base = { dt: 0.016, time: 10, player: { x: 0, z: 3, yaw: 0, pitch: 0 }, look: { yaw, pitch }, sit: 1 };
      let st;
      if (k === 'walk') st = Object.assign(base, { mode: 'walk', t: -1, player: { x: 0, z: 4.4, yaw, pitch } });
      else if (k === 'book') st = Object.assign(base, { mode: 'book', t: -1 });
      else { const t = +k; st = Object.assign(base, { mode: 'ride', t, time: t }); for (let i = 0; i < 90; i++) A.W.update(Object.assign({}, st, { t: Math.max(0, t - (90 - i) * 0.016) })); }
      A.dev.hold = st; A.dev.shot(st);
    }, { k, yaw, pitch });
    await p.waitForTimeout(120);
    await p.screenshot({ path: `${out}/${item.replace(/[@:]/g, '_')}.png` });
  }
  if (errs.length) console.log(errs.slice(0, 20).join('\n'));
  await b.close();
})();
