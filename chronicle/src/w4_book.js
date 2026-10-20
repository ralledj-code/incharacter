(function (root) {
'use strict';
const C = root.__cw, THREE = C.THREE;
const { TAU, clamp, lerp, sm, M, bx, cy, solid } = C;

/* ---------- page art, drawn on canvas ---------- */
const INK = '#2a1a10', PAPER = ['#e2d2ac', '#d4c094'];
const FONT_BODY = '"IM Fell DW Pica", Georgia, serif', FONT_HEAD = '"IM Fell English SC", Georgia, serif';
function paper(w, h, mirror) {
  const c = C.cv(w, h), x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, PAPER[0]); g.addColorStop(1, PAPER[1]);
  x.fillStyle = g; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 260; i++) { x.fillStyle = 'rgba(80,50,20,' + (0.02 + C.R(0, 0.05)) + ')'; x.beginPath(); x.arc(C.R(0, w), C.R(0, h), C.R(2, 26), 0, TAU); x.fill(); }
  if (mirror === 'h') { x.translate(w, 0); x.scale(-1, 1); } else if (mirror === 'hv') { x.translate(w, h); x.scale(-1, -1); }
  return { c, x };
}
function wrap(x, text, mx, y, maxW, lh) {
  const words = text.split(' '); let line = '';
  words.forEach((w) => {
    const t = line ? line + ' ' + w : w;
    if (x.measureText(t).width > maxW && line) { x.fillText(line, mx, y); y += lh; line = w; } else line = t;
  });
  if (line) { x.fillText(line, mx, y); y += lh; }
  return y;
}
function artPage(story, mirror) {
  const { c, x } = paper(512, 700, mirror);
  x.strokeStyle = INK; x.lineWidth = 3; x.strokeRect(34, 34, 444, 632);
  x.lineWidth = 1; x.strokeRect(44, 44, 424, 612);
  if (story.locked) {
    const ROM = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV'];
    x.fillStyle = 'rgba(42,26,16,0.55)'; x.textAlign = 'center';
    x.font = '110px ' + FONT_HEAD; x.fillText(ROM[(story.level || 1) - 1] || String(story.level), 256, 380);
    x.font = '26px ' + FONT_BODY; x.fillText('the ink is not dry yet', 256, 470);
  } else {
    // the moonwell and its chains
    x.strokeStyle = INK; x.fillStyle = INK; x.lineWidth = 3;
    x.beginPath(); x.ellipse(256, 420, 120, 36, 0, 0, TAU); x.stroke();
    x.beginPath(); x.ellipse(256, 420, 90, 24, 0, 0, TAU); x.stroke();
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI * (0.15 + i * 0.14), ex = 256 + Math.cos(a) * 190, ey = 420 + Math.sin(a) * 250;
      x.beginPath(); x.moveTo(256, 420); x.quadraticCurveTo((256 + ex) / 2, (420 + ey) / 2 + 40, ex, ey); x.setLineDash([9, 7]); x.stroke(); x.setLineDash([]);
    }
    x.beginPath(); x.arc(256, 170, 46, 0, TAU); x.stroke();
    x.beginPath(); x.arc(274, 162, 40, 0, TAU); x.fillStyle = PAPER[0]; x.fill();
    x.fillStyle = INK; x.font = '22px ' + FONT_BODY; x.textAlign = 'center'; x.fillText('the moonwell of Alaron', 256, 560);
  }
  return c;
}
function textPage(story, idx, total, mirror) {
  const { c, x } = paper(512, 700, mirror);
  x.fillStyle = INK; x.textAlign = 'center';
  x.font = '20px ' + FONT_HEAD; x.fillText(story.session, 256, 92);
  x.font = '44px ' + FONT_HEAD;
  let y = wrap(x, story.title, 256, 170, 400, 52);
  x.strokeStyle = INK; x.lineWidth = 1.5; x.beginPath(); x.moveTo(176, y - 20); x.lineTo(336, y - 20); x.stroke();
  x.font = '23px ' + FONT_BODY; x.textAlign = 'left';
  y = wrap(x, story.blurb, 70, y + 30, 372, 31);
  x.textAlign = 'center'; x.font = '21px ' + FONT_HEAD;
  if (!story.locked) { x.fillText(story.length + '  ·  a song in one sitting', 256, 590); x.font = '24px ' + FONT_HEAD; x.fillText('— turn to hear it —', 256, 628); }
  else { x.font = '30px ' + FONT_HEAD; x.fillText('— coming soon —', 256, 610); }
  x.font = '18px ' + FONT_BODY; x.fillText((idx + 1) + ' / ' + total, 256, 664);
  return c;
}
function tex(canvas) { const t = new THREE.CanvasTexture(canvas); t.anisotropy = 4; return t; }

/* ---------- the lectern and the book ---------- */
C.buildBook = function (X) {
  const g = new THREE.Group();
  const lec = solid([
    bx(0.7, 0.07, 0.5, 0x3a2618, [0, 0.95, 0], [0.5, 0, 0]), bx(0.1, 0.95, 0.1, 0x2c1e14, [0, 0.47, 0.05]),
    bx(0.5, 0.06, 0.4, 0x2c1e14, [0, 0.03, 0.05]), bx(0.74, 0.06, 0.06, 0x2c1e14, [0, 0.87, -0.17])
  ]);
  g.add(lec);
  g.position.set(X.STAND.x, 0, X.STAND.z - 1.15);  // Lucien's music stand, in front of the stage

  const book = new THREE.Group();     // lies on the lectern desk, tilted toward the reader
  book.position.set(0, 1.0, 0.03); book.rotation.x = 0.5;
  g.add(book);
  const W = 0.3, H = 0.42, HB = 0.022;
  const cover = new THREE.MeshLambertMaterial({ color: 0x4a1f1a });
  const blk = new THREE.MeshLambertMaterial({ color: 0xe6d8b4 });
  const mkBox = (w, h, d, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); book.add(m); return m; };
  mkBox(W * 2 + 0.03, 0.012, H + 0.03, cover, 0, 0.006, 0);
  mkBox(W - 0.01, HB, H - 0.01, blk, -W / 2, 0.012 + HB / 2, 0);
  mkBox(W - 0.01, HB, H - 0.01, blk, W / 2, 0.012 + HB / 2, 0);
  mkBox(0.02, HB + 0.014, H + 0.03, cover, 0, 0.016, 0);

  const pivotY = 0.012 + HB;
  let stories = [], leaves = [], cur = 0, texCache = [];
  const leafGeoF = new THREE.PlaneGeometry(W, H); leafGeoF.rotateX(-Math.PI / 2); leafGeoF.translate(W / 2, 0, 0);
  const leafGeoB = new THREE.PlaneGeometry(W, H); leafGeoB.rotateX(Math.PI / 2); leafGeoB.translate(W / 2, 0, 0);
  const baseL = new THREE.Mesh(leafGeoF.clone(), new THREE.MeshLambertMaterial({ color: 0xb8ae9a }));
  baseL.scale.x = -1; baseL.position.set(0, pivotY + 0.0008, 0); book.add(baseL);
  const baseR = new THREE.Mesh(leafGeoF.clone(), new THREE.MeshLambertMaterial({ color: 0xd8c8a0 }));
  baseR.position.set(0, pivotY + 0.0008, 0); book.add(baseR);

  function setStories(list) {
    leaves.forEach((l) => book.remove(l.pivot)); leaves = []; stories = list; cur = 0;
    const N = list.length;
    // left page of spread 0 lives on the base; leaf j: front = right page j, back = left page j+1
        const right = list.map((s, i) => tex(textPage(s, i, N, false)));
    // the left base uses scale.x=-1 so its texture is mirrored: draw the first left page mirrored
    baseL.material.map = tex(artPage(list[0], 'h')); baseL.material.needsUpdate = true;
    for (let j = 0; j < N; j++) {
      const pivot = new THREE.Group(); pivot.position.set(0, pivotY, 0);
      const front = new THREE.Mesh(leafGeoF, new THREE.MeshLambertMaterial({ map: right[j], color: 0xb8ae9a }));
      const backTex = j + 1 < N ? tex(artPage(list[j + 1], 'hv')) : null;
      const back = new THREE.Mesh(leafGeoB, new THREE.MeshLambertMaterial(backTex ? { map: backTex, color: 0xb8ae9a } : { color: 0xa89c80 }));
      // both faces hug the pivot; the pivot's height (set in update) keeps the stacks in order on both sides
      front.position.y = 0.0003; back.position.y = -0.0003;
      pivot.add(front); pivot.add(back);
      // text of the next spread's right page sits on the following leaf; the left text page is on the back, so overlay is art only
      book.add(pivot);
      leaves.push({ pivot, ang: 0, yR: pivotY + 0.0012 * (N - j), yL: pivotY + 0.0012 * (j + 1) });
    }
    texCache = { right };
  }
  function setIndex(i, snap) { cur = clamp(i, 0, stories.length - 1); if (snap) leaves.forEach((l, j) => { l.ang = j < cur ? Math.PI : 0; l.pivot.rotation.z = l.ang; l.pivot.position.y = j < cur ? l.yL : l.yR; }); }
  return {
    group: g, W, H, setStories,
    get index() { return cur; }, get count() { return stories.length; },
    next() { if (cur < stories.length - 1) cur++; return cur; },
    prev() { if (cur > 0) cur--; return cur; },
    setIndex,
    update(dt) {
      leaves.forEach((l, j) => {
        const target = j < cur ? Math.PI : 0;
        l.ang += (target - l.ang) * (1 - Math.exp(-dt * 7));
        l.pivot.rotation.z = l.ang;
        // unturned leaves: lower index on top; turned leaves: higher index on top
        l.pivot.position.y = lerp(l.yR, l.yL, l.ang / Math.PI) + Math.sin(l.ang) * 0.02;
      });
    }
  };
};

/* hub = tavern + lectern with the book */
C.buildHub = function (X) {
  const bar = C.buildBar(X), book = C.buildBook(X);
  const group = new THREE.Group(); group.add(bar.group); group.add(book.group);
  const colliders = bar.colliders;
  return {
    group, colliders, book,
    update(t, ctx) { bar.update(t, ctx); book.update(ctx.dt || 0.016); }
  };
};
})(typeof window !== 'undefined' ? window : globalThis);
