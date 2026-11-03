"""Storyboard generator for Level 13, Down We Go to the Caves Below (painted). Pattern: make/12.py.
Run from chronicle/: python painted/make/11.py -> painted/10-ahm-dynasty.json (overwrites hand edits).
Story: see src/levels/L13-down-deep.js.
"""
import json,re
L12=json.load(open('painted/12-fall-duncastle.json')); L6=json.load(open('painted/06-slaying-pig.json')); L1=json.load(open('painted/01-first-steps.json'))
def load_beats(path):
    m = re.search(r'(?:const BEATS|L\.beats) = (\{.*?\});', open(path).read(), re.S)
    return json.loads(m.group(1))
B=load_beats('src/levels/L13-down-deep.js')
near=lambda l,t: min(l,key=lambda x:abs(x-t))
def snap(t,k):
    if k not in ('cut','flash') or t==0: return t
    h,r,e=near(B['hits'],t),near(B['bars'],t),near(B['beats'],t)
    return h if abs(h-t)<=0.25 else r if abs(r-t)<=0.2 else e
L,A,C,V,SE,KA,SO,DA,DO,W1,BU,MB,TH,DR,W,CV='lucien','arthas','cedric','valerys','serpent','kaelen','soldiers','darius','dolkan','wittan','bulette','mindbreaker','thorman','drow','wolf','cavern'
MOVES=[([0,0,0.04],[0,0,0.2]),([-0.04,0,0.05],[0.04,0,0.12]),([0,0,0.22],[0,0,0.05]),([0.05,0.02,0.02],[-0.04,0,0.12]),([0,0.04,0.02],[0,0,0.18]),([0.03,0,0.08],[-0.03,0,0.16])]
LU="Lucien Vale (long blond hair, pointed ears, burgundy coat) "
MEM="painted like a faded memory, soft haze, muted colours, "
TAV="in Mara's tavern at night, warm firelight, "
DEEP="deep underground in the Down Deep, a lightless world of caverns, rock ceilings, no sky, "
CAVERN=DEEP+"in a huge natural cavern painted as a real place in the same painterly style as everything else (not a tabletop, not miniatures, real scale): a wide ring of tall jagged grey rock spires around a sandy cavern floor, a giant red spotted toadstool taller than a man, an old wooden mine scaffold tower in the middle, pale limestone cliffs at the edge overgrown with huge glowing colourful fungus, torchlight and fungus glow, "
TOWN=DEEP+"in Thorman's camp, a half-abandoned underground town of carved stone houses in a cavern, a few campfires, rock ceiling, no sky, "
PAWS="in Paws and Pints, a cosy tavern full of cats everywhere (on beams, tables, the bar), warm lamplight, "
LAKE="at the old moonwell of Cobh, the same place as the reference painting of the moon lake (a round lake in a forest clearing ringed by tall standing stones with six heavy iron chains running from the stones down into it), "
SWAMP="at the first moonwell (layout as in the reference photo of the tabletop model, painted as a real place at full scale): a vast corrupted dead marsh, a giant gnarled tree on a square raised stone plinth in the middle, straight old cobblestone paths running out from the plinth, two lone square brick gate arches far away on either side of the tree, black goo water and dead reeds, mist, "
VIL="in the square of a small poor village at dusk, thatched houses, "
S_=[
(0,'black',[],['dust'],DEEP+"a vast black cavern seen from a ledge, glowing fungus far below, an underground river, no people",{'grade':'cold'}),
(8.7,'fade',[],['dust'],DEEP+"giant glowing mushrooms in blue, purple and amber light in the dark, no people",{'grade':'cold'}),
(14.4,'cut',[L,A,C],['dust'],"Silhouettes of the three brothers with torches against the dark mouth of a tunnel, "+LU,{'flicker':0.4}),
(20.6,'cut',[L],['dust'],"Close-up of "+LU+"in torchlight, looking down into the dark",{'flicker':0.4}),
(28.0,'fade',[],['smoke','ash'],"Duncastle at grey dawn after the battle, smoke from the broken walls, the cracked and empty courtyard where the serpent took Valerys, no people at all",{}),
(36.0,'cut',[SO,KA],['smoke'],"Weary soldiers and Kaelen gathered in the ruined courtyard of Duncastle, bandaged, grim",{}),
(43.0,'flash',[L,SO],['smoke','embers'],LU+"standing on a wooden crate in torchlight, shouting to the gathered soldiers, a fist raised",{'flicker':0.5}),
(46.8,'cut',[L],['embers'],"Close-up of "+LU+"on the crate, worn thin, blood on his coat, passionate",{'flicker':0.5}),
(54.4,'cut',[KA,SO],['embers'],"Kaelen Stormshield and five soldiers stepping forward to follow, torches lifted",{'flicker':0.5}),
(57.9,'cut',[SE],['dust'],MEM+"the colossal pale serpent exactly as in its reference sheet (ridged grey-white hide, huge round toothed mouth) dragging Oathbreaker Valerys in blackened armour down into the cracked courtyard ground",{'grade':'cold'}),
(61.3,'cut',[DA,L,A,C,KA],['dust'],"In a stone cellar of the castle, Darius the human soldier lifting a secret hatch in the floor, the three brothers and Kalen behind him with torches",{'flicker':0.4}),
(65.1,'cut',[C,A,L,SO],['dust'],"A narrow winding stair carved roughly into the rock spiralling down, Cedric first, Arthas leading a great grey wolf, "+LU+"and soldiers behind, torches",{'flicker':0.4}),
(72.3,'cut',[L,A,C,SO],['dust'],"Torchlit faces of the silent company descending the stair, no one speaking",{'flicker':0.4}),
(78.9,'cut',[],['dust'],"A massive ancient stone gate in a cavern wall, barred from this side to keep something in, choked with huge boulders",{'flicker':0.3}),
(82.2,'cut',[A,C,L],['dust'],"Arthas and Cedric heaving the great boulders away from the stone gate, black tunnels beyond",{'flicker':0.4,'shake':0.2}),
(85.8,'flash',[L,A,C,W],['dust','embers'],DEEP+"the three brothers walking into the vast dark with torches, Arthas beside his grey wolf, glowing fungus around them, heroic, low angle",{'flicker':0.5}),
(89.5,'cut',[L],['sparks'],DEEP+LU+"holding a small borrowed light, a glowing stone, the only light in the dark",{'grade':'cold'}),
(93.2,'cut',[A,C],['dust'],DEEP+"Arthas and Cedric back to back in the tunnel dark, wary",{'flicker':0.4}),
(96.7,'cut',[L,A,C],['embers'],DEEP+"the three brothers seen from far above, three tiny torches in a vast black cavern",{'flicker':0.4}),
(101.0,'fade',[DO],['dust'],DEEP+"Dolkan the mad duergar crouched among hiding deep dwellers, wild-eyed, grinning",{'flicker':0.4}),
(107.5,'cut',[DO,L,A,C],['dust'],DEEP+"Dolkan leading the brothers through a twisting tunnel, cackling",{'flicker':0.4}),
(114.3,'flash',[BU],['dust'],CAVERN+"a bulette, a land shark, bursting up through the cavern floor, stone flying",{'shake':0.6}),
(117.4,'cut',[BU],['dust'],CAVERN+"the cavern floor rippling like water around a diving bulette fin",{'shake':0.3}),
(120.9,'cut',[L,BU],['sparks','embers'],CAVERN+LU+"firing a blazing firebolt into a bulette's armoured head, a critical hit",{'flicker':0.7}),
(124.4,'cut',[BU],['dust'],CAVERN+"another bulette erupting out of the ground right beneath the soldiers",{'shake':0.6}),
(127.7,'cut',[BU,SO],['dust'],CAVERN+"the soldiers thrown into the air by the bulette, torches flying, leave the violence to imagination",{'shake':0.5,'grade':'red'}),
(131.4,'cut',[BU],['dust'],CAVERN+"a bulette sinking back into the stone, only its fin showing",{}),
(134.9,'cut',[KA,BU],['dust'],CAVERN+"Kaelen drawing his bow and loosing a single arrow",{}),
(138.3,'cut',[BU],['dust'],CAVERN+"the arrow striking the bulette between the eyes, the beast going still",{'shake':0.3}),
(140.9,'flash',[L,KA],['dust'],"Close-up of "+LU+"pointing at a smug Kaelen and yelling FRAGSTEALER, outraged",{'shake':0.4}),
(144.0,'cut',[W1],['dust'],CAVERN+"Wittan the deep gnome on top of the wooden scaffold in the middle of the cavern, yelling a warning",{}),
(150.0,'cut',[L,BU],['sparks'],CAVERN+LU+"hurling a green vitriolic sphere of acid that bursts over two bulettes",{'grade':'green'}),
(156.0,'cut',[C,BU],['dust'],CAVERN+"Cedric hammering a bulette that is smashing the scaffolding, poisoned strikes",{'shake':0.4}),
(162.0,'cut',[A,BU],['fire','embers'],CAVERN+"Arthas swinging his flaming sword and missing, the bulette ducking under it, a look of shock",{'flicker':0.6}),
(166.0,'cut',[L,BU],['sparks','embers'],CAVERN+LU+"firing three scorching rays into the last bulette's skull, victorious",{'flicker':0.8,'shake':0.4}),
(169.8,'fade',[C],['fog'],"Close-up of Cedric clutching his head, eyes wide, a cold voice in his mind",{'grade':'cold'}),
(173.4,'cut',[MB],['fog'],"In deep shadow, the silhouette of a tall robed figure with a head of writhing tentacles, eyes glowing faintly, only a shape",{'grade':'cold'}),
(177.2,'cut',[V],['fog'],MEM+"Oathbreaker Valerys chained in the dark, a vision offered like a bargain",{'grade':'cold'}),
(182.3,'cut',[L,A,C],['dust'],DEEP+"in a dark cave tunnel lit by glowing fungus, rock ceiling above: the three brothers looking at each other in silence, not answering",{'flicker':0.3}),
(188.0,'fade',[],['fireflies'],DEEP+MEM+"a fortress of glowing stone in the deep with a great lamp shining at its top, beasts lying calm in its light",{'grade':'cold'}),
(196.4,'cut',[L,A,C],['dust'],TOWN+"the exhausted brothers stumbling into Thorman's camp",{'flicker':0.4}),
(200.0,'cut',[TH],['embers'],TOWN+"Thorman Earthblast, a duergar warlord, gathering an army of duergar, drow and deep gnomes around war fires",{'flicker':0.5}),
(203.7,'cut',[DR],['embers'],TOWN+"a beautiful drow woman sitting by a campfire, the firelight on her face",{'flicker':0.5}),
(207.4,'cut',[L,DR],['embers'],"Close-up of "+LU+"seeing her across the fire, stopped in his tracks, smiling for the first time in weeks",{'flicker':0.5}),
(210.5,'cut',[],['dust'],TOWN+"wide: a half-abandoned underground town of carved stone houses, dark windows, a few warm fires, no people close",{'flicker':0.3}),
(217.7,'cut',[L],['embers'],"Close-up of "+LU+"warmed by the firelight, something soft in his eyes",{'flicker':0.5}),
(225.3,'cut',[L,DR],['embers'],TOWN+LU+"leading the drow woman away from the others to a small fire of her own",{'flicker':0.5}),
(228.8,'cut',[L,DR],['embers'],TOWN+LU+"and the drow woman talking by a low fire, embers glowing, he is charming, she is amused",{'flicker':0.5}),
(235.7,'cut',[L,DR],['embers'],"Close-up of "+LU+"grinning, mid-story, hands in the air",{'flicker':0.5}),
(239.0,'cut',[DR],['embers'],"Close-up of the drow woman laughing in the dark, firelight in her eyes",{'flicker':0.5}),
(242.9,'cut',[],['fireflies'],DEEP+"the vast cavern quiet and still, glowing fungus, a single small fire far away, no people close",{'grade':'cold'}),
(246.4,'cut',[L,DR],['embers'],TOWN+LU+"and the drow woman side by side by the dying fire, his arm around her, staying",{'flicker':0.4}),
(253.4,'cut',[],['dust'],DEEP+"bones and old graves in the dark of the deep, a reminder, no people",{'grade':'cold'}),
(256.9,'cut',[L,DR],['embers'],TOWN+LU+"winking at the drow woman as she rises and offers him her hand",{'flicker':0.4}),
(260.3,'cut',[L],['sparks'],"Close-up of "+LU+"with no weapon and no spell in his hands, just a charming smile",{}),
(263.7,'cut',[L],['embers'],"Close-up of "+LU+"giving a sly wink to the viewer",{'flicker':0.4}),
(270.9,'flash',[L,DR],['embers'],TOWN+"the drow woman leading "+LU+"by the hand into a dark doorway of a carved stone house, he throws a triumphant grin back over his shoulder, nothing explicit",{'flicker':0.5}),
(275.0,'cut',[A,C],['embers'],TOWN+"Arthas and Cedric by the campfire watching him go, Cedric rolling his eyes, Arthas shaking his hooded head",{'flicker':0.5}),
(280.7,'flash',[],[],None,{'img':'s16'}),
(284.2,'cut',[],[],None,{'img':'s17'}),
(287.8,'cut',[],[],None,{'img':'s18'}),
(291.3,'cut',[],[],None,{'img':'s19'}),
(297.4,'fade',[],['dust'],DEEP+"a tunnel leading deeper into blackness, faint glowing eyes far down it, no people",{'grade':'cold'}),
(301.0,'cut',[MB],['fog'],"Far down in the dark, a fortress of dimmed stone and a tall tentacled silhouette waiting",{'grade':'cold'}),
(305.1,'cut',[],['embers'],TOWN+"a small campfire burning low outside a dark stone doorway, warm, no people at all",{'flicker':0.5}),
(311.8,'cut',[],[],None,{'img':'s58'}),
(318.0,'fade',[],[],None,{'img':'s65'}),
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
assert sid('s16')['scene'].startswith(DEEP+'the three brothers walking') and sid('s19')['scene'].startswith(DEEP+'the three brothers seen from far')
L10=json.load(open('painted/10-ahm-dynasty.json')); L11=json.load(open('painted/11-hunger-grows.json'))
L4=json.load(open('painted/04-cleansing-well.json'))
cast={k:L12['cast'][k] for k in ['lucien','arthas','cedric','valerys','serpent']}
cast.update({'kaelen':L4['cast']['kalen'].replace('Kalen, a Church paladin the brothers know','Kalen Stormshield, the human Church paladin the brothers know (the same man as before), carrying a longbow').replace(', wrists chained',''),
 'soldiers':"five Church soldiers in battered white-and-steel armour with spears and torches",
 'darius':"Darius, a human soldier of the castle from above: a weathered man in his forties, short dark hair and stubble, battered white-and-steel Church soldier armour like the other soldiers, a torch",
 'dolkan':"Dolkan, a mad old duergar: a short, stocky grey-skinned dwarf, bald with a wild white beard, bulging glowing eyes, tattered dark leathers, a lantern on a pole, cackling",
 'wittan':"Wittan, a deep gnome (svirfneblin): small, grey stone-coloured skin, bald, big nose and ears, dark eyes, practical grey leathers and a pick",
 'bulette':"a bulette, a land shark, a real living beast painted in the same style as everything else (not a figurine): a huge armoured burrowing beast with a grey-green shell of stone-like plates and spiky dorsal plates, a shark-like toothed mouth, clawed forelegs",
 'cavern':"the cavern from the reference photo of the tabletop, painted as a real underground place at full scale",
 'mindbreaker':"the Mindbreaker, only ever seen as a shadowy silhouette: a tall gaunt robed humanoid with a head of writhing tentacles where the mouth should be, faint glowing eyes",
 'thorman':"Thorman Earthblast, a duergar warlord: short, broad, grey-skinned, a braided iron-grey beard, heavy dark steel armour, a great war hammer, stern",
 'drow':"a beautiful drow woman: dark purple-grey skin, long straight white hair, pointed ears, violet eyes, a fitted dark leather outfit with silver details, a sly smile",
 'wolf':"Arthas's steed, a huge grey wolf with a saddle, big as a horse, calm"})
board={"id":"saving-cobh","live":True,'cover':'s16','style':L12['style'],'cast':cast,'shots':shots}
head_={k:v for k,v in board.items() if k!='shots'}
out=json.dumps(head_,ensure_ascii=False,indent=2)[:-2]+',\n  "shots": [\n'+',\n'.join('    '+json.dumps(s,ensure_ascii=False) for s in shots)+'\n  ]\n}\n'
json.loads(out);open('painted/13-down-deep.json','w').write(out)
ts=[s['t'] for s in shots]
print(len(shots),'shots',sum(1 for s in shots if 'img' not in s),'new','mono',all(a<b for a,b in zip(ts,ts[1:])),'maxhold',round(max(b-a for a,b in zip(ts,ts[1:]+[295.5])),1))
