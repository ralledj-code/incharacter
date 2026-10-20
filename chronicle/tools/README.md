# Chronicle tools (headless checks and asset fetching)
Run from `chronicle/` with the static server up: `npx serve -l 5173 ../public/chronicle`.
Uses the system Chrome through playwright-core (no browser download).

| Tool | Use |
|---|---|
| `node tools/shot.cjs <outDir> "<spec>" [w h]` | frames of the first playable level at song times; spec = comma list of `walk`, `book`, `<seconds>`, optional `@yaw:pitch`. Env `TM=ACESFilmic:1.3` tries another tone mapping. |
| `node tools/sheet.cjs <dir> <out.png> [cols]` | contact sheet of a folder of frames (labels = file names) |
| `node tools/flow.cjs <outDir> [mobile]` | the real UI flow (start, walk, book, request, ride, seek, end) with screenshots, state and network log |
| `node tools/itch.cjs <slug>` | list a free quaternius.itch.io pack's files |
| `node tools/itchpw.cjs <outDir> <slug>...` | download free quaternius.itch.io packs (real browser flow) |
| `node tools/fbx2glb.cjs <in.fbx> <out.glb>` | convert an FBX (with animations) to glb via three r128 |
Level: env `LEVEL=<id>` (default: the last playable level), e.g. `LEVEL=saving-cobh node tools/shot.cjs out "5,20,40"`.
