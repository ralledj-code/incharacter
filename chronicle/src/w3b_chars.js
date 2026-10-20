(function (root) {
'use strict';
const C = root.__cw, THREE = C.THREE;
const { TAU, M, bx, cy, cn, ic, solid } = C;

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
  return K;
};
})(typeof window !== 'undefined' ? window : globalThis);
