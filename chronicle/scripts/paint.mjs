// Paints a level's storyboard with Google's Gemini image model (needs GEMINI_API_KEY).
//   node scripts/paint.mjs <level> cast            character sheets -> painted/<level>/cast/<name>.jpg (the look every shot copies)
//   node scripts/paint.mjs <level> shots [ids...]  shots -> painted/<level>/raw/<id>.png (cast sheets of `who` go in as references)
//   options: --force (repaint existing), --model <name>, --n <parallel> (default 3)
// Then: python scripts/layers.py <level> (web images + depth maps for the parallax player).
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const args = process.argv.slice(2), flag = (k) => { const i = args.indexOf(k); if (i < 0) return null; const v = args[i + 1]; args.splice(i, 2); return v; };
const force = args.includes('--force'); if (force) args.splice(args.indexOf('--force'), 1);
const wantModel = flag('--model'), par = +(flag('--n') || 3);
const [level, step, ...ids] = args;
const KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!level || !['cast', 'shots'].includes(step)) { console.error('usage: node scripts/paint.mjs <level> cast|shots [ids...] [--force] [--model m] [--n 3]'); process.exit(1); }
if (!KEY) { console.error('GEMINI_API_KEY is not set'); process.exit(1); }
const board = JSON.parse(fs.readFileSync(`painted/${level}.json`, 'utf8'));
const dir = `painted/${level}`, castDir = `${dir}/cast`, rawDir = `${dir}/raw`;
fs.mkdirSync(castDir, { recursive: true }); fs.mkdirSync(rawDir, { recursive: true });
const API = 'https://generativelanguage.googleapis.com/v1beta';

// pick an image model: --model, GEMINI_IMAGE_MODEL, else the best image-capable model the key can see
async function pickModel() {
  if (wantModel || process.env.GEMINI_IMAGE_MODEL) return wantModel || process.env.GEMINI_IMAGE_MODEL;
  const r = await fetch(`${API}/models?pageSize=200&key=${KEY}`); const j = await r.json();
  if (!r.ok) throw new Error('list models: ' + JSON.stringify(j).slice(0, 300));
  const names = (j.models || []).filter((m) => (m.supportedGenerationMethods || []).includes('generateContent') && /image/i.test(m.name) && !/imagen/i.test(m.name)).map((m) => m.name.replace('models/', ''));
  const rank = (n) => (/pro/.test(n) ? 4 : 0) + (/preview/.test(n) ? 0 : 1) + (+(n.match(/gemini-(\d+(\.\d+)?)/) || [0, 0])[1]);
  names.sort((a, b) => rank(b) - rank(a));
  if (!names.length) throw new Error('no Gemini image model visible to this key');
  console.log('image models:', names.join(', '));
  return names[0];
}

async function paint(model, prompt, refs, aspect) {
  const parts = [{ text: prompt }];
  for (const f of refs) parts.push({ inlineData: { mimeType: 'image/jpeg', data: fs.readFileSync(f).toString('base64') } });
  const body = (withAspect) => JSON.stringify({ contents: [{ role: 'user', parts }], generationConfig: Object.assign({ responseModalities: ['IMAGE', 'TEXT'] }, withAspect ? { imageConfig: { aspectRatio: aspect } } : {}) });
  let withAspect = true;
  for (let tries = 0; tries < 6; tries++) {
    const r = await fetch(`${API}/models/${model}:generateContent?key=${KEY}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: body(withAspect) });
    const j = await r.json().catch(() => ({}));
    if (r.status === 400 && withAspect && /imageConfig|aspect/i.test(JSON.stringify(j))) { withAspect = false; continue; }
    if (r.status === 429 || r.status >= 500) { const w = 2000 * 2 ** tries; console.log(`  ${r.status}, retry in ${w / 1000}s`); await new Promise((k) => setTimeout(k, w)); continue; }
    if (!r.ok) throw new Error(r.status + ' ' + JSON.stringify(j).slice(0, 400));
    const img = (j.candidates?.[0]?.content?.parts || []).find((p) => p.inlineData || p.inline_data);
    if (img) return Buffer.from((img.inlineData || img.inline_data).data, 'base64');
    const why = j.candidates?.[0]?.finishReason || JSON.stringify(j.promptFeedback || {});
    console.log('  no image (' + why + '), retrying'); await new Promise((k) => setTimeout(k, 1500));
  }
  throw new Error('gave up');
}

async function pool(items, n, fn) {
  const q = items.slice(); const run = async () => { while (q.length) { const it = q.shift(); try { await fn(it); } catch (e) { console.error('FAILED', it.id || it, e.message); failed.push(it.id || it); } } };
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, run));
}
const failed = [];
const model = await pickModel(); console.log('model:', model);

if (step === 'cast') {
  const names = (ids.length ? ids : Object.keys(board.cast));
  await pool(names.map((id) => ({ id })), par, async ({ id }) => {
    const out = `${castDir}/${id}.jpg`; if (fs.existsSync(out) && !force) { console.log('skip', id); return; }
    const prompt = `${board.style}\nCharacter reference sheet on a plain dark neutral background: the same character shown three times side by side, full body from the front, full body from the side, and a large head-and-shoulders portrait. Consistent design, even soft light, clear silhouette.\nCharacter: ${board.cast[id]}`;
    const buf = await paint(model, prompt, [], '16:9');
    await sharp(buf).jpeg({ quality: 90 }).toFile(out); console.log('cast', id, '->', out);
  });
} else {
  const shots = board.shots.filter((s) => !ids.length || ids.includes(s.id));
  await pool(shots, par, async (s) => {
    const out = `${rawDir}/${s.id}.png`; if (fs.existsSync(out) && !force) { console.log('skip', s.id); return; }
    const who = (s.who || []).filter((w) => fs.existsSync(`${castDir}/${w}.jpg`));
    const refNote = who.length ? `\nThe attached images are character reference sheets, in this order: ${who.join(', ')}. Keep each character's face, hair, clothes and colours exactly as in their sheet.` : '';
    const castNote = (s.who || []).map((w) => `${w}: ${board.cast[w]}`).join('\n');
    const prompt = `${board.style}\nWide 16:9 cinematic frame. Keep the important subject inside the central area and leave some calm margin at the edges (the camera will drift slightly).\nScene: ${s.scene}${castNote ? '\nCharacters:\n' + castNote : ''}${refNote}`;
    const buf = await paint(model, prompt, who.map((w) => `${castDir}/${w}.jpg`), '16:9');
    fs.writeFileSync(out, buf); console.log('shot', s.id, '->', out);
  });
}
if (failed.length) { console.error('failed:', failed.join(' ')); process.exit(2); }
