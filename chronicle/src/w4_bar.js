(function (root) {
'use strict';
const C = root.__cw, THREE = C.THREE;
const { TAU, clamp, sm, ss, M, bx, cy, cn, ic, tri, merge, part, solid, emis, lamb, R } = C;

/* The empty tavern: the permanent hub every story starts and ends in. */
C.buildBar = function (X) {
  const g = new THREE.Group(), Z0 = X.Z0, kit = C.kit(X);
  const wallMat = new THREE.MeshLambertMaterial({ map: X.TEX.plank, color: 0xb89a7a });
  const mk = (w, h, d, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat); m.position.set(x, y, z); g.add(m); return m; };
  mk(12.8, 4.2, 0.4, 0, 2.1, 5.7);
  mk(5.1, 4.2, 0.4, -3.85, 2.1, -10.2); mk(5.1, 4.2, 0.4, 3.85, 2.1, -10.2); mk(2.6, 1.2, 0.4, 0, 3.6, -10.2);
  mk(0.4, 4.2, 15.9, -6.2, 2.1, -2.25); mk(0.4, 4.2, 15.9, 6.2, 2.1, -2.25);
  const ft = X.TEX.plank.clone(); ft.needsUpdate = true; ft.repeat.set(3, 5);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 15.5), new THREE.MeshLambertMaterial({ map: ft, color: 0xcdb394 }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, -2.25); g.add(floor);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(12, 15.5), new THREE.MeshLambertMaterial({ color: 0x2a1d14 }));
  ceil.rotation.x = Math.PI / 2; ceil.position.set(0, 4.2, -2.25); g.add(ceil);

  const wood = 0x4a3222, dark = 0x2c1e14, stone = 0x3a3638;
  const P = [];
  [-8.5, -5, -1.5, 2, 5].forEach((z) => P.push(bx(12, 0.35, 0.35, dark, [0, 4.0, z])));
  P.push(bx(0.35, 0.35, 15.5, dark, [-3, 4.0, -2.25]), bx(0.35, 0.35, 15.5, dark, [3, 4.0, -2.25]));
  // fireplace on the left wall
  P.push(bx(1.0, 0.4, 3.2, stone, [-5.3, 0.2, -2.5]), bx(1.0, 2.6, 0.7, stone, [-5.3, 1.3, -4.0]), bx(1.0, 2.6, 0.7, stone, [-5.3, 1.3, -1.0]),
    bx(1.0, 0.5, 3.2, stone, [-5.3, 2.65, -2.5]), bx(0.8, 1.5, 2.6, stone, [-5.4, 3.65, -2.5]),
    cy(0.1, 0.1, 1.2, 6, 0x3a2a1c, [-5.2, 0.5, -2.8], [0, 0, Math.PI / 2]), cy(0.1, 0.1, 1.2, 6, 0x3a2a1c, [-5.2, 0.6, -2.2], [0.3, 0, Math.PI / 2]));
  // bar counter and shelves on the right
  P.push(bx(1.3, 1.1, 7.5, wood, [4.1, 0.55, -4.7]), bx(1.5, 0.1, 7.7, dark, [4.0, 1.12, -4.7]),
    bx(0.4, 0.08, 7, wood, [5.6, 1.9, -4.7]), bx(0.4, 0.08, 7, wood, [5.6, 2.6, -4.7]));
  for (let i = 0; i < 18; i++) {
    const col = [0x8a5a1a, 0x2a5a3a, 0x5a3a22, 0x7a2a2a][i % 4];
    P.push(cy(0.07, 0.08, 0.34, 6, col, [5.55, 2.1, -7.9 + i * 0.4]), cy(0.07, 0.08, 0.34, 6, col, [5.55, 2.8, -7.9 + i * 0.4 + 0.1]));
  }
  for (let i = 0; i < 6; i++) P.push(cy(0.09, 0.08, 0.16, 7, 0x9a9aa0, [3.95, 1.25, -7.4 + i * 1.15]));
  // stools, one knocked over
  [-7.2, -5.9, -4.6, -2.0].forEach((z) => P.push(cy(0.22, 0.22, 0.07, 8, wood, [2.7, 0.72, z]), cy(0.04, 0.05, 0.7, 5, dark, [2.7, 0.36, z])));
  P.push(cy(0.22, 0.22, 0.07, 8, wood, [2.4, 0.2, -3.3], [0, 0, Math.PI / 2]), cy(0.04, 0.05, 0.7, 5, dark, [2.75, 0.2, -3.3], [0, 0, Math.PI / 2]));
  // round tables with tankards and a few small chairs
  const tables = [[-3.2, -6.3], [-3.0, -0.8], [-2.8, 2.6]];
  tables.forEach((t) => {
    P.push(cy(0.9, 0.9, 0.08, 10, wood, [t[0], 0.8, t[1]]), cy(0.12, 0.16, 0.8, 6, dark, [t[0], 0.4, t[1]]));
    P.push(cy(0.07, 0.06, 0.14, 7, 0x9a9aa0, [t[0] + 0.4, 0.91, t[1] + 0.2]), cy(0.07, 0.06, 0.14, 7, 0x9a9aa0, [t[0] - 0.3, 0.91, t[1] - 0.3]));
    for (let k = 0; k < 3; k++) {
      const a = k * 2.1 + t[1], cx = t[0] + Math.cos(a) * 1.25, cz = t[1] + Math.sin(a) * 1.25;
      P.push(bx(0.5, 0.06, 0.5, wood, [cx, 0.48, cz], [0, -a, 0]), bx(0.5, 0.55, 0.05, wood, [cx + Math.cos(a) * 0.23, 0.8, cz + Math.sin(a) * 0.23], [0, -a + Math.PI / 2, 0]),
        cy(0.03, 0.03, 0.48, 5, dark, [cx, 0.24, cz]));
    }
  });
  g.add(solid(P));

  // hanging lanterns and the single red d20 on the middle table
  const lanternPos = [[-2.5, 3.1, -2], [2.2, 3.1, -6.5], [0, 3.1, 1.5]];
  const lm = new THREE.MeshBasicMaterial({ color: 0xffc880 });
  lanternPos.forEach((p) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.36, 0.28), lm); m.position.set(p[0], p[1], p[2]); g.add(m);
    const s = X.glow(0xffb060, 3.2, 0.7); s.position.set(p[0], p[1], p[2]); g.add(s);
    g.add(solid([cy(0.01, 0.01, 1.0, 4, 0x222222, [p[0], p[1] + 0.7, p[2]])]));
  });
  const d20 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.15, 0), new THREE.MeshBasicMaterial({ color: 0xa81818 }));
  d20.position.set(-3.0, 1.06, -0.8); g.add(d20);
  const d20g = X.glow(0xff3030, 0.9, 0.5); d20g.position.copy(d20.position); g.add(d20g);

  const fire = kit.fire({ scale: 1.1, size: 5 });
  fire.group.position.set(-5.2, 0.35, -2.5); g.add(fire.group);

  // windows: warm outside, dark blue inside
  const winIn = [], winOut = [];
  [-6, -1.5, 3].forEach((z) => {
    [[-1, 1], [1, -1]].forEach((s) => {
      const x = s[0] * 6.0;
      winIn.push(part(new THREE.PlaneGeometry(1.2, 1.5), 0x2a3a58, M([x - s[0] * 0.02, 2.0, z], [0, -s[0] * Math.PI / 2, 0])));
      winOut.push(part(new THREE.PlaneGeometry(1.2, 1.5), 0xffc878, M([x + s[0] * 0.43, 2.0, z], [0, s[0] * Math.PI / 2, 0])));
    });
  });
  g.add(emis(winIn)); g.add(emis(winOut));

  // exterior shell: roof, gables, door frame, porch lanterns
  const rise = 3.2, hd = 8.15, ang = Math.atan2(rise, hd), sl = Math.hypot(hd, rise) + 0.6;
  const shell = [
    bx(13.4, 0.3, sl, 0x2a2420, [0, 4.2 + rise / 2, -2.25 - hd / 2], [-ang, 0, 0]),
    bx(13.4, 0.3, sl, 0x2a2420, [0, 4.2 + rise / 2, -2.25 + hd / 2], [ang, 0, 0]),
    tri([-6.45, 4.2, -10.4], [-6.45, 4.2, 5.9], [-6.45, 4.2 + rise, -2.25], 0x4a3828), tri([6.45, 4.2, 5.9], [6.45, 4.2, -10.4], [6.45, 4.2 + rise, -2.25], 0x4a3828),
    bx(0.3, 3.4, 0.5, dark, [-1.45, 1.7, -10.3]), bx(0.3, 3.4, 0.5, dark, [1.45, 1.7, -10.3]),
    bx(0.6, 1.2, 0.6, 0x3a3236, [-4, 7.4, -2.5])
  ];
  g.add(solid(shell, { side: THREE.DoubleSide }));
  [-1.9, 1.9].forEach((x) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.28, 0.2), lm); m.position.set(x, 2.6, -10.55); g.add(m);
    const s = X.glow(0xffb060, 2.8, 0.8); s.position.copy(m.position); g.add(s);
  });

  // the door: hinge at x=-1.3, swings outward when the ride starts
  const door = new THREE.Group(); door.position.set(-1.3, 0, -10.0);
  door.add(solid([bx(2.6, 3.1, 0.15, 0x3a2818, [1.3, 1.55, 0]), bx(2.6, 0.12, 0.2, 0x2a2a30, [1.3, 0.7, 0]), bx(2.6, 0.12, 0.2, 0x2a2a30, [1.3, 2.4, 0]), bx(0.08, 0.3, 0.1, 0x8a8a90, [2.3, 1.5, 0.12])]));
  g.add(door);

  const colliders = [
    { x0: 3.15, x1: 6, z0: -8.8, z1: -0.8 }, { x0: -6, x1: -4.7, z0: -4.2, z1: -0.8 },
    { x: 0, z: Z0, r: 0.6 }, { x: 0, z: Z0 - 1.0, r: 0.55 }
  ];
  tables.forEach((t) => colliders.push({ x: t[0], z: t[1], r: 1.05 }));
  [-7.2, -5.9, -4.6, -2.0].forEach((z) => colliders.push({ x: 2.7, z, r: 0.35 }));

  return {
    group: g, colliders,
    update(t, ctx) {
      fire.update(ctx.time);
      const f = fire.flicker(ctx.time);
      d20.rotation.y = ctx.time * 0.4; d20.rotation.x = 0.4 + Math.sin(ctx.time * 0.3) * 0.1;
      d20g.material.opacity = 0.4 + 0.15 * Math.sin(ctx.time * 1.7);
      door.rotation.y = 1.5 * ss(0.3, 2.2, t);
      if (ctx.camD < 40) {
        ctx.light(0, -4.75, 0.9, -2.5, 0xff8a3a, 1.8 * f, 22);
        ctx.light(1, 1.0, 3.0, -3.5, 0xffc27a, 1.1, 26);
      }
    }
  };
};
})(typeof window !== 'undefined' ? window : globalThis);
