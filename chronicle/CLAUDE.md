# Alaron Chronicle

Interactive 3D "ride" for Rasmus's D&D campaign (island of Alaron). Player walks into an empty bar, sits at a chair by a lectern, flips a book to pick a story, and the chair rides rails through fog scenes synced to a Suno song. Singer in the songs = Lucien Vale (half-elf Wild Magic Sorcerer, Rasmus's character). Lyrics come from InCharacter session logs.

Status: 3D levels 1, 5, 6, 8 playable. Not yet checked on a real phone or the Legion Go.
Direction change 2026-10-26: Rasmus felt nothing cinematically in the 3D rides (low detail, illustration rather than storytelling). New pilot: **painted levels** in the style of Blizzard's Burdens of Shaohao / Lords of War shorts: one painting per shot, depth-map parallax, particles, fog, ink transitions. Level 1 is the pilot (see "Painted levels" below).

## Where it lives
Inside the InCharacter repo (ralledj-code/incharacter). Source: `chronicle/`. Build output: `public/chronicle/index.html` (committed) next to `public/chronicle/song.mp3`. Served at `/chronicle` (rewrite in next.config.mjs). Public, no login (middleware skips it).

## Commands
- In `chronicle/`: `npm i && npm run build` -> ../public/chronicle/index.html. **Rebuild and commit the output after every src change.** `npm run dev` builds and serves public/chronicle standalone. `npm test` = node smoke test (stubbed canvas; does NOT check GLSL or rendering).
- Dev hook: `window.__alaron.dev.hold = <W.update state>` freezes rendering on a given state (e.g. `{mode:'ride', t:177, ...}`); `dev.shot(state)` renders one frame. Handy for headless screenshots at any song time.
- Three.js r128 from cdnjs (global UMD). Pin exact version.

## Assets (CC0)
- Runtime: `src/w1b_assets.js` loads `public/chronicle/assets/{nature,props,village}.glb` + `assets/tex/*.jpg` before the world is built (GLTFLoader r128 from jsdelivr). Builders call `C.hasModel / C.instModel / C.place / C.tex` and fall back to procedural shapes when an asset is missing (so `npm test` runs without them). glTF materials become Lambert; textures stay in display space like the rest of the scene.
- Packing: raw packs are NOT in git. Download the free tiers from quaternius.itch.io (Stylized Nature MegaKit, Fantasy Props MegaKit, Medieval Village MegaKit; for characters later: Universal Base Characters, Modular Character Outfits - Fantasy, Universal Animation Library), unzip each into `<packsDir>/<pack name>/`, then `node scripts/pack-assets.mjs <packsDir> [pack]`. Edit the PACKS lists to add models. Textures: Poly Haven API, 1k JPG resized to 512 with sharp.
- Used: trees/rocks/undergrowth in `kit.trees`, modular houses in `kit.village` (feast street + burning city), tavern props in `w4_bar dressBar`, photo textures on tavern walls/floor/fireplace, gaol walls/floor and outdoor ground.
- Characters: `assets/chars/*.glb` (one file per part so bone names stay identical) + `anims.glb` (13 clips, fingers stripped). `C.rigChar` clones the base body (cut to head+neck at load, since the free body is a full figure and pokes through outfits), rebinds outfit/hair meshes to its bones, and plays a clip; `X.anims` mixers are set from song time in `W.update` (deterministic, seek-safe). Lucien (half-elf wild magic sorcerer: burgundy ranger coat w/o hood, long blond hair, ears, purple spark + blue dagger, spell idle), Cedric (human monk: peasant tinted red, bronze pauldron, beard, staff), Arthas (human paladin: ranger as flat steel, dark hood with glowing eyes, bronze sword). Neeris stays procedural. Scenes pass `{ pose: '<clip>' }`; `g.userData.pose(name)` switches. SkeletonUtils r128 from jsdelivr.
- Skipped: Bush_Common (its leaves need the pack's vertex-colour shader).

## Architecture (src/, IIFEs sharing `window.__cw`; build order in scripts/build.mjs, levels/*.js auto-included)
- Flow (2026-10-26): start screen = song list (one card per level, cover from its painted board's `cover` shot, Play goes straight into the song, Share = `/chronicle?song=<id>`, which puts that card first; `?painted`/`?3d` carry into shared links). Back/end return to the list. Old flow still behind "Step into the tavern": start screen -> busy tavern hub (walk to the stage) -> Lucien's songbook on the music stand -> "Ask for this song" (downloads that level's packs + mp3) -> music video on song time -> end card -> back to the tavern. Tavern music loop between songs. First-visit coach hints (localStorage `alaron:coach`). `/chronicle` is public (middleware skips it).
- w1_core: helpers, level 8 data (CUES, LINE_TIMES, KEYS), moods (`C.defineMood`), procedural textures/geometry.
- w1b_assets: on-demand packs (`C.PACKS`, `C.loadPacks`), `C.place / instModel / instObject / tex`, rigged people (`C.rigChar`, `C.bakeRig`), creatures (`C.creature`), `C.attach` to bones.
- w2b_director: camera director: shot lists baked once at load with a damped spring per shot (no kicks/shake).
- w3c_action: actors. Everything that moves is baked once (30 Hz): eased paths, facing from velocity, gait clip at measured stride rate, crossfades; played back from song time. w2_engine: `C.create()` -> W: sky, lights, ground, motes, story path from cues, modes walk|book|ride, anims on song time (story) / wall time (tavern `X.hubAnims`), scene visibility near the camera.
- w3_kit (trees with clearings, village houses, torches, fire), w3b_chars (party, persons, wraith; procedural fallbacks), w4_bar (tavern, stage, band, crowd, brothers' table), w4_book (songbook pages, `setStories`).
- s0_stories: the 12-level PLAYLIST; playable = level 8 (built-in) + any `C.levels[id]` from src/levels. s1a-s1d: level 8 scenes; levels/L08-baphomet-shots.js: its shots, beats, clearings.
- ui.js: renderer, input, hub/book/ride flow, per-level audio, tavern music, coach, HUD, lyrics, tap-sync, dev hook.
- New levels: **LEVELS.md** (full runbook) + `.claude/skills/chronicle-level`. Tools for headless checks: `tools/`.

## Known problems / TODO (priority order)
1. Done in first pass: chair lantern moved behind the rider (was blocking the right of the view), crossroads signpost moved off the rail, fireplace/gate/city light blowouts toned down, phone top bar fits, portrait FOV widened. Still to do: test on a real phone + Legion Go (SteamOS, perf). Linear tone mapping kept on purpose (ACES tried, washed colours out).
2. Timings measured 2026-10-20 with Whisper on the mp3: section starts, all 58 lyric line times (`LINE_TIMES` in w1_core), flash on "HE KILLED IT" (180.1 s), last hit 361 s, black 363 s. Old estimates were up to 40 s early in the first half. Tap-sync (Sync lyrics) still works and overrides per device. New levels: see LEVELS.md.
3. Visual upgrade, in order: bloom + vignette + grading (EffectComposer/UnrealBloom, bundle add-ons), generated textures for stone/wood/cloth, shadows + baked AO on desktop only, volumetric light shafts, better character models (proper rigs/glTF). Keep a low-quality path for mobile.
4. Story direction from Rasmus: stay true to the story, leave things to imagination, skip detail rather than rush a scene. Subtle motion, fog, sparse silhouettes. Don't crowd.
5. Looking: drag direction was reported reversed on mobile; fixed (yaw/pitch signs), unverified.
6. Characters: Cedric (monk: red leather, bronze dragon pauldrons, green tunic, beads, wooden staff), Lucien (long blond hair, pointed ears, burgundy velvet coat, silver flute, glowing blue dagger), Arthas (devout paladin, helm of dread, no picture).

## Painted levels (pilot: level 1)
- Storyboard: `painted/<NN-id>.json` = `style` (shared prompt), `cast` (character descriptions), `shots` [{ id, t, in: cut|fade|ink|black|flash, scene, who, move {from,to: [x, y, push]}, fx: embers|sparks|dust|ash|snow|fireflies|fog|smoke, flicker, sway, shake, grade: red|cold|green, img: '<other shot id>' to reuse a painting (e.g. a second chorus) }]. `live: true` makes the painted version the default (level 1 since 2026-10-26); `?painted` previews boards that are not live, `?3d` forces 3D.
- Art: key = cloud network secret (host generativelanguage.googleapis.com, header x-goog-api-key, no prefix) or GEMINI_API_KEY; `node scripts/paint.mjs <NN-id> cast` (character sheets, review them first) then `... shots [ids]` (sheets go in as references). Raw art in `painted/<NN-id>/raw/` (gitignored), cast sheets in `painted/<NN-id>/cast/` (committed).
- Layers: `python scripts/layers.py <NN-id> --model <depth_anything_v2_vits.onnx>` (from github.com/fabio-sim/Depth-Anything-ONNX releases; pip onnxruntime pillow numpy) -> `public/chronicle/levels/<NN-id>/<shot>.webp` + `_d.png`.
- Player: `src/w5_painted.js` (displaced plane per shot, particles, fog sprites, post pass: transitions, grade, vignette, grain, letterbox). Shots without art show their storyboard card.
- Check: `node tools/pshot.cjs <out> "t,t,..."` stills or `node tools/pshot.cjs <out> video t0 t1 24 960 540` (mp4 with the song). Runs offline (CDN scripts served from node_modules), SwiftShader: ~1 min per second of video at 960x540.

## Roadmap
- Quality target: "polished stylized" (Journey/Valheim feel), not Skyrim realism. The limit is assets, not WebGL. Steps: upgrade Three.js r128 -> current (ES modules, bundler), post-processing (bloom, vignette, grading), glTF props/characters from asset packs (Quaternius/Kenney free, Synty paid) + Mixamo animations, desktop-only shadows/AO. Keep a mobile low path.
- Lives in InCharacter now (login-gated static route, Vercel preview per branch).
- Next: stories as Supabase rows (cues/keys/lineTimes JSON), audio in Supabase Storage (private bucket, signed URLs) instead of public/. Forge shares InCharacter's Supabase auth.
- New story = audio file + cue list + scene builders; generic scene library to reduce per-song work.
- Check Suno licence before making it public (song is embedded).

## Conventions
English replies, short and direct, give a clear pick, challenge ideas, separate fact/source/guess. End real decisions with up to 3 "Blind spots".
