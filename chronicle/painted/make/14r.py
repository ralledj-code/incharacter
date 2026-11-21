"""Realistic test version of level 14 (hidden: ?song=hunt-valerys-real). Run from chronicle/: python painted/make/14r.py
Same shots, timing and story as painted/14-hunt-valerys.json (from make/14.py), restyled as a photographic fantasy film:
a new style line, realistic cast descriptions, 'painted' wording taken out of the scene text. Paint with Pro at 2K:
node scripts/paint.mjs 14-hunt-valerys-real cast|shots ... --model gemini-3-pro-image --size 2K"""
import json
P=json.load(open('painted/14-hunt-valerys.json'))
STYLE=("Photorealistic cinematic film still from a big-budget dark fantasy film, the look of a high-end fantasy series shot on an ARRI Alexa with anamorphic lenses: "
 "real actors, real caves and practical sets, real costumes with wear, dirt and texture, natural skin with pores and imperfections, physically accurate light from torches, fire, glowing fungus and crystals, "
 "deep shadows, atmospheric haze and dust in the light, subtle film grain, shallow depth of field, rich cinematic colour grading. "
 "Creatures look like real living animals with real anatomy, wet and heavy and lit like everything else: never CGI-looking, never rubber, never toys, statues or miniatures. "
 "Grounded faces with real emotion. Full-bleed 16:9 frame edge to edge: no letterbox bars, no text, no letters, no logos, no borders, no frame, no watermark.")
CAST={
 'lucien':"Lucien Vale, a real man of about 28, a half-elf wild magic sorcerer who sings and plays the flute, charming and haunted: long straight blond hair, long pointed elf ears, a handsome clean-shaven face with fine elven features and a slim straight nose, lively expressive blue-grey eyes with tired shadows, a burgundy velvet long coat with brass buttons over a dark shirt, worn and stained from the road, a leather belt with a dagger whose blade glows faintly blue, faint purple sparks at his fingertips when he casts, a wooden flute at his belt, slim build",
 'arthas':"Arthas, a tall devout human paladin, his face never seen: full dark steel plate armour, battered and scratched, a dark cloth hood always worn up over a closed steel great helm, two narrow eye slits glowing burning orange, broad shoulders, a heavy bronze-hilted longsword whose blade burns orange, a faded holy sun emblem on his breastplate",
 'cedric':"Cedric 'Cold-Eye', a real man of about 30, a human monk: shaved head, short dark beard, hard pale grey eyes, weathered skin with small scars, red and brown leather wraps over a green tunic, one bronze dragon-shaped shoulder pauldron, prayer beads, a long wooden staff, wiry and strong",
 'valerys':"Oathbreaker Valerys, the fallen High Inquisitor, a real man in his sixties: close-cropped grey hair, short grey beard, hard pale grey eyes, his white and crimson inquisitor robes and gold sun emblem blackened and torn, dark corrupted plate beneath it in pieces, badly wounded and bloodied, a glowing golden longsword in his hand",
 'serpent':"the wurm: a colossal pale worm-like creature rising from the earth, ridged grey-white hide like wet leather and stone, a huge round mouth ringed with rows of teeth, dirt and rocks falling from it, real weight and scale. Photographed like a real animal: wet slimy segmented hide with scars, mud and roots stuck to it, translucent flesh at the mouth, dripping, enormous and heavy, nothing cartoonish, not clay, not CGI",
 'wittan':"Wittan, a deep gnome (svirfneblin), a real small person about one metre tall: grey stone-coloured skin, bald, a big nose and large ears, dark eyes, practical worn grey leathers, a pick and a small lantern",
 'drow':"Nerrissa, a drow woman (dark elf), 25: exactly the woman in her reference photographs (same face, high sharp cheekbones, narrow nose, almond violet eyes, faint scar through her left eyebrow, full lips usually closed in a knowing half-smile, long pointed ears, long straight centre-parted silver hair), naturally dark purple-grey skin with real texture, no makeup look; athletic and graceful, a full bust; worn dark leather hunter armour with silver trim and a high collar, two curved silver blades; a monster hunter",
 'baphomet':"Baphomet, a vast goat-headed demon chained deep underground: long curved black horns, matted dark fur, cracked skin glowing like embers from within, burning yellow eyes, colossal and ancient, lit like a real creature",
 'flower':"the memory-eater, a real living monster about the size of a bear: a squat beast whose head is one huge round mouth ringed with rows of white fangs and a corona of fleshy yellow-orange petal-like tendrils, a flower of teeth; a back covered in long grey spines, four gnarled bark-brown arms each holding a living flame in its claw, a thick scaly grey lower body. Photographed like a real animal in a natural-history film: wet glistening organic flesh, translucent petal tendrils with veins, yellowed real teeth, mud and moss on the spines, heavy and dangerous, nothing cute, not a toy, not a sculpture, not CGI",
 'reaper':"the well-keepers, real gaunt creatures taller than a man: emaciated grey bodies with visible ribs wrapped in tattered black and deep-blue rags, a crown of jagged black spines on the head, one pale silver eye in the middle of the face, long thin arms ending in curved silver sickle-blades"}
rep=[("painted as a real place at full scale (not a tabletop, not miniatures), ","a real place at full scale, "),
 ("painted like a faded warm memory, soft golden haze, muted colours, ","a flashback, like a faded warm memory on old film, soft golden haze, muted colours, "),
 ("Nerrissa (the drow woman: dark purple-grey skin, long white hair) ","Nerrissa (the drow woman: dark purple-grey skin, long silver hair) "),
 ("heroic shot:","heroic wide shot:")]
EXTRA={'s06':', no creatures and no animals of any kind, an empty quiet camp'}  # Pro invented a beast here
shots=[]
for s in P['shots']:
    s=dict(s)
    if 'scene' in s:
        for a,b in rep: s['scene']=s['scene'].replace(a,b)
        assert 'painted' not in s['scene'], s['id']
        s['scene']+=EXTRA.get(s['id'],'')
    shots.append(s)
# Gemini Omni 1.2 Flash image-to-video test clips (2026-11-21): public/chronicle/levels/14-hunt-valerys-real/<id>.mp4; the
# clip carries the motion, so the camera barely drifts on these shots
# verse clips (method A, 2026-11-21): painted/make/14clips.py groups the shots into clips of <= 15 s with timed beats,
# scripts/omni-verses.mjs makes them (reference_to_video). Every verse whose clip exists collapses into its first shot
# (clip: true, plays <id>.mp4); a verse without a clip keeps its stills.
import os
CL=json.load(open('painted/14-hunt-valerys-real/clips.json'))
have=[g for g in CL if os.path.exists(f"../public/chronicle/levels/14-hunt-valerys-real/{g['id']}.mp4")]
covered={x for g in have for x in g['shots'][1:]}
first={g['id'] for g in have}
shots=[s for s in shots if s['id'] not in covered]
for s in shots:
    if s['id'] in first: s['clip']=True; s['move']={'from':[0,0,0.0],'to':[0,0,0.01]}
print(len(have),'of',len(CL),'verses have clips')
board={"id":"hunt-valerys-real","live":True,"cover":P['cover'],"style":STYLE,"cast":CAST,"shots":shots}
head_={k:v for k,v in board.items() if k!='shots'}
out=json.dumps(head_,ensure_ascii=False,indent=2)[:-2]+',\n  "shots": [\n'+',\n'.join('    '+json.dumps(s,ensure_ascii=False) for s in shots)+'\n  ]\n}\n'
json.loads(out);open('painted/14-hunt-valerys-real.json','w').write(out)
print(len(shots),'shots',sum(1 for s in shots if 'img' not in s),'new')
