"""Storyboard generator for Level 11, The Hunger Grows (painted). Pattern: make/12.py.
Run from chronicle/: python painted/make/11.py -> painted/11-hunger-grows.json (overwrites hand edits).
Story (Rasmus's session events, 23/09/2026): down below the Ahm safehouse the brothers find the report on Lucien and proof that Ahm works
with the Scarlet Wizards; potions in a barrel; the door; an ambush; Lucien's smoke bottle, the wizards call him to join them, he refuses
and shoots, seeing in the fog; the brothers fall into a meat grinder, Arthas throws Cedric out; imps on the floor; Arthas throws a wizard
into the grinder and sees Silas, more werewolf than before; Lucien's scroll of Festering Blast frees the levitated Cedric; cone of cold
drops Arthas, Lucien's fireball fails, Cedric pours a healing potion into him; Arthas cleaves the last wizard top to bottom; rest;
the dagger hums, Severin speaks through it, Lucien gives in: it absorbs Silas's curse and his own and grows; drunk on power.
Outro: letters reveal Baphomet's release at Duncastle (mages drawing circles) and the prince held by Ahm; the High Inquisitor
names Lucien Clerical User of Nefarious Tools; to the rescue of the prince.
"""
import json,re
L12=json.load(open('painted/12-fall-duncastle.json')); L6=json.load(open('painted/06-slaying-pig.json')); L1=json.load(open('painted/01-first-steps.json'))
def load_beats(path):
    m = re.search(r'(?:const BEATS|L\.beats) = (\{.*?\});', open(path).read(), re.S)
    return json.loads(m.group(1))
B=load_beats('src/levels/L11-hunger-grows.js')
near=lambda l,t: min(l,key=lambda x:abs(x-t))
def snap(t,k):
    if k not in ('cut','flash') or t==0: return t
    h,r,e=near(B['hits'],t),near(B['bars'],t),near(B['beats'],t)
    return h if abs(h-t)<=0.25 else r if abs(r-t)<=0.2 else e
L,A,C,W,SE,V,BA,S,WS,I,D='lucien','arthas','cedric','wizard','severin','valerys','baphomet','silas','wolfsilas','imp','duncastle'
MOVES=[([0,0,0.04],[0,0,0.2]),([-0.04,0,0.05],[0.04,0,0.12]),([0,0,0.22],[0,0,0.05]),([0.05,0.02,0.02],[-0.04,0,0.12]),([0,0.04,0.02],[0,0,0.18]),([0.03,0,0.08],[-0.03,0,0.16])]
LU="Lucien Vale (long blond hair, pointed ears, burgundy coat) "
CELLAR="in the stone cellars deep below the Ahm safehouse, "
GR="the meat grinder: a huge iron pit under a broken trapdoor in the floor, turning spiked iron rollers and gears at its bottom, "
S_=[
(0,'black',[],['dust'],"A narrow worn stone stair spiralling down into total darkness, a single torch flame far below",{'flicker':0.4}),
(8.4,'fade',[L,A,C],['dust','fog'],"The three brothers descending the narrow stone stair in single file, Arthas first with a torch, "+LU+"in the middle, Cedric last, seen from below, deep shadow",{'flicker':0.5}),
(17.0,'cut',[L],['dust'],CELLAR+"a cramped study, "+LU+"holding up a report with a charcoal sketch of his own face on it, by candlelight, his face hardening (no readable text)",{'flicker':0.4}),
(21.9,'cut',[],['dust'],CELLAR+"a heavy door sealed with chains and wax seals, behind it a desk covered in ledgers and letters, names written in ink, candlelight",{'flicker':0.4}),
(27.0,'cut',[],['dust'],"Tight close-up of two wax seals pressed side by side on one letter: a golden dynasty crest and a blood-red open hand, candlelight, no readable text",{'flicker':0.3}),
(32.1,'cut',[A,C,L],['dust'],CELLAR+"Arthas and Cedric reading over the shoulder of "+LU+", grim faces, the proof in his hands, three-quarter view, staggered",{'flicker':0.4}),
(39.4,'cut',[C],['dust'],CELLAR+"Cedric prying the lid off a barrel stuffed with potion bottles, red and blue glass glinting in torchlight",{'flicker':0.3}),
(43.0,'cut',[L,A,C],[],"Tight close-up of the three brothers exchanging a look in torchlight before a fight, "+LU+"cocky half smile, Cedric's cold eyes, Arthas's burning eye slits",{'flicker':0.4}),
(46.5,'cut',[A],['dust'],"Arthas pushing open a heavy iron-bound door into blackness, his shoulder against it, torchlight spilling in",{}),
(50.0,'fade',[],['fog'],"A vast dark underground hall beyond the door: stone pillars, cold braziers, iron gears and chains hanging from the vaulted ceiling, silence",{'grade':'cold'}),
(56.5,'cut',[W],['fog'],"Red-robed Scarlet Wizards hiding on balconies and behind pillars in the dark hall, fire just kindling in their hands, waiting, an ambush",{'grade':'red','flicker':0.4}),
(61.6,'cut',[L,A,C],['fog'],"The three brothers in the middle of the dark hall, surrounded by glowing red hands in the darkness all around them, "+LU,{'flicker':0.3}),
(66.9,'flash',[L],['smoke'],LU+"smashing a glass bottle at his feet, thick grey smoke billowing out and swallowing the brothers",{'shake':0.2}),
(70.8,'cut',[W],['smoke'],"A Scarlet Wizard at the edge of the smoke, one hand held out in invitation, a sly smile, calling Lucien to join them",{'grade':'red'}),
(74.3,'cut',[L],['smoke'],"Close-up of "+LU+"in thick smoke, eyes glowing faint purple, he can see through it, defiant and fierce: I will not",{}),
(77.4,'cut',[L],['smoke','sparks'],LU+"firing a bolt of purple-white fire through the smoke from his fingertips",{'flicker':0.6}),
(81.2,'flash',[L,A,C],['smoke','sparks'],"The three brothers back to back in swirling smoke, "+LU+"with magic in his hands, Arthas sword raised, Cedric staff ready, heroic, low angle",{'flicker':0.5}),
(85.1,'cut',[W],['smoke','sparks'],"A Scarlet Wizard blind in the smoke, hit in the chest by a purple bolt out of nowhere",{'shake':0.3}),
(89.0,'cut',[A],['smoke','embers'],"Arthas charging out of the smoke, bronze-hilted sword raised, eye slits burning",{'flicker':0.4}),
(95.1,'cut',[L],['smoke','sparks'],"Wide: "+LU+"standing tall in the parting smoke, arm raised with purple fire, laughing, wizards falling back",{'flicker':0.5}),
(99.5,'fade',[W],['embers','smoke'],"Scarlet Wizards throwing fire blindly into the smoke from the balconies, red flames streaking through the hall",{'flicker':0.6}),
(105.5,'cut',[I],['embers'],"Small red-skinned winged imps scuttling across the stone floor out of the dark, claws and teeth, toward the smoke",{'flicker':0.4}),
(112.5,'flash',[A,C],['dust'],"The stone floor giving way under Arthas and Cedric, trapdoor boards splintering, both falling, "+GR,{'shake':0.5}),
(116.6,'cut',[A,C],['dust','sparks'],"Inside "+GR+"Arthas hurling Cedric up and out of the pit with both arms, sparks from the rollers",{'shake':0.3}),
(120.3,'cut',[A,W],['sparks','dust'],"Looking down into "+GR+"Arthas trapped below between the turning rollers, Scarlet Wizards at the rim above shooting fire down at him",{'flicker':0.5}),
(123.8,'cut',[A],['sparks'],"Arthas in the grinder pit bracing his sword against a turning iron roller, sparks flying, enduring",{'shake':0.3}),
(126.6,'cut',[A,W],['sparks','dust'],"Arthas climbing out of the grinder and hurling a Scarlet Wizard headfirst down into it",{'shake':0.4}),
(131.1,'cut',[A,WS],['fog'],"Arthas frozen at the rim of the grinder, looking past it: far behind in the dark hall a hunched half-wolf shape in rags watching from the shadows",{'grade':'cold'}),
(133.7,'cut',[WS],['fog'],"Silas, more wolf than man, chained in the dark: wolf snout and fangs breaking through his human face, grey fur, tattered patched coat, sad human eyes",{'grade':'cold'}),
(137.2,'cut',[L],['fog'],"Close-up of Lucien's hand on the faintly blue glowing dagger at his belt, "+LU+"looking toward Silas",{}),
(140.2,'cut',[L],['smoke'],LU+"unrolling an old scroll and taking aim, the runes on it lighting up sickly yellow-green",{'flicker':0.4}),
(142.4,'flash',[L,W],['ash','smoke'],"FESTERING BLAST: a wave of black and sickly yellow-green necrotic energy bursting from the scroll in Lucien's hands, rolling across the hall at a Scarlet Wizard",{'shake':0.7,'grade':'green'}),
(145.5,'cut',[W],['ash'],"A Scarlet Wizard staggering in the rotting green-black wave, his red robes withering, still on his feet",{'grade':'green','shake':0.3}),
(150.6,'cut',[C],['ash','dust'],"Cedric dropping out of the air where a spell had held him floating, landing in a crouch, free, furious",{}),
(156.1,'cut',[C,I],['dust','sparks'],"Cedric whirling his staff through a swarm of imps, knocking them flying",{'shake':0.3}),
(162.0,'cut',[A,W],['embers','sparks'],"Arthas fighting two Scarlet Wizards at once, fire breaking on his steel, sword swinging",{'flicker':0.5}),
(168.0,'fade',[L,A,C,W],['smoke','embers'],"Wide shot of the battle in the underground hall: smoke, fire, imps, wizards on the balconies, the brothers in the middle, the grinder pit glowing",{'flicker':0.5}),
(174.6,'flash',[A,W],['snow'],"A cone of freezing cold blasting from a wizard's hands into Arthas, frost covering his armour, he falls",{'grade':'cold','shake':0.5}),
(176.8,'cut',[L,W],['embers','smoke'],LU+"turning and throwing a fireball at the last wizard, the fire bursting around him but the wizard still standing in it",{'flicker':0.7}),
(178.9,'cut',[C,A],['snow'],"Cedric kneeling by the frozen Arthas, pouring a red healing potion through his visor",{'grade':'cold'}),
(182.9,'cut',[A,W],['sparks'],"Arthas back on his feet, sword raised high over his head before the last Scarlet Wizard",{'flicker':0.4}),
(186.9,'flash',[A,W],['sparks','embers'],"Arthas's sword coming down top to bottom through the last wizard in one great stroke, a bright arc of light, leave the gore to imagination, epic",{'shake':0.5}),
(190.1,'fade',[L,A,C],['dust'],"The brothers resting against a pillar after the fight, breathing, the hall quiet and smoking, "+LU,{}),
(194.1,'cut',[L,SE],['fog'],"Close-up of Lucien's dagger humming in his hand, its blue glow turning pale green, the faint face of Severin reflected in the blade",{'grade':'green'}),
(197.5,'cut',[L,SE],['fog'],"Severin as a faint ghostly figure behind "+LU+", whispering into his ear, green light, he listens, tempted",{'grade':'green'}),
(201.8,'cut',[L,WS],['fog'],LU+"walking toward the chained half-wolf Silas, dagger in hand",{'grade':'cold'}),
(206.8,'flash',[L,WS],['ash','sparks'],LU+"holding the glowing dagger to the half-wolf Silas, a dark wolf-shaped shadow being torn out of Silas and sucked into the blade",{'shake':0.4,'grade':'green'}),
(210.6,'cut',[S],['fog'],"Silas lying collapsed on the stone floor, human again, exhausted, the fur and fangs gone",{}),
(213.6,'cut',[L],['ash','sparks'],LU+"with his head thrown back, dark mist pulled out of his own chest into the dagger, the blade blazing",{'shake':0.3,'grade':'green'}),
(217.6,'cut',[L],['sparks'],"Close-up of "+LU+"laughing, drunk on power, eyes blazing, the dagger glowing bright in his raised hand",{'flicker':0.4}),
(221.0,'cut',[A,C],['fog'],"Arthas and Cedric watching Lucien from the shadows, uneasy, Cedric's eyes narrowed",{}),
(228.3,'flash',[],[],None,{'img':'s17'}),
(231.8,'cut',[],[],None,{'img':'s18'}),
(235.6,'cut',[],[],None,{'img':'s19'}),
(239.1,'cut',[],[],None,{'img':'s20'}),
(242.9,'fade',[W,D],['fog','sparks'],"Duncastle at night seen from outside, red-robed mages in its courtyard drawing great glowing ritual circles on the stones",{'grade':'red'}),
(246.4,'cut',[BA],['fog'],"The horned face of Baphomet stirring under black water, eyes opening, before dawn",{'grade':'cold'}),
(249.7,'fade',[V,L,A,C],['dust'],"High Inquisitor Valerys in his candlelit chamber reading two letters the brothers have brought, "+LU+"Arthas and Cedric standing before his desk",{'flicker':0.3}),
(252.8,'cut',[V,L],['dust'],"High Inquisitor Valerys pinning a Church sun badge on "+LU+"'s coat, naming him a servant of the Church, Lucien grinning cocky",{'flicker':0.3}),
(257.5,'cut',[L],['fog'],"Extreme close-up of Lucien's dagger in its sheath, glowing hungrily in the dark",{}),
(262.1,'cut',[L],['fog'],LU+"walking alone down a dark corridor, his hand resting on the glowing dagger, a hungry look in his eyes",{}),
(268.0,'fade',[L,A,C],['dust'],"The three brothers riding out of a city gate at dawn, cloaks streaming, to rescue the captured prince",{}),
(280.0,'fade',[L,A,C],['fog'],"The three brothers small on a long road through misty hills at dawn, riding hard",{}),
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
assert [x for x in shots if x['id']=='s17'][0]['scene'].startswith('The three brothers back to back')
cast={'lucien':L12['cast']['lucien'],'arthas':L12['cast']['arthas'],'cedric':L12['cast']['cedric'],'wizard':L12['cast']['wizard'],
 'duncastle':L12['cast']['duncastle'],'severin':L6['cast']['severin'],'valerys':L6['cast']['valerys'],'baphomet':L6['cast']['baphomet'],
 'silas':L1['cast']['silas'],
 'wolfsilas':"Silas half-turned werewolf: the lean dock smuggler more wolf than man, a wolf snout and fangs breaking through his face, coarse grey fur over his arms and neck, clawed hands, hunched, his drab grey-olive patched coat and rope belt in tatters, sad human eyes still there",
 'imp':"an imp: a small red-skinned devil the size of a cat, bat wings, little horns, a barbed tail, clawed hands and feet, yellow eyes, sharp grin"}
board={"id":"hunger-grows","live":False,'cover':'s17','style':L12['style'],'cast':cast,'shots':shots}
head_={k:v for k,v in board.items() if k!='shots'}
out=json.dumps(head_,ensure_ascii=False,indent=2)[:-2]+',\n  "shots": [\n'+',\n'.join('    '+json.dumps(s,ensure_ascii=False) for s in shots)+'\n  ]\n}\n'
json.loads(out);open('painted/11-hunger-grows.json','w').write(out)
ts=[s['t'] for s in shots]
print(len(shots),'shots',sum(1 for s in shots if 'img' not in s),'new','mono',all(a<b for a,b in zip(ts,ts[1:])),'maxhold',round(max(b-a for a,b in zip(ts,ts[1:]+[295.5])),1))
