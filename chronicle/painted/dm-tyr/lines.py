"""lines.json (subtitles with global times) from timeline.json + voice/align/<id>.out.json. Run from painted/dm-tyr after timeline.py and voice/align.sh."""
import json, re
TL = json.load(open('timeline.json')); S = {c['id']: c for c in json.load(open('voice/script.json'))['clips']}
out = []
for cid, (st, en) in TL['clips'].items():
    raw = open(f'voice/align/{cid}.out.json').read(); raw = raw[raw.index('{'):raw.rindex('}') + 1]
    ts = json.loads(raw)['t']; subs = S[cid]['sub']; assert len(ts) == len(subs), (cid, ts, subs)
    ts = [max(0.0, min(float(x), en - st - 0.3)) for x in ts]; ts[0] = 0.0
    for k in range(1, len(ts)): ts[k] = max(ts[k], ts[k - 1] + 0.8)  # monotone, at least 0.8 s per line
    out += [{'clip': cid, 'sp': S[cid]['sp'], 't': round(st + x, 2), 'text': s} for x, s in zip(ts, subs)]
json.dump(out, open('lines.json', 'w'), indent=1, ensure_ascii=False); print(len(out), 'lines')
