'use client'

import { RING_JITTER } from '@/lib/constants'

const ANGLES = [-90, -30, 30, 90, 150, 210].map(d => (d * Math.PI) / 180)
const DEMO_VALUES = [0.72, 0.45, 0.38, 0.28, 0.55, 0.82]

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

export default function LandingGlyph({ size = 300 }: { size?: number }) {
  const cx = size / 2
  const cy = size / 2
  const outerR = size * 0.295

  const dataPoints: [number, number][] = ANGLES.map((angle, i) => {
    const r = outerR * DEMO_VALUES[i]
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)]
  })

  const ringPoints: [number, number][] = ANGLES.map((angle, i) => {
    const r = outerR * RING_JITTER[i]
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)]
  })

  const filledPath = catmullRomSpline(dataPoints)
  const outerPath = catmullRomSpline(ringPoints)

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {ANGLES.map((angle, i) => (
        <line
          key={i}
          x1={cx} y1={cy}
          x2={cx + outerR * Math.cos(angle)}
          y2={cy + outerR * Math.sin(angle)}
          stroke="#c9a84c"
          strokeWidth={0.6}
          opacity={0.55}
        />
      ))}
      <path d={outerPath} fill="none" stroke="#7a6028" strokeWidth={0.9} opacity={0.6} />
      <path d={filledPath} fill="rgba(180,130,60,0.3)" stroke="#c9a84c" strokeWidth={1.4} opacity={0.88} />
    </svg>
  )
}
