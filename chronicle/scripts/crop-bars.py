"""Crops black bars the image model sometimes paints into a shot (letterbox top/bottom).
  python scripts/crop-bars.py <level> [ids...]
painted/<level>/raw/<id>.png is cropped in place; the original goes to raw/orig/. Only rows that are near-black and
flat count, at most 100 px per edge (more is dark scenery, not a bar). Check uneven bars by eye: a half-bar with
painting bleeding into it is missed and needs a manual crop. Run before scripts/layers.py.
"""
import os, sys, glob
import numpy as np
from PIL import Image

level, ids = sys.argv[1], set(sys.argv[2:])
raw = f'painted/{level}/raw'
for f in sorted(glob.glob(f'{raw}/s*.png')):
    sid = os.path.basename(f)[:-4]
    if ids and sid not in ids: continue
    im = Image.open(f); a = np.asarray(im.convert('L'), dtype=np.float32); H, W = a.shape
    dark = lambda r: r.mean() < 14 and r.std() < 8
    t = 0
    while t < 100 and dark(a[t]): t += 1
    b = 0
    while b < 100 and dark(a[H - 1 - b]): b += 1
    t = t + 3 if 20 <= t < 100 else 0; b = b + 3 if 20 <= b < 100 else 0
    if t + b:
        os.makedirs(f'{raw}/orig', exist_ok=True)
        if not os.path.exists(f'{raw}/orig/{sid}.png'): im.save(f'{raw}/orig/{sid}.png')
        im.crop((0, t, W, H - b)).save(f); print(sid, 'top', t, 'bottom', b)
