// Sacred choir bed for the sanctum scenes (Rasmus 2026-11-22: "more choir during the church scenes"). node music/make-choir.mjs
import fs from 'fs';
const P = {
  'choir-sanctum-a': 'A slow, sustained, wordless sacred choir: deep male basses and soft female voices holding long "ah" and "oh" chords in a vast gothic cathedral with a very long natural reverb. D minor, dark, sorrowful, reverent. No percussion, no instruments except a barely audible low organ drone. Constant, even, soft level throughout: no crescendos, no sudden entries, no climax; chords change very slowly, every 8-10 seconds, always overlapping. About 3 minutes. Starts from near silence and ends by slowly fading away.',
  'choir-sanctum-b': 'Gregorian-style low male chant pad, wordless humming and sustained vowels, sung far away in a huge stone cathedral at night, deep reverb, a faint high female voice above it now and then. Dark, mournful, holy. No drums, no strings, no melody leaps. Very even and soft from start to end, slow overlapping chord changes, no climax. About 3 minutes, gentle fade in and fade out.',
};
await Promise.all(Object.entries(P).map(async ([name, prompt]) => {
  const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/lyria-3-pro-preview:generateContent', { method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }), signal: AbortSignal.timeout(500000) });
  const j = await r.json(); const p = j?.candidates?.[0]?.content?.parts?.find((x) => x.inlineData);
  if (!p) return console.log(name, 'FAILED', JSON.stringify(j).slice(0, 300));
  fs.writeFileSync(`music/${name}.mp3`, Buffer.from(p.inlineData.data, 'base64')); console.log('ok', name);
}));
