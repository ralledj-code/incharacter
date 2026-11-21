// Generate the verse clips listed in painted/<level>/clips.json (from painted/make/14clips.py) with Gemini Omni 1.2 Flash,
// method A: task reference_to_video, the verse's stills as references, timed beats in the prompt.
//   node scripts/omni-verses.mjs <level> [ids...] [--n 4] [--force]
// Raw clips -> painted/<level>/clips/<id>.mp4 (gitignored); web copies (no sound, crf 22) -> public/chronicle/levels/<level>/<id>.mp4.
// A failed clip is retried once with a calmer prompt; if it still fails, its verse keeps its stills.
import fs from 'node:fs';
import sharp from 'sharp';
import { execFileSync } from 'node:child_process';
const args = process.argv.slice(2), flag = (k) => { const i = args.indexOf(k); if (i < 0) return null; const v = args[i + 1]; args.splice(i, 2); return v; };
const force = args.includes('--force'); if (force) args.splice(args.indexOf('--force'), 1);
const par = +(flag('--n') || 4), [level, ...ids] = args;
const dir = `painted/${level}`, raw = `${dir}/clips`, pub = `../public/chronicle/levels/${level}`;
fs.mkdirSync(raw, { recursive: true });
const H = { 'x-goog-api-key': process.env.GEMINI_API_KEY, 'content-type': 'application/json' }, API = 'https://generativelanguage.googleapis.com/v1beta';
const clips = JSON.parse(fs.readFileSync(`${dir}/clips.json`, 'utf8')).filter((g) => !g.keep && (!ids.length || ids.includes(g.id)) && (force || !fs.existsSync(`${raw}/${g.id}.mp4`)));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function still(id) { return (await sharp(`${dir}/raw/${id}.png`).resize(1920, 1080, { fit: 'inside' }).jpeg({ quality: 90 }).toBuffer()).toString('base64'); }
async function gen(g, prompt) {
  const input = [...(await Promise.all(g.refs.map(still))).map((data) => ({ type: 'image', data, mime_type: 'image/jpeg' })), { type: 'text', text: prompt }];
  let r = await fetch(`${API}/interactions`, { method: 'POST', headers: H, body: JSON.stringify({ model: 'gemini-omni-1.2-flash', background: true, input,
    response_modalities: ['video'], response_format: { type: 'video', duration: g.dur, resolution: '720p', aspect_ratio: '16:9' }, generation_config: { video_config: { task: 'reference_to_video' } } }) });
  let j = await r.json(); if (!r.ok) return { err: JSON.stringify(j).slice(0, 200) };
  for (let i = 0; i < 120 && !/completed|failed|cancel/i.test(j.status || ''); i++) { await sleep(8000); j = await (await fetch(`${API}/interactions/${j.id}`, { headers: H })).json(); }
  let found = null; (function walk(o) { if (!o || typeof o !== 'object' || found) return; if ((o.type === 'video' || /video/.test(o.mime_type || '')) && o.data) { found = o; return; } Object.values(o).forEach(walk); })(j.outputs || j.steps || j);
  return found ? { data: Buffer.from(found.data, 'base64'), tokens: j.usage?.total_output_tokens } : { err: j.status + ' ' + JSON.stringify(j.errors || '').slice(0, 160) };
}
const CALM = ' Keep it tasteful and calm: no gore, nothing intimate shown up close.';
let next = 0, tokens = 0;
async function worker() {
  while (next < clips.length) {
    const g = clips[next++];
    let res = await gen(g, g.prompt);
    if (!res.data) { console.log(g.id, 'failed:', res.err, '-> retry calmer'); res = await gen(g, g.prompt + CALM); }
    if (!res.data) { console.log(g.id, 'FAILED twice, keeps its stills:', res.err); continue; }
    fs.writeFileSync(`${raw}/${g.id}.mp4`, res.data); tokens += res.tokens || 0;
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', `${raw}/${g.id}.mp4`, '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '22', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', `${pub}/${g.id}.mp4`]);
    console.log(g.id, 'ok', g.dur, g.t0 + '-' + g.t1);
  }
}
await Promise.all(Array.from({ length: Math.min(par, clips.length) }, worker));
console.log('done; output tokens', tokens, '≈ $' + (tokens * 12 / 1e6).toFixed(2));
