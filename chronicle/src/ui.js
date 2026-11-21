(function () {
'use strict';
/* Alaron Chronicle: the song list and the painted-song player (2026-11-21: the 3D tavern, songbook and 3D rides are gone).
   Player controls follow the usual video-player layout: back + title on top, a seek bar and play / skip / volume / time /
   captions / settings / landscape / fullscreen at the bottom; they fade out while the song plays and come back on any touch. */
const C = window.__cw;
const $ = (id) => document.getElementById(id);
const clamp = C.clamp;
const qs = new URLSearchParams(location.search), wantId = qs.get('song');
const mobile = !!(window.matchMedia && matchMedia('(pointer:coarse)').matches);
const BASE = C.BASE();
const store = { get(k, d) { try { const v = localStorage.getItem('alaron:' + k); return v == null ? d : v; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem('alaron:' + k, v); } catch (e) { } } };

/* ---------- song list (the start screen) ----------
   ?song=<id> puts that song on top; a hidden (family) song's own link shows only that song; /chronicle/familie or ?familie
   lists every family song and nothing from the campaign; ?painted previews boards that are not live yet. */
const songList = $('songs');
const soloStory = C.stories.find((s) => s.id === wantId && s.hidden && !s.locked);
if (soloStory) { document.body.classList.add('solo'); document.title = soloStory.title; }
const family = !wantId && (qs.has('familie') || /\/familie\/?$/.test(location.pathname));
if (family) {
  document.body.classList.add('family'); document.title = 'Familiens sange';
  const h = $('songsHead'); h.querySelector('h1').textContent = 'Familiens sange';
  h.querySelector('p').textContent = 'Sange om Oskar, Walter, Max, Tine og hele familien. Tryk Play.';
}
function shareUrl(s) {
  const u = new URL(location.href); u.search = ''; u.hash = ''; u.pathname = u.pathname.replace(/\/familie\/?$/, '');
  u.searchParams.set('song', s.id); if (qs.has('painted')) u.searchParams.set('painted', '');
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
    const s = C.stories[i];
    if (family) { if (!s.hidden) return; } else if (s.hidden && i !== wi) return;  // family songs: only through their own link or the family page
    if (soloStory && s !== soloStory) return;
    const key = String(s.level).padStart(2, '0') + '-' + s.id, board = s.painted || (C.boards && C.boards[key]);
    const el = document.createElement('article'); el.className = 'song' + (s.locked ? ' locked' : '') + (s.feature ? ' feature' : '') + (i === wi ? ' focus' : ''); el.setAttribute('role', 'listitem');
    const cov = document.createElement('div'); cov.className = 'cover';
    if (board) cov.style.backgroundImage = 'url("' + new URL('levels/' + key + '/' + (board.cover || board.shots[0].id) + '.webp', BASE) + '")';
    cov.innerHTML = '<b>' + (s.hidden || s.feature ? (s.feature ? '' : '♪') : s.level) + '</b>' + (s.locked ? '<em>Coming soon</em>' : '');
    const tx = document.createElement('div'); tx.className = 'txt';
    tx.innerHTML = '<h3></h3><div class="meta"></div><p class="blurb"></p>';
    tx.querySelector('h3').textContent = s.title;
    tx.querySelector('.meta').textContent = s.feature ? s.meta || s.length : (s.hidden ? '' : 'Level ' + s.level + (s.date ? ' · ' + s.date : '') + ' · ') + s.length;
    tx.querySelector('.blurb').textContent = s.locked ? 'This chapter’s song is waiting to become a story.' : s.blurb;
    el.append(cov, tx);
    if (!s.locked) {
      const b = document.createElement('div'); b.className = 'btns';
      const play = document.createElement('button'); play.className = 'primary play'; play.textContent = 'Play';
      const sh = document.createElement('button'); sh.textContent = 'Share';
      play.onclick = () => playFromList(s, play);
      sh.onclick = () => share(s, sh);
      b.append(play); if (!soloStory) b.append(sh); el.append(b);
    }
    songList.append(el);
  });
}
renderSongs();

/* ---------- renderer ---------- */
const THREE = C.THREE, canvas = $('gl');
let renderer = null, P = null;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2));
  renderer.toneMapping = THREE.LinearToneMapping;
  P = C.createPainted(renderer, { mobile });
} catch (e) { songList.insertAdjacentHTML('beforebegin', '<p style="text-align:center;color:var(--ember)">This browser cannot show the paintings (WebGL is off).</p>'); }
const EXPOS = [1.0, 1.35, 1.8, 0.8]; let expI = 0;
function resize() {
  // the landscape view only makes sense on a portrait screen; a real turn to landscape switches it off
  if (document.body.classList.contains('rot') && innerWidth > innerHeight) document.body.classList.remove('rot');
  const rot = document.body.classList.contains('rot');
  document.body.style.setProperty('--sw', innerWidth + 'px'); document.body.style.setProperty('--sh', innerHeight + 'px');
  if (renderer) { const w = rot ? innerHeight : innerWidth, h = rot ? innerWidth : innerHeight; renderer.setSize(w, h, false); P.resize(w, h); }
  refreshRot();
}
addEventListener('resize', resize);

/* ---------- state ---------- */
let story = null, playing = false, ended = false, requesting = false, time = 0;
let calm = store.get('calm', '0') === '1', captions = store.get('cc', '1') === '1', muted = false;

/* ---------- audio ---------- */
const audio = new Audio(); audio.preload = 'auto';
const songs = {};  // id -> { state: loading|ready|err, url }
function wantSong(s) {
  if (!s || s.locked || songs[s.id]) return;
  const e = songs[s.id] = { state: 'loading', url: null };
  fetch(new URL(s.audio, BASE)).then((r) => { if (!r.ok) throw 0; return r.blob(); })
    .then((b) => { e.url = URL.createObjectURL(b); e.state = 'ready'; })
    .catch(() => { e.state = 'err'; });
}
const songState = (s) => (songs[s.id] ? songs[s.id].state : 'loading');
function unlockAudio() { try { audio.muted = true; const p = audio.play(); if (p && p.then) p.then(() => { audio.pause(); audio.currentTime = 0; audio.muted = muted; }).catch(() => { audio.muted = muted; }); } catch (e) { } }
audio.addEventListener('ended', () => { if (story) finish(); });
audio.addEventListener('play', () => { playing = true; refreshPlay(); wakeOn(); });
audio.addEventListener('pause', () => { playing = false; refreshPlay(); wakeOff(); showControls(); });

/* keep the phone awake while a song plays, and tell the OS what is playing (lock screen, headset buttons) */
let wake = null;
function wakeOn() {
  if (wake || !navigator.wakeLock || document.visibilityState !== 'visible') return;
  navigator.wakeLock.request('screen').then((w) => { wake = w; w.addEventListener('release', () => { wake = null; }); }).catch(() => { });
}
function wakeOff() { if (wake) { wake.release().catch(() => { }); wake = null; } }
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && !audio.paused) wakeOn(); });
function mediaSession(s) {
  if (!('mediaSession' in navigator)) return;
  try {
    navigator.mediaSession.metadata = new MediaMetadata({ title: s.title, artist: s.hidden ? '' : 'Lucien Vale', album: 'Alaron Chronicle',
      artwork: [{ src: new URL(s.paintBase + (s.painted.cover || s.painted.shots[0].id) + '.webp', BASE).href, sizes: '1600x900', type: 'image/webp' }] });
    const ms = navigator.mediaSession;
    ms.setActionHandler('play', () => audio.play());
    ms.setActionHandler('pause', () => audio.pause());
    ms.setActionHandler('seekbackward', (d) => seekBy(-(d.seekOffset || 10)));
    ms.setActionHandler('seekforward', (d) => seekBy(d.seekOffset || 10));
    ms.setActionHandler('seekto', (d) => seekTo(d.seekTime));
  } catch (e) { }
}

/* ---------- play / leave ---------- */
// fetch the song's paintings and audio with progress on the card's button, then open the player
function playFromList(s, btn) {
  if (!s || s.locked || requesting || !P) return;
  unlockAudio(); requesting = true; wantSong(s);
  let kp = s.artReady ? 1 : 0;
  const show = () => { const ka = songState(s) === 'ready' ? 1 : 0.3; btn.textContent = 'Loading… ' + Math.round((kp * 0.6 + ka * 0.4) * 100) + '%'; };
  const tk = setInterval(show, 200); show();
  const waitSong = new Promise((res) => { const k = setInterval(() => { if (songState(s) !== 'loading') { clearInterval(k); res(); } }, 100); });
  const art = s.artReady ? Promise.resolve() : P.preload(s, (k) => { kp = k; });
  Promise.all([art, waitSong]).then(() => {
    clearInterval(tk); requesting = false; s.artReady = true; btn.textContent = 'Play';
    if (songState(s) !== 'ready') { btn.textContent = 'Song missing'; return; }
    if (mobile && document.documentElement.requestFullscreen && !document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => { });
    start(s);
  });
}
function start(s) {
  story = s; loadTimes(s); P.start(s); mediaSession(s);
  if (audio.src !== songs[s.id].url) { audio.src = songs[s.id].url; audio.load(); }
  $('start').hidden = true; $('player').hidden = false; $('hud').hidden = false; document.body.classList.add('playing');
  $('ptitle').textContent = s.title; $('pmeta').textContent = s.hidden ? '' : s.feature ? (s.meta || '') : 'Level ' + s.level + (s.date ? ' · ' + s.date : '');
  ended = false; $('end').hidden = true; $('fade').style.opacity = 0; lastLine = null;
  audio.currentTime = 0; audio.muted = muted;
  const p = audio.play(); if (p && p.catch) p.catch(() => showControls());
  resize(); showControls();
  if (mobile && innerHeight > innerWidth * 1.15) hint('Turn your phone sideways for the full picture, or tap the rotate button.', 5000);
}
function toList() {
  audio.pause(); story = null; ended = false; closeMenu();
  $('fade').style.opacity = 0; $('end').hidden = true; $('player').hidden = true; $('hud').hidden = true; $('lyric').classList.remove('on'); $('title').classList.remove('on');
  $('start').hidden = false; document.body.classList.remove('playing');
  if (document.body.classList.contains('rot')) { document.body.classList.remove('rot'); resize(); }
  if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => { });
}
function finish() {
  if (ended) return; ended = true; audio.pause();
  const plain = !!(story && story.hidden);  // a song outside the campaign ends on its own title, without Lucien
  $('end').querySelector('h2').textContent = plain ? story.title : 'Lucien takes a bow.';
  $('bBack').textContent = family ? 'Tilbage til sangene' : 'Back to the songs'; $('bBack').hidden = plain && !family;
  $('bAgain').textContent = family || plain ? 'Igen' : 'Play it again';
  $('fade').style.opacity = 1; setTimeout(() => { if (ended && story) $('end').hidden = false; }, 1400);
}
function togglePlay() { if (!story) return; if (ended) { again(); return; } if (audio.paused) audio.play(); else audio.pause(); }
function seekTo(t) {
  if (!story) return; audio.currentTime = clamp(t, 0, story.duration - 0.05);
  if (ended && t < story.silenceT) { ended = false; $('fade').style.opacity = 0; $('end').hidden = true; audio.play(); }
  showControls();
}
const seekBy = (d) => seekTo(audio.currentTime + d);
function again() { if (!story) return; const s = story; ended = false; $('end').hidden = true; $('fade').style.opacity = 0; start(s); }
function toggleMute() { muted = !muted; audio.muted = muted; refreshVol(); }
function toggleCC() { captions = !captions; store.set('cc', captions ? '1' : '0'); $('bCC').classList.toggle('on', captions); if (!captions) $('lyric').classList.remove('on'); lastLine = null; }
function toggleFull() {
  const d = document;
  if (d.fullscreenElement) { if (d.exitFullscreen) d.exitFullscreen().catch(() => { }); }
  else if (d.documentElement.requestFullscreen) d.documentElement.requestFullscreen().catch(() => { });
}
document.addEventListener('fullscreenchange', () => { $('bFull').innerHTML = ICON[document.fullscreenElement ? 'unfull' : 'full']; });

/* ---------- controls ---------- */
const ICON = {
  play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
  pause: '<svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>',
  replay: '<svg viewBox="0 0 24 24"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>',
  back: '<svg viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20z"/></svg>',
  rew: '<svg viewBox="0 0 24 24"><path d="M11.99 5V1l-5 5 5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6h-2c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/><text x="12" y="16.2" text-anchor="middle" font-size="7" font-family="sans-serif" font-weight="700">10</text></svg>',
  fwd: '<svg viewBox="0 0 24 24"><path d="M12.01 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"/><text x="12" y="16.2" text-anchor="middle" font-size="7" font-family="sans-serif" font-weight="700">10</text></svg>',
  vol: '<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>',
  mute: '<svg viewBox="0 0 24 24"><path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.8 8.8 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z"/></svg>',
  cc: '<svg viewBox="0 0 24 24"><path d="M19 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm-8 7H9.5v-.5h-2v3h2V13H11v1a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1zm7 0h-1.5v-.5h-2v3h2V13H18v1a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1z"/></svg>',
  gear: '<svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96a7.03 7.03 0 0 0-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84a.47.47 0 0 0-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L2.74 8.87a.47.47 0 0 0 .12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.47.47 0 0 0-.12-.61l-2.01-1.58zM12 15.6a3.6 3.6 0 1 1 0-7.2 3.6 3.6 0 0 1 0 7.2z"/></svg>',
  rot: '<svg viewBox="0 0 24 24"><path d="M16.48 2.52c3.27 1.55 5.61 4.72 5.97 8.48h1.5C23.44 4.84 18.29 0 12 0l-.66.03 3.81 3.81 1.33-1.32zm-6.25-.77a1.49 1.49 0 0 0-2.12 0L1.75 8.11a1.49 1.49 0 0 0 0 2.12l12.02 12.02c.59.59 1.54.59 2.12 0l6.36-6.36a1.49 1.49 0 0 0 0-2.12L10.23 1.75zm4.6 19.44L2.81 9.17l6.36-6.36 12.02 12.02-6.36 6.36zm-7.31.29A10.5 10.5 0 0 1 1.55 13H.05C.56 19.16 5.71 24 12 24l.66-.03-3.81-3.81-1.33 1.32z"/></svg>',
  full: '<svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>',
  unfull: '<svg viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>'
};
$('bExit').innerHTML = ICON.back; $('bRew').innerHTML = ICON.rew; $('bFwd').innerHTML = ICON.fwd; $('bCC').innerHTML = ICON.cc; $('bSet').innerHTML = ICON.gear;
$('bRot').innerHTML = ICON.rot; $('bFull').innerHTML = ICON.full; $('bCC').classList.toggle('on', captions);
function refreshPlay() { const k = ended ? 'replay' : audio.paused ? 'play' : 'pause'; $('bPlay').innerHTML = ICON[k]; $('bBig').innerHTML = ICON[k]; $('bPlay').setAttribute('aria-label', k === 'pause' ? 'Pause (Space)' : 'Play (Space)'); $('player').classList.toggle('paused', audio.paused); }
function refreshVol() { $('bVol').innerHTML = ICON[muted ? 'mute' : 'vol']; $('bVol').setAttribute('aria-label', muted ? 'Sound on (M)' : 'Mute (M)'); }
function refreshRot() { const b = $('bRot'); if (b) b.hidden = !(mobile && (innerHeight > innerWidth || document.body.classList.contains('rot'))); }
refreshPlay(); refreshVol();
const fmt = (t) => { t = Math.max(0, Math.floor(t)); return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0'); };

// controls show on any pointer move / touch and fade out after 3 s while the song plays
let lastActive = performance.now(), shown = true;
function showControls() { lastActive = performance.now(); if (!shown) { shown = true; $('player').classList.remove('idle'); document.body.classList.remove('idle'); } }
function hideControls() { if (!shown || audio.paused || menuOpen || scrubbing) return; shown = false; $('player').classList.add('idle'); document.body.classList.add('idle'); }
['pointermove', 'pointerdown', 'keydown'].forEach((n) => addEventListener(n, (e) => { if (story && !(n === 'pointermove' && e.pointerType === 'touch')) { if (n !== 'pointerdown' || e.target.closest('#player button, #seek, #menu')) showControls(); else if (e.pointerType === 'mouse') showControls(); } }, true));
// the picture: mouse click = play/pause, double click = fullscreen; on a touch screen a tap shows or hides the controls
$('tapzone').addEventListener('click', (e) => {
  if (!story || ended) return;
  if (menuOpen) { closeMenu(); return; }
  if (mobile) { if (shown && !audio.paused) { shown = true; lastActive = 0; hideControls(); } else showControls(); return; }
  togglePlay();
});
$('tapzone').addEventListener('dblclick', (e) => { if (!mobile) { toggleFull(); togglePlay(); } });
$('bPlay').onclick = togglePlay; $('bBig').onclick = togglePlay;
$('bRew').onclick = () => seekBy(-10); $('bFwd').onclick = () => seekBy(10);
$('bVol').onclick = toggleMute; $('bCC').onclick = toggleCC; $('bFull').onclick = toggleFull;
$('bExit').onclick = toList; $('bBack').onclick = toList; $('bAgain').onclick = again;
$('bRot').onclick = () => { document.body.classList.toggle('rot'); resize(); };
// settings menu: brightness, camera, lyric sync
let menuOpen = false;
function closeMenu() { menuOpen = false; $('menu').hidden = true; }
function menuLabels() {
  $('mBright').textContent = 'Brightness · ' + ['Normal', 'Bright', 'Brighter', 'Dim'][expI];
  $('mCalm').textContent = 'Camera · ' + (calm ? 'Calm' : 'Lively');
}
$('bSet').onclick = (e) => { e.stopPropagation(); menuOpen = !menuOpen; $('menu').hidden = !menuOpen; menuLabels(); showControls(); };
$('mBright').onclick = () => { expI = (expI + 1) % EXPOS.length; if (renderer) renderer.toneMappingExposure = EXPOS[expI]; menuLabels(); };
$('mCalm').onclick = () => { calm = !calm; store.set('calm', calm ? '1' : '0'); menuLabels(); };
$('mSync').onclick = () => { closeMenu(); syncStart(); };
// seek bar: click or drag anywhere on it (runs down the screen in the turned-sideways view)
let scrubbing = false;
function seekFrac(e) {
  const r = $('seek').getBoundingClientRect(), rot = document.body.classList.contains('rot');
  return clamp(rot ? (e.clientY - r.top) / r.height : (e.clientX - r.left) / r.width, 0, 1);
}
$('seek').addEventListener('pointerdown', (e) => { if (!story) return; scrubbing = true; $('seek').setPointerCapture(e.pointerId); $('seek').classList.add('drag'); seekTo(seekFrac(e) * story.duration); e.stopPropagation(); });
$('seek').addEventListener('pointermove', (e) => {
  if (!story) return; const k = seekFrac(e);
  $('seektip').textContent = fmt(k * story.duration); $('seektip').style.left = (k * 100).toFixed(2) + '%';
  if (scrubbing) seekTo(k * story.duration);
});
['pointerup', 'pointercancel'].forEach((n) => $('seek').addEventListener(n, () => { scrubbing = false; $('seek').classList.remove('drag'); }));
addEventListener('keydown', (e) => {
  if (!story || e.target.tagName === 'TEXTAREA') return;
  const k = e.code;
  if (syncing && k === 'Space') { e.preventDefault(); tap(); return; }
  if (k === 'Space' || k === 'KeyK') { e.preventDefault(); togglePlay(); }
  else if (k === 'ArrowLeft') { e.preventDefault(); seekBy(-5); } else if (k === 'ArrowRight') { e.preventDefault(); seekBy(5); }
  else if (k === 'KeyJ') seekBy(-10); else if (k === 'KeyL') seekBy(10);
  else if (k === 'KeyM') toggleMute(); else if (k === 'KeyF') toggleFull(); else if (k === 'KeyC') toggleCC();
  else if (k === 'Escape') { if (menuOpen) closeMenu(); else if (!document.fullscreenElement) toList(); }
  else if (k === 'KeyD') { const d = $('dev'); d.style.display = d.style.display === 'block' ? 'none' : 'block'; }
  else if (/^Digit\d$/.test(k)) seekTo(story.duration * (+k.slice(5)) / 10);
});
let hintT = 0;
function hint(text, ms) { const h = $('hint'); h.textContent = text; h.classList.add('on'); clearTimeout(hintT); hintT = setTimeout(() => h.classList.remove('on'), ms || 4000); }

/* ---------- lyric sync (settings menu: tap to the real vocals) ---------- */
let syncing = false, taps = [];
function syncShow() {
  const f = story.flat, n = taps.length;
  $('syncLine').textContent = n < f.length ? (n + 1) + '/' + f.length + '  ' + f[n].tx : 'All lines tapped.';
  $('bTap').disabled = n >= f.length;
}
function syncStart() {
  syncing = true; taps = []; story.flat = flatLines(story);
  seekTo(0); audio.play();
  $('sync').hidden = false; $('syncOut').hidden = true; $('sync').querySelector('.row').hidden = false; $('lyric').classList.remove('on'); lastLine = null; syncShow();
}
function tap() { if (!syncing || taps.length >= story.flat.length) return; taps.push(+Math.max(0, audio.currentTime - 0.2).toFixed(2)); syncShow(); }
$('bTap').onclick = tap;
$('bUndo').onclick = () => { taps.pop(); syncShow(); };
$('bSyncDone').onclick = () => {
  const full = taps.length === story.flat.length;
  if (full) { story.times = taps.slice(); store.set(story.id, JSON.stringify(taps)); }
  const o = $('syncOut'); o.value = JSON.stringify(taps); o.hidden = false; o.focus(); o.select();
  try { navigator.clipboard.writeText(o.value).catch(() => { }); } catch (e) { }
  syncing = false; $('sync').querySelector('.row').hidden = true; $('syncLine').textContent = full ? 'Saved on this device and copied. Send me these numbers to bake them in.' : 'Incomplete, so not applied.';
  setTimeout(() => { $('sync').hidden = true; }, 9000);
};

/* ---------- lyrics ---------- */
const cueAt = (t) => { let k = 0; story.cues.forEach((c, i) => { if (c.t <= t) k = i; }); return k; };
let lastLine = null, lastTitle = null;
function flatLines(s) { const a = []; s.cues.forEach((c, ci) => (c.lines || []).forEach((tx, k) => a.push({ ci, k, tx }))); return a; }
function loadTimes(s) {
  s.flat = flatLines(s);
  let tm = s.lineTimes || null;
  try { const v = JSON.parse(store.get(s.id, 'null')); if (v && v.length === s.flat.length) tm = v; } catch (e) { }
  s.times = tm;
}
function lyricsAt(t) {
  // name cards: who someone is, the first time they appear (level `titles: [{ t, name, sub, dur }]`)
  const tc = (story.titles || []).find((x) => t >= x.t && t < x.t + (x.dur || 4.5)) || null;
  if (tc !== lastTitle) { lastTitle = tc; if (tc) { $('title').firstChild.textContent = tc.name; $('title').lastChild.textContent = tc.sub || ''; } $('title').classList.toggle('on', !!tc); }
  let line = '', voice = '';  // voice: a level with `voices` (one per line, e.g. 'b') marks the second speaker's lines
  if (captions && !syncing) {
    if (story.times) {
      const tm = story.times; let k = -1;
      for (let j = 0; j < tm.length; j++) if (tm[j] != null && tm[j] <= t) k = j; else if (tm[j] != null) break;
      if (k >= 0) { const nxt = k + 1 < tm.length ? tm[k + 1] : 1e9; if (t < Math.min(nxt - 0.1, tm[k] + 7)) { line = story.flat[k].tx; voice = story.voices ? story.voices[k] || '' : ''; } }
    } else {
      const cues = story.cues, i = cueAt(Math.max(0, t)), c = cues[i], nx = cues[i + 1], end = nx ? nx.t : story.duration;
      if (c.lines && c.lines.length && t >= c.t) {
        const a = c.t + 0.4, b = end - 0.4, n = c.lines.length, seg = (b - a) / n;
        if (t >= a && t < b) { const k = Math.min(n - 1, Math.floor((t - a) / seg)); if ((t - a) - k * seg < seg - 0.5) line = c.lines[k]; }
      }
    }
  }
  if (line !== lastLine) { lastLine = line; const el = $('lyric'); if (line) { el.textContent = line; el.classList.toggle('b', voice === 'b'); el.classList.add('on'); } else el.classList.remove('on'); }
}

/* ---------- loop ---------- */
let last = performance.now(), fpsAcc = 0, fpsN = 0, fps = 0;
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000); last = now; time += dt;
  fpsAcc += dt; fpsN++; if (fpsAcc > 0.5) { fps = fpsN / fpsAcc; fpsAcc = 0; fpsN = 0; }
  if (dev.hold) { dev.shot(dev.hold); return; }
  if (!story || !P) return;
  const t = audio.currentTime;
  if (shown && now - lastActive > 3000) hideControls();
  lyricsAt(t);
  if (!scrubbing || true) {
    const k = clamp(t / story.duration, 0, 1);
    $('seekfill').style.width = (k * 100).toFixed(3) + '%'; $('seekknob').style.left = (k * 100).toFixed(3) + '%';
    $('ptime').textContent = fmt(t) + ' / ' + fmt(story.duration);
  }
  if (!ended && t >= story.silenceT) finish();
  if ($('dev').style.display === 'block') $('dev').textContent = 'fps ' + fps.toFixed(0) + '\nt ' + t.toFixed(1) + '  cue ' + story.cues[cueAt(Math.max(0, t))].id + '  shot ' + P.info().shot;
  P.render(t, time, calm);
}
// dev hooks for the headless tools: dev.hold = { t, time } renders that moment instead of the live song
const dev = { hold: null, painted: P, shot(st) { if (story && P) P.render(st.t, st.time, true); }, play(s) { story = s; loadTimes(s); P.start(s); } };
resize();
requestAnimationFrame(frame);
window.__alaron = { renderer, dev, audio, get mode() { return story ? 'ride' : 'list'; }, get story() { return story; }, seek: seekTo, play: (id) => { const s = C.stories.find((x) => x.id === id); if (s) playFromList(s, document.createElement('button')); } };
})();
