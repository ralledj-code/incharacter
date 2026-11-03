import numpy as np, wave
SR=24000; rng=np.random.default_rng(7)
def lp(x,fc):
  a=np.exp(-2*np.pi*fc/SR); y=np.zeros_like(x); s=0.0
  for i in range(len(x)): s=(1-a)*x[i]+a*s; y[i]=s
  return y
def lpf(x,fc,n=2):
  for _ in range(n): x=lp(x,fc)
  return x
def hp(x,fc): return x-lpf(x,fc,1)
def bp(x,lo,hi): return hp(lpf(x,hi,2),lo)
def t(d): return np.arange(int(d*SR))/SR
def env(d,a,r):
  n=int(d*SR); e=np.ones(n); na=max(1,int(a*SR)); nr=max(1,int(r*SR)); e[:na]=np.linspace(0,1,na); e[-nr:]*=np.linspace(1,0,nr); return e
def norm(x,p=0.9): m=np.max(np.abs(x)) or 1; return x/m*p
def echo(x,taps=((0.09,0.35),(0.17,0.22),(0.31,0.14),(0.5,0.08))):
  y=np.concatenate([x,np.zeros(int((max(d for d,g in taps)+0.1)*SR))])
  for d,g in taps: k=int(d*SR); y[k:k+len(x)]+=g*x
  return y
def save(name,x):
  x=np.clip(x,-1,1); w=wave.open(name+'.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x*32767).astype('<i2').tobytes()); w.close()
def brown(n):
  w=rng.standard_normal(n); b=np.cumsum(w); b-=lpf(b,0.5,1); return norm(b)
# fire crackle bed (60 s, looped)
def crackle(d=60):
  n=int(d*SR); bed=lpf(rng.standard_normal(n),900,2)*0.25+brown(n)*0.15
  pops=np.zeros(n)
  for k in rng.integers(0,n-2000,int(d*9)):
    L=int(rng.uniform(0.003,0.02)*SR); pops[k:k+L]+=rng.standard_normal(L)*np.exp(-np.linspace(0,8,L))*rng.uniform(0.3,1)
  pops=bp(pops,400,5000)
  return norm(bed*0.5+pops)
def howl():
  d=2.8; tt=t(d); f=380+260*np.sin(np.pi*np.clip(tt/2.2,0,1))**1.5-60*tt; f+=6*np.sin(2*np.pi*5.5*tt)
  ph=2*np.pi*np.cumsum(f)/SR; x=np.sin(ph)+0.35*np.sin(2*ph)+0.15*np.sin(3*ph)
  x+=0.08*lpf(rng.standard_normal(len(tt)),2000)
  x*=env(d,0.35,1.2); return norm(echo(lpf(x,1800,2),((0.21,0.4),(0.43,0.25),(0.7,0.15),(1.0,0.08))),0.5)
def creak():
  d=1.3; tt=t(d); rate=40+70*np.sin(np.pi*tt/d)**2; ph=np.cumsum(rate)/SR; imp=(np.diff(np.floor(ph),prepend=0)>0).astype(float)
  ring=np.sin(2*np.pi*np.array([420,890,1530])[:,None]*t(0.03)[None,:]).sum(0)*np.exp(-np.linspace(0,6,int(0.03*SR)))
  x=np.convolve(imp,ring)[:len(tt)]; x=bp(x,250,3000)*env(d,0.1,0.3); return norm(x,0.55)
def squelch():
  d=0.7; tt=t(d); f=260*np.exp(-tt*5)+60; x=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-tt*6)
  x+=lpf(rng.standard_normal(len(tt)),700,2)*np.exp(-tt*9)*2
  return norm(lpf(x,1200,1),0.6)
def whoosh():
  d=1.6; tt=t(d); n=rng.standard_normal(len(tt)); x=np.zeros_like(n); seg=int(0.05*SR)
  for i in range(0,len(n),seg):
    fc=300+3000*(i/len(n))**0.7; x[i:i+seg]=bp(n[i:i+seg+200],fc*0.5,fc*1.5)[:len(n[i:i+seg])]
  x*=env(d,0.9,0.4)**1.5
  boom=lpf(rng.standard_normal(int(1.2*SR)),120,3)*np.exp(-np.linspace(0,5,int(1.2*SR)))*6
  y=np.concatenate([x,np.zeros(int(1.2*SR))]); y[int(1.3*SR):int(1.3*SR)+len(boom)]+=boom
  return norm(y,0.7)
def chain():
  d=1.0; tt=t(d); x=np.zeros_like(tt)
  for k,(st,g) in enumerate([(0,1),(0.06,0.6),(0.15,0.45),(0.27,0.3),(0.4,0.2)]):
    L=int(0.5*SR); s=int(st*SR); tt2=t(0.5); fr=np.array([1180,2730,4150,5600])*rng.uniform(0.9,1.1)
    tone=(np.sin(2*np.pi*fr[:,None]*tt2[None,:])*np.array([1,0.6,0.4,0.25])[:,None]).sum(0)*np.exp(-tt2*14)
    x[s:s+L]+=g*tone[:len(x)-s]
  x[:int(0.01*SR)]+=rng.standard_normal(int(0.01*SR))*1.5
  return norm(echo(x),0.55)
def thunder():
  d=3.5; n=int(d*SR); crack=hp(rng.standard_normal(int(0.25*SR)),800)*np.exp(-np.linspace(0,6,int(0.25*SR)))
  rum=lpf(rng.standard_normal(n),150,3)*env(d,0.15,2.0)*(1+0.5*np.sin(2*np.pi*1.3*t(d)))
  x=norm(rum)*0.9; x[:len(crack)]+=norm(crack)*0.8; return norm(x,0.7)
def roar():
  d=1.1; tt=t(d); f=95+30*np.sin(np.pi*tt/d); ph=2*np.pi*np.cumsum(f)/SR
  saw=sum(np.sin(k*ph)/k for k in range(1,14)); x=saw*(1+0.6*np.sin(2*np.pi*28*tt))+0.6*lpf(rng.standard_normal(len(tt)),1500,2)
  x=lpf(x,1100,2)*env(d,0.12,0.06)   # cut short
  return norm(echo(x,((0.25,0.3),(0.5,0.15))),0.75)
def arrow():
  d=0.55; tt=t(d); n=rng.standard_normal(len(tt)); x=np.zeros_like(n); seg=int(0.02*SR)
  for i in range(0,len(n),seg):
    fc=3800-2600*(i/len(n)); x[i:i+seg]=bp(n[i:i+seg+100],fc*0.85,fc*1.15)[:len(n[i:i+seg])]
  x*=env(d,0.05,0.05); thunk=lpf(rng.standard_normal(int(0.12*SR)),400,2)*np.exp(-np.linspace(0,7,int(0.12*SR)))*4
  y=np.concatenate([x,np.zeros(int(0.15*SR))]); y[len(x)-200:len(x)-200+len(thunk)]+=thunk; return norm(y,0.55)
def rumble():
  d=3.5; n=int(d*SR); x=lpf(rng.standard_normal(n),70,3)*env(d,1.0,1.6); return norm(x,0.85)
def drips(d=9):
  n=int(d*SR); x=np.zeros(n)
  for s in np.sort(rng.uniform(0.3,d-0.6,7)):
    tt=t(0.25); f=1700*rng.uniform(0.8,1.3)*(1+0.4*np.exp(-tt*40)); ping=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-tt*22)
    k=int(s*SR); x[k:k+len(ping)]+=ping*rng.uniform(0.5,1)
  return norm(echo(x,((0.12,0.5),(0.26,0.3),(0.45,0.18),(0.7,0.1))),0.45)
def snore():
  d=2.4; tt=t(d); breath=np.sin(np.pi*np.clip(tt/1.6,0,1))**2
  saw=sum(np.sin(2*np.pi*k*32*tt)/k for k in range(1,20)); x=lpf(saw,500,2)*(0.4+lpf(rng.standard_normal(len(tt)),300,1))*breath
  return norm(x,0.45)
for name,fn in [('crackle',crackle),('howl',howl),('creak',creak),('squelch',squelch),('whoosh',whoosh),('chain',chain),('thunder',thunder),('roar',roar),('arrow',arrow),('rumble',rumble),('drips',drips),('snore',snore)]:
  save(name,fn()); print('made',name)
