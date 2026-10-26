(function () {
'use strict';
const C = window.__cw;
const goBtn = document.getElementById('go');

/* ---------- song list (the start screen): one card per level, playable straight away, with a share link ----------
   ?song=<id> opens with that song on top; the flags ?painted / ?3d are carried into shared links. */
const qs = new URLSearchParams(location.search), wantId = qs.get('song');
const songList = document.getElementById('songs');
let booted = null, pendingPlay = null;  // booted = playFromList once the world is ready
function shareUrl(s) {
  const u = new URL(location.href); u.search = ''; u.hash = '';
  u.searchParams.set('song', s.id); ['painted', '3d'].forEach((k) => { if (qs.has(k)) u.searchParams.set(k, ''); });
  return u.toString().replace(/=(&|$)/g, '$1');
}
function share(s, btn) {
  const url = shareUrl(s), done = (t) => { btn.textContent = t; setTimeout(() => { btn.textContent = 'Share'; }, 2200); };
  if (navigator.share) { navigator.share({ title: s.title + ' · Alaron Chronicle', url }).catch(() => { }); return; }
  try { navigator.clipboard.writeText(url).then(() => done('Link copied'), () => prompt('Copy this link', url)); } catch (e) { prompt('Copy this link', url); }
}
function renderSongs() {
  const order = C.stories.map((s, i) => i);
  const wi = C.stories.findIndex((s) => s.id === wantId); if (wi >= 0) { order.splice(order.indexOf(wi), 1); order.unshift(wi); }
  songList.innerHTML = '';
  order.forEach((i) => {
    const s = C.stories[i], key = String(s.level).padStart(2, '0') + '-' + s.id, board = s.painted || (C.boards && C.boards[key]);
    const el = document.createElement('article'); el.className = 'song' + (s.locked ? ' locked' : '') + (i === wi ? ' focus' : ''); el.setAttribute('role', 'listitem');
    const cov = document.createElement('div'); cov.className = 'cover';
    if (board) cov.style.backgroundImage = 'url("' + new URL('levels/' + key + '/' + (board.cover || board.shots[0].id) + '.webp', C.BASE()) + '")';
    cov.innerHTML = '<b>' + s.level + '</b>' + (s.locked ? '<em>Coming soon</em>' : s.painted ? '<em>Painted</em>' : '');
    const tx = document.createElement('div'); tx.className = 'txt';
    tx.innerHTML = '<h3></h3><div class="meta"></div><p class="blurb"></p>';
    tx.querySelector('h3').textContent = s.title;
    tx.querySelector('.meta').textContent = 'Level ' + s.level + (s.date ? ' · ' + s.date : '') + ' · ' + s.length;
    tx.querySelector('.blurb').textContent = s.locked ? 'This chapter’s song is waiting to become a story.' : s.blurb;
    el.append(cov, tx);
    if (!s.locked) {
      const b = document.createElement('div'); b.className = 'btns';
      const play = document.createElement('button'); play.className = 'primary play'; play.textContent = 'Play';
      const sh = document.createElement('button'); sh.textContent = 'Share';
      play.onclick = () => { if (booted) booted(i, play); else { pendingPlay = [i, play]; play.textContent = 'Getting ready…'; } };
      sh.onclick = () => share(s, sh);
      b.append(play, sh); el.append(b);
    }
    songList.append(el);
  });
}
renderSongs();
C.loadAssets((k) => { goBtn.textContent = 'Loading the tavern… ' + Math.round(k * 100) + '%'; }).catch(() => { }).then(boot);
function boot() {
const THREE = C.THREE;
const $ = (id) => document.getElementById(id);
const clamp = C.clamp;
const mobile = !!(window.matchMedia && matchMedia('(pointer:coarse)').matches);

/* ---------- renderer ---------- */
const canvas = $('gl');
let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, powerPreference: 'high-performance' }); }
catch (e) { $('go').textContent = 'WebGL is not available here'; throw e; }
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2));
renderer.toneMapping = THREE.LinearToneMapping;
const EXPOS = [1.0, 1.35, 1.8, 0.8]; let expI = 0; renderer.toneMappingExposure = EXPOS[0];
const W = C.create({ mobile });
W.book.setStories(C.stories); W.book.setIndex(C.firstStory || 0, true);
const P = C.createPainted(renderer, { mobile });  // painted levels (w5_painted)
function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); W.resize(w, h); P.resize(w, h); }
addEventListener('resize', resize); resize();

/* ---------- state ---------- */
const player = { x: 0, z: 4.4, yaw: 0, pitch: 0 };
const look = { yaw: 0, pitch: 0 };
let mode = 'walk', sitT = 1, sitting = false, auto = null, time = 0, idle = 0;
let story = null, started = false, paused = false, ended = false;
const keys = {}; let padHeld = false;

/* ---------- audio ---------- */
const audio = new Audio(); audio.preload = 'auto';
// each level's song is fetched when its page is first shown (story.audio, relative to the page)
const BASE = C.BASE(), songs = {};
function wantSong(s) {
  if (!s || s.locked || songs[s.id]) return;
  const e = songs[s.id] = { state: 'loading', url: null };
  fetch(new URL(s.audio, BASE)).then((r) => { if (!r.ok) throw 0; return r.blob(); })
    .then((b) => { e.url = URL.createObjectURL(b); e.state = 'ready'; refreshBookUI(); })
    .catch(() => { e.state = 'err'; refreshBookUI(); });
}
const songState = (s) => (songs[s.id] ? songs[s.id].state : 'loading');
function pickSong(s) {  // fallback when the file is missing: let the player choose the mp3
  const l = document.createElement('label'); l.style.cssText = 'color:var(--dim);font-size:.95rem;pointer-events:auto';
  l.innerHTML = 'The song did not load. Pick the mp3: <input type="file" accept="audio/*">';
  l.querySelector('input').onchange = (ev) => { const f = ev.target.files[0]; if (f) { songs[s.id] = { state: 'ready', url: URL.createObjectURL(f) }; l.remove(); refreshBookUI(); } };
  $('hint').appendChild(l);
}
audio.addEventListener('ended', () => { if (mode === 'ride') finish(); });

/* ---------- start ---------- */
$('go').disabled = false; $('go').textContent = 'Step into the tavern';
let fromList = false;
function unlockAudio() { try { audio.muted = true; const p = audio.play(); if (p && p.then) p.then(() => { audio.pause(); audio.currentTime = 0; audio.muted = muted; }).catch(() => { audio.muted = muted; }); } catch (e) { } }
// play a song straight from the list: fetch its art/packs + song with progress on the card's button, then start the ride
booted = (i, btn) => {
  const s = C.stories[i]; if (!s || s.locked || requesting) return;
  unlockAudio(); requesting = true; wantSong(s);
  let kp = s.packsReady ? 1 : 0;
  const show = () => { const ka = songState(s) === 'ready' ? 1 : 0.3; btn.textContent = 'Lucien tunes up… ' + Math.round((kp * 0.6 + ka * 0.4) * 100) + '%'; };
  const tk = setInterval(show, 200); show();
  const waitSong = new Promise((res) => { const k = setInterval(() => { if (songState(s) !== 'loading') { clearInterval(k); res(); } }, 100); });
  const art = s.packsReady ? Promise.resolve() : s.painted ? P.preload(s, (k) => { kp = k; }) : C.loadPacks(s.packs || [], (k) => { kp = k; });
  Promise.all([art, waitSong]).then(() => {
    clearInterval(tk); requesting = false; s.packsReady = true; btn.textContent = 'Play';
    if (songState(s) !== 'ready') { btn.textContent = 'Song missing'; return; }
    if (mobile && document.documentElement.requestFullscreen && !document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => { });
    fromList = true; $('start').hidden = true; $('top').hidden = false; $('hud').hidden = false; started = true;
    W.book.setIndex(i, true); mode = 'book'; sitting = false; sitT = 1; begin();
  });
};
function toList() {
  audio.pause(); W.endRide(); tavernMusic(false); mode = 'walk'; sitting = false; ended = false; fromList = false; started = false;
  $('fade').style.opacity = 0; $('end').hidden = true; $('lyric').classList.remove('on'); $('stamp').classList.remove('on'); $('title').classList.remove('on'); lastTitle = null;
  $('top').hidden = true; $('hud').hidden = true; $('start').hidden = false; refreshUI();
  if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => { });
}
$('go').onclick = () => {
  tavernMusic(true);
  $('start').hidden = true; $('top').hidden = false; $('hud').hidden = false; started = true;
  unlockAudio(); refreshUI();
};

/* ---------- input ---------- */
let drag = null;
let lastTouch = performance.now();
['pointerdown', 'pointermove', 'keydown'].forEach((n) => addEventListener(n, () => { lastTouch = performance.now(); }, true));
canvas.addEventListener('pointerdown', (e) => { if (!started) return; canvas.setPointerCapture(e.pointerId); drag = { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, t: performance.now() }; idle = 0; });
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY; idle = 0;
  const k = 0.0045;
  if (mode === 'walk') { player.yaw -= dx * k; player.pitch = clamp(player.pitch - dy * k, -1.2, 1.2); }
  else if (mode === 'ride') { look.yaw -= dx * k; look.pitch = clamp(look.pitch - dy * k, -1.3, 1.3); }
  else if (mode === 'book') { look.pitch = clamp(look.pitch - dy * k, -0.6, 0.8); }
});
function endDrag(e) {
  if (!drag) return;
  const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy, quick = performance.now() - drag.t < 700;
  if (mode === 'book' && !sitting && quick && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) flip(dx < 0 ? 1 : -1);
  drag = null;
}
canvas.addEventListener('pointerup', endDrag); canvas.addEventListener('pointercancel', () => { drag = null; });
addEventListener('keydown', (e) => {
  if (!started || e.repeat && e.code !== 'ArrowLeft' && e.code !== 'ArrowRight') { keys[e.code] = true; return; }
  keys[e.code] = true; idle = 0;
  if (e.code === 'KeyE' && mode === 'walk' && W.nearChair) sit();
  if (mode === 'book') { if (e.code === 'ArrowRight') flip(1); if (e.code === 'ArrowLeft') flip(-1); if (e.code === 'Enter' || e.code === 'Space') begin(); if (e.code === 'Escape') standUp(); }
  if (mode === 'ride') { if (e.code === 'Space') { e.preventDefault(); togglePause(); } if (e.code === 'Escape') backToBook(); }
  if (e.code === 'KeyM') toggleMute();
  if (e.code === 'KeyD') { const d = $('dev'); d.style.display = d.style.display === 'block' ? 'none' : 'block'; }
  if (e.code === 'KeyK' && mode === 'ride') { marks.push(+audio.currentTime.toFixed(1)); }
});
addEventListener('keyup', (e) => { keys[e.code] = false; });
const marks = [];
const pad = $('walkpad');
pad.addEventListener('pointerdown', (e) => { padHeld = true; pad.setPointerCapture(e.pointerId); e.preventDefault(); });
['pointerup', 'pointercancel'].forEach((n) => pad.addEventListener(n, () => { padHeld = false; }));

const HINT_FAR = 'The tavern is loud tonight. Lucien is on stage, his songbook on the stand in front.';
const HINT_NEAR = 'Lucien grins at you. Pick a song from his book.';

/* ---------- tavern music: a CC0 loop (The Old Tower Inn, RandomMind), gapless via Web Audio ---------- */
let actx = null, tavGain = null, tavOn = false;
function tavernMusic(on) {
  tavOn = on;
  if (!actx) {
    if (!on) return;
    try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    tavGain = actx.createGain(); tavGain.gain.value = 0; tavGain.connect(actx.destination);
    fetch(new URL('tavern-loop.mp3', BASE)).then((r) => r.arrayBuffer()).then((b) => actx.decodeAudioData(b)).then((buf) => {
      const src = actx.createBufferSource(); src.buffer = buf; src.loop = true;
      src.loopStart = 0.026; src.loopEnd = Math.min(buf.duration, 0.026 + 49.95);  // skip the mp3 encoder's lead-in so the loop is seamless
      src.connect(tavGain); src.start(0, 0.026); tavernMusic(tavOn);
    }).catch(() => { });
  }
  if (actx.state === 'suspended') actx.resume();
  const g = tavGain.gain, now = actx.currentTime;
  g.cancelScheduledValues(now); g.setValueAtTime(g.value, now); g.linearRampToValueAtTime(on && !muted ? 0.45 : 0, now + (on ? 2.5 : 0.8));
}
/* ---------- first-visit coach: one hint per step, each shown once (remembered on this device) ---------- */
const COACH = {
  look: mobile ? 'Drag anywhere to look around.' : 'Drag with the mouse to look around.',
  walk: mobile ? 'Hold the Walk button to walk. Head for the stage at the back.' : 'Walk with W A S D (or the arrow keys). Head for the stage at the back.',
  stage: 'You reached Lucien. Ask him for a song.',
  book: mobile ? 'Swipe the songbook (or tap ◀ ▶) to pick a song, then ask for it.' : 'Turn the pages with ◀ ▶ or the arrow keys, then ask for a song.',
  ride: 'Sit back: the camera follows the song. Pause and Calm camera are top right; tap the bar at the bottom to jump.'
};
let coachSeen = {}; try { coachSeen = JSON.parse(localStorage.getItem('alaron:coach') || '{}'); } catch (e) { }
let coachKey = null, coachT = 0;
function coach(key) {
  if (key === coachKey || (key && coachSeen[key])) return;
  if (coachKey) { coachSeen[coachKey] = 1; try { localStorage.setItem('alaron:coach', JSON.stringify(coachSeen)); } catch (e) { } }
  coachKey = key; coachT = 0; const el = $('coach');
  if (key) { el.textContent = COACH[key]; el.classList.add('on'); } else el.classList.remove('on');
}
function coachTick(dt) {
  if (!started) return;
  coachT += dt;
  if (coachKey && coachT > (coachKey === 'ride' ? 9 : 14)) { coach(null); return; }  // never nag
  if (mode === 'walk') {
    if (W.nearChair) coach('stage');
    else if (!coachSeen.look && coachKey !== 'look') coach('look');
    else if (coachKey === 'look' && (drag || coachT > 5)) coach('walk');
    else if (!coachKey && !coachSeen.walk) coach('walk');
  } else if (mode === 'book' && !sitting) coach('book');
  else if (mode === 'ride' && !(story && story.painted)) coach('ride');
}
let calm = false;
try { calm = localStorage.getItem('alaron:calm') === '1'; } catch (e) { }

/* ---------- actions ---------- */
function sit() {
  if (sitting || mode !== 'walk') return;
  auto = null; mode = 'book'; sitT = 0; sitting = true; look.yaw = 0; look.pitch = 0; refreshUI();
}
function standUp() { if (mode !== 'book') return; mode = 'walk'; sitting = false; player.x = W.STAND.x; player.z = W.STAND.z + 0.8; player.yaw = 0; player.pitch = 0; refreshUI(); }
function flip(d) { const before = W.book.index; if (d > 0) W.book.next(); else W.book.prev(); if (W.book.index !== before) refreshBookUI(); }
function curStory() { return C.stories[W.book.index]; }
let requesting = false;
function begin() {
  const s = curStory(); if (!s || s.locked || mode !== 'book' || sitting || requesting) return;
  if (songState(s) !== 'ready' || !s.packsReady) {
    // first request of this song: fetch its level packs and audio (shared packs are cached), then start
    requesting = true; wantSong(s);
    const btn = $('bBegin'); let kp = 0;
    const show = () => { const ka = songState(s) === 'ready' ? 1 : 0.4; btn.textContent = 'Lucien tunes up… ' + Math.round((kp * 0.5 + ka * 0.5) * 100) + '%'; };
    const tk = setInterval(show, 250); show();
    const waitSong = new Promise((res) => { const k = setInterval(() => { if (songState(s) !== 'loading') { clearInterval(k); res(); } }, 100); });
    const art = s.painted ? P.preload(s, (k) => { kp = k; }) : C.loadPacks(s.packs || [], (k) => { kp = k; });
    Promise.all([art, waitSong]).then(() => {
      clearInterval(tk); requesting = false; s.packsReady = true;
      if (songState(s) === 'ready') begin(); else refreshBookUI();
    });
    return;
  }
  story = s; loadTimes(s); if (s.painted) P.start(s); else W.loadStory(s); tavernMusic(false);
  if (audio.src !== songs[s.id].url) { audio.src = songs[s.id].url; audio.load(); }
  mode = 'ride'; ended = false; paused = false;
  W.beginRide({ x: W.SEAT.x, y: W.SEAT.y, z: W.SEAT.z, yaw: look.yaw * 0.6, pitch: -0.33 + look.pitch * 0.6 });
  look.yaw = 0; look.pitch = 0;
  audio.currentTime = 0; audio.muted = muted;
  const p = audio.play(); if (p && p.catch) p.catch(() => { $('hint').textContent = 'Tap Begin again to start the sound.'; mode = 'book'; W.endRide(); refreshUI(); });
  $('fade').style.opacity = 0; $('end').hidden = true; refreshUI();
  if (s.painted && mobile && innerHeight > innerWidth * 1.15) { $('hint').textContent = 'Turn your phone sideways for the full picture.'; setTimeout(() => { if (mode === 'ride') $('hint').textContent = ''; }, 5000); }
}
function backToBook() {
  if (fromList) { toList(); return; }
  audio.pause(); W.endRide(); tavernMusic(true); mode = 'book'; sitting = false; sitT = 1; ended = false; look.yaw = 0; look.pitch = 0;
  $('fade').style.opacity = 0; $('end').hidden = true; $('lyric').classList.remove('on'); $('stamp').classList.remove('on'); $('title').classList.remove('on'); lastTitle = null; refreshUI();
}
function togglePause() { if (mode !== 'ride' || ended) return; paused = !paused; if (paused) audio.pause(); else audio.play(); $('bPause').textContent = paused ? 'Resume' : 'Pause'; }
let muted = false;
function toggleMute() { muted = !muted; audio.muted = muted; $('bMute').textContent = muted ? 'Sound off' : 'Sound on'; tavernMusic(tavOn); }
function finish() { if (ended) return; ended = true; $('bBack').textContent = fromList ? 'Back to the songs' : 'Back to the tavern'; $('fade').style.opacity = 1; setTimeout(() => { if (ended && mode === 'ride') $('end').hidden = false; }, 1400); }

$('bSit').onclick = sit;
$('bAuto').onclick = () => { auto = { t: 0, x: player.x, z: player.z, yaw: player.yaw }; };
$('bPrev').onclick = () => flip(-1); $('bNext').onclick = () => flip(1); $('bBegin').onclick = begin;
$('bMute').onclick = toggleMute; $('bPause').onclick = togglePause;
const calmLabel = () => { $('bCalm').textContent = calm ? 'Calm camera' : 'Wild camera'; };
$('bCalm').onclick = () => { calm = !calm; try { localStorage.setItem('alaron:calm', calm ? '1' : '0'); } catch (e) { } calmLabel(); }; calmLabel();
$('bBright').onclick = () => { expI = (expI + 1) % EXPOS.length; renderer.toneMappingExposure = EXPOS[expI]; $('bBright').textContent = 'Brightness ' + (expI + 1); };
$('bClose').onclick = () => { if (mode === 'ride') backToBook(); else standUp(); };
$('bBack').onclick = backToBook;
$('bAgain').onclick = () => { const fl = fromList; fromList = false; backToBook(); fromList = fl; begin(); };
$('prog').addEventListener('pointerdown', (e) => {
  if (mode !== 'ride' || !story) return; const r = e.currentTarget.getBoundingClientRect();
  audio.currentTime = clamp((e.clientX - r.left) / r.width, 0, 1) * story.duration; ended = false; $('fade').style.opacity = 0; $('end').hidden = true;
  e.stopPropagation();
});

/* ---------- lyric sync (tap to the real vocals) ---------- */
let syncing = false, taps = [];
function syncShow() {
  const f = story.flat, n = taps.length;
  $('syncLine').textContent = n < f.length ? (n + 1) + '/' + f.length + '  ' + f[n].tx : 'All lines tapped.';
  $('bTap').disabled = n >= f.length;
}
$('bSync').onclick = () => {
  if (mode !== 'ride') return; syncing = true; taps = []; story.flat = flatLines(story);
  audio.currentTime = 0; if (paused) togglePause(); audio.play(); ended = false; $('fade').style.opacity = 0; $('end').hidden = true;
  $('sync').hidden = false; $('syncOut').hidden = true; $('lyric').classList.remove('on'); lastLine = ''; syncShow();
};
function tap() { if (!syncing || taps.length >= story.flat.length) return; taps.push(+Math.max(0, audio.currentTime - 0.2).toFixed(2)); syncShow(); }
$('bTap').onclick = tap;
$('bUndo').onclick = () => { taps.pop(); syncShow(); };
$('bSyncDone').onclick = () => {
  const full = taps.length === story.flat.length;
  if (full) { story.times = taps.slice(); try { localStorage.setItem('alaron:' + story.id, JSON.stringify(taps)); } catch (e) { } }
  const o = $('syncOut'); o.value = JSON.stringify(taps); o.hidden = false; o.focus(); o.select();
  try { navigator.clipboard.writeText(o.value).catch(() => { }); } catch (e) { }
  syncing = false; $('sync').querySelector('.row').hidden = true; $('syncLine').textContent = full ? 'Saved on this device and copied. Send me these numbers to bake them in.' : 'Incomplete, so not applied.';
  setTimeout(() => { $('sync').hidden = true; $('sync').querySelector('.row').hidden = false; }, 9000);
};
addEventListener('keydown', (e) => { if (syncing && e.code === 'Space') { e.preventDefault(); tap(); } }, true);

/* ---------- UI refresh ---------- */
function refreshBookUI() {
  if (mode !== 'book') return;
  const s = curStory(); if (!s) return;
  // songs load when requested (begin), not while browsing the book
  const st = s.locked ? 'locked' : songs[s.id] ? songState(s) : 'idle', meta = s.session + ' · ' + s.length + (st === 'err' ? ' · song missing' : '');
  $('hint').innerHTML = '<b style="font-family:var(--head);letter-spacing:.1em;font-size:1.25rem">' + s.title + '</b><br><span style="color:var(--ember);font-size:.9rem">' + meta + '</span><br>' + s.blurb;
  if (!s.locked && st === 'err' && !songs[s.id].asked) { songs[s.id].asked = true; pickSong(s); }
  $('bBegin').disabled = !!s.locked || requesting;
  if (!requesting) $('bBegin').textContent = s.locked ? 'Coming soon' : 'Ask for this song';
  $('bPrev').disabled = W.book.index === 0; $('bNext').disabled = W.book.index >= W.book.count - 1;
}
let lastNear = null;
function refreshUI() {
  const walk = mode === 'walk', bk = mode === 'book' && !sitting, ride = mode === 'ride';
  $('rowBook').hidden = !bk; $('hud').classList.toggle('book', mode === 'book'); $('prog').style.display = ride ? 'block' : 'none';
  $('bPause').hidden = !ride; $('bSync').hidden = !ride; $('bClose').hidden = walk; $('bCalm').hidden = !ride; $('bBright').hidden = ride;  // top bar fits a phone
  $('bClose').textContent = ride ? (fromList ? (innerWidth < 560 ? 'Songs' : 'Back to the songs') : innerWidth < 560 ? 'Book' : 'Back to the book') : 'Stand up';
  pad.style.display = walk && mobile ? 'block' : 'none';
  if (walk) { $('hint').textContent = W.nearChair ? HINT_NEAR : HINT_FAR; }
  if (bk) refreshBookUI();
  if (ride) $('hint').textContent = '';
  if (sitting) $('hint').textContent = '';
  lastNear = null;
}

/* ---------- lyrics ---------- */
const cueAt = (t) => { let k = 0; story.cues.forEach((c, i) => { if (c.t <= t) k = i; }); return k; };
let lastLine = '', lastStamp = '', lastTitle = null;
function flatLines(s) { const a = []; s.cues.forEach((c, ci) => (c.lines || []).forEach((tx, k) => a.push({ ci, k, tx }))); return a; }
function loadTimes(s) {
  s.flat = flatLines(s);
  let tm = s.lineTimes || null;
  try { const v = JSON.parse(localStorage.getItem('alaron:' + s.id) || 'null'); if (v && v.length === s.flat.length) tm = v; } catch (e) { }
  s.times = tm;
}
function lyricsAt(t) {
  const cues = story.cues, i = cueAt(Math.max(0, t)), c = cues[i], nx = cues[i + 1], end = nx ? nx.t : story.duration;
  const st = c.stamp && t - c.t < 7 && t >= c.t ? c.stamp : '';
  if (st !== lastStamp) { lastStamp = st; if (st) $('stamp').textContent = st; $('stamp').classList.toggle('on', !!st); }
  // name cards: who someone is, the first time they appear (level `titles: [{ t, name, sub, dur }]`)
  const tc = (story.titles || []).find((x) => t >= x.t && t < x.t + (x.dur || 4.5)) || null;
  if (tc !== lastTitle) { lastTitle = tc; if (tc) { $('title').firstChild.textContent = tc.name; $('title').lastChild.textContent = tc.sub || ''; } $('title').classList.toggle('on', !!tc); }
  let line = '';
  if (story.times && !syncing) {
    const tm = story.times; let k = -1;
    for (let j = 0; j < tm.length; j++) if (tm[j] != null && tm[j] <= t) k = j; else if (tm[j] != null) break;
    if (k >= 0) { const nxt = k + 1 < tm.length ? tm[k + 1] : 1e9; if (t < Math.min(nxt - 0.1, tm[k] + 7)) line = story.flat[k].tx; }
  } else if (c.lines && c.lines.length && t >= c.t) {
    const a = c.t + 0.4, b = end - 0.4, n = c.lines.length, seg = (b - a) / n;
    if (t >= a && t < b) { const k = Math.min(n - 1, Math.floor((t - a) / seg)); const within = (t - a) - k * seg; line = within < seg - 0.5 ? c.lines[k] : ''; }
  }
  if (line !== lastLine) { lastLine = line; const el = $('lyric'); if (line) { el.textContent = line; el.classList.add('on'); } else el.classList.remove('on'); }
}

/* ---------- loop ---------- */
let last = performance.now(), fpsAcc = 0, fpsN = 0, fps = 0;
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000); last = now; time += dt; idle += dt;
  fpsAcc += dt; fpsN++; if (fpsAcc > 0.5) { fps = fpsN / fpsAcc; fpsAcc = 0; fpsN = 0; }

  if (mode === 'walk' && started) {
    if (auto) {
      auto.t = Math.min(1, auto.t + dt / 2.6); const e = C.sm(auto.t);
      player.x = C.lerp(auto.x, W.STAND.x, e); player.z = C.lerp(auto.z, W.STAND.z, e); player.yaw = C.lerp(auto.yaw, 0, e); player.pitch *= 0.95;
      if (auto.t >= 1) { auto = null; sit(); }
    } else {
      let fwd = 0, side = 0;
      if (keys.KeyW || keys.ArrowUp || padHeld) fwd += 1; if (keys.KeyS || keys.ArrowDown) fwd -= 1;
      if (keys.KeyD) side += 1; if (keys.KeyA) side -= 1;
      if (keys.ArrowLeft) player.yaw += dt * 1.6; if (keys.ArrowRight) player.yaw -= dt * 1.6;
      if (fwd || side) W.walkStep(player, { fwd, side }, dt);
    }
  }
  if (sitting) { sitT = Math.min(1, sitT + dt / 1.6); if (sitT >= 1) { sitting = false; refreshUI(); } }
  if (mode === 'ride' && idle > 15 && !drag) { look.yaw *= Math.exp(-dt * 0.5); look.pitch *= Math.exp(-dt * 0.5); }

  const t = mode === 'ride' ? audio.currentTime : -1;
  const painted = mode === 'ride' && story && story.painted;
  if (dev.hold) { dev.shot(dev.hold); return; }
  coachTick(dt);
  if (!painted) W.update({ mode, t, dt, time, player, look, sit: sitT, calm });
  if (mode === 'walk' && started && W.nearChair !== lastNear) { lastNear = W.nearChair; $('rowSit').hidden = !W.nearChair || !!auto; if (!auto) $('hint').textContent = W.nearChair ? (HINT_NEAR + (mobile ? '' : ' (E)')) : HINT_FAR; }
  if (mode !== 'walk') $('rowSit').hidden = true;
  $('flash').style.opacity = W.flash.toFixed(3);

  $('top').classList.toggle('away', mode === 'ride' && !ended && !paused && now - lastTouch > 3500);
  if (mode === 'ride' && story) {
    lyricsAt(t);
    $('prog').firstElementChild.style.width = (t / story.duration * 100).toFixed(2) + '%';
    if (!ended && t >= story.silenceT) finish();
  }
  if ($('dev').style.display === 'block') {
    $('dev').textContent = 'fps ' + fps.toFixed(0) + '  mode ' + mode + '\nt ' + t.toFixed(1) + '  cue ' + (story && mode === 'ride' ? story.cues[cueAt(Math.max(0, t))].id : '-') + (painted ? '  shot ' + P.info().shot : '\nd ' + W.camD.toFixed(0)) + '\nmarks (K): ' + marks.join(', ');
  }
  if (painted) P.render(t, time, calm); else renderer.render(W.scene, W.camera);
}
// dev.hold = a fixed W.update state (renders that instead of live input); dev.shot(state) renders one frame now
const dev = { hold: null, shot(st) {
  if (st.mode === 'ride' && story && story.painted) { P.render(st.t, st.time, true); return; }
  W.update(st); renderer.render(W.scene, W.camera);
}, painted: P, play(s) { story = s; loadTimes(s); P.start(s); mode = 'ride'; } };
requestAnimationFrame(frame);
if (pendingPlay) { const [i, b] = pendingPlay; pendingPlay = null; booted(i, b); }
window.__alaron = { W, renderer, dev, player, look, audio, get mode() { return mode; }, sit, begin, flip, seek(t) { audio.currentTime = t; } };
}
})();
