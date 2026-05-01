'use client'

import { useState } from 'react'
import type { FeedbackData } from '@/types/database'

export type { FeedbackData }

interface Props {
  onSubmit: (data: FeedbackData) => Promise<void>
  onSkip: () => void
  sending: boolean
}

const STEPS = [
  { key: 'combat',    icon: '⚔️', question: 'How did the action feel this session?',      subtext: 'Pacing, combat, tension',                 hasStars: true,  required: false },
  { key: 'roleplay',  icon: '🎭', question: 'Did you get to play your character?',          subtext: 'Roleplay moments, character expression',   hasStars: true,  required: false },
  { key: 'world',     icon: '🌍', question: 'How engaging was the world and plot?',         subtext: 'Story hooks, world detail, narrative',      hasStars: true,  required: false },
  { key: 'party',     icon: '🤝', question: 'How did the group feel together?',             subtext: 'Party dynamics, collaboration',             hasStars: true,  required: false },
  { key: 'whatWorked',icon: '✨', question: 'One thing that worked this session',           subtext: 'A moment, a decision, a scene',             hasStars: false, required: true  },
  { key: 'nextTime',  icon: '🔮', question: "One thing you'd love to explore next time",   subtext: 'A thread, a character beat, a question',   hasStars: false, required: true  },
] as const

type StepKey = typeof STEPS[number]['key']
type StarKey = 'combat' | 'roleplay' | 'world' | 'party'

function StarRow({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginTop: 24 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(value === n ? 0 : n)}
          style={{
            fontSize: 36,
            lineHeight: 1,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: n <= value ? 'var(--accent)' : 'var(--text3)',
            minHeight: 52,
            minWidth: 52,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
          }}
        >
          {n <= value ? '★' : '☆'}
        </button>
      ))}
    </div>
  )
}

export default function SessionFeedback({ onSubmit, onSkip, sending }: Props) {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<FeedbackData>({
    combat:    { stars: 0, comment: '' },
    roleplay:  { stars: 0, comment: '' },
    world:     { stars: 0, comment: '' },
    party:     { stars: 0, comment: '' },
    whatWorked: '',
    nextTime:   '',
  })

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  function getStarValue(): number {
    if (!current.hasStars) return 0
    return data[current.key as StarKey].stars
  }

  function getTextValue(): string {
    if (current.key === 'whatWorked') return data.whatWorked
    if (current.key === 'nextTime') return data.nextTime
    return data[current.key as StarKey].comment ?? ''
  }

  function setStarValue(v: number) {
    const key = current.key as StarKey
    setData(prev => ({ ...prev, [key]: { ...prev[key], stars: v } }))
  }

  function setTextValue(v: string) {
    const key = current.key as StepKey
    if (key === 'whatWorked' || key === 'nextTime') {
      setData(prev => ({ ...prev, [key]: v }))
    } else {
      const k = key as StarKey
      setData(prev => ({ ...prev, [k]: { ...prev[k], comment: v } }))
    }
  }

  function canProceed(): boolean {
    if (current.required) return getTextValue().trim().length > 0
    return true
  }

  async function handleNext() {
    if (isLast) {
      await onSubmit(data)
    } else {
      setStep(s => s + 1)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 70,
      background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Step indicator */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 20px' }}>
        <span style={{ fontSize: 13, color: 'var(--text3)' }}>{step + 1} / {STEPS.length}</span>
      </div>

      {/* Content */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '0 28px 24px',
        maxWidth: 480, margin: '0 auto', width: '100%',
      }}>
        <div style={{ fontSize: 48, lineHeight: 1, marginBottom: 24 }}>{current.icon}</div>

        <p style={{ fontSize: 20, fontWeight: 500, color: 'var(--text)', textAlign: 'center', marginBottom: 8 }}>
          {current.question}
        </p>

        <p style={{ fontSize: 14, color: 'var(--text2)', textAlign: 'center', marginBottom: 0 }}>
          {current.subtext}
        </p>

        {current.hasStars && (
          <StarRow value={getStarValue()} onChange={setStarValue} />
        )}

        <textarea
          value={getTextValue()}
          onChange={e => setTextValue(e.target.value)}
          placeholder={current.hasStars ? 'Add a comment… (optional)' : ''}
          style={{
            marginTop: 20,
            width: '100%',
            minHeight: current.hasStars ? 80 : 120,
            fontSize: 15,
            lineHeight: 1.5,
            resize: 'none',
          }}
        />
      </div>

      {/* Buttons */}
      <div style={{
        padding: '0 28px 40px',
        maxWidth: 480, margin: '0 auto', width: '100%',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        <button
          className="btn-primary"
          onClick={handleNext}
          disabled={!canProceed() || sending}
          style={{ fontSize: 15 }}
        >
          {isLast ? (sending ? 'Sending…' : 'Send to DM') : 'Next'}
        </button>
        <button className="btn-ghost" onClick={onSkip} style={{ fontSize: 14 }}>
          Skip
        </button>
      </div>
    </div>
  )
}
