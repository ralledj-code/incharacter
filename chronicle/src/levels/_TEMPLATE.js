/* Level NN: <Title> (<date>). Lucien sings. Painted only (painted/NN-<id>.json).
   Story (session events): ...
   Lyrics: Rasmus's Suno text. Line times: scripts/gemini-transcribe.mjs + gemini-align.mjs, snapped to beats. Beats: scripts/beats.py. */
(function (root) {
'use strict';
const C = root.__cw;
const ID = 'my-id';
const DURATION = 300;
const CUES = [{ id: 'intro', t: 0, v: 0.6, motes: 'dust', stamp: '', lines: [] }, { id: 'v1', t: 20, v: 1, motes: 'dust', stamp: '', lines: ['First line', 'Second line'] }, { id: 'end', t: 290, v: 0.4, motes: 'dust', stamp: '', lines: [] }];
const LINE_TIMES = [20.4, 24.1];
const BEATS = { bpm: 120, beats: [], bars: [], hits: [] };
const TITLES = [];
C.levels[ID] = {
  session: 'Level NN · Session recap · <date>',
  blurb: 'Two or three sentences in the party’s voice.',
  length: '6 min', audio: 'levels/NN-' + ID + '.mp3',
  titles: TITLES,
  cues: CUES, duration: DURATION, silenceT: 295, lineTimes: LINE_TIMES, beats: BEATS,
};
})(typeof window !== 'undefined' ? window : globalThis);
