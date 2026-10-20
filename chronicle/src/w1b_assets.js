(function (root) {
'use strict';
const C = root.__cw, THREE = C.THREE;

/* Loaded art (CC0 Quaternius models + Poly Haven textures, packed by scripts/pack-assets.mjs).
   Everything here is optional: builders ask for a model/texture and fall back to procedural shapes when it is missing. */
const A = C.assets = { models: {}, tex: {}, chars: {}, clips: {}, creatures: {}, ready: false };
const DIM = { props: 0.68, village: 0.8 };  // colour scale per glb pack
/* Packs load on demand and every file only once: the tavern pack at start, a level's packs when its song is requested.
   A level lists what it needs in `packs` (s0_stories / level modules). */
const PACKS = {
  tavern: { glb: ['props'], tex: ['old_wood_floor', 'wood_plank_wall', 'rustic_stone_wall'], creatures: ['lute'],
    chars: ['body_m', 'body_f', 'ranger_m', 'peasant_m', 'ranger_f', 'peasant_f', 'hair_long', 'hair_beard', 'hair_buns', 'hair_parted', 'hair_buzzed', 'hair_buzzed_f'] },
  nature: { glb: ['nature'], tex: ['forest_ground_04'] },
  beasts: { creatures: ['wolf', 'dragon', 'bat', 'demon'] },
  village: { glb: ['village'], tex: ['cobblestone_floor_04', 'castle_brick_07'] }
};
C.PACKS = PACKS;
// asset base: next to the page, also when served as /chronicle (no trailing slash)
C.BASE = function () {
  if (typeof location === 'undefined') return '';
  return /\/$|\.html$/.test(location.pathname) ? location.href : location.href.replace(/[?#].*$/, '') + '/';
};

// glTF PBR -> Lambert with the same map/colour, so models sit in the existing flat-lit look.
// Textures stay in "display" space like the rest of the scene (renderer output is linear).
function toLambert(m, skinning) {
  if (m.map) m.map.encoding = THREE.LinearEncoding;
  const masked = m.alphaTest > 0 || m.transparent;
  return new THREE.MeshLambertMaterial({ map: m.map || null, color: m.color, side: m.side, alphaTest: masked ? Math.max(0.5, m.alphaTest) : 0, name: m.name, skinning: !!skinning });
}
function prep(node, dim) {
  const cache = new Map();
  node.traverse((o) => {
    if (!o.isMesh) return;
    o.material = [].concat(o.material).map((m) => { if (!cache.has(m)) { const l = toLambert(m, o.isSkinnedMesh); if (dim) l.color.multiplyScalar(dim); cache.set(m, l); } return cache.get(m); });
    if (o.material.length === 1) o.material = o.material[0];
  });
  node.position.set(0, 0, 0); node.updateMatrixWorld(true);
  node.userData.box = new THREE.Box3().setFromObject(node);
  return node;
}

// The free base body is a full figure; outfits are worn over it and its skin pokes through.
// Keep only the triangles skinned (mostly) to the head and neck, so the outfit carries the rest.
function headOnly(root) {
  root.traverse((o) => {
    if (!o.isSkinnedMesh || !/SuperHero/i.test(o.name)) return;
    const g = o.geometry, si = g.attributes.skinIndex, sw = g.attributes.skinWeight, bones = o.skeleton.bones;
    const comp = (at, v, k) => (k === 0 ? at.getX(v) : k === 1 ? at.getY(v) : k === 2 ? at.getZ(v) : at.getW(v));  // r128 has no getComponent
    const keep = (v) => { let best = 0, bi = 0; for (let k = 0; k < 4; k++) { const w = comp(sw, v, k); if (w > best) { best = w; bi = comp(si, v, k); } } return /^(Head|neck_0\d)$/.test(bones[bi].name); };
    const idx = g.index ? g.index.array : null, n = idx ? idx.length : g.attributes.position.count, out = [];
    for (let i = 0; i < n; i += 3) {
      const a = idx ? idx[i] : i, b = idx ? idx[i + 1] : i + 1, c = idx ? idx[i + 2] : i + 2;
      if (keep(a) && keep(b) && keep(c)) out.push(a, b, c);
    }
    g.setIndex(out);
  });
}

const once = {};  // url -> Promise, so shared files download once
function loadFile(kind, name) {
  const base = C.BASE(), key = kind + ':' + name;
  if (once[key]) return once[key];
  const gl = new THREE.GLTFLoader(), tl = new THREE.TextureLoader();
  const safe = (fn, res) => (x) => { try { fn(x); } catch (e) { console.warn('asset', name, e); } res(); };
  return (once[key] = new Promise((res) => {
    if (kind === 'glb') gl.load(new URL('assets/' + name + '.glb', base).href,
      safe((g) => { g.scene.children.slice().forEach((c) => { A.models[c.name] = prep(c, DIM[name]); }); }, res), undefined, () => res());
    else if (kind === 'tex') tl.load(new URL('assets/tex/' + name + '_diff.jpg', base).href,
      safe((t) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; A.tex[name + '_diff'] = t; }, res), undefined, () => res());
    else if (kind === 'char') gl.load(new URL('assets/chars/' + name + '.glb', base).href,
      safe((g) => { A.chars[name] = prep(g.scene, 0.85); if (/^body_/.test(name)) headOnly(A.chars[name]); }, res), undefined, () => res());
    else if (kind === 'creature') gl.load(new URL('assets/creatures/' + name + '.glb', base).href,
      safe((g) => { A.creatures[name] = { scene: prep(g.scene), clips: g.animations }; }, res), undefined, () => res());
    else if (kind === 'anims') gl.load(new URL('assets/chars/anims.glb', base).href,
      safe((g) => { g.animations.forEach((c) => { A.clips[c.name] = c; }); }, res), undefined, () => res());
  }));
}
/* load packs by name; onProgress(0..1). Resolves even if files fail (builders fall back). */
C.loadPacks = function (names, onProgress) {
  if (!THREE.GLTFLoader || typeof document === 'undefined') return Promise.resolve();
  const files = [];
  [].concat(names || []).forEach((n) => {
    const p = PACKS[n]; if (!p) return;
    (p.glb || []).forEach((f) => files.push(['glb', f]));
    (p.tex || []).forEach((f) => files.push(['tex', f]));
    (p.creatures || []).forEach((f) => files.push(['creature', f]));
    if (THREE.SkeletonUtils && p.chars) { p.chars.forEach((f) => files.push(['char', f])); files.push(['anims', 'anims']); }
  });
  let done = 0; const tick = () => { done++; if (onProgress) onProgress(done / Math.max(1, files.length)); };
  if (!files.length && onProgress) onProgress(1);
  return Promise.all(files.map(([k, f]) => loadFile(k, f).then(tick)));
};
C.loadAssets = (onProgress) => C.loadPacks(['tavern'], onProgress).then(() => { A.ready = true; });

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
C.instModel = function (key, mats, o) { return A.models[key] ? C.instObject(A.models[key], mats, o) : null; };
C.instObject = function (src, mats, o) {
  if (!src || !mats.length) return null;
  if (!src.userData.box) src.userData.box = new THREE.Box3().setFromObject(src);
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

/* Rigged character from the CC0 base body + outfit/hair parts, all bound to the body's skeleton.
   spec: { parts: [[key, tint, skipRegex, onlyRegex]], body: tint, pose: clip name, h: height in m }
   tint: hex (multiplies the texture) or { color, only: materialNameRegex } (solid colour, texture dropped)
   Returns a Group (front +z) with userData.mixer, or null when the character files are missing. */
C.hasChars = () => !!(A.chars.body_m && THREE.SkeletonUtils);
const HEIGHT = {};  // body key -> model height
C.rigChar = function (spec) {
  if (!C.hasChars()) return null;
  const tinted = (mesh, tint) => {
    if (tint === undefined || tint === null) return;
    const flat = typeof tint === 'object', c = new THREE.Color(flat ? tint.color : tint);
    mesh.material = [].concat(mesh.material).map((m) => {
      const y = m.clone();
      if (flat && (!tint.only || tint.only.test(m.name))) { y.map = null; y.color.copy(c); } else if (!flat) y.color.multiply(c);
      return y;
    });
    if (mesh.material.length === 1) mesh.material = mesh.material[0];
  };
  const bodyKey = spec.base || 'body_m', src = A.chars[bodyKey] || A.chars.body_m;
  const body = THREE.SkeletonUtils.clone(src), bones = {};
  let arm = null;
  body.traverse((o) => { if (o.isBone) bones[o.name] = o; if (o.isSkinnedMesh) { arm = arm || o.parent; tinted(o, spec.body); } });
  (spec.parts || []).forEach(([key, tint, skip, only]) => {
    const src = A.chars[key]; if (!src) return;
    const part = THREE.SkeletonUtils.clone(src), meshes = [];
    part.traverse((o) => { if (o.isSkinnedMesh && !(skip && skip.test(o.name)) && !(only && !only.test(o.name))) meshes.push(o); });
    meshes.forEach((m) => {
      const sk = m.skeleton;
      m.bind(new THREE.Skeleton(sk.bones.map((b) => bones[b.name] || b), sk.boneInverses), m.bindMatrix);
      tinted(m, tint); arm.add(m);
    });
  });
  body.traverse((o) => { if (o.isMesh) o.frustumCulled = false; });
  const g = new THREE.Group(); g.add(body);
  if (!HEIGHT[bodyKey]) { const box = new THREE.Box3().setFromObject(src); HEIGHT[bodyKey] = box.max.y - box.min.y; }  // full-body bounds (the index cut does not change them)
  const hh = HEIGHT[bodyKey];
  body.scale.setScalar((spec.h || 1.8) / hh);
  const mixer = new THREE.AnimationMixer(body);
  let cur = null;
  g.userData.pose = (name) => {
    const clip = A.clips[name] || A.clips.Idle_Loop; if (!clip || cur === clip.name) return;
    mixer.stopAllAction(); mixer.clipAction(clip).play(); cur = clip.name;
  };
  g.userData.pose(spec.pose || 'Idle_Loop');
  g.userData.mixer = mixer; g.userData.bones = bones; g.userData.ph = Math.random() * 3;
  g.updateMatrixWorld(true);
  return g;
};
/* An animated creature or prop from creatures/*.glb. o: { clip, h (height in m) or scale, tint, ph }.
   Returns a Group (+z front) with userData.mixer/pose like rigChar (register it in X.anims to animate), or null. */
C.hasCreature = (key) => !!A.creatures[key];
C.creature = function (key, o) {
  const src = A.creatures[key]; if (!src || !THREE.SkeletonUtils) return null;
  o = o || {};
  const body = THREE.SkeletonUtils.clone(src.scene), g = new THREE.Group(), bones = {};
  body.traverse((m) => {
    if (m.isBone) bones[m.name] = m;
    if (!m.isMesh) return;
    m.frustumCulled = false;
    if (o.tint !== undefined || o.eyes !== undefined) {
      const c = new THREE.Color(o.tint === undefined ? 0xffffff : o.tint);
      m.material = [].concat(m.material).map((x) => {
        // o.eyes: the cartoon eyes of the CC0 monsters become glowing slits (menace instead of cute)
        if (o.eyes !== undefined && /Eye_White/i.test(x.name)) return new THREE.MeshBasicMaterial({ color: o.eyes, skinning: x.skinning });
        if (o.eyes !== undefined && /Eye_Black/i.test(x.name)) return new THREE.MeshBasicMaterial({ color: 0x000000, skinning: x.skinning });
        const y = x.clone(); y.color.multiply(c); return y;
      });
      if (m.material.length === 1) m.material = m.material[0];
    }
  });
  const box = new THREE.Box3().setFromObject(src.scene), hh = Math.max(1e-3, box.max.y - box.min.y);
  body.scale.multiplyScalar(o.h ? o.h / hh : (o.scale || 1));
  g.add(body);
  const mixer = new THREE.AnimationMixer(body); let cur = null;
  g.userData.pose = (name) => {
    const clip = src.clips.find((c) => c.name === name) || src.clips[0]; if (!clip || cur === clip.name) return;
    mixer.stopAllAction(); mixer.clipAction(clip).play(); cur = clip.name;
  };
  if (src.clips.length) g.userData.pose(o.clip);
  g.userData.mixer = mixer; g.userData.bones = bones; g.userData.ph = o.ph === undefined ? Math.random() * 3 : o.ph;
  return g;
};

/* Freeze a rigged character in one frame of a clip into plain static meshes (for big instanced crowds).
   spec as rigChar; returns an Object3D whose meshes can go through C.instObject. */
C.bakeRig = function (rig, clip, time) {
  if (!rig) return null;
  if (clip) rig.userData.pose(clip);
  rig.userData.mixer.setTime(time || 0); rig.updateMatrixWorld(true);
  const out = new THREE.Group(), v = new THREE.Vector3(), inv = new THREE.Matrix4().copy(rig.matrixWorld).invert();
  rig.traverse((m) => {
    if (!m.isSkinnedMesh || !m.visible) return;
    const g = m.geometry, n = g.attributes.position.count, pos = new Float32Array(n * 3), mw = new THREE.Matrix4().multiplyMatrices(inv, m.matrixWorld);
    m.skeleton.update();
    for (let i = 0; i < n; i++) { v.fromBufferAttribute(g.attributes.position, i); m.boneTransform(i, v); v.applyMatrix4(mw); pos[i * 3] = v.x; pos[i * 3 + 1] = v.y; pos[i * 3 + 2] = v.z; }
    const ng = new THREE.BufferGeometry(); ng.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    if (g.attributes.uv) ng.setAttribute('uv', g.attributes.uv);
    if (g.index) ng.setIndex(g.index);
    ng.computeVertexNormals();
    const mat = [].concat(m.material).map((x) => { const y = x.clone(); y.skinning = false; return y; });
    out.add(new THREE.Mesh(ng, mat.length === 1 ? mat[0] : mat));
  });
  return out;
};

/* attach an object to a bone of a rigged character (bone space is scaled with the body) */
C.attach = function (ch, bone, obj, p, r, s) {
  const b = ch.userData.bones && ch.userData.bones[bone]; if (!b) return null;
  ch.updateMatrixWorld(true);
  const inv = 1 / b.getWorldScale(new THREE.Vector3()).x;  // undo the body scale so props keep their size in metres
  obj.position.set(p[0], p[1], p[2]).multiplyScalar(inv); if (r) obj.rotation.set(r[0], r[1], r[2]); obj.scale.multiplyScalar((s || 1) * inv);
  b.add(obj); return obj;
};
})(typeof window !== 'undefined' ? window : globalThis);
