"""Storyboard generator for Level 3, Finding the First Moonwell (painted). Pattern: make/12.py.
Run from chronicle/: python painted/make/11.py -> painted/10-ahm-dynasty.json (overwrites hand edits).
Story: see src/levels/L03-first-moonwell.js.
"""
import json,re
L12=json.load(open('painted/12-fall-duncastle.json')); L6=json.load(open('painted/06-slaying-pig.json')); L1=json.load(open('painted/01-first-steps.json'))
def load_beats(path):
    m = re.search(r'(?:const BEATS|L\.beats) = (\{.*?\});', open(path).read(), re.S)
    return json.loads(m.group(1))
B=load_beats('src/levels/L03-first-moonwell.js')
near=lambda l,t: min(l,key=lambda x:abs(x-t))
def snap(t,k):
    if k not in ('cut','flash') or t==0: return t
    h,r,e=near(B['hits'],t),near(B['bars'],t),near(B['beats'],t)
    return h if abs(h-t)<=0.25 else r if abs(r-t)<=0.2 else e
L,A,C,M,SE,WS,K,G,AL,CA,AB,CU='lucien','arthas','cedric','mara','severin','wolfsilas','kids','guard','aldraik','carius','aberration','cube'
MOVES=[([0,0,0.04],[0,0,0.2]),([-0.04,0,0.05],[0.04,0,0.12]),([0,0,0.22],[0,0,0.05]),([0.05,0.02,0.02],[-0.04,0,0.12]),([0,0.04,0.02],[0,0,0.18]),([0.03,0,0.08],[-0.03,0,0.16])]
LU="Lucien Vale (long blond hair, pointed ears, burgundy coat) "
MEM="painted like a faded memory, soft haze, muted colours, "
TAV="in Mara's tavern at night, warm firelight, "
BASE="in the stone basement under Mara's tavern, candlelight, "
SWAMP="in a vast corrupted swamp around the first moonwell, a huge open dead marsh: a giant half-dead ancient tree in the middle, old cobblestone paths winding through parts of it, everything else drowned under black goo water, dead reeds, mist, "
S_=[
(0,'black',[],['fog'],"Mara's tavern on a wet cobbled street at night, a warm window, no people",{'flicker':0.3}),
(7.0,'fade',[],['fog'],"Close-up of a small glass vial of glowing silver moonwell water standing on a scarred tavern table, candlelight",{'flicker':0.3}),
(14.0,'cut',[L,A,C],['dust'],TAV+"the three brothers around a table arguing over the small silver vial between them, "+LU+"Arthas with his hood up, Cedric",{'flicker':0.4}),
(21.0,'cut',[M],['dust'],TAV+"Mara standing in a doorway behind the bar, arms folded, worried",{'flicker':0.3}),
(28.0,'cut',[A,C],['dust'],TAV+"Arthas pointing out the window toward a distant church spire, Cedric nodding, decided",{'flicker':0.3}),
(35.0,'cut',[L],['dust'],TAV+LU+"getting up from the table, determined, glancing at Mara",{'flicker':0.3}),
(42.3,'fade',[A,C,K],['fog'],"Arthas and Cedric leading the two children wrapped in blankets through dark streets toward a church",{}),
(48.9,'cut',[L,M],['dust'],TAV+LU+"with a hand on Mara's shoulder, promising she won't face it alone",{'flicker':0.3}),
(55.4,'cut',[L,WS],['dust'],BASE+LU+"lifting heavy iron chains off a wall hook, the chained werewolf Silas watching him from the shadows",{'flicker':0.4}),
(61.4,'flash',[L,WS],['dust'],BASE+"the werewolf Silas lunging at "+LU+", jaws inches from his face, its chains snapping taut",{'shake':0.6,'flicker':0.5}),
(71.1,'fade',[L,WS],['fog'],BASE+LU+"with his hand resting on the werewolf's head, the beast suddenly calm and quiet, a strange bond",{'flicker':0.3}),
(77.75,'cut',[L],['sparks'],BASE+LU+"secretly drinking the glowing silver moonwater from the small vial, eyes closed",{'flicker':0.3}),
(84.6,'cut',[L],['dust'],BASE+LU+"refilling the empty vial with plain water from a jug, glancing over his shoulder",{'flicker':0.3}),
(90.7,'cut',[L],['dust'],"Close-up of "+LU+"slipping the vial back into his coat, guilt in his eyes, a secret",{'flicker':0.3}),
(97.1,'fade',[A,C,K],['dust'],"Arthas and Cedric bringing the children into the candlelit stone sanctuary of a great church, priests in white receiving them",{'flicker':0.3}),
(103.9,'cut',[L],['dust'],TAV+LU+"alone in a shadowed corner with a cup of wine, drinking to forget",{'flicker':0.3}),
(111.1,'flash',[L,A,C],['fog'],"The three half-brothers walking side by side through a moonlit forest, wolf tracks in the frost at their feet, "+LU+"Arthas, Cedric, heroic",{'grade':'cold'}),
(118.1,'cut',[],['fireflies','fog'],"A stone basin overflowing with glowing silver moonwater, light rising from it into the night",{'grade':'cold'}),
(124.7,'cut',[],['fog'],"The same silver water draining away into black, the light dying",{'grade':'cold'}),
(131.1,'cut',[L],['fog'],LU+"alone by a lantern, his shadow on the wall behind him the shape of a wolf",{'grade':'cold'}),
(137.5,'fade',[L],['dust'],TAV+LU+"carousing late at night, singing on a table with a mug raised, a laughing crowd around him",{'flicker':0.5}),
(143.7,'cut',[L],['dust'],LU+"waking up on the cold floor of a church temple among the pews, morning light through tall windows, confused",{}),
(150.25,'cut',[L],['dust'],"In the temple, a stern priest in white looming over the hungover "+LU+", an empty wine bottle beside him",{}),
(156.85,'cut',[L],['sparks'],"Close-up of "+LU+"touching his neck where the bite was, the wound healed clean, relief",{}),
(163.0,'cut',[L,A,C],['fog'],"The three brothers bent over a map by candlelight in the temple, searching for the druids",{'flicker':0.3}),
(169.55,'fade',[L,A,C,AL],['dust'],"In an opulent merchant hall of gold and black marble, the three brothers bowing before Aldraik on a gilded chair",{'flicker':0.3}),
(176.1,'cut',[AL],['dust'],"Aldraik leaning back on his gilded chair laughing at them, cruel and smug",{'flicker':0.3}),
(182.4,'cut',[G,WS,M],['dust'],TAV+"Ahm Dynasty guards dragging the chained werewolf Silas out of the tavern, Mara frozen in shock in the doorway",{'flicker':0.4}),
(188.9,'cut',[AL,L],['dust'],"Aldraik leaning close to "+LU+"with a sly smile, whispering something about their mother, Lucien frozen",{'flicker':0.3}),
(194.8,'flash',[],[],None,{'img':'s17'}),
(201.6,'cut',[],[],None,{'img':'s18'}),
(208.3,'cut',[],[],None,{'img':'s19'}),
(214.6,'cut',[],[],None,{'img':'s20'}),
(221.3,'fade',[],['fog'],SWAMP+"very wide shot: the whole corrupted swamp with the huge dying tree in the middle, black goo water everywhere, broken cobblestone paths, two enormous stone overhang pillars far away on either side of the tree, no people",{'grade':'green'}),
(224.6,'cut',[SE],['fog'],MEM+SWAMP+"the faint pale shadow of Severin passing through the swamp days ago, green light trailing",{'grade':'green'}),
(227.9,'cut',[AB],['fog'],SWAMP+"a monstrous aberration rising out of the black goo water, tendrils and too many eyes, a man's body merged into its underside",{'grade':'green','shake':0.3}),
(231.0,'cut',[AB,CA],['fog'],SWAMP+"close on the aberration's underside: Carius, a village man, fused into the black mass up to his chest, part of it, screaming in pain, reaching out",{'grade':'green','shake':0.3}),
(234.45,'flash',[L,A,C,AB],['sparks','embers'],SWAMP+"the three brothers fighting the aberration, "+LU+"hurling fire, Arthas slashing, Cedric striking with his staff",{'shake':0.5,'flicker':0.5}),
(237.55,'cut',[],['sparks','fireflies'],SWAMP+"very wide shot: two colossal ancient stone pillars curving over like overhangs, one on each side of the giant tree, each about fifty metres from it, silver runes blazing up their length, beams of moonlight pouring from them toward the tree",{'grade':'cold'}),
(240.65,'cut',[],['fireflies','fog'],SWAMP+"the great old tree in the middle of the swamp glowing silver, black goo around its roots turning back into clean shining moonwater",{'grade':'cold'}),
(244.1,'cut',[L,A,C,CA],['fireflies'],SWAMP+"the exhausted brothers standing on a cobblestone path in the silver light, Carius freed from the dead monster, collapsed and alive, victory",{'grade':'cold'}),
(252.65,'fade',[L,CU],['fireflies','fog'],SWAMP+LU+"standing alone in the silver glow, and behind him a huge transparent cube of jelly sliding silently closer",{'grade':'cold'}),
(259.45,'cut',[L,CU],['fog'],SWAMP+LU+"engulfed inside the transparent gelatinous cube, suspended, bubbles around him",{'grade':'green'}),
(265.85,'cut',[L,CU],['fog'],"Close-up of "+LU+"'s face pressed against the inside of the jelly, unable to breathe, eyes wide",{'grade':'green'}),
(272.45,'cut',[A,C],['fog'],SWAMP+"far away in the mist Arthas and Cedric turning around, searching",{'grade':'cold'}),
(281.0,'fade',[L,CU],['fog'],SWAMP+"the gelatinous cube with Lucien's dim shape inside, darkness closing in from the edges",{'grade':'cold'}),
]
shots=[];mv=0
for i,(t,tr,who,fx,scene,ex) in enumerate(S_):
    m=MOVES[mv%len(MOVES)];mv+=1
    if 'img' in ex: m=([-m[0][0],m[0][1],m[0][2]],[-m[1][0],m[1][1],m[1][2]])
    d={'id':'s%02d'%(i+1),'t':round(snap(t,tr),2),'in':tr,'who':who,'fx':fx}; d.update(ex); d['move']={'from':m[0],'to':m[1]}
    if scene: d['scene']=scene
    shots.append(d)
# chorus reuse: copy fx/who of the original
for s in shots:
    if 'img' in s:
        o=[x for x in shots if x['id']==s['img']][0]; s['who']=o['who']; s['fx']=o['fx']
sid=lambda k:[x for x in shots if x['id']==k][0]
assert sid('s17')['scene'].startswith('The three half-brothers walking') and sid('s20')['scene'].startswith(LU+'alone by a lantern')
L10=json.load(open('painted/10-ahm-dynasty.json')); L11=json.load(open('painted/11-hunger-grows.json'))
L2=json.load(open('painted/02-finding-silas.json'))
cast={k:L2['cast'][k] for k in ['lucien','arthas','cedric','mara','severin','wolfsilas','kids','guard']}
cast.update({'aldraik':"Aldraik, the Ahm Dynasty's merchant master: a short, very fat human man, barely chest-high to the brothers, round belly straining a gaudy gold-embroidered black waistcoat, a big bald head, a huge bushy moustache and mutton chops, a gold tooth in a wide greedy grin, small shrewd scheming eyes, fat fingers covered in jeweled rings, a gold monocle on a chain, a fur-trimmed coat with the golden winged lion crest, a cigar; a loud, cocky, scheming boss of a villain",
 'carius':"Carius, a man from the small village of Lehai: a farmer in his forties, plain brown tunic, muddy, terrified, half of him fused into the black goo monster",
 'aberration':"a monstrous aberration born of black goo: a dripping mass of black slime as big as a cart with long grasping tendrils, a ring of many pale eyes and a gaping toothed maw; fused into its underside is Carius, a village man in a plain brown tunic, merged into the black mass up to his chest underneath the creature, unarmed with empty clawing hands, his anguished face and arms sticking out, the monster far bigger than him looming over him, part of the creature",
 'cube':"a gelatinous cube: a huge transparent, faintly green block of jelly in the exact shape of a perfect cube with flat sides and straight edges, taller than a man, almost invisible, bones and coins floating inside it, never shaped like a person or creature"})
board={"id":"first-moonwell","live":False,'cover':'s17','style':L12['style'],'cast':cast,'shots':shots}
head_={k:v for k,v in board.items() if k!='shots'}
out=json.dumps(head_,ensure_ascii=False,indent=2)[:-2]+',\n  "shots": [\n'+',\n'.join('    '+json.dumps(s,ensure_ascii=False) for s in shots)+'\n  ]\n}\n'
json.loads(out);open('painted/03-first-moonwell.json','w').write(out)
ts=[s['t'] for s in shots]
print(len(shots),'shots',sum(1 for s in shots if 'img' not in s),'new','mono',all(a<b for a,b in zip(ts,ts[1:])),'maxhold',round(max(b-a for a,b in zip(ts,ts[1:]+[295.5])),1))
