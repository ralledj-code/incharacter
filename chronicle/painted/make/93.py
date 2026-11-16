"""Storyboard generator for Funky, Flunky og Lonky (hidden family song). Run from chronicle/: python painted/make/93.py
Oskar, Walter, farmor, farfar and Chester come from private family photos (cast/ref-*.jpg, gitignored, never committed); Max reuses his sheet from 90-tine-max."""
import json,re
def load_beats(path):
    m = re.search(r'(?:const BEATS|L\.beats) = (\{.*?\});', open(path).read(), re.S)
    return json.loads(m.group(1))
B=load_beats('src/levels/L93-funky.js')
near=lambda l,t: min(l,key=lambda x:abs(x-t))
def snap(t,k):
    if k not in ('cut','flash') or t==0: return t
    h,r,e=near(B['hits'],t),near(B['bars'],t),near(B['beats'],t)
    return h if abs(h-t)<=0.25 else r if abs(r-t)<=0.2 else e
OS,WA,MX,FM,FF,CH,FU,FL,LO,DI,RO='oskar','walter','max','farmor','farfar','chester','funky','flunky','lonky','dino','robot'
TR=[FU,FL,LO]; KIDS=[OS,WA,MX]
MOVES=[([0,0,0.04],[0,0,0.16]),([-0.04,0,0.05],[0.04,0,0.1]),([0,0,0.18],[0,0,0.05]),([0.04,0.02,0.02],[-0.03,0,0.1]),([0,0.03,0.02],[0,0,0.14])]
M="in a big sunny autumn meadow behind a cosy red Danish farmhouse with white window frames, a golden beech forest edge, fallen leaves, "
H="in front of the cosy red Danish farmhouse with white window frames, at its little front porch with stone steps, autumn leaves, "
TRS="the three troll girls (Funky with orange hair puffs, Flunky with a purple bun, tall Lonky with long green hair) "
ONLY=", exactly these characters and no one else"
NP=", no people, no animals"
S_=[
(0,'black',[],['dust'],M+"early morning light, mist over the grass, the red farmhouse in the distance"+NP,{}),
(6.91,'flash',TR,['dust'],M+TRS+"leaping out of the forest edge shouting hey, arms up"+ONLY,{'shake':0.2}),
(10.0,'cut',[OS,WA],['dust'],H+"Oskar and his big brother Walter bursting out of the farmhouse door, shouting"+ONLY,{}),
(14.54,'flash',TR+KIDS[:2]+[CH],['dust'],M+"Oskar, Walter, the golden dog Chester and "+TRS+"running together onto the meadow, leaves flying"+ONLY,{'shake':0.2}),
(18.6,'cut',TR,['dust'],M+TRS+"stomping a wild dance in a row, big bare feet, leaves bouncing"+ONLY,{}),
(23.5,'cut',[CH,OS],['dust'],M+"the golden dog Chester bouncing around little Oskar, barking happily"+ONLY,{}),
(28.98,'cut',[FU],['dust'],M+"close-up of Funky the troll girl with wild orange hair puffs, grinning and waving",{}),
(30.6,'cut',[FL,LO],['dust'],M+"Flunky tripping over her own big feet and laughing while tall Lonky catches her"+ONLY,{}),
(32.35,'cut',TR,['dust'],M+TRS+"stamping in rhythm side by side, the ground puffing up dust and leaves"+ONLY,{'shake':0.15}),
(35.42,'cut',[OS],['dust'],M+"little Oskar standing on a tree stump shouting at the top of his lungs, the loudest of all",{}),
(38.62,'cut',[WA,OS],['dust'],M+"big brother Walter with his lilac headphones putting an arm around little Oskar, both laughing"+ONLY,{}),
(42.26,'cut',KIDS[:2]+TR,['dust'],M+"Oskar, Walter and "+TRS+"freezing mid-dance, listening, leaves trembling on the ground"+ONLY,{'shake':0.25}),
(45.46,'cut',[],['dust'],M+"the forest edge shaking, birds flying up, the treetops swaying, something big coming"+NP,{'shake':0.35}),
(51.49,'flash',KIDS[:2]+TR+[CH],['dust'],M+"storybook hero shot: Oskar, Walter, Chester and "+TRS+"jumping high in the air shouting hurra, leaves flying"+ONLY,{'shake':0.2}),
(54.7,'cut',KIDS[:2]+TR,['dust'],M+"big and small holding hands in a ring and dancing round: "+TRS+"with little Oskar and Walter"+ONLY,{}),
(57.92,'cut',KIDS[:2]+TR,['dust'],M+"a tall tower of friends: tall Lonky with Walter on her shoulders and Oskar on top of Walter, Funky and Flunky cheering below, as tall as the farmhouse"+ONLY,{}),
(61.54,'cut',[],['dust'],M+"the farmhouse and meadow from above, big shouts rising into the sky, birds circling"+NP,{}),
(67.44,'cut',[CH],['dust'],M+"the golden dog Chester running in front down a leafy path, ears flying",{}),
(70.77,'cut',[CH],['dust'],M+"close-up of Chester's golden tail wagging wildly, leaves swirling",{}),
(73.78,'cut',[MX],['dust'],M+"little cousin Max hopping like a kangaroo across the meadow, huge grin",{}),
(77.2,'cut',[MX]+TR,['dust'],M+TRS+"welcoming little Max into the game, Lonky giving him a high five"+ONLY,{}),
(80.42,'cut',[],[],None,{'img':'s12'}),
(84.03,'cut',[],[],None,{'img':'s13'}),
(86.83,'flash',[DI],['dust'],M+"a giant green dinosaur foot stomping down onto the grass, leaves exploding outward",{'shake':0.5}),
(89.68,'cut',[DI],['dust'],M+"the big friendly green dinosaur stomping out of the forest roaring RAAAR, mouth wide, but goofy not scary",{'shake':0.3}),
(93.18,'cut',[DI],['dust'],M+"the dinosaur suddenly shy and smiling, holding a little flower in his tiny arms",{}),
(96.1,'cut',[DI,OS,WA],['dust'],M+"Oskar and Walter hugging the dinosaur's big leg while he wiggles a dance"+ONLY,{}),
(98.91,'flash',[DI,OS,WA,MX],['dust'],M+"storybook hero shot: Oskar, Walter and Max riding on the dancing dinosaur's back, cheering"+ONLY,{'shake':0.2}),
(102.93,'cut',[DI]+TR+KIDS,['dust'],M+"everyone dancing in a big circle around the dinosaur: "+TRS+"Oskar, Walter and Max"+ONLY,{}),
(106.14,'cut',[],[],None,{'img':'s15'}),
(109.76,'cut',[DI,OS,WA,MX],['dust'],M+"the kids standing on the dinosaur's head as high as the farmhouse roof, arms wide"+ONLY,{}),
(112.98,'cut',[],[],None,{'img':'s17'}),
(117.02,'cut',[RO],['fireflies'],M+"late afternoon, a dark thicket at the forest edge, the bushes rustling, a faint red glow inside, only a shiny metal leg tip visible",{}),
(120.21,'cut',[RO],['fireflies'],M+"close-up of a shiny silver metal spider leg stepping out of the bushes onto the leaves",{}),
(123.42,'cut',[RO],['fireflies'],M+"the spider robot stepping out of the thicket on its eight shiny metal legs, curious",{}),
(126.64,'cut',[RO],['fireflies'],"Close-up of the spider robot's one big round glowing red eye, curious and kind, reflections of autumn leaves in it",{}),
(130.26,'cut',[WA,OS],['fireflies'],M+"Walter crouching and whispering to little Oskar, holding him close, both peeking at something"+ONLY,{}),
(131.57,'cut',[CH],['fireflies'],M+"Chester the golden dog hesitating, head tilted, tail wagging just a little",{}),
(133.38,'cut',[LO,RO],['fireflies'],M+"tall Lonky the troll girl smiling and holding out her hand to the spider robot"+ONLY,{}),
(135.09,'cut',[RO,LO,FU,FL],['fireflies'],M+"the spider robot joining the troll girls, its red eye glowing happily"+ONLY,{}),
(136.69,'flash',[RO,OS,WA,MX],['sparks'],M+"the kids shouting and waving at the spider robot, which does a funny glitchy robot dance, sparks"+ONLY,{'shake':0.2}),
(139.9,'cut',[RO,OS,MX],['sparks'],M+"Oskar and Max riding on the spinning spider robot like a merry-go-round, laughing"+ONLY,{}),
(143.52,'fade',[FM,FF],['dust'],H+"farmor and farfar standing on the front steps clapping and laughing"+ONLY,{}),
(146.7,'cut',[FM,FF]+KIDS,['dust'],H+"the whole yard dancing: farmor, farfar, Oskar, Walter and Max"+ONLY,{}),
(149.94,'cut',[FF],['dust'],H+"farfar dancing wildly on the steps in his brown felt slippers, arms flailing, beard grinning",{}),
(152.9,'cut',[FF],['dust'],H+"close-up of farfar's brown felt slippers flapping, one flying off through the air",{'shake':0.15}),
(155.98,'cut',[FM,OS],['dust'],H+"farmor spinning little Oskar round and round in her arms, both laughing"+ONLY,{}),
(159.6,'cut',[FF],['dust'],H+"farfar with both arms up shouting more, it's healthy, red-cheeked and happy",{}),
(164.03,'flash',[FM,FF,DI,RO]+KIDS,['sparks'],M+"storybook hero shot, everyone together in one big party: farmor, farfar, Oskar, Walter, Max, the dinosaur and the spider robot dancing, golden light, leaves swirling"+ONLY,{'shake':0.2}),
(167.63,'cut',TR,['sparks'],M+TRS+"cheering hurra with fists in the air"+ONLY,{}),
(170.83,'cut',[DI]+TR+KIDS,['sparks'],M+"the tallest tower ever: the dinosaur with Lonky on his head and the kids on top, higher than the farmhouse"+ONLY,{}),
(174.05,'cut',[],['sparks'],M+"wide golden sunset over the farmhouse and the meadow, leaves flying up into the sky"+NP,{}),
(177.26,'cut',[DI,RO,CH,MX],['sparks'],M+"the dinosaur, the spider robot, the golden dog Chester and little Max lined up in a row cheering"+ONLY,{}),
(180.06,'cut',[OS,WA,FM,FF],['sparks'],H+"Oskar, Walter, farmor and farfar in a row on the steps cheering"+ONLY,{}),
(183.66,'flash',[FM,FF,DI,RO,CH]+KIDS+TR,['sparks'],M+"storybook hero shot, a big group jump: everyone, the three troll girls, Oskar, Walter, Max, Chester, farmor, farfar, the dinosaur and the spider robot all in the air shouting hurra"+ONLY,{'shake':0.3}),
(189.0,'fade',[FM,FF,CH]+KIDS,['fireflies'],H+"sunset, farmor, farfar, Oskar, Walter, Max and Chester resting on the front steps, the dinosaur and the robot asleep in the meadow behind"+ONLY,{}),
(194.5,'fade',[],['fireflies'],"Full-bleed painting edge to edge, no border: the red farmhouse at night under the stars, warm windows, the dinosaur's shape asleep in the meadow"+NP,{}),
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
assert 'freezing' in sid('s12')['scene'] and 'forest edge shaking' in sid('s13')['scene'] and 'ring' in sid('s15')['scene'] and 'from above' in sid('s17')['scene'] and 'hero shot, a big group' in sid('s55')['scene']
board=json.load(open('painted/93-funky.json')); board['cover']='s55'; board['shots']=shots
head_={k:v for k,v in board.items() if k!='shots'}
out=json.dumps(head_,ensure_ascii=False,indent=2)[:-2]+',\n  "shots": [\n'+',\n'.join('    '+json.dumps(s,ensure_ascii=False) for s in shots)+'\n  ]\n}\n'
json.loads(out);open('painted/93-funky.json','w').write(out)
ts=[s['t'] for s in shots]
print(len(shots),'shots',sum(1 for s in shots if 'img' not in s),'new','mono',all(a<b for a,b in zip(ts,ts[1:])))
