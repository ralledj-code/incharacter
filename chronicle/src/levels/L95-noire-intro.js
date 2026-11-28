/* Alaron Noire - intro "Calm Night" (28/11/2026): the intro of Rasmus's game Alaron Noire, made the Chronicle way.
   Hidden + secret: not in the song list, not on the family page, only by its link (/chronicle?song=noire-intro).
   Painted (painted/95-noire-intro.json, made by painted/make/95n.py; 10 storyboard frames from the game's intro kit + 29 new
   paintings). Maren's recorded narration (the game's voice), a very low invented underscore, a few effects on the cuts:
   painted/noire-intro/ (timeline.py, mix.py). This file is written by painted/noire-intro/module.py: edit there and rerun. */
(function (root) {
'use strict';
const C = root.__cw;
const ID = 'noire-intro';
const DURATION = 171.8;
const CUES = [{"id": "intro0", "t": 0, "v": 0.6, "motes": "dust", "stamp": "", "lines": []}, {"id": "intro_01", "t": 2.2, "v": 1, "motes": "dust", "stamp": "", "lines": ["Aurel hated sitting still."]}, {"id": "intro_02", "t": 9.0, "v": 1, "motes": "dust", "stamp": "", "lines": ["The painter gave up in the end.", "Painted him about to laugh.", "That's how I remember him. About to."]}, {"id": "intro_03", "t": 19.0, "v": 1, "motes": "dust", "stamp": "", "lines": ["Twelve years a fire-warden in the lower wards.", "You learn to read a fire the way clerks read a ledger.", "Where it started. How fast. Who wanted it."]}, {"id": "intro_04", "t": 31.0, "v": 1, "motes": "dust", "stamp": "", "lines": ["Corwen's Wharf burned on a calm night."]}, {"id": "intro_05", "t": 39.0, "v": 1, "motes": "dust", "stamp": "", "lines": ["No wind. No lightning.", "Fires don't start themselves on calm nights.", "This one started in three places at once."]}, {"id": "intro_06", "t": 51.0, "v": 1, "motes": "dust", "stamp": "", "lines": ["Aurel was inside.", "Doing the inventory the owner asked him to do.", "On a Sunday night."]}, {"id": "intro_07", "t": 65.6, "v": 1, "motes": "dust", "stamp": "", "lines": ["It was insured for twice what it was worth.", "The magistrate called it an accident.", "Took him a week."]}, {"id": "intro_08", "t": 75.0, "v": 1, "motes": "dust", "stamp": "", "lines": ["The owner bought a house in the hills that autumn.", "I went to his party once.", "I wasn't invited."]}, {"id": "intro_09", "t": 89.0, "v": 1, "motes": "dust", "stamp": "", "lines": ["The Quiet Office found me the week they closed the case.", "Officially, we're crown auditors.", "Ledgers. Seals. Tariffs.", "Unofficially, we read the numbers nobody wants read."]}, {"id": "intro_10", "t": 105.0, "v": 1, "motes": "dust", "stamp": "", "lines": ["The lantern is the Office's.", "It shows what magic leaves behind.", "In this city, magic is something you do quietly, or not at all."]}, {"id": "intro_11", "t": 119.0, "v": 1, "motes": "dust", "stamp": "", "lines": ["Half this city belongs to the Ahm now.", "The other half owes them.", "Their master laughs a lot.", "Men who laugh a lot have usually bought the room."]}, {"id": "intro_12", "t": 133.0, "v": 1, "motes": "dust", "stamp": "", "lines": ["Tyr watches from the hill.", "The city watches everyone else.", "Especially anyone with pointed ears."]}, {"id": "intro_13", "t": 143.0, "v": 1, "motes": "dust", "stamp": "", "lines": ["Brann thinks every case is about money.", "He's usually right.", "Pell draws everything.", "Even me, when he thinks I'm not looking."]}, {"id": "intro_14", "t": 155.0, "v": 1, "motes": "dust", "stamp": "", "lines": ["Lately the numbers have started leaving bodies."]}];
const LINE_TIMES = [2.2, 9.0, 11.1, 13.4, 19.0, 22.0, 25.0, 31.0, 39.0, 41.0, 44.0, 51.0, 52.6, 55.1, 65.6, 68.4, 70.7, 75.0, 77.5, 79.1, 89.0, 93.3, 95.5, 97.8, 105.0, 106.8, 109.2, 119.0, 121.3, 123.0, 125.0, 133.0, 135.1, 137.1, 143.0, 145.5, 147.2, 149.0, 155.0];
const TITLES = [];
C.levels[ID] = {
  session: 'Alaron Noire \u00b7 Intro',
  blurb: 'Why does a tired former fire-warden spend her nights reading merchants\u2019 ledgers? Because a ledger killed her husband, and the city let it.',
  length: '3 min', audio: 'levels/95-' + ID + '.mp3',
  hidden: true, secret: true, level: 95, title: 'Alaron Noire: Calm Night', len: '2:51',
  titles: TITLES,
  cues: CUES, duration: DURATION, silenceT: 171.6, lineTimes: LINE_TIMES,
};
})(typeof window !== 'undefined' ? window : globalThis);
