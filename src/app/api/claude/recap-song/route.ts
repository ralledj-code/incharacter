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

function buildStyleString(dominantMoods: string[]): string {
  const top = dominantMoods.slice(0, 2)
  const primary = MOOD_MAP[top[0]] ?? MOOD_MAP['MYSTERY']
  const secondary = top[1] ? MOOD_MAP[top[1]] : null

  const bpmRange = primary.bpm
  const instruments = secondary
    ? `${primary.instruments}, blending into ${secondary.instruments}`
    : primary.instruments

  // Suno v5.5 format: BPM, key, genre, instruments, vocal, negatives — under 1000 chars
  return [
    `${bpmRange} BPM, D minor`,
    `epic cinematic nordic battle hymn, viking bard ballad`,
    instruments,
    `nyckelharpa low string drone, heavy soaring pan flute lead melody, powerful deep choir`,
    `single raspy deep male bard vocal — weathered storyteller's voice, not screamed, not metal growl`,
    `dynamic explosive shifts between quiet solo narration and full choir-and-drum battle swells`,
    `no autotune, no reverb wash, no electronic elements`,
  ].join(', ')
}

const CHARACTER_CONTEXT = `CHARACTER CONTEXT (never deviate from this):
- Lucien Vale: Wild Magic Sorcerer, half-brother to Arthas and Cedric. Good-hearted but criminal and deceitful. FIRST PERSON NARRATOR.
- Arthas: Paladin of Tyr, Lucien's half-brother. Deeply protective, oath-bound.
- Cedric: Monk, Arthas's brother and Lucien's half-brother. Cunning, extremely quick.`

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

    // 4. Build the Suno v5.5 style string
    const stylePrompt = buildStyleString(dominantMoods)

    // 5. Call Claude
    const systemPrompt = `You are writing song lyrics for a tabletop RPG session recap to be used in Suno v5.5.

${CHARACTER_CONTEXT}

SUNO v5.5 LYRIC FORMAT RULES:
- Use bracket meta-tags for every section: [Intro], [Verse 1], [Pre-Chorus], [Chorus], [Verse 2], [Bridge], [Outro] etc
- Add production notes inside section brackets when needed: [Chorus: full choir, war drums, pan flute soaring]
- Bracket tags tell Suno the structure — be specific and consistent
- Keep verses 4-8 lines. Chorus 4-6 lines, repeated identically or near-identically each time.

STRICT CONTENT RULES:
1. Events must appear in EXACTLY the chronological order given. NEVER reorder.
2. Do NOT invent any plot details not present in the entries.
3. Use correct character classes and relationships as defined above. Never deviate.
4. Write in first person as Lucien throughout.
5. Each verse covers 2-3 sequential entries.
6. If the session ended unresolved or on a cliffhanger, the outro MUST stay unresolved. Do not provide closure that didn't happen.
7. Emotional tone must match the dominant mood tags.
8. Nordic folk ballad feel — poetic but grounded, not fantasy cliché.
9. Include a timestamp comment before each verse: [Verse 1: sparse drums — 8:15 PM, the well]

TARGET STRUCTURE:
[Intro] → [Verse 1] → [Verse 1b if needed] → [Pre-Chorus] → [Chorus] → [Verse 2] → [Verse 2b if needed] → [Chorus] → [Bridge] → [Outro]`

    const userPrompt = `SESSION ENTRIES (chronological — DO NOT REORDER):
${entries.map((e, i) => `${i + 1}. [${new Date(e.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}] [${e.category}] ${e.text}`).join('\n')}

DOMINANT MOOD: ${dominantMoods.join(', ')}
SESSION TITLE: ${sessionTitle}
CHARACTER: ${characterName}

Write the full lyrics now. Match the style prompt: ${stylePrompt}`

    const client = new Anthropic({ apiKey })
    const message = await client.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const lyrics = message.content[0].type === 'text' ? message.content[0].text.trim() : ''

    // 6. Return the style prompt and the lyrics
    return NextResponse.json({ stylePrompt, lyrics })
  } catch (error) {
    console.error('[recap-song] error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
