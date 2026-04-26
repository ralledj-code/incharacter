import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200, height: 630,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#faf9f7',
          fontFamily: 'serif',
        }}
      >
        {/* Decorative gold ring */}
        <div style={{
          position: 'absolute', width: 500, height: 500,
          borderRadius: '50%', border: '1px solid rgba(201,168,76,0.2)',
          top: 65, left: 350,
        }} />
        <div style={{
          position: 'absolute', width: 380, height: 380,
          borderRadius: '50%', border: '1px solid rgba(201,168,76,0.15)',
          top: 125, left: 410,
        }} />

        {/* Logo */}
        <div style={{
          fontSize: 72, fontWeight: 700, letterSpacing: '0.08em',
          color: '#c9a84c', marginBottom: 24,
        }}>
          In Character
        </div>

        {/* Tagline */}
        <div style={{
          fontSize: 28, color: '#4a4a4a', letterSpacing: '0.02em',
          marginBottom: 48,
        }}>
          Your character, in character.
        </div>

        {/* Description */}
        <div style={{
          fontSize: 20, color: '#8a8a8a', maxWidth: 700,
          textAlign: 'center', lineHeight: 1.6,
        }}>
          The psychological companion for tabletop roleplayers
        </div>

        {/* URL */}
        <div style={{
          position: 'absolute', bottom: 40,
          fontSize: 16, color: '#c9a84c', letterSpacing: '0.1em',
        }}>
          incharacter.cloud
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
