"""Script v3 (the DM's revision 2026-11-23): narrator intro, Dolkan's cracked trance and advisor past, Valerys cast the mother out. Applied by clip id."""
import json, re
S = json.load(open('script.json'))
S['context']['dolkan'] = ("You are a great character actor in a dark fantasy film, playing Dolkan: an ANCIENT duergar sorcerer, over four hundred years old, "
 "with a voice ruined by centuries in the lightless deep: deep, dark, dry and raspy like stones grinding together, cracked. Until now he has always been a goofy, cackling madman; "
 "right now every trace of that is gone: he is tight, dead serious, intensely focused and lucid, speaking low and fast with urgency, like a man who knows the clarity will not last. "
 "He speaks to three young warriors (brothers) in a huge cavern, seconds after a giant worm dived under the stone; it can burst up again any moment. "
 "He is projecting his own memory into their minds with magic. Keep a brisk, urgent pace: never slow, never drawn out, never a narrator, never young, never smooth.")
S['context']['narrator'] = ("You are the Dungeon Master of a dark fantasy campaign, narrating to your players at the table: a dramatic, gripping storyteller's voice, "
 "low and intense in the sudden silence, building tension, painting the scene; measured but never slow, with real breath and suspense. A storyteller, not a character.")
D = '—'
NEW = {
 'n1': ('narrator',
  "(dramatic, then hushed into the sudden silence) With a deafening rumble, the beast dives beneath the stone floor, leaving the cavern in a sudden, heavy silence... broken only by shallow breathing and the drip of dark water.\n"
  "(low, building) Into that quiet, Dolkan steps out from the jagged rocks.\n"
  "(a hint of the old familiar madness in the description) Usually hunched, grinning, and muttering nonsense to his fungal spores, the old duergar goes dead still.\n"
  "(tension rising) His glowing white eyes lock onto the bleeding paladin by the pool...\n"
  "(sharper) and in an instant, every trace of his usual madness vanishes.\n"
  "(intense, deliberate) His scarred face pulls tight into a hard, grim mask, his posture straightens, and the erratic, goofy cackle in his voice drops into a low, dead-serious rasp.\n"
  "(sudden, forceful) He slams his crystal staff into the stone,\n"
  "(rushing) sending a wave of violet spores straight into your minds...\n"
  "(a breath, then hushed) and suddenly, the cavern disappears.",
  ["With a deafening rumble, the beast dives beneath the stone floor, leaving the cavern in a sudden, heavy silence" + D + "broken only by shallow breathing and the drip of dark water.",
   "Into that quiet, Dolkan steps out from the jagged rocks.",
   "Usually hunched, grinning, and muttering nonsense to his fungal spores, the old duergar goes dead still.",
   "His glowing white eyes lock onto the bleeding paladin by the pool" + D,
   "and in an instant, every trace of his usual madness vanishes.",
   "His scarred face pulls tight into a hard, grim mask, his posture straightens, and the erratic, goofy cackle in his voice drops into a low, dead-serious rasp.",
   "He slams his crystal staff into the stone,",
   "sending a wave of violet spores straight into your minds" + D,
   "and suddenly, the cavern disappears."]),
 'd1a': ('dolkan',
  "(tight, dead serious, low and intense) Listen closely, boys... there's no time before it surfaces again.\n"
  "(fast, urgent, a hand pressed to his temple) The tremors of this beast just cracked the forced trance Tyr's Order chained around my mind...\n"
  "(almost disbelieving, fierce) and through the haze, I can temporarily see clearly!\n"
  "(hard, low) I know that man.\n"
  "(bitter, old anger rising) I once advised Valerys as Head Advisor of Caer Callidyr... before he cast me into the dark!",
  ["Listen closely, boys" + D + "there's no time before it surfaces again.",
   "The tremors of this beast just cracked the forced trance Tyr's Order chained around my mind" + D,
   "and through the haze, I can temporarily see clearly!",
   "I know that man.",
   "I once advised Valerys as Head Advisor of Caer Callidyr before he cast me into the dark!"]),
 'd1c': ('dolkan',
  "(low, grave, quick) Only days before, Valerys had cast your mother out...\n"
  "(bitter, cutting) unable to stomach her defiance of the Church's rigid methods, choosing duty over his own heart.",
  ["Only days before, Valerys had cast your mother out" + D,
   "unable to stomach her defiance of the Church's rigid methods, choosing duty over his own heart."]),
 'd1d': ('dolkan',
  "(the voice tightening, pained) Now, upon the cold stone lie two small boys...\n(sudden, pointed, almost accusing) you!\n(fast, horror creeping in) Pale as chalk, drowning in sweat, with a black, unnatural poison creeping through your veins toward your hearts!\n(flat, grim, final) No healer in the realm could break it.",
  ["Now, upon the cold stone lie two small boys" + D + "you!", "Pale as chalk, drowning in sweat, with a black, unnatural poison creeping through your veins toward your hearts!", "No healer in the realm could break it."]),
 'd1e': ('dolkan',
  "(something like pity creeping into the hard voice) And there, stripped of his armor and pride, kneels a younger Valerys...\n(quiet, heavy) terrified that his devotion to the Law is about to cost him the only pieces of her he has left!",
  ["And there, stripped of his armor and pride, kneels a younger Valerys" + D, "terrified that his devotion to the Law is about to cost him the only pieces of her he has left!"]),
 'v1': ('valerys',
  "(barely holding together, a shaky breath, guilt in every word) I already gave up their mother for the Order, Tyr...\n(voice breaking, pleading) do not take them from me too!\n(rising, desperate, almost a shout) Take me instead!\n(faster, frantic, each phrase more raw) Strip my title, take my honor, take every breath left in my lungs!\n(collapsing, a sob caught in the throat, a whisper) Just burn this poison from my boys... let them live.",
  ["I already gave up their mother for the Order, Tyr... do not take them from me too!", "Take me instead!", "Strip my title, take my honor, take every breath left in my lungs!", "Just burn this poison from my boys... let them live!"]),
 't2a': ('tyr',
  "(booming, shouted down at him) Your sword and your oath belong to Caer Callidyr!\n(louder, a hammer blow) You will never cross this city's gates again...\n(roaring) neither to seek their mother's forgiveness, nor to ride to their aid!",
  ["Your sword and your oath belong to Caer Callidyr.", "You will never cross this city's gates again" + D, "neither to seek their mother's forgiveness, nor to ride to their aid."]),
 'd3a': ('dolkan',
  "(heavy, grave, relentless) See the agony in his eyes!\n(hard) In that single heartbeat, he realizes the terrible price:\n(bitter, fast) he can never undo his pride, never ride out to bring your mother back!",
  ["See the agony in his eyes!", "In that single heartbeat, he realizes the terrible price:", "he can never undo his pride, never ride out to bring your mother back!"]),
}
byid = {c['id']: c for c in S['clips']}
for cid, (sp, d, sub) in NEW.items():
    if cid in byid:
        assert byid[cid]['sp'] == sp, (cid, byid[cid]['sp'], sp)
        byid[cid].update(dir=d, sub=sub)
S['clips'].insert(0, {'id': 'n1', 'sp': 'narrator', 'dir': NEW['n1'][1], 'sub': NEW['n1'][2]})
for c in S['clips']:  # the DM: Dolkan talks faster -> no slow directions
    if c['sp'] == 'dolkan':
        c['dir'] = re.sub(r'\bslow(er)?,? ?', '', c['dir']).replace('( ', '(').replace(', )', ')')
json.dump(S, open('script.json', 'w'), indent=1, ensure_ascii=False)
print([(c['id'], c['sp'], len(c['sub'])) for c in S['clips']])
