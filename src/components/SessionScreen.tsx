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

function EventCard({ event }: { event: Event }) {
  const [expanded, setExpanded] = useState(false)
  const cat = EVENT_CATEGORIES.find(c => c.id === event.category)
  const time = new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div
      className="animate-fade-in cursor-pointer"
      style={{
        borderBottom: '1px solid var(--border)',
        padding: '1rem 1.25rem',
      }}
      onClick={() => setExpanded(e => !e)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span style={{ fontSize: 16 }}>{cat?.icon || '◆'}</span>
          <div>
            <p className="font-cinzel text-gold text-xs tracking-wider mb-1">
              {cat?.label || event.category}
            </p>
            <p className="font-garamond text-ink-dim text-sm italic leading-relaxed">
              {event.narrative || event.subcategory}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="font-garamond text-ink-faint text-xs">{time}</span>
          <span className="font-garamond text-ink-faint text-xs">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 pl-7 animate-fade-in">
          <p className="label-caps mb-1">Subcategory</p>
          <p className="font-garamond text-ink-dim text-sm mb-2">{event.subcategory}</p>
          <p className="label-caps mb-1">Reaction</p>
          <p className="font-garamond text-ink-dim text-sm italic">{event.reaction?.replace(/_/g, ' ')}</p>
        </div>
      )}
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = (t: string) => (supabase.from(t) as any)
      const { data: lastSession } = await db('sessions')
        .select('session_number')
        .eq('character_id', character.id)
        .order('session_number', { ascending: false })
        .limit(1)
        .single()

      // End current session
      await db('sessions')
        .update({ ended_at: new Date().toISOString() })
        .eq('id', session.id)

      // Create new session
      await db('sessions').insert({
        character_id: character.id,
        session_number: ((lastSession as { session_number: number } | null)?.session_number || 1) + 1,
      })

      router.refresh()
    } catch {}
    setNewSessionLoading(false)
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)]">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 sticky top-0 z-10"
        style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}
      >
        <span className="label-caps">Session {session?.session_number || 1}</span>
        <button
          className="btn-gold px-4 py-1.5 text-xs"
          onClick={startNewSession}
          disabled={newSessionLoading}
        >
          {newSessionLoading ? '...' : 'New Session'}
        </button>
      </div>

      {/* Waking text (if long rest occurred) */}
      {session?.waking_text && (
        <div
          className="mx-5 mt-5 p-5 card-gold-border animate-fade-in"
          style={{ background: 'var(--surface)', borderRadius: 2 }}
        >
          <p className="label-caps mb-3">Waking Into This Day</p>
          <p className="narrative-text">{session.waking_text}</p>
        </div>
      )}

      {/* Events list */}
      <div className="flex-1" style={{ borderTop: session?.waking_text ? '1px solid var(--border)' : undefined, marginTop: session?.waking_text ? 20 : 0 }}>
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="text-gold-faint text-4xl mb-4">◈</div>
            <p className="font-cinzel text-ink-faint text-sm tracking-wider mb-2">The session is quiet</p>
            <p className="font-garamond text-ink-faint text-sm italic">
              Log a moment from the Now screen when something worth remembering happens.
            </p>
          </div>
        ) : (
          events.map(event => <EventCard key={event.id} event={event} />)
        )}
      </div>

      {/* Long Rest button */}
      <div
        className="sticky bottom-0 px-5 pb-4 pt-3"
        style={{
          background: 'var(--bg)',
          borderTop: '1px solid var(--border)',
        }}
      >
        <button
          className="btn-gold w-full py-3 text-sm"
          onClick={() => setShowLongRest(true)}
        >
          Long Rest
        </button>
      </div>

      {showLongRest && session && (
        <LongRestModal
          character={character}
          session={session}
          tracker={tracker}
          onComplete={() => { setShowLongRest(false); router.refresh() }}
          onDismiss={() => setShowLongRest(false)}
        />
      )}
    </div>
  )
}
