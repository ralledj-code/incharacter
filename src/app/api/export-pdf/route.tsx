import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { renderToBuffer, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>

const styles = StyleSheet.create({
  page: { backgroundColor: '#0f0f0f', color: '#e8e8e8', padding: 40 },
  title: { fontSize: 24, color: '#c9a84c', marginBottom: 6 },
  subtitle: { fontSize: 12, color: '#a0a0a0', marginBottom: 28 },
  sectionHeader: { fontSize: 9, color: '#c9a84c', letterSpacing: 2, marginBottom: 8, marginTop: 20 },
  body: { fontSize: 11, color: '#e8e8e8', lineHeight: 1.6, marginBottom: 6 },
  bodyDim: { fontSize: 11, color: '#a0a0a0', lineHeight: 1.6, marginBottom: 4 },
  divider: { borderBottomWidth: 1, borderBottomColor: '#2e2e2e', marginVertical: 12 },
  tag: { fontSize: 8, color: '#c9a84c', marginBottom: 2 },
})

// Safe string helper — avoids null/undefined crashing PDF renderer
function safe(v: unknown, fallback = ''): string {
  if (v == null) return fallback
  const s = String(v).trim()
  return s || fallback
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const db = (t: string) => (supabase.from(t) as AnyRecord)

    const { data: character } = await db('characters')
      .select('id, name, dossier_text')
      .eq('player_id', user.id)
      .order('created_at', { ascending: false }).limit(1).single()

    if (!character) return NextResponse.json({ error: 'No character' }, { status: 404 })

    const charName = safe(character.name, 'Character')

    const [{ data: sessions }, { data: clues }, { data: relationships }] = await Promise.all([
      db('sessions').select('id, session_number, started_at, waking_text, events(id, category, reaction, narrative)')
        .eq('character_id', character.id).order('session_number', { ascending: true }),
      db('clues').select('id, source_type, raw_text, narrative, current_belief')
        .eq('character_id', character.id).order('created_at', { ascending: true }),
      db('relationships').select('id, npc_name, moment_type, narrative')
        .eq('character_id', character.id).order('created_at', { ascending: true }),
    ])

    const safeSessions = (sessions || []) as AnyRecord[]
    const safeClues = (clues || []) as AnyRecord[]
    const safeRels = (relationships || []) as AnyRecord[]

    const Doc = () => (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={styles.title}>{charName}</Text>
          <Text style={styles.subtitle}>Character Journey · In Character</Text>
          <View style={styles.divider} />

          {safe(character.dossier_text) ? (
            <>
              <Text style={styles.sectionHeader}>CHARACTER</Text>
              <Text style={styles.bodyDim}>
                {safe(character.dossier_text).slice(0, 400)}
                {(safe(character.dossier_text).length > 400) ? '...' : ''}
              </Text>
              <View style={styles.divider} />
            </>
          ) : null}

          {safeSessions.length > 0 ? (
            <>
              <Text style={styles.sectionHeader}>SESSIONS</Text>
              {safeSessions.map((s) => {
                const sessionEvents = (s.events || []) as AnyRecord[]
                const hasContent = safe(s.waking_text) || sessionEvents.length > 0
                if (!hasContent) return null
                return (
                  <View key={safe(s.id, String(Math.random()))} style={{ marginBottom: 14 }}>
                    <Text style={styles.tag}>
                      {`Session ${safe(s.session_number, '?')} · ${s.started_at ? new Date(String(s.started_at)).toLocaleDateString() : ''}`}
                    </Text>
                    {safe(s.waking_text) ? (
                      <Text style={styles.bodyDim}>{safe(s.waking_text)}</Text>
                    ) : null}
                    {sessionEvents.map((ev) => (
                      <View key={safe(ev.id, String(Math.random()))} style={{ marginTop: 4 }}>
                        <Text style={{ ...styles.tag, color: '#808080' }}>
                          {`${safe(ev.category)} / ${safe(ev.reaction)}`}
                        </Text>
                        {safe(ev.narrative) ? (
                          <Text style={styles.body}>{safe(ev.narrative)}</Text>
                        ) : null}
                      </View>
                    ))}
                  </View>
                )
              })}
            </>
          ) : null}

          {safeClues.length > 0 ? (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionHeader}>CLUES</Text>
              {safeClues.map((c) => (
                <View key={safe(c.id, String(Math.random()))} style={{ marginBottom: 8 }}>
                  <Text style={styles.tag}>{safe(c.source_type)}</Text>
                  {safe(c.raw_text) ? <Text style={styles.bodyDim}>{safe(c.raw_text)}</Text> : null}
                  {safe(c.narrative) ? <Text style={styles.body}>{safe(c.narrative)}</Text> : null}
                </View>
              ))}
              {safeClues.find((c) => safe(c.current_belief)) ? (
                <>
                  <Text style={styles.tag}>CURRENT BELIEF</Text>
                  <Text style={styles.body}>{safe(safeClues.find((c) => safe(c.current_belief))?.current_belief)}</Text>
                </>
              ) : null}
            </>
          ) : null}

          {safeRels.length > 0 ? (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionHeader}>RELATIONSHIPS</Text>
              {safeRels.map((r) => (
                <View key={safe(r.id, String(Math.random()))} style={{ marginBottom: 8 }}>
                  <Text style={styles.tag}>{`${safe(r.npc_name)} · ${safe(r.moment_type)}`}</Text>
                  {safe(r.narrative) ? <Text style={styles.body}>{safe(r.narrative)}</Text> : null}
                </View>
              ))}
            </>
          ) : null}
        </Page>
      </Document>
    )

    const buffer = await renderToBuffer(<Doc />)
    const slug = charName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const uint8 = new Uint8Array(buffer)

    return new NextResponse(uint8, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${slug}-journey.pdf"`,
      },
    })
  } catch (error) {
    console.error('[export-pdf]', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
