import fs from 'node:fs';
const [prompt,out,dur='4s']=process.argv.slice(2);
const H={'x-goog-api-key':process.env.GEMINI_API_KEY,'content-type':'application/json'},API='https://generativelanguage.googleapis.com/v1beta';
let r=await fetch(`${API}/interactions`,{method:'POST',headers:H,body:JSON.stringify({model:'gemini-omni-1.2-flash',background:true,input:[{type:'text',text:prompt}],response_modalities:['video'],response_format:{type:'video',duration:dur,resolution:'360p',aspect_ratio:'16:9'},generation_config:{video_config:{task:'text_to_video'}}})});
let j=await r.json(); if(!r.ok){console.log('ERR',JSON.stringify(j).slice(0,300));process.exit(1)}
for(let i=0;i<90&&!/completed|failed/.test(j.status||'');i++){await new Promise(z=>setTimeout(z,6000));j=await (await fetch(`${API}/interactions/${j.id}`,{headers:H})).json();}
let f=null;(function w(o){if(!o||typeof o!=='object'||f)return;if((o.type==='video'||/video/.test(o.mime_type||''))&&o.data){f=o;return}Object.values(o).forEach(w)})(j);
if(!f){console.log(out,'fail',j.status,JSON.stringify(j.errors||'').slice(0,150));process.exit(1)}
fs.writeFileSync(out+'.mp4',Buffer.from(f.data,'base64'));console.log(out,'ok',j.usage?.total_output_tokens);
