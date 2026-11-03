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
P=[
(1,0,'N',FIRE+"wide shot: the beautiful drow woman sitting on a stone by the small fire, "+LU+"walking up to her with a confident grin",[L,DR]),
(1,3,'N',FIRE+"close-up of the drow woman, one white eyebrow raised, unimpressed",[DR]),
(1,5,'N',FIRE+"close-up of "+LU+"grinning, a hand on his chest, very pleased with himself",[L]),
(1,9,'N',FIRE+LU+"sitting down across the fire from the drow woman, who hides a small smile",[L,DR]),
(2,0,'L','01','Exterior of a crooked timber tavern'),
(2,1,'L','01','Lucien Vale and Silas face to face'),
(2,2,'N',FIRE+"the drow woman giving "+LU+"a flat deadpan look, chin on her hand",[L,DR]),
(2,5,'L','01','Arthas the paladin in the doorway'),
(2,8,'L','01','Cedric Cold-Eye the monk leaning'),
(2,9,'L','01','The three half-brothers standing in the wrecked warehouse'),
(2,12,'N',FIRE+"close-up of "+LU+"flicking his long blond hair back with a smug smile",[L]),
(3,0,'L','01','Horror close-up'),
(3,2,'L','01','Severin standing at the edge'),
(3,4,'L','02','handing out small glass potion'),
(3,5,'N',FIRE+"close-up of the drow woman by the fire saying something wise, her violet eyes on him",[DR]),
(3,8,'L','02','teeth sinking'),
(3,9,'L','02','dagger in his hand humming'),
(3,10,'N',FIRE+"the drow woman glancing down at the faintly blue glowing dagger on "+LU+"'s belt, he covers it with his hand, sheepish",[L,DR]),
(4,0,'L','03','vial of glowing silver moonwell water'),
(4,4,'L','03','secretly drinking'),
(4,7,'L','03','refilling the empty vial'),
(4,8,'N',FIRE+"close-up of the drow woman frowning at him, appalled but amused",[DR]),
(4,9,'N',FIRE+LU+"shrugging with an innocent smile, palms up",[L]),
(5,0,'L','04','silver goddess'),
(5,2,'L','08','The moon lake gone black'),
(5,3,'L','04','Rough armed men with torches'),
(5,4,'N',FIRE+"the drow woman glancing over her shoulder into the dark, uneasy, lowering her voice",[DR]),
(5,6,'N',FIRE+LU+"throwing his arms wide and calling out into the dark cave with a grin, the drow woman wincing",[L,DR]),
(5,11,'L','03','very wide shot: the whole corrupted'),
(5,12,'L','03','engulfed inside'),
(6,0,'L','04','dark silhouette of a huge pig-headed'),
(6,1,'L','05','the Pig wading in the pool of blood'),
(6,3,'L','05','barred window high in the stone wall exploding'),
(6,4,'L','05','Silhouettes of prisoners'),
(6,6,'N',FIRE+"close-up of the drow woman looking at him softly, seeing him differently, firelight in her eyes",[DR]),
(6,7,'N',FIRE+"close-up of "+LU+"staring into the fire, no smile, the weight of it on him",[L]),
(7,0,'L','06','Close-up of High Inquisitor Valerys'),
(7,4,'L','06','An iron grate set in the church floor'),
(7,5,'L','06','glancing from the grate'),
(7,8,'N',FIRE+LU+"leaning a little closer across the fire with a charming smile, the drow woman amused",[L,DR]),
(8,0,'L','07','waiting among the standing stones'),
(8,1,'L','08','kneeling at the edge of the glowing blue moon lake'),
(8,2,'L','08','One of the six iron chains'),
(8,3,'L','08','Looking straight down onto the ink-black'),
(8,8,'L','08','driving the glowing blue dagger into his own chest'),
(8,10,'N',FIRE+"close-up of "+LU+"tapping his temple with a knowing wink",[L]),
(9,0,'L','07','catching a bolt of lightning'),
(9,2,'L','07','Crackle holding up the glowing bottle'),
(9,3,'N',FIRE+"the drow woman giving "+LU+"a long dry look, arms folded",[L,DR]),
(9,5,'L','08','leaping high onto the black wyrm'),
(9,6,'L','08','carrying the black wyrm'),
(9,10,'L','08','A wild feast'),
(9,11,'L','08','waking up in a stone gaol'),
(9,12,'L','08','waking up hungover'),
(9,13,'N',FIRE+"the drow woman trying not to laugh, a hand over her mouth, "+LU+"looking innocent",[L,DR]),
(10,0,'L','10','lowering her scarlet hood'),
(10,3,'L','10','gripping'),
(10,5,'L','10','faceless male silhouette'),
(10,6,'L','10',"shouting 'traitor'"),
(10,7,'N',FIRE+"the drow woman laying her hand gently on "+LU+"'s arm, he looks away with a wry sad smile",[L,DR]),
(11,0,'L','10','disguised as a rich ambassador'),
(11,1,'L','10','royal crown seal'),
(11,2,'L','10','gills opening'),
(11,3,'N',FIRE+"the drow woman leaning in to peer at the side of "+LU+"'s neck, curious",[L,DR]),
(11,6,'N',FIRE+"close-up of "+LU+"leaning in, eyes glowing faintly in the dark, a charming smile",[L]),
(11,7,'N',FIRE+"close-up of the drow woman's glowing violet eyes and a slow smirk",[DR]),
(12,0,'L','11','pinning a Church sun badge'),
(12,2,'N',FIRE+LU+"proudly holding up a small engraved golden Church sun badge to the firelight, beaming",[L]),
(12,3,'N',FIRE+"close-up of the drow woman mouthing the letters, eyebrows rising slowly",[DR]),
(12,6,'L','11','Silas, more wolf than man'),
(12,7,'L','11','behind him the ghostly translucent figure of Severin'),
(12,10,'L','11','dark wolf-shaped shadow being torn out'),
(12,13,'L','11','Silas lying collapsed'),
(12,15,'L','11','laughing with delight'),
(12,17,'N',FIRE+"close-up of the drow woman serious now, a warning in her eyes",[DR]),
(12,18,'N',FIRE+"close-up of "+LU+"with a small uneasy smile, his hand resting on the glowing dagger at his belt",[L]),
(13,0,'L','12','pressing a heavy leather pouch'),
(13,1,'L','12','Wide shot: Duncastle holding'),
(13,2,'L','12','their mother at the gate'),
(13,3,'L','12','breaking the crystal'),
(13,5,'L','12','Oathbreaker Valerys revealed'),
(13,6,'L','12','swallowing Oathbreaker'),
(13,7,'N',FIRE+"the drow woman and "+LU+"quiet by the fire, both looking down into the flames",[L,DR]),
(14,0,'L','13','standing on a wooden crate'),
(14,1,'L','13','the three brothers walking into the vast dark'),
(14,2,'L','13','Arthas swinging his flaming sword and missing'),
(14,3,'L','13','Close-up of Cedric clutching his head'),
(14,4,'N',FIRE+"close-up of the drow woman gazing into the fire, knowing, old wisdom of the deep",[DR]),
(14,6,'N',FIRE+"close-up of "+LU+"determined, jaw set, firelight",[L]),
(15,0,'N',FIRE+"the drow woman counting his troubles on her fingers, unimpressed, "+LU+"wincing",[L,DR]),
(15,3,'L','10','faceless male silhouette'),
(15,5,'L','08','The moon lake gone black'),
(15,6,'N',FIRE+"close-up of "+LU+"grimacing with a crooked grin",[L]),
(15,8,'N',FIRE+LU+"leaning close to the drow woman by the fire, charming, their faces near",[L,DR]),
(15,9,'N',FIRE+"close-up of the drow woman laughing softly, eyes closed, genuinely amused",[DR]),
(15,11,'N',FIRE+"the drow woman and "+LU+"side by side by the dying fire, her hand on his, warm, nothing explicit",[L,DR]),
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
board={"id":"story-so-far","live":False,'cover':'s01','style':L13['style'],'cast':cast,'shots':shots}
head_={k:v for k,v in board.items() if k!='shots'}
out=json.dumps(head_,ensure_ascii=False,indent=2)[:-2]+',\n  "shots": [\n'+',\n'.join('    '+json.dumps(s,ensure_ascii=False) for s in shots)+'\n  ]\n}\n'
json.loads(out); open('painted/00-story-so-far.json','w').write(out)
print(len(shots),'shots', sum(1 for s in shots if 'scene' in s),'new', len(src),'copied', 'maxhold',round(max(b-a for a,b in zip(ts,ts[1:]+[D['duration']])),1))
