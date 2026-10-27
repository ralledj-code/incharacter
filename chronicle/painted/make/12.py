"""Storyboard generator for Level 12, The Fall of Duncastle (painted). Template for the next painted level: copy, rewrite the shot list S_/S.
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
B=load_beats('src/levels/L12-fall-duncastle.js')
near=lambda l,t: min(l,key=lambda x:abs(x-t))
def snap(t,k):
    if k not in ('cut','flash') or t==0: return t
    h,r,e=near(B['hits'],t),near(B['bars'],t),near(B['beats'],t)
    return h if abs(h-t)<=0.25 else r if abs(r-t)<=0.2 else e

L,A,C,M,V,W,G,SE,D='lucien','arthas','cedric','mara','valerys','wizard','giant','serpent','duncastle'
MOVES=[([0,0,0.04],[0,0,0.2]),([-0.04,0,0.05],[0.04,0,0.12]),([0,0,0.22],[0,0,0.05]),([0.05,0.02,0.02],[-0.04,0,0.12]),([0,0.04,0.02],[0,0,0.18]),([0.03,0,0.08],[-0.03,0,0.16])]
MEM="painted like a faded memory, soft warm haze, muted colours, "
S_=[
(0,'black',[D],['embers','smoke'],"Duncastle at night seen from the plain: the fortress on a rise between a black forest and open land, fires burning along its walls, smoke against the stars",{'flicker':0.5}),
(7.7,'fade',[L,A,C,D],['embers','smoke'],"The three brothers silhouetted on top of a burning castle wall at night, flames behind them, seen from below",{'flicker':0.6}),
(12.6,'ink',[SE],['dust','smoke'],"In shadow and dust, the silhouette of a colossal pale serpent rising out of the earth with its jaws open over a small robed figure, only shapes, ominous",{'grade':'red'}),
(24.6,'fade',[],['fog'],"A small harbour town at night, lantern-lit tavern with a warm window, rain-wet cobbles, a quiet street",{'flicker':0.3}),
(35.0,'cut',[L],['dust'],"Lucien Vale reading a stolen document sealed with red wax by candlelight, his face hardening, a woman's name on the page (no readable text)",{'flicker':0.4}),
(42.0,'cut',[M],['dust'],"Mara behind the bar of her tavern, wiping a mug, warm firelight, the last customers gone",{'flicker':0.4}),
(48.9,'cut',[L,M],['dust'],"Lucien Vale handing Mara a heavy leather pouch of gold coins at the tavern's doorstep at night, both serious",{'flicker':0.3}),
(55.7,'cut',[M],[],"Close-up of Mara taking the pouch without a word, her eyes wet but proud, lantern light",{}),
(66.6,'fade',[M],['fog'],"Mara walking away down the night street with a travel pack over her shoulder, not looking back, mist",{}),
(70.2,'cut',[L],['fog'],"Lucien Vale alone in the empty tavern doorway, watching her go, the goodbye with no anger in it, the kind that cuts deepest",{}),
(78.2,'ink',[L,A,C],['fog','dust'],"The three brothers travelling through a dark, wrong-feeling forest by day, twisted trees, an uneasy silence",{'grade':'green'}),
(81.8,'cut',[],['dust'],"In the forest, a wolf and a stag locked together in a savage fight, eyes wild, the animals turned aggressive",{'grade':'green','shake':0.2}),
(85.6,'cut',[A,L,C,D],['dust'],"The gate of Duncastle by day, Church guards in green-and-brown tabards laughing at the brothers as they arrive",{}),
(92.8,'fade',[],['dust'],MEM+"an old woman in a travel cloak at the gate of Duncastle a day earlier, pleading and pointing toward the forest, the guards waving her off",{}),
(99.6,'cut',[],['dust'],MEM+"the old woman walking away from the castle gate into the dusk, alone, small against the walls",{}),
(107.0,'fade',[L,A,C,D],['fog'],"Night over Duncastle, the brothers on the battlements looking out at the black treeline, ballistae on the towers, the red-roofed tower behind them",{}),
(115.0,'cut',[],['embers'],"All along the black treeline, torches igniting one after another in the dark",{'flicker':0.5}),
(118.2,'cut',[],['embers','smoke'],"A thousand torches spread across the plain before the castle, the horde in the dark",{'flicker':0.5}),
(121.4,'cut',[],['embers','dust'],"Orcs with crude shields marching up the road, and hulking hairy bugbears pouring out of the forest edge, torches and axes",{'flicker':0.4}),
(124.9,'cut',[W],['sparks','smoke'],"The Scarlet Wizards in red robes at the front of the army, fire burning in their raised hands, the castle gate before them",{'flicker':0.5}),
(135.5,'flash',[L,A,C,D],['embers','sparks'],"The three brothers on top of the gatehouse tower, Lucien with fire in his raised hand, Arthas with sword, Cedric with staff, defiant, for Alaron",{'flicker':0.5}),
(139.4,'cut',[A],['embers'],"Arthas the paladin on the battlements raising his bronze-hilted sword, a Church banner snapping in the fire-wind",{'flicker':0.4}),
(143.1,'cut',[C],['embers'],"Cedric the monk leaping onto the castle wall with his staff, fury in his face, sparks around him",{'flicker':0.4}),
(146.5,'cut',[D],['embers','smoke'],"Wide shot: Duncastle holding against the horde, ballista bolts flying from the towers, fire everywhere below the walls",{'flicker':0.5}),
(151.0,'fade',[D],['smoke'],"A ballista on a square castle tower firing a huge bolt into the dark, the crew reloading",{'flicker':0.4}),
(158.0,'cut',[],['embers','dust'],"Orcs with ladders charging the stone walls under a rain of arrows, fire and smoke",{'flicker':0.5,'shake':0.2}),
(165.3,'cut',[L],['embers','sparks'],"Lucien Vale on the wall dropping a huge fireball into a column of orcs below, the blast lighting up the night",{'flicker':0.7,'shake':0.3}),
(168.8,'cut',[],['embers','smoke'],"Civilians running for the castle gate in the firelight, orcs chasing them, chaos",{'flicker':0.5}),
(179.2,'ink',[],['dust','smoke'],"An enemy siege ballista on wheels rolling toward the castle's forest gate, pushed by orcs",{}),
(182.8,'cut',[C],['dust'],"Cedric sprinting across the field with a barrel of black powder under his arm, toward the enemy ballista",{}),
(186.0,'cut',[L],['sparks'],"Lucien Vale firing a scorching ray of fire from his fingertips at a fuse",{'flicker':0.6}),
(189.5,'flash',[],['sparks','embers','smoke'],"The enemy siege ballista exploding in a huge ball of fire, splinters flying",{'shake':0.6}),
(193.1,'cut',[C],['embers','smoke'],"Cedric standing in the burning wreck of the ballista, defenders cheering on the walls behind him, Cedric the ballista slayer",{'flicker':0.5}),
(213.8,'ink',[G],['dust','smoke'],"Out of the smoke, an enormous chained giant lumbering forward, goblins riding on its neck holding chain reins",{'shake':0.3}),
(217.0,'cut',[G,D],['dust'],"The chained giant charging the castle gate, smashing carts and barricades in its path",{'shake':0.4}),
(220.8,'cut',[L],['sparks'],"Lucien Vale hurling a glowing green sphere of acid from his fingertips",{}),
(224.2,'cut',[G],['smoke'],"A green acid cloud bursting around the giant's head and neck, the goblin handlers falling away as dark shapes",{'grade':'green'}),
(234.6,'cut',[G],['dust','smoke'],"The giant staggering blind and roaring, still massive, swinging at nothing",{'shake':0.4}),
(245.1,'cut',[C,G],['dust'],"Cedric leaping down from the castle wall onto the giant, staff raised for a blow",{}),
(248.7,'cut',[A],['sparks'],"Arthas drawing his bronze-hilted sword, the blade bursting into holy flame",{'flicker':0.6}),
(252.3,'flash',[A,G],['sparks','embers'],"Arthas's flaming sword cutting the giant down in one great stroke, fire trailing the blade, epic",{'shake':0.5}),
(262.0,'cut',[A,G],['embers','smoke'],"Arthas standing before the fallen giant at the castle gate, flaming sword lowered, defenders on the walls hailing him",{'flicker':0.4}),
(268.0,'fade',[D],['embers','smoke'],"The forest-side tower of the castle broken open and the stables beside it ablaze, bugbears falling back from the flames",{'flicker':0.7}),
(279.5,'ink',[D],['fog'],"A thick unnatural fog pouring out of the forest and rolling over the castle walls at night",{'grade':'cold'}),
(283.3,'cut',[W],['fog'],"A Scarlet Wizard sorcerer in the fog vanishing in a swirl of mist, gone from sight",{'grade':'cold'}),
(287.2,'cut',[D],['dust','smoke'],"The castle walls breaking inward, stones tumbling, the horde pushing through the breach in the fog",{'shake':0.4}),
(294.9,'fade',[A],['dust'],"Arthas pulling a small glowing holy crystal from his coat in the chaos",{}),
(301.8,'cut',[A],['sparks'],"Close-up: Arthas breaking the crystal between his gauntleted palms, light spilling between his fingers, whispering a prayer to Tyr",{}),
(310.9,'cut',[A],['sparks'],"Out of the glowing crystal shards, the faint face of High Inquisitor Valerys in the light answering, Arthas staring into it",{}),
(316.1,'cut',[A],['embers'],"Arthas shouting into the light of the shards, the castle burning behind him",{'flicker':0.5}),
(327.5,'cut',[D],['fog','dust'],None,{'img':'s47'}),
(335.0,'flash',[D],['sparks'],"A blinding beam of light cutting down through the fog into the castle courtyard, burning everything in its path",{'shake':0.4}),
(342.0,'cut',[V],['sparks','smoke'],"A tall armoured figure inside the blinding light in the courtyard, only a silhouette, not the man they expected",{}),
(345.5,'cut',[V],['embers','smoke'],"Oathbreaker Valerys revealed: the High Inquisitor corrupted, blackened and cracked armour, a cold dark fire burning around him, his face hard and cold",{'grade':'cold'}),
(350.0,'cut',[],['embers','sparks'],None,{'img':'s21'}),
(353.9,'cut',[],['embers','smoke'],None,{'img':'s24'}),
(359.8,'cut',[V],['ash','embers'],"Oathbreaker Valerys burning a path through the castle courtyard, enemies turning to ash around him",{'flicker':0.5}),
(366.6,'cut',[V],['ash','sparks'],"The legion commander of the Scarlet Wizards, a tall man in ornate red robes, bursting apart in a flash of cold light before Valerys, leave the gore to imagination",{'shake':0.5}),
(373.4,'cut',[L,A,C],['dust'],"The courtyard ground cracking and heaving under the brothers' feet, stones jumping",{'shake':0.5}),
(376.8,'cut',[SE],['dust','smoke'],"A colossal pale serpent bursting up out of the mud of the courtyard",{'shake':0.5}),
(383.0,'cut',[SE,V],['dust'],"The giant serpent swallowing Oathbreaker Valerys and dragging him down into the earth",{'shake':0.4}),
(393.4,'fade',[L,A,C],['dust','fog'],"The three brothers staring at the closed, broken ground of the courtyard where the serpent vanished, is he gone",{}),
(401.0,'fade',[D],['smoke','ash'],"Duncastle at grey dawn, smoke rising from its broken walls, silent",{}),
]
shots=[];mv=0
for i,(t,tr,who,fx,scene,ex) in enumerate(S_):
    m=MOVES[mv%len(MOVES)];mv+=1
    if 'img' in ex: m=([-m[0][0],m[0][1],m[0][2]],[-m[1][0],m[1][1],m[1][2]])
    d={'id':'s%02d'%(i+1),'t':round(snap(t,tr),2),'in':tr,'who':who,'fx':fx}; d.update(ex); d['move']={'from':m[0],'to':m[1]}
    if scene: d['scene']=scene
    shots.append(d)
byscene=lambda p:[s['id'] for s in shots if s.get('scene','').startswith(p)][0]
imgs={'s47':byscene('The castle walls breaking inward'),'s21':byscene('The three brothers on top of the gatehouse'),'s24':byscene('Wide shot: Duncastle holding')}
for s in shots:
    if 'img' in s: s['img']=imgs[s['img']]
cast={'lucien':L1['cast']['lucien'],'arthas':L1['cast']['arthas'],'cedric':L1['cast']['cedric'],
 'mara':"Mara, Lucien's only real friend: a strong, curvy, attractive barkeep in her thirties, broad shoulders and strong arms, thick auburn hair tied back, freckles, warm confident eyes, rolled-up linen sleeves, a leather apron and laced bodice, a tavern woman who can throw a drunk out by herself",
 'valerys':"Oathbreaker Valerys, the High Inquisitor fallen: a tall man in his sixties, close-cropped grey hair and short grey beard, hard pale grey eyes, his white and crimson inquisitor robes and gold sun emblem blackened and cracked, dark corrupted plate beneath, a cold dark fire and pale light burning around him",
 'wizard':"a Scarlet Wizard: a gaunt sorcerer with a shaved head covered in red arcane tattoos, layered blood-red robes with gold trim, cold eyes, fire or mist curling from his hands",
 'giant':"the chained giant: an enormous ogre-like brute four times a man's height, grey warty skin, small eyes, heavy iron chains and shackles on its limbs and neck, goblins in leather riding on its shoulders holding chain reins",
 'serpent':"the serpent: a colossal pale worm-like serpent rising from the earth, ridged grey-white hide, a huge round mouth ringed with teeth, dirt and stones falling from it",
 'duncastle':"Duncastle, the Church's fortress between the forest and the plains: grey stone curtain walls with crenellations, square towers with ballistae on top, a tall timber-framed tower with a red tiled roof in the courtyard, wooden palisades, stables with a red roof"}
board={"id":"fall-duncastle","live":True,'cover':imgs['s21'],'style':L1['style'],'cast':cast,'shots':shots}
head_={k:v for k,v in board.items() if k!='shots'}
out=json.dumps(head_,ensure_ascii=False,indent=2)[:-2]+',\n  "shots": [\n'+',\n'.join('    '+json.dumps(s,ensure_ascii=False) for s in shots)+'\n  ]\n}\n'
json.loads(out);open('painted/12-fall-duncastle.json','w').write(out)
ts=[s['t'] for s in shots]
print(len(shots),'shots',sum(1 for s in shots if 'img' not in s),'new; reuse',[(s['id'],s['img']) for s in shots if 'img' in s],'mono',all(a<b for a,b in zip(ts,ts[1:])),'maxhold',round(max(b-a for a,b in zip(ts,ts[1:]+[411])),1))
