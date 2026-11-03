import fs from 'node:fs';
const ROOT='https://generativelanguage.googleapis.com', API=ROOT+'/v1beta', HDR={'x-goog-api-key':process.env.GEMINI_API_KEY};
const data=fs.readFileSync(process.argv[2]);
let r=await fetch(`${ROOT}/upload/v1beta/files`,{method:'POST',headers:Object.assign({'X-Goog-Upload-Protocol':'resumable','X-Goog-Upload-Command':'start','X-Goog-Upload-Header-Content-Length':String(data.length),'X-Goog-Upload-Header-Content-Type':'audio/wav','content-type':'application/json'},HDR),body:JSON.stringify({file:{display_name:'b'}})});
r=await fetch(r.headers.get('x-goog-upload-url'),{method:'POST',headers:Object.assign({'content-length':String(data.length),'X-Goog-Upload-Offset':'0','X-Goog-Upload-Command':'upload, finalize'},HDR),body:data});
const file=(await r.json()).file; for(let i=0;i<20;i++){const s=await (await fetch(`${API}/${file.name}`,{headers:HDR})).json(); if(s.state==='ACTIVE')break; await new Promise(k=>setTimeout(k,2000));}
r=await fetch(`${API}/models/gemini-3.1-pro-preview:generateContent`,{method:'POST',headers:Object.assign({'content-type':'application/json'},HDR),body:JSON.stringify({contents:[{role:'user',parts:[{fileData:{mimeType:'audio/wav',fileUri:file.uri}},{text:'A man and a woman talk. Transcribe it, one line per utterance, each starting with M: or F: by who is actually speaking (judge by the voice, not by the words).'}]}],generationConfig:{temperature:0}})});
const j=await r.json(); console.log((j.candidates?.[0]?.content?.parts||[]).map(p=>p.text||'').join(''));
