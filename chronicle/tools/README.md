# Chronicle tools (headless checks)
Run from `chronicle/` with the static server up: `npx serve -l 5173 ../public/chronicle`. Uses the pre-installed Chromium through playwright.

| Tool | Use |
|---|---|
| `[LEVEL=<id>] node tools/pshot.cjs <outDir> "t,t,..." [w h]` | stills of a painted level at song times |
| `[LEVEL=<id>] node tools/pshot.cjs <outDir> video <t0> <t1> [fps w h]` | an mp4 of a stretch with the song (SwiftShader: ~1 min per second) |
| `node tools/sheet.cjs <dir> <out.png> [cols]` | contact sheet of a folder of frames (labels = file names) |
