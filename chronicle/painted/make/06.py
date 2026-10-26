"""Storyboard generator for Level 6, Slaying the Pig (painted). Template for the next painted level: copy, rewrite the shot list S_/S.
Run from chronicle/: python painted/make/06.py  ->  painted/<NN-id>.json (overwrites it, so re-apply any hand edits made since).
Each row: (song time, transition, who [cast ids, always set when people are in the shot], fx, scene, extras).
scene=None + extras {'img': ...} reuses another shot's painting (repeated chorus). Hard cuts snap to hits, then bars, then beats.
NOTE: written before the hand fixes made afterwards (well -> lake, s03, s09, s47 in level 8; s11 in level 6), so the
committed JSON is the source of truth for those levels; this file is the pattern, not the record.
"""
import json
L1=json.load(open('painted/01-first-steps.json')); L8=json.load(open('painted/08-baphomet.json'))
import re
def load_beats(path):
    # the level's measured beat grid (scripts/beats.py): `const BEATS = {...};` or `L.beats = {...};`
    m = re.search(r'(?:const BEATS|L\.beats) = (\{.*?\});', open(path).read(), re.S)
    return json.loads(m.group(1))
B=load_beats('src/levels/L06-slaying-pig.js')
near=lambda l,t: min(l,key=lambda x:abs(x-t))
def snap(t,k):
    if k not in ('cut','flash') or t==0: return t
    h,r,e=near(B['hits'],t),near(B['bars'],t),near(B['beats'],t)
    return h if abs(h-t)<=0.25 else r if abs(r-t)<=0.2 else e
L,A,C,P,V,PR,S,BA='lucien','arthas','cedric','pig','valerys','prisoner','severin','baphomet'
MOVES=[([0,0,0.04],[0,0,0.2]),([-0.04,0,0.05],[0.04,0,0.12]),([0,0,0.22],[0,0,0.05]),([0.05,0.02,0.02],[-0.04,0,0.12]),([0,0.04,0.02],[0,0,0.18]),([0.03,0,0.08],[-0.03,0,0.16])]
HALL="the Pig's slaughterhouse deep inside a mountain: vast cut-stone halls, meat hooks and chains, braziers"
S_=[
(0,'black',[],['smoke','embers'],f"Establishing shot of {HALL}, a massive pool of blood glowing dark red in the middle of the great hall, smoke hanging in the air",{'flicker':0.4}),
(10.35,'fade',[P],['smoke','embers'],"The Pig at the edge of the blood pool: a hulking humanoid butcher with a pig's head, a blood-soaked leather apron, raising a huge broadaxe, braziers behind him",{'flicker':0.5}),
(20.46,'cut',[L,A,C,P],['embers','sparks'],"The three brothers driving the Pig back around the great pool of blood: Arthas's sword, Cedric's staff, Lucien throwing fire, the butcher stumbling",{'flicker':0.5,'shake':0.3}),
(25.66,'cut',[],['smoke','embers'],"High in the great hall's wall, a barred window of a room already ablaze, thick black smoke pouring out over the hall",{'flicker':0.7}),
(30.0,'cut',[L],['embers'],"Lucien Vale lowering his burning hand, the fire in his palm dying, his face lit from below as he realises what the burning room holds",{'flicker':0.6}),
(35.0,'cut',[],['embers','smoke'],"Silhouettes of prisoners behind the flames of the burning window, only shapes in the fire and smoke, leave the rest to imagination",{'flicker':0.8}),
(40.0,'cut',[L],['ash'],"Close-up of Lucien Vale in anguish, tears cutting through soot on his face, eyes up toward the burning room, God forgive me",{'flicker':0.5}),
(48.52,'fade',[L,A,C],['smoke','ash'],"The great hall filling with black smoke, the three brothers small figures by the blood pool, Lucien sinking to his knees",{'flicker':0.4}),
(58.9,'ink',[P,A],['dust'],"The Pig dragging Arthas the paladin down under the surface of the blood pool, the dark plate armour sinking, a great splash of dark red",{'shake':0.4}),
(66.94,'cut',[P],['ash'],"The Pig falling dead backwards into his own pool of blood, the broadaxe slipping from his hand, a wave of dark red",{'shake':0.3}),
(71.6,'cut',[L,A,C],['ash'],"Lucien and Cedric hauling Arthas out of the blood pool onto the stone edge, all three broken, torn and gasping",{}),
(75.34,'cut',[],['ash','smoke'],"The room next door: everything grey with ash and cinders, two still shapes under the ash on the floor, thin smoke, no detail",{'grade':'cold'}),
(84.4,'fade',[],['dust'],"Black water seeping out of cracks in the raw rock wall deep in the mountain, running down like veins",{'grade':'cold'}),
(89.06,'cut',[],['dust'],"A stone basin where the black water gathers and mixes with blood, oily and dark, a faint sickly shine",{}),
(102.46,'ink',[],['fog'],"A painted map-like vista of the island of Alaron at night seen from the mountain, rivers and streams turning black as ink, spreading across the land like veins",{'grade':'cold'}),
(106.86,'cut',[],['dust'],"The draining hall: rows of stone slabs with empty iron shackles, channels in the floor dark with old blood, cages hanging from the ceiling, empty",{'grade':'cold'}),
(111.4,'cut',[A,C],['dust'],"Arthas and Cedric standing grim among the stone slabs of the draining hall, torchlight on their faces",{'flicker':0.4}),
(115.76,'cut',[L],['dust'],"Lucien Vale alone in cold light at the end of the draining hall, staring at the empty shackles, every truth cutting deeper",{'grade':'cold'}),
(124.88,'flash',[L,A,C],['ash','embers'],"Wide shot: the three brothers standing on a ledge looking out over the vast underground slaughterhouse, red light from the blood pool far below",{}),
(129.54,'cut',[],['ash'],"Looking down from high above into the endless halls under the mountain, tiny torches, hooks and chains, the red glow of the pool",{}),
(133.7,'cut',[],['ash','smoke'],"Far away across the land, the walled city of Stagford on a plain, gates broken open, thin smoke rising, not a soul in sight",{}),
(138.22,'cut',[],['ash'],"An empty street in sacked Stagford, doors hanging open, abandoned carts, a child's toy on the cobbles, grey light",{'grade':'cold'}),
(142.32,'cut',[L],['embers'],"Lucien Vale walking with a small flame burning in his open hand, his face half in shadow, carrying the fire and the blame",{'flicker':0.5}),
(146.94,'cut',[L],['ash','fog'],"Pale ghostly faces of the people of Stagford in the smoke around Lucien Vale, whispering, his eyes closed",{}),
(152.4,'fade',[PR],['dust'],"The last prisoner, a gaunt man chained in a cage in the draining hall, head down, torchlight through the bars",{'flicker':0.3}),
(163.0,'cut',[PR],['fog'],"The prisoner lifting his head, his eyes now glowing a cold mint green, another will speaking through him",{}),
(167.5,'cut',[PR,S],['fog'],"A faint translucent ghost of Severin, silver hair and green hood, appearing over the chained prisoner as she speaks through his mouth",{'grade':'green'}),
(172.26,'ink',[BA],['smoke'],"A vision: the black lake at night, Baphomet's enormous goat face beneath the black water, chains straining around it",{'grade':'red'}),
(184.14,'cut',[PR],['sparks'],"The prisoner's thin hand holding out through the bars a small glass vial of glowing green elixir",{}),
(188.52,'cut',[BA],['embers','sparks'],"A vision: the chains around the black lake bursting in fire, Baphomet's burning eyes rising toward the surface, flames on the water",{'grade':'red','shake':0.3}),
(197.66,'fade',[L,A,C],['dust'],"Lucien Vale telling his brothers what he heard, the three of them by torchlight in the draining hall",{'flicker':0.4}),
(202.88,'cut',[A],['dust'],"Arthas shaking his hooded head in doubt, arms crossed, not believing that Severin was forced into any of this",{}),
(207.32,'cut',[C],[],"Close-up of Cedric Cold-Eye's sharp, still, pale grey eyes, watching, saying nothing",{}),
(223.48,'cut',[L],['sparks','smoke'],"Close-up: Lucien's hand pouring the glowing green elixir out onto the stone floor, it hisses and smokes away",{}),
(228.1,'fade',[L],['fog'],"Lucien Vale walking alone down a dark tunnel toward faint light, his brothers far behind him",{}),
(236.58,'flash',[],['ash','embers'],None,{'img':'s20'}),
(241.36,'cut',[],['ash'],None,{'img':'s21'}),
(245.5,'cut',[],['ash','smoke'],None,{'img':'s22'}),
(248.88,'cut',[],['ash'],None,{'img':'s23'}),
(254.04,'cut',[],['embers'],None,{'img':'s24'}),
(258.58,'cut',[],['ash','fog'],None,{'img':'s25'}),
(264.48,'fade',[],['dust'],"The nave of a grand stone church, a great window over the altar, rows of pews and candles, a channel of black water running down the side of the nave",{'flicker':0.3}),
(269.32,'cut',[V,A,C,L],['dust'],"High Inquisitor Valerys at the altar listening, his sons Arthas and Cedric before him, Lucien a step behind",{'flicker':0.3}),
(273.74,'cut',[V],['dust'],"Close-up of High Inquisitor Valerys, his face calm and unreadable, he does not flinch",{'flicker':0.3}),
(278.02,'cut',[],['dust'],"An iron grate set in the church floor, darkness beneath it, two red eyes glinting far below",{'grade':'red'}),
(286.8,'cut',[L],['dust'],"Lucien Vale in the church glancing from the grate in the floor to the Inquisitor, narrow suspicious eyes",{'flicker':0.3}),
(295.6,'cut',[V],['dust'],"High Inquisitor Valerys's eyes in shadow beneath the great window, a silence hiding behind his gaze",{}),
(304.06,'fade',[],['fog'],None,{'img':'s45'}),
(313.41,'cut',[L],['fog'],"Lucien Vale alone outside the church at night, looking back at its lit windows, uncertain",{}),
(317.56,'cut',[],['dust'],None,{'img':'s48'}),
]
shots=[];mv=0
for i,(t,tr,who,fx,scene,ex) in enumerate(S_):
    m=MOVES[mv%len(MOVES)];mv+=1
    if 'img' in ex: m=([-m[0][0],m[0][1],m[0][2]],[-m[1][0],m[1][1],m[1][2]])
    d={'id':'s%02d'%(i+1),'t':round(snap(t,tr),2),'in':tr,'who':who,'fx':fx}; d.update(ex); d['move']={'from':m[0],'to':m[1]}
    if scene: d['scene']=scene
    shots.append(d)
ids=[s['id'] for s in shots]
# reuse targets by scene: chorus s20-s25, church nave and grate
nave=[s['id'] for s in shots if s.get('scene','').startswith('The nave')][0]; grate=[s['id'] for s in shots if s.get('scene','').startswith('An iron grate')][0]
ch=[s['id'] for s in shots if s['t']>=124 and s['t']<150]
reuse=[s for s in shots if 'img' in s]
for s,src in zip(reuse[:6],ch): s['img']=src
reuse[6]['img']=nave; reuse[7]['img']=grate
cast={'lucien':L1['cast']['lucien'],'arthas':L1['cast']['arthas'],'cedric':L1['cast']['cedric'],'severin':L1['cast']['severin'],'baphomet':L8['cast']['baphomet'],
 'pig':"the Pig, a hulking humanoid butcher about three metres tall with the head of a pig: heavy jowls, short tusks, small cruel eyes, reddish-pink skin, a leather butcher's apron soaked in blood, thick arms, a huge broadaxe",
 'valerys':"High Inquisitor Valerys, the stern father of Arthas and Cedric: a tall man in his sixties, close-cropped grey hair and a short grey beard, hard pale grey eyes, white and crimson inquisitor robes with a gold sun emblem on the chest, a heavy gold chain of office, a calm unreadable face",
 'prisoner':"the last prisoner, a gaunt townsman of Stagford in his thirties: torn grey rags, dark stubble, hollow cheeks, shackled wrists, dirty and exhausted"}
board={'id':'slaying-pig','live':True,'cover':'s03','style':L1['style'],'cast':cast,'shots':shots}
head={k:v for k,v in board.items() if k!='shots'}
out=json.dumps(head,ensure_ascii=False,indent=2)[:-2]+',\n  "shots": [\n'+',\n'.join('    '+json.dumps(s,ensure_ascii=False) for s in shots)+'\n  ]\n}\n'
json.loads(out);open('painted/06-slaying-pig.json','w').write(out)
ts=[s['t'] for s in shots]
print(len(shots),'shots',sum(1 for s in shots if 'img' not in s),'new; reuse',[(s['id'],s['img']) for s in reuse],'mono',all(a<b for a,b in zip(ts,ts[1:])),'maxhold',round(max(b-a for a,b in zip(ts,ts[1:]+[324.5])),1))
