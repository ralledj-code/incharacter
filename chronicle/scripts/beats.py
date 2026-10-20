# Beat grid + strong hits from a song, for camera cuts/kicks and light pulses.
# usage: python beats.py <audio> [out.json]   (same venv as transcribe.py: needs faster-whisper for decoding, numpy)
# Output: { bpm, beats: [s...], bars: [s...] (every 4th beat, phase picked by onset strength), hits: [s...] (strongest onsets) }
import sys, json
import numpy as np
from faster_whisper.audio import decode_audio

SR, HOP, NFFT = 16000, 256, 1024
a = decode_audio(sys.argv[1], sampling_rate=SR)
dur = len(a) / SR
# spectral flux onset strength (log magnitude, positive differences), low band weighted for kicks
win = np.hanning(NFFT)
frames = np.lib.stride_tricks.sliding_window_view(a, NFFT)[::HOP] * win
mag = np.log1p(np.abs(np.fft.rfft(frames, axis=1)) * 10)
flux = np.maximum(0, np.diff(mag, axis=0))
low = flux[:, :int(150 / (SR / NFFT))].sum(1)
onset = flux.sum(1) + 2.0 * low
onset = (onset - np.convolve(onset, np.ones(64) / 64, 'same')).clip(0)
fps = SR / HOP

# tempo: autocorrelation peak in 70-180 BPM
ac = np.correlate(onset, onset, 'full')[len(onset) - 1:]
lags = np.arange(len(ac)); bpm_of = 60 * fps / np.maximum(lags, 1)
ok = (bpm_of >= 70) & (bpm_of <= 180)
w = ac * ok * np.exp(-0.5 * (np.log2(bpm_of / 120) / 1.0) ** 2)
lag = int(np.argmax(w)); period = lag  # frames per beat
# refine period with parabolic interpolation
if 1 < lag < len(ac) - 1:
    y0, y1, y2 = ac[lag - 1], ac[lag], ac[lag + 1]; den = y0 - 2 * y1 + y2
    if den < 0: period = lag + float(np.clip(0.5 * (y0 - y2) / den, -0.5, 0.5))
bpm = 60 * fps / period

# dynamic-programming beat tracker (Ellis 2007)
N = len(onset); score = onset.copy(); back = np.full(N, -1)
tight = 100.0
for i in range(N):
    lo, hi = int(i - 2 * period), int(i - period / 2)
    if hi <= 0: continue
    lo = max(lo, 0)
    if hi <= lo: continue
    prev = np.arange(lo, hi)
    pen = -tight * np.log((i - prev) / period) ** 2
    j = int(np.argmax(score[prev] + pen)); score[i] += score[prev][j] + pen[j]; back[i] = prev[j]
i = int(np.argmax(score[-int(2 * period):])) + N - int(2 * period)
beats = []
while i >= 0: beats.append(i); i = back[i]
beats = np.array(beats[::-1]) / fps
beats = beats[onset[(beats * fps).astype(int)] >= 0]  # keep all; onset can be 0 in breaks

# bars: choose the phase (0-3) whose beats carry the most onset energy
strength = np.array([onset[int(b * fps)] for b in beats])
phase = int(np.argmax([strength[k::4].sum() for k in range(4)]))
bars = beats[phase::4]
# hits: local maxima of onset in the top 0.5% (min 0.4 s apart)
thr = np.quantile(onset, 0.995); hits = []
for k in np.argsort(-onset):
    if onset[k] < thr: break
    t = k / fps
    if all(abs(t - h) > 0.4 for h in hits): hits.append(t)
hits = sorted(hits)
out = {"bpm": round(float(bpm), 2), "duration": round(dur, 2), "beats": [round(float(b), 3) for b in beats],
       "bars": [round(float(b), 3) for b in bars], "hits": [round(float(h), 2) for h in hits]}
print(f"bpm {out['bpm']}  beats {len(out['beats'])}  bars {len(out['bars'])}  hits {len(out['hits'])}  first beats {out['beats'][:6]}")
if len(sys.argv) > 2: json.dump(out, open(sys.argv[2], 'w'))
