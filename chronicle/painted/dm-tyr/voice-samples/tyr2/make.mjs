// Tyr recast samples (Rasmus 2026-11-22: Dolkan takes Charon; Tyr "more booming, god like"). node voice-samples/tyr2/make.mjs [voices]
import fs from 'fs'; import { execFileSync } from 'child_process';
const H = { 'content-type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY };
export const CTX = `You are playing Tyr, the god of justice, speaking through a colossal stone statue in a vast cathedral sanctum. Your voice is ENORMOUS: a deep, resonant, booming bass that fills the whole cathedral like rolling thunder, full chest and full power held barely in check; slow, measured, every word a pronouncement of law. Cold and absolute, never angry, never warm, never quiet or thin; on the weightiest words the voice swells into a boom. Not a narrator, not a man: a god pronouncing judgement.`;
const TEXT = `(slow, immense, booming) The Law demands balance, Valerys.
(a pause; each word weighed, resonant) No life is given without a price.
(swelling to a thunderous boom) You will be the city's shield for as long as your heart beats.`;
const VOICES = process.argv.slice(2).length ? process.argv.slice(2) : ['Algenib', 'Alnilam', 'Zubenelgenubi', 'Schedar'];
const out = 'voice-samples/tyr2';
export const GOD = 'asplit=2[a][b];[a]rubberband=pitch=0.9:formant=preserved,equalizer=f=110:t=q:w=1:g=4,volume=1.0[m];[b]rubberband=pitch=0.45,lowpass=f=900,volume=0.35[o];[m][o]amix=inputs=2:normalize=0,aecho=0.8:0.6:90|210|380|620:0.30|0.22|0.15|0.09';
await Promise.all(VOICES.map(async (v) => {
  for (let k = 0; k < 3; k++) {
    try {
      const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-preview-tts:generateContent', { method: 'POST', headers: H, body: JSON.stringify({ contents: [{ parts: [{ text: CTX + '\nPerform the following; the words in parentheses are stage directions, never speak them.\n\n' + TEXT }] }], generationConfig: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: v } } } } }) });
      const j = await r.json(); const p = j?.candidates?.[0]?.content?.parts?.find((x) => x.inlineData); if (!p) throw new Error(JSON.stringify(j).slice(0, 150));
      fs.writeFileSync(`${out}/${v}.pcm`, Buffer.from(p.inlineData.data, 'base64'));
      execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 's16le', '-ar', '24000', '-ac', '1', '-i', `${out}/${v}.pcm`, '-ar', '48000', `${out}/${v}.wav`]); fs.unlinkSync(`${out}/${v}.pcm`);
      execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', `${out}/${v}.wav`, '-filter_complex', GOD, '-b:a', '160k', `${out}/Tyr-${v}.mp3`]);
      console.log('ok', v); return;
    } catch (e) { console.log('retry', v, e.message); }
  }
}));
