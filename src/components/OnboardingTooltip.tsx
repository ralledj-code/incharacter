'use client'

import { useState } from 'react'

interface Step {
  icon: string
  title: string
  body: string
  example?: string
}

const STEPS: Step[] = [
  {
    icon: '📖',
    title: 'Welcome to In Character',
    body: 'Your RPG session journal. Log what happens at the table, get a summary at the end. Never forget a session again.',
  },
  {
    icon: '✍️',
    title: 'Log what happened',
    body: 'During play, tap Add Entry and write what happened in a sentence or two. Claude instantly assigns it an icon and category. No interruption to the game.',
    example: 'Convinced the guard to let us through by bluffing about a royal warrant. Barely held it together.',
  },
  {
    icon: '📋',
    title: 'End the session',
    body: "When you're done playing, tap End Session. Claude reads every entry and writes a short summary of the session — perfect for remembering where you left off next time.",
  },
  {
    icon: '🗂️',
    title: 'Browse past sessions',
    body: "Everything is saved in Past Sessions. Tap any session to expand it and see all your entries. Search across everything you've ever logged.",
  },
  {
    icon: '🔑',
    title: 'One last thing — your API key',
    body: "In Character uses Claude AI to categorise entries and write summaries. You'll need a free Anthropic API key to enable this. Get one at console.anthropic.com — it takes 30 seconds and sessions cost less than $0.10.",
  },
]

interface OnboardingTooltipProps {
  onComplete: () => void
}

export default function OnboardingTooltip({ onComplete }: OnboardingTooltipProps) {
  const [step, setStep] = useState(0)
  const [fading, setFading] = useState(false)

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  function advance() {
    if (isLast) { onComplete(); return }
    setFading(true)
    setTimeout(() => { setStep(s => s + 1); setFading(false) }, 150)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        width: '100%', maxWidth: 440,
        opacity: fading ? 0 : 1,
        transition: 'opacity 150ms ease',
      }}>
        {/* Step indicator */}
        <p style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'right', marginBottom: 32 }}>
          {step + 1} of {STEPS.length}
        </p>

        {/* Icon */}
        <div style={{ fontSize: 48, lineHeight: 1, marginBottom: 24 }}>{current.icon}</div>

        {/* Title */}
        <h1 style={{ fontSize: 20, fontWeight: 500, color: 'var(--text)', marginBottom: 16, lineHeight: 1.3 }}>
          {current.title}
        </h1>

        {/* Body */}
        <p style={{ fontSize: 15, color: 'var(--text2)', lineHeight: 1.7, marginBottom: current.example ? 16 : 48 }}>
          {current.body}
        </p>

        {/* Example quote */}
        {current.example && (
          <p style={{
            fontSize: 14, color: 'var(--text3)', fontStyle: 'italic', lineHeight: 1.6,
            background: 'var(--surface2)', borderRadius: 8, padding: '12px 16px',
            marginBottom: 48,
          }}>
            &ldquo;{current.example}&rdquo;
          </p>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button className="btn-ghost" onClick={onComplete} style={{ fontSize: 14 }}>
            Skip
          </button>
          <button className="btn-primary" onClick={advance} style={{ fontSize: 14, minWidth: 120 }}>
            {isLast ? 'Get started' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}
