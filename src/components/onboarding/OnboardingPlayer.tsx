'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { createClient } from '@/lib/supabase/client'
import { GLYPH_STATES as RAW_GLYPH_STATES } from '@/lib/constants'
import ArcaneGlyph from '@/components/ArcaneGlyph'
import InfoTip from '@/components/InfoTip'
import type { CharacterConfig, InterviewAnswers } from '@/lib/api'

type PaletteEntry = { key: string; label: string; desc: string }
const GLYPH_STATES: PaletteEntry[] = RAW_GLYPH_STATES.map(s => ({ key: s.key, label: s.label, desc: s.desc }))

// Screens in order
type Screen =
  | 'start' | 'upload'
  | 'q1' | 'q2' | 'q3' | 'q4' | 'q5'
  | 'analyzing' | 'review'
  | 'color' | 'palette' | 'apikey' | 'campaign' | 'final'

const SCREEN_ORDER: Screen[] = [
  'start', 'upload', 'q1', 'q2', 'q3', 'q4', 'q5',
  'analyzing', 'review', 'color', 'palette', 'apikey', 'campaign', 'final',
]
// 'analyzing' transitions automatically — not shown as a dot
const DOT_SCREENS: Screen[] = SCREEN_ORDER.filter(s => s !== 'analyzing')

const COLOR_PRESETS = [
  { id: 'grimoire', label: 'The Grimoire', desc: 'Gold · Amber to Crimson',    primary: '#c9a84c', secondary: '#8a6e2e', accent: '#f0e6d3' },
  { id: 'sanctum',  label: 'The Sanctum',  desc: 'Silver · Ice Blue to Navy',  primary: '#c0c8d8', secondary: '#7a8898', accent: '#e8e8f0' },
  { id: 'wilds',    label: 'The Wilds',    desc: 'Amber · Amber to Forest',    primary: '#c8a45a', secondary: '#887230', accent: '#f0e8d0' },
  { id: 'shadow',   label: 'The Shadow',   desc: 'Purple · Purple to Black',   primary: '#9b7fc8', secondary: '#604a90', accent: '#e0d8f0' },
  { id: 'forge',    label: 'The Forge',    desc: 'Copper · Copper to Crimson', primary: '#c87840', secondary: '#884820', accent: '#f0dcc8' },
  { id: 'custom',   label: 'Custom',       desc: 'Your own accent color',      primary: '#c9a84c', secondary: '#8a6e2e', accent: '#f0e6d3' },
]

const STRESS_OPTIONS = [
  { id: 'drinks_or_uses',    label: 'Drinks or uses something' },
  { id: 'performs_harder',   label: 'Performs harder, turns on the charm' },
  { id: 'goes_quiet',        label: 'Goes very quiet' },
  { id: 'gets_reckless',     label: 'Gets reckless, makes bad decisions' },
  { id: 'picks_fight',       label: 'Picks a fight' },
  { id: 'runs',              label: 'Runs' },
]

function ProgressDots({ current, screens }: { current: Screen; screens: Screen[] }) {
  const idx = screens.indexOf(current)
  return (
    <div className="flex items-center gap-1.5 justify-center mb-8">
      {screens.map((s, i) => (
        <div key={s} className="rounded-full transition-all duration-300"
          style={{
            width: s === current ? 20 : 6,
            height: 6,
            background: i <= idx ? 'var(--accent)' : 'var(--gold-faint)',
          }}
        />
      ))}
    </div>
  )
}

export default function OnboardingPlayer() {
  const router = useRouter()
  const [screen, setScreen] = useState<Screen>('start')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Dossier
  const [dossierText, setDossierText] = useState('')

  // Interview answers
  const [q1Motivation, setQ1Motivation] = useState('')
  const [q2HasAntagonist, setQ2HasAntagonist] = useState<boolean | null>(null)
  const [q2AntagonistName, setQ2AntagonistName] = useState('')
  const [q2AntagonistRelationship, setQ2AntagonistRelationship] = useState('')
  const [q3AllyName, setQ3AllyName] = useState('')
  const [q3AllyRole, setQ3AllyRole] = useState('')
  const [q3NoAlly, setQ3NoAlly] = useState(false)
  const [q4HasDangerous, setQ4HasDangerous] = useState<boolean | null>(null)
  const [q4DangerousName, setQ4DangerousName] = useState('')
  const [q5StressResponses, setQ5StressResponses] = useState<string[]>([])

  // Analysis results
  const [analysis, setAnalysis] = useState<{
    characterName: string
    voiceSummary: string
    trackerNames: { mask: string; dagger: string; bottle: string; wound: string }
    emotionPalette: PaletteEntry[]
    openingLine: string
    characterConfig: CharacterConfig | null
  } | null>(null)

  // Character config fields
  const [characterName, setCharacterName] = useState('')
  const [trackerNames, setTrackerNames] = useState({ mask: 'The Mask', dagger: 'The Dagger', bottle: 'The Bottle', wound: 'The Wound' })
  const [emotionPalette, setEmotionPalette] = useState<PaletteEntry[]>([...GLYPH_STATES])
  const [colorScheme, setColorScheme] = useState(COLOR_PRESETS[0])
  const [apiKey, setApiKey] = useState('')
  const [campaignCode, setCampaignCode] = useState('')

  function go(s: Screen) { setScreen(s); setError('') }

  // Upload handler
  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0]
    if (!file) return
    setLoading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/extract-pdf', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.error) { setError(data.error) }
      else if (data.text) { setDossierText(data.text) }
      else { setError("Couldn't read that file. Try pasting your dossier as text below.") }
    } catch {
      setError("Couldn't read that file. Try pasting your dossier as text below.")
    }
    setLoading(false)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
    },
    maxFiles: 1,
  })

  function toggleStress(id: string) {
    setQ5StressResponses(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : prev.length < 2 ? [...prev, id] : prev
    )
  }

  async function runAnalysis() {
    go('analyzing')
    setLoading(true)
    try {
      const interview: InterviewAnswers = {
        core_motivation: q1Motivation,
        antagonist: q2HasAntagonist && q2AntagonistName
          ? { name: q2AntagonistName, relationship: q2AntagonistRelationship }
          : null,
        primary_ally: !q3NoAlly && q3AllyName
          ? { name: q3AllyName, role: q3AllyRole }
          : null,
        dangerous_element: q4HasDangerous && q4DangerousName
          ? { name: q4DangerousName }
          : null,
        stress_responses: q5StressResponses,
      }
      const res = await fetch('/api/claude/analyze-dossier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dossierText, interview, apiKey: apiKey || undefined }),
      })
      const data = await res.json()
      setAnalysis(data)
      setCharacterName(data.characterName || '')
      setTrackerNames(data.trackerNames || trackerNames)
      if (data.emotionPalette?.length) setEmotionPalette(data.emotionPalette)
      // Apply suggested color scheme
      const suggestedId = data.characterConfig?.color_scheme_suggestion || 'grimoire'
      const match = COLOR_PRESETS.find(p => p.id === suggestedId)
      if (match) { setColorScheme(match); document.documentElement.setAttribute('data-scheme', match.id) }
      go('review')
    } catch {
      setError('Could not analyze the dossier. Check your API key or try again.')
      go('q5')
    }
    setLoading(false)
  }

  async function createCharacter() {
    setLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = (t: string) => (supabase.from(t) as any)

      // Build the full tracker_config including interview answers and dynamic categories
      const config = analysis?.characterConfig
      const tracker_config = {
        ...(config || {}),
        trackerNames,
        // Ensure dynamic categories are stored (fallback to defaults if no config)
        dangerous_element_category: config?.dangerous_element_category || {
          id: 'special', icon: '✝', name: 'The Unknown',
          description: 'a surge, whisper, or moment of uncontrolled power',
          tracker_weights: { dagger: 10, mask: -4 },
        },
        antagonist_category: config?.antagonist_category || {
          id: 'antagonist', icon: '🔍', name: 'The Mystery',
          description: 'clue, sighting, connection to the antagonist',
          tracker_weights: { dagger: 5, wound: 8 },
        },
        key_relationships: config?.key_relationships || [],
        clue_board_name: config?.clue_board_name || 'The Mystery',
        clue_board_subject: config?.clue_board_subject || 'the antagonist',
      }

      const { data: character, error: charErr } = await db('characters').insert({
        player_id: user.id,
        name: characterName,
        dossier_text: dossierText,
        color_scheme: colorScheme,
        emotion_palette: emotionPalette,
        tracker_config,
        api_key_encrypted: apiKey || null,
        portrait_url: null,
      }).select().single()

      if (charErr) throw charErr

      await db('tracker_states').insert({
        character_id: character.id,
        mask: 50, dagger: 30, bottle: 40, wound: 60,
        play_directive: null,
        glyph_states: emotionPalette,
      })

      await db('sessions').insert({ character_id: character.id, session_number: 1 })

      if (campaignCode.trim()) {
        const code = campaignCode.trim().toUpperCase()
        const { data: camp } = await db('campaigns').select('id').eq('campaign_code', code).single()
        if (camp) {
          await db('campaign_members').upsert({ campaign_id: camp.id, player_id: user.id, accepted: true })
          await db('characters').update({ campaign_id: camp.id }).eq('id', character.id)
        }
      }

      router.push('/play/now')
    } catch {
      setError('Something went wrong creating your character. Try again.')
    }
    setLoading(false)
  }

  const glyphValues = { charming: 0.65, volatile: 0.35, reckless: 0.40, withdrawn: 0.35, guarded: 0.55, present: 0.40 }
  const dotScreen = screen === 'analyzing' ? 'review' : screen

  return (
    <main className="min-h-screen flex flex-col items-center justify-start px-6 py-12"
          style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="font-cinzel text-2xl tracking-wider" style={{ color: 'var(--accent)' }}>In Character</h1>
        </div>

        <ProgressDots current={dotScreen} screens={DOT_SCREENS} />

        {/* ── Start ──────────────────────────────────────── */}
        {screen === 'start' && (
          <div className="animate-fade-in space-y-6">
            <h2 className="font-cinzel text-lg tracking-wider text-center" style={{ color: 'var(--text)' }}>
              You&rsquo;re a Player.
            </h2>
            <p className="font-garamond text-center leading-relaxed" style={{ color: 'var(--text-dim)' }}>
              We&rsquo;ll build your character&rsquo;s psychological profile step by step.
              Five minutes. One question at a time.
            </p>
            <button className="btn-gold-solid w-full py-4 text-sm tracking-widest" onClick={() => go('upload')}>
              Let&rsquo;s Begin
            </button>
          </div>
        )}

        {/* ── Upload ─────────────────────────────────────── */}
        {screen === 'upload' && (
          <div className="animate-fade-in space-y-6">
            <h2 className="font-cinzel text-lg tracking-wider mb-2" style={{ color: 'var(--text)' }}>
              Your character&rsquo;s dossier
            </h2>
            <p className="font-garamond leading-relaxed" style={{ color: 'var(--text-dim)' }}>
              Supports PDF, Word (.docx), and plain text. Or paste directly below.
            </p>
            <div {...getRootProps()} className="card-dark border-dashed p-8 text-center cursor-pointer transition-colors"
                 style={{ borderColor: isDragActive ? 'var(--accent)' : 'var(--border)' }}>
              <input {...getInputProps()} />
              <p className="font-cinzel text-sm tracking-widest mb-2" style={{ color: 'var(--accent)' }}>
                {isDragActive ? 'Drop it here' : 'Drop file or click to browse'}
              </p>
              <p className="font-garamond text-sm" style={{ color: 'var(--text-faint)' }}>
                PDF · Word (.docx) · Text (.txt, .md)
              </p>
              {loading && <p className="font-garamond text-sm mt-3 animate-pulse" style={{ color: 'var(--accent)' }}>Reading...</p>}
            </div>
            <div>
              <p className="label-caps mb-2">Or paste text</p>
              <textarea value={dossierText} onChange={e => setDossierText(e.target.value)}
                className="w-full p-4 min-h-[160px] text-sm leading-relaxed"
                placeholder="Your character's background, personality, history, relationships..." />
            </div>
            {error && <p className="font-garamond text-sm" style={{ color: 'var(--red)' }}>{error}</p>}
            <div className="flex gap-3">
              <button className="btn-gold flex-1 py-3" onClick={() => go('start')}>Back</button>
              <button className="btn-gold-solid flex-1 py-3 disabled:opacity-40"
                onClick={() => go('q1')} disabled={!dossierText.trim() || loading}>
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── Q1: Core motivation ────────────────────────── */}
        {screen === 'q1' && (
          <div className="animate-fade-in space-y-6">
            <div className="card-dark card-gold-border p-5">
              <p className="font-cinzel text-sm tracking-wider mb-1" style={{ color: 'var(--accent)' }}>Question 1 of 5</p>
              <h2 className="font-garamond text-xl leading-relaxed" style={{ color: 'var(--text)' }}>
                What does your character want more than anything right now?
              </h2>
            </div>
            <input value={q1Motivation} onChange={e => setQ1Motivation(e.target.value)}
              className="w-full px-4 py-3" placeholder="In a sentence or phrase..." autoFocus />
            <div className="flex gap-3">
              <button className="btn-gold flex-1 py-3" onClick={() => go('upload')}>Back</button>
              <button className="btn-gold-solid flex-1 py-3 disabled:opacity-40"
                onClick={() => go('q2')} disabled={!q1Motivation.trim()}>
                Next →
              </button>
            </div>
          </div>
        )}

        {/* ── Q2: Antagonist ─────────────────────────────── */}
        {screen === 'q2' && (
          <div className="animate-fade-in space-y-6">
            <div className="card-dark card-gold-border p-5">
              <p className="font-cinzel text-sm tracking-wider mb-1" style={{ color: 'var(--accent)' }}>Question 2 of 5</p>
              <h2 className="font-garamond text-xl leading-relaxed" style={{ color: 'var(--text)' }}>
                Is there a person, organisation, or force your character is defined by —
                hunting, running from, or haunted by?
              </h2>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setQ2HasAntagonist(true)}
                className="flex-1 py-4 font-cinzel text-sm tracking-wider transition-all"
                style={{ border: '1px solid var(--accent)', color: q2HasAntagonist === true ? 'var(--bg)' : 'var(--accent)', background: q2HasAntagonist === true ? 'var(--accent)' : 'transparent', borderRadius: 2 }}>
                Yes
              </button>
              <button onClick={() => { setQ2HasAntagonist(false); setQ2AntagonistName(''); setQ2AntagonistRelationship('') }}
                className="flex-1 py-4 font-cinzel text-sm tracking-wider transition-all"
                style={{ border: '1px solid var(--border)', color: q2HasAntagonist === false ? 'var(--text)' : 'var(--text-faint)', background: q2HasAntagonist === false ? 'var(--surface2)' : 'transparent', borderRadius: 2 }}>
                Not yet
              </button>
            </div>
            {q2HasAntagonist === true && (
              <div className="space-y-3 animate-fade-in">
                <div>
                  <p className="label-caps mb-2">Their name</p>
                  <input value={q2AntagonistName} onChange={e => setQ2AntagonistName(e.target.value)}
                    className="w-full px-4 py-3" placeholder="Name or description..." autoFocus />
                </div>
                <div>
                  <p className="label-caps mb-2">The relationship in one sentence</p>
                  <input value={q2AntagonistRelationship} onChange={e => setQ2AntagonistRelationship(e.target.value)}
                    className="w-full px-4 py-3" placeholder="She killed his sister and vanished..." />
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <button className="btn-gold flex-1 py-3" onClick={() => go('q1')}>Back</button>
              <button className="btn-gold-solid flex-1 py-3 disabled:opacity-40"
                disabled={q2HasAntagonist === null || (q2HasAntagonist === true && !q2AntagonistName.trim())}
                onClick={() => go('q3')}>
                Next →
              </button>
            </div>
          </div>
        )}

        {/* ── Q3: Primary ally ───────────────────────────── */}
        {screen === 'q3' && (
          <div className="animate-fade-in space-y-6">
            <div className="card-dark card-gold-border p-5">
              <p className="font-cinzel text-sm tracking-wider mb-1" style={{ color: 'var(--accent)' }}>Question 3 of 5</p>
              <h2 className="font-garamond text-xl leading-relaxed" style={{ color: 'var(--text)' }}>
                Who is the one person your character actually trusts — even a little?
              </h2>
            </div>
            <div className="space-y-3">
              <input value={q3AllyName} onChange={e => { setQ3AllyName(e.target.value); setQ3NoAlly(false) }}
                className="w-full px-4 py-3" placeholder="Their name..." autoFocus />
              {q3AllyName.trim() && (
                <div className="animate-fade-in">
                  <p className="label-caps mb-2">What&rsquo;s their role in your character&rsquo;s life?</p>
                  <input value={q3AllyRole} onChange={e => setQ3AllyRole(e.target.value)}
                    className="w-full px-4 py-3" placeholder="Smuggler, old friend, unlikely protector..." />
                </div>
              )}
            </div>
            <button onClick={() => { setQ3NoAlly(true); setQ3AllyName(''); setQ3AllyRole('') }}
              className="w-full text-center font-garamond text-sm transition-colors py-2"
              style={{ color: q3NoAlly ? 'var(--accent)' : 'var(--text-faint)', minHeight: 44 }}>
              {q3NoAlly ? '✓ No one yet' : 'No one yet'}
            </button>
            <div className="flex gap-3">
              <button className="btn-gold flex-1 py-3" onClick={() => go('q2')}>Back</button>
              <button className="btn-gold-solid flex-1 py-3 disabled:opacity-40"
                disabled={!q3NoAlly && !q3AllyName.trim()}
                onClick={() => go('q4')}>
                Next →
              </button>
            </div>
          </div>
        )}

        {/* ── Q4: Dangerous element ──────────────────────── */}
        {screen === 'q4' && (
          <div className="animate-fade-in space-y-6">
            <div className="card-dark card-gold-border p-5">
              <p className="font-cinzel text-sm tracking-wider mb-1" style={{ color: 'var(--accent)' }}>Question 4 of 5</p>
              <h2 className="font-garamond text-xl leading-relaxed" style={{ color: 'var(--text)' }}>
                Does your character have a dangerous element — a power, curse, addiction,
                or secret that could undo them?
              </h2>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setQ4HasDangerous(true)}
                className="flex-1 py-4 font-cinzel text-sm tracking-wider transition-all"
                style={{ border: '1px solid var(--accent)', color: q4HasDangerous === true ? 'var(--bg)' : 'var(--accent)', background: q4HasDangerous === true ? 'var(--accent)' : 'transparent', borderRadius: 2 }}>
                Yes
              </button>
              <button onClick={() => { setQ4HasDangerous(false); setQ4DangerousName('') }}
                className="flex-1 py-4 font-cinzel text-sm tracking-wider transition-all"
                style={{ border: '1px solid var(--border)', color: q4HasDangerous === false ? 'var(--text)' : 'var(--text-faint)', background: q4HasDangerous === false ? 'var(--surface2)' : 'transparent', borderRadius: 2 }}>
                Not really
              </button>
            </div>
            {q4HasDangerous === true && (
              <div className="animate-fade-in">
                <p className="label-caps mb-2">Name it in a few words</p>
                <input value={q4DangerousName} onChange={e => setQ4DangerousName(e.target.value)}
                  className="w-full px-4 py-3" placeholder="The infernal pact, the drinking, wild magic..." autoFocus />
              </div>
            )}
            <div className="flex gap-3">
              <button className="btn-gold flex-1 py-3" onClick={() => go('q3')}>Back</button>
              <button className="btn-gold-solid flex-1 py-3 disabled:opacity-40"
                disabled={q4HasDangerous === null || (q4HasDangerous === true && !q4DangerousName.trim())}
                onClick={() => go('q5')}>
                Next →
              </button>
            </div>
          </div>
        )}

        {/* ── Q5: Stress response ────────────────────────── */}
        {screen === 'q5' && (
          <div className="animate-fade-in space-y-6">
            <div className="card-dark card-gold-border p-5">
              <p className="font-cinzel text-sm tracking-wider mb-1" style={{ color: 'var(--accent)' }}>Question 5 of 5</p>
              <h2 className="font-garamond text-xl leading-relaxed" style={{ color: 'var(--text)' }}>
                When things get hard, what does your character do?
              </h2>
              <p className="font-garamond text-sm mt-2" style={{ color: 'var(--text-faint)' }}>
                Pick up to 2.
              </p>
            </div>
            <div className="space-y-2">
              {STRESS_OPTIONS.map(opt => {
                const selected = q5StressResponses.includes(opt.id)
                return (
                  <button key={opt.id} onClick={() => toggleStress(opt.id)}
                    className="w-full p-4 text-left transition-all"
                    style={{ background: selected ? 'var(--gold-faint)' : 'var(--surface)', border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 2 }}>
                    <p className="font-garamond" style={{ color: selected ? 'var(--accent)' : 'var(--text)' }}>
                      {selected ? '✓ ' : ''}{opt.label}
                    </p>
                  </button>
                )
              })}
            </div>
            {error && <p className="font-garamond text-sm" style={{ color: 'var(--red)' }}>{error}</p>}
            <div className="flex gap-3">
              <button className="btn-gold flex-1 py-3" onClick={() => go('q4')}>Back</button>
              <button className="btn-gold-solid flex-1 py-3 disabled:opacity-40"
                disabled={q5StressResponses.length === 0 || loading}
                onClick={runAnalysis}>
                {loading ? 'Analyzing...' : 'Build Profile →'}
              </button>
            </div>
          </div>
        )}

        {/* ── Analyzing (auto-transition) ─────────────────── */}
        {screen === 'analyzing' && (
          <div className="animate-fade-in flex flex-col items-center gap-6 py-12">
            <div className="w-14 h-14 rounded-full animate-spin"
                 style={{ border: '2px solid var(--gold-faint)', borderTopColor: 'var(--accent)' }} />
            <p className="font-garamond text-lg animate-pulse" style={{ color: 'var(--text-dim)' }}>
              Consulting the wound...
            </p>
            <p className="font-garamond text-sm text-center" style={{ color: 'var(--text-faint)' }}>
              Claude is reading your dossier and interview answers to build the full profile.
            </p>
          </div>
        )}

        {/* ── Review analysis ────────────────────────────── */}
        {screen === 'review' && analysis && (
          <div className="animate-fade-in space-y-5">
            <h2 className="font-cinzel text-lg tracking-wider" style={{ color: 'var(--text)' }}>
              Claude&rsquo;s reading of your character
            </h2>
            <div>
              <p className="label-caps mb-1">Character Name</p>
              <input value={characterName} onChange={e => setCharacterName(e.target.value)} className="w-full px-4 py-2" />
            </div>
            <div className="card-dark card-gold-border p-4">
              <p className="label-caps mb-2">Voice Summary</p>
              <p className="font-garamond leading-relaxed" style={{ color: 'var(--text-dim)' }}>{analysis.voiceSummary}</p>
            </div>
            {analysis.characterConfig && (
              <div className="space-y-2">
                <p className="label-caps">Character-specific categories</p>
                <div className="card-dark p-3 flex gap-3 items-center">
                  <span className="text-xl">{analysis.characterConfig.dangerous_element_category.icon}</span>
                  <div>
                    <p className="font-cinzel text-xs tracking-wider" style={{ color: 'var(--accent)' }}>
                      {analysis.characterConfig.dangerous_element_category.name}
                    </p>
                    <p className="font-garamond text-xs" style={{ color: 'var(--text-faint)' }}>
                      {analysis.characterConfig.dangerous_element_category.description}
                    </p>
                  </div>
                </div>
                <div className="card-dark p-3 flex gap-3 items-center">
                  <span className="text-xl">{analysis.characterConfig.antagonist_category.icon}</span>
                  <div>
                    <p className="font-cinzel text-xs tracking-wider" style={{ color: 'var(--accent)' }}>
                      {analysis.characterConfig.antagonist_category.name}
                    </p>
                    <p className="font-garamond text-xs" style={{ color: 'var(--text-faint)' }}>
                      {analysis.characterConfig.antagonist_category.description}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <button className="btn-gold flex-1 py-3" onClick={runAnalysis}>Re-analyze</button>
              <button className="btn-gold-solid flex-1 py-3" onClick={() => go('color')}>Looks right →</button>
            </div>
          </div>
        )}

        {/* ── Color scheme ───────────────────────────────── */}
        {screen === 'color' && (
          <div className="animate-fade-in space-y-6">
            <h2 className="font-cinzel text-lg tracking-wider" style={{ color: 'var(--text)' }}>Choose your color scheme</h2>
            <div className="grid grid-cols-2 gap-3">
              {COLOR_PRESETS.map(preset => (
                <button key={preset.id}
                  onClick={() => { setColorScheme(preset); document.documentElement.setAttribute('data-scheme', preset.id) }}
                  className="p-4 text-left transition-all"
                  style={{ background: 'var(--surface)', border: `1px solid ${colorScheme.id === preset.id ? preset.primary : 'var(--border)'}`, borderRadius: 2 }}>
                  <div className="flex gap-2 mb-2">
                    {[preset.primary, preset.secondary, preset.accent].map((c, i) => (
                      <div key={i} className="w-4 h-4 rounded-full" style={{ background: c }} />
                    ))}
                  </div>
                  <p className="font-cinzel text-xs tracking-wider mb-0.5" style={{ color: preset.primary }}>{preset.label}</p>
                  <p className="font-garamond text-xs" style={{ color: 'var(--text-faint)' }}>{preset.desc}</p>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button className="btn-gold flex-1 py-3" onClick={() => go('review')}>Back</button>
              <button className="btn-gold-solid flex-1 py-3" onClick={() => go('palette')}>Choose →</button>
            </div>
          </div>
        )}

        {/* ── Emotion palette ────────────────────────────── */}
        {screen === 'palette' && (
          <div className="animate-fade-in space-y-6">
            <h2 className="font-cinzel text-lg tracking-wider" style={{ color: 'var(--text)' }}>Your emotion palette</h2>
            <p className="font-garamond leading-relaxed" style={{ color: 'var(--text-dim)' }}>
              Six states on your arcane glyph. Claude named them from your dossier — adjust if needed.
            </p>
            <div className="flex justify-center">
              <ArcaneGlyph values={glyphValues} states={emotionPalette} size={200} />
            </div>
            <div className="space-y-3">
              {emotionPalette.map((state, i) => (
                <div key={state.key} className="grid grid-cols-2 gap-2">
                  <input value={state.label}
                    onChange={e => setEmotionPalette(prev => prev.map((s, j) => j === i ? { ...s, label: e.target.value } : s))}
                    className="px-3 py-2 text-sm font-cinzel" placeholder="State name" />
                  <input value={state.desc}
                    onChange={e => setEmotionPalette(prev => prev.map((s, j) => j === i ? { ...s, desc: e.target.value } : s))}
                    className="px-3 py-2 text-sm" placeholder="Short descriptor..." />
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button className="btn-gold flex-1 py-3" onClick={() => go('color')}>Back</button>
              <button className="btn-gold-solid flex-1 py-3" onClick={() => go('apikey')}>Set Palette →</button>
            </div>
          </div>
        )}

        {/* ── API Key ────────────────────────────────────── */}
        {screen === 'apikey' && (
          <div className="animate-fade-in space-y-6">
            <div className="flex items-center gap-2">
              <h2 className="font-cinzel text-lg tracking-wider" style={{ color: 'var(--text)' }}>Your Anthropic API Key</h2>
              <InfoTip text="Your personal Anthropic key. Sessions cost pennies. Encrypted and never shared." />
            </div>
            <div className="card-dark card-gold-border p-4">
              <p className="font-garamond text-sm leading-relaxed" style={{ color: 'var(--text-dim)' }}>
                In Character uses Claude for narratives. You supply your own key — keeps costs low and data private.
                Get one at console.anthropic.com.
              </p>
            </div>
            <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)}
              className="w-full px-4 py-3 font-mono text-sm" placeholder="sk-ant-..." />
            <div className="flex gap-3">
              <button className="btn-gold flex-1 py-3" onClick={() => go('palette')}>Back</button>
              <button className="btn-gold-solid flex-1 py-3 disabled:opacity-40"
                onClick={() => go('campaign')} disabled={!apiKey.trim()}>
                Save Key →
              </button>
            </div>
            <button className="w-full text-center font-garamond text-sm transition-colors py-2"
              style={{ color: 'var(--text-faint)', minHeight: 44 }} onClick={() => go('campaign')}>
              Skip for now (some features won&rsquo;t work)
            </button>
          </div>
        )}

        {/* ── Campaign code ──────────────────────────────── */}
        {screen === 'campaign' && (
          <div className="animate-fade-in space-y-6">
            <h2 className="font-cinzel text-lg tracking-wider" style={{ color: 'var(--text)' }}>
              Do you have a campaign code?
            </h2>
            <p className="font-garamond leading-relaxed" style={{ color: 'var(--text-dim)' }}>
              If your DM shared a code (CAMP-XXXX-XXXX), enter it here. Skip and join later from Settings.
            </p>
            <input value={campaignCode} onChange={e => setCampaignCode(e.target.value)}
              className="w-full px-4 py-3 font-mono text-sm" placeholder="CAMP-XXXX-XXXX" />
            <div className="flex gap-3">
              <button className="btn-gold flex-1 py-3" onClick={() => go('apikey')}>Back</button>
              <button className="btn-gold flex-1 py-3" onClick={() => go('final')}>Skip</button>
              <button className="btn-gold-solid flex-1 py-3" onClick={() => go('final')}>Continue →</button>
            </div>
          </div>
        )}

        {/* ── Final / Welcome ────────────────────────────── */}
        {screen === 'final' && (
          <div className="animate-fade-in space-y-6 text-center">
            <div className="text-4xl mb-2" style={{ color: 'var(--accent)' }}>✦</div>
            <h2 className="font-cinzel text-lg tracking-wider" style={{ color: 'var(--text)' }}>
              {characterName || 'Your Character'}
            </h2>
            {analysis?.openingLine && (
              <div className="card-dark card-gold-border p-6 text-left">
                <p className="font-garamond text-lg leading-relaxed" style={{ color: 'var(--text)', fontStyle: 'italic' }}>
                  &ldquo;{analysis.openingLine}&rdquo;
                </p>
              </div>
            )}
            <p className="font-garamond leading-relaxed" style={{ color: 'var(--text-dim)' }}>
              Your journey begins. The glyph is set.
            </p>
            {error && <p className="font-garamond text-sm" style={{ color: 'var(--red)' }}>{error}</p>}
            <button className="btn-gold-solid w-full py-4 text-sm tracking-widest disabled:opacity-40"
              onClick={createCharacter} disabled={loading}>
              {loading ? 'Creating your character...' : 'Enter →'}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
