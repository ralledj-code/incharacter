"""Storyboard generator for Level 9, Saving Cobh (painted). Pattern: make/12.py.
Run from chronicle/: python painted/make/11.py -> painted/10-ahm-dynasty.json (overwrites hand edits).
Story: see src/levels/L09-saving-cobh.js.
"""
import json,re
L12=json.load(open('painted/12-fall-duncastle.json')); L6=json.load(open('painted/06-slaying-pig.json')); L1=json.load(open('painted/01-first-steps.json'))
def load_beats(path):
    m = re.search(r'(?:const BEATS|L\.beats) = (\{.*?\});', open(path).read(), re.S)
    return json.loads(m.group(1))
B=load_beats('src/levels/L09-saving-cobh.js')
near=lambda l,t: min(l,key=lambda x:abs(x-t))
def snap(t,k):
    if k not in ('cut','flash') or t==0: return t
    h,r,e=near(B['hits'],t),near(B['bars'],t),near(B['beats'],t)
    return h if abs(h-t)<=0.25 else r if abs(r-t)<=0.2 else e
L,A,C,M,AL,CR,CW,MY,TR,CO,AR,OM='lucien','arthas','cedric','mara','aldraik','crackle','caroline','mayor','troll','commander','archers','oldman'
MOVES=[([0,0,0.04],[0,0,0.2]),([-0.04,0,0.05],[0.04,0,0.12]),([0,0,0.22],[0,0,0.05]),([0.05,0.02,0.02],[-0.04,0,0.12]),([0,0.04,0.02],[0,0,0.18]),([0.03,0,0.08],[-0.03,0,0.16])]
LU="Lucien Vale (long blond hair, pointed ears, burgundy coat) "
MEM="painted like a faded memory, soft haze, muted colours, "
TAV="in Mara's tavern at night, warm firelight, "
COBH="in Cobh, a harbour town of grey stone and slate roofs by the sea, "
PAWS="in Paws and Pints, a cosy tavern full of cats everywhere (on beams, tables, the bar), warm lamplight, "
LAKE="at the old moonwell of Cobh, the same place as the reference painting of the moon lake (a round lake in a forest clearing ringed by tall standing stones with six heavy iron chains running from the stones down into it), "
SWAMP="at the first moonwell (layout as in the reference photo of the tabletop model, painted as a real place at full scale): a vast corrupted dead marsh, a giant gnarled tree on a square raised stone plinth in the middle, straight old cobblestone paths running out from the plinth, two lone square brick gate arches far away on either side of the tree, black goo water and dead reeds, mist, "
VIL="in the square of a small poor village at dusk, thatched houses, "
S_=[
(0,'black',[],['fire','smoke','embers'],COBH+"burning at night, fire on the rooftops, smoke across the moon, no people close",{'grade':'red','flicker':0.6}),
(9.6,'fade',[CO],['smoke','embers'],"On a burning rooftop above Cobh, the enemy commander raising a great curved war horn to his lips",{'grade':'red','flicker':0.5}),
(19.3,'cut',[],['smoke','embers'],COBH+"a mixed horde of orcs, hulking hairy bugbears and human soldiers in red sashes fleeing back through the burning streets toward the gate",{'grade':'red','flicker':0.5}),
(23.2,'flash',[TR],['smoke','embers'],COBH+"the huge war troll still stomping through a burning street, a club in its fist, hunting",{'grade':'red','shake':0.5,'flicker':0.5}),
(26.3,'cut',[TR,CR,CW],['smoke','embers'],COBH+"Crackle and Caroline trapped against a wall as the troll's shadow falls over them",{'grade':'red','flicker':0.5}),
(30.4,'cut',[L],['smoke','embers'],COBH+LU+"sprinting through the burning street toward them",{'flicker':0.5}),
(33.3,'cut',[L,CW],['dust','embers'],COBH+LU+"tackling Caroline clear of a falling troll club, both rolling across the cobbles",{'shake':0.5}),
(36.3,'cut',[TR,CR],['dust'],COBH+"the troll's club slamming into Crackle, the skinny scholar thrown against the wall",{'shake':0.6,'grade':'red'}),
(39.8,'cut',[TR,CR],['dust'],COBH+"the troll's club crashing into the cobbles a hand's width from the fallen Crackle, a miss",{'shake':0.5}),
(43.2,'cut',[CR],['smoke'],"Close-up of Crackle on the ground, battered, spectacles cracked, still breathing",{}),
(50.5,'fade',[L,A,C,TR],['smoke','embers'],COBH+"the three brothers squaring up to the troll in the burning street, "+LU,{'flicker':0.5}),
(60.3,'cut',[L],['sparks','embers'],"Close-up of "+LU+"'s hands as fire wakes in them, wild and barely held, purple and orange",{'flicker':0.7}),
(63.7,'cut',[L],['sparks','embers'],LU+"straining to hold a growing ball of fire between his hands, a storm",{'flicker':0.8,'shake':0.3}),
(66.9,'flash',[TR,A,C],['fire','embers'],COBH+"a huge fireball exploding around the troll, Arthas and Cedric right beside it in the blast",{'shake':0.7,'flicker':0.9}),
(69.7,'cut',[C],['smoke','embers'],"Cedric rolling out of the flames, smoking and scorched but alive",{'flicker':0.5}),
(73.4,'cut',[A,TR],['sparks'],COBH+"Arthas leaping and swinging his bronze-hilted sword at the troll's bent neck",{'shake':0.4}),
(76.6,'cut',[TR],['smoke','embers'],COBH+"the troll's great body fallen on the cobbles, its head severed and rolled aside, leave the gore to imagination",{'grade':'red'}),
(79.9,'cut',[TR],['smoke'],COBH+"later: the troll's body still lying in the street, smoke drifting, not moving",{}),
(82.7,'cut',[L],['smoke'],"Close-up of "+LU+"staring at the troll's body, uneasy, not content",{}),
(86.3,'cut',[],['smoke','embers'],COBH+"the town guard of Cobh pouring out of the gates with torches and spears, the city waking",{'flicker':0.5}),
(89.8,'cut',[L,A,C],['smoke','embers'],COBH+"the brothers holding a burning street beside the guards, "+LU,{'flicker':0.5}),
(94.1,'flash',[L,A,C],['embers','smoke'],COBH+"the three brothers standing together before a burning gate at night, "+LU+"with fire in his hand, Arthas sword raised, Cedric staff ready, heroic, low angle",{'flicker':0.6}),
(98.3,'cut',[],['ash','embers'],COBH+"ash and embers falling over the burning rooftops of the harbour",{'grade':'red','flicker':0.5}),
(101.3,'cut',[A,C],['embers'],"Arthas and Cedric back to back in the firelight, blades and staff ready",{'flicker':0.5}),
(104.9,'cut',[L],['embers'],"Close-up of "+LU+"singing defiantly, fire in his eyes",{'flicker':0.5}),
(108.2,'cut',[TR],['smoke'],COBH+"the fallen troll in the street under the old night sky, smoke curling",{}),
(114.6,'cut',[],['smoke','embers'],COBH+"the burning harbour seen from the walls, ships and roofs aflame, the war not over",{'grade':'red','flicker':0.5}),
(121.0,'fade',[C],['smoke'],COBH+"a narrow alley full of smoke, Cedric running toward the corner",{}),
(128.3,'cut',[C],['smoke'],COBH+"Cedric turning a corner at full speed",{}),
(131.2,'cut',[C],['smoke'],COBH+"arrows whistling past Cedric's head in the alley, three of them, all missing",{'shake':0.3}),
(134.8,'cut',[C,CO],['smoke'],COBH+"Cedric chasing the enemy commander down a smoky alley",{}),
(137.8,'cut',[AR],['smoke'],COBH+"enemy archers on the rooftops drawing their bows down into the alley",{'grade':'red'}),
(140.8,'cut',[C],['smoke'],COBH+"Cedric pinned against a wall under a rain of arrows",{'shake':0.4,'grade':'red'}),
(144.1,'cut',[C],['dust'],"Cedric falling to one knee, an arrow in his knee, gritting his teeth",{'grade':'red'}),
(147.3,'cut',[CO,AR],['smoke'],COBH+"the commander shouting from a rooftop, his archers' bows all aimed at the fallen Cedric",{'grade':'red'}),
(151.9,'cut',[CO],['smoke'],"Close-up of the commander sneering, crowing his terms",{'grade':'red'}),
(156.2,'cut',[L,A],['smoke'],COBH+LU+"and Arthas lowering their weapons in the alley mouth",{}),
(159.7,'cut',[L,A,C],['smoke'],COBH+"Arthas kneeling by the bleeding Cedric while "+LU+"watches the rooftops",{}),
(163.4,'cut',[CO,AR],['smoke'],COBH+"the commander and his archers walking away along the rooftops, unhurried",{}),
(166.6,'cut',[L],['smoke'],"Close-up of "+LU+"frowning after them: what did they come for",{}),
(169.8,'fade',[],['fog','sparks'],"Outside the walls of Cobh at night, a circle carved into the ground glowing red with runes, no people",{'grade':'red'}),
(173.2,'cut',[],['sparks'],"Close-up of strange glowing runes carved around the circle's edge, no readable text",{'grade':'red'}),
(177.0,'cut',[L,A,C],['fog'],"The three brothers standing at the edge of the glowing rune circle behind the city walls, "+LU+"kneeling to study it",{'grade':'red'}),
(179.8,'cut',[],['fog'],MEM+"red-robed Scarlet Wizards stepping out of a glowing circle, only silhouettes",{'grade':'red'}),
(186.6,'flash',[],[],None,{'img':'s22'}),
(190.1,'cut',[],[],None,{'img':'s23'}),
(193.9,'cut',[],[],None,{'img':'s24'}),
(196.6,'cut',[],[],None,{'img':'s25'}),
(200.7,'cut',[],[],None,{'img':'s26'}),
(206.6,'cut',[],[],None,{'img':'s27'}),
(213.0,'fade',[],['smoke','ash'],COBH+"grey dawn over the smoking ruins, the fires out, quiet, no people close",{}),
(220.0,'cut',[],['ash'],COBH+"townsfolk carrying the wounded and the dead through the ash-grey street",{}),
(226.4,'fade',[OM],['dust'],"A cramped little arcane shop full of trinkets and candles, an old shopkeeper weeping over a brass lantern on the counter",{'flicker':0.4}),
(229.1,'cut',[L,OM],['dust'],"In the arcane shop, "+LU+"handing the brass lantern of revealing across the counter to the old man",{'flicker':0.4}),
(232.8,'cut',[L,OM],['smoke'],"In the arcane shop, "+LU+"passing the old man a long carved pipe with a little pouch of herbs, a sly smile",{'flicker':0.4}),
(235.6,'cut',[OM],['smoke'],"The old shopkeeper puffing on a long pipe in his chair, eyes glazed and drifting, a dreamy silly grin, lazy smoke rings floating around his head, high as a kite",{'flicker':0.4}),
(239.2,'cut',[L,A,C],['dust'],COBH+"by day the three brothers helping the townsfolk rebuild a burned house, lifting beams, "+LU,{}),
(241.9,'cut',[],['dust'],"A road sign pointing inland toward the capital, a long road through hills",{}),
(244.8,'cut',[M],['dust'],"Mara alone behind her bar at night, counting the last of her coins, worried",{'flicker':0.4}),
(247.6,'cut',[AL],['dust'],"Aldraik in his opulent house, smoking a cigar behind a desk heaped with ledgers and gold",{'flicker':0.4}),
(254.3,'cut',[M],['dust'],"Mara gripping the edge of her bar, refusing to leave, stubborn",{'flicker':0.4}),
(257.7,'cut',[L],['dust'],"Close-up of "+LU+"setting his jaw, decided: he will face the merchant king himself",{}),
(260.7,'cut',[],['dust'],"The heavy ornate door of Aldraik's house at night, guards beside it",{'grade':'red'}),
(264.4,'cut',[],['dust'],"Shelves of sealed ledgers and locked boxes in Aldraik's study, secrets, candlelight, no people",{'flicker':0.3}),
(267.8,'cut',[L,M],['dust'],"In Mara's tavern, "+LU+"pressing the last purse of gold into Mara's hands",{'flicker':0.4}),
(270.4,'cut',[],['sparks'],"The rune circle outside Cobh's walls still glowing red in the night",{'grade':'red'}),
(276.7,'cut',[],['fog'],"A thin scarlet thread of light running from the circle into the dark",{'grade':'red'}),
(280.5,'cut',[L],['fog'],LU+"alone at night on Cobh's wall looking out over the dark island",{'grade':'cold'}),
(290.0,'fade',[],['fog','ash'],"Cobh at grey dawn from a hill, smoke rising from the harbour, the island beyond",{}),
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
assert sid('s22')['scene'].startswith(COBH+'the three brothers standing together') and sid('s27')['scene'].startswith(COBH+'the burning harbour')
L10=json.load(open('painted/10-ahm-dynasty.json')); L11=json.load(open('painted/11-hunger-grows.json'))
L7=json.load(open('painted/07-journey-cobh.json'))
cast={k:L7['cast'][k] for k in ['lucien','arthas','cedric','mara','aldraik','crackle','caroline','mayor']}
cast.update({'troll':"a blood troll as in the reference sheet but much bigger, three times a man's height: dark red blood-slick skin, hunched, long arms with claws, a jutting tusked jaw, small burning eyes, ragged black hair, a crude spiked club",
 'commander':"the enemy commander, an orc warlord serving the Scarlet Wizards: a huge grey-green orc with tusks and a scarred face, a topknot of black hair, blackened plate armour with a blood-red Scarlet cloak and sash, a curved war horn at his belt",
 'archers':"the commander's archers, a mixed band of orcs and human soldiers in dark leather with red hoods and sashes, longbows",
 'oldman':"an old shopkeeper of an arcane curio shop: frail, bald with long white side-whiskers, half-moon spectacles, a faded purple robe, grief in his eyes"})
board={"id":"saving-cobh","live":False,'cover':'s22','style':L12['style'],'cast':cast,'shots':shots}
head_={k:v for k,v in board.items() if k!='shots'}
out=json.dumps(head_,ensure_ascii=False,indent=2)[:-2]+',\n  "shots": [\n'+',\n'.join('    '+json.dumps(s,ensure_ascii=False) for s in shots)+'\n  ]\n}\n'
json.loads(out);open('painted/09-saving-cobh.json','w').write(out)
ts=[s['t'] for s in shots]
print(len(shots),'shots',sum(1 for s in shots if 'img' not in s),'new','mono',all(a<b for a,b in zip(ts,ts[1:])),'maxhold',round(max(b-a for a,b in zip(ts,ts[1:]+[295.5])),1))
