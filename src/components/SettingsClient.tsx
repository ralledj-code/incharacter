'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import BurgerMenu from './BurgerMenu'

interface SettingsClientProps {
  profile: { player_code?: string; role?: string } | null
  character: { id: string; name: string; dossier_text?: string; api_key_encrypted?: string; color_scheme?: unknown } | null
  tracker: unknown | null
  email?: string
}

const COLOR_SCHEMES = [
  { id: 'grimoire', label: 'The Grimoire', desc: 'Gold · Amber to Crimson' },
  { id: 'sanctum',  label: 'The Sanctum',  desc: 'Silver · Ice Blue to Navy' },
  { id: 'wilds',    label: 'The Wilds',    desc: 'Amber · Amber to Forest' },
  { id: 'shadow',   label: 'The Shadow',   desc: 'Purple · Purple to Black' },
  { id: 'forge',    label: 'The Forge',    desc: 'Copper · Copper to Crimson' },
]

export default function SettingsClient({ profile, character }: SettingsClientProps) {
  const router = useRouter()
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

  const playerCode = profile?.player_code || 'IC-????-????'

  function copyCode() {
    navigator.clipboard.writeText(playerCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function saveApiKey() {
    if (!character || !apiKey.trim()) return
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('characters') as any)
      .update({ api_key_encrypted: apiKey.trim() })
      .eq('id', character.id)
    setApiKey('')
    setApiKeySaved(true)
    setTimeout(() => setApiKeySaved(false), 2000)
  }

  function applyScheme(id: string) {
    setScheme(id)
    document.documentElement.setAttribute('data-scheme', id)
    if (character) {
      const supabase = createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(supabase.from('characters') as any)
        .update({ color_scheme: { scheme: id } })
        .eq('id', character.id)
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

        {/* Player Code */}
        <section className="mb-10">
          <p className="label-caps mb-3">Your Player Code</p>
          <button
            onClick={copyCode}
            className="w-full card-dark p-6 text-left flex items-center justify-between"
            style={{ minHeight: 72 }}
          >
            <span className="font-cinzel text-2xl tracking-widest" style={{ color: 'var(--accent)' }}>
              {playerCode}
            </span>
            <span className="label-caps ml-4 flex-shrink-0" style={{ color: copied ? 'var(--accent)' : 'var(--text-faint)' }}>
              {copied ? 'Copied!' : 'Copy'}
            </span>
          </button>
          <p className="font-garamond text-sm mt-2" style={{ color: 'var(--text-faint)' }}>
            Share this code with your DM to join their campaign.
          </p>
        </section>

        {/* API Key */}
        {character && (
          <section className="mb-10">
            <p className="label-caps mb-3">Anthropic API Key</p>
            <div className="card-dark p-4 space-y-3">
              <p className="font-garamond text-sm" style={{ color: 'var(--text-dim)' }}>
                {character.api_key_encrypted ? 'Key stored. Update below.' : 'No key stored.'}
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
