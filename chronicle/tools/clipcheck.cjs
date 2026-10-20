// Camera clipping check: steps a level's song and reports every time the camera is inside / within `near` m of any visible mesh.
// usage: LEVEL=<id> node tools/clipcheck.cjs [step=0.5] [near=0.25]   (static server on :5173)
const { chromium } = require('playwright-core');
const [step = 0.5, near = 0.25] = process.argv.slice(2).map(Number);
(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 640, height: 360 } });
  p.on('pageerror', (e) => console.log('PAGEERR', e.message));
  await p.goto('http://localhost:5173/'); await p.waitForFunction(() => window.__alaron, null, { timeout: 60000 });
  await p.click('#go');
  const hits = await p.evaluate(async ({ step, near, level }) => {
    const C = __cw, THREE = C.THREE, A = __alaron, W = A.W;
    const st = C.stories.find((s) => s.id === (level || [...C.stories].reverse().find((x) => !x.locked).id));
    await C.loadPacks(st.packs || []); W.loadStory(st); W.beginRide({ x: 0, y: 1.28, z: -3.18, yaw: 0, pitch: -0.3 });
    const out = [], cam = W.camera.position, targets = [], rc = new THREE.Raycaster(), DIRS = [];
    for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) if (x || y || z) DIRS.push(new THREE.Vector3(x, y, z).normalize());
    const label = (o) => { const n = []; let q = o; while (q && n.length < 4) { if (q.name) n.push(q.name); q = q.parent; } return n.join('<') || o.type + (o.geometry && o.geometry.type ? ':' + o.geometry.type : ''); };
    const visible = (o) => { while (o) { if (!o.visible) return false; o = o.parent; } return true; };
    for (let t = 0; t < st.duration; t += step) {
      W.update({ mode: 'ride', t, dt: step, time: t, player: { x: 0, z: 0, yaw: 0, pitch: 0 }, look: { yaw: 0, pitch: 0 } });
      W.scene.updateMatrixWorld(true);
      const found = new Set();
      // short rays in 26 directions: a hit closer than `near` means geometry is touching the camera (triangles, not boxes)
      targets.length = 0;
      W.scene.traverse((o) => {
        if (!o.isMesh || !o.geometry || (o.material && o.material.depthWrite === false) || o.isSprite) return;
        const gp = o.geometry.parameters;
        if (gp && ((o.geometry.type === 'SphereGeometry' && gp.radius > 100) || (o.geometry.type === 'PlaneGeometry' && gp.width > 100))) return;
        if (visible(o)) targets.push(o);
      });
      rc.far = near;
      for (const d of DIRS) { rc.set(cam, d); const h = rc.intersectObjects(targets, false); if (h.length) found.add(label(h[0].object)); }
      if (found.size) out.push({ t: +t.toFixed(1), cam: [cam.x, cam.y, cam.z].map((v) => +v.toFixed(1)), what: [...found].slice(0, 4) });
    }
    return out;
  }, { step, near, level: process.env.LEVEL });
  // merge consecutive times with the same objects
  let prev = null;
  hits.forEach((h) => {
    const k = h.what.join(', ');
    if (prev && prev.k === k && h.t - prev.t1 <= step * 1.5) { prev.t1 = h.t; return; }
    if (prev) console.log(`${prev.t0}-${prev.t1}s  cam ${prev.cam}  ${prev.k}`);
    prev = { k, t0: h.t, t1: h.t, cam: h.cam.join(',') };
  });
  if (prev) console.log(`${prev.t0}-${prev.t1}s  cam ${prev.cam}  ${prev.k}`);
  console.log(hits.length ? `${hits.length} clipping samples` : 'no camera clipping');
  await b.close();
})();
