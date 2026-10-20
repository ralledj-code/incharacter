// Motion check: simulates a level's whole song headless and reports motion problems a screenshot can't show.
// usage: LEVEL=<id> node tools/motioncheck.cjs [--verbose]     (static server on :5173)
// Checks
//   actors (baked, w3c_action): moving backwards/sideways, turning too fast, feet in/above the ground, actors overlapping
//   everything else rigged that moves: "unmanaged mover" (its position is set by a formula, so its feet slide)
//   camera: sudden jolts inside a shot (acceleration spikes), very short shots
const { chromium } = require('playwright-core');
const verbose = process.argv.includes('--verbose');
(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 640, height: 360 } });
  p.on('pageerror', (e) => console.log('PAGEERR', e.message));
  await p.goto('http://localhost:5173/'); await p.waitForFunction(() => window.__alaron, null, { timeout: 60000 });
  await p.click('#go');
  const rep = await p.evaluate(async (level) => {
    const C = __cw, THREE = C.THREE, W = __alaron.W;
    const st = C.stories.find((s) => s.id === (level || [...C.stories].reverse().find((x) => !x.locked).id));
    await C.loadPacks(st.packs || []); W.loadStory(st); W.beginRide({ x: 0, y: 1.28, z: -3.18, yaw: 0, pitch: -0.3 });
    const X = C.act.X, issues = [], add = (kind, t, who, msg) => issues.push({ kind, t: +t.toFixed(1), who, msg });
    const name = (o) => { let q = o, n = ''; while (q && !n) { n = q.userData && q.userData.label || ''; q = q.parent; } return n || (o.userData.h ? 'rig' + Math.round(o.userData.h * 10) / 10 + 'm' : 'obj'); };
    // label actors by what they are (set by the char builders) or position
    X.actors.forEach((a, i) => { a.label = (a.obj.userData.label || 'actor') + '#' + i; });
    const HZ = C.act.HZ, dur = st.duration;
    // 1. actor tracks (30 Hz)
    X.actors.forEach((a) => {
      const T = a.track; let last = null;
      for (let i = 1; i < T.N - 1; i++) {
        const t = i / HZ, vx = (T.P[i * 3 + 3] - T.P[i * 3 - 3]) * HZ / 2, vz = (T.P[i * 3 + 5] - T.P[i * 3 - 1]) * HZ / 2, sp = Math.hypot(vx, vz);
        if (a.opts.fly) continue;
        if (sp > 0.8 && !C.act.state(a, t).exempt && !C.act.state(a, t).hidden) {  // below 0.8 m/s a move is just starting: the pivot
          let d = Math.atan2(vx, vz) - T.H[i]; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
          const k = Math.abs(d) > 2.0 ? 'backwards' : Math.abs(d) > 1.0 ? 'sideways' : null;
          if (k && k !== last) add(k, t, a.label, `moving ${sp.toFixed(1)} m/s, facing ${(Math.abs(d) * 57).toFixed(0)}° off`); last = k;
        } else last = null;
        let dh = T.H[i + 1] - T.H[i]; while (dh > Math.PI) dh -= 2 * Math.PI; while (dh < -Math.PI) dh += 2 * Math.PI;
        if (Math.abs(dh) * HZ > 12 && !C.act.state(a, t).hidden && !C.act.state(a, t + 0.1).hidden) add('snap-turn', t, a.label, `${(Math.abs(dh) * HZ).toFixed(1)} rad/s`);
        const gmax = a.gait[a.gait.length - 1][1] * 2.0;  // above this the gait clip can't keep up: feet slide
        if (!C.act.state(a, t).exempt && T.V[i] > gmax * 1.05) add('too-fast', t, a.label, `${T.V[i].toFixed(1)} m/s (gait max ${gmax.toFixed(1)})`);
      }
    });
    // 2. feet and overlaps (2 Hz): apply actors, raycast the ground under each
    const rc = new THREE.Raycaster(), down = new THREE.Vector3(0, -1, 0), statics = [];
    W.scene.traverse((o) => { if (o.isMesh && !o.isSkinnedMesh && o.geometry && !(o.material && o.material.depthWrite === false)) statics.push(o); });
    const v = new THREE.Vector3(), w = new THREE.Vector3();
    for (let t = 0; t < dur; t += 0.5) {
      W.update({ mode: 'ride', t, dt: 0.5, time: t, player: { x: 0, z: 0, yaw: 0, pitch: 0 }, look: { yaw: 0, pitch: 0 } });
      W.scene.updateMatrixWorld(true);
      const vis = X.actors.filter((a) => { let q = a.obj; while (q) { if (!q.visible) return false; q = q.parent; } return true; });
      vis.forEach((a) => {
        const bones = a.obj.userData.bones; if (!bones || a.opts.fly) return;
        if (a.opts.ignoreGround) return;
        const feet = ['ball_l', 'ball_r'].filter((n) => bones[n]);  // humans; creature feet are checked by eye in film strips
        if (!feet.length) return;
        let lo = 1e9; feet.forEach((n) => { lo = Math.min(lo, bones[n].getWorldPosition(v).y); });
        a.obj.getWorldPosition(w);
        rc.set(w.clone().setY(w.y + 3), down); rc.far = 30;
        const hit = rc.intersectObjects(statics, false).find((h) => h.object.visible && h.point.y < w.y + 0.6);  // ground = first surface below knee height
        const ground = hit ? hit.point.y : 0, st = C.act.state(a, t);
        if (/Sitting|Kneel|Crouch/.test(st.clip)) return;
        if (lo < ground - 0.15) add('feet-in-ground', t, a.label, `${(ground - lo).toFixed(2)} m below (${st.clip})`);
        const air = /Jog|Sprint/.test(st.clip) ? 0.5 : 0.25;  // runs have a flight phase
        if (lo > ground + air && !st.exempt) add('floating', t, a.label, `${(lo - ground).toFixed(2)} m above (${st.clip})`);
      });
      for (let i = 0; i < vis.length; i++) for (let j = i + 1; j < vis.length; j++) {
        const A = vis[i].obj.getWorldPosition(v), B = vis[j].obj.getWorldPosition(w);
        if (Math.hypot(A.x - B.x, A.z - B.z) < 0.45 && Math.abs(A.y - B.y) < 1) add('overlap', t, vis[i].label + '+' + vis[j].label, `${Math.hypot(A.x - B.x, A.z - B.z).toFixed(2)} m apart`);
      }
    }
    // 3. unmanaged movers + camera (10 Hz full simulation)
    const prev = new Map(); let pc = null, pv = null, shot = -1;
    const flagged = new Set();
    for (let t = 0; t < dur; t += 0.1) {
      W.update({ mode: 'ride', t, dt: 0.1, time: t, player: { x: 0, z: 0, yaw: 0, pitch: 0 }, look: { yaw: 0, pitch: 0 } });
      W.scene.updateMatrixWorld(true);
      [...X.anims].forEach((o) => {
        if (o.userData.managed || o.userData.flyer) return;
        let q = o, visible = true; while (q) { if (!q.visible) { visible = false; break; } q = q.parent; }
        const pos = o.getWorldPosition(new THREE.Vector3()), pp = prev.get(o); prev.set(o, visible ? pos : null);
        if (!visible || !pp) return;
        const sp = pos.distanceTo(pp) / 0.1;
        if (sp > 0.4 && sp < 80) { const key = o.uuid + Math.floor(t / 5); if (!flagged.has(key)) { flagged.add(key); add('unmanaged-mover', t, o.userData.label || name(o), `${sp.toFixed(1)} m/s with no gait control at ${pos.x.toFixed(0)},${pos.z.toFixed(0)}`); } }
      });
      const cam = W.camera.position.clone(), BK = W.director && W.director.baked;
      let cutHere = false;  // any baked cut since the previous sample (or a shot change if not baked)
      if (BK) { for (let n = Math.floor((t - 0.1) * BK.HZ); n <= Math.ceil(t * BK.HZ) + 1; n++) if (n >= 0 && BK.cut[n]) cutHere = true; }
      else { const si = W.director && W.director.active ? W.director.shotIndex(t) : 0; cutHere = si !== shot; shot = si; }
      if (cutHere) { pc = null; pv = null; }
      if (pc) { const vel = cam.clone().sub(pc).multiplyScalar(10); if (pv) { const acc = vel.clone().sub(pv).length() * 10; if (acc > 40) add('camera-jolt', t, 'camera', `${acc.toFixed(0)} m/s²`); } pv = vel; }
      pc = cam;
    }
    return issues;
  }, process.env.LEVEL || '');
  // summarise: group consecutive repeats
  const byKind = {};
  rep.forEach((r) => { (byKind[r.kind] = byKind[r.kind] || []).push(r); });
  Object.keys(byKind).forEach((k) => {
    const list = byKind[k], groups = [];
    list.forEach((r) => { const g = groups[groups.length - 1]; if (g && g.who === r.who && r.t - g.t1 <= 1.0) g.t1 = r.t; else groups.push({ who: r.who, t0: r.t, t1: r.t, msg: r.msg }); });
    console.log(`\n${k}: ${groups.length}`);
    groups.slice(0, verbose ? 999 : 12).forEach((g) => console.log(`  ${g.t0}${g.t1 > g.t0 ? '-' + g.t1 : ''}s  ${g.who}  ${g.msg}`));
  });
  console.log(rep.length ? `\n${rep.length} motion issues` : 'no motion issues');
  await b.close();
})();
