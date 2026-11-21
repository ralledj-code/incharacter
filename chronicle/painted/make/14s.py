"""Storyboard for Sing Loud, Little Songbird (Lucien's memory of his father, level 14). Run from chronicle/: python painted/make/14s.py
Painted; the father's face is never shown (one half profile on SING LOUD, as in the vision)."""
import json,re
def load_beats(path):
    m = re.search(r'(?:const BEATS|L\.beats) = (\{.*?\});', open(path).read(), re.S)
    return json.loads(m.group(1))
B=load_beats('src/levels/L14-songbird.js')
near=lambda l,t: min(l,key=lambda x:abs(x-t))
def snap(t,k):
    if k not in ('cut','flash') or t==0: return t
    h,r,e=near(B['hits'],t),near(B['bars'],t),near(B['beats'],t)
    return h if abs(h-t)<=0.25 else r if abs(r-t)<=0.2 else e
L,DR,BOY,FA,BU='lucien','drow','boy','father','buckle'
MOVES=[([0,0,0.04],[0,0,0.2]),([-0.04,0,0.05],[0.04,0,0.12]),([0,0,0.22],[0,0,0.05]),([0.05,0.02,0.02],[-0.04,0,0.12]),([0,0.04,0.02],[0,0,0.18]),([0.03,0,0.08],[-0.03,0,0.16])]
LU="Lucien Vale (long blond hair, pointed ears, burgundy coat) "
NE="Nerrissa (the drow woman: dark purple-grey skin, long silver hair) "
ONLY=", exactly these people and no one else"
HID=", his face never visible: seen from behind or lost in deep shadow"
WELL="deep underground in the Down Deep, a lightless world of caverns, rock ceilings, no sky, in a deep cavern around an ancient ruined moonwell of carved stone filled with black blood, thick grey webs on the walls, cold blue light, "
MEM="painted like a warm, faded memory, golden amber haze, soft edges, "
TAV=MEM+"long ago, inside an old forest tavern at night: a low smoky room of dark timber, smoke curling in the rafters, lanterns and candles, a stone hearth with a fire, a small wooden stage by the hearth, whitewashed walls, "
CROWD="ordinary villagers and travellers in plain clothes at the tables (no one from the campaign), "
S_=[
(0,'black',[L,DR],['dust'],WELL+LU+"jolting out of the vision with a gasp by the black well, "+NE+"with a hand on his shoulder"+ONLY,{'grade':'cold'}),
(4.2,'cut',[L],['dust'],WELL+"close-up of "+LU+"eyes wet, still half inside the vision",{'grade':'cold'}),
(8.4,'cut',[L,DR],['dust'],WELL+LU+"and "+NE+"sitting on the stone rim of the old well, he speaks quietly, she listens"+ONLY,{'grade':'cold'}),
(12.6,'fade',[L],['embers'],"Close-up profile of "+LU+"eyes closed, his hands empty and resting, no instrument, cold blue cave light on one side of his face and warm amber firelight from a memory spilling over the other side",{}),
(16.7,'fade',[],['fireflies'],MEM+"long ago, an old forest tavern at night seen from outside: wet dark woods, warm glowing windows, smoke from the chimney, fog between the trees, no people",{}),
(22.99,'cut',[],['embers'],TAV+CROWD+"a cosy busy evening, cups of mead; the little stage by the hearth is empty, no musicians",{'flicker':0.3}),
(29.25,'cut',[BOY],['embers'],TAV+"close-up of a big wooden table: mead in a clay cup, a bowl of dark ripe blackberries, a small child's hands reaching for one",{'flicker':0.3}),
(35.52,'cut',[BOY],['embers'],TAV+"the small boy sitting at an oversized table, legs dangling from a too-big wooden chair, chin on his hands, staring at the stage",{'flicker':0.3}),
(41.5,'cut',[FA],['embers'],TAV+"on the small stage by the hearth, the tall man in the dark velvet travel cloak seen from behind, tuning a dark wooden lute"+HID,{'flicker':0.4}),
(47.15,'fade',[FA],['embers'],TAV+"the tall man playing the dark lute, seen from behind and to the side, his heavy fur-collared cloak falling to the floor, road dust on its hem"+HID,{'flicker':0.4}),
(53.33,'cut',[FA],['embers'],TAV+"close-up of long pale fingers with scars across the knuckles and a heavy silver ring on the little finger, playing the strings of a dark wooden lute",{'flicker':0.4}),
(59.86,'cut',[FA],['embers'],TAV+"close-up of ONE single silver belt buckle on the dark cloak of the man at his hip (only one buckle, part of his cloak and belt around it; a stylised wolf head of old worn silver with open jaws and two small dark red stones for eyes), a stylised beast head with open jaws and two small dark red stones for eyes, glinting in the firelight",{'flicker':0.5}),
(66.19,'cut',[BOY],['embers'],TAV+"the small boy drowsy, head resting on his arms on the table, eyes half closed, a soft smile",{'flicker':0.3}),
(72.53,'cut',[FA,BOY],['embers'],TAV+CROWD+"wide shot: the tall man on the little stage singing across the heads of the crowd toward the small boy at his table"+HID,{'flicker':0.4}),
(77.52,'cut',[],['embers'],TAV+CROWD+"the patrons swaying gently with their cups, smiling, eyes soft, seen from the stage side, no musicians anywhere",{'flicker':0.3}),
(82.05,'cut',[],['fireflies'],TAV+"through a small tavern window: fog drifting between dark trees outside, no people",{}),
(88.21,'cut',[BOY],['embers'],TAV+"close-up of the small boy mouthing the words of the song, eyes shining",{'flicker':0.3}),
(92.6,'cut',[],['embers'],TAV+"candles burning low on a table, wax running, smoke curling up, no people",{'flicker':0.4}),
(96.54,'fade',[],['ash'],TAV+CROWD+"all the patrons humming with their eyes closed at the same moment, strangely still, the room gone quiet and heavy",{'flicker':0.3,'grade':'red'}),
(102.18,'cut',[],['ash'],TAV+"faint pale ghostly faces drifting in the pipe smoke above the crowd's heads, barely there",{'grade':'red'}),
(108.53,'cut',[],['ash'],TAV+"every candle flame leaning the same way; on the whitewashed wall the patrons' shadows sway out of time with the people",{'flicker':0.5,'grade':'red'}),
(114.69,'cut',[],['ash'],TAV+"on the whitewashed wall the patrons' shadows growing wolf ears and long snouts while the people below hum on, unaware",{'flicker':0.5,'grade':'red'}),
(121.89,'cut',[FA],['ash'],TAV+"the tall man's shadow on the whitewashed wall behind the stage: broader and more hunched than the man, the jagged fur collar along its neck like a predator lowering its head before a leap",{'flicker':0.6,'grade':'red'}),
(126.53,'cut',[BOY],['ash'],TAV+"the small blond boy still sitting at his big table, turned around and looking up at the huge shadow on the wall, wide-eyed, nobody on the stage near him",{'flicker':0.4,'grade':'red'}),
(131.12,'cut',[],['ash'],TAV+"through the tavern window: many pairs of glowing golden eyes in the fog outside, no people",{'grade':'red'}),
(137.14,'cut',[FA],['embers'],TAV+CROWD+"the whole tavern singing, cups raised, candles flaring, the tall man on stage"+HID,{'flicker':0.5}),
(141.5,'cut',[],['fireflies'],MEM+"a lone wolf silhouette howling on a hill under the moon in the fog, dark forest",{'grade':'cold'}),
(145.22,'cut',[FA],['embers'],TAV+"the tavern seeming vast as a cavern, walls stretching up into darkness, the small stage far away with the tall man on it"+HID,{'flicker':0.4,'grade':'red'}),
(149.81,'cut',[FA],['embers'],TAV+"the tall man singing in full voice, cloak flaring, the hearth fire roaring up in front of him, seen strictly from BEHIND, his back to us, the hood up",{'flicker':0.6,'shake':0.15}),
(154.5,'cut',[],['ash'],TAV+"every wall covered with hundreds of swaying beast shadows, a thousand strong, the tall hooded man on the stage seen from behind, no other musicians",{'flicker':0.6,'grade':'red'}),
(160.42,'cut',[],['ash'],TAV+"the darkness itself singing: the beast shadows on the walls open their mouths toward the stage, where only the tall hooded man stands, seen from behind",{'flicker':0.6,'grade':'red'}),
(166.77,'flash',[FA],['sparks'],"Extreme close-up in flickering firelight, only half of the man's face visible in profile, the rest in black shadow: a sharp cheekbone, a cold calculating smile, a brief golden glint in his eye",{'shake':0.4}),
(169.6,'cut',[BOY],['embers'],TAV+"close-up of the small blond boy (the same boy: blond hair, pointed ears) frozen at his table, frightened and thrilled at once, blackberry juice on his fingers",{'flicker':0.4}),
(172.7,'cut',[],['sparks'],"Full-bleed painting edge to edge, no border, no frame: "+TAV+"every candle blown flat at once, sparks flying from the hearth, no people",{'shake':0.3}),
(175.87,'flash',[FA],['embers'],TAV+CROWD+"heroic wide shot of the whole concert: everyone on their feet singing, the tall man silhouetted against the roaring hearth, his huge beast-like shadow towering over the room"+HID,{'flicker':0.6,'shake':0.2}),
(180.54,'cut',[],['embers'],TAV+CROWD+"the singing crowd and their wolf-headed shadows on the wall singing together",{'flicker':0.5}),
(184.77,'cut',[FA],['embers'],TAV+"close-up of ONE single silver beast-head buckle on the man's belt (only one), its two red stone eyes glowing in the firelight, the dark cloak around it",{'flicker':0.6}),
(190.96,'cut',[BOY],['embers'],TAV+"the small boy standing on his chair singing along with all his heart",{'flicker':0.4}),
(195.36,'fade',[FA],['embers'],TAV+"the music has stopped; the tall man on the stage turns his head halfway toward the window, his face in shadow, the room hushed"+HID,{'flicker':0.3}),
(200.4,'cut',[FA],['fireflies'],TAV+"the tall man walking out through the tavern door into fog and darkness, cloak trailing; on the whitewashed wall his shadow is longer and hunched like a beast"+HID,{}),
(205.4,'cut',[BOY],['embers'],TAV+"the small boy alone at the big table with the bowl of blackberries, the stage empty, the fire dying low",{'flicker':0.2}),
(210.4,'fade',[L],['dust'],WELL+LU+"eyes closed, back in the cave; the ritual dagger at his hip glowing a cold blue",{'grade':'cold'}),
(214.8,'cut',[DR,L],['dust'],WELL+NE+"watching Lucien with quiet concern in the cold blue light"+ONLY,{'grade':'cold'}),
(219.0,'fade',[],['dust'],WELL+"the black well, still and dark, cold blue light fading, no people",{'grade':'cold'}),
]
shots=[];mv=0
for i,(t,tr,who,fx,scene,ex) in enumerate(S_):
    m=MOVES[mv%len(MOVES)];mv+=1
    d={'id':'s%02d'%(i+1),'t':round(snap(t,tr),2),'in':tr,'who':who,'fx':fx}; d.update(ex); d['move']={'from':m[0],'to':m[1]}
    d['scene']=scene; shots.append(d)
L14=json.load(open('painted/14-hunt-valerys.json'))
cast={k:L14['cast'][k] for k in ['lucien','drow']}
cast['boy']="Lucien as a small boy of about six, long ago: messy blond hair, small pointed elf ears, big blue-grey eyes, round cheeks, a plain linen shirt and little brown trousers, barefoot or in small boots"
cast['father']="Lucien's father, a tall slender man with an almost aristocratic bearing, HIS FACE IS NEVER SHOWN: always seen from behind or with the face lost in deep shadow; a long dark velvet-lined travel cloak with a jagged fur collar falling heavily to the floor, long pale fingers with scars over the knuckles, a heavy silver ring on the little finger, a dark wooden lute, a silver belt buckle shaped like a beast head with two red stone eyes"
cast['buckle']="AN OBJECT, NOT A PERSON (no people, no body, no wearer): the father's silver belt buckle on its own, shown three times: from the front, at an angle, and a close detail; a stylised wolf-like beast head with open jaws and two small dark red stones set in the eye sockets, old worn silver, on a short strip of dark leather belt"
board={"id":"songbird","live":True,'cover':'s35','style':L14['style'],'cast':cast,'shots':shots}
head_={k:v for k,v in board.items() if k!='shots'}
out=json.dumps(head_,ensure_ascii=False,indent=2)[:-2]+',\n  "shots": [\n'+',\n'.join('    '+json.dumps(s,ensure_ascii=False) for s in shots)+'\n  ]\n}\n'
json.loads(out);open('painted/14-songbird.json','w').write(out)
ts=[s['t'] for s in shots]
print(len(shots),'shots','mono',all(a<b for a,b in zip(ts,ts[1:])))
