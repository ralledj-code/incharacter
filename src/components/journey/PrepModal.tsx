'use client'

import { useState, useEffect } from 'react'
import { Character, Clue, Relationship, TrackerState } from '@/types/database'
import { getRandomLoadingPhrase } from '@/lib/constants'

interface PrepModalProps {
  character: Character
  tracker: TrackerState | null
  clues: Clue[]
  relationships: Relationship[]
  onDismiss: () => void
}

export default function PrepModal({ character, tracker, clues, relationships, onDismiss }: PrepModalProps) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingPhrase] = useState(getRandomLoadingPhrase())

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { generatePrep() }, [])

  async function generatePrep() {
    setLoading(true)
    try {
      const latestBelief = clues.find(c => c.current_belief)?.current_belief

      // Group relationships by NPC, get latest state
      const relStates: string[] = []
      const npcSeen = new Set<string>()
      relationships.forEach(r => {
        if (!npcSeen.has(r.npc_name) && r.current_state) {
          relStates.push(`${r.npc_name}: ${r.current_state}`)
          npcSeen.add(r.npc_name)
        }
      })

      const res = await fetch('/api/claude/prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: character.id,
          characterName: character.name,
          dossierSummary: character.dossier_text?.slice(0, 2000) || '',
          trackers: {
            mask:   tracker?.mask   ?? 50,
            dagger: tracker?.dagger ?? 30,
            bottle: tracker?.bottle ?? 40,
            wound:  tracker?.wound  ?? 60,
          },
          cluesSummary: latestBelief || '',
          relationshipSummaries: relStates,
          apiKey: character.api_key_encrypted,
        }),
      })
      const data = await res.json()
      setText(data.prep || "I carry yesterday with me. Whatever comes next, I'll handle it the way I always do.")
    } catch {
      setText("I carry yesterday with me. Whatever comes next, I'll handle it the way I always do.")
    }
    setLoading(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'rgba(10,5,0,0.96)' }}
    >
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <span className="label-caps">Prep For Next Session</span>
        <button className="label-caps text-ink-faint" onClick={onDismiss}>Done</button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 animate-fade-in">
            <div
              className="w-12 h-12 rounded-full animate-spin"
              style={{ border: '2px solid var(--gold-faint)', borderTopColor: 'var(--gold)' }}
            />
            <p className="font-garamond text-ink-dim italic animate-pulse">{loadingPhrase}</p>
          </div>
        ) : (
          <div className="animate-fade-in">
            <div
              className="p-6"
              style={{
                background: 'var(--surface)',
                borderLeft: '2px solid var(--gold)',
                borderRadius: 2,
              }}
            >
              <p className="label-caps mb-4">{character.name}</p>
              <p className="narrative-text text-base leading-loose whitespace-pre-wrap">{text}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
