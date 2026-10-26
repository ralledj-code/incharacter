(function (root) {
'use strict';
const C = root.__cw, THREE = C.THREE;
const { clamp, lerp } = C;
/* Painted levels (Burdens of Shaohao style): every shot is one painting with a depth map, shown as a displaced
   mesh so a slow camera drift gives real parallax. On top: particles, drifting fog, firelight flicker, wind sway
   in the foreground, ink/fade/flash transitions and a post pass (grade, vignette, grain, letterbox).
   Storyboards: chronicle/painted/<NN-id>.json (built into C.boards). Art: levels/<NN-id>/<shot>.webp + <shot>_d.png
   (scripts/paint.mjs paints, scripts/layers.py makes the web images and depth). A shot without art shows its
   storyboard card, so timing can be checked before anything is painted. */
C.boards = C.boards || {};

const PW = 16, PH = 9, FOV = 36, TAN = Math.tan(FOV * Math.PI / 360), DEPTH = 2.1, MOVE = 1.4, ORBIT = 0.4;  // ORBIT: how far the camera turns back toward the centre while it drifts (parallax)
const TRANS = { cut: 0, fade: 1.2, ink: 1.5, black: 1.6, flash: 0 };
const KIND = { cut: 0, fade: 1, ink: 2, black: 3, flash: 0 };
const GRADE = { red: [1.12, 0.86, 0.84], cold: [0.88, 0.98, 1.14], green: [0.9, 1.06, 0.98], none: [1, 1, 1] };
// particle looks: colour, size (world units at 1 m), velocity, wobble, twinkle rate, alpha, count
const FX = {
  embers: [0xff9a3a, 0.11, [0.06, 0.45, 0.02], 0.32, 6, 1.0, 220],
  sparks: [0xffd27a, 0.05, [0.0, 1.3, 0.05], 0.12, 14, 1.0, 120],
  dust: [0xeedcb8, 0.05, [0.06, 0.03, 0.0], 0.35, 1.0, 0.6, 320],
  ash: [0xa8a49c, 0.07, [0.09, -0.2, 0.0], 0.35, 0.6, 0.65, 240],
  snow: [0xd8ecff, 0.06, [0.12, -0.55, 0.0], 0.3, 1.0, 0.75, 240],
  fireflies: [0xd2ff86, 0.12, [0.0, 0.03, 0.0], 0.8, 2.4, 1.0, 70]
};

const PLANE_VS = `uniform sampler2D dMap; uniform float amt, sway, time, drift;
varying vec2 vUv;
void main() {
  vUv = uv; float d = texture2D(dMap, uv).r; vec3 p = position; p.z += d * amt;
  float nearL = smoothstep(0.45, 0.95, d), farL = 1.0 - smoothstep(0.05, 0.4, d);
  p.x += drift * (nearL * 0.06 * sin(time * 0.23) - farL * 0.05 * sin(time * 0.17 + 1.3));
  p.y += drift * nearL * 0.035 * sin(time * 0.31 + 0.7);
  float w = sway * smoothstep(0.55, 1.0, d);
  p.x += w * 0.035 * sin(time * 1.3 + p.y * 2.1 + p.x * 0.7);
  p.y += w * 0.02 * sin(time * 1.7 + p.x * 1.9);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;
const PLANE_FS = `uniform sampler2D map; uniform float flick;
varying vec2 vUv;
void main() {
  vec3 c = texture2D(map, vUv).rgb;
  float warm = clamp((c.r - c.b) * 2.0, 0.0, 1.0) * smoothstep(0.15, 0.6, c.r);
  gl_FragColor = vec4(c * (1.0 + flick * warm), 1.0);
}`;
const PART_VS = `attribute vec3 seed; uniform float time, size, pr, wob, tw; uniform vec3 vel, box, boxC;
varying float vA;
void main() {
  vec3 p = seed * box + vel * time + vec3(sin(time * 0.7 + seed.y * 30.0) * wob, cos(time * 0.5 + seed.x * 20.0) * wob * 0.6, 0.0);
  p = mod(p, box) - box * 0.5 + boxC;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = size * (0.5 + seed.z) * pr / max(0.2, -mv.z);
  vA = 0.55 + 0.45 * sin(time * tw + seed.x * 60.0);
  gl_Position = projectionMatrix * mv;
}`;
const PART_FS = `uniform vec3 color; uniform float alpha; varying float vA;
void main() { float r = length(gl_PointCoord - 0.5); gl_FragColor = vec4(color, smoothstep(0.5, 0.0, r) * alpha * vA); }`;
const POST_VS = 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
const POST_FS = `uniform sampler2D A, B; uniform float k, kind, time, flash, black, aspect, grain; uniform vec3 tA, tB; uniform vec2 res; uniform vec4 frame;
varying vec2 vUv;
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
float noise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y); }
float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }
void main() {
  vec2 uv = (vUv - frame.xy) / frame.zw;
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); return; }
  vec3 a = texture2D(A, uv).rgb * tA, b = texture2D(B, uv).rgb * tB, c = a;
  if (kind > 0.5 && kind < 1.5) c = mix(b, a, smoothstep(0.0, 1.0, k));
  else if (kind > 1.5 && kind < 2.5) {           // ink bleeding in from the darks
    float n = fbm(uv * vec2(aspect, 1.0) * 2.6 + 3.7) * 0.75 + (1.0 - dot(b, vec3(0.33))) * 0.25;
    float th = k * 1.3 - 0.15, m = smoothstep(th - 0.06, th + 0.06, n);
    float edge = clamp(1.0 - abs(n - th) / 0.06, 0.0, 1.0) * step(0.01, k) * step(k, 0.99);
    c = mix(a, b, m) * (1.0 - 0.55 * edge);
  } else if (kind > 2.5) c = k < 0.4 ? b * (1.0 - k / 0.4) : a * smoothstep(0.4, 1.0, k);
  c = pow(max(c, 0.0), vec3(1.06));
  vec2 q = (uv - 0.5) * vec2(aspect * 0.82, 1.0);
  c *= mix(1.0, smoothstep(1.05, 0.25, length(q)), 0.6);
  c += (hash(vUv * res + fract(time * 7.13) * 91.0) - 0.5) * grain;
  c = mix(c, vec3(1.0, 0.96, 0.9), flash) * (1.0 - black);
  gl_FragColor = vec4(c, 1.0);
}`;

function softTex(dark) {  // a soft cloud for fog and smoke sprites
  const s = 256, cv = document.createElement('canvas'); cv.width = cv.height = s; const x = cv.getContext('2d');
  for (let i = 0; i < 24; i++) {
    const px = s * (0.25 + Math.random() * 0.5), py = s * (0.3 + Math.random() * 0.4), r = s * (0.12 + Math.random() * 0.22);
    const g = x.createRadialGradient(px, py, 0, px, py, r); const c = dark ? '60,52,46' : '200,206,214';
    g.addColorStop(0, `rgba(${c},0.22)`); g.addColorStop(1, `rgba(${c},0)`); x.fillStyle = g; x.fillRect(0, 0, s, s);
  }
  const t = new THREE.CanvasTexture(cv); return t;
}
function cardTex(shot) {  // storyboard card for a shot that has no painting yet
  const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 576; const x = cv.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, 576); g.addColorStop(0, '#1a1612'); g.addColorStop(1, '#0a0806'); x.fillStyle = g; x.fillRect(0, 0, 1024, 576);
  x.fillStyle = '#8a7a62'; x.font = '600 24px Georgia, serif'; x.fillText(shot.id + '  ·  ' + shot.t.toFixed(1) + ' s  ·  not painted yet', 190, 170);
  x.fillStyle = '#d8c8a8'; x.font = '26px Georgia, serif';
  const words = (shot.scene || '').split(' '); let line = '', y = 225;
  words.forEach((w) => { if (x.measureText(line + w).width > 640) { x.fillText(line, 190, y); line = ''; y += 36; } line += w + ' '; }); x.fillText(line, 190, y);
  return new THREE.CanvasTexture(cv);
}

C.createPainted = function (renderer, opts) {
  const mobile = !!(opts && opts.mobile);
  const camera = new THREE.PerspectiveCamera(FOV, 16 / 9, 0.05, 100);
  const planeGeo = new THREE.PlaneGeometry(PW, PH, mobile ? 128 : 220, mobile ? 72 : 124);
  const flatD = (() => { const t = new THREE.DataTexture(new Uint8Array([128, 128, 128, 255]), 1, 1, THREE.RGBAFormat); t.needsUpdate = true; return t; })();
  const fogTex = softTex(false), smokeTex = softTex(true);
  const aspect = 16 / 9; let W = 2, H = 2, pr = 1;
  const rt = [0, 1].map(() => new THREE.WebGLRenderTarget(2, 2, { depthBuffer: true }));
  const post = new THREE.ShaderMaterial({
    vertexShader: POST_VS, fragmentShader: POST_FS, depthTest: false, depthWrite: false,
    uniforms: { A: { value: rt[0].texture }, B: { value: rt[1].texture }, k: { value: 1 }, kind: { value: 0 }, time: { value: 0 }, flash: { value: 0 }, black: { value: 0 },
      aspect: { value: aspect }, frame: { value: new THREE.Vector4(0, 0, 1, 1) }, grain: { value: 0.045 }, tA: { value: new THREE.Vector3(1, 1, 1) }, tB: { value: new THREE.Vector3(1, 1, 1) }, res: { value: new THREE.Vector2(2, 2) } }
  });
  const postScene = new THREE.Scene(), postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), post));

  let board = null, base = '', shots = [], blobs = {};
  const cache = new Map();   // shot index -> { map, dMap, ready }

  /* ---- a slot = one shot's scene: the displaced painting, its particles and fog ---- */
  function makeSlot() {
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0x000000);
    const mat = new THREE.ShaderMaterial({ vertexShader: PLANE_VS, fragmentShader: PLANE_FS,
      uniforms: { map: { value: null }, dMap: { value: flatD }, amt: { value: DEPTH }, drift: { value: 1 }, sway: { value: 0 }, time: { value: 0 }, flick: { value: 0 } } });
    const plane = new THREE.Mesh(planeGeo, mat); scene.add(plane);
    return { scene, mat, plane, idx: -1, fx: [], fog: [] };
  }
  const slots = [makeSlot(), makeSlot()];
  function clearFx(sl) { sl.fx.concat(sl.fog).forEach((o) => { sl.scene.remove(o); o.geometry.dispose(); o.material.dispose(); }); sl.fx = []; sl.fog = []; }
  function assign(sl, i) {
    if (sl.idx === i) return; sl.idx = i; clearFx(sl);
    const s = shots[i]; if (!s) return;
    const fxs = (s.fx || []).slice(); if (!fxs.includes('fog') && !fxs.includes('smoke') && !fxs.includes('none')) fxs.push('haze');
    fxs.forEach((name, n) => {
      if (name === 'fog' || name === 'smoke' || name === 'haze') {
        const tex = name === 'smoke' ? smokeTex : fogTex, haze = name === 'haze';
        for (let j = 0; j < (haze ? 3 : mobile ? 4 : 6); j++) {
          const m = new THREE.Mesh(new THREE.PlaneGeometry(11, 5.5), new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: name === 'smoke' ? 0.42 : haze ? 0.08 : 0.26, depthWrite: false, depthTest: false }));
          m.userData = { z: 1.6 + j * 0.8, x0: (j * 7.3) % 22 - 11, y0: (j % 3 - 1) * 1.6 - (name === 'smoke' ? -0.5 : 2.2), v: (name === 'smoke' ? 0.14 : 0.3) * (j % 2 ? 1 : -0.7), rise: name === 'smoke' ? 0.16 : 0 };
          m.renderOrder = 2; sl.scene.add(m); sl.fog.push(m);
        }
        return;
      }
      const f = FX[name]; if (!f) return;
      const nP = Math.round(f[6] * (mobile ? 0.6 : 1)), seed = new Float32Array(nP * 3);
      for (let j = 0; j < seed.length; j++) seed[j] = Math.random();
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(nP * 3), 3)); g.setAttribute('seed', new THREE.BufferAttribute(seed, 3));
      const m = new THREE.ShaderMaterial({ vertexShader: PART_VS, fragmentShader: PART_FS, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
        uniforms: { time: { value: 0 }, size: { value: f[1] }, pr: { value: 1 }, wob: { value: f[3] }, tw: { value: f[4] }, vel: { value: new THREE.Vector3(...f[2]) },
          box: { value: new THREE.Vector3(PW * 1.3, PH * 1.4, 9) }, boxC: { value: new THREE.Vector3(0, 0, 5.5) }, color: { value: new THREE.Color(f[0]) }, alpha: { value: f[5] } } });
      const p = new THREE.Points(g, m); p.frustumCulled = false; p.renderOrder = 3; sl.scene.add(p); sl.fx.push(p);
    });
  }

  /* ---- art: fetched once per visit as blobs, decoded into textures for the shots around the playhead ---- */
  function fetchBlob(url) { return fetch(url).then((r) => (r.ok ? r.blob() : null)).catch(() => null); }
  function preload(st, onP) {
    const b = st.painted; if (board === b && Object.keys(blobs).length) return Promise.resolve();
    board = b; base = st.paintBase; shots = b.shots; blobs = {}; cache.forEach(drop); cache.clear(); slots.forEach((sl) => { sl.idx = -1; });
    let done = 0; const all = shots.length * 2, tick = () => { done++; if (onP) onP(done / all); };
    const B = C.BASE();
    return Promise.all(shots.map((s) => Promise.all([
      fetchBlob(new URL(base + (s.img || s.id) + '.webp', B)).then((x) => { tick(); return x; }),   // img: reuse another shot's painting
      fetchBlob(new URL(base + (s.img || s.id) + '_d.png', B)).then((x) => { tick(); return x; })
    ]).then(([c, d]) => { blobs[s.id] = { c, d }; })));
  }
  function texFrom(blob) {
    return new Promise((res) => {
      if (!blob) { res(null); return; }
      const img = new Image(), u = URL.createObjectURL(blob);
      img.onload = () => { const t = new THREE.Texture(img); t.needsUpdate = true; t.minFilter = THREE.LinearFilter; t.generateMipmaps = false; URL.revokeObjectURL(u); res(t); };
      img.onerror = () => { URL.revokeObjectURL(u); res(null); }; img.src = u;
    });
  }
  function drop(e) { if (e.map) e.map.dispose(); if (e.dMap && e.dMap !== flatD) e.dMap.dispose(); }
  function want(i) {
    if (i < 0 || i >= shots.length || cache.has(i)) return cache.get(i);
    const s = shots[i], b = blobs[s.id] || {}, e = { map: null, dMap: flatD, ready: false };
    cache.set(i, e);
    e.promise = Promise.all([texFrom(b.c), texFrom(b.d)]).then(([m, d]) => { e.map = m || cardTex(s); if (d) e.dMap = d; e.painted = !!m; e.ready = true; });
    return e;
  }
  function keepAround(i) {
    for (let j = i - 1; j <= i + 2; j++) want(j);
    cache.forEach((e, j) => { if (j < i - 1 || j > i + 3) { drop(e); cache.delete(j); } });
  }
  const shotAt = (t) => { let k = 0; for (let i = 0; i < shots.length; i++) if (shots[i].t <= t) k = i; return k; };
  const transOf = (s) => (s ? s.in || 'cut' : 'cut');

  /* ---- camera for shot s at song time t ---- */
  function placeCam(s, t, i, shake) {
    const t0 = s.t, t1 = i + 1 < shots.length ? shots[i + 1].t : board.end || t0 + 8;
    const u = clamp((t - t0) / Math.max(0.1, t1 - t0), 0, 1.15), e = lerp(u, 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, u)), 0.55) + Math.max(0, u - 1) * 0.5;
    const mv = s.move || { from: [0, 0, 0], to: [0, 0, 0.1] }, a = mv.from, b = mv.to;
    const cover = Math.min((PH / 2) / TAN, (PW / 2) / (TAN * aspect)) * 0.95;
    const dist = cover * (1 - lerp(a[2], b[2], e) * 0.5);
    const hh = dist * TAN, hw = hh * aspect;
    const fx = 0, fy = 0;
    let x = lerp(a[0], b[0], e) * PW * MOVE + fx, y = lerp(a[1], b[1], e) * PH + fy;
    // a slow breath so even a held shot is alive
    x += Math.sin(t * 0.21 + i) * 0.14; y += Math.sin(t * 0.17 + i * 2) * 0.08;
    x = clamp(x, -(PW / 2 - hw * 1.02), PW / 2 - hw * 1.02); y = clamp(y, -(PH / 2 - hh * 1.02), PH / 2 - hh * 1.02);
    if (shake) { x += Math.sin(t * 61) * shake * 0.08; y += Math.cos(t * 53) * shake * 0.06; }
    camera.position.set(x, y, dist + DEPTH * 0.35); camera.lookAt(x * (1 - ORBIT), y * (1 - ORBIT), 0);
  }
  function drawSlot(sl, i, t, time, calm, target) {
    const s = shots[i], e = cache.get(i);
    sl.mat.uniforms.map.value = e && e.ready ? e.map : null;
    sl.mat.uniforms.dMap.value = e && e.ready ? e.dMap : flatD;
    sl.plane.visible = !!(e && e.ready);
    sl.mat.uniforms.time.value = time; sl.mat.uniforms.sway.value = s.sway || 0;
    const fl = s.flicker || 0; sl.mat.uniforms.flick.value = fl * 0.26 * (Math.sin(time * 9.1) * 0.5 + Math.sin(time * 15.3 + 1.7) * 0.3 + Math.sin(time * 4.3) * 0.4);
    const sk = !calm && s.shake ? s.shake * Math.exp(-(t - s.t) * 2.5) : 0;
    placeCam(s, t, i, sk);
    sl.fx.forEach((p) => { p.material.uniforms.time.value = t - s.t + 20; p.material.uniforms.pr.value = H * 0.9; });
    sl.fog.forEach((m) => {
      const d = m.userData, x = ((d.x0 + d.v * (t - s.t) + 30) % 22 + 22) % 22 - 11;
      m.position.set(camera.position.x + x, camera.position.y + d.y0 + d.rise * (t - s.t), camera.position.z - d.z - 0.4);
      m.quaternion.copy(camera.quaternion);
    });
    renderer.setRenderTarget(target); renderer.clear(); renderer.render(sl.scene, camera);
  }

  let lastT = 0;
  const P = {
    camera, preload,
    active: () => !!board,
    start(st) { if (st.painted !== board) preload(st); board.end = st.silenceT || st.duration; lastT = 0; },
    resize(w, h) {
      pr = renderer.getPixelRatio(); W = Math.round(w * pr); H = Math.round(h * pr);
      const fw = Math.min(w, h * aspect), fh = fw / aspect;  // the whole painting fits the screen: bands above/below or at the sides
      rt.forEach((r) => r.setSize(Math.round(fw * pr), Math.round(fh * pr))); camera.aspect = aspect; camera.updateProjectionMatrix();
      post.uniforms.frame.value.set((1 - fw / w) / 2, (1 - fh / h) / 2, fw / w, fh / h); post.uniforms.res.value.set(W, H);
    },
    // make sure the art around song time t is decoded (headless tools await this before shooting)
    ensure(t) { const i = shotAt(t); keepAround(i); return Promise.all([i - 1, i, i + 1].map((j) => (cache.get(j) || {}).promise).filter(Boolean)); },
    shotAt,
    render(t, time, calm) {
      if (!board) return;
      const i = shotAt(Math.max(0, t)), s = shots[i], tr = transOf(s), dur = TRANS[tr] || 0, since = t - s.t;
      keepAround(i);
      const mixing = dur > 0 && since < dur && i > 0;
      assign(slots[0], i); if (mixing) assign(slots[1], i - 1);
      drawSlot(slots[0], i, t, time, calm, rt[0]);
      if (mixing) drawSlot(slots[1], i - 1, t, time, calm, rt[1]);
      const U = post.uniforms;
      U.k.value = mixing ? clamp(since / dur, 0, 1) : 1; U.kind.value = mixing ? KIND[tr] : 0;
      // the first shot rises out of black; "black" on the first shot does the same
      if (i === 0 && (tr === 'black' || tr === 'fade')) { U.kind.value = 0; U.black.value = 1 - clamp(since / 2.2, 0, 1); } else U.black.value = 0;
      const end = board.end || 1e9; if (t > end - 2.5) U.black.value = Math.max(U.black.value, clamp((t - end + 2.5) / 2.5, 0, 1));
      U.flash.value = tr === 'flash' && since >= 0 ? Math.exp(-since * 5) * 0.85 : 0;
      const gA = GRADE[s.grade || 'none'] || GRADE.none, gB = GRADE[(shots[i - 1] || {}).grade || 'none'] || GRADE.none;
      U.tA.value.set(...gA); U.tB.value.set(...gB);
      U.time.value = time;
      renderer.setRenderTarget(null); renderer.render(postScene, postCam);
      lastT = t;
    },
    info() { const i = shotAt(Math.max(0, lastT)); const e = cache.get(i); return { shot: shots[i] && shots[i].id, painted: !!(e && e.painted) }; }
  };
  return P;
};
})(typeof window !== 'undefined' ? window : globalThis);
