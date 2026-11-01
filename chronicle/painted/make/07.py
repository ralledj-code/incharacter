"""Storyboard generator for Level 7, The Journey to Cobh (painted). Pattern: make/12.py.
Run from chronicle/: python painted/make/11.py -> painted/10-ahm-dynasty.json (overwrites hand edits).
Story: see src/levels/L07-journey-cobh.js.
"""
import json,re
L12=json.load(open('painted/12-fall-duncastle.json')); L6=json.load(open('painted/06-slaying-pig.json')); L1=json.load(open('painted/01-first-steps.json'))
def load_beats(path):
    m = re.search(r'(?:const BEATS|L\.beats) = (\{.*?\});', open(path).read(), re.S)
    return json.loads(m.group(1))
B=load_beats('src/levels/L07-journey-cobh.js')
near=lambda l,t: min(l,key=lambda x:abs(x-t))
def snap(t,k):
    if k not in ('cut','flash') or t==0: return t
    h,r,e=near(B['hits'],t),near(B['bars'],t),near(B['beats'],t)
    return h if abs(h-t)<=0.25 else r if abs(r-t)<=0.2 else e
L,A,C,V,M,AL,G,N,MY,LE,CW,CR,FA,KIN,LK='lucien','arthas','cedric','valerys','mara','aldraik','guard','neris','mayor','leify','caroline','crackle','father','kin','lake'
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
(0,'black',[],['fog'],"A great white stone cathedral at dusk, candlelit windows, no people",{'flicker':0.3}),
(8.0,'fade',[V,L,A,C],['dust'],"In a candlelit cathedral chamber, High Inquisitor Valerys behind his desk facing the three brothers, "+LU,{'flicker':0.3}),
(16.0,'cut',[],['dust'],"An old painted map of the island of Alaron on a desk by candlelight, a gloved finger on a harbour town beside a lake, no readable text",{'flicker':0.3}),
(24.0,'cut',[L,A,C],['fog'],"The three brothers riding out at dawn on horseback along a coastal road, "+LU,{}),
(31.9,'cut',[V],['dust'],"Close-up of High Inquisitor Valerys with a hand on his heart, swearing, calm and unreadable",{'flicker':0.3}),
(37.3,'cut',[V],['dust'],"High Inquisitor Valerys pointing at the map toward a distant town by a lake",{'flicker':0.3}),
(43.1,'cut',[LK],['fog'],LAKE+"dry and cracked under a pale moon, a vision, no people",{'grade':'cold'}),
(48.5,'cut',[V],['dust'],"Extreme close-up of Valerys's hard grey eyes, something unsaid",{'flicker':0.3}),
(53.9,'cut',[A,C],['dust'],"Arthas and Cedric standing side by side in the cathedral, trusting, unknowing",{'flicker':0.3}),
(59.8,'cut',[KIN,AL],['dust'],"In a dark counting room, well-dressed merchants of the brothers' family shaking hands with Aldraik over a chest of gold",{'grade':'red','flicker':0.4}),
(65.3,'cut',[KIN],['dust'],"Merchants laughing in the dark around a table of coins and ledgers, faces lit from below",{'grade':'red','flicker':0.4}),
(70.25,'cut',[A,C],['dust'],"Arthas and Cedric walking down a long church hall in the light, blind to it, proud",{}),
(77.0,'fade',[G],['fog'],"Mara's tavern at night with Ahm Dynasty guards posted at the door",{'flicker':0.3}),
(85.9,'cut',[L,G],['dust'],LU+"dropping gold coins into the gloved hand of an Ahm guard at the tavern door",{'flicker':0.3}),
(89.2,'cut',[L,M],['dust'],"Inside Mara's tavern, "+LU+"pressing a heavy purse into Mara's hands",{'flicker':0.3}),
(91.9,'cut',[M],['dust'],"Close-up of Mara, worried, holding a debt note with a wax seal, a week left, no readable text",{'flicker':0.3}),
(94.5,'cut',[AL,G],['dust'],"Aldraik and his guards lounging at the best table of Mara's tavern like they own it, cigar smoke",{'flicker':0.4}),
(97.1,'cut',[M,L],['dust'],"Mara leaning close to whisper to "+LU+"across the bar",{'flicker':0.3}),
(99.8,'cut',[KIN],['dust'],MEM+"well-dressed merchants of the brothers' family in Cobh handing sealed barrels to Ahm Dynasty guards",{'grade':'red'}),
(102.45,'cut',[KIN],['dust'],"The merchants laughing behind their hands at two paladins passing by in the street",{'grade':'red'}),
(105.1,'cut',[L,A,C],['dust'],TAV+LU+"looking across the room at Arthas and Cedric, a hard truth he has to tell them",{'flicker':0.3}),
(107.45,'cut',[L,A,C],['fog'],"The three brothers riding hard on horseback along a cliff road toward the sea",{}),
(110.3,'cut',[],['fog'],COBH+"seen from a hill at sunset, no people close",{}),
(116.5,'flash',[L,A,C],['dust'],"The three brothers on horseback on a ridge above the harbour town of Cobh at sunset, "+LU+"heroic, low angle",{}),
(119.8,'cut',[LK],['fog'],LAKE+"dry and cracked at dusk, the stones casting long shadows, no people",{'grade':'cold'}),
(122.4,'cut',[L],['dust'],LU+"drinking from a cup of water at a town fountain, tasting, testing it",{}),
(125.4,'cut',[],['fog'],"Under the cracked mud of a dry lakebed, black goo stirring and bubbling up through the cracks",{'grade':'green'}),
(127.7,'cut',[L,A,C],['sparks'],"Close-up of three hands: Arthas's gauntlet on his sword hilt, Cedric's hand on his staff, Lucien's hand with the glowing dagger, crossed together, an oath",{'flicker':0.4}),
(133.0,'cut',[],['fog'],COBH+"the town gate at night, guards watching from the walls, unwelcoming",{'grade':'cold'}),
(140.0,'fade',[L,A,C],['dust'],COBH+"the three brothers walking down a busy harbour street, "+LU,{}),
(146.6,'cut',[MY],['dust'],COBH+"the mayor striding up through the market, proud and cross, her retinue behind her",{}),
(149.0,'cut',[L,MY],['dust'],COBH+LU+"holding up a vial of water to the light at a fountain while the mayor glares at him",{}),
(151.9,'cut',[A,C,MY],['dust'],COBH+"Arthas and Cedric telling the mayor about corrupt guards",{}),
(154.3,'cut',[L],['dust'],"Close-up of a vial of black blood in "+LU+"'s hand, held up as proof",{'grade':'green'}),
(157.0,'cut',[MY],['dust'],"Close-up of the mayor's face flaring with anger",{'grade':'red'}),
(159.65,'cut',[MY,L,A,C],['dust'],COBH+"the mayor pointing the brothers away, furious, a crowd watching",{}),
(167.0,'fade',[L,A,C],['dust'],PAWS+"the three brothers stepping in, "+LU,{'flicker':0.4}),
(169.7,'cut',[L],['dust'],PAWS+LU+"standing on a table with his lute, a string snapped, cats and patrons staring flatly, a failed entrance",{'flicker':0.4}),
(172.9,'cut',[A,C],['dust'],PAWS+"Arthas and Cedric at a corner table questioning two off-duty town guards over ale",{'flicker':0.4}),
(175.35,'cut',[LE],['dust'],PAWS+"Leify the beautiful waitress dealing cards at a table, a cat on the table",{'flicker':0.4}),
(177.7,'cut',[LE,FA],['dust'],PAWS+"Leify's rough, burly father grabbing her by the arm, shouting at her",{'flicker':0.4}),
(180.4,'cut',[L,FA],['sparks'],PAWS+LU+"stepping between them, leaning into the father's face, purple sparks in his eyes, menacing",{'flicker':0.5}),
(183.8,'cut',[FA],['dust'],PAWS+"the burly father backing away, hands up, cowed",{'flicker':0.4}),
(186.65,'cut',[LE,L],['dust'],PAWS+"Leify looking at "+LU+", not happy to see him but grateful",{'flicker':0.4}),
(193.7,'flash',[],[],None,{'img':'s24'}),
(197.15,'cut',[],[],None,{'img':'s25'}),
(200.0,'cut',[],[],None,{'img':'s26'}),
(202.7,'cut',[],[],None,{'img':'s27'}),
(205.4,'cut',[],[],None,{'img':'s28'}),
(210.7,'cut',[],[],None,{'img':'s29'}),
(219.15,'flash',[L],['sparks'],"On a stormy hilltop at night, "+LU+"catching a bolt of lightning in a glass bottle with his magic, the bottle blazing white",{'shake':0.4}),
(221.5,'cut',[CR,CW],['sparks'],"Crackle holding up the glowing bottle of lightning in triumph, Caroline staring at it in shock",{'flicker':0.4}),
(224.5,'cut',[L,CW],['dust'],LU+"grinning and teasing Caroline, who rolls her eyes but can't help a smile",{}),
(226.8,'cut',[CR,L,A,C],['fog'],"Crackle leading the three brothers through a dark forest at night with a lantern",{}),
(229.1,'cut',[N,LK],['fog'],LAKE+"the druid Neris waiting among the standing stones at the edge of the dry lakebed, moonlight",{'grade':'cold'}),
(231.9,'cut',[N],['fog'],"Close-up of Neris, gaunt, amber eyes, a strange smile",{'grade':'cold'}),
(234.9,'cut',[L,A,C,LK],['fog'],LAKE+"drops of the brothers' blood falling from cut palms onto the cracked dry lakebed",{'grade':'cold'}),
(237.4,'flash',[LK],['fog'],LAKE+"black goo surging up through every crack, flooding the lakebed, the slack chains disappearing under it",{'grade':'green','shake':0.5}),
(243.0,'cut',[LK],['fog'],LAKE+"filled to the brim with thick black goo under the moon, no people",{'grade':'green'}),
(251.0,'cut',[N],['fog'],"Neris running away into the dark forest, looking back over his shoulder",{'grade':'cold'}),
(260.65,'cut',[L],['embers'],"Close-up of "+LU+"furious, purple fire flaring in his hands",{'flicker':0.5}),
(263.7,'cut',[],['fog'],"Close-up of the black goo surface choking the old moonwell, thick and oily",{'grade':'green'}),
(266.4,'cut',[],['fog'],"A dark forest at night, wide and empty",{'grade':'cold'}),
(269.1,'cut',[N],['fog'],"Neris disappearing between the trees, only a shape",{'grade':'cold'}),
(277.5,'fade',[L,A,C,LK],['fog'],LAKE+"the three brothers standing on the shore of the black goo lake under the moon, seen from behind",{'grade':'cold'}),
(283.2,'cut',[],['fog'],"The black surface of the lake rippling, something stirring deep beneath it, no people",{'grade':'cold'}),
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
assert sid('s24')['scene'].startswith('The three brothers on horseback') and sid('s29')['scene'].startswith(COBH+'the town gate')
L10=json.load(open('painted/10-ahm-dynasty.json')); L11=json.load(open('painted/11-hunger-grows.json'))
L4=json.load(open('painted/04-cleansing-well.json')); L3=json.load(open('painted/03-first-moonwell.json')); L10=json.load(open('painted/10-ahm-dynasty.json'))
cast={'lucien':L4['cast']['lucien'],'arthas':L4['cast']['arthas'],'cedric':L4['cast']['cedric'],'neris':L4['cast']['neris'],'valerys':L6['cast']['valerys'],
 'mara':L12['cast']['mara'],'aldraik':L3['cast']['aldraik'],'guard':L10['cast']['guard']}
cast.update({'lake':"the moon lake of Cobh, as in the reference painting",'mayor':"the mayor of Cobh: an older lady in her late sixties, small and upright, deeply lined stern face, thin pressed lips, sharp pale eyes, silver-white hair in a severe tight bun, a high-collared dark blue coat with silver buttons and a heavy silver chain of office, a walking cane; strict, proud, unamused",
 'leify':"Leify, Lucien's old fling: a very beautiful young woman in her twenties, long wavy chestnut hair, green eyes, freckles, a tavern waitress's laced bodice and apron, a cool, unimpressed look",
 'caroline':"Caroline, Lucien's old girlfriend: a strikingly beautiful, elegant young woman, long sleek raven-black hair, dark eyes, a fitted deep-blue dress, a teasing, confident smile, far out of most men's league",
 'crackle':"Crackle, an eccentric young professor in his late twenties: very tall, slim and skinny with long limbs, a big shock of wild frizzy ginger hair standing up as if struck by lightning, a thin ginger moustache, a brass pince-nez on a chain, a long patched tweed coat with bulging pockets of brass instruments and copper wire, scorch marks on his sleeves, an eager, nervous, hopelessly-in-love face",
 'father':"Leify's father: a big, rough, burly man in his fifties with a red face and thick beard, a dock worker's clothes",
 'kin':"well-dressed merchants of Cobh, men and women in rich dark clothes with gold rings, smug"})
board={"id":"journey-cobh","live":False,'cover':'s24','style':L12['style'],'cast':cast,'shots':shots}
head_={k:v for k,v in board.items() if k!='shots'}
out=json.dumps(head_,ensure_ascii=False,indent=2)[:-2]+',\n  "shots": [\n'+',\n'.join('    '+json.dumps(s,ensure_ascii=False) for s in shots)+'\n  ]\n}\n'
json.loads(out);open('painted/07-journey-cobh.json','w').write(out)
ts=[s['t'] for s in shots]
print(len(shots),'shots',sum(1 for s in shots if 'img' not in s),'new','mono',all(a<b for a,b in zip(ts,ts[1:])),'maxhold',round(max(b-a for a,b in zip(ts,ts[1:]+[295.5])),1))
