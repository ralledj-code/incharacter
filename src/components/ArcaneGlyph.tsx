'use client'

import { motion } from 'framer-motion'
import { glyphFillColor, RING_JITTER } from '@/lib/constants'

interface GlyphValues {
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
}

const ANGLES = [-90, -30, 30, 90, 150, 210].map(d => (d * Math.PI) / 180)

function catmullRomSpline(points: [number, number][], tension = 0.4): string {
  if (points.length < 2) return ''
  const closed = [...points, points[0], points[1], points[2]]
  let path = `M ${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)}`
  for (let i = 0; i < points.length; i++) {
    const p0 = closed[i]
    const p1 = closed[i + 1]
    const p2 = closed[i + 2]
    const p3 = closed[i + 3]
    const cp1x = p1[0] + (p2[0] - p0[0]) * tension
    const cp1y = p1[1] + (p2[1] - p0[1]) * tension
    const cp2x = p2[0] - (p3[0] - p1[0]) * tension
    const cp2y = p2[1] - (p3[1] - p1[1]) * tension
    path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
  }
  path += ' Z'
  return path
}

export default function ArcaneGlyph({
  values,
  states,
  size = 320,
  onStateClick,
  activeTooltip,
}: ArcaneGlyphProps) {
  const cx = size / 2
  const cy = size / 2
  const outerR = size * 0.285
  const labelR = size * 0.415
  const fontSize = Math.max(size * 0.038, 10)  // state name min 10px
  const descSize = Math.max(size * 0.031, 8.5) // desc min 8.5px

  const stateKeys = states.map(s => s.key) as (keyof GlyphValues)[]
  const vals = stateKeys.map(k => values[k] ?? 0)
  const maxVal = Math.max(...vals)

  const dataPoints: [number, number][] = ANGLES.map((angle, i) => {
    const r = outerR * vals[i]
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)]
  })

  const ringPoints: [number, number][] = ANGLES.map((angle, i) => {
    const r = outerR * RING_JITTER[i]
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)]
  })

  const halfPoints: [number, number][] = ANGLES.map((angle, i) => {
    const r = outerR * 0.5 * RING_JITTER[i]
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)]
  })

  const filledPath = catmullRomSpline(dataPoints)
  const outerPath = catmullRomSpline(ringPoints)
  const halfPath = catmullRomSpline(halfPoints)

  const strokeColor = '#c9a84c'
  const dimStroke = '#3d2e10'
  const dimStroke2 = '#7a6028'
  const fillColor = glyphFillColor(maxVal)

  const dominantIdx = vals.indexOf(maxVal)
  const dominantState = states[dominantIdx]

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <motion.svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ overflow: 'visible' }}
      >
        {/* Spoke lines */}
        {ANGLES.map((angle, i) => (
          <line
            key={`spoke-${i}`}
            x1={cx}
            y1={cy}
            x2={cx + outerR * Math.cos(angle)}
            y2={cy + outerR * Math.sin(angle)}
            stroke={dimStroke}
            strokeWidth={0.6}
            opacity={0.55}
          />
        ))}

        {/* Half reference ring */}
        <path
          d={halfPath}
          fill="none"
          stroke={dimStroke}
          strokeWidth={0.6}
          strokeDasharray="2 3"
          opacity={0.45}
        />

        {/* Outer ring */}
        <path
          d={outerPath}
          fill="none"
          stroke={dimStroke2}
          strokeWidth={0.9}
          opacity={0.6}
        />

        {/* Filled glyph area */}
        <motion.path
          d={filledPath}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={1.4}
          opacity={0.88}
          initial={false}
          animate={{ d: filledPath }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        />

        {/* Diamond markers — only show if value is above a minimum threshold */}
        {dataPoints.map(([x, y], i) => {
          if (vals[i] < 0.08) return null // hide near-zero dots
          const dm = Math.max(size * 0.016, 3)
          return (
            <motion.rect
              key={`diamond-${i}`}
              x={x - dm / 2}
              y={y - dm / 2}
              width={dm}
              height={dm}
              fill={strokeColor}
              opacity={0.85}
              transform={`rotate(45, ${x}, ${y})`}
              initial={false}
              animate={{ x: x - dm / 2, y: y - dm / 2 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            />
          )
        })}

        {/* State labels */}
        {states.map((state, i) => {
          const angle = ANGLES[i]
          const lx = cx + labelR * Math.cos(angle)
          const ly = cy + labelR * Math.sin(angle)
          const isActive = dominantState?.key === state.key
          const isTooltipActive = activeTooltip === state.key

          return (
            <g
              key={state.key}
              onClick={() => onStateClick?.(state.key)}
              style={{ cursor: onStateClick ? 'pointer' : 'default' }}
            >
              <circle
                cx={lx}
                cy={ly}
                r={Math.max(size * 0.065, 18)}
                fill="transparent"
              />
              <text
                x={lx}
                y={ly - descSize * 0.3}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={isActive || isTooltipActive ? strokeColor : dimStroke2}
                fontSize={fontSize}
                fontFamily="Cinzel, serif"
                letterSpacing="0.12em"
                style={{ transition: 'fill 300ms ease' }}
              >
                {state.label}
              </text>
              <text
                x={lx}
                y={ly + descSize * 1.4}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={isActive ? dimStroke2 : dimStroke}
                fontSize={descSize}
                fontFamily="EB Garamond, serif"
                fontStyle="italic"
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
