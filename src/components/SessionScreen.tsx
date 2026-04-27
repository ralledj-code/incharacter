'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Character, Session, Event, TrackerState } from '@/types/database'
import { EVENT_CATEGORIES } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'
import LongRestModal from './LongRestModal'

interface SessionScreenProps {
  character: Character
  session: Session | null
  events: Event[]
  tracker: TrackerState | null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRec = Record<string, any>

function EventRow({ event }: { event: Event }) {
  const cat = EVENT_CATEGORIES.find(c => c.id === event.category)
  const time = new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10,
      padding: '10px 20px', borderBottom: '0.5px solid var(--border)',
    }}>
      <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>{cat?.icon || '◆'}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 3 }}>
          {cat?.label || event.category}
        </p>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.55 }}>
          {event.narrative || event.subcategory}
        </p>
      </div>
      <span style={{ fontSize: 11, color: 'var(--text3)', flexShrink: 0, marginTop: 2 }}>{time}</span>
    </div>
  )
}

export default function SessionScreen({ character, session, events, tracker }: SessionScreenProps) {
  const router = useRouter()
  const [showLongRest, setShowLongRest] = useState(false)
  const [newSessionLoading, setNewSessionLoading] = useState(false)

  async function startNewSession() {
    if (!session) return
    setNewSessionLoading(true)
    try {
      const supabase = createClient()
      const db = (t: string) => (supabase.from(t) as AnyRec)
      const { data: lastSession } = await db('sessions')
        .select('session_number').eq('character_id', character.id)
        .order('session_number', { ascending: false }).limit(1).single()
      await db('sessions').update({ ended_at: new Date().toISOString() }).eq('id', session.id)
      await db('sessions').insert({
        character_id: character.id,
        session_number: ((lastSession as AnyRec)?.session_number || 1) + 1,
      })
      router.refresh()
    } catch {}
    setNewSessionLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 80px)', background: 'var(--bg)' }}>
      {/* Header */}
      <div className="page-header" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
        <h1 className="page-title">Session {session?.session_number || 1}</h1>
        <button className="btn-ghost" style={{ fontSize: 12, padding: '6px 12px', minHeight: 'auto' }}
          onClick={startNewSession} disabled={newSessionLoading}>
          {newSessionLoading ? '...' : 'New session'}
        </button>
      </div>

      {/* Waking text */}
      {session?.waking_text && (
        <div style={{ margin: '16px 20px', padding: '12px 16px', background: 'var(--surface)', border: '0.5px solid var(--border)', borderLeft: '2px solid var(--accent)', borderRadius: '0 8px 8px 0' }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6 }}>
            Waking into this day
          </p>
          <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6, fontStyle: 'italic' }}>
            {session.waking_text}
          </p>
        </div>
      )}

      {/* Events */}
      <div style={{ flex: 1 }}>
        {events.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: 15, color: 'var(--text3)' }}>Nothing logged yet.</p>
            <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>The session begins when you do.</p>
          </div>
        ) : (
          events.map(ev => <EventRow key={ev.id} event={ev} />)
        )}
      </div>

      {/* Long rest */}
      <div style={{ position: 'sticky', bottom: 0, padding: '12px 20px 20px', background: 'var(--bg)', borderTop: '0.5px solid var(--border)' }}>
        <button className="btn-secondary" style={{ width: '100%', fontSize: 14 }}
          onClick={() => setShowLongRest(true)}>
          Long rest
        </button>
      </div>

      {showLongRest && session && (
        <LongRestModal character={character} session={session} tracker={tracker}
          onComplete={() => { setShowLongRest(false); router.refresh() }}
          onDismiss={() => setShowLongRest(false)} />
      )}
    </div>
  )
}
