// Dolkan recast samples (Rasmus 2026-11-22: "way older, raspy, dark"). Run from painted/dm-tyr: node voice-samples/dolkan2/make.mjs
import fs from 'fs'; import { execFileSync } from 'child_process';
const H = { 'content-type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY };
const CTX = `You are a great character actor in a dark fantasy film, playing Dolkan: an ANCIENT duergar sorcerer, over four hundred years old. His voice is ruined by centuries in the lightless deep: very deep, dark, dry and raspy like stones grinding together, cracked, with a rattling wheeze in his breath. He speaks SLOWLY, heavily, every word weighed; he is frail in body but terrifying in will. Right now all his madness has drained away. He speaks to three young warriors in a huge cavern, seconds after a giant worm dived under the stone. Real breath, real tension; never a narrator, never young, never smooth.`;
const TEXT = `(low, rasping, barely above a whisper, eyes on the cracked floor) Listen closely, boys... there's no time before it surfaces again.
(a dry, rattling breath; then slow, haunted) I know that man. I stood beneath the towering arches of Caer Callidyr... before he cast me into the dark!
(rising to a hoarse, cracking roar) Stop praying to a god who has already collected his due!`;
const VOICES = process.argv.slice(2).length ? process.argv.slice(2) : ['Algenib', 'Gacrux', 'Enceladus', 'Rasalgethi', 'Charon', 'Umbriel'];
const out = 'voice-samples/dolkan2';
await Promise.all(VOICES.map(async (v) => {
  for (let k = 0; k < 3; k++) {
    try {
      const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-preview-tts:generateContent', { method: 'POST', headers: H, body: JSON.stringify({ contents: [{ parts: [{ text: CTX + '\nPerform the following; the words in parentheses are stage directions, never speak them.\n\n' + TEXT }] }], generationConfig: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: v } } } } }) });
      const j = await r.json(); const p = j?.candidates?.[0]?.content?.parts?.find((x) => x.inlineData); if (!p) throw new Error(JSON.stringify(j).slice(0, 150));
      fs.writeFileSync(`${out}/${v}.pcm`, Buffer.from(p.inlineData.data, 'base64'));
      execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 's16le', '-ar', '24000', '-ac', '1', '-i', `${out}/${v}.pcm`, '-ar', '48000', `${out}/${v}.wav`]); fs.unlinkSync(`${out}/${v}.pcm`);
      console.log('ok', v); return;
    } catch (e) { console.log('retry', v, e.message); }
  }
}));
