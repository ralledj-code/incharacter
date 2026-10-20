# usage: python encode.py <framesDir> <fps> <out.mp4> [audio.mp3 t0]   (PyAV; same venv as transcribe.py)
import sys, os, av
from fractions import Fraction
d, fps, out = sys.argv[1], int(sys.argv[2]), sys.argv[3]
audio, t0 = (sys.argv[4], float(sys.argv[5])) if len(sys.argv) > 5 else (None, 0)
files = sorted(f for f in os.listdir(d) if f.endswith('.png'))
o = av.open(out, 'w')
vs = o.add_stream('libx264', rate=fps); vs.pix_fmt = 'yuv420p'; vs.options = {'crf': os.environ.get('CRF', '22'), 'preset': 'medium'}
first = av.open(os.path.join(d, files[0])); fr0 = next(first.decode(video=0)); vs.width, vs.height = fr0.width, fr0.height; first.close()
dur = len(files) / fps
if audio:
    ia = av.open(audio); ias = ia.streams.audio[0]
    as_ = o.add_stream('aac', rate=44100); as_.layout = 'stereo'
    ia.seek(int(t0 * 1e6))
    res = av.AudioResampler(format='fltp', layout='stereo', rate=44100); pts = 0
    for fr in ia.decode(ias):
        if fr.time is None or fr.time < t0 - 0.05: continue
        if fr.time > t0 + dur: break
        for r in res.resample(fr):
            r.pts = pts; pts += r.samples
            for p in as_.encode(r): o.mux(p)
for i, f in enumerate(files):
    c = av.open(os.path.join(d, f)); fr = next(c.decode(video=0)).reformat(format='yuv420p'); c.close()
    fr.pts = i; fr.time_base = Fraction(1, fps)
    for p in vs.encode(fr): o.mux(p)
for p in vs.encode(None): o.mux(p)
if audio:
    for p in as_.encode(None): o.mux(p)
o.close(); print('wrote', out, len(files), 'frames', f'{dur:.1f}s')
