"""Storyboard for The Story So Far (painted/00-story-so-far.json). Run from chronicle/: python painted/make/00.py <final5.json>
Shots sit on the conversation's line times. ('L', level, keyword) reuses a painting from another level (copied into
public/chronicle/levels/00-story-so-far/), ('N', scene, who) is a new painting at the fire."""
import json,glob,shutil,os,sys
D=json.load(open(sys.argv[1])); T={l['beat']:l['times'] for l in D['lines']}
B={f.split('/')[-1][:2]:json.load(open(f)) for f in glob.glob('painted/[01]*.json') if f.split('/')[-1][:2].isdigit() and f.split('/')[-1][:2]!='00'}
DIR={k:[f for f in glob.glob('painted/%s-*'%k) if os.path.isdir(f)][0].split('/')[-1] for k in B}
L,DR,A,C='lucien','drow','arthas','cedric'
LU="Lucien Vale (long blond hair, pointed ears, burgundy coat) "
FIRE="deep underground in the Down Deep, in a quiet corner of Thorman's camp (a half-abandoned underground town of carved stone houses, rock ceiling, no sky), at a small campfire of their own, warm firelight, the two of them alone: "
LU="Lucien Vale (long blond hair, pointed ears, burgundy coat) "
MEM="painted like a faded memory, soft haze, muted colours, "
BASE="deep underground in the Down Deep, in a quiet corner of Thorman's camp (a half-abandoned underground town of carved stone houses, rock ceiling, no sky), at a small campfire of their own, warm firelight, the two of them alone: "
FAR=BASE+"they sit on opposite sides of the fire, apart: "
NEAR=BASE+"she has moved closer, now beside the fire at his side: "
CLOSE=BASE+"they sit side by side, close together: "
SE='severin'
P=[
(1,0,'N',FAR+"wide shot: the beautiful drow woman sitting alone on a stone by the small fire, cool and aloof, "+LU+"walking up to her with a crooked grin",[L,DR]),
(1,3,'N',FAR+"close-up of the drow woman, one white eyebrow raised, cold, unimpressed",[DR]),
(1,5,'N',FAR+"close-up of "+LU+"with a tired, crooked, charming smile, a hand on his chest",[L]),
(1,9,'N',FAR+LU+"sitting down across the fire from the drow woman, who looks away, bored",[L,DR]),
(2,1,'N',FAR+"close-up of "+LU+"looking into the fire, the smile gone, his voice low",[L]),
(2,4,'N',MEM+"young "+LU+"and Severin, a tall pale woman with long silver-white hair and mint-green eyes, laughing together in a sunlit garden, in love",[L,SE]),
(2,6,'N',MEM+"a dark ritual chamber lit by infernal red light: Severin raising a dagger with a faintly glowing blade over "+LU+"lying on a stone altar inside a burning circle of runes, her face cold",[L,SE]),
(2,8,'N',MEM+"grey dawn in the ruined ritual chamber, "+LU+"alone on the stone altar, alive, gasping, wild purple sparks crackling around his hands, the dagger beside him",[L]),
(2,11,'N',MEM+LU+"standing at the prow of a small ship at dusk, a dark island with cliffs rising out of the sea ahead",[L]),
(2,12,'N',FAR+"close-up of the drow woman, cold, her violet eyes narrowing at him",[DR]),
(2,14,'N',FAR+"close-up of the drow woman caught off guard, studying him for the first time, a flicker of interest",[DR]),
(3,0,'L','01','Exterior of a crooked timber tavern'),
(3,1,'N',"Inside a smoky crowded island tavern at night, "+LU+"playing a silver flute for his supper, a few coins on the table, nobody really listening",[L]),
(3,2,'L','01','Lucien Vale and Silas face to face'),
(3,4,'N',FAR+"the drow woman giving "+LU+"a flat deadpan look, chin on her hand",[L,DR]),
(3,6,'L','01','Arthas the paladin in the doorway'),
(3,9,'L','01','Cedric Cold-Eye the monk leaning'),
(3,10,'L','01','The three half-brothers standing in the wrecked warehouse'),
(3,12,'N',MEM+"by a candle, Arthas in dark hooded plate and bald Cedric the monk reading a sealed letter together, surprised, no readable text",[A,C]),
(3,15,'N',FAR+"close-up of the drow woman, quieter, almost kind",[DR]),
(3,16,'N',FAR+"close-up of "+LU+"smiling it off, but his eyes are sad",[L]),
(4,0,'L','01','Horror close-up'),
(4,2,'L','01','Severin standing at the edge'),
(4,5,'L','02','handing out small glass potion'),
(4,8,'L','02','teeth sinking'),
(4,10,'L','02','dagger in his hand humming'),
(4,11,'N',FAR+LU+"taking a swig from a small hip flask, the dagger at his belt glowing faintly with a thin curl of whispering shadow",[L]),
(4,13,'N',FAR+"the drow woman glancing at the faintly glowing dagger on "+LU+"'s belt, curious despite herself",[L,DR]),
(5,0,'L','03','vial of glowing silver moonwell water'),
(5,4,'L','03','secretly drinking'),
(5,7,'L','03','refilling the empty vial'),
(5,8,'N',FAR+"close-up of the drow woman frowning at him, cold, judging",[DR]),
(5,9,'N',FAR+LU+"shrugging with a guilty half-smile, palms up",[L]),
(6,0,'L','04','silver goddess'),
(6,2,'L','08','The moon lake gone black'),
(6,3,'L','04','Rough armed men with torches'),
(6,4,'N',FAR+"the drow woman glancing over her shoulder into the dark, uneasy",[DR]),
(6,6,'N',FAR+LU+"calling the name out into the dark cave with a grin, the drow woman wincing",[L,DR]),
(6,10,'L','03','very wide shot: the whole corrupted'),
(6,11,'L','03','engulfed inside'),
(7,0,'L','04','dark silhouette of a huge pig-headed'),
(7,1,'L','05','the Pig wading in the pool of blood'),
(7,3,'L','05','barred window high in the stone wall exploding'),
(7,4,'L','05','Silhouettes of prisoners'),
(7,6,'N',FAR+"close-up of the drow woman looking at him softly for the first time, firelight in her eyes",[DR]),
(7,8,'N',FAR+"close-up of "+LU+"staring into the fire, no smile, haunted",[L]),
(8,0,'L','06','Close-up of High Inquisitor Valerys'),
(8,4,'L','06','glancing from the grate'),
(8,6,'L','06',"Valerys's eyes in shadow"),
(8,9,'N',NEAR+"the drow woman, now sitting a little closer, amused, chin on her knee",[DR]),
(8,10,'N',NEAR+LU+"turning to her with a warm crooked smile, she meets his eyes",[L,DR]),
(9,0,'L','07','waiting among the standing stones'),
(9,1,'L','08','kneeling at the edge of the glowing blue moon lake'),
(9,2,'L','08','One of the six iron chains'),
(9,3,'L','08','Looking straight down onto the ink-black'),
(9,6,'L','08','driving the glowing blue dagger into his own chest'),
(9,7,'N',NEAR+"the drow woman leaning in toward "+LU+", genuinely curious, asking",[L,DR]),
(9,10,'N',NEAR+"close-up of "+LU+"looking down at the faintly glowing dagger in his hands, unsure",[L]),
(10,0,'L','07','catching a bolt of lightning'),
(10,2,'L','07','Crackle holding up the glowing bottle'),
(10,3,'N',NEAR+"the drow woman teasing "+LU+"with a sly smile",[L,DR]),
(10,5,'L','08','leaping high onto the black wyrm'),
(10,6,'L','08','carrying the black wyrm'),
(10,10,'L','08','A wild feast'),
(10,11,'L','08','waking up in a stone gaol'),
(10,12,'L','08','waking up hungover'),
(10,13,'N',NEAR+"the drow woman laughing behind her hand, "+LU+"looking innocent",[L,DR]),
(11,0,'L','10','lowering her scarlet hood'),
(11,3,'N',NEAR+"close-up of "+LU+"quiet and hurt, looking at nothing",[L]),
(11,4,'L','10','gripping'),
(11,5,'L','10','faceless male silhouette'),
(11,7,'L','10',"shouting 'traitor'"),
(11,8,'N',NEAR+"the drow woman laying her hand gently on "+LU+"'s arm, warm and caring",[L,DR]),
(11,12,'N',NEAR+"close-up of the drow woman with a soft, gentle smile",[DR]),
(11,13,'N',NEAR+"close-up of "+LU+"looking at her, surprised by himself, a small real smile",[L]),
(12,0,'L','10','disguised as a rich ambassador'),
(12,1,'L','10','royal crown seal'),
(12,2,'L','10','gills opening'),
(12,3,'N',CLOSE+"the drow woman leaning in to peer at the side of "+LU+"'s neck, playful",[L,DR]),
(12,6,'N',CLOSE+"close-up of "+LU+"leaning in, eyes glowing faintly in the dark, a warm smile",[L]),
(12,7,'N',CLOSE+"close-up of the drow woman's glowing violet eyes and a slow playful smile",[DR]),
(13,0,'L','11','pinning a Church sun badge'),
(13,2,'N',CLOSE+LU+"proudly holding up a small engraved golden Church sun badge to the firelight, grinning",[L]),
(13,3,'N',CLOSE+"close-up of the drow woman mouthing the letters, eyebrows rising, delighted",[DR]),
(13,6,'L','11','Silas, more wolf than man'),
(13,7,'L','11','behind him the ghostly translucent figure of Severin'),
(13,11,'L','11','dark wolf-shaped shadow being torn out'),
(13,13,'L','11','Silas lying collapsed'),
(13,16,'L','11','laughing with delight'),
(13,18,'N',CLOSE+"close-up of the drow woman, concerned and caring, searching his face",[DR]),
(13,19,'N',CLOSE+"close-up of "+LU+"with a tired honest look, his hand on the glowing dagger at his belt",[L]),
(14,0,'L','12','pressing a heavy leather pouch'),
(14,1,'L','12','Wide shot: Duncastle holding'),
(14,2,'L','12','their mother at the gate'),
(14,3,'L','12','breaking the crystal'),
(14,5,'L','12','Oathbreaker Valerys revealed'),
(14,6,'L','12','swallowing Oathbreaker'),
(14,7,'N',CLOSE+"the drow woman and "+LU+"quiet, both looking into the flames, her shoulder against his",[L,DR]),
(15,0,'L','13','standing on a wooden crate'),
(15,1,'L','13','the three brothers walking into the vast dark'),
(15,2,'L','13','Arthas swinging his flaming sword and missing'),
(15,3,'L','13','Close-up of Cedric clutching his head'),
(15,4,'N',CLOSE+"close-up of the drow woman gazing into the fire, knowing, protective",[DR]),
(15,6,'N',CLOSE+"close-up of "+LU+"determined, jaw set, firelight",[L]),
(16,0,'N',CLOSE+"the drow woman counting his troubles on her fingers, half teasing, half worried, "+LU+"wincing",[L,DR]),
(16,2,'N',"Extreme close-up of a dagger with a faintly glowing blade at a belt in firelight, a thin curl of whispering shadow around it",[]),
(16,4,'L','10','faceless male silhouette'),
(16,6,'L','08','The moon lake gone black'),
(16,8,'N',CLOSE+"close-up of the drow woman, tender, worried for him",[DR]),
(16,10,'N',CLOSE+LU+"leaning close to the drow woman, their faces near, firelight",[L,DR]),
(16,11,'N',CLOSE+"close-up of the drow woman laughing softly, eyes closed, charmed",[DR]),
(16,13,'N',CLOSE+"the drow woman and "+LU+"side by side by the dying fire, her head on his shoulder, his hand in hers, warm, nothing explicit",[L,DR]),
]
shots=[];src={};MOVES=[([0,0,0.04],[0,0,0.16]),([-0.04,0,0.05],[0.04,0,0.1]),([0,0,0.18],[0,0,0.05]),([0.04,0.02,0.02],[-0.03,0,0.1]),([0,0.03,0.02],[0,0,0.14])]
seen={}
for i,p in enumerate(P):
  b,u=p[0],p[1]; t=0 if i==0 else round(T[b][u]-0.15,2)
  d={'id':'s%02d'%(i+1),'t':t,'in':'fade' if u==0 else 'cut','fx':['embers'] if p[2]=='N' else ['dust'],'move':{'from':MOVES[i%5][0],'to':MOVES[i%5][1]}}
  if p[2]=='N': d['who']=p[4]; d['scene']=p[3]; d['flicker']=0.4
  else:
    lv,k=p[3],p[4]; hit=[s for s in B[lv]['shots'] if k.lower() in s.get('scene','').lower() and 'img' not in s]
    assert hit,(lv,k); sid=hit[0]['id']; key=(lv,sid)
    if key in seen: d['img']=seen[key]; d['who']=[]
    else: seen[key]=d['id']; d['who']=[]; src[d['id']]=(DIR[lv],sid); d['copied']='%s/%s'%(DIR[lv],sid)
    for g in ('grade',):
      if g in hit[0]: d[g]=hit[0][g]
  shots.append(d)
ts=[s['t'] for s in shots]; assert all(a<b for a,b in zip(ts,ts[1:])),'times not increasing'
os.makedirs('../public/chronicle/levels/00-story-so-far',exist_ok=True)
for sid,(lvdir,s) in src.items(): shutil.copy('../public/chronicle/levels/%s/%s.webp'%(lvdir,s),'../public/chronicle/levels/00-story-so-far/%s.webp'%sid)
L13=json.load(open('painted/13-down-deep.json'))
cast={k:L13['cast'][k] for k in ['lucien','drow','arthas','cedric']}
cast['severin']=json.load(open('painted/11-hunger-grows.json'))['cast']['severin']
board={"id":"story-so-far","live":False,'cover':'s01','style':L13['style'],'cast':cast,'shots':shots}
head_={k:v for k,v in board.items() if k!='shots'}
out=json.dumps(head_,ensure_ascii=False,indent=2)[:-2]+',\n  "shots": [\n'+',\n'.join('    '+json.dumps(s,ensure_ascii=False) for s in shots)+'\n  ]\n}\n'
json.loads(out); open('painted/00-story-so-far.json','w').write(out)
print(len(shots),'shots', sum(1 for s in shots if 'scene' in s),'new', len(src),'copied', 'maxhold',round(max(b-a for a,b in zip(ts,ts[1:]+[D['duration']])),1))
