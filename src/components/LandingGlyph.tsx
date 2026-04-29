'use client'

const RING_JITTER = [0.97, 1.03, 0.98, 1.01, 0.96, 1.02]
const ANGLES = [-90, -30, 30, 90, 150, 210].map(d => (d * Math.PI) / 180)
// Organic demo values that look good as a static watermark
const DEMO_VALUES = [0.72, 0.45, 0.58, 0.38, 0.65, 0.82]

function catmullRomSpline(points: [number, number][], tension = 0.4): string {
  if (points.length < 2) return ''
  const closed = [...points, points[0], points[1], points[2]]
  let path = `M ${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)}`
  for (let i = 0; i < points.length; i++) {
    const p0 = closed[i], p1 = closed[i + 1], p2 = closed[i + 2], p3 = closed[i + 3]
    const cp1x = p1[0] + (p2[0] - p0[0]) * tension
    const cp1y = p1[1] + (p2[1] - p0[1]) * tension
    const cp2x = p2[0] - (p3[0] - p1[0]) * tension
    const cp2y = p2[1] - (p3[1] - p1[1]) * tension
    path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
  }
  return path + ' Z'
}

interface LandingGlyphProps {
  size?: number
  color?: string
}

export default function LandingGlyph({ size = 300, color = '#c9a84c' }: LandingGlyphProps) {
  const cx = size / 2, cy = size / 2
  const outerR = size * 0.295

  const dataPoints: [number, number][] = ANGLES.map((angle, i) => {
    const r = outerR * DEMO_VALUES[i]
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
  const dm = size * 0.018

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      {/* Spoke lines */}
      {ANGLES.map((angle, i) => (
        <line key={i} x1={cx} y1={cy}
          x2={cx + outerR * Math.cos(angle)} y2={cy + outerR * Math.sin(angle)}
          stroke={color} strokeWidth={0.6} opacity={0.4} />
      ))}
      {/* Half-ring reference */}
      <path d={halfPath} fill="none" stroke={color} strokeWidth={0.5} strokeDasharray="2 3" opacity={0.3} />
      {/* Outer organic ring */}
      <path d={outerPath} fill="none" stroke={color} strokeWidth={0.8} opacity={0.5} />
      {/* Filled glyph — Catmull-Rom spline, organic shape */}
      <path d={filledPath} fill={color} fillOpacity={0.12} stroke={color} strokeWidth={1.2} opacity={0.8} />
      {/* Diamond markers */}
      {dataPoints.map(([x, y], i) => (
        <rect key={i} x={x - dm/2} y={y - dm/2} width={dm} height={dm}
          fill={color} opacity={0.7} transform={`rotate(45,${x},${y})`} />
      ))}
    </svg>
  )
}
