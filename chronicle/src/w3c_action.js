(function (root) {
'use strict';
const C = root.__cw, THREE = C.THREE;
const { clamp, lerp } = C;

/* Actors: characters and creatures that move through a level, baked once and played back from song time.
   C.act(obj, beats, opts) registers an actor in X.actors and returns { update(t, ctx) } (call it from the scene's update;
   the engine also drives every actor, so calling it twice is harmless).

   beats: [{ t, to, move, by, speed, pose, face, show, s, y, air, fn }] in time order
     t      start time (s); use X.line(k, dt) to land on lyric line k
     to     where to go: Vector3 | [x, z] | Object3D | () => Vector3 | an array of those (a path through the points)
     move   seconds to get there (or `by`: arrival time); otherwise `speed`: 'walk' | 'jog' | 'sprint' | m/s
     pose   clip to use when standing still from this beat on (locomotion is chosen from the real speed while moving)
     face   Vector3 | Object3D | actor | angle (rad): who/where to face when standing still
     show / s / y / fn   visibility, uniform scale, height offset (number or u => number), custom effect (u, t)
     air    keep the target's y (jumps); with opts.fly all moves keep y
   opts: { fly, stance: { clip, at }, gait: [[clipName, strideSpeedPerMetre]...], idle, rigs: [rigged children] }

   Baking (first update after the level loads), at 30 samples/s over the song:
     1. positions: each move follows its path with an eased speed profile (accelerate, cruise, decelerate)
     2. heading: from velocity while moving (models face +z), else toward `face`; turn rate limited and smoothed
     3. animation: gait clip picked from the speed, played at speed / stride (no sliding feet); 0.35 s crossfades
   Seeking just reads the samples, so it stays deterministic. */
const HZ = 30, FADE = 0.35, TURN = 5.5;
// stride speeds per metre of character height, measured from planted feet (tools/clipspeeds.cjs)
const HUMAN_GAIT = [['Walk_Loop', 0.525], ['Jog_Fwd_Loop', 1.076], ['Sprint_Loop', 1.518]];
const LOCO = /^(Walk_Loop|Walk_Formal_Loop|Jog_Fwd_Loop|Sprint_Loop|Gallop|Walk|Run)$/;
const SPEEDS = { walk: 0.95, jog: 1.9, run: 2.6, sprint: 3.2 };
const tmp = new THREE.Vector3();

function vecOf(p, out) {
  if (!p && p !== 0) return null;
  if (typeof p === 'function') return out.copy(p());
  if (Array.isArray(p) && typeof p[0] === 'number') return out.set(p[0], 0, p[1]);
  if (p.isObject3D) return p.getWorldPosition(out);
  if (p.isVector3) return out.copy(p);
  return null;
}
const ease = (u) => { const a = 0.22; if (u < a) return u * u / (2 * a * (1 - a)); if (u > 1 - a) return 1 - (1 - u) * (1 - u) / (2 * a * (1 - a)); return (u - a / 2) / (1 - a); };  // trapezoid speed profile

C.act = function (obj, beats, opts) {
  opts = opts || {};
  const X = C.act.X; if (!X) return { update() { } };
  const a = { obj, beats, opts, baked: false, track: null, parentInv: null };
  obj.userData.actor = a;
  const h = obj.userData.h || 1.8;
  a.gait = (opts.gait || HUMAN_GAIT).map(([c, s]) => [c, s * h]);
  a.idle = opts.idle || 'Idle_Loop';
  a.rigs = opts.rigs || (obj.userData.mixer ? [obj] : []);
  a.rigs.forEach((r) => { r.userData.managed = true; r.userData._pose = r.userData._pose || r.userData.pose; r.userData.pose = () => { }; });  // scenes can no longer snap poses
  a.start = obj.position.clone();
  X.actors.push(a);
  a.update = (t, ctx) => { if (!a.baked) C.act.bakeAll(X); C.act.apply(a, t, ctx); };
  return a;
};
C.acts = (list) => ({ update(t, ctx) { list.forEach((x) => x && x.update(t, ctx)); } });

/* pass 1: positions for every actor (parent space), so pass 2 can face other actors */
function bakePositions(a, dur) {
  const N = Math.ceil(dur * HZ) + 2, P = new Float32Array(N * 3), segs = [];
  let cur = a.start.clone();
  // targets: an Object3D is resolved in world space and converted; Vector3 / [x, z] / functions are already in the parent's space
  const target = (q) => { if (q && q.isObject3D) { const v = q.getWorldPosition(new THREE.Vector3()); if (a.obj.parent) a.obj.parent.worldToLocal(v); return v; } return vecOf(q, new THREE.Vector3()); };
  const posAt = (t) => {   // evaluate segments so far
    let p = a.start.clone();
    for (const s of segs) { if (t < s.t0) break; p = s.at(Math.min(1, (t - s.t0) / Math.max(1e-3, s.t1 - s.t0))); if (t < s.t1) break; }
    return p;
  };
  a.beats.forEach((b) => {
    if (b.to === undefined || b.to === null) return;
    const from = posAt(b.t);
    if (segs.length && segs[segs.length - 1].t1 > b.t) segs[segs.length - 1].t1 = b.t;  // interrupted: the old move stops here
    const list = (Array.isArray(b.to) && typeof b.to[0] !== 'number') ? b.to : [b.to];
    const pts = [from];
    list.forEach((q) => { const l = target(q); if (!l) return; if (!a.opts.fly && !b.air) l.y = from.y; pts.push(l); });
    const lens = [0]; for (let i = 1; i < pts.length; i++) lens.push(lens[i - 1] + pts[i].distanceTo(pts[i - 1]));
    const L = lens[lens.length - 1];
    let dt = b.move !== undefined ? b.move : b.by !== undefined ? b.by - b.t : L / (typeof b.speed === 'number' ? b.speed : SPEEDS[b.speed || 'walk']);
    dt = Math.max(dt, 0.05);
    const yfn = typeof b.y === 'function' ? b.y : null;
    segs.push({ t0: b.t, t1: b.t + dt, at(u) {
      const s = ease(clamp(u)) * L; let i = 1; while (i < lens.length - 1 && lens[i] < s) i++;
      const k = (s - lens[i - 1]) / Math.max(1e-6, lens[i] - lens[i - 1]), p = new THREE.Vector3().lerpVectors(pts[i - 1], pts[Math.min(i, pts.length - 1)], clamp(k));
      if (yfn && b.air) p.y += yfn(u);
      return p;
    } });
  });
  for (let i = 0; i < N; i++) { const p = posAt(i / HZ); P[i * 3] = p.x; P[i * 3 + 1] = p.y; P[i * 3 + 2] = p.z; }
  // flyers glide: smooth the whole path (gaussian, opts.smooth seconds) so keyframes don't become stop-and-go
  const sm = a.opts.smooth !== undefined ? a.opts.smooth : (a.opts.fly ? 0.8 : 0);
  if (sm > 0) {
    const R = Math.round(sm * HZ), Wt = []; let ws = 0; for (let k = -R; k <= R; k++) { const w = Math.exp(-(k * k) / (2 * (R / 2) ** 2)); Wt.push(w); ws += w; }
    const Q = new Float32Array(P.length);
    for (let i = 0; i < N; i++) for (let c = 0; c < 3; c++) { let acc = 0; for (let k = -R; k <= R; k++) acc += P[clamp(i + k, 0, N - 1) * 3 + c] * Wt[k + R]; Q[i * 3 + c] = acc / ws; }
    P.set(Q);
  }
  a.track = { N, P };
}
function samplePos(a, t, out) {
  const T = a.track, f = clamp(t * HZ, 0, T.N - 1.001), i = Math.floor(f), k = f - i, P = T.P;
  return out.set(lerp(P[i * 3], P[i * 3 + 3], k), lerp(P[i * 3 + 1], P[i * 3 + 4], k), lerp(P[i * 3 + 2], P[i * 3 + 5], k));
}
C.act.samplePos = samplePos;

function moveBeatAt(a, t) { let m = null; for (const b of a.beats) { if (b.t > t) break; if (b.to !== undefined) m = b; } return m; }
/* the most recent value of a beat field at or before time t */
function beatAt(a, t, key) { let v; for (const b of a.beats) { if (b.t > t) break; if (b[key] !== undefined) v = b[key]; } return v; }

/* pass 2: heading + animation */
function bakeMotion(a, X) {
  const T = a.track, N = T.N, H = new Float32Array(N), CA = new Int16Array(N), PA = new Float32Array(N), CB = new Int16Array(N), PB = new Float32Array(N), WB = new Float32Array(N), V = new Float32Array(N);
  const clips = [], idx = (c) => { let i = clips.indexOf(c); if (i < 0) { clips.push(c); i = clips.length - 1; } return i; };
  const parentWorld = new THREE.Vector3(), self = new THREE.Vector3(), q = new THREE.Vector3();
  let head = a.obj.rotation.y, phase = 0, curClip = -1, prevClip = -1, prevPhase = 0, prevRate = 1, fadeT = 1e9, curRate = 1, stanceT0 = 0;
  for (let i = 0; i < N; i++) {
    const t = i / HZ;
    const p0 = samplePos(a, Math.max(0, t - 1 / HZ), new THREE.Vector3()), p1 = samplePos(a, t + 1 / HZ, new THREE.Vector3());
    const vx = (p1.x - p0.x) * HZ / 2, vz = (p1.z - p0.z) * HZ / 2, sp = Math.hypot(vx, vz);
    V[i] = sp;
    // heading
    let want = null;
    if (sp > 0.3) want = Math.atan2(vx, vz);
    else {
      const f = beatAt(a, t, 'face');
      if (typeof f === 'number') want = f;
      else if (f) {
        const sl = samplePos(a, t, new THREE.Vector3());
        if (f.userData && f.userData.actor && f.userData.actor.track) { samplePos(f.userData.actor, t, q); if (f.parent) f.parent.localToWorld(q); if (a.obj.parent) a.obj.parent.worldToLocal(q); }
        else if (f.isObject3D) { f.getWorldPosition(q); if (a.obj.parent) a.obj.parent.worldToLocal(q); }
        else if (!vecOf(f, q)) q.copy(sl);
        if (Math.hypot(q.x - sl.x, q.z - sl.z) > 0.05) want = Math.atan2(q.x - sl.x, q.z - sl.z);
      }
    }
    // knocked back / stepping back: keep facing while the move runs (beat.back)
    const mb = moveBeatAt(a, t); if (mb && mb.back && sp > 0.3) want = null;
    const hidden = beatAt(a, t, 'show') === false;
    if (hidden && want === null) {  // not on screen yet: face the direction of the first move after appearing
      for (let k = i + 1; k < Math.min(N - 1, i + HZ * 30); k++) {
        const q0 = samplePos(a, (k - 1) / HZ, new THREE.Vector3()), q1 = samplePos(a, (k + 1) / HZ, new THREE.Vector3());
        if (Math.hypot(q1.x - q0.x, q1.z - q0.z) * HZ / 2 > 0.3) { want = Math.atan2(q1.x - q0.x, q1.z - q0.z); break; }
      }
    }
    if (want !== null && (hidden || i === 0)) head = want;
    else if (want !== null) {
      let d = want - head; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2;
      const maxStep = (sp < 1.2 ? TURN * 2 : TURN) / HZ;  // pivot quickly from standing, turn wider when running
      head += clamp(d * 0.35, -maxStep, maxStep);
    }
    H[i] = head;
    // animation: gait from speed while moving, else the stance pose
    let clip, rate = 1;
    if (a.opts.fly) { clip = (a.opts.gait && a.opts.gait[0][0]) || a.idle; rate = 1; if (sp < 0.3 && a.opts.stance) { clip = a.opts.stance.clip; rate = 0; } }
    else if (sp > 0.3 && moveBeatAt(a, t) && (moveBeatAt(a, t).back || moveBeatAt(a, t).air)) { clip = beatAt(a, t, 'pose') && !LOCO.test(beatAt(a, t, 'pose')) ? beatAt(a, t, 'pose') : a.idle; }
    else if (sp > 0.3) {
      let g = a.gait[0]; for (const gg of a.gait) if (sp > gg[1] * 0.75) g = gg;
      clip = g[0]; rate = clamp(sp / g[1], 0.5, 2.0);
    } else {
      const ps = beatAt(a, t, 'pose'); clip = ps && !LOCO.test(ps) ? ps : a.idle;
      if (a.opts.stance && !ps) { clip = a.opts.stance.clip; rate = 0; }
    }
    const ci = idx(clip);
    if (ci !== curClip) {
      prevClip = curClip; prevPhase = phase; prevRate = curRate; fadeT = 0; curClip = ci;
      phase = rate === 0 && a.opts.stance ? a.opts.stance.at : (LOCO.test(clip) ? prevPhase : 0);  // locomotion keeps the stride phase
      stanceT0 = t;
    }
    curRate = rate;
    phase += rate / HZ; prevPhase += prevRate / HZ; fadeT += 1 / HZ;
    CA[i] = prevClip; PA[i] = prevPhase; CB[i] = curClip; PB[i] = phase; WB[i] = prevClip < 0 ? 1 : clamp(fadeT / FADE);
  }
  Object.assign(T, { H, CA, PA, CB, PB, WB, V, clips });
}

C.act.bakeAll = function (X) {
  const dur = (X.story && X.story.duration) || 400;
  X.actors.forEach((a) => { if (a.obj.parent) a.obj.parent.updateMatrixWorld(true); });
  X.actors.forEach((a) => { if (!a.track) bakePositions(a, dur); });
  X.actors.forEach((a) => { if (!a.baked) { bakeMotion(a, X); a.baked = true; } });
};

const actionsOf = (r) => r.userData._actions || (r.userData._actions = {});
function setClips(r, cA, pA, cB, pB, wB) {
  const m = r.userData.mixer; if (!m) return;
  const lib = r.userData.clipLib || (C.assets && C.assets.clips) || {}, acts = actionsOf(r);
  const find = (name) => lib[name] || (r.userData.clips && r.userData.clips.find((c) => c.name === name));
  const use = {}; if (cB) use[cB] = [pB, wB]; if (cA && wB < 1) use[cA] = [pA, 1 - wB];
  Object.keys(acts).forEach((k) => { if (!use[k]) { acts[k].enabled = false; } });
  Object.keys(use).forEach((k) => {
    let act = acts[k];
    if (!act) { const clip = find(k); if (!clip) return; act = acts[k] = m.clipAction(clip); act.play(); }
    act.enabled = true; act.setEffectiveWeight(use[k][1]); act.time = ((use[k][0] % act.getClip().duration) + act.getClip().duration) % act.getClip().duration;
  });
  m.update(0);
}

C.act.apply = function (a, t, ctx) {
  const T = a.track, o = a.obj; if (!T) return;
  samplePos(a, t, o.position);
  const f = clamp(t * HZ, 0, T.N - 1.001), i = Math.floor(f), k = f - i;
  let d = T.H[i + 1] - T.H[i]; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2;
  o.rotation.y = T.H[i] + d * k;
  if (a.opts.fly) {  // pitch with climb, bank into turns
    const p0 = samplePos(a, t - 0.2, new THREE.Vector3()), p1 = samplePos(a, t + 0.2, new THREE.Vector3()), hz = Math.hypot(p1.x - p0.x, p1.z - p0.z);
    o.rotation.x = hz > 0.05 ? clamp(-Math.atan2(p1.y - p0.y, hz) * 0.7, -0.6, 0.6) : 0;
    o.rotation.z = clamp(-d * HZ * 0.25, -0.5, 0.5);
  }
  const j = Math.round(f), clips = T.clips;
  a.rigs.forEach((r) => setClips(r, T.CA[j] >= 0 ? clips[T.CA[j]] : null, T.PA[j], clips[T.CB[j]], T.PB[j] + (f - j) / HZ, T.WB[j]));
  // non-motion beat fields
  const s = beatAt(a, t, 's'); if (s !== undefined) o.scale.setScalar(s);
  const show = beatAt(a, t, 'show'); if (show !== undefined) o.visible = show;
  let cur = null; for (const b of a.beats) { if (b.t > t) break; cur = b; }
  if (cur) {
    if (cur.y !== undefined && !cur.air) o.position.y += typeof cur.y === 'function' ? cur.y(t - cur.t) : cur.y;
    if (cur.fn) cur.fn(t - cur.t, t);
  }
};
/* position + heading only (no animation): used while baking the camera */
C.act.place = function (a, t) {
  const T = a.track, o = a.obj; if (!T || !T.H) return;
  samplePos(a, t, o.position);
  const i = clamp(Math.round(t * HZ), 0, T.N - 1); o.rotation.y = T.H[i];
  if (a.opts.fly) {
    const p0 = samplePos(a, t - 0.2, new THREE.Vector3()), p1 = samplePos(a, t + 0.2, new THREE.Vector3()), hz = Math.hypot(p1.x - p0.x, p1.z - p0.z);
    o.rotation.x = hz > 0.05 ? clamp(-Math.atan2(p1.y - p0.y, hz) * 0.7, -0.6, 0.6) : 0;
  }
};
/* debug/lint access: speed, heading and clip names at time t */
C.act.state = function (a, t) {
  const T = a.track, i = clamp(Math.round(t * HZ), 0, T.N - 1);
  const mb = moveBeatAt(a, i / HZ);
  return { hidden: beatAt(a, i / HZ, 'show') === false, speed: T.V[i], heading: T.H[i], clip: T.clips[T.CB[i]], from: T.CA[i] >= 0 ? T.clips[T.CA[i]] : null, w: T.WB[i], exempt: !!(mb && (mb.back || mb.air)) };
};
C.act.HZ = HZ;
})(typeof window !== 'undefined' ? window : globalThis);
