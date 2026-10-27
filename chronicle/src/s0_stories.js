(function (root) {
'use strict';
const C = root.__cw;
/* Story registry: each page of the book is one level (one song = one ride), in campaign order.
   A playable level is a module: audio + timeline (storyData) + scene builders (C.scenes[id]).
   The others are "coming soon" pages until their song is turned into a level (see chronicle/LEVELS.md). */
const SOON = 'Coming soon. This chapter’s song is waiting to become a ride.';
const PLAYLIST = [
  // [level, id, title, session date, song length]
  [1, 'first-steps', 'Alaron, the First Steps', '', '4:48'],
  [2, 'finding-silas', 'Finding Silas', '14/05/2026', '5:57'],
  [3, 'first-moonwell', 'Finding the First Moonwell', '24/05/2026', '4:57'],
  [4, 'cleansing-well', 'Cleansing the First Well', '14/06/2026', '4:47'],
  [5, 'hunt-pig', 'The Hunt for the Pig', '21/06/2026', '5:07'],
  [6, 'slaying-pig', 'Slaying the Pig', '06/07/2026', '5:43'],
  [7, 'journey-cobh', 'The Journey to Cobh', '21/07/2026', '4:58'],
  [8, 'baphomet', 'Baphomet’s Chains', '15/08/2026', '6:06'],
  [9, 'saving-cobh', 'Saving Cobh', '07/09/2026', '5:03'],
  [10, 'ahm-dynasty', 'The Ahm Dynasty Mystery', '15/09/2026', '5:29'],
  [11, 'hunger-grows', 'The Hunger Grows', '23/09/2026', '4:57'],
  [12, 'fall-duncastle', 'The Fall of Duncastle', '28/09/2026', '6:52']
];
const LEVELS = {
  baphomet: Object.assign({
    session: 'Level 8 · Session recap · 7:48 – 10:43 PM',
    blurb: 'Arthas bleeds into a moonwell and Baphomet’s chains break. Cedric kills a black wyrm alone, Cobh throws a feast, and Lucien wakes up in irons with a wraith over the city.',
    length: '6 min', audio: 'levels/08-baphomet.mp3', packs: ['nature', 'village', 'beasts'], flashAt: 180.1, gaolCue: 'outro',
    build(X) { return C.scenes.baphomet.map((f) => f(X)).filter(Boolean); }
  }, C.storyData.baphomet)
};
// a level with a live painted storyboard (C.boards, chronicle/painted/) plays painted; ?3d keeps the 3D ride,
// ?painted previews boards that are not live yet (art still missing)
const q = typeof location !== 'undefined' ? location.search : '', classic = /[?&]3d\b/.test(q), preview = /[?&]painted\b/.test(q);
C.stories = PLAYLIST.map(([level, id, title, date, len]) => {
  const s = Object.assign({ id, level, title, date, length: len },
    LEVELS[id] || (C.levels && C.levels[id]) || { locked: true, session: 'Level ' + level + (date ? ' · ' + date : ''), blurb: SOON });
  const key = String(level).padStart(2, '0') + '-' + id, board = C.boards && C.boards[key];
  if (board && !s.locked && !classic && (board.live || preview)) Object.assign(s, { painted: board, paintBase: 'levels/' + key + '/', packs: [] });
  if (s.paintedOnly && !s.painted) Object.assign(s, { locked: true, session: 'Level ' + level + (date ? ' · ' + date : ''), blurb: SOON });  // no 3D ride behind it
  // only painted levels are playable; the 3D rides stay reachable with ?3d
  if (!s.locked && !s.painted && !classic) Object.assign(s, { locked: true, session: 'Level ' + level + (date ? ' · ' + date : ''), blurb: SOON });
  return s;
});
// the page the book opens on: the latest playable level
C.firstStory = C.stories.reduce((k, s, i) => (s.locked ? k : i), 0);
})(typeof window !== 'undefined' ? window : globalThis);
