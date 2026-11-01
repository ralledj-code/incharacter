"""Storyboard generator for Level 5, The Hunt for the Pig (painted). Pattern: make/12.py.
Run from chronicle/: python painted/make/11.py -> painted/10-ahm-dynasty.json (overwrites hand edits).
Story: see src/levels/L05-hunt-pig.js.
"""
import json,re
L12=json.load(open('painted/12-fall-duncastle.json')); L6=json.load(open('painted/06-slaying-pig.json')); L1=json.load(open('painted/01-first-steps.json'))
def load_beats(path):
    m = re.search(r'(?:const BEATS|L\.beats) = (\{.*?\});', open(path).read(), re.S)
    return json.loads(m.group(1))
B=load_beats('src/levels/L05-hunt-pig.js')
near=lambda l,t: min(l,key=lambda x:abs(x-t))
def snap(t,k):
    if k not in ('cut','flash') or t==0: return t
    h,r,e=near(B['hits'],t),near(B['bars'],t),near(B['beats'],t)
    return h if abs(h-t)<=0.25 else r if abs(r-t)<=0.2 else e
L,A,C,SE,P,MW,CA,TR,WB,PO,WW='lucien','arthas','cedric','severin','pig','moonwell','carius','troll','werebear','poles','wolves'
TWELVE="in the middle of the town square (the ring of poles exactly as in the reference painting): exactly twelve thick wooden poles evenly spaced in one ring, no other poles anywhere, one villager chained upright to each pole with iron chains around waist and wrists, feet on the ground, ordinary poor villagers in rough clothes; "
TURN=" The ones turning become werewolves (fur, wolf snouts, fangs, claws, yellow eyes) that stay chained to their poles, no torches in their hands, never zombies, never undead."
MOVES=[([0,0,0.04],[0,0,0.2]),([-0.04,0,0.05],[0.04,0,0.12]),([0,0,0.22],[0,0,0.05]),([0.05,0.02,0.02],[-0.04,0,0.12]),([0,0.04,0.02],[0,0,0.18]),([0.03,0,0.08],[-0.03,0,0.16])]
LU="Lucien Vale (long blond hair, pointed ears, burgundy coat) "
MEM="painted like a faded memory, soft haze, muted colours, "
HALL="deep inside the mountain in the Pig's slaughterhouse (the same place as the next chapter): vast halls of cut stone blocks, meat hooks and chains hanging, braziers, smoke hanging in the air, "
GREAT=HALL+"the great hall with a massive pool of blood glowing dark red in the middle, and high in the hall's wall a barred window, "
SWAMP="at the first moonwell (layout as in the reference photo of the tabletop model, painted as a real place at full scale): a vast corrupted dead marsh, a giant gnarled tree on a square raised stone plinth in the middle, straight old cobblestone paths running out from the plinth, two lone square brick gate arches far away on either side of the tree, black goo water and dead reeds, mist, "
VIL="in the square of a small poor village at dusk, thatched houses, "
S_=[
(0,'black',[L],['fog'],VIL+"night, seen from behind: "+LU+"crouched on the edge of a thatched rooftop, rose petals in the wind, the square far below",{'grade':'cold'}),
(9.0,'fade',[],['fog','embers'],VIL+"night, a high bird's-eye view looking straight down on the town square: a ring of exactly twelve thick wooden poles evenly spaced in one circle like the hours on a clock face, one villager chained upright to each pole, an empty patch of cobbles in the middle of the ring, torches and a crowd outside the ring",{'grade':'red','flicker':0.4}),
(18.0,'cut',[A,C,PO],['embers'],VIL+"night: "+TWELVE+"Arthas and Cedric inside the circle holding back chained villagers who are starting to turn"+TURN,{'shake':0.3,'flicker':0.4}),
(27.0,'cut',[],['fog'],"Close-up of a villager's hands in iron chains on a wooden pole, fingers stretching into claws, coarse fur breaking through the skin",{'grade':'red'}),
(36.0,'cut',[SE],['fog'],VIL+"night: Severin standing calm and still in the middle of the fleeing crowd, red rose petals drifting around her, faint green glow",{'grade':'green'}),
(45.0,'cut',[SE],['fog'],VIL+"night: the crowd parting away from Severin in fear, leaving her alone in a ring of empty cobbles",{'grade':'green'}),
(54.0,'cut',[L],['fog'],"Close-up of "+LU+"on the rooftop, his eyes locked on someone below, purple sparks at his fingertips",{'grade':'cold'}),
(61.0,'cut',[L],['fog'],VIL+"night: "+LU+"rising to his feet on the roof ridge, coat whipping in the wind",{'grade':'cold'}),
(68.0,'cut',[L],['fog'],VIL+"night: "+LU+"running across the roof tiles at full speed, tiles cracking under his boots",{'grade':'cold'}),
(71.5,'flash',[L],['dust'],VIL+"night: "+LU+"landing hard in a crouch on the cobbles, dust bursting around him, at the feet of a woman whose green cloak hem is in frame",{'shake':0.5}),
(74.5,'cut',[SE],['fog'],"Close-up of Severin's face, real and close, silver-white hair, mint-green eyes, calm, a faint smile",{'grade':'green'}),
(78.2,'cut',[SE,L,PO],['fog'],VIL+"night, "+TWELVE+"in front of the circle: Severin holding out her open hand to "+LU+", asking for his glowing dagger, inviting him home",{'grade':'green'}),
(81.5,'cut',[L,PO],['fog'],VIL+"night: "+TWELVE+LU+"in front of the circle pleading, pointing back at the chained villagers",{}),
(84.2,'cut',[PO],['fog','embers'],VIL+"night: "+TWELVE+"the villagers half turned, howling, not knowing what they are becoming"+TURN,{'grade':'red'}),
(87.1,'cut',[SE],['fog'],"Close-up of Severin, cold now: we are already dead, all of us are",{'grade':'green'}),
(90.4,'cut',[L,SE,PO],['fog'],VIL+"night, "+TWELVE+"in front of the circle: "+LU+"stepping back from Severin, shaking his head, refusing",{'grade':'cold'}),
(93.3,'cut',[PO],['fog','embers'],VIL+"night: "+TWELVE+"eight of the twelve fully turned into werewolves straining at their chains, the other four still human and terrified"+TURN,{'grade':'red','flicker':0.4}),
(96.2,'cut',[A,C,PO],['embers'],VIL+"night: "+TWELVE+"Arthas and Cedric inside the circle holding the line against the chained werewolves, grim"+TURN,{'shake':0.3,'flicker':0.4}),
(99.1,'cut',[L,PO],['fog'],VIL+"night: "+TWELVE+LU+"turning his back on Severin and walking toward the circle of chained villagers, torches",{'grade':'cold'}),
(103.1,'cut',[L],['fog'],"Close-up of "+LU+"with his eyes closed, the weight of the choice",{}),
(108.5,'flash',[],['embers','fire'],"Eight funeral pyres burning in a row under a full moon outside the village, no people close",{'flicker':0.7}),
(112.2,'cut',[],['embers','fire'],"Close-up of small flames on one pyre, sparks rising into the night",{'flicker':0.7}),
(115.0,'cut',[L],['embers'],LU+"sitting on a rock before the burning pyres playing a mournful tune on a silver flute",{'flicker':0.5}),
(118.2,'cut',[],['embers','smoke'],"Smoke from eight pyres rising toward a huge pale moon, an empty field, no people",{'grade':'cold'}),
(120.9,'cut',[L],['embers'],"Close-up of "+LU+"playing the flute, tears on his cheek, firelight",{'flicker':0.5}),
(124.0,'cut',[A,C],['embers'],"Arthas and Cedric standing before the pyres with bloodied weapons, heads bowed",{'flicker':0.5}),
(131.0,'fade',[],['smoke'],"Grey dawn over eight smouldering pyres, ash drifting, no people",{}),
(138.9,'cut',[L,CA],['dust'],"In a small dim room, the frightened Carius pressed against a wall, "+LU+"leaning in to question him",{'flicker':0.3}),
(141.9,'cut',[L,CA],['sparks'],"Close-up of "+LU+"'s fingertips on Carius's temple, purple light, cracks spreading through the air like broken glass",{'grade':'cold'}),
(145.0,'cut',[],['fog'],"A vision in purple light: a dark cave mouth in a rocky hillside near a swamp with a giant dead tree in the distance, no people",{'grade':'cold'}),
(147.7,'cut',[L,A,C],['fog'],"The three brothers at a dark cave entrance among roots at dusk, torches lit, "+LU,{'flicker':0.4}),
(151.0,'flash',[A,C,TR],['sparks'],"Inside a dark cave, Arthas and Cedric fighting a blood troll, sword and staff, sparks",{'shake':0.5,'flicker':0.4}),
(154.0,'cut',[L,A,C],['dust'],"A huge pile of human bones and druid antler crowns in a cave chamber, the brothers' torches lighting it, "+LU,{'flicker':0.4}),
(156.8,'cut',[],['dust'],HALL+"a long corridor of fitted cut stone blocks and iron doors going deeper into the mountain, made by hands, torchlight, no people",{'flicker':0.4}),
(159.9,'cut',[A],['dust'],HALL+"Arthas running a gauntlet over the fitted stone blocks of the wall, realising it was built",{'flicker':0.3}),
(162.9,'cut',[L],['sparks'],LU+"wrapped in a shimmering illusion that makes him look like the huge pig-headed butcher with a broadaxe, his own blond hair faintly visible through it",{'grade':'red'}),
(166.0,'cut',[WB],['dust'],"Two werebears in a torchlit cave hall bowing to someone off-screen",{'flicker':0.4}),
(168.8,'cut',[WB],['dust'],"A werebear calmly changing between man and bear at will, half of each",{'flicker':0.3}),
(171.9,'cut',[WB,L,A,C],['dust'],"The two werebears walking out of the cave hall while the three brothers slip past in the shadows the other way",{'flicker':0.3}),
(176.3,'flash',[],[],None,{'img':'s21'}),
(179.6,'cut',[],[],None,{'img':'s22'}),
(182.5,'cut',[],[],None,{'img':'s23'}),
(185.5,'cut',[],[],None,{'img':'s24'}),
(188.4,'cut',[],[],None,{'img':'s25'}),
(191.5,'cut',[],[],None,{'img':'s26'}),
(199.0,'fade',[L,A,C],['dust'],HALL+"the three brothers descending a wide cut-stone stair into the depths, torches small in the dark",{'flicker':0.3}),
(206.0,'cut',[],['dust','embers'],GREAT+"lit orange from inside, establishing shot, no people visible",{'grade':'red','flicker':0.4}),
(212.0,'cut',[P],['embers'],"Close on the barred window high in the stone wall of the great hall, lit orange, the shadow of the huge Pig moving inside",{'grade':'red','flicker':0.5}),
(218.4,'flash',[L],['sparks','embers'],GREAT+LU+"by the blood pool hurling a fireball up at the lit barred window, fire roaring from his hand",{'shake':0.4,'flicker':0.7}),
(222.1,'cut',[],['fire','embers'],GREAT+"looking up from the cavern floor: the barred window high in the stone wall exploding in fire, thick black smoke pouring out and rolling along the rock ceiling of the cave, everything enclosed deep inside the mountain, no sky, no daylight, no outdoors, no people in the frame",{'shake':0.6,'flicker':0.8}),
(225.7,'cut',[],['fire','smoke'],"Silhouettes of prisoners behind the flames of the burning barred window, only shapes in the fire and smoke, leave the rest to imagination",{'grade':'red','flicker':0.8}),
(228.2,'cut',[L],['embers'],"Close-up of "+LU+"'s face lit by the fire, horror as he understands",{'flicker':0.6}),
(236.1,'cut',[L],['embers','ash'],GREAT+LU+"on his knees by the blood pool below the burning window, a burden he will carry",{'flicker':0.5}),
(242.4,'cut',[L],['ash'],"Extreme close-up of "+LU+"'s eyes, something changing in them",{}),
(249.1,'flash',[P],['fire','embers'],GREAT+"the Pig wading in the pool of blood, three metres tall, growing larger, roaring, black smoke above",{'grade':'red','shake':0.4,'flicker':0.7}),
(252.2,'cut',[P],['fire','embers'],HALL+"the draining hall with stone slabs and iron shackles: the Pig raising his broadaxe over chained prisoners, only silhouettes, leave the violence to imagination",{'grade':'red','flicker':0.6}),
(255.1,'cut',[P],['fire','smoke'],GREAT+"the Pig grown huge at the edge of the blood pool, bloated with power, blood glowing on his skin, braziers behind him",{'grade':'red','shake':0.4}),
(258.1,'cut',[L],['ash','embers'],LU+"standing frozen and still, firelight on his face",{'flicker':0.5}),
(260.4,'cut',[P,A,C],['fire','sparks'],GREAT+"Arthas and Cedric charging the giant blood-soaked Pig around the pool of blood",{'shake':0.5,'flicker':0.6}),
(268.8,'cut',[L],['ash','embers'],GREAT+LU+"down on one knee by the blood pool, bleeding, barely standing",{'grade':'red'}),
(276.9,'cut',[P,A,C],['fire','smoke'],GREAT+"blurred through smoke: the huge Pig swinging his axe at Arthas and Cedric",{'grade':'red','shake':0.4}),
(281.9,'cut',[L],['ash'],GREAT+LU+"falling onto the stone floor by the blood pool, the burning window blurring above him",{'grade':'red'}),
(287.8,'fade',[P],['fire','smoke'],GREAT+"seen from the floor, blurred and darkening: the giant silhouette of the Pig against the braziers and the red glow of the pool",{'grade':'red'}),
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
assert sid('s21')['scene'].startswith('Eight funeral pyres') and sid('s26')['scene'].startswith('Arthas and Cedric standing before the pyres')
L10=json.load(open('painted/10-ahm-dynasty.json')); L11=json.load(open('painted/11-hunger-grows.json'))
L4=json.load(open('painted/04-cleansing-well.json'))
cast={k:L4['cast'][k] for k in ['lucien','arthas','cedric','severin','pig','moonwell','carius']}
cast.update({'poles':"the circle of twelve poles in the town square, as in the reference painting",'wolves':L4['cast']['wolves'],'troll':"a blood troll: a hulking, hunched cave troll twice a man's height, dark red blood-slick skin, long arms with claws, a jutting jaw with tusks, small burning eyes, ragged hair",
 'werebear':"werebears that control their shape: big bearded men in fur-trimmed leather, and the same men as huge brown bears, or half man half bear, calm and proud"})
board={"id":"hunt-pig","live":True,'cover':'s21','style':L12['style'],'cast':cast,'shots':shots}
head_={k:v for k,v in board.items() if k!='shots'}
out=json.dumps(head_,ensure_ascii=False,indent=2)[:-2]+',\n  "shots": [\n'+',\n'.join('    '+json.dumps(s,ensure_ascii=False) for s in shots)+'\n  ]\n}\n'
json.loads(out);open('painted/05-hunt-pig.json','w').write(out)
ts=[s['t'] for s in shots]
print(len(shots),'shots',sum(1 for s in shots if 'img' not in s),'new','mono',all(a<b for a,b in zip(ts,ts[1:])),'maxhold',round(max(b-a for a,b in zip(ts,ts[1:]+[295.5])),1))
