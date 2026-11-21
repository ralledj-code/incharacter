"""Verse clips for the realistic level 14 (method A). Run from chronicle/: python painted/make/14clips.py
Groups the shots of painted/14-hunt-valerys.json (the full 84-shot timeline) into clips of at most 15 s, breaking at scene
changes (fade/black transitions) when a group is long enough, and writes painted/14-hunt-valerys-real/clips.json:
[{ id (first shot), shots, t0, t1, dur ('12s'), refs (stills), prompt }]. Generate with scripts/omni-verses.mjs."""
import json, math, os
B=json.load(open('painted/14-hunt-valerys.json')); shots=B['shots']; END=360.5
KEEP={'s10':['s10','s11','s12'],'s13':['s13','s14','s15'],'s64':['s64','s65','s66','s67']}  # already made and approved
byid={s['id']:s for s in shots}
def t_end(i): return shots[i+1]['t'] if i+1<len(shots) else END
groups=[]; i=0
while i<len(shots):
    s=shots[i]
    if s['id'] in KEEP:
        ids=KEEP[s['id']]; groups.append(ids); i+=len(ids); continue
    ids=[s['id']]; j=i+1
    while j<len(shots):
        n=shots[j]
        if n['id'] in KEEP: break
        if t_end(j)-s['t']>15: break
        if n.get('in') in ('fade','black') and shots[j-1]['t']-s['t']+0>=0 and t_end(j-1)-s['t']>=6: break  # new scene
        ids.append(n['id']); j+=1
    groups.append(ids); i=j
def common_prefix(a):
    p=os.path.commonprefix(a)
    k=max(p.rfind(', '),0); return p[:k+2] if k else ''
def short(txt):
    txt=txt.replace('deep underground in the Down Deep, a lightless world of caverns, rock ceilings, no sky, painted as a real place at full scale (not a tabletop, not miniatures), ','deep underground, ')
    txt=txt.replace('painted like a faded warm memory, soft golden haze, muted colours, ','flashback, a faded warm memory, soft golden haze, ')
    txt=txt.replace('Nerrissa (the drow woman: dark purple-grey skin, long white hair) ','Nerrissa (the drow woman with silver hair) ')
    return txt.replace('Lucien Vale (long blond hair, pointed ears, burgundy coat) ','Lucien (the blond half-elf in the burgundy coat) ').replace('Nerrissa (the drow woman with silver hair) ','Nerrissa (the drow woman with silver hair) ').replace(', exactly these people and no one else','')
# reworded verses: the first wording was refused twice (bare INVALID_ARGUMENT, no reason given)
OVERRIDE={
 's29':(['s28','s31'],"(0.0-3.4s) Lucien, Arthas and Cedric stand together as dark silhouettes against a glowing fungus cavern, torchlight behind them. (3.4-6.8s) Hard cut to: close-up of Lucien's hand with purple sparks dancing over it, Arthas's armoured hand on the hilt of his glowing orange sword beside it. (6.8-13.8s) Hard cut to: the three of them on a rock ledge above a vast dark chasm, standing their ground, determined."),
 's52':(['s52','s53','s54','s55'],"(0.0-3.8s) A pale shimmering beam of light from the creature strikes Lucien and he staggers and falls. (3.8-7.5s) Hard cut to: Arthas kneels beside Lucien, his hands glowing warm gold over him, and Lucien takes a deep breath and opens his eyes. (7.5-10.7s) Hard cut to: Arthas loops a rope around the flower-of-teeth creature and pulls it down toward the ground. (10.7-14.4s) Hard cut to: Cedric stands on top of the defeated creature, arms crossed, smug."),
 's70':(['s70','s71'],"(0.0-5.6s) Lucien comes out of the vision with a sharp gasp by the black well, Nerrissa steadying him with a hand on his shoulder. (5.6-11.1s) Hard cut to: Wittan the deep gnome nods and points down a dark tunnel, Lucien urging him on.")}
out=[]
for ids in groups:
    sh=[byid[x] for x in ids]; t0=sh[0]['t']; t1=t_end(shots.index(sh[-1])); w=t1-t0
    scenes=[short(x.get('scene') or byid[x['img']]['scene']) for x in sh]
    pre=common_prefix(scenes) if len(scenes)>1 else ''
    beats=[]
    for k,(x,sc) in enumerate(zip(sh,scenes)):
        a=x['t']-t0; b=(sh[k+1]['t'] if k+1<len(sh) else t1)-t0
        act=sc[len(pre):] if pre else sc
        beats.append(f"({a:.1f}-{b:.1f}s) "+("" if k==0 else "Hard cut to: ")+act.strip().rstrip('.')+'.')
    stills=[x.get('img') or x['id'] for x in sh]
    if len(stills)>4: stills=[stills[0],stills[len(stills)//3],stills[2*len(stills)//3],stills[-1]]
    stills=list(dict.fromkeys(stills))
    if ids[0] in OVERRIDE: stills, ov = OVERRIDE[ids[0]]; beats=[ov]; pre=''
    dur=min(15,max(3,math.ceil(w-0.05)))
    prompt=("Live-action dark fantasy film, realistic motion and physics, cinematic camera. Keep every face, costume and creature exactly as in the reference images; "
            "only the characters described appear, nobody else; no text, no subtitles. The edit follows the music: hard cuts exactly at the times given, each beat fills its slot. "
            +(f"Setting: {pre.strip().rstrip(',')}. " if pre else '')+"Beats: "+' '.join(beats))
    out.append({'id':ids[0],'shots':ids,'t0':round(t0,2),'t1':round(t1,2),'dur':f'{dur}s','refs':stills,'prompt':prompt,'keep':ids[0] in KEEP})
json.dump(out,open('painted/14-hunt-valerys-real/clips.json','w'),indent=1,ensure_ascii=False)
new=[g for g in out if not g['keep']]
print(len(out),'clips,',len(new),'new, video seconds new',sum(int(g['dur'][:-1]) for g in new),'| covered',round(sum(g['t1']-g['t0'] for g in out),1),'s')
for g in out: print(g['id'],g['t0'],g['t1'],g['dur'],len(g['shots']),'K' if g['keep'] else '')
