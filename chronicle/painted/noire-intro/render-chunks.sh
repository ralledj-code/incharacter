#!/bin/bash
# Record the intro from the Chronicle player in 10-second chunks, 3 at a time; finished chunks are kept, so a rerun
# (after a container restart) only redoes what is missing. Run from chronicle/: painted/noire-intro/render-chunks.sh <outdir>
OUT=$1; mkdir -p $OUT; END=164; STEP=10; JOBS=${JOBS:-3}
chunk() { local a=$1 b=$2 d=$OUT/k$(printf %03d $1)
  [ -f $d/done ] && return; rm -rf $d
  PIPE=1 NO_SERVER=1 LEVEL=noire-intro node tools/pshot.cjs $d video $a $b 30 1920 1080 > $d.log 2>&1 && touch $d/done && echo "chunk $a-$b ok" || echo "chunk $a-$b FAILED"; }
export -f chunk; export OUT
seq 0 $STEP $((END-1)) | while read a; do b=$((a+STEP)); [ $b -gt $END ] && b=$END; echo "$a $b"; done | xargs -P $JOBS -L 1 bash -c 'chunk $0 $1'
ls $OUT/*/done | wc -l
