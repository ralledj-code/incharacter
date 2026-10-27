// Paints a level's storyboard with Google's Gemini image model. Key: GEMINI_API_KEY, or none when the environment's
// network secret adds the x-goog-api-key header for generativelanguage.googleapis.com (Claude Code cloud).
//   node scripts/paint.mjs <level> cast            character sheets -> painted/<level>/cast/<name>.jpg (the look every shot copies)
//   node scripts/paint.mjs <level> shots [ids...]  shots -> painted/<level>/raw/<id>.png (cast sheets of `who` go in as references)
//   options: --force (repaint existing), --model <name> (default gemini-3.1-flash-image), --n <parallel> (default 3),
//            --max <images this run> (default 80, a spend cap), --out <dir> (write shots there instead of raw/, e.g. to compare models)
// Default is BATCH mode (half price; results in minutes to hours, at most 24 h): cast/shots submit one job (cast sheets are
// uploaded once and referenced), then
//   node scripts/paint.mjs <level> collect [--wait <minutes>]  saves what the job painted and lists what it did not.
// --now paints immediately at full price instead (quick single repaints). Modus operandi since 2026-10-27: Flash 3.1 + batch.
// The job is kept in painted/<level>/batch-<cast|shots>.json until it is collected: COMMIT AND PUSH it right after submitting,
// so a fresh session can collect if this container is gone (no secrets in it; results stay at Google for a while).
// Then: python scripts/crop-bars.py <level>, python scripts/layers.py <level> (web images + depth maps for the parallax player).
import fs from 'node:fs';
import sharp from 'sharp';

const args = process.argv.slice(2), flag = (k) => { const i = args.indexOf(k); if (i < 0) return null; const v = args[i + 1]; args.splice(i, 2); return v; };
const bool = (k) => { const i = args.indexOf(k); if (i < 0) return false; args.splice(i, 1); return true; };
const force = bool('--force'), now = bool('--now'), batch = !now; bool('--batch');
const wantModel = flag('--model'), par = +(flag('--n') || 3), maxImages = +(flag('--max') || 80), outDir = flag('--out'), waitMin = +(flag('--wait') || 0);
let calls = 0;
const [level, step, ...ids] = args;
const KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!level || !['cast', 'shots', 'collect'].includes(step)) { console.error('usage: node scripts/paint.mjs <level> cast|shots [ids...] [--force] [--model m] [--max 80] [--out dir] [--now] | collect [--wait min]'); process.exit(1); }
const board = JSON.parse(fs.readFileSync(`painted/${level}.json`, 'utf8'));
const dir = `painted/${level}`, castDir = `${dir}/cast`, rawDir = outDir || `${dir}/raw`;
fs.mkdirSync(castDir, { recursive: true }); fs.mkdirSync(rawDir, { recursive: true });
const ROOT = 'https://generativelanguage.googleapis.com', API = `${ROOT}/v1beta`;
const HDR = KEY ? { 'x-goog-api-key': KEY } : {};  // no key: the proxy injects it
const sleep = (ms) => new Promise((k) => setTimeout(k, ms));

// pick an image model: --model, GEMINI_IMAGE_MODEL, else the best image-capable model the key can see
async function pickModel() {
  if (wantModel || process.env.GEMINI_IMAGE_MODEL) return wantModel || process.env.GEMINI_IMAGE_MODEL;
  return 'gemini-3.1-flash-image';  // about half Pro's price and close in quality (tested 2026-10-27); pass --model for another
  const r = await fetch(`${API}/models?pageSize=200`, { headers: HDR }); const j = await r.json();
  if (!r.ok) throw new Error('list models: ' + JSON.stringify(j).slice(0, 300));
  const names = (j.models || []).filter((m) => (m.supportedGenerationMethods || []).includes('generateContent') && /image/i.test(m.name) && !/imagen/i.test(m.name)).map((m) => m.name.replace('models/', ''));
  const rank = (n) => (/pro/.test(n) ? 4 : 0) + (/preview/.test(n) ? 0 : 1) + (+(n.match(/gemini-(\d+(\.\d+)?)/) || [0, 0])[1]);
  names.sort((a, b) => rank(b) - rank(a));
  if (!names.length) throw new Error('no Gemini image model visible to this key');
  console.log('image models:', names.join(', '));
  return names[0];
}

// what to paint: one job per cast sheet or shot (prompt, reference sheets, where the picture goes)
function castJob(id) {
  return { key: 'cast:' + id, id, out: `${castDir}/${id}.jpg`, jpeg: true, refs: [],
    prompt: `${board.style}\nCharacter reference sheet on a plain dark neutral background: the same character shown three times side by side, full body from the front, full body from the side, and a large head-and-shoulders portrait. Consistent design, even soft light, clear silhouette.\nCharacter: ${board.cast[id]}` };
}
function shotJob(s) {
  const who = (s.who || []).filter((w) => fs.existsSync(`${castDir}/${w}.jpg`));
  const refNote = who.length ? `\nThe attached images are character reference sheets, in this order: ${who.join(', ')}. Keep each character's face, hair, clothes and colours exactly as in their sheet.` : '';
  const castNote = (s.who || []).map((w) => `${w}: ${board.cast[w]}`).join('\n');
  return { key: 'shot:' + s.id, id: s.id, out: `${rawDir}/${s.id}.png`, refs: who.map((w) => `${castDir}/${w}.jpg`),
    prompt: `${board.style}\nWide 16:9 cinematic frame. Keep the important subject inside the central area and leave some calm margin at the edges (the camera will drift slightly).\nScene: ${s.scene}${castNote ? '\nCharacters:\n' + castNote : ''}${refNote}` };
}
const genConfig = { responseModalities: ['IMAGE', 'TEXT'], imageConfig: { aspectRatio: '16:9' } };
const imageOf = (resp) => { const p = (resp?.candidates?.[0]?.content?.parts || []).find((x) => x.inlineData || x.inline_data); return p ? Buffer.from((p.inlineData || p.inline_data).data, 'base64') : null; };
async function save(job, buf) {
  if (job.jpeg) await sharp(buf).jpeg({ quality: 90 }).toFile(job.out); else fs.writeFileSync(job.out, buf);
  console.log(job.key, '->', job.out);
}

async function paint(model, job) {
  const parts = [{ text: job.prompt }];
  for (const f of job.refs) parts.push({ inlineData: { mimeType: 'image/jpeg', data: fs.readFileSync(f).toString('base64') } });
  const body = (withAspect) => JSON.stringify({ contents: [{ role: 'user', parts }], generationConfig: withAspect ? genConfig : { responseModalities: genConfig.responseModalities } });
  let withAspect = true;
  for (let tries = 0; tries < 6; tries++) {
    if (++calls > maxImages) throw new Error(`spend cap reached (--max ${maxImages} requests this run)`);
    const r = await fetch(`${API}/models/${model}:generateContent`, { method: 'POST', headers: Object.assign({ 'content-type': 'application/json' }, HDR), body: body(withAspect) });
    const j = await r.json().catch(() => ({}));
    if (r.status === 400 && withAspect && /imageConfig|aspect/i.test(JSON.stringify(j))) { withAspect = false; continue; }
    if (r.status === 429 || r.status >= 500) { const w = 2000 * 2 ** tries; console.log(`  ${r.status}, retry in ${w / 1000}s`); await sleep(w); continue; }
    if (!r.ok) throw new Error(r.status + ' ' + JSON.stringify(j).slice(0, 400));
    const img = imageOf(j);
    if (img) return img;
    const why = j.candidates?.[0]?.finishReason || JSON.stringify(j.promptFeedback || {});
    console.log('  no image (' + why + '), retrying'); await sleep(1500);
  }
  throw new Error('gave up');
}

async function pool(items, n, fn) {
  const q = items.slice(); const run = async () => { while (q.length) { const it = q.shift(); try { await fn(it); } catch (e) { console.error('FAILED', it.key, e.message); failed.push(it.id); } } };
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, run));
}
const failed = [];

/* ---- batch mode ---- */
// upload a reference sheet once (Files API, kept 48 h); batch requests point at it instead of carrying the image
async function upload(path) {
  const data = fs.readFileSync(path);
  const r = await fetch(`${ROOT}/upload/v1beta/files`, { method: 'POST', headers: Object.assign({ 'X-Goog-Upload-Protocol': 'resumable', 'X-Goog-Upload-Command': 'start',
    'X-Goog-Upload-Header-Content-Length': String(data.length), 'X-Goog-Upload-Header-Content-Type': 'image/jpeg', 'content-type': 'application/json' }, HDR),
    body: JSON.stringify({ file: { display_name: path.replace(/\W+/g, '-') } }) });
  const url = r.headers.get('x-goog-upload-url'); if (!url) throw new Error('upload start ' + r.status + ' ' + (await r.text()).slice(0, 300));
  const u = await fetch(url, { method: 'POST', headers: Object.assign({ 'content-length': String(data.length), 'X-Goog-Upload-Offset': '0', 'X-Goog-Upload-Command': 'upload, finalize' }, HDR), body: data });
  const j = await u.json(); if (!j.file?.uri) throw new Error('upload ' + u.status + ' ' + JSON.stringify(j).slice(0, 300));
  return j.file.uri;
}
async function submit(model, jobs, kind) {
  if (jobs.length > maxImages) throw new Error(`${jobs.length} images > --max ${maxImages}`);
  const uris = {};
  for (const f of [...new Set(jobs.flatMap((j) => j.refs))]) { uris[f] = await upload(f); console.log('uploaded', f); }
  const requests = jobs.map((j) => ({ request: { contents: [{ role: 'user', parts: [{ text: j.prompt }, ...j.refs.map((f) => ({ fileData: { mimeType: 'image/jpeg', fileUri: uris[f] } }))] }], generationConfig: genConfig }, metadata: { key: j.key } }));
  const r = await fetch(`${API}/models/${model}:batchGenerateContent`, { method: 'POST', headers: Object.assign({ 'content-type': 'application/json' }, HDR),
    body: JSON.stringify({ batch: { display_name: `${level}-${kind}-${Date.now()}`, input_config: { requests: { requests } } } }) });
  const j = await r.json(); if (!r.ok || !j.name) throw new Error('batch submit ' + r.status + ' ' + JSON.stringify(j).slice(0, 400));
  const file = `${dir}/batch-${kind}.json`;
  fs.writeFileSync(file, JSON.stringify({ name: j.name, model, submitted: new Date().toISOString(), jobs: jobs.map(({ key, id, out, jpeg }) => ({ key, id, out, jpeg })) }, null, 1));
  console.log(`submitted ${jobs.length} images as ${j.name} (${file}); commit + push that file now, then collect with: node scripts/paint.mjs ${level} collect`);
}
async function collect() {
  const files = ['cast', 'shots'].map((k) => `${dir}/batch-${k}.json`).filter((f) => fs.existsSync(f));
  if (!files.length) { console.log('no batch job waiting for', level); return; }
  const until = Date.now() + waitMin * 60000;
  for (const file of files) {
    const job = JSON.parse(fs.readFileSync(file, 'utf8'));
    let b;
    for (;;) {
      b = await (await fetch(`${API}/${job.name}`, { headers: HDR })).json();
      const state = b.metadata?.state || b.state || '?';
      if (b.done || /SUCCEEDED|FAILED|CANCELLED|EXPIRED/.test(state)) { console.log(job.name, state); break; }
      if (Date.now() > until) { console.log(job.name, state, `(${job.jobs.length} images, submitted ${job.submitted}); not done yet`); b = null; break; }
      await sleep(60000);
    }
    if (!b) continue;
    const out = b.response?.inlinedResponses?.inlinedResponses || b.response?.inlinedResponses || b.metadata?.output?.inlinedResponses?.inlinedResponses || [];
    const byKey = Object.fromEntries(job.jobs.map((j) => [j.key, j]));
    const done = new Set();
    for (let i = 0; i < out.length; i++) {
      const o = out[i], jb = byKey[o.metadata?.key] || job.jobs[i]; if (!jb) continue;
      const img = imageOf(o.response);
      if (img) { await save(jb, img); done.add(jb.key); } else console.log('  no image for', jb.key, o.error ? JSON.stringify(o.error).slice(0, 200) : o.response?.candidates?.[0]?.finishReason || '');
    }
    const miss = job.jobs.filter((j) => !done.has(j.key)).map((j) => j.id);
    if (miss.length) console.log('not painted:', miss.join(' '), '(repaint them, batch or not)');
    fs.renameSync(file, file.replace('.json', `-${Date.now()}.done.json`));
  }
}

if (step === 'collect') { await collect(); process.exit(0); }
const model = await pickModel(); console.log('model:', model, batch ? '(batch)' : '');
const jobs = (step === 'cast'
  ? (ids.length ? ids : Object.keys(board.cast)).map(castJob)
  : board.shots.filter((s) => !s.img && (!ids.length || ids.includes(s.id))).map(shotJob))  // img = reuses another shot's painting
  .filter((j) => { if (fs.existsSync(j.out) && !force) { console.log('skip', j.key); return false; } return true; });
if (!jobs.length) process.exit(0);
if (batch) await submit(model, jobs, step);
else await pool(jobs, par, async (j) => { await save(j, await paint(model, j)); });
if (failed.length) { console.error('failed:', failed.join(' ')); process.exit(2); }
