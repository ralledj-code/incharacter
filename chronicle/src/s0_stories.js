(function (root) {
'use strict';
const C = root.__cw;
/* Story registry: each page of the book is one story module (audio + timeline + scene builders). */
C.stories = [
  Object.assign({
    id: 'baphomet', title: 'Baphomet’s Chains', session: 'Session recap · 7:48 – 10:43 PM',
    blurb: 'Arthas bleeds into a moonwell and Baphomet’s chains break. Cedric kills a black wyrm alone, Cobh throws a feast, and Lucien wakes up in irons with a wraith over the city.',
    length: '6 min', audio: 'song.mp3', flashAt: 177.0, gaolCue: 'outro',
    build(X) { return C.scenes.baphomet.map((f) => f(X)).filter(Boolean); }
  }, C.storyData.baphomet),
  { id: 'locked-2', locked: true, title: 'Chapter II', session: '', blurb: 'This page is waiting for a song. Turn the next session recap into a track and it can become a ride like this one.' },
  { id: 'locked-3', locked: true, title: 'Chapter III', session: '', blurb: 'Unwritten. Every story is a small module: an audio file, a list of section times, and the scenes that play along.' }
];
})(typeof window !== 'undefined' ? window : globalThis);
