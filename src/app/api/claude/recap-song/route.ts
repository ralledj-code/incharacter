import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDecryptedApiKey } from '@/lib/getApiKey'
import { createClient as rawClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRec = Record<string, any>

const admin = rawClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Final 20% of the session weighted 1.5x — the ending colours the song most
const MOOD_WEIGHTS = { early: 1.0, late: 1.5 }

const MOOD_MAP: Record<string, { instruments: string; bpm: string; energy: string }> = {
  VICTORY:     { instruments: 'full choir swell, war horns, driving war drums, triumphant Picardy resolution', bpm: '120-140', energy: 'explosive, triumphant' },
  VIOLENCE:    { instruments: 'aggressive war drums, brass stabs, fast double-time, no melody — just impact', bpm: '130-150', energy: 'relentless, brutal' },
  BETRAYAL:    { instruments: 'dissonant strings, sparse instrumentation, cold minor-key drone', bpm: '60-80', energy: 'cold, hollow' },
  LOSS:        { instruments: 'solo pan flute, mournful low strings, slow tempo, choir reduced to a hum', bpm: '50-70', energy: 'mournful, still' },
  HUMOUR:      { instruments: 'jaunty pan flute runs, lighter folk percussion, faster footwork rhythm', bpm: '100-120', energy: 'light, wry' },
  REVELATION:  { instruments: 'silence-to-swell dynamic, whispered choir building to full sound', bpm: '70-100 building', energy: 'gathering, inevitable' },
  MYSTERY:     { instruments: 'sparse ambient drone, minimal percussion, melody that never resolves', bpm: '60-80', energy: 'uneasy, unresolved' },
  BOND:        { instruments: 'warm strings, gentle folk melody, intimate acoustic feel', bpm: '70-90', energy: 'warm, intimate' },
  FEAR:        { instruments: 'low tremolo strings, sparse piano, slow building tension', bpm: '55-75', energy: 'tense, creeping' },
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { sessionId } = await req.json().catch(() => ({}))
    if (!sessionId) return NextResponse.json({ error: 'sessionId is required' }, { status: 400 })

    // 1. Auth: confirm sessions.player_id = auth.uid() using the service role
    const { data: session } = await (admin.from('sessions') as AnyRec)
      .select('player_id, title, character_name')
      .eq('id', sessionId)
      .single()
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    if (session.player_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const apiKey = await getDecryptedApiKey(user.id)
    if (!apiKey) return NextResponse.json({ error: 'No API key configured' }, { status: 400 })

    // 2. Fetch entries in strict chronological order — never the summary blob
    const { data: entriesData } = await (admin.from('entries') as AnyRec)
      .select('text, category, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })

    const entries: Array<{ text: string; category: string | null; created_at: string }> = entriesData || []
    if (entries.length === 0) {
      return NextResponse.json({ error: 'This session has no entries to sing about.' }, { status: 400 })
    }

    // 3. Score moods — count category frequency, weight the final 20% by 1.5x
    const lateStart = Math.floor(entries.length * 0.8)
    const scores: Record<string, number> = {}
    entries.forEach((e, i) => {
      const tag = (e.category || '').toUpperCase()
      if (!MOOD_MAP[tag]) return // only real moods count toward the song's tone
      const weight = i >= lateStart ? MOOD_WEIGHTS.late : MOOD_WEIGHTS.early
      scores[tag] = (scores[tag] || 0) + weight
    })
    const dominantMoods = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag)
    if (dominantMoods.length === 0) dominantMoods.push('MYSTERY')

    const sessionTitle: string = session.title || 'Untitled Session'
    const characterName: string = session.character_name || 'Lucien Vale'

    // 4. Call Claude
    const systemPrompt = `You are a viking bard writing a song recap of a tabletop RPG session.
Your job is to make the players want to listen to it again and again — in the car, at the table, around a fire.

CHARACTER CONTEXT (never deviate):
Lucien Vale — Wild Magic Sorcerer, half-elf, charming drifter and former criminal. Good-hearted but deceitful. First-person narrator. Plays flute. Drinks too much. Came to Alaron hunting Severin Draik, the woman who used him in an infernal ritual. Found half-brothers instead.
Arthas — Paladin of Tyr, Lucien's half-brother. Oath-bound, protective, walks toward danger like it owes him money.
Cedric — Monk, Arthas's brother, Lucien's half-brother. Cunning, blindingly fast, quiet until he isn't.

SONG WRITING RULES:

1. Write like a bard performing at full volume to a drunk crowd who were THERE.
   Punchy, memorable, singable. Every line should be something a player quotes later.

2. Events appear in EXACT chronological order. Never reorder.

3. RHYME IS MANDATORY on verse couplets. Every pair of lines must land a clean rhyme.
   End-rhyme, not forced — chase the rhyme that fits, cut the line that doesn't.
   Chorus lines rhyme as a set. Pre-chorus builds to the chorus rhyme scheme.

4. SYLLABLE COUNT CONSISTENCY. Count syllables per line — aim for 8-10 per line throughout.
   Inconsistent metre is why Suno speaks instead of sings. Every line must scan to a beat.
   Read every line aloud before keeping it. If you stumble, rewrite it.

5. ONE MOMENT PER VERSE. Each verse covers exactly one key moment — not two, not three.
   Pick the single most important beat. Write 4-6 lines around it. Cut everything else.
   The instrumental carries the rest. Trust the music between verses.

6. THE CHORUS is the car-singing moment. It must:
   - Open with the session's location or title as a chanted word or short phrase
   - Name the emotional truth of the session in plain language
   - Rhyme cleanly across all four lines
   - Be identical every time it repeats — no variations
   - Feel like something a crowd shouts back at the stage
   - NOT replicate the Baphomet song chorus structure ("Sing of the brothers...") — find its own identity

7. THE CHORUS BREAK is one line, shouted, alone.
   It is the single most explosive moment of the session.
   Set it up with a quiet verse. Drop it loud with nothing around it.
   It should make a listener look up from what they're doing.

8. SELECTIVE, NOT COMPREHENSIVE. Choose 4-5 moments maximum from the whole session.
   The best moments are: the emotional gut punch, the ambush or turn, the dark deal,
   the explosive action, the cliffhanger revelation.
   Everything else gets cut. A listener should see exactly one scene per verse.

9. BREATHING ROOM. Leave space. Extended instrumental passages between verses.
   Verse → instrumental → verse. The nyckelharpa carries the mood between words.
   Do not pack the song wall to wall with lyrics.

10. UNRESOLVED ENDINGS. If the session ended on a cliffhanger, the outro must stay unresolved.
    End on a hook, not a conclusion. No false triumph. March toward what's next, don't arrive.

11. LANGUAGE. DnD world voice. Specific, earned, never generic fantasy cliché.
    No "by the gods", no "brave heroes", no "destiny calls."
    Swear when it fits. "AND THEN I BURNED THE WHOLE DAMN PLACE" is the target energy.
    Write Lucien — dry, self-aware, occasionally surprised by his own capacity to care.

12. DO NOT invent plot details not in the entries.
    DO NOT use generic phrases.
    DO NOT write more than 6 lines per verse.

TARGET STRUCTURE:
[Intro: instrumental, 8 bars]
[Verse 1: sparse drums, spoken-sung — emotional gut punch moment]
[Verse 1b if needed: same energy, develops the moment]
[Instrumental: 6 bars, nyckelharpa leads]
[Pre-Chorus: drums rising, choir hum enters — the turn]
[CHORUS: full choir beneath vocal, war drums, pan flute soaring]
[Instrumental: pan flute solo, 8 bars]
[Verse 2: cold and deliberate — the dark deal or the cost]
[Verse 2b: building — the approach]
[Instrumental: tension building, 4 bars]
[CHORUS BREAK: single shouted line — the explosive moment — silence before and after]
[Instrumental explosion: full band, 4 bars, drops back]
[Verse 3: quiet, almost reverent — the revelation or body horror]
[Pre-Chorus 2: choir from silence, no drums — scale of it landing]
[CHORUS: full choir, war drums, pan flute]
[Outro: choir fades to hum, drums slow to march — unresolved, marching forward]
[Final: single war drum hit — silence]

STYLE PROMPT RULES (Suno v6):
Build the style string exactly as follows — under 1000 characters total.
This is the template that has produced the best results:

Genre and feel:
"Epic cinematic nordic battle hymn, viking bard ballad"

Percussion:
"war percussion and deep taiko-style drums"

Drone and strings:
"low string drone (nyckelharpa/hurdy-gurdy)"

Brass:
"war horns"

Lead melody:
"heavy soaring pan flute lead melody"

Choir:
"deep choir — powerful but sitting slightly beneath the vocal not over it"

Vocal — CRITICAL. This exact phrasing produced the best result:
"single deep male bard vocal, aged and weathered but clear — gravel in the chest not the throat, a voice that has sung this song a hundred times in smoky rooms"

Dynamics:
"dynamic explosive shifts between quiet solo narration and full choir-and-drum battle swells"
"extended instrumental passages between verses letting the nyckelharpa breathe"

Mix:
"low-end focused mix, weight in the drums and drone, nyckelharpa sitting in the low-mids, pan flute the only high instrument, no brightness, no treble sheen"
"wide dynamic range, drums mixed loud and upfront, kick and war drum hits physically felt not just heard, nyckelharpa drone felt in the chest"

Key and tempo:
"minor key, D minor, 78 BPM building to 140 BPM double-time at choruses"

Ending — choose based on session resolution:
Resolved: "resolves into triumphant Picardy cadence"
Unresolved: "ends on unresolved open minor fifth — no triumph, the story isn't over"

MOOD → INSTRUMENTAL BLEND (top 1-2 dominant tags shape the style):
VICTORY: triumphant war horns, driving double-time drums, choir full swell
VIOLENCE: aggressive brass stabs, relentless war drums, no melody just impact
BETRAYAL: dissonant strings, cold minor drone, sparse choir
LOSS: solo pan flute, mournful low strings, choir reduced to a hum
REVELATION: silence-to-swell, whispered choir building to full sound
MYSTERY: sparse ambient drone, melody that never resolves
HUMOUR: jaunty pan flute runs, lighter folk percussion underneath the battle sound
BOND: warm strings, gentle folk melody beneath the war instruments
FEAR: low tremolo strings, building tension with no release

SESSION ENTRIES (chronological — DO NOT REORDER):
${entries.map((e, i) => {
  const time = new Date(e.created_at).toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit'
  })
  return `${i + 1}. [${time}] [${e.category}] ${e.text}`
}).join('\n')}

DOMINANT MOOD: ${dominantMoods.join(', ')}
SESSION TITLE: ${sessionTitle || 'Untitled Session'}
CHARACTER: ${characterName}

Write the style prompt first, then the full lyrics.
Return as JSON: { "stylePrompt": "...", "lyrics": "..." }
No markdown. No explanation. Only JSON.`

    const client = new Anthropic({ apiKey })
    const message = await client.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 4000,
      thinking: { type: 'disabled' },
      system: systemPrompt,
      messages: [{ role: 'user', content: 'Write the song now, following all instructions above. Return only the JSON object.' }],
    })

    const textBlock = message.content.find(b => b.type === 'text')
    const rawText = textBlock?.type === 'text' ? textBlock.text.trim() : ''

    // 5. Parse Claude's JSON response — strip accidental markdown fences before parsing
    const jsonText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '')
    let stylePrompt = ''
    let lyrics = ''
    try {
      const parsed = JSON.parse(jsonText)
      stylePrompt = parsed.stylePrompt || ''
      lyrics = parsed.lyrics || ''
    } catch {
      return NextResponse.json({ error: 'Failed to parse song response from Claude.' }, { status: 502 })
    }

    // 6. Return the style prompt and the lyrics
    return NextResponse.json({ stylePrompt, lyrics })
  } catch (error) {
    console.error('[recap-song] error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
