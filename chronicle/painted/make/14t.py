"""Storyboard for the DM video "Tyr's price" (hidden, link-only, after level 14). Run from chronicle/: python painted/make/14t.py
Plan, script and material: painted/dm-tyr/. So far: the cast and two place references (the storyboard waits for the DM's answers)."""
import json
L14=json.load(open('painted/14-hunt-valerys.json')); L13=json.load(open('painted/13-down-deep.json'))
cast={k:L14['cast'][k] for k in ['lucien','arthas','cedric','drow','wittan','valerys','serpent']}
cast['dolkan']=L13['cast']['dolkan'].replace('; usually hunched, grinning and muttering to his spores','')
cast['young_valerys']=("Valerys twenty years younger, about forty: the same face as in his reference (hard pale grey eyes, strong jaw, short beard) "
 "but jet-black close-cropped hair and a short black beard, no grey; a High Inquisitor of Tyr: white and crimson robes over plate armour, "
 "a gold sun emblem; strong, proud, grief-stricken")
DEEPC=("deep underground in the Down Deep, a lightless world of caverns, rock ceilings, no sky, in a massive cavern, its floor torn and cracked, "
 "rubble everywhere, a still black pool, a high rock ceiling lost in darkness, ")
SANCT=("the deepest chamber beneath the cathedral of Tyr in the city of Caer Callidyr at night: a vast shadowy stone sanctum, towering gothic arches, "
 "tall leaded stained-glass windows lashed by night rain, cold stone floor, iron candelabra, ")
shots=[
 {"id":"ref_sanctum","t":0,"in":"cut","who":[],"fx":[],"scene":SANCT+"wide establishing view, no people, no statue in this view, lightning flickering behind the windows"},
 {"id":"ref_cavern","t":1,"in":"cut","who":[],"fx":[],"scene":DEEPC+"the moment after a colossal worm has dived beneath the stone: settling dust, a fresh crater of broken rock in the floor, torches, no people"},
]
board={"id":"tyrs-price","live":False,"cover":"ref_sanctum","style":L14['style'],"cast":cast,"shots":shots}
out=json.dumps({k:v for k,v in board.items() if k!='shots'},ensure_ascii=False,indent=2)[:-2]+',\n  "shots": [\n'+',\n'.join('    '+json.dumps(s,ensure_ascii=False) for s in shots)+'\n  ]\n}\n'
json.loads(out);open('painted/14-tyrs-price.json','w').write(out);print('ok')
