import fs from 'node:fs';
const H={'content-type':'application/json','x-goog-api-key':process.env.GEMINI_API_KEY};
async function tts(model,voice,text,out){for(let k=0;k<3;k++){const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,{method:'POST',headers:H,body:JSON.stringify({contents:[{parts:[{text}]}],generationConfig:{responseModalities:['AUDIO'],speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:voice}}}}})});const j=await r.json();const p=j.candidates?.[0]?.content?.parts?.find(x=>x.inlineData);if(p){fs.writeFileSync(out,Buffer.from(p.inlineData.data,'base64'));console.log(out,'ok');return}console.log(out,'retry',JSON.stringify(j).slice(0,150));await new Promise(z=>setTimeout(z,4000))}}
const VAL_A=`You are a voice actor in a dark fantasy film. Scene: a rain-lashed stone sanctum at night. Valerys, a proud knight of forty, has thrown off his armour and kneels on cold stone; his two small sons lie dying of black poison beside him; his wife has vanished. He is praying to his god as a broken man, the first time in his life he has begged. Perform it, don't read it: real ragged breaths, the voice cracking and catching, tears in the throat, rising to a raw desperate shout and collapsing into a whisper on the last words.
(barely holding together, a shaky breath) Their mother is gone, Tyr...
(voice breaking, pleading) do not take them from me too!
(rising, desperate, almost a shout) Take me instead!
(faster, frantic, each phrase more raw) Strip my title, take my honor, take every breath left in my lungs!
(collapsing, a sob caught in the throat, a whisper) Just burn this poison from my boys... let them live.`;
const DOL_A=`You are a voice actor in a dark fantasy film. Scene: a huge cavern right after a giant worm has dived under the stone; dead silence. Dolkan is a very old duergar sorcerer, normally a cackling madman. Now all the madness drains out of him: he speaks low, hard and urgent to three young warriors, like a man who has carried a terrible secret for decades. Gravelly, ancient voice; perform it with tension, breath and weight, not like a narrator.
(low, urgent, almost a hiss) Listen closely, boys... there's no time before it surfaces again.
(hard, cutting) Drop the jokes.
(slower, heavy, remembering) I know that man.
(bitter, the old wound showing) I stood beneath the towering arches of Kair Kal-ih-deer... before he cast me into the dark!`;
const VAL_B=`[kneeling, broken, praying through tears] [shaky breath] Their mother is gone, Tyr... [voice cracks] do not take them from me too! [desperate shout] Take me instead! [frantic] Strip my title, take my honor, take every breath left in my lungs! [sob] [whispering] Just burn this poison from my boys... let them live.`;
const DOL_B=`[low, deadly serious, urgent] Listen closely, boys... there's no time before it surfaces again. [hard] Drop the jokes. [slow, heavy] I know that man. [bitter] I stood beneath the towering arches of Kair Kal-ih-deer... before he cast me into the dark!`;
await Promise.all([
 tts('gemini-2.5-pro-preview-tts','Orus',VAL_A,'A_valerys.pcm'),tts('gemini-2.5-pro-preview-tts','Gacrux',DOL_A,'A_dolkan.pcm'),
 tts('gemini-3.8-flash-tts','Orus',VAL_B,'B_valerys.pcm'),tts('gemini-3.8-flash-tts','Gacrux',DOL_B,'B_dolkan.pcm')]);
