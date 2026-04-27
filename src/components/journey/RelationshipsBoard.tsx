'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Character, Relationship } from '@/types/database'
import { RELATIONSHIP_MOMENT_TYPES, TRUST_DIRECTIONS, getRandomLoadingPhrase } from '@/lib/constants'

interface RelationshipsBoardProps {
  character: Character
  relationships: Relationship[]
  keyRelationships?: Array<{ name: string; role: string }>
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function RelationshipsBoard({ character, relationships, keyRelationships }: RelationshipsBoardProps) {
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
          // apiKey fetched server-side
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

      {/* Log Moment button — opens modal asking for NPC name if multiple NPCs, or uses first */}
      <div className="px-5 py-4">
        <button className="btn-gold w-full py-3 text-sm" onClick={() => {
          setShowAdd(true)
          // FIX 3: Skip NPC name step — go directly to moment type
          // If only one NPC, pre-select it
          if (npcNames.length === 1) { setNpcName(npcNames[0]); setAddStep('moment') }
          else { setNpcName(''); setAddStep('npc') }
        }}>
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
              {addStep === 'npc' ? 'Which relationship?' :
               addStep === 'moment' ? `${npcName || 'Moment'} — what kind?` :
               addStep === 'text' ? 'What happened?' :
               'Writing the moment...'}
            </span>
            {addStep !== 'generating' && (
              <button className="label-caps text-ink-faint" onClick={() => setShowAdd(false)}>Cancel</button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-6">
            {/* FIX 3: NPC selection only when multiple NPCs exist */}
            {addStep === 'npc' && (
              <div className="animate-fade-in space-y-2">
                <p className="font-garamond text-sm mb-4" style={{ color: 'var(--text-dim)' }}>
                  Select who this moment is with, or enter a new name.
                </p>
                {npcNames.map(n => (
                  <button key={n}
                    onClick={() => { setNpcName(n); setAddStep('moment') }}
                    className="w-full p-4 text-left transition-all"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 2 }}>
                    <p className="font-garamond text-ink">{n}</p>
                  </button>
                ))}
                <div style={{ marginTop: 12 }}>
                  <p className="label-caps mb-2">New relationship</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      value={npcName}
                      onChange={e => setNpcName(e.target.value)}
                      className="flex-1 px-4 py-3"
                      placeholder="Their name..."
                    />
                    <button
                      className="btn-gold-solid px-4 disabled:opacity-40"
                      onClick={() => { if (npcName.trim()) setAddStep('moment') }}
                      disabled={!npcName.trim()}
                    >
                      →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* FIX 3: Moment type selection */}
            {addStep === 'moment' && (
              <div className="animate-fade-in space-y-2">
                <p className="font-cinzel text-gold text-xs tracking-widest mb-4">{npcName}</p>
                {RELATIONSHIP_MOMENT_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => { setMomentType(type); setAddStep('text') }}
                    className="w-full p-4 text-left transition-all"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 2 }}>
                    <p className="font-garamond text-ink">{type}</p>
                  </button>
                ))}
              </div>
            )}

            {/* FIX 3: "What happened?" text field — NPC name already known */}
            {addStep === 'text' && (
              <div className="animate-fade-in space-y-4">
                <p className="font-cinzel text-gold text-xs tracking-widest">{npcName} · {momentType}</p>
                <div>
                  <p className="label-caps mb-2">What happened?</p>
                  <textarea
                    value={rawText}
                    onChange={e => setRawText(e.target.value)}
                    className="w-full p-4 min-h-[120px] text-sm leading-relaxed"
                    placeholder="Describe the moment — one sentence or a few."
                    autoFocus
                    maxLength={300}
                  />
                </div>
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
