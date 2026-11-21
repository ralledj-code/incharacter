/* Level 5: The Hunt for the Pig (21/06/2026). Lucien sings.
   The Blackbird -> the night road -> the city square at night, twelve bound in the middle: Lucien on a rooftop sees Severin in the crowd,
   runs the roof tiles and jumps to her feet; eight of the twelve are turning, he refuses her
   -> eight pyres under the moon -> the frightened man -> the cave under the cleansed tree. From here on everything is one cave system:
   the blood troll, the bones, the carved dungeon, Lucien wearing the Pig's face past two shapeshifting druids, eight candles,
   the Pig's keep built in the bottom cavern, the fireball through the lit window (prisoners inside), the Pig grows, Lucien falls.
   Lyrics: Rasmus's Suno text (2026-11-01), on the Whisper line times. Beats: scripts/beats.py (80 BPM). */
(function (root) {
'use strict';
const C = root.__cw;
const ID = 'hunt-pig';
const DURATION = 307.7;

const CHORUS = (played) => ['Oh, Alaron, count the names,', 'Eight small fires, eight small flames,', 'I played them off with a mournful tune,', 'Sent them home beneath the moon.', 'Oh, Alaron, hear me now,', 'Loss is a debt, and I don’t know how'];
const CUES = [
  { id: 'intro', t: 0, v: 0.4, motes: 'dust', stamp: '', lines: [] },
  { id: 'road', t: 26, v: 2.0, motes: 'fireflies', stamp: '21/06/2026', lines: [] },
  { id: 'ruin', t: 55, v: 1.0, motes: 'dust', stamp: 'the city', lines: [] },
  { id: 'v1', t: 67.5, v: 0.9, motes: 'fireflies', stamp: '', lines: ['I ran the tiles, I fell through air,', 'Landed at her feet, and she was there,', 'Severin, real as blood, real as bone,', 'Asked me home to what I’ve grown', 'I begged her, let the dying go,', 'The ones still turning, still don’t know.', 'She said, “We’re already dead, all of us are” —', 'I would not follow that kind of star', 'Eight souls turning in the dark,', 'My brothers holding back the mark,', 'I chose the innocent, not the crown she wore,', 'That’s a debt I’m answering for'] },
  { id: 'chorus', t: 108.0, v: 1.0, motes: 'embers', stamp: '', lines: CHORUS(false) },
  { id: 'inst', t: 128.0, v: 2.4, motes: 'dust', stamp: '', lines: [] },
  { id: 'v2', t: 138.4, v: 1.5, motes: 'dust', stamp: '', lines: ['We bled the truth from a frightened man,', 'His mind cracked open like broken glass,', 'The cave, the tree we’d cleansed before,', 'The pig was waiting past that door', 'A blood troll fell before we passed,', 'We found the bones — the builders’ past,', 'A dungeon carved by careful hand,', 'Not nature’s work, no, this was planned'] },
  { id: 'v2b', t: 162.4, v: 1.0, motes: 'ash', stamp: '', lines: ['I wore his face, I lied my way,', 'Two werebears turned and walked away.', 'They chose their shape, they chose their chain,', 'I sent them out, we slipped the pain.'] },
  { id: 'chorus2', t: 175.8, v: 0.8, motes: 'embers', stamp: '', lines: CHORUS(true) },
  { id: 'deep', t: 196.0, v: 2.2, motes: 'ash', stamp: 'the bottom of the cave', lines: [] },
  { id: 'bridge', t: 217.9, v: 0.5, motes: 'sparks', stamp: '', lines: ['A window lit, I threw the flame,', 'I didn’t know who bore the blame,', 'Innocents burned where he had bled,', 'Another weight, another dead', 'This is a burden I will carry,', 'This will change me,', 'This will change me'] },
  { id: 'v3', t: 248.6, v: 0.35, motes: 'embers', stamp: '', lines: ['He bathes in blood, he grows with every kill,', 'He’s stronger now, and I am standing still,', 'The fire I made, it feeds him more,', 'The pig still stands,', 'This is not the final score'] },
  { id: 'outro', t: 268.3, v: 0.3, motes: 'ash', stamp: '', lines: ['I’m going down,', 'I’m almost gone,', 'The fight is not,', 'The fight’s not won', 'Alaron…', 'Alaron…', 'Alaron…'] },
  { id: 'final', t: 291.0, v: 0.1, motes: 'ash', stamp: '', lines: [] }
];
const LINE_TIMES = [68.04, 71.5, 74.48, 78.24, 81.54, 84.22, 87.08, 90.44, 93.32, 96.18, 99.12, 103.1,
  108.54, 112.18, 115, 118.22, 120.94, 124,
  138.94, 141.92, 144.98, 147.74, 151.02, 153.96, 156.82, 159.9,
  162.9, 165.96, 168.84, 171.94,
  176.26, 179.64, 182.46, 185.52, 188.38, 191.54,
  218.4, 222.08, 225.69, 228.18, 236.08, 242.42, 244.8,
  249.12, 252.16, 255.14, 258.06, 260.38,
  268.76, 271, 273.98, 276.88, 281.86, 284.88, 287.84];
const BEATS = {"bpm":79.99,"beats":[0.19,0.86,1.62,2.42,3.12,3.81,4.22,4.66,5.39,6.05,6.82,7.76,8.16,8.78,9.52,10.21,11.15,11.74,12.4,12.91,13.6,14.54,15.28,16.05,16.82,17.6,18.27,19.01,19.55,20.11,20.67,21.28,21.87,22.38,23.09,23.89,24.67,25.52,26.38,27.06,27.68,28.37,29.12,29.73,30.51,31.3,31.94,32.45,32.85,33.62,34.38,34.99,35.52,36.03,36.69,37.42,37.82,38.58,38.98,39.71,40.3,40.86,41.6,42.0,42.74,43.54,44.27,45.01,45.79,46.54,47.3,48.06,48.82,49.22,49.95,50.35,51.07,51.79,52.56,53.31,54.05,54.78,55.42,55.9,56.58,57.14,57.76,58.53,59.26,60.02,60.51,61.5,62.26,63.01,63.74,64.5,65.25,66.0,66.74,67.49,68.24,68.99,69.47,70.02,70.48,71.22,71.86,72.72,73.25,74.05,74.77,75.71,76.27,77.02,77.79,78.27,78.67,79.46,79.98,80.4,80.94,81.68,82.45,82.99,83.94,84.51,85.36,85.97,86.56,87.1,87.7,88.43,89.06,89.7,90.53,91.25,92.02,92.94,93.7,94.45,95.2,95.95,96.7,97.44,98.19,98.77,99.23,99.7,100.45,101.2,101.7,102.22,102.7,103.46,104.18,104.72,105.14,105.73,106.51,107.41,108.02,108.67,109.44,110.18,110.85,111.66,112.4,113.17,113.92,114.67,115.42,116.16,116.91,117.6,118.43,119.17,119.92,120.67,121.42,122.16,122.88,123.66,124.34,125.17,125.9,126.64,127.42,128.16,128.91,129.66,130.42,131.17,131.9,132.53,133.04,133.66,134.16,134.91,135.65,136.05,136.67,137.15,137.9,138.66,139.41,140.11,140.91,141.66,142.42,143.14,143.92,144.67,145.38,145.79,146.74,147.17,147.66,148.4,149.17,149.9,150.66,151.41,152.16,152.91,153.66,154.42,155.01,155.9,156.51,157.22,157.76,158.16,158.9,159.66,160.42,161.17,161.9,162.67,163.41,163.94,164.38,164.91,165.66,166.42,167.14,167.9,168.53,169.04,169.79,170.54,171.28,172.05,172.78,173.54,174.29,175.04,175.79,176.51,176.93,177.66,178.38,179.17,179.9,180.66,181.41,182.16,182.91,183.66,184.42,185.17,185.92,186.67,187.41,188.16,188.91,189.66,190.38,191.17,191.92,192.67,193.6,194.14,194.93,195.66,196.43,197.17,197.79,198.3,199.04,199.79,200.4,200.93,201.66,202.42,203.17,203.92,204.66,205.41,206.16,206.78,207.26,207.66,208.42,209.17,209.9,210.66,211.3,212.16,212.8,213.28,213.74,214.42,215.17,215.92,216.67,217.42,218.18,218.91,219.66,220.61,221.12,221.68,222.66,223.23,223.7,224.16,224.72,225.66,226.1,226.77,227.42,228.13,228.66,229.41,230.03,230.51,231.12,231.63,232.42,233.17,233.92,234.67,235.42,236.18,236.66,237.47,238.03,238.43,239.17,239.92,240.58,241.42,242.18,243.01,243.54,244.27,245.17,245.92,246.56,247.44,248.1,248.67,249.26,249.94,250.35,250.96,251.87,252.43,253.41,254.16,254.83,255.65,256.42,256.99,257.44,257.9,258.64,259.41,260.16,260.91,261.46,262.03,262.77,263.17,263.92,264.66,265.41,266.16,266.91,267.66,268.42,269.15,269.89,270.66,271.41,272.16,272.91,273.66,274.42,275.15,275.9,276.66,277.41,278.16,278.91,279.5,280.03,280.78,281.54,282.29,282.88,283.41,284.16,284.91,285.66,286.42,287.15,287.9,288.66,289.41,290.16,290.91,291.66,292.42,293.15,293.66,294.16,294.66,295.06,295.81,296.54,297.28,298.03,298.43,298.83,299.25,299.81,300.51,301.15,301.81,302.56,303.31,304.08,304.83,305.63,306.4,307.2],"bars":[0.19,3.12,5.39,8.16,11.15,13.6,16.82,19.55,21.87,24.67,27.68,30.51,32.85,35.52,37.82,40.3,42.74,45.79,48.82,51.07,54.05,56.58,59.26,62.26,65.25,68.24,70.48,73.25,76.27,78.67,80.94,83.94,86.56,89.06,92.02,95.2,98.19,100.45,102.7,105.14,108.02,110.85,113.92,116.91,119.92,122.88,125.9,128.91,131.9,134.16,136.67,139.41,142.42,145.38,147.66,150.66,153.66,156.51,158.9,161.9,164.38,167.14,169.79,172.78,175.79,178.38,181.41,184.42,187.41,190.38,193.6,196.43,199.04,201.66,204.66,207.26,209.9,212.8,215.17,218.18,221.12,223.7,226.1,228.66,231.12,233.92,236.66,239.17,242.18,245.17,248.1,250.35,253.41,256.42,258.64,261.46,263.92,266.91,269.89,272.91,275.9,278.91,281.54,284.16,287.15,290.16,293.15,295.06,298.03,299.81,302.56,305.63],"hits":[30.51,35.9,51.07,55.42,55.9,60.02,62.26,63.74,66.74,74.77,79.98,82.99,88.43,101.7,104.72,149.9,172.78,194.14,199.04,199.79,200.78,201.28,203.17,203.92,204.66,205.41,206.16,206.91,209.17,209.9,210.66,212.16,213.28,220.61,222.66,225.66,226.1,228.66,230.03,231.63,235.42,237.47,240.58,249.26,251.87,254.16,254.83,256.42,257.17,258.64,259.41,262.77,280.03,283.41,284.16,287.15,287.9,289.41,290.16,290.91,292.03,293.15,293.66,295.42,296.54,297.28,299.25,299.81,300.51,301.81,302.56,303.31,304.45]};

const TITLES = [
  { t: 74.6, name: 'Severin', sub: 'real as blood, real as bone' },
  { t: 147.9, name: 'The Pig', sub: 'the butcher in the deep' },
  { t: 151.2, name: 'A blood troll', sub: '', dur: 2.6 },
  { t: 166.1, name: 'The druids', sub: 'they wear any shape they want' }
];

C.levels[ID] = {
  session: 'Level 5 · Session recap · 21/06/2026',
  blurb: 'Twelve bound in the city square; Lucien runs the rooftops, drops at Severin’s feet and refuses her, and eight souls die. A frightened man gives up the cave under the cleansed tree; past a blood troll and a carved dungeon, Lucien wears the Pig’s own face past his druids. Then a lit window, a fireball, and the prisoners inside.',
  length: '5 min', audio: 'levels/05-' + ID + '.mp3',
  titles: TITLES,
  cues: CUES, duration: DURATION, silenceT: 300, lineTimes: LINE_TIMES, beats: BEATS,
};
})(typeof window !== 'undefined' ? window : globalThis);
