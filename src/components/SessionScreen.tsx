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
      {/* Fix 6: proper flex layout, no overlap */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>{cat?.icon || '◆'}</span>
          <div style={{ minWidth: 0 }}>
            {/* Fix 5: 14px category label, gold */}
            <p className="font-cinzel tracking-wider mb-1"
               style={{ fontSize: 14, color: '#c9a84c' }}>
              {cat?.label || event.category}
            </p>
            {/* Fix 5: 16px narrative, warm white */}
            <p className="font-garamond leading-relaxed"
               style={{ fontSize: 16, color: '#f0e6d3' }}>
              {event.narrative || event.subcategory}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
          {/* Fix 5: 12px timestamp */}
          <span className="font-garamond" style={{ fontSize: 12, color: 'var(--text-faint)' }}>{time}</span>
          <span className="font-garamond" style={{ fontSize: 12, color: 'var(--text-faint)' }}>{expanded ? '▲' : '▼'}</span>
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
        {/* Fix 5: 16px long rest button, full width */}
        <button
          className="btn-gold w-full"
          style={{ fontSize: 16, padding: '0.875rem' }}
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
