import fs from 'fs';
const res = [];
await Promise.all(fs.readdirSync('.').filter(f => f.startsWith('Tyr-')).map(async f => {
  const data = fs.readFileSync(f).toString('base64');
  const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent', { method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY }, body: JSON.stringify({ contents: [{ parts: [{ inlineData: { mimeType: 'audio/mpeg', data } }, { text: 'Casting the voice of a GOD of justice speaking from a statue: wanted booming, enormous, godlike, deep, yet every word clear. Rate honestly. JSON only: {"booming": 1-10, "godlike": 1-10, "clarity_of_words": 1-10, "acting_life": 1-10, "stage_directions_read_aloud": true/false, "artifacts": 1-10 (10 = very processed/garbled), "note": "short"}' }] }], generationConfig: { responseMimeType: 'application/json', temperature: 0 } }) });
  const j = await r.json(); res.push([f, j?.candidates?.[0]?.content?.parts?.[0]?.text]);
}));
res.sort().forEach(([f, t]) => console.log(f, (t||'').replace(/\s+/g, ' ')));
