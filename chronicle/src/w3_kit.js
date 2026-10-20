(function (root) {
'use strict';
const C = root.__cw, THREE = C.THREE;
const { TAU, clamp, lerp, sm, ss, R, RP, pick, M, bx, cy, cn, ic, tri, merge, part, solid, emis, inst, lamb } = C;

C.kit = function (X) {
  if (X.kit) return X.kit;
  const { at, yawAt } = X;
  const K = {};
  const dummy = new THREE.Object3D();

  /* ---- trees, rocks ---- */
  const pineGeo = merge([
    cy(0.22, 0.34, 2.2, 5, 0x4a3a2c, [0, 1.1, 0]), cn(2.4, 3.8, 7, 0x2a4a34, [0, 3.9, 0]),
    cn(1.9, 3.4, 7, 0x23402c, [0, 5.7, 0]), cn(1.3, 2.8, 7, 0x1d3626, [0, 7.3, 0])]);
  const deadGeo = merge([
    cy(0.1, 0.32, 6, 5, 0x4a423a, [0, 3, 0]), cy(0.05, 0.12, 2.2, 4, 0x4a423a, [0.9, 4.3, 0], [0, 0, -1.0]),
    cy(0.04, 0.1, 1.8, 4, 0x4a423a, [-0.8, 3.6, 0.2], [0.3, 0, 1.0]), cy(0.04, 0.09, 1.6, 4, 0x4a423a, [0.1, 5.2, 0.8], [1.0, 0, 0.2])]);
  const rockGeo = merge([ic(1, 0, 0x5a5e66, [0, 0.35, 0], [1, 0.7, 0.9])]);
  K.trees = function (d0, d1, o) {
    o = o || {};
    // phones: no trees beyond ~28 m to the side, the fog hides them anyway
    const step = o.step || 3.6, minS = o.minSide || 7, maxS = Math.min(o.maxSide || 46, X.mobile ? 28 : 1e3), dens = (o.dens || 1.2) * (X.mobile ? 0.7 : 1);
    const deadP = o.deadP === undefined ? 0 : o.deadP, rockP = o.rockP === undefined ? 0.12 : o.rockP, sc = o.scale || [0.8, 1.6];
    const pines = [], deads = [], rocks = [];
    for (let d = d0; d < d1; d += step) {
      const n = Math.floor(dens * 2 + rnd01());
      for (let k = 0; k < n; k++) {
        const side = (rnd01() < 0.5 ? -1 : 1) * (minS + rnd01() * (maxS - minS));
        const p = at(d + (rnd01() - 0.5) * step, side, 0);
        const roll = rnd01(), s = sc[0] + rnd01() * (sc[1] - sc[0]);
        if (cleared(p, 1)) continue;
        if (roll < rockP) rocks.push(M([p.x, 0, p.z], [0, rnd01() * TAU, 0], [s * 0.9, s * 0.8, s * 1.1]));
        else if (roll < rockP + deadP) deads.push(M([p.x, 0, p.z], [0, rnd01() * TAU, 0], s));
        else pines.push(M([p.x, 0, p.z], [0, rnd01() * TAU, 0], s));
      }
    }
    const g = new THREE.Group();
    const tint = new THREE.Color(o.tint === undefined ? 0xffffff : o.tint);
    if (C.hasModel('Pine_1')) {
      // CC0 models: spread each list over a few variants; k converts the procedural scale to the model's size
      split(g, ['Pine_1', 'Pine_2', 'Pine_3'], pines, 1.15, tint);
      split(g, ['DeadTree_1', 'DeadTree_2', 'DeadTree_3'], deads, 0.6, tint);
      split(g, ['Rock_Medium_1', 'Rock_Medium_2', 'Rock_Medium_3'], rocks, 0.45, tint);
      if (o.under !== false) {
        // undergrowth close to the rail, kept clear of the chair's path
        // (Bush_Common is left out: its leaves need the pack's own vertex-colour shader)
        const U = [['Fern_1', 0.55], ['Grass_Wispy_Tall', 0.42], ['Pebble_Round_1', 1.4], ['Grass_Common_Tall', 0.38], ['Mushroom_Common', 0.7]];
        const lists = U.map(() => []), uStep = X.mobile ? 4.2 : 2.6;
        for (let d = d0; d < d1; d += uStep) {
          for (let k = 0; k < 2; k++) {
            const side = (rnd01() < 0.5 ? -1 : 1) * (2.6 + rnd01() * 9), p = at(d + (rnd01() - 0.5) * uStep, side, 0);
            const r = rnd01(), i = r < 0.3 ? 0 : r < 0.6 ? 1 : r < 0.8 ? 2 : r < 0.96 ? 3 : 4;
            if (cleared(p, 0.6)) continue;
            lists[i].push(M([p.x, 0, p.z], [0, rnd01() * TAU, 0], U[i][1] * (0.7 + rnd01() * 0.6)));
          }
        }
        const uTint = tint.clone().multiplyScalar(0.5);  // upward-facing blades catch too much sky light at full colour
        U.forEach((u, i) => { const m = C.instModel(u[0], lists[i], { tint: uTint }); if (m) g.add(m); });
      }
      return g;
    }
    if (pines.length) g.add(inst(pineGeo, lamb({ color: tint }), pines));
    if (deads.length) g.add(inst(deadGeo, lamb({ color: tint }), deads));
    if (rocks.length) g.add(inst(rockGeo, lamb({ color: tint }), rocks));
    return g;
  };
  function split(g, keys, mats, k, tint) {
    const sc = new THREE.Matrix4().makeScale(k, k, k), lists = keys.map(() => []);
    mats.forEach((m, i) => lists[i % keys.length].push(m.clone().multiply(sc)));
    keys.forEach((key, i) => { const m = C.instModel(key, lists[i], { tint }); if (m) g.add(m); });
  }
  function rnd01() { return R(0, 1); }
  const cleared = (p, k) => (X.clearings || []).some((c) => (p.x - c.x) ** 2 + (p.z - c.z) ** 2 < (c.r * k) ** 2);

  /* ---- torches with flickering flames ---- */
  K.torches = function (list, o) {
    o = o || {};
    const g = new THREE.Group();
    const poleGeo = merge([cy(0.05, 0.07, 2.4, 5, 0x3a2a1c, [0, 1.2, 0])].concat(C.hasModel('Torch_Metal') ? [] : [cy(0.2, 0.1, 0.22, 6, 0x2a2a30, [0, 2.45, 0])]));
    g.add(inst(poleGeo, lamb(), list.map((p) => M([p.x, 0, p.z]))));
    if (C.hasModel('Torch_Metal')) { const ts = C.modelSize('Torch_Metal'), k = 0.55 / ts.y; const im = C.instModel('Torch_Metal', list.map((p) => M([p.x, 2.15, p.z], [0, 0, 0], k))); if (im) g.add(im); }  // iron basket
    const flameGeo = new THREE.ConeGeometry(0.17, 0.55, 6);
    const flames = new THREE.InstancedMesh(flameGeo, new THREE.MeshBasicMaterial({ color: o.color || 0xff9a30 }), list.length);
    flames.frustumCulled = false; g.add(flames);
    const glows = list.map((p) => {
      const s = X.glow(o.glow || 0xff8a30, o.size || 2.6, 0.7); s.position.set(p.x, 2.8, p.z); g.add(s); return s;
    });
    const ph = list.map(() => R(0, TAU));
    return {
      group: g,
      update(t) {
        for (let i = 0; i < list.length; i++) {
          const f = 1 + 0.25 * Math.sin(t * 11 + ph[i]) + 0.12 * Math.sin(t * 23 + ph[i] * 2);
          dummy.position.set(list[i].x, 2.75, list[i].z); dummy.scale.set(1 / Math.sqrt(f), f, 1 / Math.sqrt(f)); dummy.rotation.set(0, 0, 0.06 * Math.sin(t * 7 + ph[i]));
          dummy.updateMatrix(); flames.setMatrixAt(i, dummy.matrix);
          glows[i].material.opacity = (o.op || 0.7) * (0.8 + 0.2 * Math.sin(t * 9 + ph[i]));
        }
        flames.instanceMatrix.needsUpdate = true;
      }
    };
  };

  /* ---- a standing figure (silhouette-level detail) ---- */
  K.figure = function (o) {
    o = o || {};
    const h = o.h || 1.8, c = o.color || 0x1a1418, skin = o.skin || c;
    const parts = [
      cy(0.2, 0.3, h * 0.55, 6, c, [0, h * 0.5, 0]),
      cy(0.09, 0.1, h * 0.38, 5, c, [-0.1, h * 0.19, 0]), cy(0.09, 0.1, h * 0.38, 5, c, [0.1, h * 0.19, 0]),
      ic(0.16, 1, skin, [0, h * 0.9, 0]),
      cy(0.07, 0.07, h * 0.45, 5, c, [-0.32, h * 0.55, 0], [0, 0, 0.15]), cy(0.07, 0.07, h * 0.45, 5, c, [0.32, h * 0.55, 0], [0, 0, -0.15])
    ];
    if (o.cloak) parts.push(cn(0.42, h * 0.8, 7, o.cloak, [0, h * 0.42, 0.06]));
    if (o.spear) parts.push(cy(0.03, 0.03, h * 1.5, 5, 0x5a4332, [0.42, h * 0.78, 0]), cn(0.07, 0.26, 5, 0xcfd6e0, [0.42, h * 1.56, 0]));
    if (o.horns) parts.push(cn(0.05, 0.3, 4, 0x2a2420, [-0.12, h * 1.0, 0], [0, 0, 0.5]), cn(0.05, 0.3, 4, 0x2a2420, [0.12, h * 1.0, 0], [0, 0, -0.5]));
    if (o.shield) parts.push(cy(0.3, 0.3, 0.05, 8, o.shield, [-0.45, h * 0.55, 0.05], [Math.PI / 2, 0, 0]));
    const m = solid(parts, o.mat);
    const g = new THREE.Group(); g.add(m);
    if (o.eyes) {
      const e = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.03, 0.03), new THREE.MeshBasicMaterial({ color: o.eyes }));
      const e2 = e.clone(); e.position.set(-0.06, h * 0.91, 0.14); e2.position.set(0.06, h * 0.91, 0.14); g.add(e); g.add(e2);
    }
    return g;
  };

  /* ---- fire: animated flame cones + glow ---- */
  K.fire = function (o) {
    o = o || {};
    const g = new THREE.Group(), s = o.scale || 1;
    const cones = [];
    for (let i = 0; i < 4; i++) {
      const m = new THREE.Mesh(new THREE.ConeGeometry(0.22 * s, 0.9 * s, 6), new THREE.MeshBasicMaterial({ color: i < 2 ? 0xff7a1a : 0xffc040, transparent: true, opacity: 0.92 }));
      m.position.set(Math.cos(i * 1.6) * 0.14 * s, 0.4 * s, Math.sin(i * 1.6) * 0.14 * s); g.add(m); cones.push(m);
    }
    const gl = X.glow(o.glow || 0xff8a30, (o.size || 4) * s, 0.8); gl.position.y = 0.8 * s; g.add(gl);
    return {
      group: g,
      update(t) {
        cones.forEach((m, i) => {
          const f = 1 + 0.3 * Math.sin(t * 12 + i * 1.7) + 0.15 * Math.sin(t * 25 + i);
          m.scale.set(1 / Math.sqrt(f), f, 1 / Math.sqrt(f)); m.position.y = 0.45 * s * f;
        });
        gl.material.opacity = 0.7 + 0.2 * Math.sin(t * 10) + 0.1 * Math.sin(t * 27);
      },
      flicker(t) { return 0.85 + 0.15 * Math.sin(t * 13) * Math.sin(t * 7.3 + 1) + 0.05 * Math.sin(t * 31); }
    };
  };

  /* ---- houses with lit windows ---- */
  K.house = function (o) {
    const w = o.w, d = o.d, h = o.h, wall = o.wall || 0x5a4a3c, roof = o.roof || 0x30262a;
    const rise = o.rise || w * 0.38, ang = Math.atan2(rise, w / 2), sl = Math.hypot(w / 2, rise) + 0.4;
    const parts = [
      bx(w, h, d, wall, [0, h / 2, 0]),
      bx(sl, 0.25, d + 0.7, roof, [-w / 4, h + rise / 2, 0], [0, 0, ang]), bx(sl, 0.25, d + 0.7, roof, [w / 4, h + rise / 2, 0], [0, 0, -ang]),
      tri([-w / 2, h, d / 2], [w / 2, h, d / 2], [0, h + rise, d / 2], wall), tri([w / 2, h, -d / 2], [-w / 2, h, -d / 2], [0, h + rise, -d / 2], wall),
      bx(0.7, 2.2, 0.7, 0x3a3236, [w * 0.25, h + rise * 0.7, -d * 0.2])
    ];
    const g = new THREE.Group();
    g.add(solid(parts, { side: THREE.DoubleSide }));
    const wc = o.light || 0xffc070, wins = [];
    const nW = Math.max(1, Math.floor(w / 2.4));
    for (let i = 0; i < nW; i++) {
      const x = (i - (nW - 1) / 2) * 2.2;
      wins.push(part(new THREE.PlaneGeometry(0.8, 1.0), wc, M([x, h * 0.55, d / 2 + 0.03])));
      if (h > 5.5) wins.push(part(new THREE.PlaneGeometry(0.8, 1.0), wc, M([x, h * 0.88, d / 2 + 0.03])));
    }
    g.add(emis(wins, { side: THREE.DoubleSide }));
    return g;
  };

  /* ---- modular timber/plaster houses (CC0 Medieval Village kit), all houses instanced together ----
     hs: [{ x, z, yaw, w: 4|6, d: 4|6, st: 1|2, brick }]; front (+z local) has windows and a door. null if the kit is missing. */
  K.village = function (hs, o) {
    o = o || {};
    if (!C.hasModel('Wall_Plaster_Straight')) return null;
    const lists = {}, add = (k, m) => { (lists[k] = lists[k] || []).push(m); };
    const WH = 3.12;
    hs.forEach((h, hi) => {
      const H = M([h.x, 0, h.z], [0, h.yaw, 0]), w = h.w, d = h.d, st = h.st || 1, pre = h.brick ? 'Wall_UnevenBrick_' : 'Wall_Plaster_';
      const put = (k, x, y, z, yaw) => add(k, H.clone().multiply(M([x, y, z], [0, yaw || 0, 0])));
      for (let s = 0; s < st; s++) {
        const y = s * WH, nw = w / 2, nd = d / 2;
        for (let i = 0; i < nw; i++) {
          const x = -w / 2 + 1 + i * 2;
          // front: a door low in the middle-ish module, windows elsewhere
          const door = s === 0 && i === Math.floor((nw - 1) / 2) && (hi % 3 !== 2);
          const fk = door ? pre + 'Door_Round' : (s === 0 && h.brick ? pre + 'Window_Wide_Round' : (s > 0 && !h.brick && i % 2 ? 'Wall_Plaster_WoodGrid' : pre + 'Window_Wide_Round'));
          put(fk, x, y, d / 2 - 0.09, 0);
          if (door) put('Door_1_Round', x - 0.53, y, d / 2 - 0.15, 0);
          else if (/Window/.test(fk)) { put('Window_Wide_Round1', x, y, d / 2 - 0.1, 0); if (s > 0 && i % 2 === 0) put('WindowShutters_Wide_Round_Open', x, y, d / 2 - 0.09, 0); }
          put(pre + 'Straight', x, y, -d / 2 + 0.09, Math.PI);
        }
        for (let i = 0; i < nd; i++) {
          const z = -d / 2 + 1 + i * 2;
          put(i % 2 ? pre + 'Window_Wide_Round' : pre + 'Straight', w / 2 - 0.09, y, z, Math.PI / 2);
          put(pre + 'Straight', -w / 2 + 0.09, y, z, -Math.PI / 2);
        }
        [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach((c) => put(h.brick ? 'Corner_Exterior_Brick' : 'Corner_Exterior_Wood', c[0] * w / 2, y, c[1] * d / 2, 0));
      }
      const top = st * WH;
      put('Roof_RoundTiles_' + w + 'x' + d, 0, top, 0, 0);
      put('Roof_Front_Brick' + w, 0, top, d / 2 - 0.25, 0); put('Roof_Front_Brick' + w, 0, top, -d / 2 + 0.25, Math.PI);
      if (hi % 2 === 0) put('Prop_Chimney', w / 4, top + 0.6, -d / 4, 0);
    });
    const g = new THREE.Group();
    Object.keys(lists).forEach((k) => { const m = C.instModel(k, lists[k], { tint: o.tint }); if (m) g.add(m); });
    // lit windows: the kit's glass becomes an unlit warm pane
    const glass = new THREE.MeshBasicMaterial({ color: o.glass || 0xffb860 });
    g.traverse((m) => { if (m.isMesh && m.material && m.material.name === 'MI_WindowGlass') m.material = glass; });
    return g;
  };

  /* ---- chain links ---- */
  K.linkGeo = merge([part(new THREE.TorusGeometry(0.2, 0.05, 5, 8), 0x6a6e78)]);
  K.placeFacing = function (obj, d, side) { obj.rotation.y = yawAt(d) + (side > 0 ? -Math.PI / 2 : Math.PI / 2); };
  K.dummy = dummy;
  X.kit = K;
  return K;
};
})(typeof window !== 'undefined' ? window : globalThis);
