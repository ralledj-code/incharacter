(function (root) {
'use strict';
const C = root.__cw, THREE = C.THREE;
const { TAU, lerp, M, bx, cy, cn, ic, solid } = C;

/* The party, built from the reference portraits. Detail level: readable at 5-15 m in fog. */
C.chars = function (X) {
  const K = C.kit(X);
  if (K.cedric) return K;
  const eyeMesh = (color, s) => new THREE.Mesh(new THREE.BoxGeometry(0.07 * s, 0.03 * s, 0.03 * s), new THREE.MeshBasicMaterial({ color }));

  // Cedric: devout monk. Red leather, bronze dragon pauldrons, green tunic, beads, wooden staff.
  K.cedric = function (o) {
    o = o || {}; const h = o.h || 1.85, g = new THREE.Group();
    const P = [
      cy(0.22, 0.3, h * 0.5, 7, 0x7a1c1c, [0, h * 0.52, 0]),
      cy(0.1, 0.11, h * 0.4, 5, 0x3a5a34, [-0.11, h * 0.2, 0]), cy(0.1, 0.11, h * 0.4, 5, 0x3a5a34, [0.11, h * 0.2, 0]),
      cy(0.11, 0.1, 0.16, 6, 0x5a3a22, [-0.11, 0.08, 0.02]), cy(0.11, 0.1, 0.16, 6, 0x5a3a22, [0.11, 0.08, 0.02]),
      cy(0.07, 0.07, h * 0.4, 5, 0x3a5a34, [-0.34, h * 0.56, 0], [0, 0, 0.15]), cy(0.07, 0.07, h * 0.4, 5, 0x3a5a34, [0.34, h * 0.56, 0], [0, 0, -0.15]),
      ic(0.17, 1, 0xa67c3a, [-0.3, h * 0.77, 0], [1, 0.8, 1]), ic(0.17, 1, 0xa67c3a, [0.3, h * 0.77, 0], [1, 0.8, 1]),
      cn(0.05, 0.22, 4, 0xa67c3a, [-0.36, h * 0.86, 0], [0, 0, 0.5]), cn(0.05, 0.22, 4, 0xa67c3a, [0.36, h * 0.86, 0], [0, 0, -0.5]),
      cy(0.31, 0.31, 0.09, 8, 0x2e6a3a, [0, h * 0.34, 0]), cy(0.04, 0.03, 0.4, 4, 0x8a6a30, [0.12, h * 0.2, 0.3]),
      ic(0.16, 1, 0xc89a76, [0, h * 0.9, 0]), ic(0.165, 1, 0x3a2a1e, [0, h * 0.935, -0.02], [1, 0.75, 1])
    ];
    for (let i = 0; i < 7; i++) { const a = -0.9 + i * 0.3; P.push(ic(0.035, 0, 0x8a6030, [Math.sin(a) * 0.19, h * 0.7 - Math.abs(a) * 0.05, 0.19 * Math.cos(a)])); }
    if (!o.noStaff) P.push(cy(0.022, 0.022, h * 1.12, 5, 0x5a3a2a, [0.46, h * 0.6, 0]), cy(0.032, 0.032, 0.1, 5, 0xa0a4ac, [0.46, h * 1.17, 0]), cy(0.032, 0.032, 0.1, 5, 0xa0a4ac, [0.46, h * 0.05, 0]));
    g.add(solid(P)); return g;
  };

  // Lucien: the singer. Long blond hair, pointed ears, burgundy velvet coat, silver flute, blue-glowing dagger.
  K.lucien = function (o) {
    o = o || {}; const h = o.h || 1.82, g = new THREE.Group();
    const P = [
      cn(0.4, h * 0.82, 9, 0x5a1626, [0, h * 0.41, 0.02]), cy(0.2, 0.26, h * 0.42, 7, 0x1c1c22, [0, h * 0.6, -0.04]),
      cy(0.08, 0.09, h * 0.42, 5, 0x15151a, [-0.1, h * 0.2, 0]), cy(0.08, 0.09, h * 0.42, 5, 0x15151a, [0.1, h * 0.2, 0]),
      cy(0.1, 0.09, h * 0.2, 6, 0x15151a, [-0.1, 0.1, 0.02]), cy(0.1, 0.09, h * 0.2, 6, 0x15151a, [0.1, 0.1, 0.02]),
      cy(0.065, 0.065, h * 0.42, 5, 0x5a1626, [-0.3, h * 0.58, 0], [0, 0, 0.15]), cy(0.065, 0.065, h * 0.42, 5, 0x5a1626, [0.3, h * 0.58, 0], [0, 0, -0.15]),
      ic(0.155, 1, 0xe0b898, [0, h * 0.9, 0]), ic(0.165, 1, 0xd8b868, [0, h * 0.935, 0.02], [1, 0.8, 1.05]),
      cn(0.17, 0.62, 6, 0xd0ae60, [0, h * 0.78, 0.13]),
      cn(0.03, 0.14, 4, 0xe0b898, [-0.17, h * 0.92, 0], [0, 0, 1.2]), cn(0.03, 0.14, 4, 0xe0b898, [0.17, h * 0.92, 0], [0, 0, -1.2]),
      cy(0.012, 0.012, 0.62, 5, 0xcfd3da, [0.42, h * 0.5, -0.08], [0.2, 0, 1.0])
    ];
    g.add(solid(P));
    const blade = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.34, 4), new THREE.MeshBasicMaterial({ color: 0x66ddff }));
    blade.rotation.x = Math.PI; blade.position.set(-0.38, h * 0.52, 0.08); g.add(blade); g.userData.blade = blade;
    const gl = X.glow(0x40c8ff, 0.9, 0.7); gl.position.copy(blade.position); g.add(gl); g.userData.bladeGlow = gl;
    return g;
  };

  // Arthas: devout paladin in a helm of dread. Dark plate, pale tabard, glowing visor slit.
  K.arthas = function (o) {
    o = o || {}; const h = o.h || 2.1, g = new THREE.Group();
    const P = [
      cy(0.3, 0.42, h * 0.5, 8, 0x2a2e38, [0, h * 0.52, 0]), bx(0.5, h * 0.42, 0.06, 0xe4dcc4, [0, h * 0.42, 0.3]), bx(0.12, h * 0.4, 0.07, 0xc9a24a, [0, h * 0.42, 0.31]),
      cy(0.12, 0.13, h * 0.42, 6, 0x23262e, [-0.15, h * 0.2, 0]), cy(0.12, 0.13, h * 0.42, 6, 0x23262e, [0.15, h * 0.2, 0]),
      ic(0.24, 1, 0x3a3f4c, [-0.5, h * 0.75, 0], [1, 0.8, 1]), ic(0.24, 1, 0x3a3f4c, [0.5, h * 0.75, 0], [1, 0.8, 1]),
      cy(0.09, 0.09, h * 0.42, 5, 0x2a2e38, [-0.52, h * 0.54, 0]), cy(0.09, 0.09, h * 0.42, 5, 0x2a2e38, [0.52, h * 0.54, 0]),
      ic(0.22, 1, 0x20232b, [0, h * 0.9, 0], [1, 1.15, 1]), cn(0.07, 0.34, 4, 0x20232b, [-0.18, h * 1.02, 0], [0, 0, 0.7]), cn(0.07, 0.34, 4, 0x20232b, [0.18, h * 1.02, 0], [0, 0, -0.7]),
      cn(0.06, 0.4, 4, 0x20232b, [0, h * 1.08, 0]),
      cy(0.04, 0.04, 0.5, 5, 0x4a3a2c, [0.7, h * 0.5, 0]), bx(0.12, 1.0, 0.04, 0x9aa0ac, [0.7, h * 0.95, 0]),
      cy(0.36, 0.36, 0.06, 8, 0xe4dcc4, [-0.62, h * 0.5, 0.12], [Math.PI / 2, 0, 0])
    ];
    g.add(solid(P));
    const v = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.04, 0.05), new THREE.MeshBasicMaterial({ color: 0xff7a30 }));
    v.position.set(0, h * 0.9, 0.21); g.add(v); g.userData.visor = v;
    return g;
  };

  // Neeris: the wolf-cursed NPC. Dark hunched figure, amber eyes, ears when turned.
  K.neeris = function (o) {
    o = o || {}; const h = o.h || 1.7, g = new THREE.Group();
    const P = [
      cy(0.22, 0.3, h * 0.55, 6, 0x3a3430, [0, h * 0.48, 0], [0.2, 0, 0]), cy(0.09, 0.1, h * 0.4, 5, 0x2a2622, [-0.11, h * 0.2, 0]), cy(0.09, 0.1, h * 0.4, 5, 0x2a2622, [0.11, h * 0.2, 0]),
      ic(0.16, 1, 0x4a4038, [0, h * 0.86, 0.1]), cn(0.05, 0.2, 4, 0x2a2622, [-0.1, h * 0.99, 0.08]), cn(0.05, 0.2, 4, 0x2a2622, [0.1, h * 0.99, 0.08]),
      cy(0.07, 0.06, h * 0.45, 5, 0x3a3430, [-0.3, h * 0.45, 0.1], [0.4, 0, 0.1]), cy(0.07, 0.06, h * 0.45, 5, 0x3a3430, [0.3, h * 0.45, 0.1], [0.4, 0, -0.1])
    ];
    g.add(solid(P));
    const e1 = eyeMesh(0xffb030, 1), e2 = e1.clone(); e1.position.set(-0.06, h * 0.87, 0.25); e2.position.set(0.06, h * 0.87, 0.25); g.add(e1); g.add(e2);
    return g;
  };

  /* Rigged CC0 versions of the party (Neeris stays procedural). o.pose = animation clip name.
     Their mixers are registered in X.anims; the engine sets them from song time each frame. */
  if (C.hasChars()) {
    // o.hub: lives in the tavern (animated on wall time, survives level loads); else a story character (song time)
    const reg = (g, o) => { if (!(o && o.bake)) (o && o.hub ? X.hubAnims : X.anims).push(g); return g; };  // o.bake: not animated (C.bakeRig)
    const rig = (spec, o) => reg(C.rigChar(spec), o);
    const ear = (g, side) => C.attach(g, 'Head', solid([cn(0.025, 0.11, 4, 0xe0b898, [0, 0, 0])]), [side * 0.085, 0.1, 0.0], [0, 0, -side * 1.15]);
    // Lucien Vale: half-elf wild magic sorcerer. Burgundy coat, long blond hair, pointed ears, crackling hand, glowing blue dagger.
    K.lucien = function (o) {
      o = o || {};
      const g = rig({ parts: [['ranger_m', 0xb04060, /Hood|Pauldron/], ['hair_long', 0xfff2b8]], pose: o.pose || 'Spell_Simple_Idle_Loop', h: 1.8 }, o);
      ear(g, -1); ear(g, 1);
      const spark = X.glow(0xb070ff, 0.7, 0.85); C.attach(g, 'hand_r', spark, [0, 0.1, 0]); g.userData.spark = spark;
      const dag = new THREE.Group();
      const blade = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.34, 4), new THREE.MeshBasicMaterial({ color: 0x66ddff })); blade.position.y = 0.2; dag.add(blade);
      const gl = X.glow(0x40c8ff, 0.5, 0.7); gl.position.y = 0.2; dag.add(gl);
      C.attach(g, 'hand_l', dag, [0, 0.08, 0]);
      g.userData.blade = blade; g.userData.bladeGlow = gl;
      return g;
    };
    // Cedric: human monk. Red leather, green tunic, bronze dragon pauldrons, beard, wooden staff.
    K.cedric = function (o) {
      o = o || {};
      const g = rig({ parts: [['peasant_m', 0xd07a60], ['ranger_m', { color: 0xb08440 }, null, /Pauldron/], ['hair_beard', 0x6a4430]], pose: o.pose || 'Idle_Loop', h: 1.85 }, o);
      if (!o.noStaff) C.attach(g, 'hand_r', solid([cy(0.022, 0.022, 2.0, 5, 0x5a3a2a, [0, 0, 0]), cy(0.032, 0.032, 0.1, 5, 0xa0a4ac, [0, 0.98, 0])]), [0, 0.05, 0], [0, 0, 0]);
      return g;
    };
    // Arthas: devout human paladin. Steel plate, dark helm-hood with a glowing visor slit, sword.
    K.arthas = function (o) {
      o = o || {};
      const g = rig({ parts: [['ranger_m', { color: 0x747a86, only: /Ranger/ }]], pose: o.pose || 'Sword_Idle', h: 1.95 }, o);
      g.traverse((m) => { if (m.isMesh && /Hood/.test(m.name)) [].concat(m.material).forEach((x) => x.color.setHex(0x2a2c34)); });
      const v = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.018, 0.02), new THREE.MeshBasicMaterial({ color: 0xff7a30 }));
      C.attach(g, 'Head', v, [0, 0.1, 0.1]); g.userData.visor = v;
      const sw = C.model('Sword_Bronze'); if (sw) C.attach(g, 'hand_r', sw, [0, 0.05, 0], [0, 0, -Math.PI / 2], 1.1);
      return g;
    };
    // Neeris: druid of the forest (wolf-cursed in this story). Moss-green hooded ranger, gnarled staff, amber eyes.
    K.neeris = function (o) {
      o = o || {};
      const g = rig({ parts: [['ranger_m', 0x6a8a58], ['hair_beard', 0x4a3a2a]], body: 0xc8b8a8, pose: o.pose || 'Idle_Loop', h: 1.78 }, o);
      g.traverse((m) => { if (m.isMesh && /Hood/.test(m.name)) [].concat(m.material).forEach((x) => x.color.setHex(0x3a5a34)); });
      C.attach(g, 'hand_r', solid([cy(0.025, 0.035, 1.9, 5, 0x4a3420, [0, 0, 0]), ic(0.07, 0, 0x5a8a3a, [0, 0.95, 0])]), [0, 0.05, 0]);
      const e = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.014, 0.02), new THREE.MeshBasicMaterial({ color: 0xffb030 }));
      C.attach(g, 'Head', e, [0, 0.085, 0.1]); g.userData.eyes = e;
      return g;
    };

    /* Anyone else: a tavern patron, musician or crowd member. o: { female, outfit: 'peasant'|'ranger', tint, hair, hairTint, pose, hub, seed } */
    const HAIR_M = ['hair_parted', 'hair_buzzed', 'hair_beard', 'hair_long'], HAIR_F = ['hair_buns', 'hair_buzzed_f', 'hair_long'];
    const CLOTH = [0x9a6a4a, 0x6a7a9a, 0x8a5a6a, 0x5a7a5a, 0xa08a5a, 0x7a5a8a, 0xb07050, 0x5a6a6a];
    const HAIRC = [0x2a1c14, 0x5a3a22, 0x8a6a3a, 0xd8c080, 0x1a1a1a, 0x9a4a2a];
    K.person = function (o) {
      o = o || {};
      const rnd = C.mkRng(o.seed || 1), pk = (a) => a[Math.floor(rnd() * a.length)];
      const f = o.female === undefined ? rnd() < 0.45 : o.female, outfit = (o.outfit || (rnd() < 0.6 ? 'peasant' : 'ranger')) + (f ? '_f' : '_m');
      const hair = o.hair || pk(f ? HAIR_F : HAIR_M);
      const parts = [[outfit, o.tint || pk(CLOTH), rnd() < 0.7 ? /Hood|Pauldron/ : null], [hair, o.hairTint || pk(HAIRC)]];
      if (!f && hair !== 'hair_beard' && rnd() < 0.35) parts.push(['hair_beard', o.hairTint || pk(HAIRC)]);
      return rig({ base: f ? 'body_f' : 'body_m', parts, pose: o.pose || 'Idle_Loop', h: o.h || (f ? 1.68 : 1.8) }, o);
    };

    /* Baphomet: a winged, goat-headed giant on the rigged body. Built at human scale (1.8 m) and scaled to o.h.
       userData: wings [L, R] pivots (flap in update), eyes, pose(). */
    const tube = (pts, r0, r1, color) => {  // tapered horn/bone along points (human-scale metres, bone space)
      const parts = [];
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i], b = pts[i + 1], dir = new THREE.Vector3().subVectors(b, a), len = dir.length();
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
        const r = (k) => lerp(r0, r1, k / (pts.length - 1)), g = new THREE.CylinderGeometry(r(i + 1), r(i), len * 1.08, 7);
        g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(q)); g.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);  // r128: no applyQuaternion on geometry
        parts.push(C.part(g, color));
      }
      return parts;
    };
    K.baphomet = function (o) {
      o = o || {};
      const H = o.h || 14, k = H / 1.8;
      const g = rig({ parts: [['ranger_m', { color: 0x3a2628 }, /Hood/], ['peasant_m', { color: 0x4a2a2a }, /Body|Arms/]], body: 0x4a2c2c, pose: o.pose || 'Idle_Loop', h: H }, o);
      const bone = 0x8a7c6a, horn = 0x4a4038, V3 = (x, y, z) => new THREE.Vector3(x, y, z);
      // goat skull over the human head: long muzzle, heavy brow, beard, ears, two great back-swept horns
      const P = [
        ic(0.13, 1, bone, [0, 0.1, 0.0], [1, 1.05, 1.15]),
        cy(0.045, 0.07, 0.22, 7, bone, [0, 0.04, 0.16], [Math.PI / 2 + 0.35, 0, 0]),
        bx(0.2, 0.05, 0.08, 0x1a1416, [0, 0.13, 0.1]),
        cn(0.05, 0.22, 6, 0x1a1214, [0, -0.1, 0.17], [Math.PI, 0, 0]),
        cn(0.03, 0.14, 4, bone, [-0.15, 0.12, -0.02], [0, 0, 1.3]), cn(0.03, 0.14, 4, bone, [0.15, 0.12, -0.02], [0, 0, -1.3])
      ];
      [-1, 1].forEach((sd) => {
        const pts = []; for (let i = 0; i <= 8; i++) { const u = i / 8; pts.push(V3(sd * (0.06 + 0.1 * u + 0.05 * Math.sin(u * 3)), 0.2 + 0.32 * Math.sin(u * 1.9), -0.02 - 0.28 * u * u)); }
        P.push(...tube(pts, 0.045, 0.008, horn));
      });
      const skull = solid(P); C.attach(g, 'Head', skull, [0, 0, 0.02 * k], null, k);
      const eyes = [-0.055, 0.055].map((x) => { const e = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.014, 0.02), new THREE.MeshBasicMaterial({ color: 0xff3a10 })); C.attach(g, 'Head', e, [x * k, 0.12 * k, 0.17 * k], null, k); return e; });
      const eg = X.glow(0xff3010, 0.5 * k, 0.9); C.attach(g, 'Head', eg, [0, 0.12 * k, 0.2 * k]);
      // bat wings from the shoulder blades: finger bones + membrane
      const wings = [-1, 1].map((sd) => {
        const piv = new THREE.Group(), span = 1.5, fingers = [[1.0, 0.75], [1.45, 0.25], [1.25, -0.3], [0.8, -0.65]];
        const Wp = [];
        fingers.forEach(([x, y]) => Wp.push(...tube([V3(0, 0, 0), V3(sd * x * 0.45, y * 0.6 + 0.35, -0.05), V3(sd * x * span * 0.62, y * span * 0.45 + 0.3, -0.1)], 0.02, 0.006, bone)));
        const sh = new THREE.Shape(); sh.moveTo(0, 0);
        fingers.forEach(([x, y], i) => { const tx = sd * x * span * 0.62, ty = y * span * 0.45 + 0.3; sh.lineTo(tx, ty); if (i < fingers.length - 1) { const [nx, ny] = fingers[i + 1]; sh.quadraticCurveTo(sd * (x + nx) * span * 0.22, (y + ny) * span * 0.16 + 0.2, sd * nx * span * 0.62, ny * span * 0.45 + 0.3); } });
        sh.lineTo(0, -0.2); sh.lineTo(0, 0);
        const mem = new THREE.Mesh(new THREE.ShapeGeometry(sh, 6), new THREE.MeshLambertMaterial({ color: 0x4a1a20, side: THREE.DoubleSide }));
        mem.position.z = -0.08; piv.add(mem); piv.add(solid(Wp));
        C.attach(g, 'spine_03', piv, [sd * 0.09 * k, 0.12 * k, -0.12 * k], [0, sd * 0.5, 0], k);
        return piv;
      });
      g.userData.wings = wings; g.userData.eyes = eyes; g.userData.eyeGlow = eg;
      return g;
    };

    // The wraith over Cobh: a giant hooded figure, nearly black, eyes burning cold.
    K.wraith = function (o) {
      o = o || {};
      const g = rig({ parts: [['ranger_m', { color: 0x0c0e16 }]], body: 0x10121a, pose: o.pose || 'Spell_Simple_Idle_Loop', h: o.h || 16 }, o);
      const e = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.03), new THREE.MeshBasicMaterial({ color: 0xcfe8ff }));
      C.attach(g, 'Head', e, [0, 0.09 * (o.h || 16) / 1.8, 0.11 * (o.h || 16) / 1.8], null, (o.h || 16) / 1.8); g.userData.eyes = e;
      return g;
    };
  }
  return K;
};
})(typeof window !== 'undefined' ? window : globalThis);
