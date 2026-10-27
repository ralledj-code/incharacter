---
name: chronicle-level
description: Turn a campaign song (mp3 + level number) into a playable Alaron Chronicle level, unattended. Use when Rasmus drops an mp3 for the Chronicle, says "level N", "make this song a level", or asks to add a song to the book.
---

# Chronicle level from an mp3 (runs unattended)

Rasmus often drops the track and goes to sleep. Do not stop to ask questions: use the defaults in `chronicle/LEVELS.md`, note every assumption, and finish with a short report.

**Since 2026-10-26 levels are painted** (see "Painted levels" in `chronicle/CLAUDE.md`). Do the unattended part (audio in place, Whisper lyric times, beats, cues: the timing steps of LEVELS.md), then write the painted storyboard and STOP before generating any image: painting costs real money (~45 DKK a level, Gemini credits) and the story must be checked. Report the story as you read it plus every question that changes a painting, and the cost estimate. Paint only after Rasmus answers and says go.

Inputs: the mp3 (an upload or a path) and the level number 1–12 (playlist order in `chronicle/src/s0_stories.js`). If the number is missing, match the file name / song title against PLAYLIST titles. Lyrics text and the session recap are optional: the Whisper transcript is the fallback for both.

Follow `chronicle/LEVELS.md` in order:
1. Copy the mp3 to `public/chronicle/levels/NN-<id>.mp3`.
2. Measure from the audio: `scripts/transcribe.py`, `scripts/beats.py`, `scripts/align-lyrics.mjs` (venv in the scratchpad, `PIP_CONFIG_FILE=nul` for pip). Never guess timings.
3. `chronicle/src/levels/LNN-<id>.js` from `_TEMPLATE.js`: cues, line times, beats, moods, scenes with models for everything alive, anchors, clearings, a music-video shot list cut to the bars. Look at level 8 for the bar to beat.
4. `npm run build && npm test` in `chronicle/`; then `chronicle/tools/`: clipcheck (must be clean), motioncheck (must be clean but marginal too-fast), film strips (`strip.cjs --debug`) on every action beat, contact sheets of the whole song (shot.cjs + sheet.cjs), flow.cjs desktop + mobile. Everything that moves must be a `C.act` actor. Fix and repeat until it looks good. Render a short mp4 of the best section (`video.cjs`, under 30 MB) for Rasmus.
5. Commit and push to master (no branches, no previews). Report: what the level shows, uncertain lyric lines, skipped details, level download size.
Direction and character looks: `chronicle/LEVELS.md` and `chronicle/CLAUDE.md`.
