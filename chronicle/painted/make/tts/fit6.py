import json
L=json.load(open('lines6.json')); A=json.load(open('align6.json'))['t']; i=0; bad=[]
for l in L:
  n=len(l['units']); t0,t1=l['t0'],l['t0']+l['dur']; al=[max(a,t0+0.05) for a in A[i:i+n]]; i+=n
  tot=sum(len(u['text']) for u in l['units']); acc=0; prop=[]
  for u in l['units']: prop.append(t0+0.15+(t1-t0)*acc/tot); acc+=len(u['text'])
  ok=all(a<=t1 for a in al) and all(x<y for x,y in zip(al,al[1:]))
  l['times']=[round(x,2) for x in (al if ok else prop)]
  if not ok: bad.append(l['beat'])
json.dump(L,open('lines6.json','w'),ensure_ascii=False,indent=1); print('fallback beats',bad)
