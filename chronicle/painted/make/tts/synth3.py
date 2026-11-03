exec(open('synth.py').read().split("for name,fn in")[0])
def fire(d=20):
  n=int(d*SR)
  roar=lpf(rng.standard_normal(n),220,3); roar*= (0.7+0.3*lpf(rng.standard_normal(n),1.5,1)/0.02).clip(0.3,1.3)
  hiss=bp(rng.standard_normal(n),1500,6000)*0.04*(0.6+0.4*np.abs(lpf(rng.standard_normal(n),3,1))*20).clip(0,1.5)
  cr=np.zeros(n)
  # bursts of tiny crackles, clustered like burning wood
  for c in rng.uniform(0,d-0.5,int(d*2.5)):
    for k in range(rng.integers(3,12)):
      s=int((c+rng.exponential(0.05))*SR); L=int(rng.uniform(0.001,0.004)*SR)
      if s+L<n: cr[s:s+L]+=rng.standard_normal(L)*np.exp(-np.linspace(0,6,L))*rng.uniform(0.1,0.6)
  for c in rng.uniform(0,d-0.5,int(d*0.4)):
    s=int(c*SR); L=int(0.03*SR); cr[s:s+L]+=lpf(rng.standard_normal(L),2500,1)*np.exp(-np.linspace(0,7,L))*2.5
  cr=lpf(hp(cr,300),5000,1)
  return norm(norm(roar)*0.55+hiss+norm(cr)*0.7)
save('fire3',fire()); print('ok')
