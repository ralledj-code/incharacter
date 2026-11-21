(function (root) {
'use strict';
const C = root.__cw;
/* Song registry: one entry per level, in campaign order. A playable level is a module (audio, cues, line times, beats)
   with a live painted storyboard; the others show as Coming soon (see chronicle/LEVELS.md). */
const SOON = 'Coming soon. This chapter’s song is waiting to become a story.';
const PLAYLIST = [
  // [level, id, title, session date, song length]
  [0, 'story-so-far', 'The Story So Far', '', '9:48'],  // feature: a wide card on top, Lucien tells it all
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
  [12, 'fall-duncastle', 'The Fall of Duncastle', '28/09/2026', '6:52'],
  [13, 'down-deep', 'Down We Go to the Caves Below', '02/11/2026', '5:33'],
  [14, 'hunt-valerys', 'The Hunt for Valerys', '21/11/2026', '6:01'],
  [14, 'songbird', 'Sing Loud, Little Songbird', '21/11/2026', '4:36']  // Lucien's memory of his father (level 14)
];
// songs outside the campaign: a level module with hidden: true (plus level, title, len) is playable only through its own
// link (?song=<id>) and never shows in the song list
Object.keys(C.levels || {}).forEach((id) => { const l = C.levels[id]; if (l.hidden) PLAYLIST.push([l.level, id, l.title, '', l.len || '']); });
const LEVELS = {
  baphomet: Object.assign({
    session: 'Level 8 · Session recap · 7:48 – 10:43 PM',
    blurb: 'Arthas bleeds into a moonwell and Baphomet’s chains break. Cedric kills a black wyrm alone, Cobh throws a feast, and Lucien wakes up in irons with a wraith over the city.',
    length: '6 min', audio: 'levels/08-baphomet.mp3'
  }, C.storyData.baphomet)
};
// a level plays when its painted storyboard is live (C.boards, chronicle/painted/); ?painted previews boards that are not live yet.
// Everything else shows as Coming soon. (The 3D rides and the tavern were removed 2026-11-21.)
const q = typeof location !== 'undefined' ? location.search : '', preview = /[?&]painted\b/.test(q);
C.stories = PLAYLIST.map(([level, id, title, date, len]) => {
  const s = Object.assign({ id, level, title, date, length: len }, LEVELS[id] || (C.levels && C.levels[id]) || {});
  const key = String(level).padStart(2, '0') + '-' + id, board = C.boards && C.boards[key];
  if (board && s.audio && (board.live || preview)) Object.assign(s, { painted: board, paintBase: 'levels/' + (board.base || key) + '/' });  // base: art shared with another board
  else Object.assign(s, { locked: true, session: 'Level ' + level + (date ? ' · ' + date : ''), blurb: SOON });
  return s;
});
})(typeof window !== 'undefined' ? window : globalThis);
