(function (root) {
'use strict';
const C = root.__cw, THREE = C.THREE;

/* Loaded art (CC0 Quaternius models + Poly Haven textures, packed by scripts/pack-assets.mjs).
   Everything here is optional: builders ask for a model/texture and fall back to procedural shapes when it is missing. */
const A = C.assets = { models: {}, tex: {}, ready: false };
const GLB = ['nature', 'props', 'village'];
const DIM = { props: 0.68, village: 0.8 };  // colour scale per pack
const TEX = ['old_wood_floor', 'wood_plank_wall', 'rustic_stone_wall', 'forest_ground_04', 'cobblestone_floor_04', 'castle_brick_07'];

// asset base: next to the page, also when served as /chronicle (no trailing slash)
C.BASE = function () {
  if (typeof location === 'undefined') return '';
  return /\/$|\.html$/.test(location.pathname) ? location.href : location.href.replace(/[?#].*$/, '') + '/';
};

// glTF PBR -> Lambert with the same map/colour, so models sit in the existing flat-lit look.
// Textures stay in "display" space like the rest of the scene (renderer output is linear).
function toLambert(m) {
  if (m.map) m.map.encoding = THREE.LinearEncoding;
  const masked = m.alphaTest > 0 || m.transparent;
  return new THREE.MeshLambertMaterial({ map: m.map || null, color: m.color, side: m.side, alphaTest: masked ? Math.max(0.5, m.alphaTest) : 0, name: m.name });
}
function prep(node, dim) {
  const cache = new Map();
  node.traverse((o) => {
    if (!o.isMesh) return;
    o.material = [].concat(o.material).map((m) => { if (!cache.has(m)) { const l = toLambert(m); if (dim) l.color.multiplyScalar(dim); cache.set(m, l); } return cache.get(m); });
    if (o.material.length === 1) o.material = o.material[0];
  });
  node.position.set(0, 0, 0); node.updateMatrixWorld(true);
  node.userData.box = new THREE.Box3().setFromObject(node);
  return node;
}

C.loadAssets = function (onProgress) {
  if (!THREE.GLTFLoader || typeof document === 'undefined') return Promise.resolve();
  const base = C.BASE(), jobs = [];
  let done = 0, total = GLB.length + TEX.length * 2;
  const tick = () => { done++; if (onProgress) onProgress(done / total); };
  const gl = new THREE.GLTFLoader(), tl = new THREE.TextureLoader();
  GLB.forEach((n) => jobs.push(new Promise((res) => gl.load(new URL('assets/' + n + '.glb', base).href,
    (g) => { g.scene.children.slice().forEach((c) => { A.models[c.name] = prep(c, DIM[n]); }); tick(); res(); },
    undefined, () => { tick(); res(); }))));
  TEX.forEach((n) => ['diff', 'nor'].forEach((k) => jobs.push(new Promise((res) => tl.load(new URL('assets/tex/' + n + '_' + k + '.jpg', base).href,
    (t) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; A.tex[n + '_' + k] = t; tick(); res(); },
    undefined, () => { tick(); res(); })))));
  return Promise.all(jobs).then(() => { A.ready = true; });
};

/* a cloned texture with its own repeat, or null */
C.tex = function (name, rx, ry) {
  const t = A.tex[name]; if (!t) return null;
  const c = t.clone(); c.needsUpdate = true; c.repeat.set(rx || 1, ry === undefined ? (rx || 1) : ry); return c;
};
/* a model instance (shares geometry and materials), or null */
C.model = function (key) { const m = A.models[key]; return m ? m.clone() : null; };
C.hasModel = (key) => !!A.models[key];
C.modelSize = function (key) { const m = A.models[key]; if (!m) return null; const s = new THREE.Vector3(); m.userData.box.getSize(s); return s; };

/* Many copies of one model as InstancedMeshes (one per mesh part). mats: Matrix4 list in world space.
   o.tint multiplies material colours (cloned per call); o.norm scales the model so its height is 1 (then mats scale to metres). */
C.instModel = function (key, mats, o) {
  const src = A.models[key]; if (!src || !mats.length) return null;
  o = o || {};
  const g = new THREE.Group(), tint = o.tint !== undefined ? new THREE.Color(o.tint) : null;
  const h = o.norm ? Math.max(1e-3, src.userData.box.max.y - src.userData.box.min.y) : 1;
  const pre = new THREE.Matrix4().makeScale(1 / h, 1 / h, 1 / h), tmp = new THREE.Matrix4();
  src.updateMatrixWorld(true);
  src.traverse((m) => {
    if (!m.isMesh) return;
    let mat = m.material;
    if (tint) mat = [].concat(mat).map((x) => { const y = x.clone(); y.color.multiply(tint); return y; });
    if (Array.isArray(mat) && mat.length === 1) mat = mat[0];
    const im = new THREE.InstancedMesh(m.geometry, mat, mats.length);
    const local = new THREE.Matrix4().multiplyMatrices(pre, m.matrixWorld);
    mats.forEach((w, i) => im.setMatrixAt(i, tmp.multiplyMatrices(w, local)));
    im.instanceMatrix.needsUpdate = true; im.frustumCulled = false;
    g.add(im);
  });
  return g;
};
/* place one model: position [x,y,z], yaw, uniform scale */
C.place = function (key, p, yaw, s) {
  const m = C.model(key); if (!m) return null;
  m.position.set(p[0], p[1], p[2]); m.rotation.y = yaw || 0; if (s) m.scale.setScalar(s); return m;
};
})(typeof window !== 'undefined' ? window : globalThis);
