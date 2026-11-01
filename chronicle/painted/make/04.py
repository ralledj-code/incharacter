"""Storyboard generator for Level 4, Cleansing the First Well (painted). Pattern: make/12.py.
Run from chronicle/: python painted/make/11.py -> painted/10-ahm-dynasty.json (overwrites hand edits).
Story: see src/levels/L04-cleansing-well.js.
"""
import json,re
L12=json.load(open('painted/12-fall-duncastle.json')); L6=json.load(open('painted/06-slaying-pig.json')); L1=json.load(open('painted/01-first-steps.json'))
def load_beats(path):
    m = re.search(r'(?:const BEATS|L\.beats) = (\{.*?\});', open(path).read(), re.S)
    return json.loads(m.group(1))
B=load_beats('src/levels/L04-cleansing-well.js')
near=lambda l,t: min(l,key=lambda x:abs(x-t))
def snap(t,k):
    if k not in ('cut','flash') or t==0: return t
    h,r,e=near(B['hits'],t),near(B['bars'],t),near(B['beats'],t)
    return h if abs(h-t)<=0.25 else r if abs(r-t)<=0.2 else e
L,A,C,SE,P,K,N,W,BA,CU,MW='lucien','arthas','cedric','severin','pig','kalen','neris','wolves','baphomet','cube','moonwell'
MOVES=[([0,0,0.04],[0,0,0.2]),([-0.04,0,0.05],[0.04,0,0.12]),([0,0,0.22],[0,0,0.05]),([0.05,0.02,0.02],[-0.04,0,0.12]),([0,0.04,0.02],[0,0,0.18]),([0.03,0,0.08],[-0.03,0,0.16])]
LU="Lucien Vale (long blond hair, pointed ears, burgundy coat) "
MEM="painted like a faded memory, soft haze, muted colours, "
SWAMP="at the first moonwell (layout as in the reference photo of the tabletop model, painted as a real place at full scale): a vast corrupted dead marsh, a giant gnarled tree on a square raised stone plinth in the middle, straight old cobblestone paths running out from the plinth, two lone square brick gate arches far away on either side of the tree, black goo water and dead reeds, mist, "
VIL="in the square of a small poor village at dusk, thatched houses, "
S_=[
(0,'black',[MW],['fog'],SWAMP+"at night, very wide, no people",{'grade':'cold'}),
(4.7,'fade',[],['fog'],"Pale human skulls half sunk in black swamp water among dead reeds, dozens of them, mist, no living people",{'grade':'cold'}),
(10.0,'cut',[],['fog'],"Skeletons in rotted green druid robes lying beneath the reeds in shallow black water, antler crowns, moss, no living people",{'grade':'cold'}),
(15.2,'cut',[L,A,C,CU],['sparks'],"The three brothers bursting a huge transparent gelatinous cube open with sword, staff and fire, jelly splashing, "+LU+"stumbling out of it gasping",{'shake':0.4}),
(20.6,'cut',[],['fog'],"Faint pale ghostly faces rising out of the black swamp water among dead reeds, whispering, no living people at all",{'grade':'cold'}),
(28.0,'fade',[L,A,C,MW],['fog'],SWAMP+"the three brothers standing on a cobblestone path looking at the skulls around them, "+LU,{'grade':'cold'}),
(35.0,'cut',[],['fog'],"Pale ghosts of druids in antler crowns standing in the mist over the swamp, silent",{'grade':'cold'}),
(42.0,'cut',[P],['smoke'],"A dark silhouette of a huge pig-headed butcher with a broadaxe on a ridge against a red sky, only a shape, a legend",{'grade':'red'}),
(46.6,'cut',[],['smoke'],"Rough armed men with torches wading through black goo at night, poisoning a pool from barrels, faces in shadow",{'grade':'red'}),
(50.2,'cut',[],['fog'],"Close-up of black goo pouring from a barrel into a silver well, the roots of a tree blackening, no people",{'grade':'green'}),
(53.5,'cut',[P],['fog'],"The huge pig-headed butcher walking among druid graves and skulls, broadaxe over his shoulder",{'grade':'red'}),
(56.4,'cut',[L],['fog'],LU+"speaking to a pale druid ghost in the mist",{'grade':'cold'}),
(59.6,'cut',[],['fog'],"A pale druid ghost raising an arm and pointing north into the dark, shadows gathering there",{'grade':'cold'}),
(65.5,'flash',[P,W],['smoke','embers'],SWAMP+"the Pig arriving out of blood-red smoke, three metres tall, pig-headed, covered in blood, broadaxe raised, werewolves behind him",{'grade':'red','shake':0.4}),
(69.4,'cut',[P,K],['smoke'],"The Pig dragging Kalen behind him on a chain, a bloodied paladin bound and stumbling",{'grade':'red'}),
(72.7,'cut',[P],['smoke'],"Close-up of the Pig's bloody snout and tusks, small cruel eyes, a beast in flesh",{'grade':'red'}),
(76.2,'cut',[K],['smoke'],"Close-up of Kalen on his knees in chains, terrified, looking up at someone he knows",{}),
(81.6,'flash',[L,A,C,MW],['embers','sparks'],SWAMP+"the three half-brothers standing together on the plinth before the giant tree as it starts to burn, "+LU+"Arthas sword raised, Cedric staff ready, heroic, low angle",{'flicker':0.6}),
(84.8,'cut',[BA],['fog'],"Deep under black water, the horned face of Baphomet, the Lord of Beasts, his eyes opening, chains of moonlight cracking",{'grade':'cold'}),
(88.5,'cut',[MW],['sparks','fireflies'],SWAMP+"very wide shot: the two plain freestanding grey brick gate arches with flat square tops far on either side of the tree, faint silver runes waking on their bricks, thin beams of silver moonlight reaching across the black water to the tree; no portals, no glowing doorways, no fire, no people",{'grade':'cold'}),
(91.5,'cut',[L,A,C,W],['embers'],"The three half-brothers back to back in firelight, werewolves all around in the dark",{'flicker':0.5}),
(94.9,'cut',[],['fog'],"Old stone faces of sleeping druids carved in a mossy rock, eyes closed, no people",{'grade':'cold'}),
(100.6,'cut',[BA],['fog'],"Black water bubbling and heaving over something huge stirring deep below",{'grade':'cold'}),
(111.5,'cut',[P,MW],['embers'],SWAMP+"the Pig flinching back from the silver healing light pouring from the tree, shielding his eyes, afraid",{'grade':'red','flicker':0.4}),
(114.75,'cut',[MW],['sparks','fireflies'],SWAMP+"healing silver light pouring from the giant tree across the swamp, no people",{'grade':'cold'}),
(118.3,'cut',[W,MW],['embers','fire'],SWAMP+"werewolves running at the tree with lit torches, flames streaming",{'flicker':0.7}),
(121.1,'cut',[L,C,MW],['sparks'],SWAMP+LU+"standing at one brick arch and Cedric at the other far away, both with hands raised, channelling silver light",{'grade':'cold'}),
(124.4,'cut',[L],['sparks'],"Close-up of "+LU+"singing with both palms pressed on the rough grey bricks of an arch's pier, small silver runes glowing under his hands, holding the light; the opening of the arch is plain dark air, not a portal",{'grade':'cold'}),
(127.7,'cut',[A,W,MW],['embers','sparks'],SWAMP+"Arthas cutting through werewolves with torches on a cobblestone path, sparks and fire",{'shake':0.4,'flicker':0.5}),
(136.5,'flash',[MW],['sparks','fireflies'],SWAMP+"the giant tree waking, its branches blazing with silver-white light pouring down, no people",{'grade':'cold','shake':0.3}),
(139.8,'cut',[W,MW],['ash','sparks'],SWAMP+"werewolves caught in the silver light, smoking and burning where they stand",{'grade':'cold','shake':0.3}),
(143.0,'cut',[A,C,W,MW],['sparks'],SWAMP+"Arthas and Cedric breaking the last werewolves",{'shake':0.4}),
(146.2,'cut',[P,MW],['smoke','embers'],SWAMP+"the Pig half dead and bleeding, turning and fleeing into the smoke",{'grade':'red'}),
(149.9,'cut',[A,C,MW],['fog'],SWAMP+"Arthas and Cedric fallen on the cobblestones, unconscious",{}),
(152.7,'cut',[L,A],['fog'],LU+"dragging the armoured Arthas by his cloak across wet cobblestones, exhausted, bleeding",{}),
(155.9,'cut',[L,A,C],['fog'],"The three brothers stumbling through the dark marsh at night, leaning on each other, wounded, "+LU,{'grade':'cold'}),
(159.1,'cut',[],['fog'],"A small village of thatched houses with a few lit windows seen across a dark field at night, no people",{'grade':'cold'}),
(165.5,'flash',[],[],None,{'img':'s18'}),
(168.8,'cut',[],[],None,{'img':'s19'}),
(172.4,'cut',[],[],None,{'img':'s20'}),
(175.2,'cut',[],[],None,{'img':'s21'}),
(179.2,'cut',[],[],None,{'img':'s22'}),
(184.4,'cut',[],[],None,{'img':'s23'}),
(195.1,'fade',[N,L,A,C],['fireflies','fog'],"By a campfire in a dark forest clearing, the druid Neris speaking to the three brothers, "+LU,{'flicker':0.4}),
(201.6,'cut',[BA],['fog'],MEM+"a silver goddess of the moon binding a huge goat-horned beast in chains of moonlight inside ancient rock",{'grade':'cold'}),
(208.0,'cut',[N,L,A,C],['fog'],"Neris leading "+LU+"Arthas and Cedric along a forest path at dusk toward a village",{}),
(211.6,'cut',[N,L],['fog'],"Neris watching "+LU+"curiously as Lucien touches the scar on his neck, the druid's amber eyes narrowed",{}),
(217.7,'cut',[L],['fog'],"Close-up of "+LU+"looking away, a secret kept",{}),
(227.5,'fade',[SE],['fog'],VIL+"a crowd of villagers seen from behind, and at the very back of it a tall pale woman with long silver-white hair and faint green eyes, watching",{'grade':'green'}),
(234.5,'cut',[],['fog'],VIL+"twelve sick villagers roped together before a crowd, a stout mayor in a chain of office beside them, guards with spears",{}),
(240.0,'cut',[L],['fog'],VIL+LU+"climbing up the side of a house onto a thatched rooftop as a voice speaks inside his head, urgent",{'grade':'green'}),
(245.3,'cut',[SE],['fog'],"Close-up of Severin's calm face with mint-green glowing eyes, a faint smile",{'grade':'green'}),
(250.9,'cut',[L],['fog'],VIL+LU+"standing on the ridge of a thatched rooftop at dusk, scanning the crowd in the square below, searching for her",{'grade':'green'}),
(255.7,'cut',[SE],['fog'],"Severin blowing red rose petals from her open palm into the wind over the crowd",{'grade':'green'}),
(262.3,'cut',[],['fog'],VIL+"the twelve roped villagers doubling over as rose petals fall on them, fur and claws starting to break through, the crowd screaming and pulling back",{'grade':'red','shake':0.3}),
(268.7,'cut',[L],['fog'],VIL+LU+"on the rooftop edge, red rose petals blowing past him, searching the dark streets below, the turning twelve far below",{'grade':'red'}),
(277.0,'fade',[L],['fog'],"Seen from behind: "+LU+"crouched on the edge of a thatched rooftop at nightfall, ready to jump down, rose petals in the wind, the village below",{'grade':'cold'}),
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
assert sid('s18')['scene'].startswith(SWAMP+'the three half-brothers') and sid('s23')['scene'].startswith('Black water bubbling')
L10=json.load(open('painted/10-ahm-dynasty.json')); L11=json.load(open('painted/11-hunger-grows.json'))
L3=json.load(open('painted/03-first-moonwell.json')); L8=json.load(open('painted/08-baphomet.json'))
cast={k:L3['cast'][k] for k in ['lucien','arthas','cedric','severin','cube','moonwell']}
cast.update({'pig':L6['cast']['pig'].replace('a huge broadaxe','a huge broadaxe, covered head to toe in blood'),'baphomet':L6['cast']['baphomet'],
 'neris':L8['cast']['neeris'].replace('Neeris','Neris'),
 'kalen':"Kalen, a Church paladin the brothers know: a broad young man in his twenties, short brown hair, a square jaw, dented white-and-steel Church plate with a gold sun emblem, torn white tabard, bloodied and bruised, wrists chained",
 'wolves':"werewolves: hulking grey and brown wolf-men with snouts, fangs, glowing yellow eyes, ragged fur and torn clothes, carrying burning torches"})
board={"id":"cleansing-well","live":False,'cover':'s18','style':L12['style'],'cast':cast,'shots':shots}
head_={k:v for k,v in board.items() if k!='shots'}
out=json.dumps(head_,ensure_ascii=False,indent=2)[:-2]+',\n  "shots": [\n'+',\n'.join('    '+json.dumps(s,ensure_ascii=False) for s in shots)+'\n  ]\n}\n'
json.loads(out);open('painted/04-cleansing-well.json','w').write(out)
ts=[s['t'] for s in shots]
print(len(shots),'shots',sum(1 for s in shots if 'img' not in s),'new','mono',all(a<b for a,b in zip(ts,ts[1:])),'maxhold',round(max(b-a for a,b in zip(ts,ts[1:]+[295.5])),1))
