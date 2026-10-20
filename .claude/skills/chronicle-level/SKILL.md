---
name: chronicle-level
description: Turn a campaign song (mp3 + level number) into a playable Alaron Chronicle level. Use when Rasmus drops an mp3 for the Chronicle, says "level N", "make this song a level/ride", or asks to add a song to the book.
---

# Chronicle level from an mp3

Inputs: the mp3 path and the level number (1–12, playlist order in `chronicle/src/s0_stories.js` PLAYLIST). If the number is missing, ask. Ask for the Suno lyrics text and the session recap if they are not in the conversation (the lyrics can come from the Whisper transcript as a fallback).

Follow `chronicle/LEVELS.md` step by step:
1. Copy the mp3 to `public/chronicle/levels/NN-<id>.mp3`.
2. Transcribe with `chronicle/scripts/transcribe.py` (faster-whisper venv in the scratchpad) and align lyrics with `chronicle/scripts/align-lyrics.mjs`. Timings come from the audio, never from guesses. Report weak lines.
3. Copy `chronicle/src/levels/_TEMPLATE.js` to `chronicle/src/levels/LNN-<id>.js`, fill cues, lineTimes, moods and scenes following the story direction in LEVELS.md and `chronicle/CLAUDE.md`.
4. `npm run build && npm test` in `chronicle/`, then screenshot every section headless and run the UI flow (desktop + phone). Fix what looks wrong.
5. Commit on a branch and push; tell Rasmus what the level shows, which lyric lines were uncertain, and what to check by ear.
