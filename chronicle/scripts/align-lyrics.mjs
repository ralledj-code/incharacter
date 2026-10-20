// Aligns known lyric lines to Whisper word timestamps (from scripts/transcribe.py).
// usage: node scripts/align-lyrics.mjs <words.json> <lyrics.json> [out.json]
//   lyrics.json: [{ section: 'v1', lines: ['...', ...] }, ...] in song order
// Prints a review table and writes { lineTimes, sections: { id: firstLineTime }, report } to out.json.
// Method: global sequence alignment (Needleman-Wunsch) over normalised words with fuzzy matching,
// so repeated choruses and Whisper's misheard words still land in order.
import fs from 'node:fs';

const [wordsFile, lyricsFile, outFile] = process.argv.slice(2);
if (!lyricsFile) { console.error('usage: node scripts/align-lyrics.mjs <words.json> <lyrics.json> [out.json]'); process.exit(1); }
const norm = (s) => s.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const heard = JSON.parse(fs.readFileSync(wordsFile, 'utf8')).flatMap((w) => norm(w.w).split(' ').filter(Boolean).map((t) => ({ t, s: w.s, e: w.e })));
const sections = JSON.parse(fs.readFileSync(lyricsFile, 'utf8'));
const lines = sections.flatMap((sec) => sec.lines.map((tx) => ({ sec: sec.section, tx })));
const sung = lines.flatMap((l, li) => norm(l.tx).split(' ').filter(Boolean).map((t) => ({ t, li })));

function lev(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
const sim = (a, b) => (a === b ? 1 : 1 - lev(a, b) / Math.max(a.length, b.length));

// DP: rows = sung words, cols = heard words. Gaps are cheap (instrumentals, ad-libs, misses).
const N = sung.length, Mh = heard.length, GAP_S = -0.4, GAP_H = -0.15;
const score = Array.from({ length: N + 1 }, () => new Float32Array(Mh + 1));
const from = Array.from({ length: N + 1 }, () => new Uint8Array(Mh + 1));
for (let i = 1; i <= N; i++) { score[i][0] = i * GAP_S; from[i][0] = 1; }
for (let j = 1; j <= Mh; j++) { score[0][j] = j * GAP_H; from[0][j] = 2; }
for (let i = 1; i <= N; i++) {
  for (let j = 1; j <= Mh; j++) {
    const s = sim(sung[i - 1].t, heard[j - 1].t), m = score[i - 1][j - 1] + (s >= 0.7 ? 1 + s : -0.6);
    const u = score[i - 1][j] + GAP_S, l = score[i][j - 1] + GAP_H;
    if (m >= u && m >= l) { score[i][j] = m; from[i][j] = 0; } else if (u >= l) { score[i][j] = u; from[i][j] = 1; } else { score[i][j] = l; from[i][j] = 2; }
  }
}
const match = new Array(N).fill(null);
for (let i = N, j = Mh; i > 0 || j > 0;) {
  const f = i > 0 && j > 0 ? from[i][j] : i > 0 ? 1 : 2;
  if (f === 0) { if (sim(sung[i - 1].t, heard[j - 1].t) >= 0.7) match[i - 1] = heard[j - 1]; i--; j--; } else if (f === 1) i--; else j--;
}

// per line: start = first matched word, minus the words sung before it (~0.35 s each); confidence = matched share
const out = lines.map((l, li) => {
  const idx = sung.map((w, k) => (w.li === li ? k : -1)).filter((k) => k >= 0);
  const hit = idx.filter((k) => match[k]);
  const first = hit.length ? hit[0] : -1;
  const t = first >= 0 ? Math.max(0, match[first].s - (first - idx[0]) * 0.35) : null;
  return { sec: l.sec, tx: l.tx, t, conf: idx.length ? hit.length / idx.length : 0, end: hit.length ? match[hit[hit.length - 1]].e : null };
});
// fill unmatched lines by interpolating between neighbours
for (let i = 0; i < out.length; i++) {
  if (out[i].t !== null) continue;
  let a = i - 1; while (a >= 0 && out[a].t === null) a--;
  let b = i + 1; while (b < out.length && out[b].t === null) b++;
  const ta = a >= 0 ? out[a].t : 0, tb = b < out.length ? out[b].t : ta + 4 * (b - a);
  out[i].t = +(ta + (tb - ta) * (i - a) / (b - a)).toFixed(2); out[i].guess = true;
}
// keep strictly increasing
for (let i = 1; i < out.length; i++) if (out[i].t <= out[i - 1].t) { out[i].t = +(out[i - 1].t + 0.5).toFixed(2); out[i].guess = true; }

const secStart = {};
out.forEach((l) => { if (!(l.sec in secStart)) secStart[l.sec] = +l.t.toFixed(2); });
out.forEach((l) => console.log(`${l.t.toFixed(2).padStart(7)} ${l.guess ? '~' : ' '} ${(Math.round(l.conf * 100) + '%').padStart(4)}  ${l.sec.padEnd(8)} ${l.tx}`));
const weak = out.filter((l) => l.conf < 0.4).length;
console.log(`\n${out.length} lines, ${weak} weak (<40% words matched; check those by ear or with the Sync lyrics button)`);
if (outFile) fs.writeFileSync(outFile, JSON.stringify({ lineTimes: out.map((l) => +l.t.toFixed(2)), sections: secStart, report: out }, null, 1));
