"""Writes src/levels/L95-noire-intro.js from timeline.json + lines.json (run from painted/noire-intro/ after timeline.py).
Hidden + secret: only /chronicle?song=noire-intro, not in the song list, not on the family page."""
import json
TL = json.load(open('timeline.json')); L = json.load(open('lines.json'))
cues = [{'id': 'intro0', 't': 0, 'v': 0.6, 'motes': 'dust', 'stamp': '', 'lines': []}]
for cid in TL['clips']:
    ls = [l for l in L if l['clip'] == cid]
    cues.append({'id': cid, 't': ls[0]['t'], 'v': 1, 'motes': 'dust', 'stamp': '', 'lines': [l['text'] for l in ls]})
times = [l['t'] for l in L]
js = f"""/* Alaron Noire - intro "Calm Night" (28/11/2026): the intro of Rasmus's game Alaron Noire, made the Chronicle way.
   Hidden + secret: not in the song list, not on the family page, only by its link (/chronicle?song=noire-intro).
   Painted (painted/95-noire-intro.json, made by painted/make/95n.py; 10 storyboard frames from the game's intro kit + 29 new
   paintings). Maren's recorded narration (the game's voice), a very low invented underscore, a few effects on the cuts:
   painted/noire-intro/ (timeline.py, mix.py). This file is written by painted/noire-intro/module.py: edit there and rerun. */
(function (root) {{
'use strict';
const C = root.__cw;
const ID = 'noire-intro';
const DURATION = {TL['end']};
const CUES = {json.dumps(cues, ensure_ascii=False)};
const LINE_TIMES = {json.dumps(times)};
const TITLES = [];
C.levels[ID] = {{
  session: 'Alaron Noire \\u00b7 Intro',
  blurb: 'Why does a tired former fire-warden spend her nights reading merchants\\u2019 ledgers? Because a ledger killed her husband, and the city let it.',
  length: '3 min', audio: 'levels/95-' + ID + '.mp3',
  hidden: true, secret: true, level: 95, title: 'Alaron Noire: Calm Night', len: '{int(TL["end"] // 60)}:{int(TL["end"] % 60):02d}',
  titles: TITLES,
  cues: CUES, duration: DURATION, silenceT: {round(TL['end'] - 0.2, 2)}, lineTimes: LINE_TIMES,
}};
}})(typeof window !== 'undefined' ? window : globalThis);
"""
open('../../src/levels/L95-noire-intro.js', 'w').write(js); print('cues', len(cues), 'lines', len(times))
