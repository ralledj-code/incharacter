import fs from 'node:fs';
const turns=JSON.parse(fs.readFileSync('script.json','utf8'));
const style="TTS this conversation deep underground, in a cavern of glowing fungus seconds after a brutal fight, the monster lies dead nearby, smoke still hanging. Both are out of breath at first and calm down as they talk. Lucien is a young half-elf wild magic sorcerer with a worn, raspy, slightly hoarse voice; he was just knocked down and healed, he is battered, shaken and raw, warm and honest, speaking softly, never smug; his last line is barely sung, a whisper of a lullaby melody. Nerrissa is a drow monster hunter with a sweet, silky voice that has a dangerous edge; here she is quietly concerned, low and close, almost tender, and her line 'Then don't.' is a soft plea.";
const text=turns.map(([s,t])=>s+': '+t).join('\n');
for(let k=0;k<3;k++){
 const r=await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-preview-tts:generateContent',{method:'POST',headers:{'content-type':'application/json','x-goog-api-key':process.env.GEMINI_API_KEY},
  body:JSON.stringify({contents:[{parts:[{text:style+"\n\n"+text}]}],generationConfig:{responseModalities:['AUDIO'],speechConfig:{multiSpeakerVoiceConfig:{speakerVoiceConfigs:[
   {speaker:'Lucien',voiceConfig:{prebuiltVoiceConfig:{voiceName:'Algenib'}}},{speaker:'Nerrissa',voiceConfig:{prebuiltVoiceConfig:{voiceName:'Sulafat'}}}]}}}})});
 const j=await r.json(); if(!r.ok){console.log('err',JSON.stringify(j).slice(0,300));continue}
 const p=j.candidates?.[0]?.content?.parts?.find(x=>x.inlineData); if(!p){console.log('noaudio');continue}
 fs.writeFileSync('talk.pcm',Buffer.from(p.inlineData.data,'base64'));console.log('ok');break}
