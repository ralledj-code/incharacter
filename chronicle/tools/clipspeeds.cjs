// Measures the ground speed of locomotion clips from the planted foot (no root motion needed).
// Prints { clip: speed per metre of character height } for src/w3c_action.js STRIDE. Static server on :5173.
const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true }); const p = await b.newPage();
  await p.goto('http://localhost:5173/'); await p.waitForFunction(() => window.__alaron, null, { timeout: 60000 });
  console.log(await p.evaluate(async () => {
    const C = __cw, THREE = C.THREE; await C.loadPacks(['beasts']);
    const X = { at: () => new THREE.Vector3(), yawAt: () => 0, glow: () => new THREE.Object3D(), anims: [], hubAnims: [] };
    const ch = C.chars(X), out = {};
    const measure = (obj, clip, feet, h, clipObj) => {
      const bones = obj.userData.bones, act = obj.userData.mixer.clipAction(clipObj);
      obj.userData.mixer.stopAllAction(); act.play();
      const N = 90, dur = clipObj.duration, dt = dur / N, P = [], v = new THREE.Vector3();
      for (let i = 0; i <= N; i++) {
        obj.userData.mixer.setTime(i * dt); obj.updateMatrixWorld(true);
        P.push(feet.map((f) => bones[f].getWorldPosition(v).clone()));
      }
      const sp = [];
      for (let i = 0; i < N; i++) {
        const ys = P[i].map((q) => q.y), lo = Math.min(...ys), k = ys.indexOf(lo);
        sp.push(-(P[i + 1][k].z - P[i][k].z) / dt);   // the planted foot slides backward at the ground speed
      }
      sp.sort((a, c) => a - c);
      return +(sp[Math.floor(sp.length * 0.5)] / h).toFixed(3);
    };
    const hum = ch.person({ seed: 3 });
    ['Walk_Loop', 'Walk_Formal_Loop', 'Jog_Fwd_Loop', 'Sprint_Loop'].forEach((c) => { out[c] = measure(hum, c, ['ball_l', 'ball_r'], 1.8, C.assets.clips[c]); });
    const wolf = C.creature('wolf', { h: 1 });
    ['Walk', 'Gallop'].forEach((c) => { out['wolf:' + c] = measure(wolf, c, ['FrontLowerLegL', 'FrontLowerLegR', 'BackLowerLegL', 'BackLowerLegR'], 1, C.assets.creatures.wolf.clips.find((x) => x.name === c)); });
    return JSON.stringify(out);
  }));
  await b.close();
})();
