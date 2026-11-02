"""Storyboard generator for Nutella i grotten (hidden family song). Run from chronicle/: python painted/make/91.py
No references: the animals are invented."""
import json,re
def load_beats(path):
    m = re.search(r'(?:const BEATS|L\.beats) = (\{.*?\});', open(path).read(), re.S)
    return json.loads(m.group(1))
B=load_beats('src/levels/L91-nutella.js')
near=lambda l,t: min(l,key=lambda x:abs(x-t))
def snap(t,k):
    if k not in ('cut','flash') or t==0: return t
    h,r,e=near(B['hits'],t),near(B['bars'],t),near(B['beats'],t)
    return h if abs(h-t)<=0.25 else r if abs(r-t)<=0.2 else e
MU,BJ,FU,JR='mouse','bear','birds','jar'
MOVES=[([0,0,0.04],[0,0,0.16]),([-0.04,0,0.05],[0.04,0,0.1]),([0,0,0.18],[0,0,0.05]),([0.04,0.02,0.02],[-0.03,0,0.1]),([0,0.03,0.02],[0,0,0.14])]
JAR="the big jar of dark brown chocolate spread exactly as in the reference painting (round glass jar full of dark brown chocolate, plain white lid, plain white label with no writing; never honey, never empty)"
WOOD="in a sunny storybook forest clearing, tall friendly trees, soft grass and flowers, "
CAVE="at a mossy rock face in the forest with a dark round cave mouth, "
S_=[
(0,'black',[],['fireflies'],WOOD+"morning, sunbeams, butterflies, no animals yet",{}),
(8.5,'fade',[JR],['fireflies'],WOOD+JAR+" standing on an old tree stump in the middle of the clearing, glowing in a sunbeam",{}),
(16.0,'cut',[MU,JR],['fireflies'],WOOD+"the little mouse peeking out of the grass at "+JAR+", whiskers twitching",{}),
(22.5,'cut',[BJ],['fireflies'],WOOD+"the big bear lumbering out from behind a tree, sniffing the air, eyes on the jar",{}),
(28.8,'cut',[MU,BJ,JR],['fireflies'],WOOD+"the little mouse and the big bear face to face across the tree stump with the jar on it, squabbling",{}),
(34.0,'cut',[MU,BJ,JR],['fireflies'],WOOD+"close-up of "+JAR+" between a tiny mouse paw and a huge bear paw both reaching for it",{}),
(39.7,'cut',[MU,BJ],['fireflies'],WOOD+"the mouse and the bear pointing at each other with their paws, shouting",{}),
(44.2,'cut',[MU,BJ,JR],['fireflies'],WOOD+"the mouse and the bear both hugging "+JAR+" and shouting it is mine, mine, funny angry faces",{'shake':0.2}),
(47.3,'cut',[JR],['fireflies'],"Full-bleed painting edge to edge, no border: "+WOOD+"the trees and flowers all leaning in to watch, tiny forest creatures peeking out",{}),
(50.1,'cut',[FU],['fireflies'],WOOD+"a flock of little colourful birds swooping around the clearing, chirping",{}),
(55.7,'cut',[FU,MU,BJ],['fireflies'],WOOD+"the little birds circling above the mouse and the bear, wanting a taste too",{}),
(63.4,'flash',[MU,BJ,FU,JR],['fireflies'],WOOD+"storybook hero shot: the mouse on the bear's head, both reaching up for "+JAR+" held high, the little birds swirling around them, a sunny chaos",{}),
(68.5,'cut',[MU,BJ,JR],['fireflies'],WOOD+"a tug of war over "+JAR+" between the tiny mouse and the big bear",{'shake':0.2}),
(73.9,'cut',[JR],['fireflies'],WOOD+JAR+" slipping out of their paws and flying through the air",{'shake':0.3}),
(78.9,'cut',[],['fireflies'],CAVE+"the dark cave mouth glowing faintly gold from inside, no animals",{}),
(86.0,'fade',[MU,BJ,FU,JR],['fireflies'],WOOD+"the mouse, the bear and the birds all frozen, staring up at "+JAR+" flying through the air",{}),
(94.7,'flash',[JR],['dust'],WOOD+JAR+" landing on the ground with a big bump, dust puffing up",{'shake':0.4}),
(100.0,'cut',[JR],['dust'],WOOD+JAR+" rolling away down a grassy slope toward a rock face",{}),
(105.4,'cut',[JR],['dust'],CAVE+JAR+" rolling into the dark cave and disappearing",{}),
(110.8,'cut',[MU,BJ,FU],['fireflies'],CAVE+"the mouse, the bear and the birds standing in front of the cave looking at each other",{}),
(116.1,'cut',[],['fireflies'],CAVE+"a big round boulder rolled shut over the cave mouth, closed tight, no animals",{}),
(121.8,'cut',[FU],['fireflies'],CAVE+"the little birds fluttering around the closed boulder, chirping questions",{}),
(129.1,'flash',[],[],None,{'img':'s12'}),
(134.3,'cut',[BJ],['fireflies'],CAVE+"the big bear pushing at the boulder with all his might, it won't budge",{}),
(139.8,'cut',[MU],['fireflies'],CAVE+"the tiny mouse trying to squeeze into a crack by the boulder, too small",{}),
(144.8,'cut',[],[],None,{'img':'s15'}),
(153.0,'fade',[MU,BJ],['fireflies'],CAVE+"the little mouse standing on a stone talking kindly to the big bear: let us help each other",{}),
(158.7,'cut',[BJ,MU],['fireflies'],CAVE+"the big bear nodding gently, the mouse on his paw, friends now",{}),
(163.7,'cut',[FU],['fireflies'],CAVE+"the little birds flying in sticks and straw and building a little ladder against the rock",{}),
(168.3,'cut',[MU,BJ,FU],['fireflies'],CAVE+"one, two, three: the bear pushing, the mouse pulling, the birds tugging on a vine tied to the boulder, all together",{'shake':0.3}),
(176.8,'flash',[],['fireflies','sparks'],CAVE+"the boulder rolling aside and the cave opening wide, warm golden light pouring out",{'shake':0.3}),
(185.0,'cut',[MU,BJ,FU,JR],['fireflies'],"Inside a cosy glowing cave, the mouse, the bear and the birds finding "+JAR+" in the middle, amazed",{}),
(192.8,'cut',[MU,BJ,FU,JR],['fireflies'],"Inside the cosy glowing cave, the mouse, the bear and the birds cheering and dancing around "+JAR,{}),
(197.6,'flash',[MU,BJ,FU,JR],['fireflies'],WOOD+"the mouse, the bear and all the birds sitting together around the open jar, sharing it with little spoons and leaves, happy",{}),
(202.9,'cut',[MU,BJ,JR],['fireflies'],WOOD+"close-up of the mouse and the bear with chocolate on their noses, laughing together",{}),
(208.4,'cut',[],[],None,{'img':'s12'}),
(213.4,'cut',[MU,BJ,FU,JR],['fireflies'],WOOD+"the bear holding "+JAR+" open while the mouse and the birds dip in with little spoons, everyone together",{}),
(220.0,'fade',[MU,BJ,FU,JR],['fireflies'],WOOD+"sunset, the mouse asleep on the sleeping bear's tummy, the birds asleep on his ears, the scraped-clean chocolate jar beside them",{}),
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
assert sid('s12')['scene'].find('storybook hero shot')>0 and sid('s15')['scene'].find('cave mouth')>0
STYLE=("Warm, joyful hand-painted storybook illustration in the look of a 2D animated family film: soft painterly brush strokes, "
 "rounded friendly shapes, bright summery colours, warm golden light, gentle shadows, cosy and happy, cinematic widescreen composition. "
 "The animals are always the same: the little mouse, the big bear and the little birds exactly as in their reference sheets. No people, no text, no letters, no logos, no borders.")
cast={'jar':"the big jar of chocolate spread, as in the reference painting",'mouse':"a tiny cute brown field mouse with big round ears, a pink nose, big shiny eyes and a long thin tail, very expressive, walks on two legs",
 'bear':"a big friendly brown bear, round and fluffy, small round ears, a cream-coloured muzzle and belly, kind little eyes, very expressive, sometimes stands on two legs",
 'birds':"a little flock of small round colourful birds: blue, yellow and red, tiny beaks, cheerful"}
board={"id":"nutella","live":True,'cover':'s12','style':STYLE,'cast':cast,'shots':shots}
head_={k:v for k,v in board.items() if k!='shots'}
out=json.dumps(head_,ensure_ascii=False,indent=2)[:-2]+',\n  "shots": [\n'+',\n'.join('    '+json.dumps(s,ensure_ascii=False) for s in shots)+'\n  ]\n}\n'
json.loads(out);open('painted/91-nutella.json','w').write(out)
ts=[s['t'] for s in shots]
print(len(shots),'shots',sum(1 for s in shots if 'img' not in s),'new','mono',all(a<b for a,b in zip(ts,ts[1:])))
