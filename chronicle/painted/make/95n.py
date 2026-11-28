"""Storyboard for the Alaron Noire intro ("Calm Night"), made the Chronicle way (Rasmus 2026-11-28: v1 had too few pictures,
too slow, too many effects, no subtitles). Run from chronicle/: python painted/make/95n.py
Material: painted/noire-intro/ (INTRO_SCRIPT.md is the authority, shots.json = the script's shot lengths, voice/ = Maren's
recorded lines, timeline.json + lines.json from timeline.py). The kit's storyboard frames are the anchors (copied into
raw/ under their shot id, never repainted); the rest are new paintings of the script's own beats, in the game's style.
Times hang off the shot starts (B) and the subtitle phrases (LC). HERO = gemini-3-pro-image 2K, the rest Flash 3.1.
Rules (script): never the three strangers (elf / giant in plate / monk); no children; nothing gory, the fire from outside,
no bodies; no text in the pictures; nothing modern; Aldraik only as a painted portrait."""
import json, shutil, os
D = 'painted/noire-intro/'
LINES = json.load(open(D + 'lines.json')); TL = json.load(open(D + 'timeline.json'))
LC = lambda cid, k, dt=0: round([l['t'] for l in LINES if l['clip'] == cid][k] + dt, 2)
B = lambda sid, dt=0: round(next(s['t'] for s in TL['shots'] if s['id'] == sid) + dt, 2)
V = lambda n, k, dt=0: LC(f'intro_{n:02d}', k, dt)
ART = 'painted/95-noire-intro'
STYLE = ("chronstyle, stylized heroic fantasy painting, hand-painted 2D animated fantasy cinematic, painterly digital brush strokes, bold "
         "simplified shapes, strong warm rim light, deep cool teal shadows, atmospheric haze, film noir mood, cinematic widescreen; "
         "the harbour city of Caer Callidyr, late-medieval fantasy, candles, oil lanterns, fog, rain, wet cobbles, warm candle and fire light "
         "against cold blue-grey. Nothing modern at all (no electric light, no wires, no phones, no machines). No text, letters, numbers, "
         "logos, signs with writing or watermark anywhere. No children. Every person is an adult.")
NP = ', no people'; ONLY = ', exactly these people and no one else'
CAST = {
 'aurel': "Aurel, a warm man in his thirties, curly warm-brown hair and a short beard, laughing eyes, always about to laugh, a cream linen shirt",
 'young_maren': "Maren at about thirty, a fire-warden: the same face as her reference, dark brown hair tied back, a dark heavy canvas warden's coat, sometimes a soot-streaked leather helmet, a fire axe",
 'maren': "Maren now, in her forties: shoulder-length dark brown hair, a brown leather coat with a teal lining and a high collar, a tired but sharp face",
 'mentor': "an old fire-warden in his sixties, grizzled grey hair and stubble, a heavy dark warden's coat, thick leather gloves",
 'magistrate': "the magistrate, a thin grey-haired man in his sixties with spectacles and a black robe, bored and dry",
 'owner': "the warehouse owner, a prosperous, well-fed man in his forties, dark beard, rich dark-red velvet coat, a wine glass",
 'cross': "Director Cross, a stern woman in her fifties, long silver hair, a black high-collared coat",
 'brann': "Brann, a bald old watchman in his sixties with a big grey moustache, a dark greatcoat and a clay pipe",
 'pell': "Pell, a young clerk of about twenty-three, tousled brown hair, round spectacles, a burgundy waistcoat, ink on his fingers",
 'aldraik': "Aldraik, the Ahm merchant king: a bald, broad, laughing man with a huge moustache, fur and gold chains - only ever as a painted portrait in a gilded frame",
 'maren_room': "Maren's attic room (the game's painting of it): its layout, desk, window and furniture",
 'quiet_office': "the Quiet Office (the game's painting of it): its layout and furniture",
}
A = lambda f: {'src': f}  # an anchor: the kit's storyboard frame for this shot, used as it is
S_ = [
# ---------- Act 1: before (0-30) ----------
('n01', 0, 'black', ['aurel'], ['dust'], None, A('s01_portrait_sitting.png'), ''),
('n02', V(1, 0, 2.8), 'cut', ['aurel'], ['dust'], "a small sunny room above a shop on a summer evening, close-up: Aurel on a stool pulling a funny face at the painter, cheeks puffed, fidgeting" + ONLY, {}, ''),
('n04', B('s02', -0.6), 'fade', ['young_maren'], ['dust'], "HERO: INDOORS, inside a small sunny room above a shop on a warm summer evening (no rain, no night, no street): young Maren leaning in the open inner door frame of the room in her warden's coat, the leather helmet under her arm, laughing warmly and fondly at someone off-frame, golden sunset light through the window, an easel at the edge of the frame" + ONLY, {}, ''),
('n06', V(2, 1, 1.0), 'cut', ['aurel'], ['dust'], "HERO: INDOORS in the same small sunny painter's room on a summer evening (no rain, no night, no street): close-up of Aurel on his stool turning toward the door, breaking into a big warm laugh, golden window light on his face, an easel and canvas behind him" + ONLY, {}, ''),
('n07', B('s03'), 'fade', ['young_maren'], ['ash'], None, A('s03_reading_fire_b.png'), ''),
('n08', V(3, 1), 'cut', ['mentor'], ['ash'], "daylight in the black ruin of a burned house: close-up of an old fire-warden's thick gloved finger tracing the alligator char pattern on a blackened beam, shafts of grey light, drifting ash" + NP, {}, ''),
('n09', V(3, 2), 'cut', ['young_maren', 'mentor'], ['ash'], "in the burned ruin by daylight: young Maren in her soot-streaked leather helmet kneels beside the grizzled old fire-warden, studying the charred beam he points at, intent, grey light shafts" + ONLY, {}, ''),
# ---------- Act 2: the fire (30-64) ----------
('n10', B('s04'), 'slow', [], ['fog'], None, A('s04_calm_water.png'), ''),
('n11', V(4, 0, 2.6), 'cut', [], [], "night, perfectly still black harbour water like a mirror, close: the orange reflection of a fire spreading across it, no wind, a moored rowing boat's bow" + NP, {}, 'crackle'),
('n12', B('s05'), 'flash', [], ['embers', 'smoke'], "HERO: a dry, clear, windless night (no rain): a huge three-storey timber warehouse on a wooden wharf completely engulfed in towering roaring flames from end to end, a thick column of black smoke rising perfectly straight up, sparks climbing straight up, the inferno mirrored in the dead-calm black harbour water in the foreground, seen from across the water" + NP, {'shake': 0.3}, 'fire'),
('n13', V(5, 1), 'cut', ['young_maren'], ['embers'], "night, fire-wardens in heavy coats and leather helmets running along a wooden wharf toward a burning warehouse with axes and buckets, young Maren in front, firelight, seen from behind, all adults" + ', no faces in close-up', {}, ''),
('n14', V(5, 2), 'cut', [], ['embers', 'smoke'], "night, the burning timber warehouse seen from across the still harbour: three separate fires burning at three different corners of the building at once, the smoke going straight up" + NP, {}, ''),
('n15', V(5, 2, 2.2), 'cut', ['young_maren'], ['embers'], None, A('s05_edit.png'), ''),
('n16', B('s06'), 'slow', ['young_maren'], ['rain', 'fog'], None, A('s06_grey_morning.png'), 'rain'),
('n17', V(6, 1), 'cut', [], ['rain', 'smoke'], "grey dawn in the rain: the black skeleton of the burned warehouse on the wharf, charred beams still smoking, puddles, no bodies, empty" + NP, {'grade': 'cold'}, ''),
('n18', V(6, 2, 1.5), 'slow', ['young_maren'], ['rain'], "HERO: grey dawn, rain beginning: young Maren, soot-black, sits alone on the wet edge of the wharf with her back to us, staring at the smoking ruin, someone's heavy coat round her shoulders, her helmet beside her on the planks" + ONLY, {'grade': 'cold'}, ''),
# ---------- Act 3: the paper (64-88) ----------
('n19', B('s07'), 'slow', [], ['dust'], None, A('s07_stamp.png'), 'stamp'),  # the stamp comes down; the ledger beat is in the narration
('n21', V(7, 1), 'cut', ['magistrate'], ['dust'], "the magistrate at his desk in a dim office, bored, dropping a thin closed file onto a tall stack of other files without looking" + ONLY, {}, ''),
('n22', B('s08'), 'fade', [], ['fog'], "HERO: dusk, a dark carriage with two lanterns climbing a winding hill road toward a white villa among tall cypress trees, every villa window blazing with warm light" + NP, {}, ''),
('n24', V(8, 2), 'cut', ['young_maren'], ['fog'], "HERO: night outside the villa's iron gate: young Maren in a plain dark wool coat stands alone in the dark road, seen from behind, watching the bright windows and the dancing silhouettes of a party inside" + ONLY, {'grade': 'cold'}, ''),
('n25', V(8, 2, 3.4), 'cut', ['owner'], [], "inside the bright villa party: the well-fed owner in his red velvet coat throws back his head and laughs, glass raised, candles and gilt around him, other adult guests blurred" + ', the owner in focus', {}, ''),
# ---------- Act 4: the Office (88-118) ----------
('n26', B('s09'), 'slow', [], ['rain'], "night, a narrow rainy street of old stone houses, wet cobbles shining, one plain wooden door with no sign and no writing, a single oil lantern above it" + NP, {'grade': 'cold'}, 'rain'),
('n27', V(9, 0, 2.6), 'cut', ['cross'], [], None, A('s09_cross_lantern_b.png'), ''),
('n28', V(9, 2), 'cut', ['maren', 'cross', 'quiet_office'], [], "inside the Quiet Office by lamplight: over Maren's shoulder (now in her forties, brown leather coat) toward Director Cross behind her desk, studying her coolly, rain on the window behind" + ONLY, {}, ''),
('n30', V(9, 3, 1.2), 'cut', ['cross', 'maren'], [], "HERO: close on the desk: Director Cross's hand sliding a small brass lantern across the wood toward Maren's gloved hand, lamplight" + ', only their hands and sleeves', {}, ''),
('n31', B('s10'), 'fade', ['maren'], ['fog'], None, A('s10_lantern_shimmer.png'), ''),
('n33', V(10, 2), 'cut', [], ['fog'], "HERO: lantern light falling on an old wooden doorframe in a dark corridor, and on the wood a faint pale silvery shimmer clinging where no shimmer should be, like frost made of light" + NP, {}, 'hum'),
('n34', V(10, 2, 3.2), 'cut', ['maren'], [], "close-up of Maren's eyes narrowing in the lantern light, sharp and tired" + ONLY, {}, ''),
# ---------- Act 5: the city now (118-142) ----------
('n35', B('s11'), 'slow', [], ['fog'], "HERO: Caer Callidyr at dawn from above the harbour: fog over the water, ship masts, slate roofs, long plain crimson banners (no symbols, no letters) unfurling from the warehouse roofs, a great white domed temple on the hill catching the first sun" + NP, {}, 'gulls'),
('n37', V(11, 1), 'cut', [], [], "close: tired dock workers' rough hands dropping coins into an open crimson-gloved palm, wet cobbles, dawn light, all adults" + ', only hands and arms', {}, ''),
('n38', V(11, 2), 'cut', ['aldraik'], [], "HERO: a huge gilded painted portrait of Aldraik laughing, hanging in a marble hall - it is a framed painting on the wall, not a living man, candlelight on the gilt frame, an empty marble floor" + NP, {}, ''),
('n39', V(11, 3, 0.6), 'cut', ['aldraik'], [], "close on the painted portrait's laughing face and the gold of its frame, the brush strokes of the old painting visible, candlelight" + NP, {}, ''),
('n40', B('s12'), 'fade', [], ['fog'], None, A('s12_temple_elf.png'), 'bell'),
('n42', V(12, 2), 'cut', [], ['fog'], "close, from behind and to the side: an anonymous slender adult in a plain grey cloak pulls the hood lower as a guard's shadow passes, only the tip of one pointed ear showing at the hood's edge, face completely hidden" + ', one person, face hidden', {}, ''),
# ---------- (the copying room) ----------
('n43', B('s13'), 'slow', ['pell', 'brann'], ['dust'], None, A('s13_edit.png'), ''),
('n44', V(13, 1), 'cut', ['brann'], ['smoke'], "close-up: Brann leaning in a doorway, puffing his clay pipe, smoke curling, one eyebrow raised, utterly unimpressed, candlelight" + ONLY, {}, ''),
('n45', V(13, 2), 'cut', ['pell', 'maren'], ['dust'], "close on Pell's ink-stained fingers sketching on paper with a pencil: the sketch is a quick portrait drawing of Maren's face, candlelight" + ', only his hands and the drawing', {}, ''),
# ---------- Act 6: now (154-164) ----------
('n48', B('s14'), 'slow', ['maren', 'aurel', 'maren_room'], ['dust'], "HERO: the attic room before dawn (as in its reference): Maren asleep at her desk with her head on her arm over open ledgers, one candle guttering, grey light at the window, rain on the glass, the brass lantern on the desk, and on the cabinet beside her a small framed painted portrait of Aurel laughing" + ', Maren is the only living person', {}, 'rain'),
('n49', V(14, 0, 4.6), 'slow', ['aurel'], ['dust'], "close-up of the small framed painted portrait of Aurel laughing on the cabinet in candlelight, rain light from the window across it" + NP, {}, ''),
]
MOVES = [([0, 0, 0.04], [0, 0, 0.16]), ([-0.04, 0, 0.05], [0.04, 0, 0.12]), ([0, 0, 0.18], [0, 0, 0.05]), ([0.04, 0.02, 0.02], [-0.03, 0, 0.12]), ([0, 0.03, 0.02], [0, 0, 0.14]), ([0.03, 0, 0.08], [-0.03, 0, 0.15])]
shots = []
for k, (sid, t, tr, who, fx, scene, ex, sfx) in enumerate(S_):
    m = MOVES[k % len(MOVES)]; d = {'id': sid, 't': round(t, 2), 'in': tr, 'who': who, 'fx': fx}
    ex = dict(ex); src = ex.pop('src', None); d.update(ex); d['move'] = {'from': m[0], 'to': m[1]}
    if scene: d['scene'] = scene.replace('HERO: ', '')
    if scene and 'HERO' in scene: d['hero'] = True
    if src:
        d['anchor'] = src; dst = f'{ART}/raw/{sid}.png'
        if not os.path.exists(dst): shutil.copy(f'{ART}/raw/{src}', dst)
    if sfx: d['sfx'] = sfx
    shots.append(d)
ts = [s['t'] for s in shots]; assert all(a < b for a, b in zip(ts, ts[1:])), [(a['id'], a['t'], b['id'], b['t']) for a, b in zip(shots, shots[1:]) if a['t'] >= b['t']]
board = {"id": "noire-intro", "live": True, "secret": True, "cover": "n12", "endFade": 1.6, "style": STYLE, "cast": CAST, "shots": shots}
out = json.dumps({k: v for k, v in board.items() if k != 'shots'}, ensure_ascii=False, indent=2)[:-2] + ',\n  "shots": [\n' + ',\n'.join('    ' + json.dumps(s, ensure_ascii=False) for s in shots) + '\n  ]\n}\n'
json.loads(out); open('painted/95-noire-intro.json', 'w').write(out)
E = TL['shots_end']; dd = [(shots[i + 1]['t'] if i + 1 < len(shots) else E) - s['t'] for i, s in enumerate(shots)]
print(len(shots), 'shots,', sum(1 for s in shots if 'anchor' in s), 'anchors,', sum(1 for s in shots if 'anchor' not in s), 'to paint (', sum(1 for s in shots if s.get('hero')), 'hero); avg', round(sum(dd) / len(dd), 1), 's, min', round(min(dd), 1), 'max', round(max(dd), 1))
print(' '.join(f"{s['id']}:{x:.1f}" for s, x in zip(shots, dd)))
