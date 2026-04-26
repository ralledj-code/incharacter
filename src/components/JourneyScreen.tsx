'use client'

import { useState } from 'react'
import { Character, Session, Clue, Relationship, TrackerState } from '@/types/database'
import CluesBoard from './journey/CluesBoard'
import RelationshipsBoard from './journey/RelationshipsBoard'
import Timeline from './journey/Timeline'
import PrepModal from './journey/PrepModal'

interface JourneyScreenProps {
  character: Character
  sessions: (Session & { events: unknown[] })[]
  clues: Clue[]
  relationships: Relationship[]
  tracker: TrackerState | null
}

type Tab = 'timeline' | 'clues' | 'relationships'

export default function JourneyScreen({ character, sessions, clues, relationships, tracker }: JourneyScreenProps) {
  const [activeTab, setActiveTab] = useState<Tab>('timeline')
  const [showPrep, setShowPrep] = useState(false)

  const tabs: { id: Tab; label: string }[] = [
    { id: 'timeline', label: 'Timeline' },
    { id: 'clues', label: 'Clues' },
    { id: 'relationships', label: 'Bonds' },
  ]

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)]">
      {/* Header */}
      <div
        className="px-5 py-4"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="label-caps">Journey</span>
          <span className="font-cinzel text-ink text-sm tracking-wider">{character.name}</span>
        </div>
        <div className="flex gap-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 py-2 font-cinzel text-xs tracking-widest transition-colors"
              style={{
                color: activeTab === tab.id ? 'var(--gold)' : 'var(--text-faint)',
                borderBottom: activeTab === tab.id ? '1px solid var(--gold)' : '1px solid var(--border)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'timeline' && (
          <Timeline sessions={sessions} character={character} />
        )}
        {activeTab === 'clues' && (
          <CluesBoard character={character} clues={clues} />
        )}
        {activeTab === 'relationships' && (
          <RelationshipsBoard character={character} relationships={relationships} />
        )}
      </div>

      {/* Prep Me For Next Session */}
      <div
        className="sticky bottom-0 px-5 pb-4 pt-3"
        style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)' }}
      >
        <button
          className="btn-gold-solid w-full py-3 text-sm"
          onClick={() => setShowPrep(true)}
        >
          Prep Me For Next Session
        </button>
      </div>

      {showPrep && (
        <PrepModal
          character={character}
          tracker={tracker}
          clues={clues}
          relationships={relationships}
          onDismiss={() => setShowPrep(false)}
        />
      )}
    </div>
  )
}
