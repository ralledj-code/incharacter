import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Preview,
} from '@react-email/components'
import * as React from 'react'
import type { FeedbackData } from '@/types/database'

interface Props {
  characterName: string
  campaignName: string
  sessionDate: string
  summary: string
  playerEmail: string
  playerName: string
  feedback: FeedbackData
}

function Stars({ value }: { value: number }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n} style={{ color: n <= value ? '#c8a96e' : '#aaa', fontSize: 16 }}>
          {n <= value ? '★' : '☆'}
        </span>
      ))}
    </span>
  )
}

const CATEGORIES = [
  { key: 'combat',   icon: '⚔️', label: 'Action & Combat'  },
  { key: 'roleplay', icon: '🎭', label: 'Character Play'   },
  { key: 'world',    icon: '🌍', label: 'World & Plot'     },
  { key: 'party',    icon: '🤝', label: 'Group Dynamics'   },
] as const

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 600,
  letterSpacing: '0.08em', textTransform: 'uppercase',
  color: '#888', margin: '0 0 8px',
}

export function SessionFeedbackEmail({
  characterName,
  campaignName,
  sessionDate,
  summary,
  playerName,
  feedback,
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>{characterName} — session notes from {sessionDate}</Preview>
      <Body style={{ background: '#f5f5f0', margin: 0, padding: '32px 0', fontFamily: 'Georgia, serif' }}>
        <Container style={{ maxWidth: 600, margin: '0 auto', background: '#ffffff', borderRadius: 8, overflow: 'hidden' }}>

          {/* Header */}
          <Section style={{ background: '#1a1814', padding: '32px 40px' }}>
            <Text style={{ fontSize: 28, fontWeight: 700, color: '#c8a96e', margin: 0 }}>
              {characterName}
            </Text>
            <Text style={{ fontSize: 14, color: '#8c8070', margin: '4px 0 0' }}>
              {campaignName} · {sessionDate}
            </Text>
          </Section>

          {/* Body */}
          <Section style={{ padding: '32px 40px' }}>

            {/* Summary */}
            {summary ? (
              <>
                <Text style={labelStyle}>Session Summary</Text>
                <Text style={{ fontSize: 15, color: '#333', lineHeight: 1.6, margin: '0 0 24px' }}>
                  {summary}
                </Text>
                <Hr style={{ borderColor: '#e8e4dd', margin: '0 0 24px' }} />
              </>
            ) : null}

            {/* Star ratings */}
            <Text style={labelStyle}>Player Feedback</Text>

            {CATEGORIES.map(({ key, icon, label }) => {
              const cat = feedback[key]
              if (!cat || cat.stars === 0) return null
              return (
                <Section key={key} style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 14, color: '#555', margin: '0 0 4px' }}>
                    {icon} {label}
                  </Text>
                  <Stars value={cat.stars} />
                  {cat.comment ? (
                    <Text style={{ fontSize: 14, color: '#444', margin: '6px 0 0', fontStyle: 'italic' }}>
                      &ldquo;{cat.comment}&rdquo;
                    </Text>
                  ) : null}
                </Section>
              )
            })}

            {/* What worked */}
            {feedback.whatWorked ? (
              <>
                <Hr style={{ borderColor: '#e8e4dd', margin: '8px 0 20px' }} />
                <Text style={labelStyle}>✨ What worked</Text>
                <Text style={{ fontSize: 15, color: '#333', lineHeight: 1.6, margin: 0 }}>
                  {feedback.whatWorked}
                </Text>
              </>
            ) : null}

            {/* Next time */}
            {feedback.nextTime ? (
              <>
                <Hr style={{ borderColor: '#e8e4dd', margin: '20px 0' }} />
                <Text style={labelStyle}>🔮 Next time</Text>
                <Text style={{ fontSize: 15, color: '#333', lineHeight: 1.6, margin: 0 }}>
                  {feedback.nextTime}
                </Text>
              </>
            ) : null}

          </Section>

          {/* Footer */}
          <Section style={{ background: '#f5f5f0', padding: '20px 40px', borderTop: '1px solid #e8e4dd' }}>
            <Text style={{ fontSize: 12, color: '#888', margin: 0 }}>
              Sent via In Character · incharacter.cloud
            </Text>
            <Text style={{ fontSize: 12, color: '#888', margin: '4px 0 0' }}>
              Reply to respond to {playerName}
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}
