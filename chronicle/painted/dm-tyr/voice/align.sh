#!/bin/bash
# Re-align the subtitle lines of the given clips (voice/align/<id>.json -> <id>.out.json) on the current best/<id>.wav. Run from painted/dm-tyr.
cd voice/align
for id in "$@"; do
  ffmpeg -loglevel error -y -i ../best/$id.wav -b:a 96k $id.mp3
  ( node ../../../../scripts/gemini-align.mjs $id.mp3 $id.json $id.out.json > $id.log 2>&1; echo "$id $(cat $id.log)" ) &
done; wait
