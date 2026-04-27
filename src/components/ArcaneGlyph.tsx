'use client'

import { motion } from 'framer-motion'
import { RING_JITTER } from '@/lib/constants'

export interface GlyphValues {
  charming: number
  volatile: number
  reckless: number
  withdrawn: number
  guarded: number
  present: number
}

interface GlyphState {
  key: string
  label: string
  desc: string
}

interface ArcaneGlyphProps {
  values: GlyphValues
  states: GlyphState[]
  size?: number
  onStateClick?: (key: string) => void
  activeTooltip?: string | null
  /** If true, renders a mini static version for thumbnails */
  mini?: boolean
}

const ANGLES = [-90, -30, 30, 90, 150, 210].map(d => (d * Math.PI) / 180)

function catmullRomSpline(points: [number, number][], tension = 0.35): string {
  if (points.length < 2) return ''
  const closed = [...points, points[0], points[1], points[2]]
  let path = `M ${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)}`
  for (let i = 0; i < points.length; i++) {
    const p0 = closed[i], p1 = closed[i+1], p2 = closed[i+2], p3 = closed[i+3]
    const cp1x = p1[0] + (p2[0] - p0[0]) * tension
    const cp1y = p1[1] + (p2[1] - p0[1]) * tension
    const cp2x = p2[0] - (p3[0] - p1[0]) * tension
    const cp2y = p2[1] - (p3[1] - p1[1]) * tension
    path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
  }
  return path + ' Z'
}

export default function ArcaneGlyph({
  values,
  states,
  size = 320,
  onStateClick,
  activeTooltip,
  mini = false,
}: ArcaneGlyphProps) {
  const cx = size / 2
  const cy = size / 2
  // Inner glyph area — leaves room for labels
  const outerR = size * (mini ? 0.38 : 0.30)
  const labelR  = size * 0.43
  const nameSize = Math.max(size * 0.038, mini ? 6 : 10)
  const descSize = Math.max(size * 0.030, mini ? 5 : 8)

  const stateKeys = states.map(s => s.key) as (keyof GlyphValues)[]
  const rawVals   = stateKeys.map(k => values[k] ?? 0)
  // Clamp near-zero to exactly 0 so no stray dots appear
  const vals      = rawVals.map(v => v < 0.05 ? 0 : v)

  const dominantIdx = vals.indexOf(Math.max(...vals))

  const dataPoints: [number, number][] = ANGLES.map((angle, i) => {
    const r = outerR * vals[i]
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)]
  })

  const outerRingPoints: [number, number][] = ANGLES.map((angle, i) => [
    cx + outerR * RING_JITTER[i] * Math.cos(angle),
    cy + outerR * RING_JITTER[i] * Math.sin(angle),
  ])

  const halfRingPoints: [number, number][] = ANGLES.map((angle, i) => [
    cx + outerR * 0.5 * RING_JITTER[i] * Math.cos(angle),
    cy + outerR * 0.5 * RING_JITTER[i] * Math.sin(angle),
  ])

  const filledPath    = catmullRomSpline(dataPoints)
  const outerPath     = catmullRomSpline(outerRingPoints)
  const halfPath      = catmullRomSpline(halfRingPoints)

  // Extra viewBox padding so nothing clips
  const pad = mini ? 0 : size * 0.12
  const vbSize = size + pad * 2
  const offset = pad

  return (
    <div style={{ width: size, height: size, position: 'relative', flexShrink: 0 }}>
      <motion.svg
        width={size}
        height={size}
        viewBox={`${-offset} ${-offset} ${vbSize} ${vbSize}`}
        style={{ overflow: 'visible', display: 'block' }}
      >
        {/* Spokes */}
        {ANGLES.map((angle, i) => (
          <line key={`spoke-${i}`}
            x1={cx} y1={cy}
            x2={cx + outerR * Math.cos(angle)} y2={cy + outerR * Math.sin(angle)}
            stroke="var(--gold-faint)" strokeWidth={0.7} opacity={0.5}
          />
        ))}

        {/* Half ring */}
        <path d={halfPath} fill="none" stroke="var(--gold-faint)"
              strokeWidth={0.6} strokeDasharray="2 3" opacity={0.4} />

        {/* Outer ring */}
        <path d={outerPath} fill="none" stroke="var(--accent-dim)"
              strokeWidth={1} opacity={0.55} />

        {/* Filled glyph — dramatic, alive */}
        <motion.path
          d={filledPath}
          fill="var(--glyph-fill)"
          stroke="var(--glyph-stroke)"
          strokeWidth={2}
          strokeLinejoin="round"
          initial={false}
          animate={{ d: filledPath }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        />

        {/* State labels — only on non-mini */}
        {!mini && states.map((state, i) => {
          const angle = ANGLES[i]
          const lx = cx + labelR * Math.cos(angle)
          const ly = cy + labelR * Math.sin(angle)
          const isActive = dominantIdx === i
          const isTooltipActive = activeTooltip === state.key

          return (
            <g key={state.key}
               onClick={() => onStateClick?.(state.key)}
               style={{ cursor: onStateClick ? 'pointer' : 'default' }}>
              {/* Invisible hit area */}
              <circle cx={lx} cy={ly} r={size * 0.07} fill="transparent" />
              {/* State name */}
              <text
                x={lx} y={ly - descSize * 0.8}
                textAnchor="middle" dominantBaseline="middle"
                fill={isActive || isTooltipActive ? 'var(--accent)' : 'var(--accent-dim)'}
                fontSize={nameSize}
                fontFamily="Cinzel, serif"
                letterSpacing="1"
                fontWeight="600"
                style={{ transition: 'fill 200ms ease' }}
              >
                {state.label}
              </text>
              {/* Description */}
              <text
                x={lx} y={ly + descSize * 1.2}
                textAnchor="middle" dominantBaseline="middle"
                fill={isActive ? 'var(--text-secondary)' : 'var(--text-faint)'}
                fontSize={descSize}
                fontFamily="EB Garamond, serif"
              >
                {state.desc}
              </text>
            </g>
          )
        })}
      </motion.svg>
    </div>
  )
}
