import json,wave,numpy as np
SR=24000; S='/tmp/claude-0/-home-user-incharacter/4c6fe062-92b2-561a-8920-c5007bb528dc/scratchpad/'
L=json.load(open('lines6.json'))
def rd(p):
  w=wave.open(p); return np.frombuffer(w.readframes(w.getnframes()),'<i2').astype(np.float32)/32768
INTRO,GAP=4.0,1.0
C={(l['beat'],c):k for l in L for k,c in l['cues']}
PIG=C[(7,'the fire fades away')]; PIG2=C[(7,'silence, then the fire creeps back')]; WORM=C[(14,'a deep rumble')]; TH=C[(10,'thunder')]; DIE=C[(2,'the fire crackles')]; HM=C[(2,'a pause')]
PAUSE={(2,DIE):(1.3,False),(2,HM):(1.0,False),(7,PIG):(2.0,True),(7,PIG2):(1.2,False),(14,WORM):(1.8,False)}
EXTRA_AFTER={}
THUNDER_GAIN,RUMBLE_GAIN,BED=0.75,0.6,0.16
voice=[np.zeros(int(INTRO*SR))]; t=INTRO; out_lines=[]; events=[]
for l in L:
  a=rd('v6/b%02d.wav'%l['beat']); bt0=t; rel=[x-l['t0'] for x in l['times']]
  cuts=sorted([(k,v) for (b,k),v in PAUSE.items() if b==l['beat']])
  segs=[];prev=0;shift=0;newrel=list(rel)
  e=np.convolve(a**2,np.ones(240)/240,'same')
  for k,(dur,duck) in cuts:
    c=int(max(0,rel[k]-0.05)*SR); lo,hi=max(0,c-int(0.5*SR)),min(len(a)-1,c+int(0.2*SR))
    c=lo+int(np.argmin(e[lo:hi])); segs.append(a[prev:c]); segs.append(np.zeros(int(dur*SR)))
    pt=bt0+c/SR+shift; events.append(('pause',round(pt,2),dur,duck)); prev=c; shift+=dur
    for j in range(k,len(newrel)): newrel[j]+=dur
  segs.append(a[prev:]); aa=np.concatenate(segs)
  voice.append(aa); t+=len(aa)/SR
  out_lines.append({'beat':l['beat'],'t0':round(bt0,2),'dur':round(len(aa)/SR,2),'units':l['units'],'times':[round(bt0+x,2) for x in newrel],'cues':l['cues']})
  g=GAP+EXTRA_AFTER.get(l['beat'],0); voice.append(np.zeros(int(g*SR))); t+=g
voice=np.concatenate(voice); voice=np.concatenate([voice,np.zeros(int(6*SR))]); N=len(voice)
f=rd(S+'sfx/fire3.wav'); bed=np.zeros(N); pos=0; xf=int(0.5*SR)
while pos<N:
  seg=f.copy(); seg[:xf]*=np.linspace(0,1,xf); seg[-xf:]*=np.linspace(1,0,xf); n=min(len(seg),N-pos); bed[pos:pos+n]+=seg[:n]; pos+=len(seg)-xf
gain=np.full(N,BED); gain[:int(INTRO*SR)]=np.linspace(BED*2,BED,int(INTRO*SR))
for kind,pt,dur,duck in events:
  if duck:  # the fire fades away over a second as the fireball line ends, stays silent through the pause, then creeps back
    a0=int((pt-1.0)*SR); a1=int((pt+0.1)*SR); b1=int((pt+dur)*SR); b2=int((pt+dur+2.0)*SR)
    gain[a0:a1]=np.linspace(BED,0.0,a1-a0)**1.0; gain[a1:b1]=0; gain[b1:b2]=np.linspace(0,BED,b2-b1)
end=int((t-1.0)*SR); gain[end:]=np.linspace(BED,0.3,N-end); gain[-int(3*SR):]*=np.linspace(1,0,int(3*SR))
mix=voice*0.95+bed*gain
def place(name,at,g):
  s=rd(S+'sfx/'+name+'.wav'); k=int(at*SR); n=min(len(s),N-k); mix[k:k+n]+=s[:n]*g
b9=[l for l in out_lines if l['beat']==10][0]; place('thunder',b9['times'][TH]-0.4,THUNDER_GAIN)
b13=[l for l in out_lines if l['beat']==14][0]; place('rumble',b13['times'][WORM]-1.9,RUMBLE_GAIN)
mix=mix/max(1.0,np.max(np.abs(mix))/0.97)
w=wave.open('final6.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix*32767).astype('<i2').tobytes()); w.close()
json.dump({'duration':round(N/SR,2),'lines':out_lines,'events':events,'thunder':round(b9['times'][TH]-0.4,2)},open('final6.json','w'),ensure_ascii=False,indent=1)
print('duration',round(N/SR,1),events)
