(function (root) {
'use strict';
const C = root.__cw, THREE = C.THREE;
const { TAU, clamp, lerp, sm, ss, M, bx, cy, cn, ic, tri, part, solid, emis, inst, lamb, R } = C;
const SC = C.scenes.baphomet;
const Y = new THREE.Vector3(0, 1, 0);

function seg(a, b, rad, color) {
  const A = new THREE.Vector3(a[0], a[1], a[2]), B = new THREE.Vector3(b[0], b[1], b[2]), d = B.clone().sub(A), len = d.length();
  const m = new THREE.Matrix4().compose(A.clone().add(B).multiplyScalar(0.5), new THREE.Quaternion().setFromUnitVectors(Y, d.normalize()), new THREE.Vector3(1, 1, 1));
  return part(new THREE.CylinderGeometry(rad, rad * 0.8, len, 5), color, m);
}

/* The black wyrm. pose 'fly' keeps the neck raised; 'dead' lays it on the ground with the jaw open. */
C.buildDragon = function (pose) {
  const dead = pose === 'dead', g = new THREE.Group(), sc = 0x1c1618, belly = 0x3a2626, mem = 0x2e1a1e;
  const P = [ic(1, 1, sc, [0, 0, 0], [1.15, 1.0, 2.6])];
  for (let i = 0; i < 8; i++) P.push(cn(0.16, 0.5, 4, 0x2a2224, [0, 0.95 - Math.abs(i - 3.5) * 0.05, -1.6 + i * 0.5]));
  [[-0.9, -1.0], [0.9, -1.0], [-0.9, 1.1], [0.9, 1.1]].forEach((l) => {
    if (dead) P.push(seg([l[0] * 0.6, -0.4, l[1]], [l[0] * 1.9, -0.9, l[1] - 0.3], 0.26, sc)); else P.push(seg([l[0] * 0.6, -0.5, l[1]], [l[0] * 0.9, -1.5, l[1] + 0.2], 0.22, sc));
  });
  let nx = 0, ny = 0, nz = 0;
  for (let i = 0; i < 4; i++) {
    nx = dead ? 0.35 * i : 0; ny = dead ? -0.1 + 0.02 * i : 0.3 + 0.55 * i; nz = -2.5 - 0.85 * i;
    P.push(ic(0.7 - 0.08 * i, 1, sc, [nx, ny, nz], [1, 1, 1.2]));
  }
  const hx = nx + (dead ? 0.3 : 0), hy = ny + (dead ? -0.15 : 0.3), hz = nz - 1.1;
  P.push(bx(0.8, 0.6, 1.1, sc, [hx, hy, hz]), bx(0.55, 0.4, 0.95, sc, [hx, hy - 0.05, hz - 0.95]),
    bx(0.5, 0.18, 0.85, belly, [hx, hy - 0.4 - (dead ? 0.15 : 0), hz - 0.85], [dead ? 0.3 : 0, 0, 0]),
    cn(0.12, 0.8, 4, 0x2a2224, [hx - 0.3, hy + 0.45, hz + 0.3], [1.0, 0, 0.3]), cn(0.12, 0.8, 4, 0x2a2224, [hx + 0.3, hy + 0.45, hz + 0.3], [1.0, 0, -0.3]));
  for (let i = 0; i < 5; i++) P.push(cn(0.04, 0.16, 3, 0xd8d0c0, [hx + (i - 2) * 0.1, hy - 0.22, hz - 1.35], [Math.PI, 0, 0]));
  for (let k = 0; k < 7; k++) P.push(cy(0.55 - 0.07 * k, 0.65 - 0.07 * k, 1.0, 6, sc, [Math.sin(k * 0.7) * (dead ? 0.9 : 0.5), dead ? -0.2 : 0.1 - 0.05 * k, 2.6 + k * 0.95], [Math.PI / 2, 0, 0]));
  g.add(solid(P));
  const mkWing = (sg) => {
    const w = new THREE.Group(), tip = [[sg * 4.2, -0.4, 2.2], [sg * 2.6, -0.5, 3.4], [sg * 0.6, -0.3, 2.8]], wr = [sg * 3.2, 0.2, -0.2];
    const WP = [seg([0, 0, 0], wr, 0.11, sc)];
    tip.forEach((t) => WP.push(seg(wr, t, 0.06, sc)));
    WP.push(tri([0, 0, 0], wr, tip[0], mem), tri([0, 0, 0], tip[0], tip[1], mem), tri([0, 0, 0], tip[1], tip[2], mem));
    w.add(solid(WP, { side: THREE.DoubleSide })); w.position.set(sg * 0.8, 0.8, -0.7); return w;
  };
  const wR = mkWing(1), wL = mkWing(-1);
  if (dead) { wR.rotation.z = -1.15; wL.rotation.z = 1.15; wR.position.y = 0.4; wL.position.y = 0.4; }
  g.add(wR); g.add(wL);
  const eyes = [-0.28, 0.28].map((x) => {
    const e = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.06), new THREE.MeshBasicMaterial({ color: dead ? 0x201010 : 0xffc030 }));
    e.position.set(hx + x, hy + 0.12, hz - 0.5); g.add(e); return e;
  });
  g.userData = { wR, wL, head: new THREE.Vector3(hx, hy, hz), eyes };
  return g;
};

/* ---- chorus: the brothers' avenue (used twice) ---- */
function brothers(secId, opt) {
  return function (X) {
    const S = X.sec[secId], kit = C.kit(X), ch = C.chars(X), g = new THREE.Group();
    g.add(kit.trees(S.d0 - 15, S.d1 + 15, { minSide: 12, maxSide: 44, dens: 0.9, deadP: opt.deadP, tint: opt.tint }));
    const list = [];
    for (let d = S.d0 + 2; d < S.d1 - 2; d += 6) { const a = X.at(d, -5.5, 0), b = X.at(d + 3, 5.5, 0); list.push({ x: a.x, z: a.z }, { x: b.x, z: b.z }); }
    const tor = kit.torches(list, { glow: 0xffb060, size: 3.0, op: 0.75 }); g.add(tor.group);
    const banners = [];
    [['cedric', 0.22, -8], ['arthas', 0.5, 8], ['lucien', 0.78, -8]].forEach((b) => {
      const d = S.d0 + S.len * b[1], p = X.at(d, b[2], 0), grp = new THREE.Group();
      grp.add(solid([cy(0.08, 0.1, 9, 6, 0x3a2818, [0, 4.5, 0]), bx(3.2, 0.12, 0.12, 0x2a1c12, [0, 8.6, 0]), ic(0.18, 0, 0xc9a24a, [0, 9.1, 0])]));
      const geo = new THREE.PlaneGeometry(2.6, 4.6, 8, 14), cloth = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ map: C.bannerTexture(b[0]), side: THREE.DoubleSide }));
      cloth.position.set(0, 6.2, 0.06); grp.add(cloth);
      grp.position.copy(p); kit.placeFacing(grp, d, b[2]); g.add(grp);
      banners.push({ geo, base: geo.attributes.position.array.slice(), ph: R(0, TAU) });
    });
    // the three of them stand where the avenue ends
    const dd = S.d1 - 7;
    [['cedric', -4.2], ['lucien', -5.7], ['arthas', -7.4]].forEach((c, i) => {
      const f = ch[c[0]](), p = X.at(dd - i * 0.6, c[1], 0); f.position.copy(p); f.rotation.y = X.yawAt(dd) + Math.PI / 2 + 0.3 * i;
      if (c[0] === 'lucien') { f.userData.blade.visible = true; }
      g.add(f);
    });
    return {
      group: g, d0: S.d0, d1: S.d1, vis: 100,
      update(t, ctx) {
        tor.update(ctx.time);
        banners.forEach((b) => {
          const a = b.geo.attributes.position, arr = a.array;
          for (let i = 0; i < arr.length; i += 3) {
            const x = b.base[i], y = b.base[i + 1], k = (2.3 - y) / 4.6;
            arr[i + 2] = Math.sin(x * 2.0 + k * 3.0 - ctx.time * 3 + b.ph) * (0.04 + 0.2 * k);
          }
          a.needsUpdate = true; b.geo.computeVertexNormals();
        });
        const p = X.at(clamp(ctx.camD + 8, S.d0, S.d1), 0, 0);
        ctx.light(opt.slot, p.x, 4, p.z, opt.light, 1.8 + 0.3 * Math.sin(ctx.time * 6), 34);
      }
    };
  };
}
SC.push(brothers('chorus', { deadP: 0.1, tint: 0xa8a0c8, slot: 0, light: 0xffb868 }));
SC.push(brothers('chorus2', { deadP: 0.05, tint: 0xd0b0b8, slot: 1, light: 0xffc080 }));

/* ---- the wyrm in the red sky, and the scorched land ---- */
SC.push(function (X) {
  const S = X.sec.v2, S2 = X.sec.v2b, Sb = X.sec.brk, kit = C.kit(X), g = new THREE.Group();
  g.add(kit.trees(S.d0 - 15, Sb.d0 + 40, { minSide: 7, maxSide: 40, dens: 1.0, deadP: 0.9, tint: 0xc09080 }));
  const NC = 70, cm = [];
  for (let i = 0; i < NC; i++) { const p = X.at(R(S.d0 - 10, Sb.d0 + 40), R(-22, 22), 0); cm.push(M([p.x, 0.03, p.z], [-Math.PI / 2, 0, R(0, TAU)], [R(1.4, 3.6), R(0.15, 0.4), 1])); }
  const cracks = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0xff5a18, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }), NC);
  cm.forEach((m, i) => cracks.setMatrixAt(i, m)); cracks.frustumCulled = false; g.add(cracks);
  const dragon = C.buildDragon('fly'); dragon.scale.setScalar(2.2); g.add(dragon);
  const jet = []; for (let i = 0; i < 7; i++) { const s = X.glow(0xff7a20, 3, 0); g.add(s); jet.push(s); }
  return {
    group: g, d0: S.d0 - 10, d1: Sb.d0, vis: 100,
    update(t, ctx) {
      const ud = dragon.userData, f = 0.5 * Math.sin(ctx.time * 3.4) + 0.15;
      ud.wR.rotation.z = f; ud.wL.rotation.z = -f;
      const gone = t > S2.t0 + 4;
      dragon.visible = !gone;
      if (!gone) {
        const c = X.at(ctx.camD + 26, 0, 0), a = 1.2 + (t - S.t0) * 0.33, away = ss(S.t0 + 14, S2.t0 + 2, t);
        const Rr = 30 * (1 + 2.4 * away), y = 14 + 6 * Math.sin(ctx.time * 0.5) - 16 * (1 - ss(S.t0, S.t0 + 5, t)) + 12 * away;
        dragon.position.set(c.x + Math.cos(a) * Rr, y, c.z + Math.sin(a) * Rr);
        dragon.rotation.set(0, Math.atan2(Math.sin(a), -Math.cos(a)), 0.3);
        dragon.rotation.z = 0.3;
        const fw = new THREE.Vector3(0, 0, -1).applyEuler(dragon.rotation), mouth = dragon.localToWorld(ud.head.clone());
        const br = ss(S.t0 + 5, S.t0 + 6, t) * (1 - ss(S.t0 + 9, S.t0 + 10, t));
        jet.forEach((s, i) => { s.position.copy(mouth).addScaledVector(fw, 2.5 + i * 3.2); s.scale.setScalar(2 + i * 1.2); s.material.opacity = br * (0.8 - i * 0.08); });
        ctx.light(1, dragon.position.x, dragon.position.y - 4, dragon.position.z, 0xff7a30, 2.0 * br + 0.5, 60);
      } else jet.forEach((s) => { s.material.opacity = 0; });
      cracks.material.opacity = 0.55 + 0.25 * Math.sin(ctx.time * 2.3);
    }
  };
});

/* ---- Cedric alone, the crater, and the kill ---- */
SC.push(function (X) {
  const S = X.sec.v2b, Sb = X.sec.brk, Sc = X.sec.v2c, kit = C.kit(X), ch = C.chars(X), g = new THREE.Group();
  const TK = Sb.t0, dCr = Sb.d0 + 16;
  // bone arches around the crater
  const arches = [], tg = new THREE.TorusGeometry(2.6, 0.2, 5, 9, Math.PI); tg.rotateX(0);
  for (let i = 0; i < 14; i++) { const d = R(S.d0, dCr + 30), sd = (R(0, 1) < 0.5 ? -1 : 1) * R(6, 24), p = X.at(d, sd, 0); arches.push(M([p.x, 0, p.z], [0, R(0, TAU), 0], R(0.8, 1.8))); }
  g.add(inst(C.merge([part(tg, 0xcfc6b0)]), lamb({ color: 0xffffff }), arches));
  // the carcass
  const dragon = C.buildDragon('dead'), SCL = 2.3, bodyD = dCr + 13;
  const bp = X.at(bodyD, -8.5, 1.1 * SCL * 0.9); dragon.position.copy(bp); dragon.scale.setScalar(SCL); dragon.rotation.y = X.yawAt(bodyD) + Math.PI; dragon.visible = false; g.add(dragon);
  dragon.updateMatrixWorld(true);
  const headW = dragon.localToWorld(dragon.userData.head.clone());
  const eyeG = [X.glow(0xff2a1a, 3.2, 0), X.glow(0xff2a1a, 3.2, 0)]; eyeG[0].position.copy(headW).add(new THREE.Vector3(0.6, 1.2, 0)); eyeG[1].position.copy(headW).add(new THREE.Vector3(-0.6, 1.2, 0)); eyeG.forEach((e) => g.add(e));
  // Cedric: runs ahead, then stands on the dragon's head
  const ced = ch.cedric({ pose: 'Sprint_Loop' }); g.add(ced);
  return {
    group: g, d0: S.d0, d1: Sc.d1, vis: 110,
    update(t, ctx) {
      const killed = t >= TK;
      dragon.visible = killed;
      if (killed) dragon.scale.setScalar(SCL * (0.92 + 0.08 * sm((t - TK) / 0.4)));
      const glowK = killed ? 0 : ss(X.sec.v2b.t0, X.sec.brk.t0 - 1, t) * (0.8 + 0.2 * Math.sin(ctx.time * 5));
      eyeG.forEach((e) => { e.material.opacity = glowK; });
      if (!killed) {
        const dc = Math.min(dCr - 3, X.distAt(Math.max(S.t0, t)) + 26), p = X.at(dc, 1.2, 0);
        ced.position.set(p.x, ced.userData.mixer ? 0 : Math.abs(Math.sin(ctx.time * 9)) * 0.15, p.z); ced.rotation.y = X.yawAt(dc) + Math.PI; ced.visible = t > S.t0 + 1;
        if (ced.userData.pose) ced.userData.pose('Sprint_Loop');
        ctx.light(0, headW.x, 1.6, headW.z, 0xff3a22, 0.8 * glowK, 30);
      } else {
        ced.visible = true; ced.position.set(headW.x, headW.y + 0.55 * SCL * 0.5, headW.z); ced.rotation.y = X.yawAt(dCr) + Math.PI / 2 + 0.6;
        if (ced.userData.pose) ced.userData.pose('Idle_Torch_Loop');
        const k = Math.exp(-(t - TK) * 1.5);
        ctx.light(0, headW.x, 3.0, headW.z, 0xffd890, 2.2 + 8 * k, 42);
      }
    }
  };
});
})(typeof window !== 'undefined' ? window : globalThis);
