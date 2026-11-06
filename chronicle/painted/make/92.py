"""Storyboard generator for Skægkrokodillen (hidden family song: Tine, Max and Oskar). Run from chronicle/: python painted/make/92.py
Oskar's sheet comes from a private family photo (cast/ref-oskar.jpg, gitignored, never committed); Tine and Max reuse their sheets from 90-tine-max."""
import json,re
def load_beats(path):
    m = re.search(r'(?:const BEATS|L\.beats) = (\{.*?\});', open(path).read(), re.S)
    return json.loads(m.group(1))
B=load_beats('src/levels/L92-krokodille.js')
near=lambda l,t: min(l,key=lambda x:abs(x-t))
def snap(t,k):
    if k not in ('cut','flash') or t==0: return t
    h,r,e=near(B['hits'],t),near(B['bars'],t),near(B['beats'],t)
    return h if abs(h-t)<=0.25 else r if abs(r-t)<=0.2 else e
T,M,O,K='tine','max','oskar','croc'
MOVES=[([0,0,0.04],[0,0,0.16]),([-0.04,0,0.05],[0.04,0,0.1]),([0,0,0.18],[0,0,0.05]),([0.04,0.02,0.02],[-0.03,0,0.1]),([0,0.03,0.02],[0,0,0.14])]
TM="Tine (blond woman, white top) and little Max (small blond boy, blue striped shirt) "
OS="Oskar (blond boy with pirate face paint and a red skull t-shirt) "
LAKE="at a round storybook forest lake with greenish water, reeds and lily pads, big friendly trees, a grassy bank, summer sun, "
IN="in the greenish lake water, splashing, heads above water, "
ONLY=", exactly these people and no one else"
NP=", no people at all, only the crocodile"
FB="Full-bleed painting edge to edge, no border, no frame, no white edge: "
S_=[
(0,'black',[],['fireflies'],LAKE+"early morning, mist on the green water, dragonflies, no people",{}),
(8.6,'fade',[T,M,O],['fireflies'],LAKE+TM+"and "+OS+"walking down the grassy path to the lake, seen from behind"+ONLY,{}),
(16.9,'cut',[O],['fireflies'],LAKE+"Oskar striking a proud pirate pose on a rock by the lake, grinning",{}),
(21.4,'cut',[T,M],['fireflies'],LAKE+TM+"skipping stones on the water, laughing"+ONLY,{}),
(25.4,'fade',[],['fireflies'],FB+LAKE+"the still greenish water close up, lily pads, a few bubbles rising, no people",{}),
(29.4,'cut',[K],['fireflies'],LAKE+"just two round yellow crocodile eyes peeking up out of the green water between the lily pads, the rest hidden"+NP,{}),
(32.45,'cut',[T,M],['fireflies'],LAKE+"Tine standing right at the edge of the bank, little Max beside her pointing down at the water"+ONLY,{}),
(36.6,'cut',[M],['fireflies'],LAKE+"close-up of little Max pointing at the water with big excited eyes, shouting look down there",{}),
(38.7,'cut',[],['fireflies'],LAKE+"ripples and a big dark shape gliding under the green water, no people",{}),
(42.3,'cut',[K],['fireflies'],LAKE+"a long bumpy back of hard grey stone plates breaking the surface of the green water like a row of rocks",{}),
(45.7,'cut',[K],['fireflies'],LAKE+"close-up of the crocodile's big bushy grey-green beard dripping under its jaw, just above the water",{}),
(52.1,'cut',[T,M],['fireflies'],LAKE+TM+"laughing at the edge of the bank, thinking it is all a game"+ONLY,{}),
(54.4,'flash',[K],['fireflies'],LAKE+"the green water bulging and opening up in a big swirl, a splash rising"+NP,{'shake':0.2}),
(56.1,'cut',[T],['fireflies'],LAKE+"Tine taking one step too far on the slippery bank, arms windmilling, surprised face",{}),
(58.7,'cut',[T,M],['fireflies'],LAKE+"Tine and little Max sliding together down the muddy bank toward the water, a funny shocked face"+ONLY,{}),
(60.6,'flash',[T,M],['fireflies'],LAKE+"a huge splash as Tine and Max fall into the green lake",{'shake':0.4}),
(62.4,'cut',[T,M],['fireflies'],LAKE+IN+"Tine and Max shivering in the cold green water, teeth chattering"+ONLY,{}),
(64.2,'cut',[T,M,K],['fireflies'],LAKE+"wide shot: Tine and Max small in the middle of the deep green lake, the crocodile's stone back circling around them"+ONLY,{}),
(68.0,'flash',[K],['fireflies'],LAKE+"storybook hero shot: the Beard Crocodile rising out of the green lake with a big splash, beard swinging, mouth wide in a grumpy grin, water flying",{'shake':0.3}),
(71.9,'cut',[T,M,K],['fireflies'],LAKE+IN+"Tine holding little Max up, both wide-eyed, the crocodile's big snout in the water behind them"+ONLY,{}),
(75.2,'cut',[],[],None,{'img':'s19'}),
(79.1,'cut',[O],['fireflies'],LAKE+"Oskar dancing happily on the grassy bank of the lake, arms up, eyes closed, not worried at all",{}),
(82.3,'cut',[O],['fireflies'],LAKE+"close-up of Oskar standing calm and ready on the bank, a cheeky little smile, fists on his hips",{}),
(87.1,'fade',[O],['fireflies'],LAKE+"Oskar dancing along the edge of the lake with small fast steps, splashes of sunlight",{}),
(93.4,'cut',[T,M],['fireflies'],LAKE+IN+"Tine reaching out toward the bank in panic, little Max splashing wildly with his arms"+ONLY,{}),
(100.2,'cut',[K],['fireflies'],LAKE+"the Beard Crocodile turning around in the water toward the camera, slow and sly",{}),
(102.15,'cut',[K],['fireflies'],LAKE+"close-up of the crocodile's mossy scales like wet grass, water running off them",{}),
(104.1,'cut',[T,M,K],['fireflies'],LAKE+IN+"the crocodile's big toothy jaws coming close behind Tine and Max, who swim away fast"+ONLY,{'shake':0.15}),
(106.2,'cut',[O],['fireflies'],LAKE+"Oskar marching straight toward the water's edge, determined, not stopping",{}),
(108.3,'cut',[O,K],['fireflies'],LAKE+"Oskar taking one brave step forward onto a rock at the edge, facing the crocodile in the water"+ONLY,{}),
(110.4,'cut',[O],['fireflies'],LAKE+"close-up of Oskar smiling a crooked pirate smile, clenching his little hand, a soft glow of power around his fist",{}),
(114.2,'cut',[T],['fireflies'],LAKE+IN+"close-up of Tine in the water shouting hurry",{}),
(116.2,'cut',[M],['fireflies'],LAKE+IN+"close-up of little Max in the water shouting now",{}),
(117.9,'flash',[K],['fireflies','sparks'],LAKE+"a huge fountain of green water spraying high into the sunny air, droplets glittering"+NP,{'shake':0.4}),
(122.5,'cut',[],[],None,{'img':'s19'}),
(126.3,'cut',[T,M,K],['fireflies'],LAKE+IN+"Tine and Max clinging to a floating log, the crocodile's beard bobbing in the water next to them"+ONLY,{}),
(129.7,'cut',[],[],None,{'img':'s20'}),
(133.5,'cut',[O],['fireflies'],LAKE+"Oskar doing a funny pirate dance on the bank, one leg kicked up, laughing",{}),
(136.45,'cut',[],[],None,{'img':'s23'}),
(141.15,'fade',[O],['fireflies'],LAKE+"Oskar alone on a rock at the water's edge slowly raising his hand high like a karate master, nobody else in the picture",{}),
(144.5,'flash',[O],['sparks'],LAKE+"Oskar's arm crackling with a little golden lightning bolt, sparks around his hand, a storybook flash, Oskar alone, nobody else in the picture",{'shake':0.2}),
(148.05,'flash',[O,K],['sparks'],LAKE+"storybook hero shot: Oskar leaping off the rock and landing a perfect judo chop on the Beard Crocodile's big cheek, a golden starburst, splash, only Oskar and the crocodile in the picture, nobody on the bank",{'shake':0.5}),
(151.3,'cut',[K],['sparks'],LAKE+"close-up of the crocodile's wide cheek with a funny cartoon star on it, its eyes crossed, beard puffing out",{}),
(155.3,'cut',[T,M,K],['fireflies'],LAKE+IN+"the dizzy crocodile letting go and drifting away, Tine and Max free in the water"+ONLY,{}),
(158.6,'fade',[],['fireflies'],LAKE+"the green lake going calm and still again, gentle rings on the water, lily pads, golden light, no people",{}),
(164.5,'cut',[T,M,O],['fireflies'],LAKE+"Oskar on the bank reaching out his hand to Tine and Max in the water"+ONLY,{}),
(167.9,'flash',[T,M,O],['fireflies'],LAKE+"close-up of hands grabbing hold: Oskar pulling Tine and Max up out of the water by their hands"+ONLY,{'shake':0.2}),
(172.1,'cut',[T,M,O],['fireflies'],LAKE+"Tine, Max and Oskar standing on the grassy bank dripping wet and laughing"+ONLY,{}),
(176.0,'cut',[T,M,O],['fireflies'],LAKE+"Tine hugging Max and Oskar, all soaking wet, free and happy"+ONLY,{}),
(179.4,'cut',[K],['fireflies'],LAKE+"the Beard Crocodile far out in the lake sulking with its chin in the water, a bump on its cheek, grumpy and funny",{}),
(183.2,'flash',[T,M,O],['fireflies'],LAKE+"storybook hero shot: Oskar held up high on Tine's shoulders like a champion, Max cheering, all wet, the sun behind them"+ONLY,{}),
(187.9,'cut',[O],['fireflies'],LAKE+"close-up of Oskar with a proud pirate grin, giving a thumbs up",{}),
(192.1,'fade',[T,M,O],['fireflies'],LAKE+"golden afternoon, Tine, Max and Oskar drying in the sun on a blanket on the grass"+ONLY,{}),
(201.25,'fade',[T,M,O],['fireflies'],"Sunset over the round forest lake, Tine, Max and Oskar walking home hand in hand, seen from behind, the crocodile's eyes watching from the water, friendly"+ONLY,{}),
(207.0,'fade',[],['fireflies'],FB+LAKE+"evening, a starry sky over the still lake, two round yellow eyes peeking from the water, no people",{}),
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
assert 'hero shot' in sid('s19')['scene'] and 'dancing happily' in sid('s22')['scene'] and 'judo chop' in sid('s42')['scene'] and 'calm and ready' in sid('s23')['scene']
board=json.load(open('painted/92-krokodille.json')); board['cover']='s42'; board['shots']=shots
head_={k:v for k,v in board.items() if k!='shots'}
out=json.dumps(head_,ensure_ascii=False,indent=2)[:-2]+',\n  "shots": [\n'+',\n'.join('    '+json.dumps(s,ensure_ascii=False) for s in shots)+'\n  ]\n}\n'
json.loads(out);open('painted/92-krokodille.json','w').write(out)
ts=[s['t'] for s in shots]
print(len(shots),'shots',sum(1 for s in shots if 'img' not in s),'new','mono',all(a<b for a,b in zip(ts,ts[1:])))
