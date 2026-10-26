"""Storyboard generator for Level 8, Baphomet's Chains (painted). Template for the next painted level: copy, rewrite the shot list S_/S.
Run from chronicle/: python painted/make/08.py  ->  painted/<NN-id>.json (overwrites it, so re-apply any hand edits made since).
Each row: (song time, transition, who [cast ids, always set when people are in the shot], fx, scene, extras).
scene=None + extras {'img': ...} reuses another shot's painting (repeated chorus). Hard cuts snap to hits, then bars, then beats.
NOTE: written before the hand fixes made afterwards (well -> lake, s03, s09, s47 in level 8; s11 in level 6), so the
committed JSON is the source of truth for those levels; this file is the pattern, not the record.
"""
import json
L1=json.load(open('painted/01-first-steps.json'))
import re
def load_beats(path):
    # the level's measured beat grid (scripts/beats.py): `const BEATS = {...};` or `L.beats = {...};`
    m = re.search(r'(?:const BEATS|L\.beats) = (\{.*?\});', open(path).read(), re.S)
    return json.loads(m.group(1))
B=load_beats('src/levels/L08-baphomet-shots.js')
near=lambda l,t: min(l,key=lambda x:abs(x-t))
def snap(t,kind):
    if kind not in ('cut','flash') or t==0: return t
    h,r,e=near(B['hits'],t),near(B['bars'],t),near(B['beats'],t)
    return h if abs(h-t)<=0.25 else r if abs(r-t)<=0.2 else e
L,A,C,N,BA,W,WR='lucien','arthas','cedric','neeris','baphomet','wyrm','wraith'
MOVES=[([0,0,0.04],[0,0,0.2]),([-0.04,0,0.05],[0.04,0,0.12]),([0,0,0.22],[0,0,0.05]),([0.05,0.02,0.02],[-0.04,0,0.12]),([0,0.04,0.02],[0,0,0.18]),([0.03,0,0.08],[-0.03,0,0.16])]
# (t, transition, who, fx, scene, extras)
S=[
(0,'black',[L],['embers','smoke'],"Close-up of Lucien Vale's hands tuning his lute beside a tavern fireplace, the rest of the room in darkness, a quiet moment before the story",{'flicker':0.5}),
(10.35,'fade',[L,A,C,N],['fog'],"The three half-brothers and Neeris the druid leaving a town at night along a lantern-lit lane, seen from behind, walking toward a dark forest",{'flicker':0.3}),
(21.6,'ink',[],['fog','fireflies'],"A narrow forest path under a full moon, four small figures walking in single file between huge dark trees, moonlight falling in shafts through the mist",{}),
(33.0,'fade',[],['fog'],"A moonwell in a forest clearing at night: a round stone well glowing cold blue, a ring of tall standing stones around it, six heavy iron chains running from the well's rim up to the stones, mist on the ground",{'grade':'cold'}),
(41.9,'cut',[A,L,C],['fog'],"Arthas the paladin kneeling at the rim of the glowing blue moonwell, one gauntlet off, a knife at his open palm, his two brothers watching behind him",{}),
(48.28,'cut',[],['dust'],"Extreme close-up: drops of blood falling from a hand into the glowing blue water of a moonwell, the blue turning red where they land",{}),
(54.16,'flash',[],['sparks','smoke'],"The iron chains of the moonwell bursting apart, links flying, red light erupting from the well, the standing stones cracking",{'shake':0.4,'grade':'red'}),
(56.5,'cut',[BA],['embers','smoke'],"Baphomet rising out of the red-glowing moonwell, a towering goat-headed demon, horns against the moon, broken chains hanging from his wrists",{'grade':'red'}),
(59.04,'cut',[BA],['smoke'],"Low-angle close-up of Baphomet's goat face, burning yellow eyes, speaking softly, smoke curling from his mouth",{}),
(65.64,'cut',[BA,L,A,C],['smoke','embers'],"Baphomet leaning down over the three small brothers, one clawed hand open as if thanking them, a sinister smile, red light on their upturned faces",{'grade':'red'}),
(70.0,'ink',[],['fog'],"The black treeline around the clearing, dozens of amber wolf eyes opening one by one in the dark forest",{'grade':'green'}),
(77.4,'cut',[N],['fog'],"Neeris the druid doubled over in the moonlit clearing, clutching his head, his fingers lengthening into claws, amber eyes glowing",{'flicker':0.3}),
(87.53,'cut',[N],['dust'],"Neeris half-turned into a wolf-beast, coarse fur bursting through his green cloak, snarling teeth and claws, amber eyes, a moonlit clearing, frightening not comical",{'shake':0.3,'grade':'green'}),
(90.47,'cut',[A,N],['dust'],"Arthas raising his bronze-hilted longsword high over the snarling wolf-cursed Neeris, aiming for the cursed hand, his eye slits burning",{}),
(93.32,'flash',[A],['sparks'],"Arthas's sword stopped in mid-air by a shimmering green ward of light, sparks bursting where the blade meets it",{'shake':0.4}),
(96.7,'cut',[L],['fog'],"Lucien Vale standing helpless in the clearing, empty hands, no sparks at his fingertips, his face full of fear and sorrow, the struggle a blur behind him",{}),
(102.56,'ink',[N,L],['dust'],"Neeris's clawed hand pulling Lucien Vale's glowing blue dagger from Lucien's belt",{}),
(106.9,'cut',[N],['sparks'],"Neeris driving the glowing blue dagger into his own chest, a burst of cold blue light, his wolf features breaking apart into mist",{'shake':0.3}),
(110.06,'cut',[],['fireflies'],"Close-up of the blue dagger glowing on the mossy forest floor, its blade wet, cold light around it",{}),
(113.28,'fade',[N,L,A,C],['fireflies','fog'],"Neeris lying human again on the moss, exhausted, a dark wolf-shaped shadow lifting out of him into the night air as the blue light fades, the three brothers standing over him",{}),
(117.9,'flash',[L,A,C],['embers'],"Epic wide shot: the three half-brothers walking side by side toward the viewer down a road at night under a purple and green aurora, Lucien in the middle",{}),
(121.9,'cut',[C],['embers'],"Heroic portrait of Cedric Cold-Eye the monk, staff planted, prayer beads, a calm devout face, warm light behind him",{}),
(125.22,'cut',[L],['sparks'],"Heroic portrait of Lucien Vale, wild purple chaos magic swirling around his raised hand, a clever half-smile with sorrow in his eyes",{}),
(128.66,'cut',[A],['embers'],"Heroic portrait of Arthas the paladin, sword held point-down before him in prayer, the faded sun emblem glowing faintly on his chest, eye slits burning",{}),
(131.94,'cut',[L,A,C],['embers','smoke'],"The three brothers back to back inside a ring of fire, a wolf's silhouette in the flames and broken chains on the ground around them",{'flicker':0.4}),
(135.28,'cut',[L,A,C],['embers','ash'],"The three brothers small on a long road leading through a burning red hellish landscape toward a distant pale dawn",{'grade':'red'}),
(142.2,'ink',[],['ash'],"A red glow spreading across night clouds over dark hills, the shape of something huge and winged moving inside the clouds",{'grade':'red'}),
(151.24,'cut',[W],['embers'],"The black wyrm bursting out of red clouds into a blood-red sky, wings spread wide, fire glowing in its throat",{'grade':'red'}),
(155.34,'flash',[L,A,C,W],['sparks'],"Lucien Vale hurling a bolt of purple chaos magic at the diving black wyrm, Arthas and Cedric beside him on scorched land",{'shake':0.4}),
(158.62,'cut',[W],['smoke','ash'],"The wounded black wyrm flying away low over scorched hills trailing smoke, an overturned cart of spilled gold coins glinting below",{}),
(162.06,'cut',[C,L,A],['ash'],"Cedric Cold-Eye breaking into a sprint after the fleeing wyrm without a word, his brothers left behind calling after him",{}),
(165.44,'fade',[L,A],['ash'],"Lucien and Arthas left standing alone on the scorched land, watching Cedric's small figure vanish into the smoke",{}),
(168.76,'cut',[C],['ash'],"Close-up of Cedric's face as he runs, jaw clenched in rage, cold grey eyes, soot and sweat, a short blade in his fist",{}),
(172.16,'ink',[C,W],['smoke'],"A huge smoking crater in the dark ringed by giant bone arches, the black wyrm coiled at the bottom with glowing eyes, a tiny figure with a staff at the rim",{'grade':'red'}),
(175.52,'cut',[C,W],['embers','smoke'],"Cedric alone facing the black wyrm in the crater, the beast's jaws opening over him, fire in its throat, bats circling",{'flicker':0.5,'shake':0.3}),
(180.1,'flash',[C,W],['sparks','embers'],"Cedric Cold-Eye leaping high onto the black wyrm's head and driving a blade down into its skull, a burst of white light and fire",{'shake':0.6}),
(184.0,'cut',[C,W],['embers'],"Cedric standing on the slain black wyrm's head in the crater, triumphant and exhausted, smoke rising, golden light breaking through",{}),
(190.6,'fade',[C,W],['dust'],"Cedric walking across the scorched land at sunrise carrying the black wyrm's huge horned head over his shoulder",{}),
(194.06,'cut',[],['embers'],"The walled harbour city of Cobh at dusk, people crowding the walls and the gate, cheering, raising torches and fists",{'flicker':0.3}),
(200.5,'ink',[A,L],['embers','fog'],"A small campfire in a dark forest clearing at night, Arthas walking away into the trees, Lucien left sitting by the fire",{'flicker':0.45}),
(204.04,'cut',[L,N],['embers'],"Lucien Vale sitting by the campfire across from Neeris the druid, whose hands are bound with rope, firelight between them",{'flicker':0.45}),
(207.2,'cut',[N],['embers'],"Close-up of Neeris by firelight, human again, bound hands, haunted amber eyes looking at the viewer, pleading",{'flicker':0.45}),
(217.3,'fade',[L,N],['fog'],"A crossroads at night under a pale sky, a signpost at the fork, one road glowing red and one road cold blue, Lucien and Neeris standing at the fork",{}),
(221.02,'cut',[L,N],[],"Lucien Vale's face at the crossroads, torn and weary, looking down at Neeris kneeling before him",{}),
(224.96,'cut',[A,C],['embers'],"Arthas and Cedric standing grim together in red light, hands on their weapons, demanding justice",{'grade':'red'}),
(228.1,'cut',[L,N],['fog'],"Lucien Vale cutting the rope from Neeris's wrists with the glowing blue dagger, Neeris looking up in disbelief",{}),
(232.52,'cut',[N,L],['fog'],"Neeris walking away down the cold blue road into the dark forest, looking back once, Lucien alone at the fork",{'grade':'cold'}),
(237.9,'flash',[],['fireflies'],None,{'img':'s21'}),
(241.82,'cut',[],['fireflies'],None,{'img':'s22'}),
(245.18,'cut',[],['fireflies'],None,{'img':'s23'}),
(248.66,'cut',[],['fireflies'],None,{'img':'s24'}),
(251.94,'cut',[],['fireflies','embers'],None,{'img':'s25'}),
(255.26,'cut',[],['fireflies'],None,{'img':'s26'}),
(271.3,'ink',[L,A,C,W],['dust','embers'],"The three brothers marching up a road toward the gates of Cobh at golden dusk, Cedric carrying the black wyrm's head on a pole, crowds lining the road cheering",{}),
(278.18,'cut',[],['sparks'],"Close-up of hands receiving heavy leather pouches of gold coins, coins spilling and glinting in torchlight",{'flicker':0.4}),
(283.48,'cut',[L],['embers'],"Lucien Vale singing and playing his lute as he walks through the city gate, the crowd cheering around him",{'flicker':0.3}),
(291.02,'cut',[],['embers','smoke'],"A wild feast in the streets of Cobh at night, a great bonfire, people dancing, mugs raised, banners and lanterns",{'flicker':0.45}),
(299.18,'cut',[],['smoke'],"Grey dawn over the city street after the feast, empty mugs, sleeping revellers, the bonfire burnt down to embers",{}),
(302.84,'cut',[L],[],"Lucien Vale waking up with smeared theatrical makeup on his face, confused and hungover, in a messy room",{}),
(306.34,'cut',[C],[],"Cedric Cold-Eye standing proudly in a grand suit stitched from black dragon scales and wolf fur",{}),
(309.88,'cut',[L],['dust'],"Lucien Vale waking up in a stone gaol cell, iron shackles on his wrists, cold morning light through the bars",{'grade':'cold'}),
(316.24,'fade',[WR],['embers','smoke'],"The city of Cobh burning at night beneath a colossal hooded wraith in the sky, its skeletal hands spread over the rooftops, cold blue light",{'grade':'cold'}),
(319.94,'cut',[],['ash','smoke'],"Hunched shadowy creatures crawling through the burning streets of Cobh, hunting, cold blue light from above",{'grade':'cold'}),
(323.6,'cut',[L,A,C,WR],['embers','ash'],"The three half-brothers standing shoulder to shoulder on a hill above the burning city, seen from behind, weapons ready, the wraith ahead in the sky",{}),
(326.8,'cut',[L,A,C],['embers'],"Close-up of the three brothers' faces side by side, lit by fire, determined",{'flicker':0.4}),
(333.5,'ink',[WR],['ash'],"The wraith turning its empty hood toward the viewer, cold blue light pouring from inside it",{'grade':'cold'}),
(343.0,'fade',[L,A,C],['embers','ash'],"The three brothers walking down from the hill into the burning city, small figures against the fire",{}),
(354.0,'fade',[L],['embers'],"Lucien's lute lying beside a dying fire, a few embers glowing in the dark",{'flicker':0.4}),
]
shots=[]; mv=0
for i,(t,tr,who,fx,scene,ex) in enumerate(S):
    sid='s%02d'%(i+1)
    m=MOVES[mv%len(MOVES)]; mv+=1
    if 'img' in ex:  # second chorus: same paintings, mirrored drift
        m=([ -m[0][0], m[0][1], m[0][2]],[ -m[1][0], m[1][1], m[1][2]])
    d={'id':sid,'t':round(snap(t,tr),2),'in':tr,'who':who,'fx':fx}
    d.update({k:v for k,v in ex.items()})
    d['move']={'from':m[0],'to':m[1]}
    if scene: d['scene']=scene
    shots.append(d)
# the reuse ids must point at the first chorus shots
ch=shots[20:26]
for s,src in zip([s for s in shots if 'img' in s],ch): s['img']=src['id']
board={'id':'baphomet','live':False,'cover':None,'style':L1['style'],'cast':{
 'lucien':L1['cast']['lucien'],'arthas':L1['cast']['arthas'],'cedric':L1['cast']['cedric'],
 'neeris':"Neeris, a wiry forest druid in his forties who carries a wolf curse: moss-green hooded ranger cloak over worn leather, a gnarled wooden staff, gaunt weathered face, unkempt dark hair and short beard, amber eyes, a haunted desperate look",
 'baphomet':"Baphomet, a towering goat-headed demon giant: long curved black horns, matted dark fur on a huge muscular body, cracked skin glowing like embers in the cracks, burning yellow eyes, broken iron chains hanging from his wrists, smoke around him",
 'wyrm':"the black wyrm, a huge black dragon: lean serpentine body, tattered black wings, ridged horns along the skull, glowing orange throat and eyes, smoke from its nostrils",
 'wraith':"the wraith, a colossal hooded spectre: tattered grey-black robes, no face but cold blue light inside the hood, long skeletal hands, trailing cold mist"},'shots':shots}
board['cover']='s21'
head={k:v for k,v in board.items() if k!='shots'}
out=json.dumps(head,ensure_ascii=False,indent=2)[:-2]+',\n  "shots": [\n'+',\n'.join('    '+json.dumps(s,ensure_ascii=False) for s in shots)+'\n  ]\n}\n'
json.loads(out); open('painted/08-baphomet.json','w').write(out)
print(len(shots),'shots,',sum(1 for s in shots if 'img' not in s),'to paint; reuse:',[(s['id'],s['img']) for s in shots if 'img' in s])
print('chorus shots',[(s['id'],s['t']) for s in ch])
ts=[s['t'] for s in shots]; print('monotonic',all(a<b for a,b in zip(ts,ts[1:])),'longest hold',max(b-a for a,b in zip(ts,ts[1:]+[361])))
