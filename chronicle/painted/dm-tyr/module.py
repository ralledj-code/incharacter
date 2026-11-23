"""Writes src/levels/L14-tyrs-price.js from timeline.json + lines.json (run from painted/dm-tyr/ after timeline.py).
Hidden + secret: only reachable by /chronicle?song=tyrs-price, not in the song list, not on the family page."""
import json
TL = json.load(open('timeline.json')); L = json.load(open('lines.json'))
VOICE = {'dolkan': '', 'valerys': 'w', 'tyr': 'g', 'narrator': 'n'}  # n = the DM's narration (italic, parchment)   # w = Valerys (warm), g = Tyr (pale gold); Dolkan default white
CAVERN = {'n1', 'd1a', 'd4a', 'd4b'}
cues = [{'id': 'intro0', 't': 0, 'v': 0.6, 'motes': 'dust', 'stamp': '', 'lines': []}]
for cid in TL['clips']:
    ls = [l for l in L if l['clip'] == cid]
    cues.append({'id': cid, 't': ls[0]['t'], 'v': 1, 'motes': 'dust' if cid in CAVERN else 'embers', 'stamp': '', 'lines': [l['text'] for l in ls]})
times = [l['t'] for l in L]; voices = [VOICE[l['sp']] for l in L]
last = max(e for _, e in TL['clips'].values())
js = f"""/* Tyr's Price (22/11/2026): the DM's scene after episode 14, Dolkan's memory of Valerys's bargain with Tyr. Hidden + secret:
   not in the song list, not on the family page, only by its link (/chronicle?song=tyrs-price). Painted only (painted/14-tyrs-price.json,
   made by painted/make/14t.py). Spoken drama, not a song: directed Gemini TTS voices (painted/dm-tyr/voice), SFX on the cuts,
   music beds, mixed by painted/dm-tyr/mix.py. This file is written by painted/dm-tyr/module.py: edit there and rerun. */
(function (root) {{
'use strict';
const C = root.__cw;
const ID = 'tyrs-price';
const DURATION = {TL['end']};
const CUES = {json.dumps(cues, ensure_ascii=False)};
const LINE_TIMES = {json.dumps(times)};
const VOICES = {json.dumps(voices)};  // '' Dolkan, 'w' Valerys, 'g' Tyr, 'n' the narrator
const TITLES = [];
C.levels[ID] = {{
  session: 'Level 14 · After the wurm · from the DM',
  blurb: 'The wurm is gone. Dolkan steps out of the dark with a crystal staff and a memory: twenty years ago, beneath the cathedral of Tyr, a young paladin named Valerys bargained with his god for two dying boys.',
  length: '{round(TL["end"] / 60)} min', audio: 'levels/14-' + ID + '.mp3',
  hidden: true, secret: true, level: 14, title: 'Tyr\\u2019s Price', len: '{int(TL["end"] // 60)}:{int(TL["end"] % 60):02d}',
  titles: TITLES,
  cues: CUES, duration: DURATION, silenceT: {round(TL['end'] - 0.2, 2)}, lineTimes: LINE_TIMES, voices: VOICES,
}};
}})(typeof window !== 'undefined' ? window : globalThis);
"""
open('../../src/levels/L14-tyrs-price.js', 'w').write(js); print('cues', len(cues), 'lines', len(times))
