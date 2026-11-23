"""Bakes each speaker's voice treatment into best/<id>.wav from the chosen raw take (best.json), so timeline.py measures
the real length. Run after record.mjs: python process.py   (Valerys stays raw; his room echo is added in mix.py)"""
import json, subprocess
CHAIN = {
    # Dolkan, ancient (Rasmus picked sample 4 = Charon, 2026-11-22): slowed and lowered 7 %, chest, edge, a little grit
    'dolkan': 'asetrate=48000*0.93,aresample=48000,highpass=f=60,equalizer=f=160:t=q:w=1.2:g=3,equalizer=f=3200:t=q:w=1.5:g=2,'
              'asoftclip=type=atan:threshold=0.5:output=0.9,acompressor=threshold=0.1:ratio=3:attack=10:release=200:makeup=2,'
              'atempo=1.03',  # 3rd listen: a couple of % faster (same pitch)
    # Tyr, a roaring god (Zubenelgenubi, directed shouting): pitch down 10 % (same tempo), a quiet layer an octave below for size,
    # chest boost, some grit and hard compression for loudness. No reverb (Rasmus, 3rd listen).
    'tyr': 'asplit=2[a][b];[a]rubberband=pitch=0.9:formant=preserved,equalizer=f=110:t=q:w=1:g=5,equalizer=f=2500:t=q:w=1.5:g=2[m];[b]rubberband=pitch=0.45,lowpass=f=900,volume=0.3[o];'
           '[m][o]amix=inputs=2:normalize=0,asoftclip=type=atan:threshold=0.6:output=0.95,acompressor=threshold=0.08:ratio=4:attack=5:release=150:makeup=2',
}
S = {c['id']: c['sp'] for c in json.load(open('script.json'))['clips']}
best = json.load(open('best.json'))
for cid, b in best.items():
    sp = S[cid]
    if sp not in CHAIN: continue
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', b['take'] + '.wav', '-filter_complex', CHAIN[sp] + ',aresample=48000', '-ac', '1', f'best/{cid}.wav'], check=True)
    print('processed', cid, sp)
