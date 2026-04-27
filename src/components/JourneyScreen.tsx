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

  const config = character.tracker_config as Record<string, unknown> | null
  const clueBoardName    = (config?.clue_board_name as string)    || 'Clues'
  const clueBoardSubject = (config?.clue_board_subject as string) || 'the mystery'
  const keyRelationships = (config?.key_relationships as Array<{ name: string; role: string }>) || []
  const relTabLabel = keyRelationships[0]?.name || 'Relationships'

  const tabs: { id: Tab; label: string }[] = [
    { id: 'timeline',      label: 'Sessions' },
    { id: 'clues',         label: clueBoardName },
    { id: 'relationships', label: relTabLabel },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 80px)', background: 'var(--bg)' }}>
      {/* Tab bar */}
      <div className="tab-bar" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
        {tabs.map(tab => (
          <button key={tab.id}
            className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {activeTab === 'timeline' && <Timeline sessions={sessions} character={character} />}
        {activeTab === 'clues' && (
          <CluesBoard character={character} clues={clues}
            boardName={clueBoardName} boardSubject={clueBoardSubject} />
        )}
        {activeTab === 'relationships' && (
          <RelationshipsBoard character={character} relationships={relationships}
            keyRelationships={keyRelationships} />
        )}
      </div>

      {/* Prep button */}
      <div style={{ position: 'sticky', bottom: 0, padding: '12px 20px 20px', background: 'var(--bg)', borderTop: '0.5px solid var(--border)' }}>
        <button className="btn-primary" style={{ width: '100%', fontSize: 13 }}
          onClick={() => setShowPrep(true)}>
          Prep me for next session
        </button>
      </div>

      {showPrep && (
        <PrepModal character={character} tracker={tracker}
          clues={clues} relationships={relationships}
          onDismiss={() => setShowPrep(false)} />
      )}
    </div>
  )
}
