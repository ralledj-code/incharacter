'use client'

import { useState } from 'react'
import { Character, Session, TrackerState } from '@/types/database'
import { LONG_REST_DELTAS, clamp, getRandomLoadingPhrase } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'

interface LongRestModalProps {
  character: Character
  session: Session
  tracker: TrackerState | null
  onComplete: () => void
  onDismiss: () => void
}

type Step = 'drink' | 'dream' | 'generating' | 'done'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>

export default function LongRestModal({ character, session, tracker, onComplete, onDismiss }: LongRestModalProps) {
  const [step, setStep] = useState<Step>('drink')
  const [drank, setDrank] = useState<boolean | null>(null)
  const [dreamed, setDreamed] = useState<boolean | null>(null)
  const [wakingText, setWakingText] = useState('')
  const [loadingPhrase] = useState(getRandomLoadingPhrase())

  async function handleRest() {
    if (drank === null || dreamed === null) return
    setStep('generating')

    const drankKey = drank ? 'drank' : 'no_drink'
    const dreamKey = dreamed ? 'dreamed' : 'no_dream'
    const deltaKey = `${drankKey}_${dreamKey}` as keyof typeof LONG_REST_DELTAS
    const delta = LONG_REST_DELTAS[deltaKey]

    const currentTrackers = {
      mask:   tracker?.mask   ?? 50,
      dagger: tracker?.dagger ?? 30,
      bottle: tracker?.bottle ?? 40,
      wound:  tracker?.wound  ?? 60,
    }

    const newTrackers = {
      mask:   clamp(currentTrackers.mask   + delta.mask),
      dagger: clamp(currentTrackers.dagger + delta.dagger),
      bottle: clamp(currentTrackers.bottle + delta.bottle),
      wound:  clamp(currentTrackers.wound  + delta.wound),
    }

    try {
      const supabase = createClient()

      // Generate waking monologue
      let waking = ''
      try {
        const res = await fetch('/api/claude/long-rest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            characterId: character.id,
            characterName: character.name,
            dossierSummary: character.dossier_text?.slice(0, 2000) || '',
            trackers: newTrackers,
            drank,
            dreamed,
            // apiKey fetched server-side
          }),
        })
        const data = await res.json()
        waking = data.monologue || ''
      } catch {
        waking = `${drank ? 'The night passed with the usual indulgence.' : 'Stayed clear through the night.'} ${dreamed ? 'The dreams came.' : 'Sleep was dark and quiet.'}`
      }

      // Update session
      await (supabase.from('sessions') as AnyRecord)
        .update({
          ended_at: new Date().toISOString(),
          waking_text: waking,
          long_rest_drink: drank,
          long_rest_dream: dreamed,
        })
        .eq('id', session.id)

      // Update tracker
      await (supabase.from('tracker_states') as AnyRecord)
        .update({ ...newTrackers, updated_at: new Date().toISOString() })
        .eq('character_id', character.id)

      // Get last session number
      const { data: lastSession } = await (supabase.from('sessions') as AnyRecord)
        .select('session_number')
        .eq('character_id', character.id)
        .order('session_number', { ascending: false })
        .limit(1)
        .single()

      // Create next session
      await (supabase.from('sessions') as AnyRecord).insert({
        character_id: character.id,
        session_number: ((lastSession as { session_number: number } | null)?.session_number || 1) + 1,
        waking_text: waking,
      })

      setWakingText(waking)
      setStep('done')
    } catch {
      setStep('done')
      setWakingText('The night passed. The work continues.')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6"
      style={{ background: 'rgba(10,5,0,0.96)' }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h2 className="font-cinzel text-gold text-lg tracking-wider">Long Rest</h2>
        </div>

        {step === 'drink' && (
          <div className="animate-fade-in space-y-6">
            <p className="font-garamond text-ink text-lg text-center leading-relaxed">
              Did he drink tonight?
            </p>
            <div className="flex gap-4">
              {[true, false].map(val => (
                <button
                  key={String(val)}
                  className="flex-1 py-4 font-cinzel text-sm tracking-wider transition-all"
                  style={{
                    background: drank === val ? 'var(--gold)' : 'var(--surface)',
                    border: '1px solid var(--gold)',
                    color: drank === val ? 'var(--bg)' : 'var(--gold)',
                    borderRadius: 2,
                  }}
                  onClick={() => setDrank(val)}
                >
                  {val ? 'Yes' : 'No'}
                </button>
              ))}
            </div>
            {drank !== null && (
              <button className="btn-gold-solid w-full py-4 animate-fade-in" onClick={() => setStep('dream')}>
                Continue →
              </button>
            )}
            <button className="w-full text-center label-caps text-ink-faint hover:text-ink-dim transition-colors" onClick={onDismiss}>
              Cancel
            </button>
          </div>
        )}

        {step === 'dream' && (
          <div className="animate-fade-in space-y-6">
            <p className="font-garamond text-ink text-lg text-center leading-relaxed">
              Did he dream?
            </p>
            <div className="flex gap-4">
              {[true, false].map(val => (
                <button
                  key={String(val)}
                  className="flex-1 py-4 font-cinzel text-sm tracking-wider transition-all"
                  style={{
                    background: dreamed === val ? 'var(--gold)' : 'var(--surface)',
                    border: '1px solid var(--gold)',
                    color: dreamed === val ? 'var(--bg)' : 'var(--gold)',
                    borderRadius: 2,
                  }}
                  onClick={() => setDreamed(val)}
                >
                  {val ? 'Yes' : 'No'}
                </button>
              ))}
            </div>
            {dreamed !== null && (
              <button className="btn-gold-solid w-full py-4 animate-fade-in" onClick={handleRest}>
                Rest →
              </button>
            )}
            <button className="w-full text-center label-caps text-ink-faint hover:text-ink-dim transition-colors" onClick={() => setStep('drink')}>
              ← Back
            </button>
          </div>
        )}

        {step === 'generating' && (
          <div className="flex flex-col items-center gap-4 animate-fade-in">
            <div
              className="w-12 h-12 rounded-full animate-spin"
              style={{ border: '2px solid var(--gold-faint)', borderTopColor: 'var(--gold)' }}
            />
            <p className="font-garamond text-ink-dim italic animate-pulse">{loadingPhrase}</p>
          </div>
        )}

        {step === 'done' && (
          <div className="animate-fade-in space-y-6 text-center">
            {wakingText && (
              <div
                className="p-6 text-left"
                style={{
                  background: 'var(--surface)',
                  borderLeft: '2px solid var(--gold)',
                  borderRadius: 2,
                }}
              >
                <p className="label-caps mb-3">Waking Into This Day</p>
                <p className="narrative-text">{wakingText}</p>
              </div>
            )}
            <button className="btn-gold-solid w-full py-4" onClick={onComplete}>
              Begin the New Day →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
