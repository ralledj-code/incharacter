"""Storyboard generator for Level 2, Finding Silas (painted). Pattern: make/12.py.
Run from chronicle/: python painted/make/11.py -> painted/10-ahm-dynasty.json (overwrites hand edits).
Story: see src/levels/L02-finding-silas.js.
"""
import json,re
L12=json.load(open('painted/12-fall-duncastle.json')); L6=json.load(open('painted/06-slaying-pig.json')); L1=json.load(open('painted/01-first-steps.json'))
def load_beats(path):
    m = re.search(r'(?:const BEATS|L\.beats) = (\{.*?\});', open(path).read(), re.S)
    return json.loads(m.group(1))
B=load_beats('src/levels/L02-finding-silas.js')
near=lambda l,t: min(l,key=lambda x:abs(x-t))
def snap(t,k):
    if k not in ('cut','flash') or t==0: return t
    h,r,e=near(B['hits'],t),near(B['bars'],t),near(B['beats'],t)
    return h if abs(h-t)<=0.25 else r if abs(r-t)<=0.2 else e
L,A,C,M,MO,AS,G,SE,S,WS,WI,K='lucien','arthas','cedric','mara','mother','assassin','guard','severin','silas','wolfsilas','wife','kids'
MOVES=[([0,0,0.04],[0,0,0.2]),([-0.04,0,0.05],[0.04,0,0.12]),([0,0,0.22],[0,0,0.05]),([0.05,0.02,0.02],[-0.04,0,0.12]),([0,0.04,0.02],[0,0,0.18]),([0.03,0,0.08],[-0.03,0,0.16])]
LU="Lucien Vale (long blond hair, pointed ears, burgundy coat) "
MEM="painted like a faded memory, soft haze, muted colours, "
DOCK="behind a tavern on Norwich dock at night, a cold fog off the water, "
SHACK="inside a dark dockside shack behind the tavern, one lantern, "
BASE="in the stone basement under Mara's tavern, candlelight, "
ROOM="in a sacked, rummaged room, furniture torn apart, black goo smeared on the walls, "
S_=[
(0,'black',[SE],['fog'],"A misty dark pine forest at night, far away between the trees a tall pale woman with silver-white hair, only a silhouette and two faint green eyes",{'grade':'green'}),
(6.5,'fade',[],['fog'],"A thin moon over a sleeping harbour town, fog on the roofs, no people",{'grade':'cold'}),
(12.5,'fade',[SE],['fog'],"Severin in a poor town street by day, handing small glass potion vials to sick, coughing townsfolk wrapped in blankets, soft green light around her, kind smile",{'grade':'green'}),
(16.8,'cut',[SE],['fog'],"Close-up of Severin's pale hand placing a glowing green vial into a sick mother's shaking hands, gentle, too gentle",{'grade':'green'}),
(22.4,'cut',[],['dust'],"Inside a crowded sickhouse, sick townsfolk on cots drinking from small glass vials, candlelight, relief on their faces",{}),
(26.5,'cut',[],['fog'],"Close-up of a sick man's hand on a blanket, coarse dark fur starting to sprout at his wrist, his nails lengthening into claws",{'grade':'cold'}),
(32.2,'fade',[],['fog'],DOCK+"a crooked shack in the alley, its door ajar, black water lapping at the pier, no people",{'grade':'cold'}),
(36.5,'cut',[WI,K],['fog'],"Through a dirty window of a dark shack: a thin woman holding two small children close, their eyes glinting yellow in the dark",{'grade':'cold'}),
(41.3,'cut',[L,WS],['dust'],BASE+LU+"kneeling before the chained werewolf Silas, one hand on his heart, making a promise",{'flicker':0.4}),
(45.2,'cut',[WS],['dust'],BASE+"the werewolf Silas chained to the stone wall with heavy iron chains, head bowed, a single candle, quiet as a prayer",{'flicker':0.4}),
(53.3,'cut',[L,M],['dust'],"In Mara's tavern, "+LU+"leaning over the bar persuading Mara, she has her arms crossed, unconvinced, then softening",{'flicker':0.3}),
(57.3,'cut',[],['fire','embers'],MEM+"Church inquisitors in white and crimson with torches around a burning pyre at night, a wolf-shape in the flames, only silhouettes",{'grade':'red','flicker':0.6}),
(62.0,'fade',[L,A,C],['dust'],"The three brothers around a tavern table late at night, candles and mugs, telling each other their stories, "+LU+"Arthas with his hood up, Cedric",{'flicker':0.4}),
(66.7,'cut',[MO],['fog'],MEM+"the brothers' mother, a tall noble woman, standing at a window looking out, alive, far away",{}),
(71.7,'cut',[],['fog'],MEM+"a small blond half-elf boy with pointed ears alone on a doorstep at dusk, a woman's figure walking away down the road",{}),
(76.1,'cut',[SE,S],['fog'],"Severin raising a glowing green hand over the kneeling smuggler Silas in a dark warehouse, a cold green light rising through him",{'grade':'green'}),
(81.3,'cut',[WS],['fog'],"Silas mid-transformation in green light, his human face stretching into a wolf snout, fur bursting through his patched coat",{'grade':'green','shake':0.3}),
(86.0,'cut',[L,SE],['fog'],"Extreme close-up of "+LU+"'s eyes, haunted, the faint reflection of Severin's pale face with green eyes in them",{'grade':'green'}),
(90.5,'cut',[],['fog'],"Black blood dripping slowly from a wooden pier into dark water under a thin crescent moon",{'grade':'cold'}),
(95.2,'cut',[],['fog'],"On the dockside rooftops, the shadows of people bending and turning into wolves against a lit window",{'grade':'cold'}),
(102.7,'flash',[L,A,C],['embers','fog'],"The three brothers on the dock at night, fog and firelight, "+LU+"with purple fire in his hand, Arthas with his bronze-hilted sword, Cedric with his staff, heroic, low angle",{'flicker':0.5}),
(107.2,'cut',[L,A,C],['embers','smoke'],"The three brothers walking through a burning street in pouring rain, fire and flood around them",{'flicker':0.5}),
(111.5,'cut',[],['fog'],"Wolves howling on rocks above the harbour under a huge pale moon",{'grade':'cold'}),
(116.0,'cut',[],['fog'],"The island of Alaron at night from the sea, dark cliffs, scattered town lights, a pale moon",{'grade':'cold'}),
(120.5,'cut',[L,A,C],['sparks'],"Close-up of three hands: Arthas's gauntlet on his sword hilt, Cedric's hand on his staff, Lucien's hand with the faintly blue glowing dagger, crossed together, an oath",{'flicker':0.4}),
(125.3,'cut',[L,A,C],['embers','sparks'],"The three brothers standing together inside a ring of dark purple flame, defiant",{'flicker':0.6}),
(130.5,'fade',[A,C,L],['fog'],DOCK+"the three brothers creeping down the fog-bound alley toward the shack, Arthas first",{'grade':'cold'}),
(137.2,'cut',[L],['dust'],SHACK+LU+"picking up an empty glass vial from the floor, recognising it, dread",{'flicker':0.3}),
(141.8,'cut',[WI,K],['fog'],SHACK+"the wife and two children half-turned, crouched in the dark corner, fur and yellow eyes, fangs, the family changed",{'grade':'cold'}),
(146.5,'flash',[A,WI],['dust','sparks'],SHACK+"Arthas blocking the lunging half-wolf wife with his steel arm, furniture flying",{'shake':0.5}),
(150.7,'cut',[L,WI],['dust'],SHACK+"the half-wolf wife's teeth sinking into "+LU+"'s neck from behind, his face twisted in pain, leave the blood to imagination",{'shake':0.4,'grade':'red'}),
(155.5,'cut',[L],['sparks'],LU+"suddenly floating in a white, cold, silent astral void, stars and drifting stone, alone",{'grade':'cold'}),
(160.2,'cut',[L],['fog'],"Close-up of "+LU+"with his eyes shut, a thin curl of dark mist winding into his ear, whispering",{'grade':'cold'}),
(164.5,'cut',[],['fog'],"In swirling dark mist, two huge yellow wolf eyes and the faint shape of a wolf muzzle, ominous, absolutely no letters, words or text anywhere",{'grade':'cold'}),
(169.2,'cut',[L],['sparks'],"Close-up of Lucien's dagger in his hand humming, its blue glow flickering darker, a faint shadow curling around the blade",{}),
(174.6,'fade',[K],['fog'],SHACK+"two small children tied with rope in a corner, half-turned, frightened yellow eyes, small fangs, still children",{'grade':'cold'}),
(178.7,'cut',[L],['fog'],SHACK+LU+"kneeling alone in the frame with one hand raised, begging the others to wait, no one else visible",{}),
(183.6,'cut',[C],['dust'],SHACK+"Cedric stepping past with his staff swinging, his face cold, the children out of frame in shadow",{'shake':0.3}),
(187.6,'cut',[A,L],['dust'],SHACK+"Arthas striding past "+LU+"without looking at him, not waiting, not hearing",{}),
(192.4,'cut',[K],['dust'],SHACK+"the two children lying still and unconscious on the floor, still tied, only the lantern light",{}),
(196.8,'cut',[L],['dust'],SHACK+LU+"standing with empty hands, appalled, staring, the lantern swinging",{}),
(201.3,'fade',[],['fireflies','fog'],"A sacred Moonwell deep in the forest, a pool of glowing silver water among white stones, druids in green robes in the distance",{'grade':'green'}),
(205.8,'cut',[L],['fog'],DOCK+LU+"alone on the pier looking out into the dark, uncertain",{'grade':'cold'}),
(212.8,'flash',[],[],None,{'img':'s21'}),
(217.6,'cut',[],[],None,{'img':'s22'}),
(222.2,'cut',[],[],None,{'img':'s23'}),
(226.8,'cut',[],[],None,{'img':'s24'}),
(231.2,'cut',[],[],None,{'img':'s25'}),
(235.5,'cut',[],[],None,{'img':'s26'}),
(243.6,'fade',[],['dust'],ROOM+"no people, a single lantern",{'flicker':0.4}),
(248.6,'cut',[AS],['dust'],ROOM+"the Scarlet assassin waiting in the shadows, knives drawn, she knows who they are",{'grade':'red'}),
(253.0,'cut',[AS,A],['sparks'],ROOM+"the Scarlet assassin striking first, her knife sparking off Arthas's armour",{'shake':0.4}),
(257.1,'cut',[C,AS],['dust'],ROOM+"Cedric and the assassin fighting, staff against knives, the room torn apart",{'shake':0.3}),
(261.8,'cut',[AS],['sparks'],ROOM+"a hidden door glowing open in the plain wall, a magic seam of red light, the assassin slipping through",{'grade':'red'}),
(266.5,'cut',[],['dust'],ROOM+"the magic seam closing in the wall, the assassin gone, an empty room",{}),
(270.9,'cut',[],['dust'],"Close-up of a metal sigil on the wooden floor: a blood-red open hand symbol, black goo around it",{'grade':'red'}),
(275.5,'cut',[A,C],['dust'],ROOM+"Arthas and Cedric staring down at the sigil, the hunters' look in their faces: the Scarlet Wizards",{'grade':'red'}),
(280.5,'fade',[L],['dust'],"Close-up of "+LU+"reading a note by lantern light, a rough map on it (no readable text)",{'flicker':0.3}),
(285.2,'cut',[],['fog'],"Wagons loaded with sealed barrels leaking black blood rolling at night toward a distant walled city",{'grade':'cold'}),
(289.7,'cut',[G],['dust'],"Ahm Dynasty guards at a city gate at night pocketing a heavy coin purse and looking away",{'flicker':0.3}),
(294.4,'cut',[],['dust'],"Close-up of gold coins pouring from one gloved hand into another in lantern light",{'flicker':0.3}),
(299.1,'fade',[L],['fog'],LU+"alone at night on the pier, playing a lute, the melody unfinished, eyes far away",{}),
(304.0,'cut',[SE],['fog'],"Severin at the edge of a misty forest at night, watching the town from afar, faint green glow",{'grade':'green'}),
(308.9,'cut',[L],['fog'],"Close-up of "+LU+"with his eyes closed, faint whispering mist around his head, troubled",{'grade':'cold'}),
(318.0,'fade',[WS],['dust'],BASE+"the werewolf Silas asleep in his chains, a guttering candle",{'flicker':0.4}),
(334.0,'fade',[],['fog'],"The thin moon over the foggy dock, black water, silence, no people",{'grade':'cold'}),
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
assert sid('s21')['scene'].startswith('The three brothers on the dock') and sid('s26')['scene'].startswith('The three brothers standing together')
L10=json.load(open('painted/10-ahm-dynasty.json')); L11=json.load(open('painted/11-hunger-grows.json'))
cast={'lucien':L12['cast']['lucien'],'arthas':L12['cast']['arthas'],'cedric':L12['cast']['cedric'],'mara':L12['cast']['mara'],'mother':L12['cast']['mother'],
 'assassin':L10['cast']['assassin'],'guard':L10['cast']['guard'],'severin':L6['cast']['severin'],'silas':L1['cast']['silas'],
 'wolfsilas':"Silas the werewolf, exactly as in the reference painting: the lean dock smuggler turned, a full wolf snout and fangs, coarse dark brown fur, wild glowing yellow eyes, clawed hands, his drab grey-olive patched coat torn to rags; frightening, not comical",
 'wife':"Silas's wife, half-turned werewolf: a thin poor dockside woman in her thirties in a ragged grey dress and shawl, dark tangled hair, her face stretching toward a wolf snout with fangs, coarse fur on her arms and neck, clawed hands, glowing yellow eyes, wild and frightening",
 'kids':"Silas's two small children, a boy and a girl about seven and nine, thin and poor in patched clothes, dark hair, half-turned: small fangs, a little fur on their cheeks and hands, glowing yellow eyes, frightened, still children"}
board={"id":"finding-silas","live":False,'cover':'s21','style':L12['style'],'cast':cast,'shots':shots}
head_={k:v for k,v in board.items() if k!='shots'}
out=json.dumps(head_,ensure_ascii=False,indent=2)[:-2]+',\n  "shots": [\n'+',\n'.join('    '+json.dumps(s,ensure_ascii=False) for s in shots)+'\n  ]\n}\n'
json.loads(out);open('painted/02-finding-silas.json','w').write(out)
ts=[s['t'] for s in shots]
print(len(shots),'shots',sum(1 for s in shots if 'img' not in s),'new','mono',all(a<b for a,b in zip(ts,ts[1:])),'maxhold',round(max(b-a for a,b in zip(ts,ts[1:]+[295.5])),1))
