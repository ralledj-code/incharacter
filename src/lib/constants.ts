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
  { key: 'charming',  label: 'CHARMING',  desc: 'The performance is holding' },
  { key: 'volatile',  label: 'VOLATILE',  desc: 'Internal pressure is high' },
  { key: 'reckless',  label: 'RECKLESS',  desc: 'Appetite is driving decisions' },
  { key: 'withdrawn', label: 'WITHDRAWN', desc: 'Going quiet, pulling back' },
  { key: 'guarded',   label: 'GUARDED',   desc: 'Walls are up' },
  { key: 'present',   label: 'PRESENT',   desc: 'Genuinely here, right now' },
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
      'Talked their way out of something',
      'Played a role he didn\'t believe in',
    ],
  },
  {
    id: 'avoided',
    label: 'Avoided',
    icon: '👁',
    desc: 'Fled, stayed quiet, let something happen',
    subcategories: [
      'Ran when they should have stood',
      'Stayed silent when they had something to say',
      'Let someone else take the fall',
      'Walked away from a fight',
      'Pretended not to see something',
    ],
  },
  {
    id: 'indulged',
    label: 'Indulged',
    icon: '🍷',
    desc: 'Drank, used, lost themselves deliberately',
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
    desc: 'A surge, whisper, or moment of uncontrolled power',
    subcategories: [
      'It slipped — not fully in control',
      'Heard or sensed something others didn\'t',
      'Used it deliberately',
      'It spoke, whispered, or warned',
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
    desc: 'Got someone hurt, compromised themselves',
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
    desc: 'Clue, sighting, or connection to the antagonist',
    subcategories: [
      'Found a clue that changes things',
      'Saw something that doesn\'t fit',
      'Met someone connected to it',
      'A piece clicked into place',
      'Something contradicted what they thought they knew',
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

export const REACTION_MODIFIERS: Record<string, number> = {
  owned_it:           1.0,
  enjoyed_too_much:   1.4,
  hated_himself:      1.2,
  didnt_feel_it:      0.6,
  scared_himself:     1.3,
  doesnt_want_to_think: 0.8,
}

export const CLUE_SOURCE_TYPES = [
  { id: 'rumor',       label: 'Rumor',                  color: '#9e8a6a' },
  { id: 'confirmed',   label: 'Confirmed',              color: '#c9a84c' },
  { id: 'experienced', label: 'Experienced',            color: '#b09050' },
  { id: 'told',        label: 'Was Told',               color: '#9e8a6a' },
  { id: 'contradicts', label: 'Contradicts What They Knew', color: '#8b2e2e' },
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
  'Considering...',
  'Consulting the arc...',
  'Reading the signs...',
  'Processing...',
  'Listening to the silence...',
  'Reading the moment...',
]

export function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value))
}

export function getRandomLoadingPhrase(): string {
  return LOADING_PHRASES[Math.floor(Math.random() * LOADING_PHRASES.length)]
}
