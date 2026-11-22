# DM video: Tyr's price (continuation of episode 14). Draft plan, waiting for the DM's answers

Script v2 (Rasmus's message 2026-11-22: the wurm dives, silence, Dolkan drops his madness, the staff, violet spores, the memory).
Speaker name: Valerys (the script says Valerious). Output: MP4 1080p + .srt; material kept here.

## Length
Voices alone ≈ 3.5 min at a calm, intense pace (~530 words); with pauses ≈ 4.5-5 min (asked: 3 min). Default: let it run long.

## Beat sheet (times approximate)
I    0:00-0:35  The silence after the wurm. No voice. Rumble fades, stones settle, drips, shallow breathing, sub-bass. Valerys bleeding by the pool; party frozen; Dolkan's white eyes in the rocks, muttering stops; he steps out, face hardens; STAFF HITS STONE (crack, boom, violet spores rush the camera, sound sucks out to a ring).
II   0:35-1:40  "Listen closely, boys…" Close on Dolkan. "Look through my memory" -> rain, underscore starts (low choir drone, strings). 0:58 no-voice beat: rain on stained glass, thunder. Mother's absence (cloak on a chair), the boys on blankets, black veins, child's fast heartbeat. Young Valerys kneeling. 3 s of rain + heartbeat.
III  1:40-2:05  Valerys's plea, music out, rain only. Echo after "let them live!", long pause, thunder stops.
IV   2:05-3:25  "The torches freeze…" white flames, cold hiss, shadows like bars. "a thousand blades" metallic swell, hard cut-off, 2 s silence, blindfolded statue. Tyr: deep, slow, long echo, low choir chord under each sentence. "Name the price." Tyr's price over a slow heavy pulse; flare and silence on "consume you".
V    3:25-4:20  Dolkan, grave; Valerys's slow heartbeat. Flash-forwards (cold palette, 4-5 s each): Cedric led to the monastery in rain; young Arthas reaching, father turning away; city gates closing (iron clang). Sword laid on the altar (ring), pause; arms open, golden light, choir rises (only time), veins fade, his shadow pressed into the stone. "Let my life be their chain." Choir holds one note, stops.
VI   4:20-4:55  Back in the cavern: spores scatter, rain fades, drip returns. Dolkan's last line over a growing rumble; inserts: Duncastle Oathbreaker (reuse level 12), Valerys bleeding now, the brothers. "…tears through the stone again!" floor cracks, dust jumps, CUT TO BLACK on a boom. Black, tremor, one drip.

## Production
~60 paintings (Flash batch, painted style, level 13/14 sheets + updated Dolkan with a crystal staff + young Valerys + boy Arthas/Cedric).
Voices: Gemini 2.5 Pro TTS (Dolkan low serious rasp; Valerys younger, hoarse, breaking; Tyr very deep, slow, echo + thunder layer in the mix); samples first.
Music + SFX: try Lyria; drop anything fake. Underscore only inside the memory.
Render: the Chronicle painted player offline (tools/pshot.cjs video) + ffmpeg mix. Est. ~25 DKK.

## Open questions (see chat): 1-3 voices, 5-12 look, 15-17 output, A-E present scene.

## Dolkan (decided 2026-11-22, from Rasmus's miniature photo cast/dolkan-miniature.jpg)
Paint as a living duergar at full size (not a miniature, no base): short, stocky, grey stone-like skin, bald with a single tuft, enormous wild bushy beard and eyebrows braided with beads, long drooping moustache, glowing white eyes, a scarred face (script), heavy hooded cloak (hood down) with a round sigil clasp, layered robes, wide belt with a round studded buckle, a dagger, rings, curled-toe boots, a twisted gnarled wooden staff crowned with a cluster of crystals; magic as violet spores swirling from his left hand. Replaces the level 13 lantern look from this video on (level 13 itself unchanged unless asked).

## Rasmus 2026-11-22: don't skimp, sync SFX to the picture
- ~90-100 paintings (≈ one per 3 s, rapid cuts at peaks). Hero frames (10-12) in gemini-3-pro-image 2K: Dolkan's face hardening, the staff strike, the boys with black veins, kneeling Valerys, Tyr's blindfolded statue in white fire, the golden light, the gates closing, the final cracked floor. Rest Flash batch. Est. total ≈ 55 DKK (calibrated rates).
- Every SFX hit = a cut or flash on the same frame: staff strike (hard cut, white flash frame, violet shockwave; crack + boom on the frame), lightning (white frame + cut to a new sanctum shot, thunder on the frame, roll ~0.5 s later), torches freeze (flame turns white on a cut, cold hiss starts there), thousand blades (swell ends on a hard cut to Tyr, then silence), sword on altar and city gates (own cuts, ring / clang), golden light (slow swell + choir), final crack (cut to black on the boom), heartbeats (subtle light pulse per beat, no cuts).
- Order: voices recorded and timed first, then the storyboard locked to them, then SFX placed frame-exact, then render.

## Rasmus 2026-11-22: also in the Chronicle, hidden
Link-only song (e.g. ?song=tyrs-price), not in the song list AND not on the family page (needs a `secret: true` flag: today every hidden non-variant song shows on /chronicle/familie). MP4 still delivered. Same mixed audio file in both, so SFX timing carries over; the white flash frames in the MP4 should match the player's 'flash' transitions on the same cuts.

## Rasmus 2026-11-22: NO MP4. Chronicle only (hidden, `secret: true`, link-only). Supersedes the MP4/.srt items above.
Done while waiting for the DM:
- `secret` flag in ui.js (hidden songs with secret: true never show on the family page).
- SFX: Lyria (music model) cannot do effects (everything came out as music). Gemini Omni text_to_video at 360p gives real effect audio (~0.15 DKK/s): sfx/*.mp3 (staff, thunder, rain, hiss, blades, heart, sword, gate, rumble, drips, spores), all rated 4-5 realistic except hiss (3). Script sfx/make-sfx.mjs.
- Music: music/underscore-test.mp3 (Lyria 3 Pro, 3 min, dark cello + choir drone; usable).
- Voice candidates: voice-samples/ (Dolkan: Algieba, Enceladus, Gacrux, Rasalgethi; Valerys: Iapetus, Orus, Sadachbia, Schedar; Tyr with depth + echo: Alnilam, Charon, Umbriel, Zubenelgenubi).
- Board painted/14-tyrs-price.json (make/14t.py): cast copied from level 14 + new Dolkan + young_valerys (Pro); place references ref_sanctum (rain falls inside the hall: fix in real shots) and ref_cavern (Pro).
