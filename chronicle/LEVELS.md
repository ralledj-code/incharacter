# Making a level from a song (runbook, works unattended)

Rasmus drops **an mp3 and a level number** (sometimes the Suno lyrics and the session recap too) and goes to sleep. Everything below can be done without asking anything. When something is uncertain, pick the sensible default, note it in the final report, and keep going. Reference implementation: **level 8, Baphomet's Chains**.

## 0. Where things are
| What | Where |
|---|---|
| Book order, titles, dates, lengths (12 levels) | `src/s0_stories.js` PLAYLIST |
| Level 8 data (sections, lyrics, line times, moods) | `src/w1_core.js` CUES / LINE_TIMES / KEYS |
| Level 8 scenes | `src/s1a_well.js` … `s1d_city.js` (pushed to `C.scenes.baphomet`) |
| Level 8 camera shots + beats + clearings | `src/levels/L08-baphomet-shots.js` |
| New levels | `src/levels/LNN-<id>.js` (copy `_TEMPLATE.js`; auto-included by build and smoke test) |
| Songs | `public/chronicle/levels/NN-<id>.mp3` |
| Shared art packs | `public/chronicle/assets/` (see "Asset packs" below) |
| Built page | `public/chronicle/index.html` (always rebuild + commit) |

Inputs that may come with the mp3: lyrics (Suno text), session recap (InCharacter log). **Neither is required.** Without lyrics: use the Whisper transcript, fix obvious mishearings using names below. Without a recap: the lyrics are the story.

Campaign names Whisper mishears: Lucien (heard "Lucian"), Arthas ("Arthur's"), Cedric, Neeris ("Nearest"), Baphomet ("baffermit"), Cobh ("Cove"), Ragnar, Alaron, Duncastle, Ahm, Silas, moonwell ("moon well").

## 1. Copy the song
`public/chronicle/levels/NN-<id>.mp3` with NN = two-digit level, id = the PLAYLIST id (e.g. `09-saving-cobh.mp3`).

## 2. Measure everything from the audio (never guess)
One-time setup per machine/session (the venv lives in the scratchpad, not the repo; Rasmus's global pip config has `no-deps=true`, so bypass it):
```
py -3.10 -m venv <scratch>/wh
PIP_CONFIG_FILE=nul <scratch>/wh/Scripts/python -m pip install faster-whisper "huggingface_hub<1"
```
Then per song (CPU, ~3 min each):
```
<scratch>/wh/Scripts/python scripts/transcribe.py public/chronicle/levels/NN-<id>.mp3 <scratch>/words.json > <scratch>/transcript.txt
<scratch>/wh/Scripts/python scripts/beats.py public/chronicle/levels/NN-<id>.mp3 <scratch>/beats.json
node scripts/align-lyrics.mjs <scratch>/words.json <scratch>/lyrics.json <scratch>/align.json
```
- `lyrics.json` = `[{ "section": "v1", "lines": ["...", ...] }, ...]` in song order. Section names: intro, v1, v1b, pre, chorus, v2, …, bridge, outro, final (any unique ids work).
- Section `t` = first line's time − 0.5 s. Intro = 0. A `final` section starts after the last sung line.
- Read instrumental gaps and the real end from `transcript.txt`; the song's last loud hit and silence: `beats.json` hits near the end, or the loudness snippet in this file's history (Baphomet: last hit 361 s, silence 363 s).
- Align report: lines under 40 % or marked `~` must be checked against `transcript.txt` timestamps; list them in the final report.
- Embed beats compactly: `{ bpm, beats, bars, hits }` rounded to 2 decimals.

## 3. Write the level module
`cp src/levels/_TEMPLATE.js src/levels/LNN-<id>.js` and fill:
1. `ID`, `DURATION` (from the mp3), `CUES` (sections with `t`, rail speed `v`, `motes`, `stamp`, `lines`), `LINE_TIMES`, `KEYS` (moods along the song's emotional arc; new moods with `C.defineMood`).
2. `session` (`Level N · Session recap · <clock times or date>`), `blurb` (2–3 sentences, party voice), `length` (`'5 min'`), `audio`, `packs` (which art to download on request: `['nature', 'village', 'beasts']`, subset as needed), `beats`, `doorAt` (song time when the camera flies out the tavern's back door, usually the end of the intro), `silenceT`.
3. `SCENES`: one builder per story beat, placed by section distance (`X.sec[id].d0/d1/mid/len`). Publish what the camera should film in `X.anchors.<name>` (characters, creatures, landmarks).
4. `clearings(X)`: `[{ x, z, r }]` around every place the camera orbits, so no tree grows into a shot.
5. `shots(X, D)`: the music video (see "Camera" below). Cut on section starts and on bars (`beats.bars`), one shot per 6–9 s, never longer than ~12 s.

### What every level should feel like (Rasmus)
- "Holy fuck, this is cool": constant camera movement, cuts on the music, action in frame. Never a static slow push for long.
- Everything alive is a **model** (characters, crowds, creatures). No cone/box people.
- Stay true to the session; skip a detail rather than rush it. Fog, silhouettes, don't overcrowd a shot.
- Open in the tavern (intro: Lucien and the band, the brothers' table), fly out the back door into the story, end on the final image of the song.

### The party (models in `w3b_chars.js`)
| Who | Look | Build |
|---|---|---|
| Lucien Vale | half-elf wild magic sorcerer, the singer: burgundy coat, long blond hair, pointed ears, purple spark in the right hand, blue-glowing dagger | `ch.lucien({ pose })` |
| Cedric | human monk: red/brown clothes, bronze pauldron, beard, staff | `ch.cedric({ pose, noStaff })` |
| Arthas | human devout paladin: steel plate, dark hood with burning eyes, sword | `ch.arthas({ pose })` |
| Neeris | druid of the forest (wolf-cursed in level 8): moss-green hooded ranger, gnarled staff, amber eyes | `ch.neeris({ pose })` |
| Anyone else | patrons, crowds, villagers, soldiers | `ch.person({ seed, female, outfit: 'peasant'|'ranger', tint, pose })` |
| Big hooded spirit | `ch.wraith({ h })` |
| Baphomet | goat-skull, horned, winged giant on the rigged body | `ch.baphomet({ h, pose })`, `userData.wings` (rotate to spread/flap), `eyeGlow` |
Poses (`anims.glb`): Idle_Loop, Idle_Talking_Loop, Walk_Loop, Walk_Formal_Loop, Jog_Fwd_Loop, Sprint_Loop, Sitting_Idle_Loop, Crouch_Idle_Loop, Dance_Loop, Spell_Simple_Idle_Loop, Sword_Idle, Idle_Torch_Loop, Fixing_Kneeling. Switch with `g.userData.pose(name)` in `update`.
Big crowds: `C.bakeRig(ch.person({ bake: true, seed }), clip, time)` → `C.instObject(baked, matrices)` (see `s1d_city.js`).

### Make what is sung happen (most important)
Every lyric line should show its action. Tools:
- `X.line(k, dt)` = start time of lyric line k (0-based over the whole song) + dt. Use it for every story event and every cut.
- `C.act(obj, [{ t, pose, to, move, face, y, s, show, fn }])` (w3c_action.js): a character's beats on song time. `to` walks/runs there (pose picked from speed unless given), `face` turns to a point/object/angle, `show` hides/shows, `fn(u, t)` for custom effects. Build the list in the scene, call `.update(t, ctx)` from the scene's `update`.
- Cut the camera on the lines too: one shot per line or two (`{ t: X.line(k, -0.2), cam: ... }`), framed on whoever the line is about.
- Level 8 is the reference: the well (Arthas kneels on "bled his hand", Baphomet rises on "chains broke", wings spread on "the demon spoke"), the wood (the blade stops on "would not land"), the choruses (each brother steps forward on his name), the wyrm (rises, dives, flees, waits in the crater), the camp, the crossroads, the feast, the gaol.
- Scenes can set `t0`/`t1` (song-time window) instead of path-distance visibility when they overlap other places (e.g. the gaol inside the street).
- No camera kicks or shake: Rasmus found them jittery. Keep moves smooth; cut instead.

### Creatures (`C.creature(key, { h, tint, eyes, clip })`, pack `beasts`)
| key | clips |
|---|---|
| wyrm (black dragon, CC0 OpenGameArt) | Flying (no death clip: freeze a frame with `timeFn` and roll it onto its side, see s1b_dragon corpse) |
| wolf | Gallop, Gallop_Jump, Walk, Idle, Idle_2, Idle_2_HeadLow, Attack, Eating, Death |
| bat | Bat_Flying, Bat_Attack, Bat_Attack2, Bat_Hit, Bat_Death |
`eyes: 0xff2a10` turns the cartoon eyes into glowing slits (do it for every monster). Story creatures must be pushed to `X.anims` (they then follow song time). A one-shot clip that should hold its last frame: `g.userData.timeFn = (tm) => clamp(tm - startT, 0, dur - 0.02)`.

### Props and places
- `kit.trees(d0, d1, opts)` forest + rocks + undergrowth (respects clearings), `kit.village([...houses], { tint, glass })` modular houses, `kit.torches`, `kit.fire`, `C.place(key, [x,y,z], yaw, scale)` single props, `C.instModel(key, matrices)` many.
- Prop keys: see `scripts/pack-assets.mjs` PACKS lists (tables, benches, barrels, banners, chests, cauldron, stalls, wagon, fences, weapons, books, candles, …) and the `village` modules.
- Photo textures: `C.tex('<name>_diff', repeatX, repeatY)`: old_wood_floor, wood_plank_wall, rustic_stone_wall, forest_ground_04, cobblestone_floor_04, castle_brick_07.

### Camera (`w2b_director.js`)
`{ t, blend?, cam }`, the shot runs until the next one; `blend` (s) eases instead of a hard cut.
- `D.orbit(target, { r, r1, h, h1, a0, w, t0, lookH, fov })` circle a target (r/h animate to r1/h1)
- `D.track(target, { offset: [right, up, fwd], lookOffset, fov })` ride along with a moving object
- `D.dolly(a, b, target, { lookB, fov, fov1, linear })` move between points
- `D.rail({ h, side, lead, ahead, lookH, target, fov })` along the story path
- `D.fixed(pos, target, { push, fov, fov1, roll })`
Targets: Vector3, Object3D, or `() => Vector3`. Use `wp(obj)` / `near(obj, dx, dy, dz)` helpers as in L08. Bars zoom-kick and hits shake automatically (off with the Calm camera toggle).
Tavern positions for the intro: stage centre `(0, 0.45, -8.55)` (Lucien = `X.hubAnchors.lucien`), brothers' table `X.hubAnchors.cedric / arthas` around `(-2, 0, -4.6)`, back door `(0, 1.5, -10)`; the story path starts outside that door.

## 4. Unlock the page
The book unlocks automatically once `C.levels[ID]` exists (the module sets it). No other file changes needed.

## 5. Check (all headless, no human needed)
```
cd chronicle && npm run build && npm test
```
Then render screenshots (scripts from previous sessions live in the scratchpad; recreate if gone):
- `npx serve -l 5173 ../public/chronicle` (or the `chronicle` entry in `.claude/launch.json`).
- Headless Chrome via playwright-core (`channel: 'chrome'`, `--use-angle=d3d11 --enable-gpu --ignore-gpu-blocklist`; the Browser pane is throttled when hidden, don't use it for frames).
- Before rendering a level: `await __cw.loadPacks(story.packs)`, `W.loadStory(story)`, then `__alaron.dev.hold = { mode: 'ride', t, dt: 0.016, time: t, player: {x:0,z:0,yaw:0,pitch:0}, look: {yaw:0,pitch:0} }`.
- Shoot every ~6–8 s of the song plus every section start; build a contact sheet (sharp) and look at all of it. Fix: camera inside geometry, empty frames (target out of shot), blown-out light, characters clipping props, models facing the wrong way (models face +z; turn with `lookAt`).
- `node tools/clipcheck.cjs 0.5 0.3`: lists every moment the camera touches geometry (raycasts). Must end with "no camera clipping".
- Full UI flow (desktop 1280×720 and phone 390×844): start → walk to stage → book → page to the level → "Ask for this song" → ride → seek → end card. Check lyrics against the audio at a few points (`__alaron.seek(t)`).

## 6. Ship
Commit `src/levels/LNN-<id>.js`, the mp3, rebuilt `public/chronicle/index.html` (+ any new assets) and push to **master** (Rasmus wants no preview branches). The live site deploys from master; `/chronicle` is public, no login.

Final report for Rasmus (short): what the level shows, shot highlights, lyric lines that were uncertain, anything skipped, download size of the level.

## Asset packs (on-demand loading)
`C.PACKS` in `w1b_assets.js`. `tavern` loads at start (~9 MB with the page); a level's `packs` load when its song is requested; every file downloads once per visit.
| pack | contents |
|---|---|
| tavern | props.glb, people (bodies, outfits, hair), anims, lute, tavern textures |
| nature | trees/rocks/plants, forest ground |
| village | modular house kit, cobblestone, castle brick |
| beasts | wolf, dragon, bat, demon |
Adding art: download CC0 (Quaternius on itch.io via headless Chrome; Poly Pizza `static.poly.pizza/*.glb` for single Quaternius models; Google Drive links rate-limit, avoid), extract to the scratchpad, add keys to `scripts/pack-assets.mjs` (PACKS / CHARS / CREATURES), run `node scripts/pack-assets.mjs <packsDir> [pack]`, add the file to a `C.PACKS` entry, credit in `public/chronicle/assets/CREDITS.txt`. FBX-only packs: convert with three r128 FBXLoader → GLTFExporter in headless Chrome first (`tools/fbx2glb.cjs`). `.blend` files: Blender 4.2 LTS portable from download.blender.org (verify the sha256), unzipped to a SHORT path (e.g. `%TEMP%l42`; deep paths break its glTF exporter), `blender.exe -b --factory-startup --python b2glb.py -- in.blend out.glb` with `export_apply=True` (applies mirror modifiers).
Avoid cute/chibi models for threats (the Quaternius Demon/Dragon were rejected): build big villains on the rigged body (like Baphomet) or find low-poly realistic ones.
