"""Final mix for "Tyr's price": voices + SFX on the shot cuts + rain/drip beds + underscore + choir swell.
Run from painted/dm-tyr/ after timeline.py and painted/make/14t.py: python mix.py  -> ../../../public/chronicle/levels/14-tyrs-price.mp3
Every number here is a creative choice; change and rerun (a few seconds)."""
import json, subprocess
SR = 48000
import glob, os
SFX_LEN = {os.path.basename(f)[:-4]: float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], capture_output=True, text=True).stdout) for f in glob.glob('sfx/*.mp3')}
TL = json.load(open('timeline.json')); END = TL['end']
B = json.load(open('../14-tyrs-price.json')); S = {s['id']: s for s in B['shots']}
SCRIPT = {c['id']: c['sp'] for c in json.load(open('voice/script.json'))['clips']}
# Rasmus 2026-11-22 (2nd listen): voices far too quiet, music too loud with hard cuts, effects end abruptly; more choir in the church.
# So: voices +4 dB, music -4 dB and every music/bed fade at least 6 s, smooth (slow) ducking, effects decay out, a sacred choir bed.
VOICE_FX = {  # per speaker
    'tyr': 'volume=2.0',  # the god treatment is baked into best/t*.wav (voice/process.py)
    'dolkan': 'aecho=0.8:0.85:60|140:0.10|0.06,volume=2.2',  # a little cave / memory space (age treatment baked in by voice/process.py)
    'valerys': 'volume=1.6',  # dry (Rasmus: no reverb on Valerys)
}
# 3rd listen: effects still too loud (all about -5 dB again), the looped rain/drips audibly loop -> no rain (occasional distant
# thunder instead), drips and heartbeats laid as separate overlapping copies instead of a loop.
SFX_GAIN = {'staff': 0.55, 'spores': 0.4, 'thunder': 0.32, 'rain': 0.0, 'heart': 0.3, 'hiss': 0.3, 'blades': 0.36,
            'sword': 0.3, 'gate': 0.22, 'rumble': 0.3, 'drips': 0.3, 'boom': 0.45}
DISTANT_THUNDER = [71.0, 131.0, 225.0, 271.5, 336.0]  # far-off rolls in the pauses of the memory (seconds; see timeline.json gaps)
SFX_TONE = {'rumble': 'lowpass=f=1800,', 'gate': 'lowpass=f=6000,', 'boom': 'lowpass=f=5000,'}  # Omni audio can be crunchy up top; a rumble is all low end
SHOT_GAIN = {'s01': 0.6, 's79': 0.6}  # per-shot trim on top of SFX_GAIN: the opening rumble is the wurm far below, under speech level
# where the hit is inside each Omni clip (measured: 25 % energy onset; gate = its slam), trimmed so it lands on the cut
ONSET = {'staff': 1.2, 'thunder': 1.58, 'sword': 1.7, 'gate': 2.3, 'hiss': 1.6, 'spores': 2.0}
SFX_TAIL = 2.2  # every effect decays (exponential) over its last 2.2 s (the Omni clips stop dead where their video ends)
SFX_IN = {'rain': 1.5, 'rumble': 1.5, 'spores': 0.8, 'drips': 0.5}  # textures swell in; hits (staff, thunder, sword, gate, hiss, boom) keep their attack
BLADES_PEAK = 2.2  # the thousand blades swell to here, then fall away fast (0.4 s) on the next shot (the white flash, s42)
SFX_FILE = {'boom': 'staff'}  # the final burst reuses the staff crack+boom, layered with the rumble below
MARKS = B.get('marks') or {}
t = lambda sid: MARKS.get(sid, S[sid]['t'] if sid in S else None)  # planned moments survive the storyboard's pacing merges
BEDS = [  # (file, start, end, gain, fade in, fade out)
    ('sfx/drips.mp3', 0.0, t('s11') + 4, 0.45, 3.0, 6.0),       # the silent cavern
    ('sfx/drips.mp3', t('s74') - 2, END, 0.45, 6.0, 3.0),           # back in the cavern
]
MUSIC = [  # (file, file offset, start, end, gain, fade in, fade out)
    ('music/underscore-test.mp3', 0.0, t('s16'), t('s32') + 4, 0.13, 8.0, 7.0),        # memory: cello drone under the sanctum, gone for Valerys's plea
    ('music/choir-sanctum-a.mp3', 0.0, t('s16') + 2, t('s41') - 1, 0.20, 10.0, 7.0),    # the cathedral choir, softly through the memory and the plea, gone before the blades
    ('music/underscore-test.mp3', 70.0, t('s43') + 1, t('s60') + 8, 0.12, 8.0, 8.0),    # Tyr speaks: the drone returns
    ('music/choir-sanctum-b.mp3', 0.0, t('s43') + 2, t('s67') - 30, 0.18, 10.0, 12.0),  # low chant under Tyr and the price, handing over to the swell
    ('music/choir-swell.mp3', 0.0, t('s67') + 6 - 79.0, t('s72') + 2.0, 0.30, 8.0, 10.0),    # choir peaks (79 s into the file) as the golden light floods in, gone under 'Let my life be their chain'
]
# heartbeats: (start, end)
HEART = [(t('s22'), t('s24') + 2), (t('s57'), t('s60'))]

def build():
    ins, fl, labels, vlab, mlab = [], [], [], [], []
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
        if os.environ.get('NOVOICE'): ms = int((END + 5) * 1000)  # analysis: the bed without voices
        fl.append(f'[{k}:a]aresample={SR},aformat=channel_layouts=stereo,{VOICE_FX[SCRIPT[cid]]},adelay={ms}|{ms}[v{k}]'); vlab.append(f'[v{k}]')
    # sfx on cuts
    for s in B['shots']:
        if not s.get('sfx') or s['sfx'] in ('heart', 'rain'): continue
        name = s['sfx']; k = inp(f"sfx/{SFX_FILE.get(name, name)}.mp3"); ms = int(s['t'] * 1000)
        if name == 'blades':
            nxt = B['shots'][B['shots'].index(s) + 1]['t']; st0 = nxt - BLADES_PEAK
            for j, (dt, rate, g) in enumerate([(0, 1, 1), (0.07, 0.94, 0.6), (0.15, 1.07, 0.55), (0.26, 0.88, 0.5), (0.38, 1.13, 0.45), (0.55, 0.97, 0.4)]):
                kj = k if j == 0 else inp('sfx/blades.mp3'); mj = int((st0 - 0.55 + dt) * 1000); d = nxt - (st0 - 0.55 + dt)
                fl.append(f'[{kj}:a]aresample={SR},aformat=channel_layouts=stereo,asetrate={SR}*{rate},aresample={SR},atrim=0:{d + 1.8:.3f},afade=t=in:d=1.2,afade=t=out:curve=exp:st={d - 0.2:.3f}:d=2.0,volume={SFX_GAIN[name] * g:.2f},adelay={mj}|{mj}[x{kj}]'); labels.append(f'[x{kj}]')
            continue
        pre = ONSET.get(SFX_FILE.get(name, name), 0.0)  # trim the Omni lead-in so the hit lands on the frame
        fl.append(f'[{k}:a]aresample={SR},aformat=channel_layouts=stereo,atrim=start={pre},asetpts=PTS-STARTPTS,{SFX_TONE.get(name, '')}afade=t=in:d={SFX_IN.get(name, 0.02)},afade=t=out:curve=exp:st={max(0.3, SFX_LEN[SFX_FILE.get(name, name)] - pre - SFX_TAIL):.2f}:d={SFX_TAIL},volume={SFX_GAIN[name] * SHOT_GAIN.get(s['id'], 1):.2f},adelay={ms}|{ms}[x{k}]'); labels.append(f'[x{k}]')
        if name == 'boom':
            k2 = inp('sfx/rumble.mp3'); fl.append(f'[{k2}:a]aresample={SR},aformat=channel_layouts=stereo,lowpass=f=1800,afade=t=in:d=0.3,afade=t=out:curve=exp:st=3.5:d=2.5,volume=0.3,adelay={ms}|{ms}[x{k2}]'); labels.append(f'[x{k2}]')
    for a, b in HEART:
        L = SFX_LEN['heart']; x = a; first = True
        while x < b:  # copies overlap by 1.2 s with crossfades, so there is no loop seam
            k = inp('sfx/heart.mp3'); ms = int(x * 1000); d = min(L, b - x + 1.2)
            fl.append(f'[{k}:a]aresample={SR},aformat=channel_layouts=stereo,atrim=0:{d:.2f},afade=t=in:d={3 if first else 1.2},afade=t=out:st={max(0, d - 1.2):.2f}:d=1.2,volume={SFX_GAIN["heart"]},adelay={ms}|{ms}[h{k}]'); labels.append(f'[h{k}]')
            x += L - 1.2; first = False
    import random; rnd = random.Random(14)
    for path, a, b, g, fi, fo in BEDS:
        if 'drips' in path:  # irregular: a 2-3 s slice of the drip clip every 4-9 s, each faded, with small pitch changes
            x = a
            while x < b - 1:
                k = inp(path); off = rnd.uniform(0, SFX_LEN['drips'] - 3); d = rnd.uniform(2.0, 3.0); rate = rnd.uniform(0.92, 1.08); ms = int(x * 1000)
                gg = g * min(1, (x - a + 0.5) / max(fi, 0.5), (b - x) / max(fo, 0.5))
                fl.append(f'[{k}:a]aresample={SR},aformat=channel_layouts=stereo,atrim={off:.2f}:{off + d:.2f},asetpts=PTS-STARTPTS,asetrate={SR}*{rate:.3f},aresample={SR},afade=t=in:d=0.3,afade=t=out:st={d - 0.8:.2f}:d=0.8,volume={gg:.2f},adelay={ms}|{ms}[b{k}]'); labels.append(f'[b{k}]')
                x += rnd.uniform(4.0, 9.0)
            continue
        k = inp(path, loop=True); ms = int(a * 1000); d = b - a
        fl.append(f'[{k}:a]aresample={SR},aformat=channel_layouts=stereo,{"lowpass=f=7000," if "rain" in path else ""}atrim=0:{d:.2f},afade=t=in:d={fi},afade=t=out:st={max(0, d - fo):.2f}:d={fo},volume={g},adelay={ms}|{ms}[b{k}]'); labels.append(f'[b{k}]')
    for path, off, a, b, g, fi, fo in MUSIC:
        k = inp(path, loop=True); ms = int(max(0, a) * 1000); d = b - max(0, a); off2 = off + max(0, -a)
        fl.append(f'[{k}:a]aresample={SR},aformat=channel_layouts=stereo,atrim={off2:.2f}:{off2 + d:.2f},asetpts=PTS-STARTPTS,afade=t=in:d={fi},afade=t=out:st={max(0, d - fo):.2f}:d={fo},volume={g},adelay={ms}|{ms}[m{k}]'); mlab.append(f'[m{k}]')
    for x in DISTANT_THUNDER:  # far away: no crack, only the low roll
        k = inp('sfx/thunder.mp3'); ms = int(x * 1000)
        fl.append(f'[{k}:a]aresample={SR},aformat=channel_layouts=stereo,atrim=start=1.4,asetpts=PTS-STARTPTS,lowpass=f=700,afade=t=in:d=0.8,afade=t=out:curve=exp:st=2.0:d=2.6,aecho=0.8:0.7:300|700:0.3|0.2,volume=0.3,adelay={ms}|{ms}[x{k}]'); labels.append(f'[x{k}]')
    # room tone: a faint low air under everything, so no pause is ever digital silence (it read as a dropout)
    fl.append(f'anoisesrc=color=brown:amplitude=0.02:sample_rate={SR}:duration={END:.2f},lowpass=f=250,highpass=f=30,aformat=channel_layouts=stereo,volume=0.5,afade=t=in:d=3,afade=t=out:st={END - 4:.2f}:d=4[room]'); labels.append('[room]')
    fl.append(''.join(vlab) + f'amix=inputs={len(vlab)}:normalize=0:dropout_transition=0,asplit=2[vb][vk]')
    fl.append(''.join(mlab) + f'amix=inputs={len(mlab)}:normalize=0:dropout_transition=0[mb]')
    fl.append('[mb][vk]sidechaincompress=threshold=0.015:ratio=6:attack=250:release=1800:makeup=1[md]')  # music dips ~6-8 dB while someone speaks
    labels += ['[vb]', '[md]']
    fl.append(''.join(labels) + f'amix=inputs={len(labels)}:normalize=0:dropout_transition=0,atrim=0:{END},alimiter=limit=0.95:level=0[o]')
    out = os.environ.get('MIX_OUT', '../../../public/chronicle/levels/14-tyrs-price.mp3'); tmp = 'mix-raw.wav'
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', *ins, '-filter_complex', ';'.join(fl), '-map', '[o]', '-ar', str(SR), '-ac', '2', tmp], check=True)
    # one static gain to -16 LUFS (single-pass loudnorm pumps: it lifted the silent intro to speech level)
    m = subprocess.run(['ffmpeg', '-hide_banner', '-i', tmp, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    I = float(m.rsplit('I:', 1)[1].split('LUFS')[0]); g = float(os.environ['FIXED_GAIN']) if os.environ.get('FIXED_GAIN') else -15.0 - I  # FIXED_GAIN: analysis renders at the real mix's gain
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', tmp, '-af', f'volume={g:.2f}dB,alimiter=limit=0.84:level=0', '-b:a', '192k', out], check=True)
    os.remove(tmp); print(f'integrated {I:.1f} LUFS, gain {g:+.1f} dB')
    print('mixed', out, 'inputs', n)

if __name__ == '__main__':
    build()
