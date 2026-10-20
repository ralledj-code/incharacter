---
name: chronicle-level
description: Turn a campaign song (mp3 + level number) into a playable Alaron Chronicle level, unattended. Use when Rasmus drops an mp3 for the Chronicle, says "level N", "make this song a level", or asks to add a song to the book.
---

# Chronicle level from an mp3 (runs unattended)

Rasmus often drops the track and goes to sleep. Do not stop to ask questions: use the defaults in `chronicle/LEVELS.md`, note every assumption, and finish with a short report.

Inputs: the mp3 (an upload or a path) and the level number 1–12 (playlist order in `chronicle/src/s0_stories.js`). If the number is missing, match the file name / song title against PLAYLIST titles. Lyrics text and the session recap are optional: the Whisper transcript is the fallback for both.

Follow `chronicle/LEVELS.md` in order:
1. Copy the mp3 to `public/chronicle/levels/NN-<id>.mp3`.
2. Measure from the audio: `scripts/transcribe.py`, `scripts/beats.py`, `scripts/align-lyrics.mjs` (venv in the scratchpad, `PIP_CONFIG_FILE=nul` for pip). Never guess timings.
3. `chronicle/src/levels/LNN-<id>.js` from `_TEMPLATE.js`: cues, line times, beats, moods, scenes with models for everything alive, anchors, clearings, a music-video shot list cut to the bars. Look at level 8 for the bar to beat.
4. `npm run build && npm test` in `chronicle/`; then `chronicle/tools/` (shot.cjs with `LEVEL=<id>`, sheet.cjs, flow.cjs desktop + mobile). Look at every frame, fix, repeat until it looks good.
5. Commit and push to master (no branches, no previews). Report: what the level shows, uncertain lyric lines, skipped details, level download size.
Direction and character looks: `chronicle/LEVELS.md` and `chronicle/CLAUDE.md`.
