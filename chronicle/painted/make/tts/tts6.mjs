import fs from 'node:fs';
const beats=JSON.parse(fs.readFileSync('beats6.json','utf8')); const want=process.argv.slice(2).map(Number);
const base="TTS the following conversation by a small campfire deep in a cave late at night, intimate and quiet. Lucien is a young half-elf wild magic sorcerer with a worn, raspy, slightly hoarse voice, roughened by smoke, drink and too many bad nights. He flirts and jokes to keep it light, warm and wry, never smug; he has seen terrible things and it shows, and when he gets honest his voice drops and goes quiet with real feeling. Drow is a drow woman with a sweet, silky voice that has a dangerous edge.";
for(const b of beats){ if(want.length&&!want.includes(b.n)) continue;
  const text=b.turns.map(t=>`${t.sp}: ${t.text}`).join('\n');
  const style=base+` In this part of the conversation she is ${b.mood}.`;
  for(let k=0;k<3;k++){
    const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-preview-tts:generateContent`,{method:'POST',headers:{'content-type':'application/json','x-goog-api-key':process.env.GEMINI_API_KEY},
      body:JSON.stringify({contents:[{parts:[{text:style+"\n\n"+text}]}],generationConfig:{responseModalities:['AUDIO'],speechConfig:{multiSpeakerVoiceConfig:{speakerVoiceConfigs:[
        {speaker:'Lucien',voiceConfig:{prebuiltVoiceConfig:{voiceName:'Algenib'}}},{speaker:'Drow',voiceConfig:{prebuiltVoiceConfig:{voiceName:'Despina'}}}]}}}})});
    const j=await r.json(); if(!r.ok){console.log('err',b.n,JSON.stringify(j).slice(0,300)); await new Promise(z=>setTimeout(z,15000)); continue;}
    const p=j.candidates?.[0]?.content?.parts?.find(x=>x.inlineData); if(!p){console.log('noaudio',b.n);continue;}
    fs.writeFileSync(`v6/b${String(b.n).padStart(2,'0')}.pcm`,Buffer.from(p.inlineData.data,'base64')); console.log('ok',b.n); break; }
}
