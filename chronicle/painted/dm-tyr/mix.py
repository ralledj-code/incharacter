"""Final mix for "Tyr's price": voices + SFX on the shot cuts + rain/drip beds + underscore + choir swell.
Run from painted/dm-tyr/ after timeline.py and painted/make/14t.py: python mix.py  -> ../../../public/chronicle/levels/14-tyrs-price.mp3
Every number here is a creative choice; change and rerun (a few seconds)."""
import json, subprocess
SR = 48000
TL = json.load(open('timeline.json')); END = TL['end']
B = json.load(open('../14-tyrs-price.json')); S = {s['id']: s for s in B['shots']}
SCRIPT = {c['id']: c['sp'] for c in json.load(open('voice/script.json'))['clips']}
VOICE_FX = {  # per speaker
    'tyr': 'asetrate=48000*0.92,aresample=48000,aecho=0.8:0.7:110|240|400:0.32|0.22|0.14,volume=1.5',
    'dolkan': 'aecho=0.8:0.85:60|140:0.10|0.06',  # a little cave / memory space
    'valerys': 'aecho=0.8:0.85:90|200:0.14|0.08',  # stone sanctum
}
SFX_GAIN = {'staff': 1.0, 'spores': 0.7, 'thunder': 0.9, 'rain': 0.8, 'heart': 0.55, 'hiss': 0.8, 'blades': 0.85,
            'sword': 0.8, 'gate': 0.85, 'rumble': 0.9, 'drips': 0.6, 'boom': 1.0}
SFX_FILE = {'boom': 'staff'}  # the final burst reuses the staff crack+boom, layered with the rumble below
t = lambda sid: S[sid]['t']
BEDS = [  # (file, start, end, gain, fade in, fade out)
    ('sfx/drips.mp3', 0.0, t('s11') + 2, 0.45, 2.0, 3.0),       # the silent cavern
    ('sfx/rain.mp3', t('s17') - 0.5, t('s37'), 0.35, 1.5, 0.6),   # rain in the sanctum until the torches freeze
    ('sfx/rain.mp3', t('s57'), t('s73') + 3, 0.18, 3.0, 3.0),     # faint rain under the price
    ('sfx/drips.mp3', t('s74'), END, 0.45, 2.0, 2.0),           # back in the cavern
]
MUSIC = [  # (file, file offset, start, end, gain, fade in, fade out)
    ('music/underscore-test.mp3', 0.0, t('s16'), t('s37') - 0.2, 0.22, 4.0, 0.4),      # memory: drone under the sanctum, cut by the freeze
    ('music/underscore-test.mp3', 70.0, t('s43'), t('s60') + 6, 0.2, 2.0, 5.0),        # Tyr speaks: the drone returns
    ('music/choir-swell.mp3', 0.0, t('s67') - 47.0, t('s74') + 1.0, 0.5, 6.0, 3.0),    # choir rises into the golden light (its swell starts at 47 s)
]
# heartbeats: (start, end)
HEART = [(t('s22'), t('s24') + 2), (t('s57'), t('s60'))]

def build():
    ins, fl, labels = [], [], []
    def add(path, extra_in=None):
        ins.extend((extra_in or []) + ['-i', path]); return len(ins) // 2 - 1 if not extra_in else None
    n = 0
    def inp(path, loop=False):
        nonlocal n
        if loop: ins.extend(['-stream_loop', '-1', '-i', path])
        else: ins.extend(['-i', path])
        n += 1; return n - 1
    # voices
    for cid, (st, en) in TL['clips'].items():
        k = inp(f'voice/best/{cid}.wav'); ms = int(st * 1000)
        fl.append(f'[{k}:a]aresample={SR},aformat=channel_layouts=stereo,{VOICE_FX[SCRIPT[cid]]},adelay={ms}|{ms}[v{k}]'); labels.append(f'[v{k}]')
    # sfx on cuts
    for s in B['shots']:
        if not s.get('sfx') or s['sfx'] in ('heart',): continue
        name = s['sfx']; k = inp(f"sfx/{SFX_FILE.get(name, name)}.mp3"); ms = int(s['t'] * 1000)
        pre = 0.12 if name in ('staff', 'thunder', 'boom', 'gate', 'sword') else 0.0  # hits: the transient lands on the frame
        fl.append(f'[{k}:a]aresample={SR},aformat=channel_layouts=stereo,atrim=start={pre},asetpts=PTS-STARTPTS,afade=t=out:st=5:d=2,volume={SFX_GAIN[name]},adelay={ms}|{ms}[x{k}]'); labels.append(f'[x{k}]')
        if name == 'boom':
            k2 = inp('sfx/rumble.mp3'); fl.append(f'[{k2}:a]aresample={SR},aformat=channel_layouts=stereo,volume=0.9,adelay={ms}|{ms}[x{k2}]'); labels.append(f'[x{k2}]')
    for a, b in HEART:
        k = inp('sfx/heart.mp3', loop=True); ms = int(a * 1000); d = b - a
        fl.append(f'[{k}:a]aresample={SR},aformat=channel_layouts=stereo,atrim=0:{d:.2f},afade=t=in:d=1.5,afade=t=out:st={max(0, d - 2):.2f}:d=2,volume={SFX_GAIN["heart"]},adelay={ms}|{ms}[h{k}]'); labels.append(f'[h{k}]')
    for path, a, b, g, fi, fo in BEDS:
        k = inp(path, loop=True); ms = int(a * 1000); d = b - a
        fl.append(f'[{k}:a]aresample={SR},aformat=channel_layouts=stereo,atrim=0:{d:.2f},afade=t=in:d={fi},afade=t=out:st={max(0, d - fo):.2f}:d={fo},volume={g},adelay={ms}|{ms}[b{k}]'); labels.append(f'[b{k}]')
    for path, off, a, b, g, fi, fo in MUSIC:
        k = inp(path, loop=True); ms = int(max(0, a) * 1000); d = b - max(0, a); off2 = off + max(0, -a)
        fl.append(f'[{k}:a]aresample={SR},aformat=channel_layouts=stereo,atrim={off2:.2f}:{off2 + d:.2f},asetpts=PTS-STARTPTS,afade=t=in:d={fi},afade=t=out:st={max(0, d - fo):.2f}:d={fo},volume={g},adelay={ms}|{ms}[m{k}]'); labels.append(f'[m{k}]')
    fl.append(''.join(labels) + f'amix=inputs={len(labels)}:normalize=0:dropout_transition=0,atrim=0:{END},alimiter=limit=0.95,loudnorm=I=-16:TP=-1.5:LRA=14[o]')
    out = '../../../public/chronicle/levels/14-tyrs-price.mp3'
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', *ins, '-filter_complex', ';'.join(fl), '-map', '[o]', '-ar', str(SR), '-ac', '2', '-b:a', '192k', out], check=True)
    print('mixed', out, 'inputs', n)

if __name__ == '__main__':
    build()
