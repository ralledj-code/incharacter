"""Storyboard generator for Level 10, The Ahm Dynasty Mystery (painted). Pattern: make/12.py.
Run from chronicle/: python painted/make/11.py -> painted/10-ahm-dynasty.json (overwrites hand edits).
Story: see src/levels/L10-ahm-dynasty.js.
"""
import json,re
L12=json.load(open('painted/12-fall-duncastle.json')); L6=json.load(open('painted/06-slaying-pig.json')); L1=json.load(open('painted/01-first-steps.json'))
def load_beats(path):
    m = re.search(r'(?:const BEATS|L\.beats) = (\{.*?\});', open(path).read(), re.S)
    return json.loads(m.group(1))
B=load_beats('src/levels/L10-ahm-dynasty.js')
near=lambda l,t: min(l,key=lambda x:abs(x-t))
def snap(t,k):
    if k not in ('cut','flash') or t==0: return t
    h,r,e=near(B['hits'],t),near(B['bars'],t),near(B['beats'],t)
    return h if abs(h-t)<=0.25 else r if abs(r-t)<=0.2 else e
L,A,C,W,M,MO,V,AS,G='lucien','arthas','cedric','wizard','mara','mother','valerys','assassin','guard'
MOVES=[([0,0,0.04],[0,0,0.2]),([-0.04,0,0.05],[0.04,0,0.12]),([0,0,0.22],[0,0,0.05]),([0.05,0.02,0.02],[-0.04,0,0.12]),([0,0.04,0.02],[0,0,0.18]),([0.03,0,0.08],[-0.03,0,0.16])]
LU="Lucien Vale (long blond hair, pointed ears, burgundy coat) "
MEM="painted like a faded memory, soft haze, muted colours, "
BASE="in the stone basement under Mara's tavern, lantern light, barrels, "
SEW="in the dark city sewers, brick tunnels, black water, torchlight, "
AHM="in the Ahm Dynasty's secret basement headquarters under Happiness Street, rich carpets and stolen goods in stone vaults, "
ALT="in the hidden chamber deep under Happiness Street, "
S_=[
(0,'black',[],['fog'],"A harbour town at night, a lantern-lit tavern with a warm window on a wet cobbled street, no people",{'flicker':0.3}),
(8.4,'fade',[L,A,C],['dust'],"Inside the tavern, "+LU+"sitting alone at a table, sick of it all, as Arthas in dark plate and Cedric the monk walk in",{'flicker':0.4}),
(17.3,'cut',[M,L,A,C],['dust'],"Mara holding open a trapdoor behind the bar, beckoning the three brothers down a stone stair into the basement",{'flicker':0.4}),
(22.4,'cut',[MO],['dust','fog'],BASE+"a tall noble woman in a dark scarlet hooded cloak stepping out of the shadows into the lantern light, face half revealed",{'flicker':0.3}),
(27.4,'cut',[MO],['dust'],"Close-up of the mother lowering her scarlet hood: older than he remembers, noble, tears in her eyes",{'flicker':0.3}),
(32.3,'cut',[L],['dust'],"Close-up of "+LU+"with tears in his eyes, stunned, facing his mother",{'flicker':0.3}),
(36.0,'cut',[L,MO,A,C],['dust'],BASE+"the mother and "+LU+"face to face, Arthas and Cedric behind him, a family that has not met in years",{'flicker':0.3}),
(41.0,'fade',[MO,W],['smoke'],MEM+"the mother in scarlet robes among Scarlet Wizards in a dark workshop, secretly tipping a vial of black goo into a drain behind their backs",{'grade':'red'}),
(45.3,'cut',[],['smoke'],MEM+"thick black goo spreading over the cobbles of a village street at dusk, black veins creeping up a well",{'grade':'green'}),
(48.7,'cut',[MO,L],['dust'],"The mother gripping "+LU+"'s arm hard, warning him, urgent: never seek your father",{'flicker':0.3}),
(52.5,'cut',[],['fog'],"A dreamlike vision: a faceless male silhouette in deep mist playing a strange glowing melody, notes of light drifting, ominous and beautiful, face never seen",{'grade':'cold'}),
(54.6,'cut',[L],['fog'],"Close-up of "+LU+"looking away, afraid of the answer",{}),
(61.0,'fade',[L,MO,A,C,M],['dust'],BASE+"wide: the family talking quietly around one lantern, Mara on the stair, shadows all around",{'flicker':0.3}),
(68.0,'cut',[],['dust'],BASE+"a secret door in the stone wall opening a crack in the dark, the glint of arrowheads, no faces",{}),
(74.6,'cut',[AS],['fog'],"In the dark gap of a secret door, a Scarlet assassin drawing a bow, three arrows nocked, eyes cold",{'grade':'red'}),
(80.6,'cut',[],['dust'],BASE+"three arrows in flight through the lantern light, motion blur, no people in frame",{}),
(86.1,'flash',[AS],['dust'],"The Scarlet assassin shouting 'traitor' from the secret door, bow still singing, pointing at the mother",{'grade':'red','shake':0.3}),
(90.0,'cut',[C],['dust'],"Cedric struck by an arrow, collapsing unconscious onto the basement floor",{'shake':0.4}),
(93.3,'cut',[A],['sparks'],"Arthas alone in the basement deflecting an arrow with his bronze-hilted sword in a burst of sparks, no one else in the frame",{'shake':0.3}),
(96.4,'cut',[L],['dust'],LU+"hit by an arrow, falling to his knees, bleeding onto the stone floor",{'grade':'red'}),
(99.4,'cut',[L,AS],['dust'],BASE+LU+"on the floor reaching out as the assassin turns invisible, only a shimmer in the air where she stood",{}),
(102.9,'flash',[L,A,C],['embers','sparks'],"The three brothers charging into the sewers after the assassin, "+LU+"with fire in his hand, Arthas sword drawn, Cedric with his staff, heroic, low angle",{'flicker':0.5}),
(106.6,'cut',[L],['embers'],SEW+LU+"throwing a fireball down an empty-looking tunnel, the blast outlining a woman's invisible shape as she screams",{'flicker':0.7,'shake':0.3}),
(110.1,'cut',[L],['sparks'],LU+"suddenly floating in the silvery void of the astral plane, stars and drifting stone, baffled, wild magic gone wrong",{'grade':'cold'}),
(113.5,'cut',[A,AS],['fog'],SEW+"Arthas with an outstretched gauntlet commanding the Scarlet assassin, holy light, she walks toward him against her will",{}),
(116.4,'cut',[AS],['fog'],SEW+"close-up of the captured Scarlet assassin on her knees, bruised and defiant, sneering: the Church will fall",{'grade':'red'}),
(121.0,'fade',[M],['dust'],BASE+"Mara alone in the empty basement holding a lantern, the mother gone, only her scarlet cloak left on a chair",{'flicker':0.3}),
(126.5,'cut',[L,A,C],['fog'],"The three brothers hurrying through night streets toward a great cathedral, lightly beaten up and bandaged",{}),
(132.8,'cut',[V,L],['dust'],"In a cathedral hall, High Inquisitor Valerys shaking hands with "+LU+", a deal",{'flicker':0.3}),
(136.3,'cut',[V],['dust'],"High Inquisitor Valerys signing and sealing a document of absolution with a gold sun seal, candlelight, no readable text",{'flicker':0.3}),
(139.8,'cut',[L],['dust'],"Close-up of "+LU+"smiling thinly as a heavy Church chain of office is laid over his shoulders, a leash",{'flicker':0.3}),
(143.3,'cut',[L,V],['sparks'],"Church scholars studying Lucien's faintly blue glowing dagger on a velvet cloth, "+LU+"and Valerys watching",{'flicker':0.3}),
(149.9,'fade',[],['fog'],"Happiness Street at night: a narrow merchant street of tall painted houses, cheerful painted signs, lanterns, wagons unloading crates at a basement entrance, no faces close",{'flicker':0.3}),
(153.4,'cut',[C],['fog'],"Cedric on a dark rooftop above the street, a shadow among shadows, scouting",{}),
(156.6,'cut',[L,G],['sparks'],LU+"disguised as a rich ambassador of the Ahm Dynasty in gold-trimmed robes, his face shimmering with an illusion of another man's face, at a guarded basement door",{'flicker':0.3}),
(160.2,'cut',[G,L,A,C],['dust'],"An Ahm guard at the basement door bowing as the disguised "+LU+"in gold-trimmed ambassador robes walks in, followed by his escorts Arthas in dark plate and Cedric the monk",{'flicker':0.3}),
(162.6,'cut',[L,G],['dust'],AHM+LU+"talking smoothly to a group of suspicious Ahm officials and guards, gathering them all into one room",{'flicker':0.3}),
(167.0,'cut',[L],['sparks'],"Close-up of "+LU+"stepping back through a doorway with a cocky grin, a tiny bead of fire glowing between his fingers",{'flicker':0.5}),
(171.9,'flash',[L,G],['fire','embers','sparks'],AHM+"a huge fireball filling the room full of Ahm officials and guards, fire everywhere, "+LU+"in the doorway, leave the gore to imagination",{'shake':0.7,'flicker':0.8}),
(176.5,'cut',[],['fire','smoke','embers'],AHM+"the room burning after the blast, scorched walls, smoke, no people standing",{'flicker':0.7}),
(181.0,'cut',[G],['smoke','embers'],AHM+"more Ahm guards rushing down a stone stair with swords and crossbows",{'flicker':0.5}),
(186.0,'cut',[C,G],['smoke','dust'],AHM+"Cedric beating Ahm guards with his staff and fists, a whirlwind",{'shake':0.3}),
(191.0,'cut',[A,G],['smoke','sparks'],AHM+"Arthas cutting down Ahm guards with his bronze-hilted sword",{'shake':0.3,'flicker':0.4}),
(196.5,'cut',[W],['fog'],AHM+"a Scarlet Wizard locked in an iron cage, offering a sly deal through the bars",{'grade':'red'}),
(201.0,'cut',[A],['sparks'],"Arthas hammering the glowing arcane locks of a great rune-covered door with his sword pommel, runes cracking with each blow",{'shake':0.3}),
(205.5,'flash',[A],['sparks','dust'],"The arcane door bursting open and Arthas charging through it with his sword raised, roaring",{'shake':0.5}),
(209.3,'fade',[L,A,C],['fog'],ALT+"a long stone chamber with a blood-soaked altar of red stone at the far end, the three brothers entering",{'grade':'red'}),
(215.6,'cut',[L,A,C],['dust'],ALT+"a heavy iron gate slamming down behind the brothers, trapped",{'shake':0.4}),
(222.0,'cut',[],['fog'],"Close-up of the bloody red stone altar, carved with a handprint and runes, blood running in its grooves, no readable text",{'grade':'red'}),
(228.0,'cut',[L,A],['fog'],ALT+LU+"stepping in front of Arthas, holding him back with one arm",{'grade':'red'}),
(231.4,'cut',[L],['sparks'],LU+"pressing his palm onto the bloody altar, red light bursting up his arm",{'grade':'red','shake':0.3}),
(234.3,'cut',[L],['fog'],"Extreme close-up of gills opening on the side of "+LU+"'s neck",{}),
(237.4,'cut',[L],['fog'],"In total darkness only the face of "+LU+"visible, his eyes glowing, seeing everything",{'grade':'cold'}),
(240.6,'cut',[C],['dust'],ALT+"Cedric pulling a folded note out from under the altar",{}),
(244.4,'cut',[],['dust'],"Close-up of a note in torchlight sealed with a royal crown seal beside the golden Ahm crest, no readable text",{'flicker':0.3}),
(247.8,'cut',[L,A,C],['fog'],"The three brothers, "+LU+"Arthas and Cedric, looking at each other in torchlight, grim: the prince is theirs, no one else",{'flicker':0.3}),
(252.0,'flash',[],[],None,{'img':'s22'}),
(255.8,'cut',[L,A,C],['smoke','embers'],"The three brothers walking out of the burning Ahm headquarters onto Happiness Street at night, flames behind them, "+LU,{'flicker':0.5}),
(259.6,'cut',[],[],None,{'img':'s39'}),
(263.0,'cut',[L],['fog'],"Close-up of "+LU+"smiling in the dark, gills on his neck, eyes glowing faintly, something new",{}),
(268.0,'cut',[],[],None,{'img':'s22'}),
(275.0,'fade',[L,A,C],['dust'],"The three brothers on a long road south at dawn, packs on their backs, the land stretching far",{}),
(282.0,'cut',[L,A,C],['fog'],"The three brothers silhouetted on a ridge at dusk, small and tired, not heroes",{}),
(286.5,'cut',[],['smoke','embers'],"An empty landscape: on the far horizon war camps and burning villages under a red sky, smoke columns, the war going on, no people or figures in the foreground at all",{'grade':'red','flicker':0.4}),
(289.6,'cut',[L],['dust'],"Close-up of "+LU+"looking back over his shoulder one last time",{}),
(292.5,'cut',[],['fog'],"Kyhlis, the southernmost town, far away on a coast at dusk, a dark fortress tower among its roofs",{}),
(296.0,'cut',[L,A,C],['dust'],"Wide: the three brothers marching away down the road south, side by side",{}),
(304.0,'fade',[],['fog'],"In a dark cell in a tower, a young man in torn princely clothes chained to the wall, only a silhouette against a small barred window, face hidden",{'grade':'cold'}),
(316.0,'fade',[L,A,C],['dust'],"The three brothers tiny on the long road south under a vast evening sky",{}),
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
assert [x for x in shots if x['id']=='s22'][0]['scene'].startswith('The three brothers charging') and 'fireball' in [x for x in shots if x['id']=='s39'][0]['scene']
cast={'lucien':L12['cast']['lucien'],'arthas':L12['cast']['arthas'],'cedric':L12['cast']['cedric'],'wizard':L12['cast']['wizard'],
 'mara':L12['cast']['mara'],'mother':L12['cast']['mother']+'; here she wears a dark scarlet hooded cloak over her gown, a spy inside the Scarlet Wizards','valerys':L6['cast']['valerys'],
 'assassin':"a Scarlet assassin: a lean woman in close-fitting dark red leather with a hood and a half mask over her mouth, cold pale eyes, short black hair, a recurve bow and a quiver, knives at her belt",
 'guard':"guards of the Ahm Dynasty, the merchant house: men in black and gold livery with gold-trimmed half-capes, steel breastplates, short swords and crossbows, a golden crest of a winged lion on the chest"}
board={"id":"ahm-dynasty","live":True,'cover':'s22','style':L12['style'],'cast':cast,'shots':shots}
head_={k:v for k,v in board.items() if k!='shots'}
out=json.dumps(head_,ensure_ascii=False,indent=2)[:-2]+',\n  "shots": [\n'+',\n'.join('    '+json.dumps(s,ensure_ascii=False) for s in shots)+'\n  ]\n}\n'
json.loads(out);open('painted/10-ahm-dynasty.json','w').write(out)
ts=[s['t'] for s in shots]
print(len(shots),'shots',sum(1 for s in shots if 'img' not in s),'new','mono',all(a<b for a,b in zip(ts,ts[1:])),'maxhold',round(max(b-a for a,b in zip(ts,ts[1:]+[295.5])),1))
