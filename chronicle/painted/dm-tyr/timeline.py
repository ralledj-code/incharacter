"""Timeline for "Tyr's price": lays the chosen voice clips (voice/best/<id>.wav) on a time axis with the pauses of the beat sheet,
writes voice.wav (dialogue only) and timeline.json { clips: {id: [start, end]}, end }. Run from painted/dm-tyr/: python timeline.py
Pauses are where the story breathes (plan.md); change them here and rerun, everything downstream (storyboard, SFX) follows."""
import json, subprocess, wave
SR = 48000
SEQ = [  # (clip id or None, seconds of silence BEFORE it)
    ('d1a', 31.0),   # I: the silence after the wurm (rumble, drips, breathing, Dolkan steps out, staff strike ~29.5)
    ('d1b', 1.2),    # "Look through my memory!" -> the memory opens
    ('d1c', 4.0),    # rain + thunder beat in the sanctum
    ('d1d', 1.4),
    ('d1e', 1.6),
    ('v1', 3.2),     # rain + child's heartbeat
    ('d2a', 3.4),    # echo of "let them live", thunder stops
    ('d2b', 1.0),
    ('t1', 2.6),     # the blades swell cut off, 2 s of silence, the statue
    ('v2', 1.6),
    ('t2a', 1.6),
    ('t2b', 1.4),
    ('d3a', 3.2),    # flare and silence after "consume you"
    ('d3b', 1.2),
    ('d3c', 1.4),
    ('d3d', 1.8),
    ('d3e', 2.2),    # sword ring on the altar
    ('v3', 2.4),     # golden light, choir rises
    ('d4a', 4.0),    # choir holds and stops, back in the cavern, drip
    ('d4b', 0.9),
]
TAIL = 5.5  # final crack, cut to black, tremor, one drip

def frames(path):
    with wave.open(path) as w: return w.getnframes() / w.getframerate()

if __name__ == '__main__':
    t, clips, parts = 0.0, {}, []
    for cid, pause in SEQ:
        t += pause; d = frames(f'voice/best/{cid}.wav')
        clips[cid] = [round(t, 3), round(t + d, 3)]; parts.append((cid, t)); t += d
    end = round(t + TAIL, 3)
    # mix: each clip delayed to its start (adelay), summed
    inputs, filt = [], []
    for k, (cid, st) in enumerate(parts):
        inputs += ['-i', f'voice/best/{cid}.wav']; ms = int(st * 1000)
        filt.append(f'[{k}:a]aresample={SR},aformat=channel_layouts=mono,adelay={ms}|{ms}[a{k}]')
    filt.append(''.join(f'[a{k}]' for k in range(len(parts))) + f'amix=inputs={len(parts)}:normalize=0,apad=whole_dur={end}[o]')
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', *inputs, '-filter_complex', ';'.join(filt), '-map', '[o]', '-ar', str(SR), '-ac', '1', 'voice.wav'], check=True)
    json.dump({'clips': clips, 'end': end}, open('timeline.json', 'w'), indent=1)
    print('end', end, {k: v for k, v in clips.items()})
