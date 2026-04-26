export const COLORS = {
  background: '#0a0500',
  surface: '#110c04',
  surface2: '#1a1208',
  surface3: '#221a0d',
  gold: '#c9a84c',
  goldDim: '#7a6028',
  goldFaint: '#3d2e10',
  text: '#f0e6d3',
  textDim: '#9e8a6a',
  textFaint: '#5a4a30',
  border: '#2a1e0a',
  red: '#8b2e2e',
  redDim: '#5a1e1e',
  overlay: 'rgba(10, 5, 0, 0.85)',
  overlayHeavy: 'rgba(10, 5, 0, 0.95)',
} as const

export const GLYPH_STATES = [
  { key: 'charming', label: 'CHARMING', desc: 'The performance is intact' },
  { key: 'volatile', label: 'VOLATILE', desc: 'The noise is getting loud' },
  { key: 'reckless', label: 'RECKLESS', desc: 'The bottle is speaking' },
  { key: 'withdrawn', label: 'WITHDRAWN', desc: 'The mask is slipping' },
  { key: 'guarded', label: 'GUARDED', desc: 'The wound is talking' },
  { key: 'present', label: 'PRESENT', desc: 'He is here, right now' },
] as const

export type GlyphStateKey = typeof GLYPH_STATES[number]['key']

export const RING_JITTER = [0.97, 1.03, 0.98, 1.01, 0.96, 1.02]

export const EVENT_CATEGORIES = [
  {
    id: 'violence',
    label: 'Violence',
    icon: '⚔',
    desc: 'Fought, killed, got hurt, threatened',
    subcategories: [
      'Drew first blood',
      'Killed someone',
      'Took serious damage',
      'Threatened someone into backing down',
      'Watched someone else get hurt',
    ],
  },
  {
    id: 'performance',
    label: 'Performance',
    icon: '🎭',
    desc: 'Charmed, lied, performed, talked through',
    subcategories: [
      'Charmed someone who should know better',
      'Told a convincing lie',
      'Performed for a crowd',
      'Talked his way out of something',
      'Played a role he didn\'t believe in',
    ],
  },
  {
    id: 'avoided',
    label: 'Avoided',
    icon: '👁',
    desc: 'Fled, stayed quiet, let something happen',
    subcategories: [
      'Ran when he should have stood',
      'Stayed silent when he had something to say',
      'Let someone else take the fall',
      'Walked away from a fight',
      'Pretended not to see something',
    ],
  },
  {
    id: 'indulged',
    label: 'Indulged',
    icon: '🍷',
    desc: 'Drank, used, lost himself deliberately',
    subcategories: [
      'Had more than was wise',
      'Used something he promised himself he wouldn\'t',
      'Lost time he can\'t account for',
      'Indulged in something shameful',
      'Chose oblivion over presence',
    ],
  },
  {
    id: 'dagger',
    label: 'The Dagger',
    icon: '✝',
    desc: 'Surge, whisper, magic slipped, infernal',
    subcategories: [
      'The magic slipped sideways',
      'Heard something nobody else heard',
      'Used power he doesn\'t fully control',
      'The dagger whispered something true',
      'A surge — unpredictable, unasked for',
    ],
  },
  {
    id: 'opened_up',
    label: 'Opened Up',
    icon: '🤝',
    desc: 'Trusted, let someone close, helped',
    subcategories: [
      'Trusted someone',
      'Let someone see something real',
      'Helped without calculation',
      'Accepted help',
      'Said something true',
    ],
  },
  {
    id: 'crossed_line',
    label: 'Crossed a Line',
    icon: '⚖',
    desc: 'Got someone hurt, compromised himself',
    subcategories: [
      'Got someone hurt who didn\'t deserve it',
      'Betrayed someone\'s trust',
      'Compromised something he said he wouldn\'t',
      'Used someone as a tool',
      'Lied to protect himself at someone else\'s cost',
    ],
  },
  {
    id: 'mystery',
    label: 'The Mystery',
    icon: '🔍',
    desc: 'Clue, sighting, someone who knew her',
    subcategories: [
      'Found a clue that changes things',
      'Saw something he can\'t explain',
      'Met someone who knew the antagonist',
      'A piece of the puzzle clicked into place',
      'Something contradicted what he thought he knew',
    ],
  },
] as const

export const REACTIONS = [
  { id: 'owned_it', label: 'Owned It', desc: 'Did it, no apologies' },
  { id: 'enjoyed_too_much', label: 'Enjoyed It Too Much', desc: 'The smile lasted too long' },
  { id: 'hated_himself', label: 'Hated Himself For It', desc: 'Necessary, and awful' },
  { id: 'didnt_feel_it', label: "Didn't Feel It", desc: 'Went through the motions' },
  { id: 'scared_himself', label: 'Scared Himself', desc: 'That surprised him' },
  { id: 'doesnt_want_to_think', label: "Doesn't Want to Think About It", desc: 'Filed under: later' },
] as const

export const BASE_TRACKER_WEIGHTS: Record<string, { mask: number; dagger: number; bottle: number; wound: number }> = {
  violence:     { mask: -5,  dagger: +8,  bottle: +5,  wound: +10 },
  performance:  { mask: +8,  dagger: -3,  bottle: +3,  wound: -5  },
  avoided:      { mask: -8,  dagger: +5,  bottle: +8,  wound: +5  },
  indulged:     { mask: -5,  dagger: -8,  bottle: +15, wound: +5  },
  dagger:       { mask: -3,  dagger: +15, bottle: +5,  wound: +8  },
  opened_up:    { mask: -5,  dagger: -5,  bottle: -8,  wound: -10 },
  crossed_line: { mask: -10, dagger: +5,  bottle: +8,  wound: +10 },
  mystery:      { mask: 0,   dagger: +3,  bottle: +3,  wound: +5  },
}

export const REACTION_MODIFIERS: Record<string, number> = {
  owned_it:           1.0,
  enjoyed_too_much:   1.4,
  hated_himself:      1.2,
  didnt_feel_it:      0.6,
  scared_himself:     1.3,
  doesnt_want_to_think: 0.8,
}

export const LONG_REST_DELTAS = {
  drank_dreamed:    { mask: +5,  dagger: -8,  bottle: -10, wound: -5  },
  drank_no_dream:   { mask: 0,   dagger: -5,  bottle: -5,  wound: +5  },
  no_drink_dreamed: { mask: +10, dagger: -12, bottle: +5,  wound: -10 },
  no_drink_no_dream:{ mask: +5,  dagger: -5,  bottle: +8,  wound: 0   },
}

export const CLUE_SOURCE_TYPES = [
  { id: 'rumor',       label: 'Rumor',                  color: '#9e8a6a' },
  { id: 'confirmed',   label: 'Confirmed',              color: '#c9a84c' },
  { id: 'experienced', label: 'Experienced',            color: '#b09050' },
  { id: 'told',        label: 'Was Told',               color: '#9e8a6a' },
  { id: 'contradicts', label: 'Contradicts What He Knew', color: '#8b2e2e' },
  { id: 'unknown',     label: 'Unknown Origin',         color: '#5a4a30' },
] as const

export const RELATIONSHIP_MOMENT_TYPES = [
  'Called me out',
  'Helped without asking why',
  'I pushed them away',
  'They saw something they shouldn\'t have',
  'I told them something true',
  'They disappeared',
  'They came back',
  'It got complicated',
] as const

export const TRUST_DIRECTIONS = {
  closer: { label: 'Closer', color: '#c9a84c' },
  further: { label: 'Further', color: '#8b2e2e' },
  complicated: { label: 'Complicated', color: '#9e8a6a' },
} as const

export const LOADING_PHRASES = [
  'The dagger considers...',
  'Consulting the wound...',
  'Reading the signs...',
  'The mask settles...',
  'Listening to the silence...',
  'The bottle is honest...',
]

export function glyphValuesFromTrackers(mask: number, dagger: number, bottle: number, wound: number) {
  return {
    charming:  mask / 100,
    volatile:  dagger / 100,
    reckless:  bottle / 100,
    withdrawn: (100 - mask) / 100,
    guarded:   (wound * 0.6 + dagger * 0.4) / 100,
    present:   (100 - wound) / 100,
  }
}

export function glyphFillColor(maxVal: number): string {
  const r = Math.round(201 - maxVal * 65)
  const g = Math.round(168 - maxVal * 128)
  const b = Math.round(76  - maxVal * 44)
  const a = (0.15 + maxVal * 0.32).toFixed(2)
  return `rgba(${r},${g},${b},${a})`
}

export function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value))
}

export function applyTrackerDeltas(
  current: { mask: number; dagger: number; bottle: number; wound: number },
  category: string,
  reaction: string
) {
  const base = BASE_TRACKER_WEIGHTS[category] || { mask: 0, dagger: 0, bottle: 0, wound: 0 }
  const multiplier = REACTION_MODIFIERS[reaction] || 1.0
  return {
    mask:   clamp(current.mask   + Math.round(base.mask   * multiplier)),
    dagger: clamp(current.dagger + Math.round(base.dagger * multiplier)),
    bottle: clamp(current.bottle + Math.round(base.bottle * multiplier)),
    wound:  clamp(current.wound  + Math.round(base.wound  * multiplier)),
  }
}

export function getRandomLoadingPhrase(): string {
  return LOADING_PHRASES[Math.floor(Math.random() * LOADING_PHRASES.length)]
}
