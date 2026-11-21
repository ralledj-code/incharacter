// QA for generated clips: Gemini watches each clip with its intended beats and lists visible errors.
//   node scripts/review-clips.mjs <level> [ids...] > review.json      (model: gemini-3.1-pro-preview)
import fs from 'node:fs';
const [level, ...ids] = process.argv.slice(2), dir = `painted/${level}`, pub = `../public/chronicle/levels/${level}`;
const H = { 'x-goog-api-key': process.env.GEMINI_API_KEY, 'content-type': 'application/json' };
const clips = JSON.parse(fs.readFileSync(`${dir}/clips.json`, 'utf8')).filter((g) => !ids.length || ids.includes(g.id));
const CAST = 'Lucien: blond half-elf man, long straight blond hair, pointed ears, burgundy velvet coat, glowing blue dagger. Arthas: always fully helmed, dark plate, hood, glowing orange eye slits, burning orange sword, face never seen. Cedric: bald monk, short dark beard, green tunic, red-brown wraps, wooden staff. Nerrissa: drow woman, dark purple-grey skin, long silver hair, two silver blades. Wittan: small bald grey gnome with a lantern. Valerys: old grey-bearded knight, torn white-crimson robes, golden sword. The flower of teeth: monster with a ring of yellow petals around a fanged mouth, four arms holding flames. The wurm: colossal pale worm. Baphomet: huge horned goat demon.';
const out = [];
await Promise.all(clips.map(async (g) => {
  const data = fs.readFileSync(`${pub}/${g.id}.mp4`).toString('base64');
  const prompt = `You are a strict film editor reviewing an AI-generated video clip for a fantasy music video. Intended content (with timings): ${g.prompt.slice(g.prompt.indexOf('Beats:'))}\nCharacters: ${CAST}\nList every visible ERROR: morphing or melting faces/bodies/hands, extra or missing limbs, objects appearing/disappearing, characters changing identity or look mid-clip, wrong character (e.g. Arthas without helmet, Lucien with wrong hair), invented extra people, garbled text, glitchy frames, physically impossible motion, a beat that is missing or badly late/early. Ignore minor stylistic differences. Answer JSON only: {"score": 1-5 (5 = clean, 1 = unusable), "errors": [{"t": seconds, "what": "short"}], "worst": "one line"}`;
  for (let k = 0; k < 2; k++) {
    const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent', { method: 'POST', headers: H,
      body: JSON.stringify({ contents: [{ parts: [{ inlineData: { mimeType: 'video/mp4', data } }, { text: prompt }] }], generationConfig: { responseMimeType: 'application/json', temperature: 0 } }) });
    const j = await r.json(); if (!r.ok) { if (k) out.push({ id: g.id, err: JSON.stringify(j).slice(0, 150) }); continue; }
    try { out.push(Object.assign({ id: g.id, t0: g.t0 }, JSON.parse(j.candidates[0].content.parts.map((p) => p.text || '').join('')))); break; } catch (e) { if (k) out.push({ id: g.id, err: 'parse' }); }
  }
}));
out.sort((a, b) => (a.score || 0) - (b.score || 0));
console.log(JSON.stringify(out, null, 1));
