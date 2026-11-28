// Underscore for the Alaron Noire intro (Rasmus: no Suno now, "invent, very low"). node music/make-music.mjs
import fs from 'fs';
const P = {
  'warm': 'A quiet, intimate underscore for a film flashback: solo warm acoustic guitar picking slow arpeggios with a soft cello holding long notes, a little music-box like celesta, summer evening, fond and a bit wistful, D major turning to B minor at the end. Very sparse, very soft, gentle and even, no drums, no percussion, no vocals. About 50 seconds, ending softly into silence.',
  'dark': 'A dark fantasy film-noir underscore, very low and restrained: deep sustained low strings (cellos and basses), a slow heartbeat-like low drum only now and then, a lonely solo viola line, distant muted brass swells, rain-soaked, tense and grieving, D minor. No vocals, no choir, no bright instruments, no sudden loud hits, slow and even, it stays underneath a narrator the whole time. Builds slowly toward the end into a quiet unresolved low chord and fades. About 2 minutes 30 seconds.',
};
await Promise.all(Object.entries(P).map(async ([name, prompt]) => {
  const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/lyria-3-pro-preview:generateContent', { method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }), signal: AbortSignal.timeout(500000) });
  const j = await r.json(); const p = j?.candidates?.[0]?.content?.parts?.find((x) => x.inlineData);
  if (!p) return console.log(name, 'FAILED', JSON.stringify(j).slice(0, 300));
  fs.writeFileSync(`music/${name}.mp3`, Buffer.from(p.inlineData.data, 'base64')); console.log('ok', name);
}));
