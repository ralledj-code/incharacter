"""Turns a level's painted shots into what the parallax player loads.
  python scripts/layers.py <level> [ids...] [--model <depth.onnx>]
painted/<level>/raw/<id>.png|jpg -> ../public/chronicle/levels/<level>/<id>.webp (1600x900 colour)
                                 + <id>_d.png (640x360 depth, white = near; Depth Anything V2 small, ONNX).
Depth model: https://github.com/fabio-sim/Depth-Anything-ONNX/releases (depth_anything_v2_vits.onnx);
pass --model or set DEPTH_ONNX. Needs: pip install onnxruntime pillow numpy
"""
import os, sys, glob
import numpy as np
from PIL import Image, ImageFilter
import onnxruntime as ort

args = sys.argv[1:]
model = os.environ.get('DEPTH_ONNX')
if '--model' in args:
    i = args.index('--model'); model = args[i + 1]; del args[i:i + 2]
level, ids = args[0], set(args[1:])
if not model or not os.path.exists(model):
    sys.exit('depth model not found: pass --model <depth_anything_v2_vits.onnx> or set DEPTH_ONNX')
src = f'painted/{level}/raw'
out = f'../public/chronicle/levels/{level}'
os.makedirs(out, exist_ok=True)
sess = ort.InferenceSession(model, providers=['CPUExecutionProvider'])
inp = sess.get_inputs()[0]
N = inp.shape[2] if isinstance(inp.shape[2], int) else 518
MEAN, STD = np.array([0.485, 0.456, 0.406]), np.array([0.229, 0.224, 0.225])

def cover(im, w, h):
    # centre-crop to w:h, then resize
    r = w / h; W, H = im.size
    if W / H > r: nw = round(H * r); im = im.crop(((W - nw) // 2, 0, (W - nw) // 2 + nw, H))
    else: nh = round(W / r); im = im.crop((0, (H - nh) // 2, W, (H - nh) // 2 + nh))
    return im.resize((w, h), Image.LANCZOS)

files = sorted(glob.glob(f'{src}/*.png') + glob.glob(f'{src}/*.jpg'))
for f in files:
    sid = os.path.splitext(os.path.basename(f))[0]
    if ids and sid not in ids: continue
    im = cover(Image.open(f).convert('RGB'), 1600, 900)
    im.save(f'{out}/{sid}.webp', quality=80, method=6)
    x = np.asarray(im.resize((N, N), Image.BICUBIC), dtype=np.float32) / 255.0
    x = ((x - MEAN) / STD).transpose(2, 0, 1)[None].astype(np.float32)
    d = sess.run(None, {inp.name: x})[0][0]          # relative inverse depth: bigger = nearer
    lo, hi = np.percentile(d, 1), np.percentile(d, 99.5)
    d = np.clip((d - lo) / max(1e-6, hi - lo), 0, 1)
    dm = Image.fromarray((d * 255).astype(np.uint8)).resize((640, 360), Image.BICUBIC)
    dm = dm.filter(ImageFilter.GaussianBlur(1.2))    # soften the seams the mesh would tear on
    dm.save(f'{out}/{sid}_d.png', optimize=True)
    print(sid, '->', f'{out}/{sid}.webp', os.path.getsize(f'{out}/{sid}.webp') // 1024, 'KB')
