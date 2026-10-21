(function (root) {
'use strict';
const C = root.__cw, THREE = C.THREE;
const { TAU, R, M, bx, cy, cn, ic, solid, lerp } = C;
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

/* Story kit shared by level modules (C.lib): props on the ground, rail paths, bodies, Severin, the pig, the blood troll,
   the shapeshifting druids, and caves. Builders return null (or a stand-in) when the art is missing, so npm test runs bare. */
const L = C.lib = {};

// the party builders, plus a stand-in person when the character art is missing
L.chars = function (X) {
  const ch = C.chars(X); if (ch.person) return ch;
  const o = Object.create(ch);
  o.person = (p) => { const g = new THREE.Group(); g.add(solid([cy(0.22, 0.26, 1.2, 6, (p && p.tint) || 0x6a5a4a, [0, 0.8, 0]), ic(0.18, 1, 0xc8a080, [0, 1.6, 0])])); g.userData.pose = () => {}; return g; };
  return o;
};
// a pack prop standing on p, h metres tall
L.put = function (g, key, p, yaw, h) {
  if (!C.hasModel(key)) return null;
  const o = C.place(key, [p.x, p.y || 0, p.z], yaw || 0, h / C.modelSize(key).y); g.add(o); return o;
};
// points along the rail every 3 m from d0 to d1 at a side offset, always ending exactly on d1
L.railPts = function (X, d0, d1, side, y) {
  const pts = [], st = d1 > d0 ? 3 : -3;
  for (let d = d0; st > 0 ? d < d1 : d > d1; d += st) pts.push(X.at(d, side, y || 0));
  pts.push(X.at(d1, side, y || 0)); return pts;
};
// a body on the floor: a rig baked in a pose, laid on its back (static). rig = a person/party rig built with { bake: true }
L.lay = function (rig, clip, tm) {
  if (!rig || !rig.userData.mixer) return null;
  const b = C.bakeRig(rig, clip || 'Idle_Loop', tm || 0.4); if (!b) return null;
  const g = new THREE.Group(); b.rotation.x = -Math.PI / 2; b.position.set(0, 0.12, -(rig.userData.h || 1.8) * 0.5); g.add(b); return g;
};
L.corpse = function (ch, seed, tint) { return L.lay(ch.person && ch.person({ bake: true, seed, female: false, tint })); };

// Severin: pale, white-haired, in the black-green of the pines, eyes like cold lamps. o.crown: her pale crown
L.severin = function (X, ch, o) {
  o = o || {};
  const s = ch.person({ seed: 777, female: true, outfit: 'ranger', tint: 0x1a2a24, hair: 'hair_long', hairTint: 0xe6e8ee, pose: o.pose || 'Idle_Loop' });
  s.traverse((m) => { if (m.isMesh) [].concat(m.material).forEach((x) => { if (x.color && /Body|Skin|Superhero/i.test(x.name)) x.color.multiplyScalar(1.25); }); });
  [-0.032, 0.032].forEach((x) => { const e = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.012, 0.02), new THREE.MeshBasicMaterial({ color: 0xb0ffe0 })); C.attach(s, 'Head', e, [x, 0.075, 0.1]); });
  if (o.crown) {
    const P = []; for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; P.push(cn(0.008, i % 2 ? 0.035 : 0.06, 4, 0xe8f4ff, [Math.sin(a) * 0.075, 0.025, Math.cos(a) * 0.075])); }
    P.push(cy(0.078, 0.078, 0.015, 12, 0xd8e8f0, [0, 0, 0]));
    C.attach(s, 'Head', solid(P), [0, 0.16, 0.0], [-0.15, 0, 0]);
    const cg = X.glow(0xc8fff0, 0.35, 0.45); C.attach(s, 'Head', cg, [0, 0.2, 0]);
  }
  const aura = X.glow(0x70ffc8, 2.6, 0.25); aura.position.y = 1.2; s.add(aura); s.userData.aura = aura;
  s.userData.label = 'severin';
  return s;
};

/* big rigged brutes on the base body (like Baphomet in w3b_chars). Not animated when o.bake. */
function brute(X, spec, o) {
  if (!C.hasChars || !C.hasChars() || !C.rigChar) return null;
  const g = C.rigChar(spec); if (!g) return null;
  if (!(o && o.bake)) X.anims.push(g);
  if (o && o.wide) { const b = g.children[0]; b.scale.x *= o.wide[0]; b.scale.z *= o.wide[1]; }
  return g;
}
const glowEyes = (X, g, color, dx, y, z, k) => [-dx, dx].map((x) => {
  const e = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.018, 0.02), new THREE.MeshBasicMaterial({ color })); C.attach(g, 'Head', e, [x * k, y * k, z * k], null, k); return e;
});

/* The Pig: a humanoid boar, a butcher with a broadaxe (h 2.6 m). userData.axe, eyes, eyeGlow. */
L.pig = function (X, o) {
  o = o || {};
  const H = o.h || 3.0, k = H / 1.8, skin = o.skin || 0xd0726a;
  const g = brute(X, { parts: [['peasant_m', { color: skin }]], body: skin, pose: o.pose || 'Idle_Loop', h: H }, { bake: o.bake, wide: [1.6, 1.5] });
  if (!g) return null;
  const dark = 0x5a2a28;
  // boar head over the human head: heavy jowls, long snout, tusks, floppy ears, bristles
  const P = [
    ic(0.15, 1, skin, [0, 0.06, 0.02], [1.15, 1.0, 1.15]),
    cy(0.075, 0.095, 0.17, 8, skin, [0, 0.04, 0.17], [Math.PI / 2, 0, 0]),
    cy(0.078, 0.078, 0.015, 10, 0xa86a64, [0, 0.04, 0.26], [Math.PI / 2, 0, 0]),
    bx(0.02, 0.03, 0.01, 0x2a1414, [-0.025, 0.045, 0.268]), bx(0.02, 0.03, 0.01, 0x2a1414, [0.025, 0.045, 0.268]),
    cn(0.018, 0.09, 4, 0xf0e8d0, [-0.07, 0.0, 0.2], [-0.4, 0, 0.5]), cn(0.018, 0.09, 4, 0xf0e8d0, [0.07, 0.0, 0.2], [-0.4, 0, -0.5]),
    cn(0.06, 0.13, 4, skin, [-0.13, 0.17, 0.0], [0.6, 0, 1.0]), cn(0.06, 0.13, 4, skin, [0.13, 0.17, 0.0], [0.6, 0, -1.0]),
    bx(0.22, 0.03, 0.06, dark, [0, 0.13, 0.13], [0.2, 0, 0])
  ];
  for (let i = 0; i < 7; i++) P.push(cn(0.012, 0.08, 3, 0x3a2420, [lerp(-0.06, 0.06, i / 6), 0.2, -0.04 - i * 0.012], [-0.6, 0, 0]));
  C.attach(g, 'Head', solid(P), [0, 0, 0.02 * k], null, k);
  const eyes = glowEyes(X, g, 0xff2010, 0.05, 0.1, 0.15, k);
  const eg = X.glow(0xff2a10, 0.35 * k, 0.8); C.attach(g, 'Head', eg, [0, 0.1 * k, 0.18 * k]);
  // the butcher's apron, bloodied
  C.attach(g, 'spine_02', solid([bx(0.46, 0.7, 0.02, 0x4a3a2c, [0, -0.2, 0]), bx(0.2, 0.25, 0.022, 0x6a1010, [0.08, -0.32, 0.002]), bx(0.12, 0.1, 0.022, 0x6a1010, [-0.12, -0.05, 0.002])]), [0, 0, 0.21 * k], null, k);
  // the broadaxe: long haft, a great crescent blade
  const axe = new THREE.Group();
  axe.add(solid([cy(0.022, 0.028, 1.5, 6, 0x3a2416, [0, 0.35, 0]), cy(0.032, 0.032, 0.08, 6, 0x6a6a72, [0, 1.06, 0]),
    bx(0.04, 0.5, 0.42, 0x8a8c94, [0, 0.98, 0.24]), bx(0.045, 0.56, 0.06, 0xc8ccd4, [0, 0.98, 0.46]), cn(0.05, 0.16, 4, 0x8a8c94, [0, 0.98, -0.1], [-Math.PI / 2, 0, 0]),
    bx(0.05, 0.16, 0.2, 0x6a1010, [0, 0.86, 0.32])]));
  C.attach(g, 'hand_r', axe, [0, 0.05, 0], [0, 0, 0], k);
  g.userData.axe = axe; g.userData.eyes = eyes; g.userData.eyeGlow = eg; g.userData.label = 'pig';
  return g;
};

/* A blood troll: hulking, dark red, tusked, burning eyes (h 3.3 m). */
L.troll = function (X, o) {
  o = o || {};
  const H = o.h || 3.3, k = H / 1.8, skin = 0x6a2a24;
  const g = brute(X, { parts: [['peasant_m', { color: skin }], ['hair_buzzed', 0x1a1010]], body: skin, pose: o.pose || 'Idle_Loop', h: H }, { bake: o.bake, wide: [1.3, 1.2] });
  if (!g) return null;
  // a hide loincloth and belt over the bare red body
  C.attach(g, 'spine_01', solid([bx(0.44, 0.1, 0.3, 0x2a1a12, [0, -0.02, 0]), bx(0.3, 0.4, 0.03, 0x3a2418, [0, -0.25, 0.15])]), [0, 0, 0], null, k);
  const P = [cn(0.04, 0.16, 5, skin, [0, 0.05, 0.15], [Math.PI / 2 + 0.4, 0, 0]), bx(0.24, 0.05, 0.08, 0x3a1410, [0, 0.12, 0.11]),
    cn(0.02, 0.1, 4, 0xe8dcc0, [-0.06, -0.06, 0.13], [0.3, 0, 0]), cn(0.02, 0.1, 4, 0xe8dcc0, [0.06, -0.06, 0.13], [0.3, 0, 0]),
    cn(0.04, 0.14, 4, skin, [-0.14, 0.08, -0.02], [0, 0, 1.3]), cn(0.04, 0.14, 4, skin, [0.14, 0.08, -0.02], [0, 0, -1.3])];
  C.attach(g, 'Head', solid(P), [0, 0, 0], null, k);
  glowEyes(X, g, 0xff3a10, 0.05, 0.1, 0.15, k);
  g.userData.label = 'troll';
  return g;
};
L.trollSkin = function (g) {  // the bare skin of the troll (the outfit's skin parts)
  if (g) g.traverse((m) => { if (m.isMesh) [].concat(m.material).forEach((x) => { if (x.color && /Skin|Body|Superhero/i.test(x.name)) x.color.setHex(0x6a2a24); }); });
};

/* An evil druid: hooded, near black, bone antlers, green eyes. Shapeshifts (the level swaps in a creature). */
L.druid = function (X, o) {
  o = o || {};
  const g = brute(X, { parts: [['ranger_m', { color: 0x1a2016 }]], body: 0x2a2a20, pose: o.pose || 'Idle_Loop', h: o.h || 1.9 }, o);
  if (!g) return null;
  const P = [];
  [-1, 1].forEach((s) => { P.push(cy(0.012, 0.016, 0.22, 4, 0xd8ccb0, [s * 0.07, 0.24, -0.02], [0, 0, -s * 0.5]), cy(0.008, 0.01, 0.12, 4, 0xd8ccb0, [s * 0.15, 0.36, -0.02], [0, 0, -s * 1.1]), cy(0.008, 0.01, 0.1, 4, 0xd8ccb0, [s * 0.1, 0.4, -0.02], [0, 0, -s * 0.1])); });
  C.attach(g, 'Head', solid(P), [0, 0, 0]);
  glowEyes(X, g, 0x80ff60, 0.035, 0.075, 0.1, 1);
  g.userData.label = 'druid';
  return g;
};

/* The High Inquisitor (Arthas and Cedric's father): tall, white and gold robes, a red stole, grey beard, a mitre. */
L.inquisitor = function (X, o) {
  o = o || {};
  const g = brute(X, { parts: [['ranger_m', { color: 0xe8e0cc }, /Hood/], ['hair_beard', 0xb8b4ac], ['hair_parted', 0xb8b4ac]], body: 0xd8b8a0, pose: o.pose || 'Idle_Loop', h: o.h || 1.95 }, o);
  if (!g) return null;
  C.attach(g, 'Head', solid([cn(0.11, 0.3, 4, 0xf0e8d8, [0, 0.27, -0.01], [0, Math.PI / 4, 0]), bx(0.02, 0.28, 0.13, 0xc8a040, [0, 0.25, 0.06]), cy(0.11, 0.11, 0.04, 8, 0xc8a040, [0, 0.13, -0.01])]), [0, 0, 0]);
  C.attach(g, 'spine_03', solid([bx(0.07, 0.75, 0.02, 0x9a1a1a, [-0.09, -0.3, 0]), bx(0.07, 0.75, 0.02, 0x9a1a1a, [0.09, -0.3, 0]), bx(0.06, 0.06, 0.03, 0xc8a040, [0.09, -0.2, 0.01])]), [0, 0, 0.16]);
  g.userData.label = 'inquisitor';
  return g;
};
// a puff of dark smoke (normal blending, so it darkens what is behind it)
L.smoke = function (X, color, size, op) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: X.glow(0xffffff, 1, 1).material.map, color: color || 0x161414, transparent: true, opacity: op === undefined ? 0.5 : op, depthWrite: false }));
  s.scale.set(size || 3, size || 3, 1); return s;
};

/* Cave: rock walls both sides, a low black ceiling with stalactites, glowing fungi, from rail distance d0 to d1.
   o: { w (half width), h (ceiling), tint } */
L.cave = function (X, d0, d1, o) {
  o = o || {};
  const g = new THREE.Group(), W = o.w || 7, Hc = o.h || 8, rocks = {}, add = (k, m) => (rocks[k] = rocks[k] || []).push(m);
  const keys = ['Rock_Medium_1', 'Rock_Medium_2', 'Rock_Medium_3'].filter((k) => C.hasModel(k));
  const roof = [], drip = [];
  for (let d = d0; d < d1; d += 3.2) {
    const yaw = X.yawAt(d), w = W * (o.wFn ? o.wFn(d) : 1);
    [-1, 1].forEach((s) => {
      for (let j = 0; j < 2; j++) {
        const p = X.at(d + R(-1, 1), s * (w + R(0.5, 2.5) + j * 2.5), 0), h = R(4, 7) + j * 2;
        if (keys.length) { const k = keys[Math.floor(R(0, keys.length - 0.001))], sz = C.modelSize(k); add(k, M([p.x, -0.4, p.z], [R(-0.2, 0.2), R(0, TAU), R(-0.2, 0.2)], [h / sz.y * R(0.9, 1.4), h / sz.y, h / sz.y * R(0.9, 1.4)])); }
        else roof.push(ic(h * 0.5, 0, 0x3a3634, [p.x, h * 0.4, p.z], [1, 1.2, 1]));
      }
    });
    const c = X.at(d, 0, Hc), hc = Hc * (o.hFn ? o.hFn(d) : 1);
    roof.push(bx(w * 2 + 10, 1.5, 3.4, 0x14110f, [c.x, hc + 0.6, c.z], [0, yaw, 0]));
    for (let i = 0; i < 3; i++) { const p = X.at(d + R(-1.5, 1.5), R(-w, w), 0); const l = R(0.6, 2.2); drip.push(cn(R(0.12, 0.35), l, 5, 0x2a2624, [p.x, hc - l / 2, p.z], [Math.PI, 0, 0])); }
  }
  Object.keys(rocks).forEach((k) => { const m = C.instModel(k, rocks[k], { tint: o.tint || 0x6a6460 }); if (m) g.add(m); });
  g.add(solid(roof.concat(drip)));
  // glowing fungi on the walls
  const glows = [];
  for (let d = d0 + 2; d < d1; d += R(5, 9)) { const s = R(0, 1) < 0.5 ? -1 : 1, p = X.at(d, s * R(W - 1.5, W - 0.5), R(0.2, 2.5)); const gl = X.glow(o.fungus || 0x40e0c0, R(0.5, 1.1), 0.7); gl.position.copy(p); g.add(gl); glows.push(gl); }
  g.userData.glows = glows;
  return g;
};
})(typeof window !== 'undefined' ? window : globalThis);
