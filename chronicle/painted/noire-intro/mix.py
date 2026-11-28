"""Alaron Noire intro v2 sound: Maren's recorded lines (unchanged), a very low invented underscore (music/warm.mp3 for Act 1,
music/dark.mp3 from the fire on), ducked under her voice, and only a few effects, each starting on its cut (board `sfx`).
Mixed in numpy (ffmpeg only decodes and encodes): ffmpeg 6.1's amix dropped the leading silence of delayed inputs and
shifted the whole mix 33.6 s early, so placement is done here, sample-exact.
Run from painted/noire-intro/ after timeline.py and painted/make/95n.py:
  python mix.py -> ../../../public/chronicle/levels/95-noire-intro.mp3 (with music), out/audio_music.wav, out/audio_nomusic.wav"""
import json, subprocess, os, numpy as np
SR = 48000
TL = json.load(open('timeline.json')); END = TL['end']; SE = TL['shots_end']; N = int(round(END * SR))
B = json.load(open('../95-noire-intro.json'))
# effect: (file, level under the voice in dB, file offset s, length s, fade in, fade out)
SFX = {'crackle': ('a04', -14, 3.0, 5.0, 1.5, 1.0), 'fire': ('a05', -6, 0.0, 12.0, 0.3, 4.0), 'rain': ('a06', -17, 0.0, 14.0, 2.5, 3.0),
       'stamp': ('a07', -8, 3.6, 2.4, 0.02, 0.8), 'hum': ('a10', -17, 5.0, 5.0, 1.5, 2.0), 'gulls': ('a11', -18, 0.0, 10.0, 2.0, 3.0),
       'bell': ('a12', -13, 0.8, 8.0, 0.05, 3.0)}
LAST_RAIN = ('a14', -17)  # the attic rain carries through the title and fades with it
MUSIC = [  # (file, file offset, start, end, level under the voice dB, fade in, fade out)
    ('music/warm.mp3', 0.0, 0.0, 36.0, -18, 3.0, 5.0),
    ('music/dark.mp3', 0.0, 31.0, SE + 0.05, -17, 6.0, 1.2),
]
VO_REF = -21.0  # dBFS RMS of a typical line; levels above are relative to it

def load(p):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', p, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
rms_db = lambda a: 20 * np.log10(np.sqrt(np.mean(a.astype(np.float64) ** 2)) + 1e-12)
def fades(a, fi, fo, exp=False):
    n = len(a); i = min(n, int(fi * SR)); o = min(n, int(fo * SR))
    if i: a[:i] *= np.linspace(0, 1, i, dtype=np.float32)[:, None]
    if o:
        r = np.linspace(1, 0, o, dtype=np.float32); a[n - o:] *= (r ** 2 if exp else r)[:, None]
    return a
def place(bus, a, t):
    s = int(round(t * SR)); e = min(N, s + len(a))
    if e > s: bus[s:e] += a[:e - s]

voice = np.zeros((N, 2), np.float32)
for cid, (st, en) in TL['clips'].items(): place(voice, load(f'voice/{cid}.ogg'), st)
fx = np.zeros((N, 2), np.float32)
for i, s in enumerate(B['shots']):
    if not s.get('sfx'): continue
    if s['sfx'] == 'rain' and i >= len(B['shots']) - 2:
        f, lvl = LAST_RAIN; off, d, fi, fo = 0.0, END - s['t'], 2.5, 2.5
    else:
        f, lvl, off, d, fi, fo = SFX[s['sfx']]
    src = load(f'sfx/{f}.mp3'); g = np.float32(10 ** ((VO_REF + lvl - rms_db(src)) / 20))
    a = src[int(off * SR):].copy()
    while len(a) < d * SR:  # longer than the file: crossfaded repeats
        x = int(1.5 * SR); b = src.copy(); a[-x:] *= np.linspace(1, 0, x, dtype=np.float32)[:, None]; b[:x] *= np.linspace(0, 1, x, dtype=np.float32)[:, None]
        a = np.concatenate([a[:-x], a[-x:] + b[:x], b[x:]])
    place(fx, fades(a[:int(d * SR)].copy(), fi, fo, exp=True) * g, s['t'])
music = np.zeros((N, 2), np.float32)
for p, off, a0, b0, lvl, fi, fo in MUSIC:
    src = load(p); g = np.float32(10 ** ((VO_REF + lvl - rms_db(src)) / 20))
    place(music, fades(src[int(off * SR):int((off + b0 - a0) * SR)].copy(), fi, fo) * g, a0)
# the music ducks slowly under the voice (about 6 dB while she speaks; 0.3 s down, 2 s back up), in 10 ms steps
step = 480; nb = N // step + 1
lv = np.array([np.sqrt(np.mean(voice[k * step:(k + 1) * step, 0] ** 2)) if k * step < N else 0 for k in range(nb)])
lv = np.convolve(lv, np.ones(10) / 10, 'same'); target = np.where(lv > 10 ** (-40 / 20), 10 ** (-6 / 20), 1.0)
g = 1.0; gk = np.empty(nb); a_dn = 1 - np.exp(-0.01 / 0.3); a_up = 1 - np.exp(-0.01 / 2.0)
for k in range(nb): g += (target[k] - g) * (a_dn if target[k] < g else a_up); gk[k] = g
music *= np.interp(np.arange(N), np.arange(nb) * step, gk).astype(np.float32)[:, None]
rng = np.random.default_rng(3); room = np.cumsum(rng.normal(0, 1, (N, 2)), axis=0)
room -= np.array([np.convolve(room[:, c], np.ones(4800) / 4800, 'same') for c in (0, 1)]).T  # brown noise, no drift
room = fades((room / np.abs(room).max() * 0.004).astype(np.float32), 2, 2)

def save(y, out):
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s16le', out], input=y.astype(np.float32).tobytes(), check=True)
def limit(y, lim=0.84):  # smooth gain riding over the rare peaks (instant down, 80 ms back up)
    need = np.minimum(1.0, lim / np.maximum(np.abs(y).max(axis=1), 1e-9))
    need = np.minimum(need, np.minimum.accumulate(need[::-1])[::-1] * 0 + need)  # (keep as is; the ride below smooths it)
    gch = need.copy(); rel = 1 / (0.08 * SR)
    for i in range(1, len(gch)): gch[i] = min(need[i], gch[i - 1] + rel)
    return (y * gch[:, None]).astype(np.float32)
def write(mix, out, gain_db=None):
    if gain_db is None:
        save(mix, 'out/tmp.wav')
        m = subprocess.run(['ffmpeg', '-hide_banner', '-i', 'out/tmp.wav', '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
        gain_db = -16.0 - float(m.rsplit('I:', 1)[1].split('LUFS')[0]); os.remove('out/tmp.wav')
    y = mix * np.float32(10 ** (gain_db / 20))
    if np.abs(y).max() > 0.84: y = limit(y)
    save(y, out); return gain_db
os.makedirs('out', exist_ok=True)
G = write(voice + fx + music + room, 'out/audio_music.wav')
write(voice + fx + room, 'out/audio_nomusic.wav', G)  # same gain: the voice sits at the same level in both
for name, a in (('voice', voice), ('fx', fx), ('music', music)): save(a, f'out/{name}.wav')
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', 'out/audio_music.wav', '-b:a', '192k', '../../../public/chronicle/levels/95-noire-intro.mp3'], check=True)
print(f'gain {G:+.1f} dB, length {N / SR:.2f} s')
