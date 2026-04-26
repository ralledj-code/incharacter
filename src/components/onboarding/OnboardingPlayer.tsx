'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { createClient } from '@/lib/supabase/client'
import { GLYPH_STATES as RAW_GLYPH_STATES } from '@/lib/constants'

type PaletteEntry = { key: string; label: string; desc: string }
const GLYPH_STATES: PaletteEntry[] = RAW_GLYPH_STATES.map(s => ({ key: s.key, label: s.label, desc: s.desc }))
import ArcaneGlyph from '@/components/ArcaneGlyph'
import InfoTip from '@/components/InfoTip'

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

interface DossierAnalysis {
  characterName: string
  voiceSummary: string
  trackerNames: { mask: string; dagger: string; bottle: string; wound: string }
  emotionPalette: Array<{ key: string; label: string; desc: string }>
  colorScheme: { primary: string; secondary: string; accent: string }
  openingLine: string
  antagonistName: string
}

// Fix 4: 6 color scheme presets
const COLOR_PRESETS = [
  { id: 'grimoire', label: 'The Grimoire', desc: 'Gold · Amber to Crimson',      primary: '#c9a84c', secondary: '#8a6e2e', accent: '#f0e6d3' },
  { id: 'sanctum',  label: 'The Sanctum',  desc: 'Silver · Ice Blue to Navy',    primary: '#c0c8d8', secondary: '#7a8898', accent: '#e8e8f0' },
  { id: 'wilds',    label: 'The Wilds',    desc: 'Amber · Amber to Forest',      primary: '#c8a45a', secondary: '#887230', accent: '#f0e8d0' },
  { id: 'shadow',   label: 'The Shadow',   desc: 'Purple · Purple to Black',     primary: '#9b7fc8', secondary: '#604a90', accent: '#e0d8f0' },
  { id: 'forge',    label: 'The Forge',    desc: 'Copper · Copper to Crimson',   primary: '#c87840', secondary: '#884820', accent: '#f0dcc8' },
  { id: 'custom',   label: 'Custom',       desc: 'Choose your own accent color', primary: '#c9a84c', secondary: '#8a6e2e', accent: '#f0e6d3' },
]

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 justify-center mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-300"
          style={{
            width: i + 1 === current ? 20 : 6,
            height: 6,
            background: i + 1 <= current ? 'var(--gold)' : 'var(--gold-faint)',
          }}
        />
      ))}
    </div>
  )
}

export default function OnboardingPlayer() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // State accumulated across steps
  const [dossierText, setDossierText] = useState('')
  const [analysis, setAnalysis] = useState<DossierAnalysis | null>(null)
  const [characterName, setCharacterName] = useState('')
  const [trackerNames, setTrackerNames] = useState({ mask: 'The Mask', dagger: 'The Dagger', bottle: 'The Bottle', wound: 'The Wound' })
  const [emotionPalette, setEmotionPalette] = useState<PaletteEntry[]>([...GLYPH_STATES])
  const [colorScheme, setColorScheme] = useState(COLOR_PRESETS[0])
  const [apiKey, setApiKey] = useState('')
  const [portraitUrl] = useState('')
  const [campaignCode, setCampaignCode] = useState('')

  const next = () => setStep(s => Math.min(s + 1, 9) as Step)
  const back = () => setStep(s => Math.max(s - 1, 1) as Step)

  // Step 2: Handle dossier upload — all file types go through the extraction API
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
      if (data.error) {
        setError(data.error)
      } else if (data.text) {
        setDossierText(data.text)
      } else {
        setError("Couldn't read that file. Try copying and pasting your dossier as text in the field below.")
      }
    } catch {
      setError("Couldn't read that file. Try copying and pasting your dossier as text in the field below.")
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

  // Step 3: Analyze dossier with Claude
  async function analyzeDossier() {
    if (!dossierText.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/claude/analyze-dossier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dossierText, apiKey: apiKey || undefined }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setAnalysis(data)
      setCharacterName(data.characterName || '')
      setTrackerNames(data.trackerNames || trackerNames)
      setEmotionPalette(data.emotionPalette || emotionPalette)
      const suggestedScheme = data.colorScheme
      if (suggestedScheme) {
        COLOR_PRESETS[3] = { label: 'From Your Dossier', ...suggestedScheme }
        setColorScheme(COLOR_PRESETS[3])
      }
      next()
    } catch {
      setError('Could not analyze the dossier. Check your API key or try again.')
    }
    setLoading(false)
  }

  // Final step: create character in Supabase
  async function createCharacter() {
    setLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = (t: string) => (supabase.from(t) as any)

      // Create character
      const { data: character, error: charErr } = await db('characters')
        .insert({
          player_id: user.id,
          name: characterName,
          dossier_text: dossierText,
          color_scheme: colorScheme,
          emotion_palette: emotionPalette,
          tracker_config: trackerNames,
          api_key_encrypted: apiKey || null,
          portrait_url: portraitUrl || null,
        })
        .select()
        .single()

      if (charErr) throw charErr

      // Create initial tracker state
      await db('tracker_states').insert({
        character_id: character.id,
        mask: 50,
        dagger: 30,
        bottle: 40,
        wound: 60,
        play_directive: null,
        glyph_states: emotionPalette,
      })

      // Create initial session
      await db('sessions').insert({
        character_id: character.id,
        session_number: 1,
      })

      // Handle campaign join if code provided (CAMP-XXXX-XXXX format)
      if (campaignCode.trim()) {
        const code = campaignCode.trim().toUpperCase()
        const { data: camp } = await db('campaigns').select('id').eq('campaign_code', code).single()
        if (camp) {
          await db('campaign_members').upsert({
            campaign_id: camp.id,
            player_id: user.id,
            accepted: true,
          })
          await db('characters').update({ campaign_id: camp.id }).eq('id', character.id)
        }
      }

      router.push('/play/now')
    } catch {
      setError('Something went wrong creating your character. Try again.')
    }
    setLoading(false)
  }

  const glyphValues = {
    charming:  0.65, volatile:  0.35, reckless:  0.40,
    withdrawn: 0.35, guarded:   0.55, present:   0.40,
  }

  return (
    <main className="min-h-screen bg-bg flex flex-col items-center justify-start px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="font-cinzel text-gold text-2xl tracking-wider">In Character</h1>
        </div>

        <ProgressDots current={step} total={9} />

        {/* Step 1: Role confirmation */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h2 className="font-cinzel text-ink text-lg tracking-wider text-center mb-3">You&rsquo;re a Player.</h2>
            <p className="font-garamond text-ink-dim text-center mb-10 leading-relaxed">
              We&rsquo;ll build your character&rsquo;s psychological profile step by step.
              One question at a time. Takes about five minutes.
            </p>
            <button className="btn-gold-solid w-full py-4 text-sm tracking-widest" onClick={next}>
              Let&rsquo;s Begin
            </button>
          </div>
        )}

        {/* Step 2: Upload dossier */}
        {step === 2 && (
          <div className="animate-fade-in space-y-6">
            <div>
              <h2 className="font-cinzel text-ink text-lg tracking-wider mb-2">Your character&rsquo;s dossier</h2>
              <p className="font-garamond text-ink-dim leading-relaxed mb-4">
                Supports PDF, Word (.docx), and plain text files. Or paste your dossier directly below.
              </p>
              <div
                {...getRootProps()}
                className="card-dark border-dashed p-8 text-center cursor-pointer transition-colors"
                style={{ borderColor: isDragActive ? 'var(--accent)' : 'var(--border)' }}
              >
                <input {...getInputProps()} />
                <p className="font-cinzel text-sm tracking-widest mb-2" style={{ color: 'var(--accent)' }}>
                  {isDragActive ? 'Drop it here' : 'Drop file or click to browse'}
                </p>
                <p className="font-garamond text-sm" style={{ color: 'var(--text-faint)' }}>
                  PDF · Word (.docx) · Text (.txt, .md)
                </p>
                {loading && (
                  <p className="font-garamond text-sm mt-3 animate-pulse" style={{ color: 'var(--accent)' }}>
                    Reading...
                  </p>
                )}
              </div>
            </div>

            <div>
              <p className="label-caps mb-2">Or paste text</p>
              <textarea
                value={dossierText}
                onChange={e => setDossierText(e.target.value)}
                className="w-full p-4 min-h-[200px] text-sm leading-relaxed"
                placeholder="Your character's background, personality, history, voice, relationships..."
              />
            </div>

            {error && <p className="font-garamond text-sm italic" style={{ color: 'var(--red)' }}>{error}</p>}

            <div className="flex gap-3">
              <button className="btn-gold flex-1 py-3" onClick={back}>Back</button>
              <button
                className="btn-gold-solid flex-1 py-3 disabled:opacity-40"
                onClick={() => { setStep(3); analyzeDossier() }}
                disabled={!dossierText.trim() || loading}
              >
                Analyze →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review analysis */}
        {step === 3 && (
          <div className="animate-fade-in space-y-6">
            <h2 className="font-cinzel text-ink text-lg tracking-wider mb-2">Claude&rsquo;s reading of your character</h2>

            {loading ? (
              <div className="space-y-3">
                <div className="h-6 loading-shimmer rounded" />
                <div className="h-4 loading-shimmer rounded w-3/4" />
                <div className="h-4 loading-shimmer rounded w-5/6" />
                <p className="font-garamond text-ink-dim italic text-center animate-pulse mt-4">Consulting the wound...</p>
              </div>
            ) : analysis ? (
              <div className="space-y-5">
                <div>
                  <p className="label-caps mb-1">Character Name</p>
                  <input
                    value={characterName}
                    onChange={e => setCharacterName(e.target.value)}
                    className="w-full px-4 py-2"
                  />
                </div>

                <div className="card-dark card-gold-border p-4">
                  <p className="label-caps mb-2">Voice Summary</p>
                  <p className="font-garamond text-ink-dim italic leading-relaxed">{analysis.voiceSummary}</p>
                </div>

                <div>
                  <p className="label-caps mb-2">Tracker Names</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(trackerNames).map(([key, val]) => (
                      <div key={key}>
                        <p className="text-ink-faint text-xs mb-1 capitalize">{key}</p>
                        <input
                          value={val}
                          onChange={e => setTrackerNames(prev => ({ ...prev, [key]: e.target.value }))}
                          className="w-full px-3 py-2 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="btn-gold flex-1 py-3" onClick={() => setStep(2)}>Re-analyze</button>
                  <button className="btn-gold-solid flex-1 py-3" onClick={next}>Looks right →</button>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Step 4: Color scheme */}
        {step === 4 && (
          <div className="animate-fade-in space-y-6">
            <h2 className="font-cinzel text-ink text-lg tracking-wider mb-2">Choose your color scheme</h2>
            <p className="font-garamond text-ink-dim leading-relaxed mb-4">
              This sets the tone of your character&rsquo;s tracker.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {COLOR_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setColorScheme(preset)
                    document.documentElement.setAttribute('data-scheme', preset.id)
                  }}
                  className="p-4 text-left transition-all"
                  style={{
                    background: 'var(--surface)',
                    border: `1px solid ${(colorScheme as { id?: string }).id === preset.id ? preset.primary : 'var(--border)'}`,
                    borderRadius: 2,
                  }}
                >
                  <div className="flex gap-2 mb-2">
                    {[preset.primary, preset.secondary, preset.accent].map((c, i) => (
                      <div key={i} className="w-4 h-4 rounded-full" style={{ background: c }} />
                    ))}
                  </div>
                  <p className="font-cinzel text-xs tracking-wider mb-0.5" style={{ color: preset.primary }}>
                    {preset.label}
                  </p>
                  <p className="font-garamond text-xs" style={{ color: 'var(--text-faint)' }}>{preset.desc}</p>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button className="btn-gold flex-1 py-3" onClick={back}>Back</button>
              <button className="btn-gold-solid flex-1 py-3" onClick={next}>Choose →</button>
            </div>
          </div>
        )}

        {/* Step 5: Emotion palette */}
        {step === 5 && (
          <div className="animate-fade-in space-y-6">
            <h2 className="font-cinzel text-ink text-lg tracking-wider mb-2">Your emotion palette</h2>
            <p className="font-garamond text-ink-dim leading-relaxed mb-2">
              These six states appear on your arcane glyph. Rename them to fit your character.
            </p>

            <div className="mb-4 flex justify-center">
              <ArcaneGlyph values={glyphValues} states={emotionPalette} size={220} />
            </div>

            <div className="space-y-3">
              {emotionPalette.map((state, i) => (
                <div key={state.key} className="grid grid-cols-2 gap-2">
                  <input
                    value={state.label}
                    onChange={e => setEmotionPalette(prev =>
                      prev.map((s, j) => j === i ? { ...s, label: e.target.value } : s)
                    )}
                    className="px-3 py-2 text-sm font-cinzel"
                    placeholder="State name"
                  />
                  <input
                    value={state.desc}
                    onChange={e => setEmotionPalette(prev =>
                      prev.map((s, j) => j === i ? { ...s, desc: e.target.value } : s)
                    )}
                    className="px-3 py-2 text-sm"
                    placeholder="Short descriptor..."
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button className="btn-gold flex-1 py-3" onClick={back}>Back</button>
              <button className="btn-gold-solid flex-1 py-3" onClick={next}>Set Palette →</button>
            </div>
          </div>
        )}

        {/* Step 6: API Key */}
        {step === 6 && (
          <div className="animate-fade-in space-y-6">
            <div className="flex items-center gap-2">
              <h2 className="font-cinzel text-ink text-lg tracking-wider">Your Anthropic API Key</h2>
              <InfoTip text="This is your personal Anthropic key. Think of it as your tab at the bar — you pay for your own drinks. Sessions cost pennies. Your key is encrypted and never shared." />
            </div>

            <div className="card-dark card-gold-border p-4">
              <p className="font-garamond text-ink-dim leading-relaxed text-sm">
                In Character uses Claude to generate narratives and directives.
                You supply your own Anthropic key — this keeps costs low and your data private.
                Get one at console.anthropic.com. Sessions typically cost less than $0.05.
              </p>
            </div>

            <div>
              <p className="label-caps mb-2">API Key</p>
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                className="w-full px-4 py-3 font-mono text-sm"
                placeholder="sk-ant-..."
              />
            </div>

            <div className="flex gap-3">
              <button className="btn-gold flex-1 py-3" onClick={back}>Back</button>
              <button
                className="btn-gold-solid flex-1 py-3 disabled:opacity-40"
                onClick={next}
                disabled={!apiKey.trim()}
              >
                Save Key →
              </button>
            </div>

            <button
              className="w-full text-center font-garamond text-ink-faint text-sm hover:text-ink-dim transition-colors"
              onClick={next}
            >
              Skip for now (some features won&rsquo;t work)
            </button>
          </div>
        )}

        {/* Step 7: Portrait */}
        {step === 7 && (
          <div className="animate-fade-in space-y-6">
            <h2 className="font-cinzel text-ink text-lg tracking-wider mb-2">Character portrait</h2>
            <p className="font-garamond text-ink-dim leading-relaxed">
              Optional. A square portrait shown in the corner of your Now screen.
            </p>

            {portraitUrl && (
              <div className="flex justify-center">
                <img src={portraitUrl} alt="Portrait" className="w-32 h-32 object-cover rounded" />
              </div>
            )}

            <div className="flex gap-3">
              <button className="btn-gold flex-1 py-3" onClick={back}>Back</button>
              <button className="btn-gold flex-1 py-3" onClick={next}>Skip</button>
              <button className="btn-gold-solid flex-1 py-3" onClick={next}>Continue →</button>
            </div>
          </div>
        )}

        {/* Step 8: Campaign code */}
        {step === 8 && (
          <div className="animate-fade-in space-y-6">
            <h2 className="font-cinzel text-ink text-lg tracking-wider mb-2">Do you have a campaign code?</h2>
            <p className="font-garamond text-ink-dim leading-relaxed">
              If your DM has shared a campaign code (format: CAMP-XXXX-XXXX), enter it here.
              You can skip this and join later from Settings.
            </p>
            <div>
              <p className="label-caps mb-2">Campaign Code (from your DM)</p>
              <input
                value={campaignCode}
                onChange={e => setCampaignCode(e.target.value)}
                className="w-full px-4 py-3 font-mono text-sm"
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              />
            </div>
            {error && <p className="font-garamond text-sm italic" style={{ color: 'var(--red)' }}>{error}</p>}
            <div className="flex gap-3">
              <button className="btn-gold flex-1 py-3" onClick={back}>Back</button>
              <button className="btn-gold flex-1 py-3" onClick={next}>Skip</button>
              <button className="btn-gold-solid flex-1 py-3" onClick={next}>Continue →</button>
            </div>
          </div>
        )}

        {/* Step 9: Welcome */}
        {step === 9 && (
          <div className="animate-fade-in space-y-6 text-center">
            <div className="text-gold text-4xl mb-2">✦</div>
            <h2 className="font-cinzel text-ink text-lg tracking-wider">{characterName || 'Your Character'}</h2>

            {analysis?.openingLine && (
              <div className="card-dark card-gold-border p-6 text-left">
                <p className="font-garamond text-ink italic text-lg leading-relaxed">
                  &ldquo;{analysis.openingLine}&rdquo;
                </p>
              </div>
            )}

            <p className="font-garamond text-ink-dim leading-relaxed">
              Your journey begins. The glyph is set. The directive will come.
            </p>

            {error && <p className="font-garamond text-sm italic" style={{ color: 'var(--red)' }}>{error}</p>}

            <button
              className="btn-gold-solid w-full py-4 text-sm tracking-widest disabled:opacity-40"
              onClick={createCharacter}
              disabled={loading}
            >
              {loading ? 'Creating your character...' : 'Enter →'}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
