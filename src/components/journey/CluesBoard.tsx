'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Character, Clue } from '@/types/database'
import { CLUE_SOURCE_TYPES, getRandomLoadingPhrase } from '@/lib/constants'

interface CluesBoardProps {
  character: Character
  clues: Clue[]
  boardName?: string
  boardSubject?: string
}

type AddStep = 'source' | 'text' | 'generating'

function ClueCard({ clue }: { clue: Clue }) {
  const [expanded, setExpanded] = useState(false)
  const sourceType = CLUE_SOURCE_TYPES.find(s => s.id === clue.source_type)
  const date = new Date(clue.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })

  return (
    <div
      style={{ borderBottom: '1px solid var(--border)' }}
      className="animate-fade-in"
    >
      <button
        className="w-full px-5 py-4 text-left flex items-start justify-between gap-3"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex-1 min-w-0">
          <p
            className="font-cinzel text-xs tracking-wider mb-1"
            style={{ color: sourceType?.color || 'var(--text-dim)' }}
          >
            {sourceType?.label || clue.source_type}
          </p>
          <p className="font-garamond text-ink-dim text-sm italic line-clamp-2 leading-relaxed">
            {clue.narrative || clue.raw_text}
          </p>
        </div>
        <span className="font-garamond text-ink-faint text-xs flex-shrink-0 pt-0.5">{date}</span>
      </button>

      {expanded && (
        <div className="px-5 pb-4 animate-fade-in">
          <p className="label-caps mb-1">Raw Clue</p>
          <p className="font-garamond text-ink-dim text-sm italic mb-3">{clue.raw_text}</p>
          {clue.narrative && clue.narrative !== clue.raw_text && (
            <>
              <p className="label-caps mb-1">His Response</p>
              <p className="font-garamond text-ink-dim text-sm italic">{clue.narrative}</p>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function CluesBoard({ character, clues, boardName = 'Clues', boardSubject = 'the mystery' }: CluesBoardProps) {
  const router = useRouter()
  const [showAdd, setShowAdd] = useState(false)
  const [addStep, setAddStep] = useState<AddStep>('source')
  const [selectedSource, setSelectedSource] = useState('')
  const [rawText, setRawText] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingPhrase] = useState(getRandomLoadingPhrase())
  const [error, setError] = useState('')

  const latestBelief = clues.find(c => c.current_belief)?.current_belief

  async function submitClue() {
    if (!rawText.trim() || !selectedSource) return
    setAddStep('generating')
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/claude/clue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: character.id,
          characterName: character.name,
          dossierSummary: character.dossier_text?.slice(0, 2000) || '',
          sourceType: selectedSource,
          rawText,
          existingBelief: latestBelief || '',
          apiKey: character.api_key_encrypted,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = (t: string) => (supabase.from(t) as any)

      // Clear current_belief from all previous clues
      if (clues.length > 0) {
        await db('clues')
          .update({ current_belief: null })
          .eq('character_id', character.id)
      }

      // Insert new clue with updated belief
      await db('clues').insert({
        character_id: character.id,
        source_type: selectedSource,
        raw_text: rawText,
        narrative: data.narrative,
        current_belief: data.updatedBelief,
      })

      setShowAdd(false)
      setAddStep('source')
      setSelectedSource('')
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
      {/* Current belief summary */}
      {latestBelief && (
        <div
          className="mx-5 mt-5 p-5"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--gold-dim)',
            borderRadius: 2,
          }}
        >
          <p className="label-caps mb-2">What {character.name} currently believes about {boardSubject}</p>
          <p className="narrative-text">{latestBelief}</p>
        </div>
      )}

      {/* Clues list */}
      <div className="mt-5">
        {clues.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <p className="font-cinzel text-ink-faint text-sm tracking-wider mb-2">No clues yet</p>
            <p className="font-garamond text-ink-faint text-sm italic">
              Add a clue when something about the central mystery becomes clear.
            </p>
          </div>
        )}
        {clues.map(clue => <ClueCard key={clue.id} clue={clue} />)}
      </div>

      {/* Add Clue button */}
      <div className="px-5 py-4">
        <button className="btn-gold w-full py-3 text-sm" onClick={() => { setShowAdd(true); setAddStep('source') }}>
          Add Clue
        </button>
      </div>

      {/* Add Clue Modal */}
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
              {addStep === 'source' ? 'What kind of clue?' :
               addStep === 'text' ? 'What was it?' :
               'Writing the clue...'}
            </span>
            {addStep !== 'generating' && (
              <button className="label-caps text-ink-faint" onClick={() => setShowAdd(false)}>Cancel</button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-6">
            {addStep === 'source' && (
              <div className="space-y-2 animate-fade-in">
                {CLUE_SOURCE_TYPES.map(source => (
                  <button
                    key={source.id}
                    onClick={() => { setSelectedSource(source.id); setAddStep('text') }}
                    className="w-full p-4 text-left transition-all"
                    style={{
                      background: 'var(--surface)',
                      border: `1px solid ${selectedSource === source.id ? source.color : 'var(--border)'}`,
                      borderRadius: 2,
                    }}
                  >
                    <p className="font-cinzel text-sm tracking-wider" style={{ color: source.color }}>
                      {source.label}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {addStep === 'text' && (
              <div className="animate-fade-in space-y-4">
                <p className="font-cinzel text-xs tracking-wider" style={{ color: CLUE_SOURCE_TYPES.find(s => s.id === selectedSource)?.color }}>
                  {CLUE_SOURCE_TYPES.find(s => s.id === selectedSource)?.label}
                </p>
                <textarea
                  value={rawText}
                  onChange={e => setRawText(e.target.value)}
                  className="w-full p-4 min-h-[150px] text-sm leading-relaxed"
                  placeholder="What did he learn? Be specific — one clear fact."
                  autoFocus
                  maxLength={500}
                />
                <p className="font-garamond text-ink-faint text-xs text-right">{rawText.length}/500</p>
                {error && <p className="font-garamond text-sm italic" style={{ color: 'var(--red)' }}>{error}</p>}
                <div className="flex gap-3">
                  <button className="btn-gold flex-1 py-3" onClick={() => setAddStep('source')}>Back</button>
                  <button
                    className="btn-gold-solid flex-1 py-3 disabled:opacity-40"
                    onClick={submitClue}
                    disabled={!rawText.trim() || loading}
                  >
                    Log Clue →
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
