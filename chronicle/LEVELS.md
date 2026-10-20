# Making a level from a song

One song = one level = one page in the book. Input from Rasmus: **an mp3 and its level number** (the playlist order in `src/s0_stories.js` PLAYLIST: 1 Alaron, the First Steps … 12 The Fall of Duncastle). Everything else follows from here. Reference implementation: level 8, Baphomet's Chains (`w1_core.js` CUES/KEYS + `s1a`–`s1d` scenes).

## 0. Inputs
- mp3 → copy to `public/chronicle/levels/NN-<id>.mp3` (NN two digits, id from PLAYLIST).
- Lyrics: ask for the Suno lyrics text if not given (Suno → song → lyrics). Without them, use the Whisper transcript (step 1) and clean it up; mark doubtful words in the report.
- Story: the session recap for that date (InCharacter session log). Ask Rasmus to paste it if not available. The lyrics alone are a valid fallback: they already tell the session.
- Song length: from the mp3 (Whisper prints duration; or `ffprobe`).

## 1. Timings from the audio (never guess)
Whisper (faster-whisper, CPU, ~2–3 min per song with large-v3-turbo):
```
py -3.10 -m venv <scratch>/wh
PIP_CONFIG_FILE=nul <scratch>/wh/Scripts/python -m pip install faster-whisper "huggingface_hub<1"
<scratch>/wh/Scripts/python scripts/transcribe.py public/chronicle/levels/NN-<id>.mp3 <scratch>/words.json > <scratch>/transcript.txt
```
(Rasmus's global pip config has `no-deps=true`; `PIP_CONFIG_FILE=nul` bypasses it for the venv install. Keep the venv in the scratchpad, not the repo.)

Then align the known lyrics:
```
node scripts/align-lyrics.mjs <scratch>/words.json <scratch>/lyrics.json <scratch>/align.json
```
`lyrics.json` = `[{ "section": "v1", "lines": ["...", ...] }, ...]` in song order. Output: one start time per line (`lineTimes`), each section's first-line time, and a review table with % of words matched. Lines under 40 % or marked `~` (interpolated) need a listen: check against `transcript.txt` timestamps, or ride the level with **Sync lyrics** and tap.

Section times: `CUES[i].t` = the section's first sung line minus ~0.5 s (so the scene lands with the voice). Instrumental intro/breaks/outro: read them off the gaps in `transcript.txt`.

## 2. The level module
Copy `src/levels/_TEMPLATE.js` → `src/levels/LNN-<id>.js`. Fill in:
- `ID`, `DURATION`, `CUES` (sections, speeds, motes, stamps, lines), `LINE_TIMES` (from align.json), `KEYS` (moods following the song's emotional arc; add moods with `C.defineMood`).
- `session` (`Level N · Session recap · …`), `blurb` (2–3 sentences, the party's voice), `length`, `audio`.
- `SCENES`: one builder per story beat, using the kit (trees, village, props, characters with poses, fire, torches, glows, lights).
- Optional `flashAt` (big hit), `gaolCue` (end room with frozen heading).
The build and the smoke test pick the file up automatically; the book page unlocks because `C.levels[id]` now exists.

### Story direction (from Rasmus)
Stay true to the session. Leave things to imagination; skip a detail rather than rush a scene. Subtle motion, fog, sparse silhouettes. Don't crowd. Characters: Lucien Vale (half-elf wild magic sorcerer, the singer; burgundy coat, long blond hair, blue-glowing dagger), Cedric (human monk; red leather, bronze pauldrons, staff), Arthas (human devout paladin; steel, helm of dread). Recurring NPC: Neeris (wolf-cursed). New NPCs/creatures: build from the kit or procedural shapes, keep them in silhouette.

### Speeds
`v` is metres per second of rail travel. Calm verse 1.3–1.9, chorus 2.6–3.2, near-stop for endings 0.1–0.4. Scenes are placed by section distance (`X.sec[id].d0/d1/mid`), so changing a section's `t` or `v` moves its scenery with it.

## 3. Check
```
cd chronicle && npm run build && npm test
```
Then look at it: headless screenshots at several song times (every section) and a full UI flow (desktop + 390 px phone). Fix anything blocking the view (props on the rail, lights blowing out walls), then commit `chronicle/src/levels/LNN-<id>.js` + `public/chronicle/levels/NN-<id>.mp3` + the rebuilt `public/chronicle/index.html`.

## Done when
- Book page shows the level as playable (title, session line, blurb), Begin starts the song.
- Lyrics appear on the vocals (align report has no weak lines left unchecked).
- Every section has a scene; nothing clips the rail; smoke test passes.
