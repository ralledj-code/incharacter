'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Character, Relationship } from '@/types/database'
import { RELATIONSHIP_MOMENT_TYPES, TRUST_DIRECTIONS, getRandomLoadingPhrase } from '@/lib/constants'

interface RelationshipsBoardProps {
  character: Character
  relationships: Relationship[]
}

type AddStep = 'npc' | 'moment' | 'text' | 'generating'

function RelationshipGroup({ npcName, moments }: { npcName: string; moments: Relationship[] }) {
  const [expanded, setExpanded] = useState(true)
  const latestState = moments[0]?.current_state
  const direction = moments[0]?.trust_direction as keyof typeof TRUST_DIRECTIONS | null
  const trustColor = direction ? TRUST_DIRECTIONS[direction]?.color : 'var(--text-dim)'

  return (
    <div style={{ borderBottom: '1px solid var(--border)' }}>
      <button
        className="w-full px-5 py-4 text-left flex items-start justify-between"
        onClick={() => setExpanded(e => !e)}
      >
        <div>
          <p className="font-cinzel text-gold text-sm tracking-wider mb-1">{npcName}</p>
          {latestState ? (
            <p className="font-garamond text-ink-dim text-sm italic line-clamp-2 leading-relaxed">{latestState}</p>
          ) : (
            <p className="font-garamond text-ink-faint text-sm">{moments.length} moment{moments.length !== 1 ? 's' : ''}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 pl-4 flex-shrink-0">
          {direction && (
            <span className="font-cinzel text-xs tracking-wider" style={{ color: trustColor }}>
              {TRUST_DIRECTIONS[direction]?.label}
            </span>
          )}
          <span className="font-garamond text-ink-faint text-xs">{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-4 animate-fade-in space-y-3">
          {latestState && (
            <div
              className="p-4"
              style={{
                background: 'var(--surface)',
                borderLeft: '2px solid var(--gold-dim)',
                borderRadius: 2,
              }}
            >
              <p className="label-caps mb-2">Where Things Stand</p>
              <p className="narrative-text">{latestState}</p>
            </div>
          )}
          {moments.slice(0, 3).map(m => {
            const dir = m.trust_direction as keyof typeof TRUST_DIRECTIONS | null
            const mColor = dir ? TRUST_DIRECTIONS[dir]?.color : 'var(--text-dim)'
            return (
              <div
                key={m.id}
                className="p-3"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 2,
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-cinzel text-xs tracking-wider" style={{ color: mColor }}>
                    {dir ? TRUST_DIRECTIONS[dir]?.label : 'Moment'}
                  </p>
                  <p className="font-garamond text-ink-faint text-xs">
                    {new Date(m.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <p className="font-garamond text-ink-dim text-sm italic leading-relaxed">
                  {m.narrative || m.raw_text || m.moment_type}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function RelationshipsBoard({ character, relationships }: RelationshipsBoardProps) {
  const router = useRouter()
  const [showAdd, setShowAdd] = useState(false)
  const [addStep, setAddStep] = useState<AddStep>('npc')
  const [npcName, setNpcName] = useState('')
  const [momentType, setMomentType] = useState('')
  const [rawText, setRawText] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingPhrase] = useState(getRandomLoadingPhrase())
  const [error, setError] = useState('')

  // Group by NPC
  const npcGroups: Record<string, Relationship[]> = {}
  relationships.forEach(r => {
    if (!npcGroups[r.npc_name]) npcGroups[r.npc_name] = []
    npcGroups[r.npc_name].push(r)
  })
  const npcNames = Object.keys(npcGroups)

  async function submitMoment() {
    if (!npcName.trim() || !momentType) return
    setAddStep('generating')
    setLoading(true)
    setError('')

    const existingMoments = npcGroups[npcName]
    const currentState = existingMoments?.[0]?.current_state || ''

    try {
      const res = await fetch('/api/claude/relationship', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: character.id,
          characterName: character.name,
          dossierSummary: character.dossier_text?.slice(0, 2000) || '',
          npcName,
          momentType,
          rawText,
          currentState,
          apiKey: character.api_key_encrypted,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = (t: string) => (supabase.from(t) as any)

      // Clear current_state from previous moments for this NPC
      if (existingMoments?.length > 0) {
        await db('relationships')
          .update({ current_state: null })
          .eq('character_id', character.id)
          .eq('npc_name', npcName)
      }

      // Insert new moment
      await db('relationships').insert({
        character_id: character.id,
        npc_name: npcName,
        moment_type: momentType,
        trust_direction: data.trustDirection,
        raw_text: rawText || null,
        narrative: data.narrative,
        current_state: data.updatedState,
      })

      setShowAdd(false)
      setAddStep('npc')
      setNpcName('')
      setMomentType('')
      setRawText('')
      router.refresh()
    } catch {
      setError('Something went wrong. Try again.')
      setAddStep('text')
    }
    setLoading(false)
  }

  return (
    <div>
      {/* NPC groups */}
      {npcNames.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <p className="font-cinzel text-ink-faint text-sm tracking-wider mb-2">No relationships yet</p>
          <p className="font-garamond text-ink-faint text-sm italic">
            Log a moment with an NPC to start tracking your relationships.
          </p>
        </div>
      ) : (
        npcNames.map(name => (
          <RelationshipGroup key={name} npcName={name} moments={npcGroups[name]} />
        ))
      )}

      {/* Log Moment button */}
      <div className="px-5 py-4">
        <button className="btn-gold w-full py-3 text-sm" onClick={() => { setShowAdd(true); setAddStep('npc') }}>
          Log a Moment
        </button>
      </div>

      {/* Add Moment Modal */}
      {showAdd && (
        <div
          className="fixed inset-0 z-50 flex flex-col"
          style={{ background: 'rgba(10,5,0,0.96)' }}
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <span className="label-caps">
              {addStep === 'npc' ? 'Who?' :
               addStep === 'moment' ? 'What happened?' :
               addStep === 'text' ? 'In one sentence...' :
               'Writing the moment...'}
            </span>
            {addStep !== 'generating' && (
              <button className="label-caps text-ink-faint" onClick={() => setShowAdd(false)}>Cancel</button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-6">
            {addStep === 'npc' && (
              <div className="animate-fade-in space-y-4">
                <div>
                  <p className="label-caps mb-2">NPC Name</p>
                  <input
                    value={npcName}
                    onChange={e => setNpcName(e.target.value)}
                    className="w-full px-4 py-3"
                    placeholder="Name..."
                    autoFocus
                    list="npc-names"
                  />
                  <datalist id="npc-names">
                    {npcNames.map(n => <option key={n} value={n} />)}
                  </datalist>
                </div>
                <button
                  className="btn-gold-solid w-full py-3 disabled:opacity-40"
                  onClick={() => setAddStep('moment')}
                  disabled={!npcName.trim()}
                >
                  Continue →
                </button>
              </div>
            )}

            {addStep === 'moment' && (
              <div className="animate-fade-in space-y-2">
                <p className="font-cinzel text-gold text-xs tracking-widest mb-4">{npcName}</p>
                {RELATIONSHIP_MOMENT_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => { setMomentType(type); setAddStep('text') }}
                    className="w-full p-4 text-left transition-all"
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 2,
                    }}
                  >
                    <p className="font-garamond text-ink">{type}</p>
                  </button>
                ))}
              </div>
            )}

            {addStep === 'text' && (
              <div className="animate-fade-in space-y-4">
                <p className="font-cinzel text-gold text-xs tracking-widest">{npcName} · {momentType}</p>
                <textarea
                  value={rawText}
                  onChange={e => setRawText(e.target.value)}
                  className="w-full p-4 min-h-[120px] text-sm leading-relaxed"
                  placeholder="One sentence. What actually happened?"
                  autoFocus
                  maxLength={300}
                />
                {error && <p className="font-garamond text-sm italic" style={{ color: 'var(--red)' }}>{error}</p>}
                <div className="flex gap-3">
                  <button className="btn-gold flex-1 py-3" onClick={() => setAddStep('moment')}>Back</button>
                  <button
                    className="btn-gold-solid flex-1 py-3"
                    onClick={submitMoment}
                    disabled={loading}
                  >
                    Log It →
                  </button>
                </div>
              </div>
            )}

            {addStep === 'generating' && (
              <div className="flex flex-col items-center justify-center h-full min-h-[200px] gap-4">
                <div
                  className="w-12 h-12 rounded-full animate-spin"
                  style={{ border: '2px solid var(--gold-faint)', borderTopColor: 'var(--gold)' }}
                />
                <p className="font-garamond text-ink-dim italic animate-pulse">{loadingPhrase}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
