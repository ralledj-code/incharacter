// Image-to-video with Gemini Omni 1.2 Flash (Interactions API; Veo is gone from the API as of 2026-11):
//   node scripts/omni-clip.mjs <still.jpg> "<motion prompt>" <out.mp4> [3s..15s] [360p|720p|1080p|4k]
// ~$0.07 per second at 720p (5,792 output tokens/s). Clips come with generated sound: strip it (ffmpeg -an) for the player.
// Two people lying together (level 14 s10) failed twice with a bare INVALID_ARGUMENT and no charge: likely a safety refusal.
import fs from 'node:fs';
const [img,prompt,out,dur='5s',res='720p']=process.argv.slice(2);
const H={'x-goog-api-key':process.env.GEMINI_API_KEY,'content-type':'application/json'};
const API='https://generativelanguage.googleapis.com/v1beta';
const body={model:'gemini-omni-1.2-flash',background:true,
 input:[{type:'image',data:fs.readFileSync(img).toString('base64'),mime_type:'image/jpeg'},{type:'text',text:prompt}],
 response_modalities:['video'],response_format:{type:'video',duration:dur,resolution:res,aspect_ratio:'16:9'},
 generation_config:{video_config:{task:'image_to_video'}}};
let r=await fetch(`${API}/interactions`,{method:'POST',headers:H,body:JSON.stringify(body)});
let j=await r.json(); if(!r.ok){console.log('ERR',JSON.stringify(j).slice(0,500));process.exit(1)}
fs.writeFileSync(out+'.start.json',JSON.stringify(j,null,1).slice(0,5000));
const id=j.id||j.name; console.log('id',id,'status',j.status);
for(let i=0;i<90&&!/completed|failed|cancel/i.test(j.status||'');i++){await new Promise(z=>setTimeout(z,10000));r=await fetch(`${API}/interactions/${id}`,{headers:H});j=await r.json();process.stdout.write((j.status||'?')+' ');}
fs.writeFileSync(out+'.json',JSON.stringify(j,(k,v)=>typeof v==='string'&&v.length>300?v.slice(0,60)+'…['+v.length+']':v,1));
// find video data or uri anywhere
let found=null;(function walk(o){if(!o||typeof o!=='object'||found)return;if(o.type==='video'||o.mime_type&&/video/.test(o.mime_type)){if(o.data||o.uri){found=o;return}}for(const v of Object.values(o))walk(v)})(j);
if(!found){console.log('\nno video found; status',j.status);process.exit(1)}
if(found.data)fs.writeFileSync(out,Buffer.from(found.data,'base64'));else{const v=await fetch(found.uri,{headers:H});fs.writeFileSync(out,Buffer.from(await v.arrayBuffer()))}
console.log('\nsaved',out,fs.statSync(out).size,'usage',JSON.stringify(j.usage||j.usage_metadata||{}).slice(0,300));
