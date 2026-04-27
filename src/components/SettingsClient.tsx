'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import BurgerMenu from './BurgerMenu'

interface SettingsClientProps {
  profile: { player_code?: string; role?: string } | null
  character: { id: string; name: string; dossier_text?: string; color_scheme?: unknown; hasApiKey?: boolean; campaign_id?: string } | null
  campaign?: { id: string; name: string; campaign_code?: string; hasDmApiKey?: boolean } | null
  playerCampaign?: { id: string; name: string; campaign_code?: string } | null
  tracker?: unknown | null
  email?: string
}

const COLOR_SCHEMES = [
  { id: 'warm',   label: 'Warm',   desc: 'Default — warm white, tan accent' },
  { id: 'dark',   label: 'Dark',   desc: 'Near-black, warm gold accent' },
  { id: 'slate',  label: 'Slate',  desc: 'Cool grey, blue accent' },
  { id: 'forest', label: 'Forest', desc: 'Soft green, earthy accent' },
  { id: 'ink',    label: 'Ink',    desc: 'Warm white, deep purple accent' },
]

export default function SettingsClient({ profile, character, campaign, playerCampaign }: SettingsClientProps) {
  const router = useRouter()
  const isDM = profile?.role === 'dm'
  const [copied, setCopied] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [apiKeySaved, setApiKeySaved] = useState(false)
  const [scheme, setScheme] = useState('grimoire')
  const [showDossierModal, setShowDossierModal] = useState(false)
  const [dossierAppend, setDossierAppend] = useState('')
  const [dossierSaving, setDossierSaving] = useState(false)
  const [showDeleteChar, setShowDeleteChar] = useState(false)
  const [showDeleteAccount, setShowDeleteAccount] = useState(false)
  const [showRestartChar, setShowRestartChar] = useState(false)
  const [deleteHolding, setDeleteHolding] = useState(false)
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // FIX 7: campaign join state (player only)
  const [campaignCodeInput, setCampaignCodeInput] = useState('')
  const [campaignJoining, setCampaignJoining] = useState(false)
  const [campaignJoinResult, setCampaignJoinResult] = useState<{ success?: string; error?: string } | null>(null)

  const playerCode = profile?.player_code || 'IC-????-????'
  const campaignCode = campaign?.campaign_code || 'CAMP-????-????'
  const displayCode = isDM ? campaignCode : playerCode

  function copyCode() {
    navigator.clipboard.writeText(displayCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // FIX 7: join campaign from settings
  async function joinCampaign() {
    if (!campaignCodeInput.trim() || !character) return
    setCampaignJoining(true)
    setCampaignJoinResult(null)
    try {
      const code = campaignCodeInput.trim().toUpperCase()
      const supabase = createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = (t: string) => (supabase.from(t) as any)

      const { data: camp, error: campErr } = await db('campaigns')
        .select('id, name').eq('campaign_code', code).limit(1).single()
      if (campErr || !camp) {
        setCampaignJoinResult({ error: 'Campaign not found. Check the code and try again.' })
        setCampaignJoining(false)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      await db('campaign_members').upsert(
        { campaign_id: camp.id, player_id: user.id, accepted: true, invited_at: new Date().toISOString() },
        { onConflict: 'campaign_id,player_id' }
      )
      await db('characters').update({ campaign_id: camp.id }).eq('id', character.id).eq('player_id', user.id)

      setCampaignJoinResult({ success: `Joined ${camp.name}.` })
      setCampaignCodeInput('')
      router.refresh()
    } catch (e) {
      setCampaignJoinResult({ error: e instanceof Error ? e.message : 'Something went wrong.' })
    }
    setCampaignJoining(false)
  }

  async function leaveCampaign() {
    if (!character || !playerCampaign) return
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = (t: string) => (supabase.from(t) as any)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await db('campaign_members').delete().eq('campaign_id', playerCampaign.id).eq('player_id', user.id)
    await db('characters').update({ campaign_id: null }).eq('id', character.id).eq('player_id', user.id)
    router.refresh()
  }

  async function saveApiKey() {
    if (!apiKey.trim()) return
    // Key is encrypted server-side — never write plaintext to DB from client
    if (isDM && campaign) {
      // DM API key stored on campaigns table
      await fetch('/api/dm/update-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: campaign.id, apiKey: apiKey.trim() }),
      })
    } else if (character) {
      const res = await fetch('/api/character/update-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId: character.id, apiKey: apiKey.trim() }),
      })
      if (!res.ok) return
    }
    setApiKey('')
    setApiKeySaved(true)
    setTimeout(() => setApiKeySaved(false), 2000)
  }

  async function applyScheme(id: string) {
    setScheme(id)
    // Apply theme class immediately
    const THEME_MAP: Record<string, string> = { dark:'theme-dark', slate:'theme-slate', forest:'theme-forest', ink:'theme-ink' }
    const html = document.documentElement
    Object.values(THEME_MAP).forEach(cls => html.classList.remove(cls))
    if (THEME_MAP[id]) html.classList.add(THEME_MAP[id])

    // Save to profiles.color_scheme (string, read by ThemeApplier)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('profiles') as any)
        .update({ color_scheme: id })
        .eq('id', user.id)
    }
  }

  async function appendDossier() {
    if (!character || !dossierAppend.trim()) return
    setDossierSaving(true)
    const supabase = createClient()
    const existing = character.dossier_text || ''
    const timestamp = new Date().toISOString().split('T')[0]
    const appended = `${existing}\n\n--- Update ${timestamp} ---\n${dossierAppend.trim()}`
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('characters') as any)
      .update({ dossier_text: appended, updated_at: new Date().toISOString() })
      .eq('id', character.id)
    setDossierAppend('')
    setShowDossierModal(false)
    setDossierSaving(false)
    router.refresh()
  }

  async function deleteCharacter() {
    if (!character) return
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = (t: string) => (supabase.from(t) as any)
    await db('characters').delete().eq('id', character.id)
    router.push('/onboarding?role=player')
  }

  async function deleteAccount() {
    const res = await fetch('/api/account/delete', { method: 'DELETE' })
    if (res.ok) {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/')
    }
  }

  async function restartCharacter() {
    const res = await fetch('/api/character/restart', { method: 'DELETE' })
    if (res.ok) router.push('/onboarding?role=player')
  }

  function startHoldDelete(action: () => void) {
    holdTimer.current = setTimeout(() => {
      action()
    }, 2000)
    setDeleteHolding(true)
  }

  function cancelHoldDelete() {
    if (holdTimer.current) clearTimeout(holdTimer.current)
    setDeleteHolding(false)
  }

  return (
    <div className="min-h-screen animate-page" style={{ background: 'var(--bg)' }}>
      <BurgerMenu loggedIn={true} role={profile?.role as 'player' | 'dm' | null} />

      <main className="max-w-lg mx-auto px-6 py-16">
        <h1 className="font-cinzel text-2xl tracking-wider mb-10"
            style={{ color: 'var(--accent)' }}>Settings</h1>

        {/* Fix 7: DMs see campaign code, players see player code */}
        <section className="mb-10">
          <p className="label-caps mb-3">{isDM ? 'Campaign Code' : 'Your Player Code'}</p>
          <button
            onClick={copyCode}
            className="w-full card-dark p-6 text-left flex items-center justify-between"
            style={{ minHeight: 72 }}
          >
            <span className="font-cinzel text-2xl tracking-widest" style={{ color: 'var(--accent)' }}>
              {displayCode}
            </span>
            <span className="label-caps ml-4 flex-shrink-0" style={{ color: copied ? 'var(--accent)' : 'var(--text-faint)' }}>
              {copied ? 'Copied!' : 'Copy'}
            </span>
          </button>
          <p className="font-garamond text-sm mt-2" style={{ color: 'var(--text-faint)' }}>
            {isDM
              ? 'Share this code with your players. They enter it during onboarding or in Settings.'
              : 'Share this code with your DM to join their campaign.'}
          </p>
        </section>

        {isDM && campaign && (
          <section className="mb-10">
            <p className="label-caps mb-3">Campaign</p>
            <div className="card-dark p-4">
              <p className="font-cinzel text-sm tracking-wider" style={{ color: 'var(--text)' }}>
                {campaign.name}
              </p>
            </div>
          </section>
        )}

        {/* Fix 8: API Key — shown for both players and DMs */}
        {(character || isDM) && (
          <section className="mb-10">
            <p className="label-caps mb-3">Anthropic API Key</p>
            <div className="card-dark p-4 space-y-3">
              <p className="font-garamond text-sm" style={{ color: 'var(--text-dim)' }}>
                {isDM
                  ? (campaign?.hasDmApiKey ? 'Key stored. Update below.' : 'No key stored. Required for Pre-Session Brief.')
                  : (character?.hasApiKey ? 'Key stored. Update below.' : 'No key stored.')}
              </p>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="sk-ant-..."
                  className="flex-1 px-3 py-2 font-mono text-sm"
                />
                <button onClick={saveApiKey} className="btn-gold px-4 text-xs">
                  {apiKeySaved ? 'Saved!' : 'Save'}
                </button>
              </div>
              <p className="font-garamond text-xs" style={{ color: 'var(--text-faint)' }}>
                Your Anthropic API key. Sessions cost less than $0.10. Never shared with anyone.
              </p>
            </div>
          </section>
        )}

        {/* Color Scheme */}
        <section className="mb-10">
          <p className="label-caps mb-3">Color Scheme</p>
          <div className="space-y-2">
            {COLOR_SCHEMES.map(s => (
              <button
                key={s.id}
                onClick={() => applyScheme(s.id)}
                className="w-full card-dark p-4 text-left flex items-center justify-between transition-all"
                style={{
                  borderColor: scheme === s.id ? 'var(--accent)' : 'var(--border)',
                  minHeight: 56,
                }}
              >
                <div>
                  <p className="font-cinzel text-xs tracking-wider" style={{ color: scheme === s.id ? 'var(--accent)' : 'var(--text)' }}>
                    {s.label}
                  </p>
                  <p className="font-garamond text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
                    {s.desc}
                  </p>
                </div>
                {scheme === s.id && (
                  <span style={{ color: 'var(--accent)', fontSize: 16 }}>✦</span>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Character / Dossier */}
        {character && (
          <section className="mb-10">
            <p className="label-caps mb-3">Character</p>
            <div className="card-dark p-4">
              <p className="font-cinzel text-sm tracking-wider mb-3" style={{ color: 'var(--text)' }}>
                {character.name}
              </p>
              <p className="font-garamond text-sm mb-4" style={{ color: 'var(--text-dim)' }}>
                {character.dossier_text
                  ? character.dossier_text.slice(0, 200) + (character.dossier_text.length > 200 ? '...' : '')
                  : 'No dossier uploaded.'}
              </p>
              <button onClick={() => setShowDossierModal(true)} className="btn-gold px-4 py-2 text-xs">
                Update Dossier
              </button>
            </div>
          </section>
        )}

        {/* FIX 7: Campaign section for players */}
        {!isDM && (
          <section className="mb-10">
            <p className="label-caps mb-3">Campaign</p>
            {playerCampaign ? (
              <div className="card-dark p-4 space-y-3">
                <p className="font-garamond text-sm font-semibold" style={{ color: 'var(--text)' }}>
                  {playerCampaign.name}
                </p>
                {playerCampaign.campaign_code && (
                  <p className="font-mono text-sm" style={{ color: 'var(--text2)' }}>
                    {playerCampaign.campaign_code}
                  </p>
                )}
                <button className="btn-danger text-xs" onClick={leaveCampaign}>
                  Leave campaign
                </button>
              </div>
            ) : (
              <div className="card-dark p-4 space-y-3">
                <p className="font-garamond text-sm" style={{ color: 'var(--text2)' }}>
                  Enter a campaign code from your DM to join their campaign.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={campaignCodeInput}
                    onChange={e => { setCampaignCodeInput(e.target.value); setCampaignJoinResult(null) }}
                    placeholder="CAMP-XXXX-XXXX"
                    className="flex-1 px-3 py-2 font-mono text-sm"
                  />
                  <button
                    className="btn-primary text-xs px-4"
                    onClick={joinCampaign}
                    disabled={campaignJoining || !campaignCodeInput.trim()}
                  >
                    {campaignJoining ? '...' : 'Join'}
                  </button>
                </div>
                {campaignJoinResult?.error && (
                  <p className="font-garamond text-sm" style={{ color: 'var(--danger)' }}>{campaignJoinResult.error}</p>
                )}
                {campaignJoinResult?.success && (
                  <p className="font-garamond text-sm" style={{ color: 'var(--accent-text)' }}>✓ {campaignJoinResult.success}</p>
                )}
              </div>
            )}
          </section>
        )}

        {/* Export */}
        <section className="mb-10">
          <p className="label-caps mb-3">Export</p>
          <div className="card-dark p-4">
            <p className="font-garamond text-sm mb-4" style={{ color: 'var(--text-dim)' }}>
              Download your full character journey as a PDF — all sessions, events, clues, and relationships.
            </p>
            <a href="/api/export-pdf" className="btn-gold px-4 py-2 text-xs inline-block">
              Download Journey PDF
            </a>
          </div>
        </section>

        {/* Danger Zone */}
        <section>
          <p className="label-caps mb-3" style={{ color: 'var(--red)' }}>Danger Zone</p>
          <div className="space-y-3">
            {character && (
              <>
                <button
                  onClick={() => setShowRestartChar(true)}
                  className="w-full card-dark p-4 text-left font-cinzel text-xs tracking-wider transition-colors"
                  style={{ color: 'var(--red)', borderColor: 'var(--red-dim)', minHeight: 56 }}
                >
                  Restart Character
                </button>
                <button
                  onClick={() => setShowDeleteChar(true)}
                  className="w-full card-dark p-4 text-left font-cinzel text-xs tracking-wider transition-colors"
                  style={{ color: 'var(--red)', borderColor: 'var(--red-dim)', minHeight: 56 }}
                >
                  Delete Character
                </button>
              </>
            )}
            <button
              onClick={() => setShowDeleteAccount(true)}
              className="w-full card-dark p-4 text-left font-cinzel text-xs tracking-wider"
              style={{ color: 'var(--red)', borderColor: 'var(--red-dim)', minHeight: 56 }}
            >
              Delete Account
            </button>
          </div>
        </section>
      </main>

      {/* Dossier modal */}
      {showDossierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6"
             style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="w-full max-w-md card-dark p-6 animate-fade-in">
            <h2 className="font-cinzel text-sm tracking-wider mb-4" style={{ color: 'var(--text)' }}>
              Update Dossier
            </h2>
            <p className="font-garamond text-sm mb-4" style={{ color: 'var(--text-dim)' }}>
              Add new information. This appends to your existing dossier — previous text is preserved.
            </p>
            <textarea
              value={dossierAppend}
              onChange={e => setDossierAppend(e.target.value)}
              className="w-full px-4 py-3 min-h-[160px] mb-4"
              placeholder="New revelations, backstory updates, relationships discovered..."
            />
            <div className="flex gap-3">
              <button onClick={() => setShowDossierModal(false)} className="btn-gold flex-1 py-3 text-xs">Cancel</button>
              <button onClick={appendDossier} disabled={dossierSaving || !dossierAppend.trim()}
                      className="btn-gold-solid flex-1 py-3 text-xs disabled:opacity-40">
                {dossierSaving ? 'Saving...' : 'Append →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restart character confirmation */}
      {showRestartChar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6"
             style={{ background: 'rgba(0,0,0,0.92)' }}>
          <div className="w-full max-w-sm card-dark p-6 animate-fade-in" style={{ borderColor: 'var(--red-dim)' }}>
            <h2 className="font-cinzel text-sm tracking-wider mb-4" style={{ color: 'var(--red)' }}>Restart Character</h2>
            <p className="font-garamond mb-6" style={{ color: 'var(--text-dim)' }}>
              This will delete everything &mdash; every session, every event, every clue.
              Your account stays but your character starts over. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowRestartChar(false)} className="btn-gold flex-1 py-3 text-xs">Cancel</button>
              <button
                onPointerDown={() => startHoldDelete(restartCharacter)}
                onPointerUp={cancelHoldDelete}
                onPointerLeave={cancelHoldDelete}
                className="flex-1 py-3 font-cinzel text-xs tracking-wider transition-all"
                style={{
                  background: deleteHolding ? 'var(--red)' : 'transparent',
                  border: '1px solid var(--red)',
                  color: deleteHolding ? '#fff' : 'var(--red)',
                  borderRadius: 2, minHeight: 44,
                }}
              >
                {deleteHolding ? 'Hold...' : 'Hold to Restart'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete character confirmation */}
      {showDeleteChar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6"
             style={{ background: 'rgba(0,0,0,0.92)' }}>
          <div className="w-full max-w-sm card-dark p-6 animate-fade-in" style={{ borderColor: 'var(--red-dim)' }}>
            <h2 className="font-cinzel text-sm tracking-wider mb-4" style={{ color: 'var(--red)' }}>Delete Character</h2>
            <p className="font-garamond mb-6" style={{ color: 'var(--text-dim)' }}>
              This cannot be undone. Everything logged, every moment, every clue &mdash; gone.
              Your email stays. Your character doesn&rsquo;t.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteChar(false)} className="btn-gold flex-1 py-3 text-xs">Cancel</button>
              <button
                onPointerDown={() => startHoldDelete(deleteCharacter)}
                onPointerUp={cancelHoldDelete}
                onPointerLeave={cancelHoldDelete}
                className="flex-1 py-3 font-cinzel text-xs tracking-wider transition-all"
                style={{
                  background: deleteHolding ? 'var(--red)' : 'transparent',
                  border: '1px solid var(--red)',
                  color: deleteHolding ? '#fff' : 'var(--red)',
                  borderRadius: 2,
                  minHeight: 44,
                }}
              >
                {deleteHolding ? 'Hold...' : 'Hold to Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete account confirmation */}
      {showDeleteAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6"
             style={{ background: 'rgba(0,0,0,0.92)' }}>
          <div className="w-full max-w-sm card-dark p-6 animate-fade-in" style={{ borderColor: 'var(--red-dim)' }}>
            <h2 className="font-cinzel text-sm tracking-wider mb-4" style={{ color: 'var(--red)' }}>Delete Account</h2>
            <p className="font-garamond mb-6" style={{ color: 'var(--text-dim)' }}>
              This deletes your profile, player code, and all character data permanently.
              A magic link to this email will create a fresh account.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteAccount(false)} className="btn-gold flex-1 py-3 text-xs">Cancel</button>
              <button
                onPointerDown={() => startHoldDelete(deleteAccount)}
                onPointerUp={cancelHoldDelete}
                onPointerLeave={cancelHoldDelete}
                className="flex-1 py-3 font-cinzel text-xs tracking-wider transition-all"
                style={{
                  background: deleteHolding ? 'var(--red)' : 'transparent',
                  border: '1px solid var(--red)',
                  color: deleteHolding ? '#fff' : 'var(--red)',
                  borderRadius: 2,
                  minHeight: 44,
                }}
              >
                {deleteHolding ? 'Hold...' : 'Hold to Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
