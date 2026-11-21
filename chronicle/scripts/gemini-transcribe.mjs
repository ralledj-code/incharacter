// Timed transcription with Gemini: node scripts/gemini-transcribe.mjs <song.mp3> <out.txt> [model=gemini-3.8-flash] -> lines '[mm:ss.s] text'.
// Edit the names hint below for each song. Key: GEMINI_API_KEY (or the proxy's network secret).
import fs from 'node:fs';
const ROOT='https://generativelanguage.googleapis.com', API=ROOT+'/v1beta', HDR=process.env.GEMINI_API_KEY?{'x-goog-api-key':process.env.GEMINI_API_KEY}:{};
const f=process.argv[2], out=process.argv[3], model=process.argv[4]||'gemini-3.8-flash';
const data=fs.readFileSync(f);
let r=await fetch(`${ROOT}/upload/v1beta/files`,{method:'POST',headers:Object.assign({'X-Goog-Upload-Protocol':'resumable','X-Goog-Upload-Command':'start','X-Goog-Upload-Header-Content-Length':String(data.length),'X-Goog-Upload-Header-Content-Type':'audio/mpeg','content-type':'application/json'},HDR),body:JSON.stringify({file:{display_name:'song'}})});
const url=r.headers.get('x-goog-upload-url'); r=await fetch(url,{method:'POST',headers:Object.assign({'content-length':String(data.length),'X-Goog-Upload-Offset':'0','X-Goog-Upload-Command':'upload, finalize'},HDR),body:data});
const file=(await r.json()).file; console.log('uploaded',file.uri, file.state);
for(let i=0;i<20;i++){const s=await (await fetch(`${API}/${file.name}`,{headers:HDR})).json(); if(s.state==='ACTIVE')break; await new Promise(k=>setTimeout(k,3000));}
const prompt=`Transcribe the sung lyrics of this song exactly, line by line, in order, with the time each line STARTS being sung, in seconds from the start of the audio, as precise as you can (to 0.1 s). Group lines into sections (intro, verse, chorus, bridge, outro...). Also list instrumental gaps longer than 6 s and the time the music ends. The song is an English song. Names that may occur: Lucien, Arthas, Cedric, Valerys, Baphomet, Alaron, Severin, Silas, Neeris, Nerrissa, Wittan, Cobh, Duncastle, Ahm. Output one line per sung line as: [seconds] text`;
r=await fetch(`${API}/models/${model}:generateContent`,{method:'POST',headers:Object.assign({'content-type':'application/json'},HDR),body:JSON.stringify({contents:[{role:'user',parts:[{fileData:{mimeType:'audio/mpeg',fileUri:file.uri}},{text:prompt}]}],generationConfig:{temperature:0}})});
const j=await r.json(); if(!r.ok){console.log(JSON.stringify(j).slice(0,500));process.exit(1)}
fs.writeFileSync(out+'.raw.json',JSON.stringify(j));const txt=(j.candidates?.[0]?.content?.parts||[]).map(p=>p.text||'').join(''); fs.writeFileSync(out,txt); console.log('usage',JSON.stringify(j.usageMetadata));
