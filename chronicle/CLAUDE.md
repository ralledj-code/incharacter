# Alaron Chronicle

Interactive 3D "ride" for Rasmus's D&D campaign (island of Alaron). Player walks into an empty bar, sits at a chair by a lectern, flips a book to pick a story, and the chair rides rails through fog scenes synced to a Suno song. Singer in the songs = Lucien Vale (half-elf Wild Magic Sorcerer, Rasmus's character). Lyrics come from InCharacter session logs.

POC status: playable slice, first story "Baphomet's Chains" (366.8 s). First visual pass done 2026-10-20 (headless Chrome screenshots across the whole ride, desktop + 390px phone): full flow walk -> sit -> book -> ride -> lyrics works. Not yet checked on a real phone or the Legion Go.

## Where it lives
Inside the InCharacter repo (ralledj-code/incharacter). Source: `chronicle/`. Build output: `public/chronicle/index.html` (committed) next to `public/chronicle/song.mp3`. Served at `/chronicle` (rewrite in next.config.mjs). Middleware gates it: its matcher does not exclude .html/.mp3, so page and song need a login.

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

## Architecture (src/, IIFEs sharing `window.__cw`; build order in scripts/build.mjs)
- w1_core: helpers, CUES (lyrics, stamps, speed v, mote kind), MOODS/KEYS (mood keyframes lerped by song time), geometry/texture helpers. `C.storyData.baphomet`.
- w2_engine: `C.create()` -> W. Sky shader, lights, ground, motes, chair, rail path from timeline, modes walk|book|ride, `W.update(state)`. Everything is a deterministic function of song time t (audio.currentTime is the master clock; seeking works).
- w3_kit / w3b_chars: trees, torches, figures, fire, houses; characters cedric, lucien, arthas, neeris.
- w4_bar / w4_book: tavern hub, lectern + page-flip book (`setStories`, `next/prev`).
- s0_stories: story registry (plug-in modules: id,title,blurb,audio,cues,keys,duration,flashAt,gaolCue,build(X)). s1*: Baphomet scenes.
- ui.js: renderer, input (drag look, WASD, touch Walk pad), sit/book/ride flow, HUD, lyrics, lyric tap-sync, end card, dev panel (D, K marks).
- Rail: speed per cue integrated into distance table; heading frozen before the gaol cell. Camera yaw = atan2(-tx,-tz).

## Known problems / TODO (priority order)
1. Done in first pass: chair lantern moved behind the rider (was blocking the right of the view), crossroads signpost moved off the rail, fireplace/gate/city light blowouts toned down, phone top bar fits, portrait FOV widened. Still to do: test on a real phone + Legion Go (SteamOS, perf). Linear tone mapping kept on purpose (ACES tried, washed colours out).
2. **Cue times (CUES[].t) are estimates** from librosa; Suno re-timed the lyrics. Lyric lines are spaced evenly inside sections unless tap-synced. Use the "Sync lyrics" button (rides, taps each line) -> JSON of line times -> store as `lineTimes` in the story (loadTimes in ui.js reads story.lineTimes or localStorage `alaron:<id>`). Also correct section times with dev panel K marks. Better: get timestamped lyrics from Suno or run Whisper locally for alignment.
3. Visual upgrade, in order: bloom + vignette + grading (EffectComposer/UnrealBloom, bundle add-ons), generated textures for stone/wood/cloth, shadows + baked AO on desktop only, volumetric light shafts, better character models (proper rigs/glTF). Keep a low-quality path for mobile.
4. Story direction from Rasmus: stay true to the story, leave things to imagination, skip detail rather than rush a scene. Subtle motion, fog, sparse silhouettes. Don't crowd.
5. Looking: drag direction was reported reversed on mobile; fixed (yaw/pitch signs), unverified.
6. Characters: Cedric (monk: red leather, bronze dragon pauldrons, green tunic, beads, wooden staff), Lucien (long blond hair, pointed ears, burgundy velvet coat, silver flute, glowing blue dagger), Arthas (devout paladin, helm of dread, no picture).

## Roadmap
- Quality target: "polished stylized" (Journey/Valheim feel), not Skyrim realism. The limit is assets, not WebGL. Steps: upgrade Three.js r128 -> current (ES modules, bundler), post-processing (bloom, vignette, grading), glTF props/characters from asset packs (Quaternius/Kenney free, Synty paid) + Mixamo animations, desktop-only shadows/AO. Keep a mobile low path.
- Lives in InCharacter now (login-gated static route, Vercel preview per branch).
- Next: stories as Supabase rows (cues/keys/lineTimes JSON), audio in Supabase Storage (private bucket, signed URLs) instead of public/. Forge shares InCharacter's Supabase auth.
- New story = audio file + cue list + scene builders; generic scene library to reduce per-song work.
- Check Suno licence before making it public (song is embedded).

## Conventions
English replies, short and direct, give a clear pick, challenge ideas, separate fact/source/guess. End real decisions with up to 3 "Blind spots".
