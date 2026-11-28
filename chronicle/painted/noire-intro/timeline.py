"""Timeline of the Alaron Noire intro: the script's shot lengths (shots.json), Maren's line under each shot (1.0 s in; 2.2 s
for the first, which rises out of black; 1.6 s for the stamp shot), subtitle phrases from voice/align. -> timeline.json, lines.json"""
import json, subprocess
SJ = json.load(open('shots.json'))['shots']; SH = [s for s in SJ if not s.get('ref_only')]
SUB = json.load(open('subs.json'))
VO_AT = {'intro_01': 2.2, 'intro_07': 1.6}
TITLE = 7.8  # 0.6 black + 1.0 in + 4.6 hold + 1.6 fade
dur = lambda f: float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], capture_output=True, text=True).stdout)
t, shots, clips, lines = 0.0, [], {}, []
for s in SH:
    shots.append({'id': s['id'][:3], 'beat': s['id'], 't': round(t, 2), 'dur': s['dur'], 'vo': s['vo']})
    st = t + VO_AT.get(s['vo'], 1.0); d = dur(f"voice/{s['vo']}.ogg"); clips[s['vo']] = [round(st, 3), round(st + d, 3)]
    raw = open(f"align/{s['vo']}.out.json").read(); ts = json.loads(raw[raw.index('{'):raw.rindex('}') + 1])['t']
    ts = [max(0.0, min(float(x), d - 0.4)) for x in ts]; ts[0] = 0.0
    for k in range(1, len(ts)): ts[k] = max(ts[k], ts[k - 1] + 0.8)
    for x, txt in zip(ts, SUB[s['vo']]): lines.append({'clip': s['vo'], 't': round(st + x, 2), 'text': txt})
    t += s['dur']
for i, l in enumerate(lines):  # each subtitle stays until the next starts or its line ends (+0.6 s)
    en = clips[l['clip']][1] + 0.6; nx = lines[i + 1]['t'] if i + 1 < len(lines) and lines[i + 1]['clip'] == l['clip'] else en
    l['end'] = round(min(en, nx), 2)
json.dump({'shots': shots, 'clips': clips, 'shots_end': round(t, 2), 'end': round(t + TITLE, 2)}, open('timeline.json', 'w'), indent=1)
json.dump(lines, open('lines.json', 'w'), indent=1, ensure_ascii=False)
print('shots end', t, 'end', t + TITLE, 'lines', len(lines))
for l in lines: print(f"{l['t']:6.1f}-{l['end']:6.1f} {l['text']}")
