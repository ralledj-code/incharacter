---
name: chronicle-level
description: Turn a campaign song (mp3 + level number) into a playable Alaron Chronicle level, unattended. Use when Rasmus drops an mp3 for the Chronicle, says "level N", "make this song a level", or asks to add a song to the book.
---

# Chronicle level from an mp3 (runs unattended)

Rasmus often drops the track and goes to sleep. Do not stop to ask questions: use the defaults in `chronicle/LEVELS.md`, note every assumption, and finish with a short report.

**Since 2026-10-26 levels are painted** (see "Painted levels" in `chronicle/CLAUDE.md`). Do the unattended part (audio in place, Gemini lyric times, beats, cues: the timing steps of LEVELS.md), then write the painted storyboard and STOP before generating any image: painting costs real money (~20 DKK a level with Flash 3.1 in batch mode, the default, measured; Gemini credits) and the story must be checked. Report the story as you read it plus every question that changes a painting, and the cost estimate. Paint only after Rasmus answers and says go.

Inputs: the mp3 (an upload or a path) and the level number 1–12 (playlist order in `chronicle/src/s0_stories.js`). If the number is missing, match the file name / song title against PLAYLIST titles. Lyrics text and the session recap are optional: the Whisper transcript is the fallback for both.

Follow `chronicle/LEVELS.md` for timing (Gemini transcription + forced alignment + beats), then the "Painted levels" runbook in `chronicle/CLAUDE.md`:
1. Copy the song to `public/chronicle/levels/NN-<id>.mp3` (m4a: convert with ffmpeg).
2. Measure from the audio: `scripts/gemini-transcribe.mjs`, `scripts/gemini-align.mjs`, `scripts/beats.py`. Never guess timings.
3. `chronicle/src/levels/LNN-<id>.js` from `_TEMPLATE.js` + the PLAYLIST row in `src/s0_stories.js`.
4. Storyboard `painted/make/NN.py` (pattern: make/14.py), cast sheets, paint in batch, contact sheet, repaint clear failures, crop-bars, layers.
5. `npm run build && npm test` in `chronicle/`, play it headless from `?song=<id>` and check frames and lyric timing.
6. Commit, push, PR (Rasmus merges). Report: what the level shows, uncertain lyric lines, skipped details, images used.
Direction and character looks: `chronicle/CLAUDE.md`.
