'use client'

// FIX 3: Renamed to "Motivations" — only antagonist board + relationship boards
// Sessions tab removed from here — sessions are in the Session tab

import { useState } from 'react'
import { Character, Clue, Relationship, TrackerState } from '@/types/database'
import CluesBoard from './journey/CluesBoard'
import RelationshipsBoard from './journey/RelationshipsBoard'
import PrepModal from './journey/PrepModal'

interface MotivationsScreenProps {
  character: Character
  clues: Clue[]
  relationships: Relationship[]
  tracker: TrackerState | null
}

type Tab = 'antagonist' | string // antagonist board + one tab per key relationship

export default function JourneyScreen({ character, clues, relationships, tracker }: MotivationsScreenProps) {
  const config = character.tracker_config as Record<string, unknown> | null
  const clueBoardName    = (config?.clue_board_name as string)    || 'The Mystery'
  const clueBoardSubject = (config?.clue_board_subject as string) || 'the antagonist'
  const keyRelationships = (config?.key_relationships as Array<{ name: string; role: string }>) || []

  const cleanBoardName = clueBoardName.replace(/ Board$/i, '').trim()
  const uniqueNames = new Set<string>([cleanBoardName])

  const deduplicatedRelationships = keyRelationships.filter(r => {
    const name = r.name.replace(/ Board$/i, '').trim()
    if (uniqueNames.has(name)) return false
    uniqueNames.add(name)
    return true
  })

  // Build tabs: antagonist board first, then one per key relationship
  const tabs: Array<{ id: Tab; label: string; type: 'antagonist' | 'relationship'; npcName?: string }> = [
    { id: 'antagonist', label: cleanBoardName, type: 'antagonist' },
    ...deduplicatedRelationships.map(r => ({
      id: `rel-${r.name}`,
      label: r.name.replace(/ Board$/i, '').trim(),
      type: 'relationship' as const,
      npcName: r.name,
    })),
    // If no key relationships defined but there are logged relationship moments, add a generic tab
    ...(deduplicatedRelationships.length === 0 && relationships.length > 0
      ? [{ id: 'rel-all', label: 'Bonds', type: 'relationship' as const, npcName: undefined }]
      : []),
  ]

  const [activeTab, setActiveTab] = useState<Tab>(tabs[0]?.id || 'antagonist')
  const [showPrep, setShowPrep] = useState(false)

  const activeTabDef = tabs.find(t => t.id === activeTab)

  // Filter relationships by NPC name for the active tab
  const filteredRelationships = activeTabDef?.npcName
    ? relationships.filter(r => r.npc_name === activeTabDef.npcName)
    : relationships

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
        {activeTabDef?.type === 'antagonist' && (
          <CluesBoard
            character={character}
            clues={clues}
            boardName={clueBoardName}
            boardSubject={clueBoardSubject}
          />
        )}
        {activeTabDef?.type === 'relationship' && (
          <RelationshipsBoard
            character={character}
            relationships={filteredRelationships}
            keyRelationships={keyRelationships}
          />
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
