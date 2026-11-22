import fs from 'fs';
const res = [];
await Promise.all(fs.readdirSync('.').filter(f => f.startsWith('old-')).map(async f => {
  const data = fs.readFileSync(f).toString('base64');
  const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent', { method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY }, body: JSON.stringify({ contents: [{ parts: [{ inlineData: { mimeType: 'audio/mpeg', data } }, { text: 'Casting a voice for an ancient (400-year-old) evil-looking dwarf sorcerer: wanted WAY OLD, raspy, dark. Rate this voice honestly. JSON only: {"apparent_age": years, "rasp": 1-10, "dark": 1-10, "acting_life": 1-10, "stage_directions_read_aloud": true/false, "artifacts_or_distortion": 1-10 (10 = very distorted), "note": "short"}' }] }], generationConfig: { responseMimeType: 'application/json', temperature: 0 } }) });
  const j = await r.json(); res.push([f, j?.candidates?.[0]?.content?.parts?.[0]?.text]);
}));
res.sort().forEach(([f, t]) => console.log(f, t.replace(/\s+/g, ' ')));
