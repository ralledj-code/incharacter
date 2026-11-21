// Forced alignment of known lyrics with Gemini (default gemini-3.1-pro-preview): node scripts/gemini-align.mjs <song.mp3> <lyrics.json> <out.json> [model]
// lyrics.json = [{ section, lines: [...] }]; out = { t: [seconds per line] }. Pro sometimes writes 1:03 as 103 past 60 s: check and convert.
// Key: GEMINI_API_KEY (or the proxy's network secret). Average with gemini-transcribe.mjs and snap to beats (see LEVELS.md).
import fs from 'node:fs';
const ROOT='https://generativelanguage.googleapis.com', API=ROOT+'/v1beta', HDR=process.env.GEMINI_API_KEY?{'x-goog-api-key':process.env.GEMINI_API_KEY}:{};
const [f,lyr,out,model='gemini-3.1-pro-preview']=process.argv.slice(2);
const data=fs.readFileSync(f);
let r=await fetch(`${ROOT}/upload/v1beta/files`,{method:'POST',headers:Object.assign({'X-Goog-Upload-Protocol':'resumable','X-Goog-Upload-Command':'start','X-Goog-Upload-Header-Content-Length':String(data.length),'X-Goog-Upload-Header-Content-Type':'audio/mpeg','content-type':'application/json'},HDR),body:JSON.stringify({file:{display_name:'song'}})});
r=await fetch(r.headers.get('x-goog-upload-url'),{method:'POST',headers:Object.assign({'content-length':String(data.length),'X-Goog-Upload-Offset':'0','X-Goog-Upload-Command':'upload, finalize'},HDR),body:data});
const file=(await r.json()).file;
for(let i=0;i<20;i++){const s=await (await fetch(`${API}/${file.name}`,{headers:HDR})).json(); if(s.state==='ACTIVE')break; await new Promise(k=>setTimeout(k,3000));}
const L=JSON.parse(fs.readFileSync(lyr,'utf8')); let n=0; const list=L.flatMap(s=>s.lines.map(x=>`${n++}: ${x}`)).join('\n');
const prompt=`These are the exact lyrics of this song, numbered. For EVERY numbered line give the time in seconds (0.1 s precision) at which the singer starts singing its first word, measured from the very start of this audio file. Listen carefully; the song has long instrumental passages and long silences near the end. Output only JSON: {"t":[...]} with exactly ${n} numbers in line order.\n\n${list}`;
r=await fetch(`${API}/models/${model}:generateContent`,{method:'POST',headers:Object.assign({'content-type':'application/json'},HDR),body:JSON.stringify({contents:[{role:'user',parts:[{fileData:{mimeType:'audio/mpeg',fileUri:file.uri}},{text:prompt}]}],generationConfig:{responseMimeType:'application/json',temperature:0}})});
const j=await r.json(); if(!r.ok){console.log(JSON.stringify(j).slice(0,400));process.exit(1)}
fs.writeFileSync(out,j.candidates[0].content.parts.map(p=>p.text||'').join('')); console.log('ok',n,'lines; tokens',j.usageMetadata.totalTokenCount);
