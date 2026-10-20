(function (root) {
'use strict';
const C = root.__cw, THREE = C.THREE;
const { TAU, clamp, lerp, sm, ss, MOODS, newMood, moodAt, M, bx, cy, cn, ic, solid, emis, inst, lamb } = C;

const SKY_VS = 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }';
const SKY_FS = [
  'varying vec3 vDir;',
  'uniform vec3 top; uniform vec3 hor; uniform float stars; uniform float moon; uniform float aur; uniform float time;',
  'uniform vec3 moonDir; uniform vec3 aurA; uniform vec3 aurB;',
  'float hash(vec3 p){ p = fract(p*0.3183099 + vec3(0.1,0.2,0.3)); p *= 17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }',
  'void main(){',
  '  vec3 d = normalize(vDir);',
  '  float h = clamp(d.y, 0.0, 1.0);',
  '  vec3 c = mix(hor, top, pow(h, 0.55));',
  '  if (d.y < 0.0) { c = mix(hor, hor*0.6, clamp(-d.y*3.0, 0.0, 1.0)); }',
  '  float s = hash(floor(d*300.0));',
  '  float st = step(0.9972, s) * smoothstep(0.05, 0.35, d.y) * stars;',
  '  c += vec3(0.9,0.95,1.0) * st * (0.6 + 0.4*sin(time*2.0 + s*50.0));',
  '  float md = dot(d, normalize(moonDir));',
  '  float disc = smoothstep(0.9985, 0.9992, md);',
  '  float halo = pow(max(md, 0.0), 60.0)*0.35 + pow(max(md, 0.0), 8.0)*0.08;',
  '  c += (vec3(0.85,0.92,1.0)*disc*1.2 + vec3(0.55,0.7,1.0)*halo) * moon;',
  '  if (aur > 0.001) {',
  '    float band = smoothstep(0.12, 0.4, d.y) * (1.0 - smoothstep(0.55, 0.95, d.y));',
  '    float w = sin(d.x*6.0 + time*0.3 + sin(d.z*4.0 + time*0.2)*1.5)*0.5 + 0.5;',
  '    float w2 = sin(d.x*13.0 - time*0.4 + d.z*3.0)*0.5 + 0.5;',
  '    float a = band * w * w * (0.5 + 0.5*w2);',
  '    c += mix(aurA, aurB, w2) * a * aur * 0.9;',
  '  }',
  '  gl_FragColor = vec4(c, 1.0);',
  '}'
].join('\n');

const MOTE_KINDS = {
  dust:      { n: 260, size: 0.12, col: [0x9fb6d8, 0xc8d6f0], vy: -0.03, jit: 0.15, op: 0.55, add: true, box: 44 },
  ash:       { n: 380, size: 0.10, col: [0xb8b0a8, 0x8a8078, 0xff9050], vy: -0.55, jit: 0.25, op: 0.7, add: true, box: 44 },
  embers:    { n: 300, size: 0.14, col: [0xff8a30, 0xffc060, 0xff5020], vy: 0.7, jit: 0.5, op: 0.9, add: true, box: 46 },
  fireflies: { n: 160, size: 0.20, col: [0xd8ff90, 0xffe070, 0xa0ffd0], vy: 0, jit: 1.0, op: 0.9, add: true, box: 40 },
  sparks:    { n: 280, size: 0.12, col: [0xffd070, 0xffa040, 0xfff0b0], vy: 1.1, jit: 0.6, op: 0.95, add: true, box: 46 },
  confetti:  { n: 260, size: 0.22, col: [0xff5a7a, 0xffd060, 0x60c8ff, 0x9aff7a, 0xc080ff], vy: -0.7, jit: 0.8, op: 0.95, add: false, box: 34 },
  smoke:     { n: 120, size: 2.8, col: [0x2a2c34, 0x3a3a44, 0x4a3030], vy: 0.35, jit: 0.2, op: 0.28, add: false, box: 50 }
};

C.create = function (opts) {
  opts = opts || {};
  const mobile = !!opts.mobile;
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x16100c, 0.01);
  scene.background = new THREE.Color(0x16100c);
  const camera = new THREE.PerspectiveCamera(74, 1, 0.08, 1600);
  camera.rotation.order = 'YXZ';
  scene.add(camera);

  const TEX = { glow: C.glowTexture(), ground: C.groundTexture(), stone: C.stoneTexture(), plank: C.plankTexture('#6b4c34') };

  /* ---- story-dependent state (rebuilt by loadStory) ---- */
  const DT = 0.05, STEP = 0.5, Z0 = -3.2;
  let story = null, cues = [], dTab = new Float32Array(2), NT = 1, DURATION = 1;
  let sec = {}, Dend = 0, dBack = 0, tCross = 0, NP = 3, px, pz, tx, tz;
  const distAt = (t) => { t = clamp(t, 0, NT * DT); const f = t / DT, i = Math.min(NT - 1, Math.floor(f)); return lerp(dTab[i], dTab[i + 1], f - i); };
  const tAtDist = (d) => {
    let lo = 0, hi = NT;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (dTab[m] <= d) lo = m; else hi = m; }
    return (lo + (d - dTab[lo]) / Math.max(1e-6, dTab[lo + 1] - dTab[lo])) * DT;
  };
  function frame(d) {
    d = clamp(d, 0, (NP - 3) * STEP);
    const f = d / STEP, i = Math.min(NP - 2, Math.floor(f)), k = f - i;
    const ax = lerp(tx[i], tx[i + 1], k), az = lerp(tz[i], tz[i + 1], k), L = Math.hypot(ax, az) || 1;
    return { x: lerp(px[i], px[i + 1], k), z: lerp(pz[i], pz[i + 1], k), tx: ax / L, tz: az / L };
  }
  const at = (d, side, h) => { const f = frame(d); return new THREE.Vector3(f.x - f.tz * (side || 0), h || 0, f.z + f.tx * (side || 0)); };
  const yawAt = (d) => { const f = frame(d); return Math.atan2(-f.tx, -f.tz); };
  function buildTimeline(st) {
    cues = st.cues; DURATION = st.duration; NT = Math.ceil((DURATION + 2) / DT);
    dTab = new Float32Array(NT + 1);
    const speedAt = (t) => {
      if (t < 0) return 0;
      let idx = 0;
      for (let i = 0; i < cues.length; i++) { if (cues[i].t - 1.5 <= t) idx = i; }
      const v = idx === 0 ? cues[0].v : lerp(cues[idx - 1].v, cues[idx].v, ss(cues[idx].t - 1.5, cues[idx].t + 1.5, t));
      return v * ss(0, 4, t);
    };
    for (let i = 0; i < NT; i++) dTab[i + 1] = dTab[i] + speedAt((i + 0.5) * DT) * DT;
    sec = {};
    cues.forEach((c, i) => {
      const t1 = i + 1 < cues.length ? cues[i + 1].t : DURATION;
      const d0 = distAt(c.t), d1 = distAt(t1);
      sec[c.id] = { id: c.id, i, t0: c.t, t1, d0, d1, len: d1 - d0, mid: (d0 + d1) / 2 };
    });
    Dend = distAt(DURATION);
    const endCue = st.gaolCue ? sec[st.gaolCue] : null;
    dBack = endCue ? endCue.d0 - 4.4 : Dend + 1e3;
    tCross = endCue ? tAtDist(dBack) : DURATION;
  }
  function buildPath() {
    const sFreeze = Math.min(dBack - 6, Dend + 1e3), Lmax = Dend + 160;
    const A = (s) => 0.55 * Math.sin(s / 150) + 0.28 * Math.sin(s / 57 + 1.0);
    const head = (s) => { const q = Math.min(s, sFreeze); return A(q) * ss(42, 92, q); };
    NP = Math.ceil(Lmax / STEP) + 3;
    px = new Float32Array(NP); pz = new Float32Array(NP); tx = new Float32Array(NP); tz = new Float32Array(NP);
    let x = 0, z = Z0;
    for (let i = 0; i < NP; i++) {
      const a = head(i * STEP);
      px[i] = x; pz[i] = z; tx[i] = Math.sin(a); tz[i] = -Math.cos(a);
      x += tx[i] * STEP; z += tz[i] * STEP;
    }
  }
  buildTimeline({ cues: [{ id: 'x', t: 0, v: 1 }], duration: 10 }); buildPath();

  /* ---- lights ---- */
  const hemi = new THREE.HemisphereLight(0xffffff, 0x222222, 1); scene.add(hemi);
  const dirL = new THREE.DirectionalLight(0xffffff, 0.5); dirL.position.set(-40, 70, 30); scene.add(dirL);
  const lamp = new THREE.PointLight(0xffbe78, 1.2, 26, 1.6);
  const fx = [new THREE.PointLight(0xffffff, 0, 30, 1.6), new THREE.PointLight(0xffffff, 0, 30, 1.6)];
  scene.add(fx[0]); scene.add(fx[1]);

  /* ---- sky ---- */
  const skyMat = new THREE.ShaderMaterial({
    uniforms: {
      top: { value: new THREE.Color(0x050913) }, hor: { value: new THREE.Color(0x14253f) }, stars: { value: 1 }, moon: { value: 1 }, aur: { value: 0 }, time: { value: 0 },
      moonDir: { value: new THREE.Vector3(-0.4, 0.55, -0.7).normalize() }, aurA: { value: new THREE.Color(0x40ffa0) }, aurB: { value: new THREE.Color(0x8060ff) }
    },
    vertexShader: SKY_VS, fragmentShader: SKY_FS, side: THREE.BackSide, depthWrite: false, fog: false
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(900, 24, 16), skyMat);
  sky.renderOrder = -10; sky.frustumCulled = false; scene.add(sky);

  /* ---- ground that follows the rider, snapped to its texture period ---- */
  const PERIOD = 8, GSIZE = 480;
  // photo ground texture when loaded (darker than the procedural one, so its mood colour is boosted)
  let gReal = C.tex('forest_ground_04_diff'), gtex = gReal || TEX.ground, gBoost = gReal ? 2.2 : 1;
  gtex.repeat.set(GSIZE / PERIOD, GSIZE / PERIOD);
  const groundMat = new THREE.MeshLambertMaterial({ map: gtex, color: 0x1a2430 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(GSIZE, GSIZE), groundMat);
  ground.rotation.x = -Math.PI / 2; ground.position.y = -0.05; scene.add(ground);

  /* ---- floating motes (embers, ash, confetti ...) ---- */
  const MAXN = 380;
  const mPos = new Float32Array(MAXN * 3), mCol = new Float32Array(MAXN * 3), mPh = new Float32Array(MAXN);
  for (let i = 0; i < MAXN; i++) { mPos[i * 3] = C.R(-22, 22); mPos[i * 3 + 1] = C.R(0, 16); mPos[i * 3 + 2] = C.R(-22, 22); mPh[i] = C.R(0, TAU); }
  const mGeo = new THREE.BufferGeometry();
  mGeo.setAttribute('position', new THREE.BufferAttribute(mPos, 3));
  mGeo.setAttribute('color', new THREE.BufferAttribute(mCol, 3));
  const mMat = new THREE.PointsMaterial({ size: 0.12, map: TEX.glow, vertexColors: true, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true });
  const motes = new THREE.Points(mGeo, mMat); motes.frustumCulled = false; scene.add(motes);
  let moteKind = 'dust', moteTarget = 'dust', moteN = 0;
  function setMoteKind(k) {
    const K = MOTE_KINDS[k], tmp = new THREE.Color();
    moteN = Math.floor(K.n * (mobile ? 0.6 : 1));
    for (let i = 0; i < MAXN; i++) { tmp.set(K.col[i % K.col.length]); mCol[i * 3] = tmp.r; mCol[i * 3 + 1] = tmp.g; mCol[i * 3 + 2] = tmp.b; }
    mGeo.attributes.color.needsUpdate = true;
    mGeo.setDrawRange(0, moteN);
    mMat.size = K.size; mMat.blending = K.add ? THREE.AdditiveBlending : THREE.NormalBlending; mMat.needsUpdate = true;
    moteKind = k;
  }
  setMoteKind('dust');
  function updateMotes(dt, time, cam, wantKind) {
    moteTarget = wantKind;
    const K = MOTE_KINDS[moteKind];
    if (moteTarget !== moteKind) { mMat.opacity = Math.max(0, mMat.opacity - dt * 1.2); if (mMat.opacity <= 0.01) setMoteKind(moteTarget); }
    else mMat.opacity = Math.min(K.op, mMat.opacity + dt * 0.8);
    const B = K.box, half = B / 2;
    for (let i = 0; i < moteN; i++) {
      const o = i * 3, ph = mPh[i];
      mPos[o] += Math.sin(time * 0.9 + ph) * K.jit * dt;
      mPos[o + 2] += Math.cos(time * 0.8 + ph * 1.3) * K.jit * dt;
      mPos[o + 1] += K.vy * dt + (K.vy === 0 ? Math.sin(time * 1.3 + ph) * K.jit * 0.3 * dt : 0);
      const dx = mPos[o] - cam.x, dz = mPos[o + 2] - cam.z;
      if (dx > half) mPos[o] -= B; else if (dx < -half) mPos[o] += B;
      if (dz > half) mPos[o + 2] -= B; else if (dz < -half) mPos[o + 2] += B;
      if (mPos[o + 1] > 18) mPos[o + 1] -= 18; else if (mPos[o + 1] < 0) mPos[o + 1] += 18;
    }
    mGeo.attributes.position.needsUpdate = true;
  }

  /* ---- the rider's chair ---- */
  const chair = new THREE.Group();
  (function () {
    const wood = 0x5a3d28, dk = 0x2e1f14, iron = 0x3a3a40;
    chair.add(solid([
      bx(0.64, 0.07, 0.58, wood, [0, 0.5, 0]), bx(0.64, 0.75, 0.06, wood, [0, 0.9, 0.3]),
      bx(0.06, 0.05, 0.54, dk, [0.33, 0.76, 0]), bx(0.06, 0.05, 0.54, dk, [-0.33, 0.76, 0]),
      bx(0.05, 0.28, 0.05, dk, [0.33, 0.62, -0.2]), bx(0.05, 0.28, 0.05, dk, [-0.33, 0.62, -0.2]),
      bx(0.06, 0.5, 0.06, dk, [0.28, 0.25, -0.25]), bx(0.06, 0.5, 0.06, dk, [-0.28, 0.25, -0.25]),
      bx(0.06, 0.5, 0.06, dk, [0.28, 0.25, 0.25]), bx(0.06, 0.5, 0.06, dk, [-0.28, 0.25, 0.25]),
      C.cy(0.02, 0.02, 1.7, 5, iron, [0.42, 1.0, 0.5]), bx(0.3, 0.02, 0.02, iron, [0.3, 1.84, 0.5])
    ]));
    const lantern = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.11, 0.08), new THREE.MeshBasicMaterial({ color: 0xffc070 }));
    lantern.position.set(0.18, 1.76, 0.5); chair.add(lantern);
    const lg = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX.glow, color: 0xffb060, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0.8 }));
    lg.scale.set(0.5, 0.5, 1); lg.position.copy(lantern.position); chair.add(lg);
    scene.add(lamp);
  })();
  scene.add(chair); chair.visible = false;  // the ride chair is retired: the camera director films the song

  /* ---- shared kit passed to scene builders ---- */
  const storyRoot = new THREE.Group(); scene.add(storyRoot);
  const X = {
    THREE, C, scene, camera, TEX, at, yawAt, frame, distAt, tAtDist, fx, mobile, root: storyRoot,
    sec: sec, Dend: Dend, dBack: dBack, tCross: tCross, Z0: Z0, story: null, anims: [], hubAnims: [], anchors: {}, hubAnchors: {},
    STAND: { x: 0, y: 1.62, z: -5.95 },  // where the player stands to read Lucien's songbook (set by the hub)
    glow(color, size, op) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX.glow, color, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: op === undefined ? 1 : op }));
      s.scale.set(size, size, 1); return s;
    }
  };
  const hub = C.buildHub(X);
  const director = C.makeDirector ? C.makeDirector(X) : null;
  scene.add(hub.group);
  let defs = [];

  /* ---- per-frame ---- */
  const Mo = newMood();
  const camPos = new THREE.Vector3();
  const BAR_KEYS = [{ t: -1e6, m: 'bar', b: 0 }];
  const from = { x: 0, y: 1.28, z: Z0, yaw: 0, pitch: 0 };
  let riding = false;
  const SEAT = { x: 0, y: 1.28, z: Z0 + 0.02 }, BOOK_PITCH = -0.2;
  const angDiff = (a, b) => { let d = (b - a) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; };
  const ctx = {
    t: -1, dt: 0, time: 0, camD: -50, cam: camPos, mood: Mo, mode: 'walk',
    light(slot, x, y, z, color, intensity, dist) {
      const L = fx[slot]; L.position.set(x, y, z); L.color.set(color); L.intensity = intensity; if (dist) L.distance = dist;
    }
  };
  function disposeRoot() {
    storyRoot.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) { (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); }
    });
    while (storyRoot.children.length) storyRoot.remove(storyRoot.children[0]);
  }
  // rail distance nearest to a point (scene visibility follows wherever the director puts the camera)
  function nearRail(p, guess) {
    let best = guess, bd = 1e9;
    for (let d = Math.max(0, guess - 90); d <= guess + 90; d += 1.5) { const f = frame(d), q = (f.x - p.x) ** 2 + (f.z - p.z) ** 2; if (q < bd) { bd = q; best = d; } }
    return best;
  }
  const W = {
    scene, camera, get director() { return director; }, STAND: X.STAND, flash: 0, nearChair: false, colliders: hub.colliders || [], camD: 0, chair, book: hub.book, SEAT,
    get story() { return story; }, get sec() { return sec; }, get duration() { return DURATION; },
    resize(w, h) {
      camera.aspect = w / h;
      // keep ~62 deg horizontal on portrait screens, capped so it does not fisheye
      camera.fov = w >= h ? 74 : Math.min(92, Math.max(74, 2 * Math.atan(Math.tan(0.54) / camera.aspect) * 180 / Math.PI));
      camera.updateProjectionMatrix();
    },
    loadStory(st) {
      // the photo ground arrives with a level pack (loaded on request), swap it in once
      if (!gReal && (gReal = C.tex('forest_ground_04_diff'))) { gReal.repeat.set(GSIZE / PERIOD, GSIZE / PERIOD); groundMat.map = gReal; groundMat.needsUpdate = true; gBoost = 2.2; }
      disposeRoot(); defs = []; X.anims.length = 0; X.anchors = {};
      story = st; X.story = st;
      buildTimeline(st); buildPath();
      X.sec = sec; X.Dend = Dend; X.dBack = dBack; X.tCross = tCross;
      X.clearings = typeof st.clearings === 'function' ? st.clearings(X) : [];  // [{ x, z, r }] kept free of trees for the camera
      const list = (typeof st.build === 'function') ? st.build(X) : [];
      list.forEach((d) => { if (d) { storyRoot.add(d.group); defs.push(d); } });
      if (director) director.set(st);  // after the scenes, so shots can see their anchors
      W.info = { Dend, dBack, tCross, Z0 };
    },
    beginRide(pose) { from.x = pose.x; from.y = pose.y; from.z = pose.z; from.yaw = pose.yaw; from.pitch = pose.pitch; riding = true; },
    endRide() { riding = false; },
    cueIndexAt(t) { let k = 0; for (let i = 0; i < cues.length; i++) if (cues[i].t <= t) k = i; return k; },
    update(st) {
      const mode = st.mode, ride = mode === 'ride' && !!story;
      const t = ride ? st.t : -1, dt = st.dt || 0.016, time = st.time || 0;
      moodAt(ride ? story.keys : BAR_KEYS, t, Mo);
      scene.fog.color.copy(Mo.fog); scene.fog.density = Mo.fd; scene.background.copy(Mo.fog);
      hemi.color.copy(Mo.hs); hemi.groundColor.copy(Mo.hg); hemi.intensity = Mo.hi;
      dirL.color.copy(Mo.dc); dirL.intensity = Mo.di;
      lamp.color.copy(Mo.lc); lamp.intensity = Mo.li * (0.93 + 0.07 * Math.sin(time * 9.1) * Math.sin(time * 5.3 + 1));
      groundMat.color.copy(Mo.gr).multiplyScalar(gBoost);
      groundMat.color.r = Math.min(0.62, groundMat.color.r); groundMat.color.g = Math.min(0.62, groundMat.color.g); groundMat.color.b = Math.min(0.62, groundMat.color.b);  // bright moods (the flash) would blow the photo ground out
      const U = skyMat.uniforms;
      U.top.value.copy(Mo.skyT); U.hor.value.copy(Mo.skyH); U.stars.value = Mo.stars; U.moon.value = Mo.moon; U.aur.value = Mo.aur;
      U.aurA.value.copy(Mo.aA); U.aurB.value.copy(Mo.aB); U.time.value = time;

      let camD = -50;
      if (mode === 'walk') {
        const p = st.player;
        camera.position.set(p.x, 1.65, p.z); camera.rotation.set(p.pitch, p.yaw, 0);
        chair.position.set(0, 0, Z0); chair.rotation.y = 0;
        W.nearChair = Math.hypot(p.x - X.STAND.x, p.z - X.STAND.z) < 2.2;
      } else if (mode === 'book') {
        // seated at the lectern: ease from the player's last pose to the seat
        const b = 1 - sm(st.sit === undefined ? 1 : st.sit), p = st.player, lk = st.look || { yaw: 0, pitch: 0 };
        const yaw = lk.yaw * 0.6, pitch = BOOK_PITCH + lk.pitch * 0.6, SP = X.STAND;
        camera.position.set(lerp(SP.x, p.x, b), lerp(SP.y, 1.65, b), lerp(SP.z, p.z, b));
        camera.rotation.set(lerp(pitch, p.pitch, b), yaw + angDiff(yaw, p.yaw) * b, 0);
        chair.position.set(0, 0, Z0); chair.rotation.y = 0;
      } else if (director && director.active) {
        director.pose(t, camera, st.calm);
        camD = nearRail(camera.position, distAt(t));
      } else {
        camD = distAt(t);
        const f = frame(camD), yawP = Math.atan2(-f.tx, -f.tz);
        const bob = Math.sin(t * 1.3) * 0.012 + Math.sin(t * 3.1) * 0.004;
        let yaw = yawP + st.look.yaw, pitch = st.look.pitch;
        if (riding) {
          const b = 1 - ss(0, 1.8, t);
          if (b > 0) { yaw = yaw + angDiff(yaw, from.yaw) * b; pitch = lerp(pitch, from.pitch, b); }
        }
        camera.position.set(f.x, 1.28 + bob, f.z); camera.rotation.set(pitch, yaw, Math.sin(t * 0.7) * 0.008);
        chair.position.set(f.x, 0, f.z); chair.rotation.y = yawP;
      }
      camPos.copy(camera.position);
      lamp.position.set(camPos.x, camPos.y + 0.7, camPos.z);
      sky.position.copy(camPos);
      ground.position.x = Math.round(camPos.x / PERIOD) * PERIOD; ground.position.z = Math.round(camPos.z / PERIOD) * PERIOD;

      ctx.t = t; ctx.dt = dt; ctx.time = time; ctx.camD = camD; ctx.ride = ride; ctx.mode = mode;
      fx[0].intensity = 0; fx[1].intensity = 0;
      hub.group.visible = camD < 70;
      if (hub.group.visible) hub.update(t, ctx);
      for (let i = 0; i < defs.length; i++) {
        const s = defs[i];
        const vis = ride && camD > s.d0 - (s.vis || 120) && camD < s.d1 + (s.vis || 120);
        s.group.visible = vis;
        if (vis && s.update) s.update(t, ctx);
      }
      // rigged characters/creatures: story ones follow song time (seek-safe), tavern ones wall time; skip hidden ones
      const animate = (list, tm) => {
        for (let i = 0; i < list.length; i++) {
          const a = list[i]; let o = a, vis = true;
          while (o) { if (!o.visible) { vis = false; break; } o = o.parent; }
          if (vis) a.userData.mixer.setTime(a.userData.timeFn ? a.userData.timeFn(tm) : tm + a.userData.ph);
        }
      };
      animate(X.anims, ride ? Math.max(0, t) : time); animate(X.hubAnims, time);
      const fT = story && story.flashAt;
      W.flash = (!ride || fT === undefined) ? 0 : (t < fT - 0.2 ? 0 : (t < fT ? (t - (fT - 0.2)) / 0.2 : Math.exp(-(t - fT) * 2.6)));
      W.camD = camD;
      const kind = ride ? ((cues[W.cueIndexAt(Math.max(0, t))] || cues[0]).motes || 'dust') : 'dust';
      updateMotes(dt, time, camPos, kind);
    }
  };
  W.walkStep = function (p, mv, dt) {
    const sp = 2.6 * dt;
    const fwd = mv.fwd || 0, side = mv.side || 0;
    const nx = p.x + (-Math.sin(p.yaw) * fwd + Math.cos(p.yaw) * side) * sp;
    const nz = p.z + (-Math.cos(p.yaw) * fwd - Math.sin(p.yaw) * side) * sp;
    let x = clamp(nx, -5.5, 5.5), z = clamp(nz, -9.3, 5.0);
    W.colliders.forEach((c) => {
      if (c.r !== undefined) {
        const dx = x - c.x, dz = z - c.z, d = Math.hypot(dx, dz), m = c.r + 0.3;
        if (d < m && d > 1e-5) { x = c.x + dx / d * m; z = c.z + dz / d * m; }
      } else if (x > c.x0 - 0.3 && x < c.x1 + 0.3 && z > c.z0 - 0.3 && z < c.z1 + 0.3) {
        const l = x - (c.x0 - 0.3), r = (c.x1 + 0.3) - x, f = z - (c.z0 - 0.3), b = (c.z1 + 0.3) - z, m = Math.min(l, r, f, b);
        if (m === l) x = c.x0 - 0.3; else if (m === r) x = c.x1 + 0.3; else if (m === f) z = c.z0 - 0.3; else z = c.z1 + 0.3;
      }
    });
    p.x = x; p.z = z;
  };
  return W;
};
})(typeof window !== 'undefined' ? window : globalThis);
