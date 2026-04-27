'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { createClient } from '@/lib/supabase/client'
import { GLYPH_STATES as RAW_GLYPH_STATES } from '@/lib/constants'
import ArcaneGlyph from '@/components/ArcaneGlyph'
import type { CharacterConfig, InterviewAnswers } from '@/lib/api'

type PaletteEntry = { key: string; label: string; desc: string }
const GLYPH_STATES: PaletteEntry[] = RAW_GLYPH_STATES.map(s => ({ key: s.key, label: s.label, desc: s.desc }))

// Screens in order — apikey is step 2, right after start
type Screen =
  | 'start' | 'apikey' | 'upload'
  | 'q1' | 'q2' | 'q3' | 'q4' | 'q5'
  | 'analyzing' | 'review'
  | 'color' | 'palette' | 'campaign' | 'final'

const SCREEN_ORDER: Screen[] = [
  'start', 'apikey', 'upload', 'q1', 'q2', 'q3', 'q4', 'q5',
  'analyzing', 'review', 'color', 'palette', 'campaign', 'final',
]
// 'analyzing' transitions automatically — not shown as a dot
const DOT_SCREENS: Screen[] = SCREEN_ORDER.filter(s => s !== 'analyzing')

const COLOR_PRESETS = [
  { id: 'warm',   label: 'Warm',   desc: 'Default — warm white, tan accent',
    bg: '#faf9f7', surface: '#ffffff', accent: '#9b7e4e', text: '#1a1814', text2: '#6b6355', themeClass: '' },
  { id: 'dark',   label: 'Dark',   desc: 'Near-black, warm gold accent',
    bg: '#0f0e0c', surface: '#1c1a17', accent: '#c8a96e', text: '#f0ebe3', text2: '#7a7060', themeClass: 'theme-dark' },
  { id: 'slate',  label: 'Slate',  desc: 'Cool grey, blue accent',
    bg: '#f8f9fa', surface: '#ffffff', accent: '#4a6fa5', text: '#1a1c20', text2: '#5a6170', themeClass: 'theme-slate' },
  { id: 'forest', label: 'Forest', desc: 'Soft green, earthy accent',
    bg: '#f7f9f6', surface: '#ffffff', accent: '#4a7c59', text: '#161a15', text2: '#576355', themeClass: 'theme-forest' },
  { id: 'ink',    label: 'Ink',    desc: 'Warm white, deep purple accent',
    bg: '#f9f8f8', surface: '#ffffff', accent: '#5c5c7a', text: '#18181e', text2: '#5e5e72', themeClass: 'theme-ink' },
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

  async function runAnalysis(forceReanalyze = false) {
    // Fix 2: skip API call if analysis already exists, unless explicitly re-analyzing
    if (analysis && !forceReanalyze) {
      go('review')
      return
    }
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
      const suggestedId = data.characterConfig?.color_scheme_suggestion || 'warm'
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
      if (!user) throw new Error('Not authenticated — please sign in again.')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = (t: string) => (supabase.from(t) as any)

      // Ensure profile exists — Supabase trigger may not have run if schema wasn't applied
      const { data: existingProfile } = await db('profiles').select('id').eq('id', user.id).single()
      if (!existingProfile) {
        const { error: profileErr } = await db('profiles').insert({
          id: user.id,
          username: user.email?.split('@')[0] || null,
          role: 'player',
        })
        if (profileErr) throw new Error(`Profile creation failed: ${profileErr.message}`)
      }

      // Build the full tracker_config including interview answers and dynamic categories
      const config = analysis?.characterConfig
      const tracker_config = {
        ...(config || {}),
        trackerNames,
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

      // Fallback name if analysis never ran
      const finalName = characterName.trim() || user.email?.split('@')[0] || 'My Character'

      const { data: character, error: charErr } = await db('characters').insert({
        player_id: user.id,
        name: finalName,
        dossier_text: dossierText || null,
        color_scheme: colorScheme,
        emotion_palette: emotionPalette,
        tracker_config,
        api_key_encrypted: null, // set via server route below
        portrait_url: null,
      }).select().single()

      if (charErr) throw new Error(`Character insert failed: ${charErr.message}`)
      // Save theme preference to profiles.color_scheme
      await db('profiles').update({ color_scheme: colorScheme.id }).eq('id', user.id)

      // Encrypt and store API key server-side — plaintext never written to DB directly
      if (apiKey.trim()) {
        const keyRes = await fetch('/api/character/update-key', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ characterId: character.id, apiKey: apiKey.trim() }),
        })
        if (!keyRes.ok) console.warn('[onboarding] API key storage failed — user can set it in Settings')
      }

      const { error: trackerErr } = await db('tracker_states').insert({
        character_id: character.id,
        mask: 50, dagger: 30, bottle: 40, wound: 60,
        play_directive: null,
        glyph_states: emotionPalette,
      })
      if (trackerErr) throw new Error(`Tracker insert failed: ${trackerErr.message}`)

      const { error: sessionErr } = await db('sessions').insert({ character_id: character.id, session_number: 1 })
      if (sessionErr) throw new Error(`Session insert failed: ${sessionErr.message}`)

      if (campaignCode.trim()) {
        const code = campaignCode.trim().toUpperCase()
        // Fix 1: look up by campaign_code (human-readable), not by id
        const { data: camp, error: campErr } = await db('campaigns')
          .select('id, name')
          .eq('campaign_code', code)
          .limit(1)
          .single()
        if (campErr) {
          console.error('[campaign-join] lookup error:', campErr.message, 'code:', code)
        } else if (camp) {
          const { error: memberErr } = await db('campaign_members').upsert(
            { campaign_id: camp.id, player_id: user.id, accepted: true, invited_at: new Date().toISOString() },
            { onConflict: 'campaign_id,player_id' }
          )
          if (memberErr) console.error('[campaign-join] member insert error:', memberErr.message)
          const { error: charUpdateErr } = await db('characters')
            .update({ campaign_id: camp.id })
            .eq('id', character.id)
            .eq('player_id', user.id)
          if (charUpdateErr) console.error('[campaign-join] character update error:', charUpdateErr.message)
        } else {
          console.warn('[campaign-join] no campaign found for code:', code)
        }
      }

      router.push('/play/now')
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('[createCharacter]', msg)
      setError(`Something went wrong: ${msg}`)
    }
    setLoading(false)
  }

  // Fix 3: balanced 0.5 across all states for the palette preview hexagram
  const glyphValues = { charming: 0.5, volatile: 0.5, reckless: 0.5, withdrawn: 0.5, guarded: 0.5, present: 0.5 }
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
            <button className="btn-gold-solid w-full py-4 text-sm tracking-widest" onClick={() => go('apikey')}>
              Let&rsquo;s Begin
            </button>
          </div>
        )}

        {/* ── API Key (Step 2) ───────────────────────────── */}
        {screen === 'apikey' && (
          <div className="animate-fade-in space-y-6">
            <div>
              <h2 className="font-cinzel text-lg tracking-wider mb-3" style={{ color: 'var(--text)' }}>
                First, your API key.
              </h2>
              <p className="font-garamond leading-relaxed" style={{ color: 'var(--text-dim)' }}>
                In Character uses Claude AI to learn your character and guide how you play them.
                You&rsquo;ll need your own Anthropic API key &mdash; it takes 2 minutes to get one.
              </p>
            </div>

            <a
              href="https://console.anthropic.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold w-full py-3 text-sm text-center block"
            >
              Get your free API key →
            </a>

            <div>
              <input
                type="password"
                value={apiKey}
                onChange={e => {
                  setApiKey(e.target.value)
                  setError('')
                }}
                className="w-full px-4 py-3 font-mono text-sm"
                placeholder="sk-ant-..."
                autoFocus
              />
              {error && (
                <p className="font-garamond text-sm mt-2" style={{ color: 'var(--red)' }}>{error}</p>
              )}
              <p className="font-garamond text-sm mt-3 leading-relaxed" style={{ color: 'var(--text-faint)' }}>
                Sessions typically cost less than $0.10. Your key is encrypted and stored securely &mdash;
                we cannot see it, and it is never used for anything except your character.
              </p>
            </div>

            <div className="flex gap-3">
              <button className="btn-gold flex-1 py-3" onClick={() => go('start')}>Back</button>
              <button
                className="btn-gold-solid flex-1 py-3 disabled:opacity-40"
                onClick={() => {
                  if (!apiKey.trim().startsWith('sk-ant-')) {
                    setError("That doesn't look right. Anthropic API keys start with sk-ant-")
                    return
                  }
                  go('upload')
                }}
                disabled={!apiKey.trim()}
              >
                Next →
              </button>
            </div>
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
              <button className="btn-gold flex-1 py-3" onClick={() => go('apikey')}>Back</button>
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
                onClick={() => runAnalysis()}>
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

            {/* Character name */}
            <div>
              <p className="label-caps mb-1">Character Name</p>
              <input value={characterName} onChange={e => setCharacterName(e.target.value)} className="w-full px-4 py-2" />
            </div>

            {/* Voice summary — Fix 4: warm white, 16px, regular weight */}
            <div style={{ background: '#1a1008', border: '1px solid var(--gold-faint)', borderLeft: '2px solid var(--accent)', borderRadius: 2, padding: '1rem 1.25rem' }}>
              <p className="label-caps mb-2">Voice Summary</p>
              <p className="font-garamond leading-relaxed" style={{ color: '#f0e6d3', fontSize: 16, fontWeight: 400 }}>
                {analysis.voiceSummary}
              </p>
            </div>

            {/* Character-specific categories — Fix 4: improved contrast */}
            {analysis.characterConfig && (
              <div className="space-y-2">
                <p className="label-caps">Character-specific categories</p>
                {[
                  analysis.characterConfig.dangerous_element_category,
                  analysis.characterConfig.antagonist_category,
                ].map(cat => (
                  <div key={cat.id} style={{ background: '#1a1008', border: '1px solid var(--gold-faint)', borderRadius: 2, padding: '0.75rem 1rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 20, lineHeight: 1, marginTop: 2, flexShrink: 0 }}>{cat.icon}</span>
                    <div>
                      <p className="font-cinzel tracking-wider" style={{ color: '#c9a84c', fontSize: 14, marginBottom: 4 }}>
                        {cat.name}
                      </p>
                      <p className="font-garamond" style={{ color: '#c0b090', fontSize: 14, fontWeight: 400 }}>
                        {cat.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Fix 4: Re-analyze is outline/secondary; Looks Right is primary gold */}
            <div className="flex gap-3">
              <button className="btn-gold py-3" style={{ flex: '0 0 auto', paddingLeft: '1.25rem', paddingRight: '1.25rem', opacity: 0.7 }}
                onClick={() => runAnalysis(true)}>
                Re-analyze
              </button>
              <button className="btn-gold-solid flex-1 py-3" onClick={() => go('color')}>
                Looks right →
              </button>
            </div>
          </div>
        )}

        {/* ── Color scheme ───────────────────────────────── */}
        {screen === 'color' && (
          <div className="animate-fade-in space-y-5">
            <h2 style={{ fontSize: 17, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>Choose your theme</h2>
            <p style={{ fontSize: 13, color: 'var(--text2)' }}>
              Pick the look that suits you. You can change it anytime in Settings.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {COLOR_PRESETS.map(preset => {
                const selected = colorScheme.id === preset.id
                return (
                  <button key={preset.id}
                    onClick={() => {
                      setColorScheme(preset)
                      // Apply theme class immediately
                      const html = document.documentElement
                      COLOR_PRESETS.forEach(p => { if (p.themeClass) html.classList.remove(p.themeClass) })
                      if (preset.themeClass) html.classList.add(preset.themeClass)
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 16,
                      padding: '12px 14px', textAlign: 'left',
                      background: preset.bg, border: selected ? `1.5px solid ${preset.accent}` : '0.5px solid rgba(0,0,0,0.12)',
                      borderRadius: 8, cursor: 'pointer',
                    }}>
                    {/* Mini theme preview */}
                    <div style={{ width: 72, flexShrink: 0, background: preset.surface, borderRadius: 6, padding: '8px 8px', border: '0.5px solid rgba(0,0,0,0.08)' }}>
                      <div style={{ fontSize: 8, fontWeight: 700, color: preset.accent, marginBottom: 4, letterSpacing: '0.04em' }}>IN CHARACTER</div>
                      <div style={{ fontSize: 7, color: preset.text, marginBottom: 5, lineHeight: 1.3 }}>Play him with<br/>the mask up.</div>
                      {[70, 50, 35].map((w, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 2 }}>
                          <div style={{ width: 24, fontSize: 6, color: preset.text2, textAlign: 'right', flexShrink: 0 }}>{['State', 'State', 'State'][i]}</div>
                          <div style={{ flex: 1, height: 2, background: 'rgba(0,0,0,0.08)', borderRadius: 1 }}>
                            <div style={{ width: w + '%', height: '100%', background: i === 0 ? preset.accent : 'rgba(0,0,0,0.15)', borderRadius: 1 }} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: selected ? 600 : 400, color: preset.text, marginBottom: 2 }}>{preset.label}</p>
                      <p style={{ fontSize: 12, color: preset.text2 }}>{preset.desc}</p>
                    </div>
                    {selected && <div style={{ marginLeft: 'auto', width: 18, height: 18, borderRadius: '50%', background: preset.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', flexShrink: 0 }}>✓</div>}
                  </button>
                )
              })}
            </div>
            <div className="flex gap-3">
              <button className="btn-gold flex-1 py-3" onClick={() => go('review')}>Back</button>
              <button className="btn-gold-solid flex-1 py-3" onClick={() => go('palette')}>Choose →</button>
            </div>
          </div>
        )}

                {/* ── Emotion palette ────────────────────────────── */}
        {screen === 'palette' && (
          <div className="animate-fade-in space-y-5">
            <h2 className="font-cinzel text-lg tracking-wider" style={{ color: 'var(--text)' }}>Your emotion palette</h2>
            <p className="font-garamond leading-relaxed" style={{ color: 'var(--text-dim)' }}>
              Six states on your arcane glyph. Claude named them — adjust if needed.
            </p>

            {/* Fix 3: balanced preview glyph, sized to not overflow */}
            <div style={{ display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
              <ArcaneGlyph values={glyphValues} states={emotionPalette} size={240} />
            </div>

            {/* Fix 5: card layout — one card per state, full description wraps */}
            <div className="space-y-2">
              {emotionPalette.map((state, i) => (
                <div key={state.key} className="card-dark p-3 space-y-2">
                  <input
                    value={state.label}
                    onChange={e => setEmotionPalette(prev => prev.map((s, j) => j === i ? { ...s, label: e.target.value } : s))}
                    className="w-full px-3 py-1.5 text-sm font-cinzel"
                    style={{ minHeight: 36 }}
                    placeholder="State name"
                  />
                  <input
                    value={state.desc}
                    onChange={e => setEmotionPalette(prev => prev.map((s, j) => j === i ? { ...s, desc: e.target.value } : s))}
                    className="w-full px-3 py-1.5 text-sm font-garamond"
                    style={{ minHeight: 40, whiteSpace: 'pre-wrap' }}
                    placeholder="Short descriptor — what this looks like in play"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button className="btn-gold flex-1 py-3" onClick={() => go('color')}>Back</button>
              <button className="btn-gold-solid flex-1 py-3" onClick={() => go('campaign')}>Set Palette →</button>
            </div>
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
              <button className="btn-gold flex-1 py-3" onClick={() => go('palette')}>Back</button>
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
