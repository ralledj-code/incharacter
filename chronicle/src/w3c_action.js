(function (root) {
'use strict';
const C = root.__cw, THREE = C.THREE;
const { clamp, lerp, sm } = C;

/* Story actions keyed to song time (usually lyric lines), so what is sung happens on screen.
   C.act(obj, steps) -> { update(t) }. steps: [{ t, pose?, to?, face?, move?, y?, s?, show?, fn? }] in time order:
     t     start time (s). Tip: X.line(k) = start of lyric line k (0-based over the whole song), X.line(k, +0.5) offsets.
     pose  clip name for rigged characters/creatures (userData.pose)
     to    Vector3 (or [x,z] / () => Vector3) to move to; travels from the previous position over `move` s (default: walk at 1.6 m/s)
     face  Vector3 / Object3D / angle (rad) to turn toward (eases over 0.4 s)
     y     height offset (jumps, flying); s = uniform scale; show = visible on/off
     fn    (u, t) => {} custom effect while this step runs (u = seconds since step start)
   Everything is evaluated from t alone, so seeking works. */
const V = new THREE.Vector3(), V2 = new THREE.Vector3();
function asVec(p, out) {
  if (!p) return null;
  if (typeof p === 'function') return out.copy(p());
  if (Array.isArray(p)) return out.set(p[0], 0, p[1]);
  if (p.isObject3D) return p.getWorldPosition(out);
  return out.copy(p);
}
C.act = function (obj, steps) {
  // resolve positions once: each step starts where the previous one ended
  const pts = [], start = obj.position.clone();
  let cur = start.clone();
  steps.forEach((s) => {
    const from = cur.clone(), to = s.to ? asVec(s.to, new THREE.Vector3()) : null;
    if (to) { to.y = obj.position.y; cur = to.clone(); }
    const dist = to ? from.distanceTo(to) : 0;
    pts.push({ from, to: to || from, dur: s.move !== undefined ? s.move : dist / 1.6 });
  });
  let lastPose = null;
  return {
    steps,
    update(t, ctx) {
      let i = -1;
      for (let k = 0; k < steps.length; k++) if (steps[k].t <= t) i = k;
      if (i < 0) { obj.position.copy(start); return; }
      const s = steps[i], p = pts[i], u = t - s.t, k = p.dur > 0 ? clamp(u / p.dur) : 1;
      obj.position.lerpVectors(p.from, p.to, p.dur > 0 && s.move === undefined ? k : sm(k));
      // find the most recent pose / face / y / s / show at or before i
      let pose = null, face = null, y = 0, sc = null, show = null;
      for (let j = i; j >= 0; j--) {
        const q = steps[j];
        if (pose === null && q.pose) pose = q.pose;
        if (face === null && q.face !== undefined) face = q.face;
        if (sc === null && q.s !== undefined) sc = q.s;
        if (show === null && q.show !== undefined) show = q.show;
      }
      if (s.y !== undefined) y = typeof s.y === 'function' ? s.y(u) : s.y;
      obj.position.y += y;
      // while travelling, walk/run toward the target unless a pose is given for this step
      const moving = p.dur > 0 && k < 1;
      if (obj.userData.pose) {
        const want = s.pose || (moving ? (p.from.distanceTo(p.to) / p.dur > 3 ? 'Sprint_Loop' : 'Walk_Loop') : pose);
        if (want && want !== lastPose) { obj.userData.pose(want); lastPose = want; }
      }
      const tgt = moving && !s.face ? p.to : face;
      if (tgt !== null && tgt !== undefined) {
        let ang;
        if (typeof tgt === 'number') ang = tgt;
        else { asVec(tgt, V2); ang = Math.atan2(V2.x - obj.position.x, V2.z - obj.position.z); }
        let d = ang - obj.rotation.y; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2;
        obj.rotation.y += d * (ctx && ctx.dt ? Math.min(1, ctx.dt * 8) : 1);
        if (!ctx || !ctx.dt || ctx.seek) obj.rotation.y = ang;
      }
      if (sc !== null) obj.scale.setScalar(sc);
      if (show !== null) obj.visible = show;
      if (s.fn) s.fn(u, t);
    }
  };
};
/* run several actors: C.acts([a, b]) -> { update(t, ctx) } */
C.acts = (list) => ({ update(t, ctx) { list.forEach((a) => a && a.update(t, ctx)); } });
})(typeof window !== 'undefined' ? window : globalThis);
