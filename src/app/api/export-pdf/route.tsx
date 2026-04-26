import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { renderToBuffer, Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>

Font.register({
  family: 'Garamond',
  src: 'https://fonts.gstatic.com/s/ebgaramond/v26/SlGDmQSNjdsmc35JDF1K5E55YMjF_7DPuGi-6_RkC49_.woff2',
})

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#0f0f0f',
    color: '#e8e8e8',
    padding: 48,
    fontFamily: 'Garamond',
  },
  title: { fontSize: 28, color: '#c9a84c', marginBottom: 8, fontFamily: 'Garamond' },
  subtitle: { fontSize: 14, color: '#a0a0a0', marginBottom: 32 },
  sectionHeader: { fontSize: 10, color: '#c9a84c', letterSpacing: 2, marginBottom: 8, marginTop: 24, textTransform: 'uppercase' },
  body: { fontSize: 12, color: '#e8e8e8', lineHeight: 1.7, marginBottom: 8 },
  bodyDim: { fontSize: 12, color: '#a0a0a0', lineHeight: 1.7, marginBottom: 4 },
  divider: { borderBottomWidth: 1, borderBottomColor: '#2e2e2e', marginVertical: 16 },
  eventRow: { marginBottom: 12 },
  tag: { fontSize: 9, color: '#c9a84c', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 1 },
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const db = (t: string) => (supabase.from(t) as AnyRecord)

    const { data: character } = await db('characters')
      .select('*').eq('player_id', user.id)
      .order('created_at', { ascending: false }).limit(1).single()

    if (!character) return NextResponse.json({ error: 'No character' }, { status: 404 })

    const [
      { data: sessions },
      { data: clues },
      { data: relationships },
    ] = await Promise.all([
      db('sessions').select('*, events(*)').eq('character_id', character.id)
        .order('session_number', { ascending: true }),
      db('clues').select('*').eq('character_id', character.id)
        .order('created_at', { ascending: true }),
      db('relationships').select('*').eq('character_id', character.id)
        .order('created_at', { ascending: true }),
    ])

    const Doc = () => (
      <Document>
        <Page size="A4" style={styles.page}>
          {/* Header */}
          <Text style={styles.title}>{character.name}</Text>
          <Text style={styles.subtitle}>Character Journey · In Character</Text>
          <View style={styles.divider} />

          {/* Dossier summary */}
          {character.dossier_text && (
            <>
              <Text style={styles.sectionHeader}>Character</Text>
              <Text style={styles.bodyDim}>
                {String(character.dossier_text).slice(0, 600)}
                {character.dossier_text.length > 600 ? '...' : ''}
              </Text>
              <View style={styles.divider} />
            </>
          )}

          {/* Sessions */}
          <Text style={styles.sectionHeader}>Sessions</Text>
          {(sessions || []).map((s: AnyRecord) => (
            <View key={s.id} style={{ marginBottom: 16 }}>
              <Text style={styles.tag}>Session {s.session_number} · {new Date(s.started_at).toLocaleDateString()}</Text>
              {s.waking_text && <Text style={styles.bodyDim}>{s.waking_text}</Text>}
              {(s.events || []).map((ev: AnyRecord) => (
                <View key={ev.id} style={styles.eventRow}>
                  <Text style={{ ...styles.tag, color: '#808080' }}>{ev.category} / {ev.reaction}</Text>
                  {ev.narrative && <Text style={styles.body}>{ev.narrative}</Text>}
                </View>
              ))}
            </View>
          ))}

          {/* Clues */}
          {(clues || []).length > 0 && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionHeader}>Clues</Text>
              {(clues || []).map((c: AnyRecord) => (
                <View key={c.id} style={{ marginBottom: 10 }}>
                  <Text style={styles.tag}>{c.source_type}</Text>
                  <Text style={styles.bodyDim}>{c.raw_text}</Text>
                  {c.narrative && <Text style={styles.body}>{c.narrative}</Text>}
                </View>
              ))}
              {clues?.find((c: AnyRecord) => c.current_belief) && (
                <>
                  <Text style={styles.tag}>Current Belief</Text>
                  <Text style={styles.body}>{clues?.find((c: AnyRecord) => c.current_belief)?.current_belief}</Text>
                </>
              )}
            </>
          )}

          {/* Relationships */}
          {(relationships || []).length > 0 && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionHeader}>Relationships</Text>
              {(relationships || []).map((r: AnyRecord) => (
                <View key={r.id} style={{ marginBottom: 10 }}>
                  <Text style={styles.tag}>{r.npc_name} · {r.moment_type}</Text>
                  {r.narrative && <Text style={styles.body}>{r.narrative}</Text>}
                </View>
              ))}
            </>
          )}
        </Page>
      </Document>
    )

    const buffer = await renderToBuffer(<Doc />)
    const slug = character.name.toLowerCase().replace(/\s+/g, '-')
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
