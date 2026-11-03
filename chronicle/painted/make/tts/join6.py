import json,re,wave,array,sys
B=json.load(open('beats6.json')); SR=24000; INTRO=4.0; GAP=1.0
out=array.array('h'); out.extend([0]*int(INTRO*SR)); L=[]
for b in B:
  w=wave.open('v6/b%02d.wav'%b['n']); a=array.array('h',w.readframes(w.getnframes())); t0=len(out)/SR; out.extend(a); out.extend([0]*int(GAP*SR))
  units=[];cues=[]
  for t in b['turns']:
    for p in re.split(r'(\{[^}]*\})',t['raw']):
      if p.startswith('{'): cues.append((len(units),p[1:-1])); continue
      for s in re.split(r'(?<=[.!?…])\s+(?=[A-Z"“.])',p.strip()):
        if s.strip(): units.append({'sp':t['sp'],'text':s.strip()})
  L.append({'beat':b['n'],'t0':t0,'dur':len(a)/SR,'units':units,'cues':cues})
w=wave.open('conv6.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(out.tobytes()); w.close()
json.dump(L,open('lines6.json','w'),ensure_ascii=False,indent=1)
json.dump([{'section':'b%02d'%l['beat'],'lines':[u['text'] for u in l['units']]} for l in L],open('lyrics6.json','w'),ensure_ascii=False)
