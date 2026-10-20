# usage: python transcribe.py <audio> <out.json> [model]
import sys, json
from faster_whisper import WhisperModel
audio, out = sys.argv[1], sys.argv[2]
model = sys.argv[3] if len(sys.argv) > 3 else "large-v3-turbo"
m = WhisperModel(model, device="cpu", compute_type="int8")
segs, info = m.transcribe(audio, language="en", word_timestamps=True, vad_filter=False, beam_size=5, condition_on_previous_text=False)
words = []
for s in segs:
    for w in (s.words or []):
        words.append({"w": w.word.strip(), "s": round(w.start, 2), "e": round(w.end, 2), "p": round(w.probability, 2)})
    print(f"{s.start:7.2f} {s.end:7.2f} {s.text}", flush=True)
json.dump(words, open(out, "w"), indent=0)
