#!/bin/bash
# Assemble the Alaron Noire intro v2 from the Chronicle player's recording (tools/pshot.cjs, PIPE=1, three chunks) + the
# title card + the mix. Run from painted/noire-intro/ after mix.py and render-chunks.sh. $1 = the folder with chunks/k*/frames.mp4 and title.png.
#   -> out/AlaronNoire_intro_v2.mp4        subtitles burned in (Chronicle style), with the underscore
#   -> out/AlaronNoire_intro_v2_clean.mp4  no subtitles; audio track 1 with the underscore, track 2 without (for the game's music)
#   -> AlaronNoire_intro_v2.srt            the subtitles on their own
set -e
R=$1; FONTS=${FONTS:?set FONTS to the folder with the IM Fell DW Pica ttf}
END=$(python3 -c "import json;print(json.load(open('timeline.json'))['end'])"); SE=$(python3 -c "import json;print(json.load(open('timeline.json'))['shots_end'])")
TD=$(python3 -c "print(round($END-$SE,3))")
# the title: 0.6 s black, 1 s in, hold, 1.6 s fade to black
ffmpeg -loglevel error -y -loop 1 -framerate 30 -t $TD -i $R/title.png -vf "format=yuv420p,fade=t=in:st=0.6:d=1.0,fade=t=out:st=$(python3 -c "print(round($TD-1.6,3))"):d=1.6" -c:v libx264 -preset slow -crf 16 -r 30 out/title.mp4
( for f in $(ls $R/chunks/k*/frames.mp4 | sort); do echo "file '$f'"; done; echo "file '$(pwd)/out/title.mp4'" ) > out/concat.txt
ffmpeg -loglevel error -y -f concat -safe 0 -i out/concat.txt -c copy out/picture.mp4
echo "picture $(ffprobe -v error -show_entries format=duration -of csv=p=0 out/picture.mp4) s (timeline $END)"
ENC="-c:v libx264 -preset slow -crf 19 -maxrate 12M -bufsize 24M -pix_fmt yuv420p -r 30"
ffmpeg -loglevel error -y -i out/picture.mp4 -i out/audio_music.wav -map 0:v -map 1:a -vf "ass=AlaronNoire_intro_v2.ass:fontsdir=$FONTS" $ENC \
  -c:a aac -b:a 192k -t $END -movflags +faststart out/AlaronNoire_intro_v2.mp4
ffmpeg -loglevel error -y -i out/picture.mp4 -i out/audio_music.wav -i out/audio_nomusic.wav -map 0:v -map 1:a -map 2:a $ENC \
  -c:a aac -b:a 192k -metadata:s:a:0 title="With underscore" -metadata:s:a:1 title="No music" -disposition:a:1 0 -t $END -movflags +faststart out/AlaronNoire_intro_v2_clean.mp4
ls -la out/AlaronNoire_intro_v2*.mp4
