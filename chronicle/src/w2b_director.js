(function (root) {
'use strict';
const C = root.__cw, THREE = C.THREE;
const { clamp, lerp, sm, ss } = C;

/* Camera director: a level's music-video shot list, evaluated purely from song time t (seek-safe).
   level.shots(X, D) returns [{ t, blend?, cam }] sorted by t; each shot runs until the next one.
   cam(t, u, o) writes o.pos / o.look (Vector3) and optionally o.fov, o.roll; u = 0..1 progress through the shot.
   blend > 0 eases from the previous shot over that many seconds, else it is a hard cut.
   D (below) builds cam functions. Targets: Vector3, Object3D (world position), or () => Vector3. */
const V = () => new THREE.Vector3();
let fallback = null;  // set per frame: a point ahead on the rail
function at(target, out) {
  if (!target) return fallback ? out.copy(fallback) : out.set(0, 0, 0);
  if (typeof target === 'function') return out.copy(target());
  if (target.isObject3D) return target.getWorldPosition(out);
  return out.copy(target);
}
const ease = (u) => sm(u);

C.makeDirector = function (X) {
  const D = {
    /* along the rail: side (m, +right), h (m), ahead = how far ahead to look, lead = offset along the rail */
    rail(o) {
      o = o || {};
      return (t, u, out) => {
        const d = X.distAt(t) + (o.lead || 0), f = X.frame(d);
        out.pos.set(f.x - f.tz * (o.side || 0), o.h || 1.4, f.z + f.tx * (o.side || 0));
        if (o.target) at(o.target, out.look); else { const g = X.frame(d + (o.ahead || 12)); out.look.set(g.x - g.tz * (o.lookSide || 0), o.lookH || 1.2, g.z + g.tx * (o.lookSide || 0)); }
        if (o.fov) out.fov = o.fov;
      };
    },
    /* circle a target: r radius, h height, a0 start angle (rad), w angular speed (rad/s), lookH added to target */
    orbit(target, o) {
      o = o || {}; const c = V();
      return (t, u, out) => {
        at(target, c); const a = (o.a0 || 0) + (o.w === undefined ? 0.25 : o.w) * (t - (o.t0 || 0));
        const r = lerp(o.r || 6, o.r1 === undefined ? (o.r || 6) : o.r1, ease(u)), h = lerp(o.h || 2, o.h1 === undefined ? (o.h || 2) : o.h1, ease(u));
        out.pos.set(c.x + Math.cos(a) * r, c.y + h, c.z + Math.sin(a) * r);
        out.look.copy(c); out.look.y += o.lookH === undefined ? 1.2 : o.lookH;
        if (o.fov) out.fov = o.fov;
      };
    },
    /* move from a to b (points or targets) while looking at target (or from lookA to lookB) */
    dolly(a, b, target, o) {
      o = o || {}; const pa = V(), pb = V(), la = V(), lb = V();
      return (t, u, out) => {
        const e = o.linear ? u : ease(u);
        at(a, pa); at(b, pb); out.pos.lerpVectors(pa, pb, e);
        if (o.lookB) { at(target, la); at(o.lookB, lb); out.look.lerpVectors(la, lb, e); } else at(target, out.look);
        if (o.lookH) out.look.y += o.lookH;
        if (o.fov) out.fov = lerp(o.fov, o.fov1 || o.fov, e);
      };
    },
    /* ride alongside a moving target: offset [right, up, forward] in the target's heading frame */
    track(target, o) {
      o = o || {}; const c = V(), q = new THREE.Quaternion(), off = V(), lk = V();
      return (t, u, out) => {
        at(target, c);
        if (target && target.isObject3D) target.getWorldQuaternion(q); else q.identity();
        off.set(...(o.offset || [3, 1.6, 0])).applyQuaternion(q); out.pos.copy(c).add(off);
        lk.set(...(o.lookOffset || [0, 1.3, 0])).applyQuaternion(q); out.look.copy(c).add(lk);
        if (o.fov) out.fov = o.fov;
      };
    },
    /* locked-off camera with an optional slow push toward the target (push = fraction of the distance) */
    fixed(pos, target, o) {
      o = o || {}; const p = V(), c = V();
      return (t, u, out) => {
        at(pos, p); at(target, c); out.pos.lerpVectors(p, c, (o.push || 0) * ease(u)); out.look.copy(c);
        if (o.lookH) out.look.y += o.lookH;
        if (o.fov) out.fov = lerp(o.fov, o.fov1 || o.fov, ease(u));
        if (o.roll) out.roll = o.roll;
      };
    },
    /* rail helpers for scenes and shots */
    p: (d, side, h) => X.at(d, side || 0, h || 0),
    dAt: (t) => X.distAt(t)
  };

  let shots = [], beats = null;
  const A = { pos: V(), look: V(), fov: 60, roll: 0 }, B = { pos: V(), look: V(), fov: 60, roll: 0 };
  const reset = (o) => { o.fov = 60; o.roll = 0; };
  function evalShot(i, t, o) {
    const s = shots[i], t1 = i + 1 < shots.length ? shots[i + 1].t : s.t + 8;
    reset(o); s.cam(t, clamp((t - s.t) / Math.max(0.01, t1 - s.t)), o);
  }
  function kickAt(list, t, decay) {  // 1 on the beat, decaying after it
    if (!list || !list.length) return 0;
    let lo = 0, hi = list.length - 1;
    if (t < list[0]) return 0;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (list[m] <= t) lo = m; else hi = m; }
    const b = list[hi] <= t ? list[hi] : list[lo];
    return Math.exp(-(t - b) * decay);
  }
  return {
    D,
    set(level) {
      shots = typeof level.shots === 'function' ? level.shots(X, D).filter(Boolean).sort((a, b) => a.t - b.t) : [];
      beats = level.beats || null;
    },
    get active() { return shots.length > 0; },
    shotIndex(t) { let k = 0; for (let i = 0; i < shots.length; i++) if (shots[i].t <= t) k = i; return k; },
    /* writes camera pose for song time t; returns the pose object */
    pose(t, camera, calm) {
      fallback = X.at(X.distAt(t) + 12, 0, 1.2);
      const i = this.shotIndex(t), s = shots[i];
      evalShot(i, t, A);
      if (s.blend && i > 0 && t - s.t < s.blend) {
        evalShot(i - 1, t, B); const k = ease((t - s.t) / s.blend);
        A.pos.lerpVectors(B.pos, A.pos, k); A.look.lerpVectors(B.look, A.look, k); A.fov = lerp(B.fov, A.fov, k); A.roll = lerp(B.roll, A.roll, k);
      }
      // music: a small zoom punch on every bar, a shake on strong hits (off in calm mode)
      let fov = A.fov, shake = 0;
      // beat kicks/shake removed: they read as jitter on phones (feedback 2026-10-20). Beats still drive cuts and band animation.
      camera.position.copy(A.pos);
      if (shake) camera.position.add(new THREE.Vector3(Math.sin(t * 91) * shake, Math.sin(t * 67 + 1) * shake, Math.sin(t * 53 + 2) * shake));
      camera.up.set(0, 1, 0); camera.lookAt(A.look);
      if (A.roll) camera.rotateZ(A.roll);
      if (Math.abs(camera.fov - fov) > 0.01) { camera.fov = fov; camera.updateProjectionMatrix(); }
      return A;
    }
  };
};
})(typeof window !== 'undefined' ? window : globalThis);
