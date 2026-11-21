"""Storyboard generator for Level 14, The Hunt for Valerys (painted). Pattern: make/13.py. Run from chronicle/: python painted/make/14.py
Story: see src/levels/L14-hunt-valerys.js. The flower of teeth and the well-keepers are painted from Rasmus's miniature photos (keep-look sheets)."""
import json,re
def load_beats(path):
    m = re.search(r'(?:const BEATS|L\.beats) = (\{.*?\});', open(path).read(), re.S)
    return json.loads(m.group(1))
B=load_beats('src/levels/L14-hunt-valerys.js')
near=lambda l,t: min(l,key=lambda x:abs(x-t))
def snap(t,k):
    if k not in ('cut','flash') or t==0: return t
    h,r,e=near(B['hits'],t),near(B['bars'],t),near(B['beats'],t)
    return h if abs(h-t)<=0.25 else r if abs(r-t)<=0.2 else e
L,A,C,V,SE,W1,DR,BA,FL,RE='lucien','arthas','cedric','valerys','serpent','wittan','drow','baphomet','flower','reaper'
ALL=[L,A,C,DR,W1]
MOVES=[([0,0,0.04],[0,0,0.2]),([-0.04,0,0.05],[0.04,0,0.12]),([0,0,0.22],[0,0,0.05]),([0.05,0.02,0.02],[-0.04,0,0.12]),([0,0.04,0.02],[0,0,0.18]),([0.03,0,0.08],[-0.03,0,0.16])]
LU="Lucien Vale (long blond hair, pointed ears, burgundy coat) "
NE="Nerrissa (the drow woman: dark purple-grey skin, long white hair) "
ONLY=", exactly these people and no one else"
MEM="painted like a faded warm memory, soft golden haze, muted colours, "
DEEP="deep underground in the Down Deep, a lightless world of caverns, rock ceilings, no sky, painted as a real place at full scale (not a tabletop, not miniatures), "
NEST=DEEP+"in a small carved stone room in Thorman's camp, sleeping furs on the floor, a dying ember fire, warm amber light, "
TUN=DEEP+"in a narrow winding rock tunnel lit only by their torches, "
FUN=DEEP+"in a cavern of pale limestone ledges overgrown with huge glowing shelf fungi in yellow, purple and orange, tall twisted rock spires, warm amber light from glowing mushroom caps, "
WELL=DEEP+"in a deep cavern around an ancient ruined moonwell of carved stone filled to the brim with black blood, thick grey webs on every wall, cold blue light, "
VEIL="A vision beyond a torn veil of dark light: a bottomless underground abyss, "
GREAT=DEEP+"in a massive cavern, its floor torn and cracked, rubble everywhere, a high rock ceiling lost in darkness, "
S_=[
(0,'black',[],['dust'],DEEP+"a vast black cavern, one tiny warm glow far below, no people",{'grade':'cold'}),
(3.81,'fade',[L,DR],['dust'],NEST+LU+"asleep on the furs with "+NE+"curled against him, ember glow"+ONLY,{'flicker':0.3}),
(8.37,'cut',[],['dust'],DEEP+"a single glowing amber mushroom blooming in total darkness, a light where no light should grow, no people",{}),
(14.35,'cut',[L,DR],['dust'],NEST+"close-up of Nerrissa's dark purple-grey arms wrapped around Lucien's chest, his hand on hers"+ONLY,{'flicker':0.3}),
(20.77,'cut',[SE],['dust'],DEEP+"far away in a colossal cavern the coiled silhouette of the pale worm-like serpent, waiting, foreboding",{'grade':'cold'}),
(25.5,'fade',[],['dust'],DEEP+"Thorman's camp at night, a half-abandoned underground town of carved stone houses, the last campfires burning low, no people",{}),
(31.0,'cut',[DR],['dust'],NEST+"close-up of Nerrissa asleep, peaceful, white hair across the furs, ember light on her face",{'flicker':0.3}),
(36.5,'cut',[L],['dust'],NEST+"close-up of "+LU+"lying awake, gently watching her, a soft smile",{'flicker':0.3}),
(42.0,'cut',[],['dust'],NEST+"the dying embers of a small fire, warm light in the dark, no people",{'flicker':0.4}),
(47.63,'fade',[L,DR],['dust'],NEST+LU+"waking in "+NE+"arms under the furs, both warm and close, tender"+ONLY,{'flicker':0.3}),
(51.94,'cut',[],['dust'],NEST+"the first soft light: a glowing amber mushroom lamp brightening in the stone doorway, no people",{}),
(56.22,'cut',[L],['dust'],NEST+"close-up of "+LU+"smiling softly, eyes tender, in love for the first time in years",{'flicker':0.3}),
(59.82,'cut',[L,DR],['dust'],NEST+LU+"holding Nerrissa close, his face in her white hair, his eyes worried"+ONLY,{'flicker':0.3}),
(63.14,'cut',[L],['dust'],NEST+LU+"sitting up and looking away into the dark doorway, knowing it cannot last",{}),
(66.16,'cut',[L,DR],['dust'],NEST+"Nerrissa tracing Lucien's face with her fingers, he closes his eyes and lets it be"+ONLY,{'flicker':0.3}),
(69.5,'fade',ALL,['dust'],DEEP+"in Thorman's camp, the party packing their gear by torchlight: "+LU+", Arthas, Cedric, Nerrissa and Wittan the deep gnome"+ONLY,{'flicker':0.3}),
(75.0,'cut',[W1],['dust'],TUN+"Wittan the deep gnome holding up a lantern and pointing down a dark tunnel",{}),
(80.5,'cut',[A],['embers'],DEEP+"Arthas, hood up, drawing his longsword, its blade glowing orange in the dark",{}),
(86.0,'cut',[C],['dust'],DEEP+"Cedric tightening his hand wraps, cold pale eyes, ready",{}),
(91.5,'cut',[DR],['dust'],DEEP+"Nerrissa the drow testing her two curved silver blades, a sly smile",{}),
(96.0,'cut',ALL,['dust'],DEEP+"the party stepping into a black tunnel mouth, seen from behind, torches raised"+ONLY,{'flicker':0.4}),
(100.54,'fade',[SE,V],['dust'],MEM+"the colossal pale serpent dragging Oathbreaker Valerys in blackened armour down into the cracked ground",{'grade':'cold'}),
(104.0,'cut',[L,A,C],['dust'],TUN+"the three brothers walking down a long sloping tunnel, torches"+ONLY,{'flicker':0.4}),
(107.39,'cut',[DR],['dust'],TUN+"Nerrissa leading, crouched low, scanning the dark, a hunter",{'flicker':0.3}),
(110.91,'cut',[W1],['dust'],TUN+"Wittan the deep gnome with his ear to the rock wall, listening to the unseen",{}),
(114.19,'cut',[L,A,C],['dust'],TUN+"the tunnel narrowing tight, the brothers squeezing through sideways, torches burning thin"+ONLY,{'flicker':0.5}),
(117.65,'cut',ALL,['dust'],DEEP+"a long line of tiny torches marching across a huge dark cavern seen from far away"+ONLY,{}),
(124.06,'flash',[L,A,C],['embers'],DEEP+"heroic shot: the three brothers standing back to back in a dark cavern, Arthas's sword burning orange, purple wild fire in Lucien's hand, Cedric with his staff"+ONLY,{'shake':0.2}),
(127.46,'cut',[L,A,C],['embers'],DEEP+"the three brothers as silhouettes against a glowing fungus cavern, standing together"+ONLY,{}),
(130.86,'cut',[L,A],['embers'],DEEP+"close-up of Lucien's hand crackling with purple-orange sparks next to Arthas's gauntlet gripping his glowing sword"+ONLY,{}),
(134.24,'cut',[L,A,C],['embers'],DEEP+"the three brothers on a rock ledge above a vast black chasm, holding the line"+ONLY,{}),
(141.3,'cut',[FL],['embers'],FUN+"the flower of teeth rising out of the darkness ahead, flames in its four claws, spines bristling",{'flicker':0.4}),
(144.82,'cut',[FL],['embers'],FUN+"close-up of the monster's huge round fanged mouth ringed with fiery yellow-orange petals, grey spines behind",{'flicker':0.4}),
(148.19,'cut',[FL,L],['embers'],FUN+"the flower of teeth leaning over "+LU+", speaking to him, its petals trembling"+ONLY,{'flicker':0.4}),
(152.42,'cut',[L],['embers'],FUN+"close-up of a drop of blood falling from Lucien's cut palm into the glow",{}),
(158.13,'fade',[L,FL],['embers'],FUN+LU+"stepping forward alone, eyes closed, offering himself to the flower of teeth"+ONLY,{'flicker':0.3}),
(161.81,'cut',[L,FL],['sparks'],FUN+"pale threads of light reaching from the monster's mouth into Lucien's head, his face strained"+ONLY,{'flicker':0.4}),
(165.14,'fade',[],['dust'],MEM+"a sunlit room long ago, a man seen only from behind playing a silver flute for a small blond half-elf boy, the man's face never shown",{}),
(168.99,'cut',[],['dust'],MEM+"close-up of a grown man's hands guiding a small boy's fingers on a silver flute, the man's face out of frame",{}),
(172.38,'cut',[L,FL],['sparks'],FUN+LU+"with tears in his eyes, wonder on his face, a glowing memory hanging in the air between him and the monster"+ONLY,{}),
(175.78,'cut',[],['dust'],MEM+"golden music notes swirling in the air as the faceless man walks away into bright light, seen from behind",{}),
(179.09,'cut',[FL,L],['sparks'],FUN+"the threads of light snapping and fraying apart, the flower of teeth recoiling, Lucien free"+ONLY,{'shake':0.3}),
(182.48,'cut',[L,A,C],['embers'],FUN+LU+"turning to Arthas and Cedric with fierce eyes"+ONLY,{}),
(186.78,'flash',[L],['embers'],FUN+"close-up of "+LU+"shouting with his arm thrust forward, wild purple fire flaring",{'shake':0.4}),
(188.91,'flash',[A,C,FL],['embers'],FUN+"Arthas and Cedric charging the flower of teeth"+ONLY,{'shake':0.3}),
(192.27,'cut',[DR,FL],['embers'],FUN+"Nerrissa leaping over the monster with her silver blades flashing"+ONLY,{'shake':0.2}),
(195.65,'cut',[L,FL],['embers'],FUN+LU+"hurling purple-orange wild fire at the flower of teeth"+ONLY,{'shake':0.2}),
(199.44,'cut',[A,FL],['embers'],FUN+"Arthas's burning orange sword slashing across the monster's spines"+ONLY,{'shake':0.2}),
(203.5,'cut',[W1],['embers'],FUN+"Wittan the deep gnome hiding behind a rock spire, peeking out",{}),
(207.5,'cut',[FL,A,C],['embers'],FUN+"the flower of teeth whirling its four flaming arms at Arthas and Cedric"+ONLY,{'shake':0.2}),
(211.5,'cut',[L,A,C,DR,FL],['embers'],FUN+"wide shot of the battle in the fungus cavern, fire and spores in the air"+ONLY,{}),
(215.39,'flash',[L,FL],['sparks'],FUN+"a pale dazing ray shooting from the monster's mouth straight into Lucien's chest"+ONLY,{'shake':0.5}),
(219.15,'cut',[L,A],['dust'],FUN+"Lucien on the ground, Arthas kneeling over him with glowing golden hands on his chest, laying on hands"+ONLY,{}),
(222.9,'cut',[A,FL],['embers'],FUN+"Arthas throwing a rope around the flower of teeth and hauling it down toward the ground"+ONLY,{'shake':0.2}),
(226.13,'cut',[C,FL],['embers'],FUN+"Cedric standing on the slain flower of teeth's back, smug, the kill stolen again"+ONLY,{}),
(229.79,'cut',[L],['sparks'],TUN+"close-up of Lucien's dagger glowing blue and humming, vibrating in his hand",{}),
(233.07,'cut',[BA],['ash'],MEM+"the shadow of great curved horns falling across a stone floor",{'grade':'cold'}),
(236.78,'fade',[],['dust'],WELL+"no people",{'grade':'cold'}),
(239.46,'cut',[RE],['dust'],WELL+"the well-keepers in the webs, single silver eyes glowing in the dark, sickles raised",{'grade':'cold'}),
(244.96,'cut',[DR,RE],['dust'],WELL+"Nerrissa dancing through the well-keepers, her silver blades flashing, graceful and fast"+ONLY,{'shake':0.2,'grade':'cold'}),
(248.38,'cut',[L],['dust'],WELL+"close-up of "+LU+"watching her fight, love and sadness in his eyes",{'grade':'cold'}),
(251.89,'cut',[C,RE],['dust'],WELL+"Cedric cutting down a well-keeper with his staff"+ONLY,{'shake':0.2,'grade':'cold'}),
(255.49,'cut',[L,RE],['sparks'],WELL+LU+"raising his glowing dagger over a fallen well-keeper, dark smoke flowing into the blade"+ONLY,{'grade':'cold'}),
(259.33,'fade',[],['ash'],VEIL+"a veil of dark shimmering light tearing open, no people",{'grade':'cold'}),
(262.88,'cut',[BA],['ash'],VEIL+"Baphomet, enormous, chained in the abyss, goat head bowed, huge chains in every direction",{'grade':'cold'}),
(266.59,'cut',[BA],['ash'],VEIL+"one last glowing chain holding Baphomet, rising up to a moonwell far above",{'grade':'cold'}),
(269.92,'cut',[V,SE],['embers'],VEIL+"far above the chains, bloodied Oathbreaker Valerys with a golden sword fighting the colossal pale serpent on a ledge",{'shake':0.2}),
(273.6,'cut',[BA],['ash'],VEIL+"the last chain straining and cracking, sparks",{'shake':0.3,'grade':'cold'}),
(278.13,'cut',[BA],['ash'],VEIL+"close-up of Baphomet's face smiling, burning yellow eyes looking straight at the viewer",{'grade':'cold'}),
(281.5,'fade',[L,DR],['dust'],WELL+LU+"snapping out of the vision, gasping, Nerrissa holding him"+ONLY,{'grade':'cold'}),
(287.0,'cut',[W1,L],['dust'],WELL+"Wittan the deep gnome nodding and pointing the way, Lucien urging him"+ONLY,{'grade':'cold'}),
(292.5,'cut',ALL,['dust'],TUN+"the party running through the caves, torches streaming"+ONLY,{'flicker':0.4}),
(298.0,'cut',[L,A],['dust'],TUN+"Arthas half carrying an exhausted Lucien, running"+ONLY,{'flicker':0.4}),
(303.5,'cut',ALL,['dust'],DEEP+"tiny torches crossing a narrow stone bridge over a bottomless chasm, seen from far"+ONLY,{}),
(308.64,'fade',[V],['dust'],GREAT+"Oathbreaker Valerys, armour torn to pieces, badly wounded, on one knee, his golden sword in the rubble",{}),
(312.38,'cut',[SE,V],['dust'],GREAT+"the wounded colossal pale serpent rearing overhead, Valerys tiny below"+ONLY,{'shake':0.3}),
(315.76,'flash',[SE],['dust'],GREAT+"the serpent diving down into the rock floor, rubble exploding, no sound",{'shake':0.5}),
(319.15,'cut',[L,A,C,DR,W1,V],['dust'],GREAT+"the brothers, Nerrissa and Wittan beside the wounded Valerys, weapons ready, staring at the cracked floor, waiting"+ONLY,{}),
(325.71,'cut',[],[],None,{'img':'s28'}),
(329.44,'cut',[],[],None,{'img':'s29'}),
(332.5,'cut',[V,A,C],['dust'],GREAT+"Valerys looking at Arthas and Cedric, grim, bloodied"+ONLY,{}),
(338.94,'fade',[BA],['ash'],"Out of total darkness, only Baphomet's burning yellow eyes, close, watching",{'grade':'cold'}),
(344.5,'cut',[],['dust'],GREAT+"the cracked cave floor trembling, dust dancing on the stones, no people",{'shake':0.15}),
(351.0,'fade',[L,A,C],['dust'],GREAT+"the three brothers tiny in the vast dark cavern, one torch, waiting"+ONLY,{}),
]
shots=[];mv=0
for i,(t,tr,who,fx,scene,ex) in enumerate(S_):
    m=MOVES[mv%len(MOVES)];mv+=1
    if 'img' in ex: m=([-m[0][0],m[0][1],m[0][2]],[-m[1][0],m[1][1],m[1][2]])
    d={'id':'s%02d'%(i+1),'t':round(snap(t,tr),2),'in':tr,'who':who,'fx':fx}; d.update(ex); d['move']={'from':m[0],'to':m[1]}
    if scene: d['scene']=scene
    shots.append(d)
for s in shots:
    if 'img' in s:
        o=[x for x in shots if x['id']==s['img']][0]; s['who']=o['who']; s['fx']=o['fx']
sid=lambda k:[x for x in shots if x['id']==k][0]
assert 'heroic shot' in sid('s28')['scene'] and 'silhouettes' in sid('s29')['scene']
board=json.load(open('painted/14-hunt-valerys.json')); board['cover']='s28'; board['shots']=shots
head_={k:v for k,v in board.items() if k!='shots'}
out=json.dumps(head_,ensure_ascii=False,indent=2)[:-2]+',\n  "shots": [\n'+',\n'.join('    '+json.dumps(s,ensure_ascii=False) for s in shots)+'\n  ]\n}\n'
json.loads(out);open('painted/14-hunt-valerys.json','w').write(out)
ts=[s['t'] for s in shots]
print(len(shots),'shots',sum(1 for s in shots if 'img' not in s),'new','mono',all(a<b for a,b in zip(ts,ts[1:])),'maxhold',round(max(b-a for a,b in zip(ts,ts[1:]+[361])),1))
