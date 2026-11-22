"""Storyboard for the DM video "Tyr's price" (hidden, secret, link-only, after level 14). Run from chronicle/: python painted/make/14t.py
Plan, script, voices, SFX and music: painted/dm-tyr/ (plan.md, voice/script.json, timeline.json, lines.json).
Shot times hang off the voice lines (L(i) = start of subtitle line i, lines.json), so re-recording a clip and rerunning
painted/dm-tyr/timeline.py + this script keeps everything in sync. `sfx` on a shot = the sound placed on its first frame.
HERO shots are painted with gemini-3-pro-image (2K); the rest with Flash 3.1 (batch)."""
import json
D='painted/dm-tyr/'
LINES=json.load(open(D+'lines.json')); TL=json.load(open(D+'timeline.json'))
L=lambda i,dt=0: round(LINES[i]['t']+dt,2)
C=lambda cid,k=0: TL['clips'][cid][k]
L14=json.load(open('painted/14-hunt-valerys.json')); L13=json.load(open('painted/13-down-deep.json'))
LU,AR,CE,NE,WI,VA,SE,DO,YV,BA,BC='lucien','arthas','cedric','drow','wittan','valerys','serpent','dolkan','young_valerys','boy_arthas','boy_cedric'
YB='young_valerys_bare'  # the night of the bargain: armour stripped off (script: 'stripped of his armor and pride')
PARTY=[LU,AR,CE,NE,WI]
ONLY=', exactly these people and no one else'
NP=', no people'
CAVE=("deep underground in the Down Deep, a lightless world of caverns, rock ceilings, no sky, in a massive cavern, its floor torn and cracked "
      "around a fresh crater where a colossal worm dived beneath the stone, rubble everywhere, a still black pool, dust hanging in torchlight, ")
MEM='a memory from twenty years ago, '
SANCT=(MEM+"the deepest chamber beneath the cathedral of Tyr in the city of Caer Callidyr at night: a vast shadowy stone sanctum, towering gothic arches, "
       "tall leaded stained-glass windows lashed by rain from outside (the stone floor inside is dry), cold stone floor, iron candelabra with candles, ")
TYR=("a colossal stone statue of Tyr, the one-handed god of justice, towering over the sanctum: a stern bearded warrior king in stone robes, "
     "a blindfold carved across his eyes, his right arm ending at the wrist with no right hand, his left hand raising a great stone longsword, "
     "a set of stone scales hanging from the sword's crossguard, weathered pale stone")
BOYS=("two small boys of five and six lying side by side on wool blankets on the cold stone floor, pale as chalk, drenched in sweat, "
      "black unnatural veins creeping up their necks; the boy with short dark hair is Cedric, the slightly older boy with light brown hair is Arthas")
FWD='a flash-forward vision in a cold blue-grey palette, '
COLD={'grade':'cold'}
S_=[
# ---------- I. the silence after the wurm (0-31): no voice ----------
('s01',0,'black',[],['dust'],CAVE+"wide, the moment after the dive: dust settling over the fresh crater"+NP,{},'rumble'),
('s02',4.5,'fade',[],['dust'],CAVE+"close on the cracked floor, small stones still trembling, dust sinking in torchlight"+NP,{},''),
('s03',8.5,'cut',[],['dust'],CAVE+"close on the still black pool, a single drop of dark water falling, rings spreading"+NP,{},'drips'),
('s04',12.0,'cut',[VA],['dust'],CAVE+"Oathbreaker Valerys collapsed against a rock by the black pool, armour torn to pieces, bleeding, breathing shallowly",{},''),
('s05',16.0,'cut',PARTY,['dust'],CAVE+"Lucien (long blond hair, burgundy coat), Arthas in dark plate and hood, Cedric the bald monk, Nerrissa the drow and Wittan the deep gnome frozen in a loose ring, weapons ready, staring at the cracked floor"+ONLY,{},''),
('s06',20.0,'cut',[DO],['fireflies'],CAVE+"among jagged rocks in deep shadow: Dolkan's glowing white eyes, hunched, muttering to a few glowing violet spores in his palm",{'flicker':0.2},''),
('s07',23.5,'cut',[DO],['dust'],CAVE+"Dolkan stepping out from the jagged rocks, his mad grin fading, staring at the bleeding Valerys",{},''),
('s08',26.5,'cut',[DO],['dust'],CAVE+"tight head-and-shoulders close-up of Dolkan alone, his scarred face going hard and grim, all madness gone, glowing white eyes, the dark cavern blurred behind him, only one figure in the picture, Dolkan appears once"+ONLY,{},''),
('s09',29.4,'flash',[DO],['sparks'],CAVE+"HERO: Dolkan, hood down, his bald head, tuft and braided beard clearly visible, exactly as in his reference, slamming his twisted wooden staff crowned with a cluster of pale crystals into the stone floor, the crystals flaring, a ring of violet light and spores bursting outward",{'shake':0.6},'staff'),
('s10',30.25,'cut',PARTY,['fireflies'],CAVE+"a wave of glowing violet spores rushing over Lucien, Arthas, Cedric, Nerrissa and Wittan, their eyes going wide"+ONLY,{'shake':0.2},'spores'),
# ---------- II. "Listen closely, boys" ----------
('s11',L(0),'cut',[DO],['fireflies'],CAVE+"close-up of Dolkan speaking low and urgent, violet spore light on his scarred face",{},''),
('s12',L(1),'cut',[AR,CE,LU],['dust'],CAVE+"Arthas (hood up, helm closed), Cedric and Lucien listening, tense, violet spores drifting around them"+ONLY,{},''),
('s13',L(2),'cut',[DO,VA],['dust'],CAVE+"over Dolkan's shoulder toward the bleeding Valerys by the black pool"+ONLY,{},''),
('s14',L(3),'fade',[],['dust'],MEM+"the white stone cathedral city of Caer Callidyr at dusk, towering gothic arches and spires, banners with a gold sun"+NP,{},''),
('s15',L(3,4.4),'cut',[DO],['ash'],MEM+"a heavy iron door slamming shut on a small dwarf silhouette thrown into a black pit beneath the city, only torchlight above",{},''),
('s16',L(4),'flash',[DO],['fireflies'],CAVE+"Dolkan raising his staff, the cavern dissolving into swirling violet spores and falling rain, the wurm gone, no worm, no creature"+ONLY,{},''),
('s17',L(5),'fade',[],[],SANCT+"HERO: rain lashing a tall stained-glass window of Tyr from outside, a lightning flash behind the glass, the coloured light falling on the dark stone"+NP,COLD,'rain'),
('s18',L(5,3.8),'flash',[],[],SANCT+"wide: lightning filling all the tall windows at once, the vast dark sanctum lit white for an instant"+NP,COLD,'thunder'),
('s19',L(5,6.8),'cut',[],[],SANCT+"wide establishing view, candles flickering, rain streaming on the windows"+NP,{'flicker':0.3},''),
('s20',L(6),'fade',[],[],SANCT+"an empty wooden chair with a woman's dark travelling cloak left draped over it, a single candle, no one there"+NP,{'flicker':0.2},''),
('s21',L(6,4.5),'cut',[],[],SANCT+"a side door standing open to the rainy night, wet footprints fading on the stone and vanishing"+NP,COLD,''),
('s22',L(7),'fade',[BA,BC],[],SANCT+"HERO: "+BOYS+", candlelight, a vast dark space around them"+ONLY,{'flicker':0.3},'heart'),
('s23',L(7,4.3),'cut',[BC],[],SANCT+"close-up of little Cedric (short dark hair) feverish and pale, sweat on his brow, eyes half closed",{'flicker':0.2},''),
('s24',L(8),'cut',[],[],SANCT+"extreme close-up of black unnatural poison veins creeping up a small child's neck and arm, pulsing, the face out of frame, full-bleed painting edge to edge, no border, no frame, no white margin",{'flicker':0.2},''),
('s25',L(8,5.0),'cut',[BA],[],SANCT+"close-up of little Arthas (light brown hair) curled under a wool blanket, feverish and pale, eyes squeezed shut, black veins on his neck and wrist",{'flicker':0.2},''),
('s26',L(8,8.6),'cut',[],[],SANCT+"a healer's bag abandoned on the stone, potion bottles shattered, cold candles"+NP,{},''),
('s27',L(9),'cut',[BA,BC],[],SANCT+"wide: the two small boys tiny on the floor, and the dark looming shape of "+TYR+" above them in shadow"+ONLY,COLD,''),
('s28',L(10),'fade',[YB],[],SANCT+"HERO: young Valerys (black hair, about forty) kneeling on the cold stone before the statue, seen from behind, his armour thrown aside around him",{'flicker':0.2},''),
('s29',L(10,4.0),'cut',[],[],SANCT+"pieces of plate armour scattered on the stone floor, a breastplate with a gold sun emblem lying face up"+NP,{'flicker':0.2},''),
('s30',L(11),'cut',[YB],[],SANCT+"close-up of young Valerys's face, wrecked with grief, tears, black hair",{'flicker':0.2},''),
('s31',L(11,4.6),'cut',[],[],SANCT+"rain streaming down the stained glass, one candle guttering"+NP,COLD,''),
# ---------- III. the plea ----------
('s32',L(12),'cut',[YB],[],SANCT+"young Valerys small in the foreground, open hands raised, begging up at "+TYR,{'flicker':0.2},''),
('s33',L(13),'flash',[YB],[],SANCT+"young Valerys on his knees on the stone floor, shouting up at the statue, lightning behind the windows lighting him white",{'shake':0.3},'thunder'),
('s34',L(14),'cut',[YB],[],SANCT+"young Valerys kneeling, gripping the gold sun emblem torn from his white and crimson tabard, which lies discarded on the floor beside his armour",{'flicker':0.2},''),
('s35',L(15),'cut',[YB,BA,BC],[],SANCT+"young Valerys bent over the two feverish boys, his forehead to the cold stone, a hand on each small chest"+ONLY,{'flicker':0.2},''),
('s36',L(15,4.8),'cut',[],[],SANCT+TYR+", silent in the darkness, no light yet"+NP,COLD,''),
# ---------- IV. the god answers ----------
('s37',L(16),'flash',[],[],SANCT+"the candle and torch flames all freezing at once into still, blinding white fire without heat, frost spreading on the iron"+NP,{},'hiss'),
('s38',L(16,3.8),'cut',[],[],SANCT+"close-up of a row of candle flames frozen white and motionless, like crystal"+NP,{},''),
('s39',L(17),'cut',[BA,BC],[],SANCT+"long black shadows stretching like iron bars across the stone floor and over the two sleeping boys"+ONLY,COLD,''),
('s40',L(18),'cut',[],[],SANCT+TYR+", seen from below, a cold white light beginning to burn behind it"+NP,COLD,''),
('s41',L(19),'cut',[],[],SANCT+"close-up of the great stone longsword held upright in the single left stone hand of the statue of Tyr (blindfolded stone face just visible above, his right arm a handless stump), stone scales hanging from the crossguard, edges of white light running along the blade like a thousand drawn blades"+NP,{},'blades'),
('s42',C('d2b',1)+0.15,'flash',[YB],['sparks'],SANCT+"HERO: "+TYR+" blazing with blinding white light that fills the whole sanctum, young Valerys a small kneeling silhouette before it",{'shake':0.3},''),
('s43',L(20),'cut',[],[],SANCT+"close-up from below of the stone face of the statue of Tyr, a stern bearded warrior king, a thick carved stone blindfold covering both his eyes, majestic and cold, white light pouring from behind his head"+NP,{},''),
('s44',L(20,4.6),'cut',[],[],SANCT+"the stone scales hanging from the statue's sword, slowly tipping in the white light"+NP,{},''),
('s45',L(21),'cut',[BA,BC],[],SANCT+"the black veins on the sleeping boys pulsing, shadowy clawed shapes creeping out of the dark toward them, hunting"+ONLY,COLD,''),
('s46',L(22),'cut',[YB],[],SANCT+"young Valerys tiny before the immense glowing statue, white light",{},''),
('s47',L(22,5.4),'cut',[],[],SANCT+"a vision in white light: a towering wall of stone rising between two small sleeping figures and a sea of creeping shadow"+NP,{},''),
('s48',L(23),'cut',[YB],[],SANCT+"close-up of young Valerys lifting his face, desperate, eyes wide",{},''),
('s49',L(24),'cut',[YB],[],SANCT+"from behind young Valerys, kneeling, looking up at "+TYR+", blazing with cold white light"+ONLY,{},''),
('s50',L(25),'cut',[],[],"a vision in cold white light: the great gates of the city of Caer Callidyr, tall and shut"+NP,COLD,''),
('s51',L(26),'cut',[],[],"a vision in cold white light: an empty road leading out of the city into dark forest and rain, nobody on it"+NP,COLD,''),
('s52',L(27),'cut',[YV],[],"a vision in white light: Valerys standing alone on the walls of Caer Callidyr like a shield, sword planted, the city behind him",{},''),
('s53',L(28),'cut',[YV],[],"a vision: Valerys's boots stopped at a glowing line of light across the threshold of the city gate",{},''),
('s54',L(28,5.6),'cut',[YB],[],SANCT+"a chain of golden light forming around young Valerys's chest",{},''),
('s55',L(29),'flash',[YV],['ash'],"a vision: Valerys consumed by a cold dark fire, his white robes blackening, a terrible warning",{'shake':0.4,'grade':'red'},''),
('s56',L(29,4.8),'fade',[],[],SANCT+"the statue's light dimming, the sanctum dark and still"+NP,COLD,''),
# ---------- V. the price ----------
('s57',L(30),'cut',[YB],[],SANCT+"a very close portrait of young Valerys's face, framed from forehead to chin, his face filling most of the picture, tears running down, eyes full of agony, warm candlelight on one side of his face, the dark sanctum blurred behind him",{'flicker':0.2},'heart'),
('s58',L(31),'cut',[YB,BA,BC],[],SANCT+"young Valerys kneeling, looking from the statue to the two feverish boys lying on blankets on the floor, a terrible choice on his face"+ONLY,{'flicker':0.2},''),
('s59',L(32),'cut',[YB],[],SANCT+"young Valerys turning away from the empty chair with the woman's cloak, rain on the glass behind",{'flicker':0.2},''),
('s60',L(33),'fade',[BC],['dust'],FWD+"HERO: little Cedric (short dark hair, a small bundle) led by two hooded monks through rain toward the gate of a mountain monastery",COLD,''),
('s61',L(33,4.8),'cut',[BC],['dust'],FWD+"little Cedric looking back over his shoulder in the rain, alone",COLD,''),
('s62',L(34),'fade',[BA,YV],[],FWD+"young Arthas, a boy of about eight with light brown hair, reaching up toward his father with hurt in his eyes, his father, who turns away in his white and crimson robes"+ONLY,COLD,''),
('s63',L(35),'cut',[YV,BA],[],FWD+"Valerys alone at a tall cathedral window, cold and distant, young Arthas (light brown hair) watching him sadly from a doorway behind"+ONLY,COLD,''),
('s64',L(35,6.4),'cut',[],[],FWD+"the great gates of Caer Callidyr swinging shut"+NP,COLD,'gate'),
('s65',L(36),'cut',[YB],[],SANCT+"young Valerys rising to his feet, steady, resolved",{'flicker':0.2},''),
('s66',L(37),'cut',[YB],[],SANCT+"HERO: young Valerys laying his longsword at the foot of the stone altar beneath the statue",{'flicker':0.2},'sword'),
('s67',L(38),'fade',[YB],['sparks'],SANCT+"HERO: young Valerys opening his arms wide as searing golden light floods down from the statue over him",{},''),
('s68',L(38,4.6),'cut',[BA,BC],['sparks'],SANCT+"golden light washing over the two sleeping boys"+ONLY,{},''),
('s69',L(39),'cut',[BA],['sparks'],SANCT+"close-up of little Arthas asleep on a blanket on the floor, his small arm in a linen sleeve lying across the blanket, the black poison veins on his arm and neck fading away in warm golden light, his face peaceful"+ONLY,{},''),
('s70',L(39,4.4),'cut',[YB],['sparks'],SANCT+"young Valerys's shadow pressed into the stone floor, a chain of golden light binding it to the stone",{},''),
('s71',L(39,8.2),'cut',[BA,BC],[],SANCT+"the two boys sleeping peacefully, colour back in their cheeks, warm candlelight"+ONLY,{},''),
('s72',L(40),'cut',[YB],[],SANCT+"close-up of young Valerys, calm resolve, golden light fading on his face",{},''),
('s73',L(41),'cut',[YB],[],SANCT+"young Valerys kneeling alone, the golden chain of light sinking into his chest, behind him "+TYR+", lit gold, no other figures, no hooded person",{},''),
# ---------- VI. back in the cavern ----------
('s74',C('v3',1)+1.2,'fade',[],['dust'],CAVE+"the violet spores scattering and fading, the black pool, a single drip"+NP,{},'drips'),
('s75',L(42),'cut',[DO],['dust'],CAVE+"Dolkan, sharp and unforgiving, staff in hand, glowing white eyes",{},''),
('s76',L(43),'cut',[],[],None,{'src':'12-fall-duncastle/s54'},''),
('s77',L(43,4.6),'cut',[VA],['dust'],CAVE+"Oathbreaker Valerys bleeding by the black pool, looking up",{},''),
('s78',L(44),'cut',[AR,CE,LU],['dust'],CAVE+"exactly three men side by side staring at their father: Arthas (hood up, helm closed), Cedric (shaved head, monk's robes, as in his reference) and Lucien"+ONLY,{},''),
('s79',L(45),'cut',[DO],['dust'],CAVE+"Dolkan with his eyes on the floor, dust jumping on the stones, urgent",{'shake':0.15},'rumble'),
('s80',L(45,4.6),'cut',[],['dust'],CAVE+"HERO: cracks racing across the floor toward the black pool, stones lifting, something huge rising beneath"+NP,{'shake':0.4},''),
('s81',C('d4b',1)+0.6,'flash',[],['ash'],CAVE+"the floor bursting upward in a spray of rock and dust, darkness"+NP,{'shake':0.8},'boom'),
('s82',C('d4b',1)+1.4,'black',[],[],CAVE+"near total darkness, only drifting dust in a thin shaft of torchlight"+NP,{},''),
]
# Pacing (Rasmus 2026-11-22: "images shift too fast"): a shot shorter than MIN_HOLD is merged into the one before it,
# unless it carries a sound hit, a flash, a hero painting or the opening; then soft transitions: cut -> fade, fade -> slow dissolve.
MIN_HOLD=6.0; MAX_HOLD=12.0
MARKS={x[0]:round(x[1],2) for x in S_}  # every planned moment, also the merged ones (painted/dm-tyr/mix.py places sound by these)
def _protected(x): return x[2] in ('flash','black') or x[7] or 'HERO' in (x[5] or '') or x[0]=='s01'
while True:
    ends=[S_[i+1][1] for i in range(len(S_)-1)]+[TL['end']]
    cand=[(ends[i]-S_[i][1],i) for i in range(1,len(S_)) if not _protected(S_[i]) and ends[i]-S_[i][1]<MIN_HOLD and ends[i]-S_[i-1][1]<=MAX_HOLD]
    if not cand: break
    S_.pop(min(cand)[1])
S_=[(x[0],x[1],{'cut':'fade','fade':'slow'}.get(x[2],x[2]))+tuple(x[3:]) for x in S_]
MOVES=[([0,0,0.04],[0,0,0.18]),([-0.04,0,0.05],[0.04,0,0.12]),([0,0,0.2],[0,0,0.05]),([0.05,0.02,0.02],[-0.04,0,0.12]),([0,0.04,0.02],[0,0,0.16]),([0.03,0,0.08],[-0.03,0,0.16])]
shots=[]
for k,(sid,t,tr,who,fx,scene,ex,sfx) in enumerate(S_):
    m=MOVES[k%len(MOVES)]
    d={'id':sid,'t':round(t,2),'in':tr,'who':who,'fx':fx}
    ex=dict(ex); src=ex.pop('src',None); d.update(ex); d['move']={'from':m[0],'to':m[1]}
    if scene: d['scene']=scene.replace('HERO: ','')
    if 'HERO' in (scene or ''): d['hero']=True
    if src: d['src']=src
    if sfx: d['sfx']=sfx
    shots.append(d)
ts=[s['t'] for s in shots]; assert all(a<b for a,b in zip(ts,ts[1:])), [(a,b) for a,b in zip(shots,shots[1:]) if a['t']>=b['t']]
cast={k:L14['cast'][k] for k in [LU,AR,CE,NE,WI,VA,SE]}
cast[DO]=L13['cast']['dolkan'].replace('; usually hunched, grinning and muttering to his spores','')
cast[YV]=("Valerys twenty years younger, about forty: the same face as in his reference (hard pale grey eyes, strong jaw, short beard) "
 "but jet-black close-cropped hair and a short black beard, no grey; a High Inquisitor of Tyr: white and crimson robes over plate armour, "
 "a gold sun emblem; strong, proud, grief-stricken")
cast[YB]=("Valerys twenty years younger, exactly the face, hair and beard of his reference (jet-black close-cropped hair, short black beard, hard pale grey eyes), "
 "but his plate armour, cloak and tabard stripped off and cast aside: only a sweat-soaked plain off-white linen shirt open at the throat, sleeves pushed up, "
 "dark breeches, bare-headed, no armour, no cloak, no emblem; strong, proud, grief-stricken")
cast[BA]="Arthas as a small boy of six: slight and pale, tousled light brown hair, serious pale grey eyes like his father's, a solemn little face, a plain linen nightshirt"
cast[BC]="Cedric as a small boy of five: short dark hair (not yet shaved), pale grey eyes, a thin pale face, a plain linen nightshirt"
board={"id":"tyrs-price","live":True,"secret":True,"cover":"s42","style":L14['style'],"cast":cast,"marks":MARKS,"shots":shots}
out=json.dumps({k:v for k,v in board.items() if k!='shots'},ensure_ascii=False,indent=2)[:-2]+',\n  "shots": [\n'+',\n'.join('    '+json.dumps(s,ensure_ascii=False) for s in shots)+'\n  ]\n}\n'
json.loads(out);open('painted/14-tyrs-price.json','w').write(out)
print(len(shots),'shots,',sum(1 for s in shots if s.get('hero')),'hero,',sum(1 for s in shots if 'src' not in s),'to paint; end',TL['end'])
