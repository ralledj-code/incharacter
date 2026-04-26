'use client'

import { useState } from 'react'
import { Session } from '@/types/database'

interface TimelineProps {
  sessions: (Session & { events: unknown[] })[]
  character: { name: string }
}

function SessionCard({ session }: { session: Session & { events: unknown[] } }) {
  const [expanded, setExpanded] = useState(false)
  const eventCount = (session.events as unknown[]).length
  const date = new Date(session.started_at).toLocaleDateString([], { month: 'short', day: 'numeric' })

  return (
    <div
      className="animate-fade-in"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <button
        className="w-full px-5 py-4 text-left flex items-center justify-between"
        onClick={() => setExpanded(e => !e)}
      >
        <div>
          <p className="font-cinzel text-gold text-sm tracking-wider mb-1">
            Session {session.session_number}
          </p>
          {session.waking_text ? (
            <p className="font-garamond text-ink-dim text-sm italic line-clamp-2">
              {session.waking_text}
            </p>
          ) : (
            <p className="font-garamond text-ink-faint text-sm italic">
              {eventCount === 0 ? 'No moments logged' : `${eventCount} moment${eventCount !== 1 ? 's' : ''}`}
            </p>
          )}
        </div>
        <div className="text-right flex-shrink-0 pl-4">
          <p className="font-garamond text-ink-faint text-xs mb-1">{date}</p>
          <p className="font-garamond text-ink-faint text-xs">{expanded ? '▲' : '▼'}</p>
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-4 animate-fade-in">
          {session.waking_text && (
            <div
              className="mb-4 p-4"
              style={{
                background: 'var(--surface)',
                borderLeft: '2px solid var(--gold)',
                borderRadius: 2,
              }}
            >
              <p className="label-caps mb-2">Waking Into This Day</p>
              <p className="narrative-text">{session.waking_text}</p>
            </div>
          )}
          {eventCount === 0 ? (
            <p className="font-garamond text-ink-faint text-sm italic">No moments logged this session.</p>
          ) : (
            <p className="font-garamond text-ink-dim text-sm">
              {eventCount} moment{eventCount !== 1 ? 's' : ''} logged
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default function Timeline({ sessions }: TimelineProps) {
  return (
    <div>
      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <p className="font-cinzel text-ink-faint text-sm tracking-wider mb-2">No sessions yet</p>
          <p className="font-garamond text-ink-faint text-sm italic">
            Sessions appear here as you play.
          </p>
        </div>
      ) : (
        sessions.map(session => (
          <SessionCard key={session.id} session={session} />
        ))
      )}
    </div>
  )
}
