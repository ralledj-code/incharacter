// Record every clip of script.json in N takes (Gemini 2.5 Pro TTS, directed), judge each take, keep the best as best/<id>.wav.
// node record.mjs [ids...]   (takes/ is the raw material; best.json records the choice and the judge's notes)
import fs from 'node:fs'; import { execFileSync } from 'node:child_process';
const S=JSON.parse(fs.readFileSync('script.json','utf8'));
const VOICE={dolkan:['Rasalgethi'],valerys:['Orus'],tyr:['Charon','Alnilam']}, TAKES=2;
const H={'content-type':'application/json','x-goog-api-key':process.env.GEMINI_API_KEY};
const want=process.argv.slice(2); fs.mkdirSync('takes',{recursive:true}); fs.mkdirSync('best',{recursive:true});
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
async function post(url,body){for(let k=0;k<4;k++){try{const r=await fetch(url,{method:'POST',headers:H,body:JSON.stringify(body),signal:AbortSignal.timeout(280000)});const j=await r.json();if(r.ok)return j;console.log('  http',r.status,JSON.stringify(j).slice(0,120))}catch(e){console.log('  err',e.message)}await sleep(5000*(k+1))}return null}
async function tts(c,voice,n){const f=`takes/${c.id}-${voice}-${n}`;if(fs.existsSync(f+'.wav'))return f;
 const j=await post('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-preview-tts:generateContent',{contents:[{parts:[{text:S.context[c.sp]+'\nPerform the following; the words in parentheses are stage directions, never speak them.\n\n'+c.dir}]}],generationConfig:{responseModalities:['AUDIO'],speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:voice}}}}});
 const p=j?.candidates?.[0]?.content?.parts?.find(x=>x.inlineData);if(!p)return null;
 fs.writeFileSync(f+'.pcm',Buffer.from(p.inlineData.data,'base64'));execFileSync('ffmpeg',['-loglevel','error','-y','-f','s16le','-ar','24000','-ac','1','-i',f+'.pcm','-ar','48000','-ac','1',f+'.wav']);fs.unlinkSync(f+'.pcm');
 execFileSync('ffmpeg',['-loglevel','error','-y','-i',f+'.wav','-b:a','96k',f+'.mp3']);return f}
async function judge(c,f){const data=fs.readFileSync(f+'.mp3').toString('base64');
 const j=await post('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent',{contents:[{parts:[{inlineData:{mimeType:'audio/mpeg',data}},{text:`Intended words: "${c.sub.join(' ')}" (the place name may be pronounced "Kair Kal-ih-deer"). Answer JSON only: {"words_ok": true/false (all intended words spoken, nothing extra; false if stage directions are read aloud), "life": 1-5 (5 = a real film actor with emotion and breath, 1 = flat TTS), "note": "short"}`}]}],generationConfig:{responseMimeType:'application/json',temperature:0}});
 try{let o=JSON.parse(j.candidates[0].content.parts.map(p=>p.text||'').join(''));return Array.isArray(o)?o[0]:o}catch(e){return{words_ok:false,life:0,note:'judge error'}}}
const best=fs.existsSync('best.json')?JSON.parse(fs.readFileSync('best.json','utf8')):{};
const jobs=S.clips.filter(c=>!want.length||want.includes(c.id));let next=0;
async function worker(){while(next<jobs.length){const c=jobs[next++];const res=[];
 for(const v of VOICE[c.sp])for(let n=1;n<=TAKES;n++){const f=await tts(c,v,n);if(!f){console.log(c.id,v,n,'no audio');continue}const r=await judge(c,f);res.push({f,v,...r});}
 res.sort((a,b)=>(b.words_ok-a.words_ok)||(b.life-a.life));const b=res[0];
 if(b){fs.copyFileSync(b.f+'.wav',`best/${c.id}.wav`);best[c.id]={take:b.f,voice:b.v,life:b.life,words_ok:b.words_ok,note:b.note,all:res.map(x=>[x.f,x.words_ok,x.life])};}
 console.log(c.id,b?`${b.v} life ${b.life} words ${b.words_ok}`:'FAILED');fs.writeFileSync('best.json',JSON.stringify(best,null,1));}}
await Promise.all(Array.from({length:4},worker));
