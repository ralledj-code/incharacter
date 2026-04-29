'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import BurgerMenu from '@/components/BurgerMenu'

const THEMES = [
  { id: 'warm',   label: 'Warm' },
  { id: 'dark',   label: 'Dark' },
  { id: 'slate',  label: 'Slate' },
  { id: 'forest', label: 'Forest' },
  { id: 'ink',    label: 'Ink' },
]

function applyTheme(scheme: string) {
  const html = document.documentElement
  html.className = html.className
    .split(' ')
    .filter(c => !c.startsWith('theme-'))
    .join(' ')
  if (scheme && scheme !== 'warm') {
    html.classList.add(`theme-${scheme}`)
  }
}

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [characterName, setCharacterName] = useState('')
  const [characterNote, setCharacterNote] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [colorScheme, setColorScheme] = useState('warm')
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')
  const [testingKey, setTestingKey] = useState(false)
  const [testResult, setTestResult] = useState<'ok' | 'fail' | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [resetting, setResetting] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase.from('profiles') as any)
        .select('character_name, character_note, color_scheme')
        .eq('id', user.id)
        .single()
      if (profile) {
        setCharacterName(profile.character_name || '')
        setCharacterNote(profile.character_note || '')
        setColorScheme(profile.color_scheme || 'warm')
      }
      setLoading(false)
    }
    load()
  }, [router])

  function selectTheme(scheme: string) {
    setColorScheme(scheme)
    applyTheme(scheme)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSavedMsg('')
    try {
      const body: Record<string, string> = {
        character_name: characterName.trim(),
        character_note: characterNote.trim(),
        color_scheme: colorScheme,
      }
      if (apiKey.trim()) body.api_key = apiKey.trim()
      const res = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        setSavedMsg('Saved.')
        setApiKey('')
        applyTheme(colorScheme)
        setTimeout(() => setSavedMsg(''), 2000)
      }
    } catch {}
    setSaving(false)
  }

  async function testApiKey() {
    if (!apiKey.trim()) return
    setTestingKey(true)
    setTestResult(null)
    try {
      const res = await fetch('/api/setup', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: apiKey.trim() }),
      })
      setTestResult(res.ok ? 'ok' : 'fail')
    } catch {
      setTestResult('fail')
    }
    setTestingKey(false)
  }

  async function handleDeleteAccount() {
    setDeleting(true)
    try {
      await fetch('/api/account/delete', { method: 'DELETE' })
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/')
    } catch {}
    setDeleting(false)
  }

  async function handleResetCharacter() {
    setResetting(true)
    try {
      await fetch('/api/player/reset', { method: 'POST' })
      setShowResetConfirm(false)
      router.push('/play')
    } catch {}
    setResetting(false)
  }

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em',
    textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6,
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontSize: 14, color: 'var(--text3)' }}>Loading...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <BurgerMenu loggedIn={true} />

      <div className="page-header">
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Settings</span>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 20px 60px' }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          <div>
            <label style={labelStyle}>Character name</label>
            <input type="text" value={characterName} onChange={e => setCharacterName(e.target.value)} placeholder="Your character's name" />
          </div>

          <div>
            <label style={labelStyle}>Character note</label>
            <textarea
              value={characterNote}
              onChange={e => setCharacterNote(e.target.value)}
              placeholder="A few sentences about who this character is. Used to improve session summaries."
              style={{ minHeight: 100 }}
            />
          </div>

          <div>
            <label style={labelStyle}>Anthropic API key</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="password"
                value={apiKey}
                onChange={e => { setApiKey(e.target.value); setTestResult(null) }}
                placeholder="Leave blank to keep current key"
                style={{ flex: 1 }}
              />
              <button type="button" onClick={testApiKey} disabled={testingKey || !apiKey.trim()}
                className="btn-ghost" style={{ flexShrink: 0, minHeight: 40, padding: '0 12px', fontSize: 12 }}>
                {testingKey ? '...' : 'Test'}
              </button>
            </div>
            {testResult === 'ok' && <p style={{ fontSize: 12, color: 'var(--accent-text)', marginTop: 6 }}>✓ Key works</p>}
            {testResult === 'fail' && <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 6 }}>Key didn&apos;t work — check it and try again.</p>}
          </div>

          <div>
            <label style={labelStyle}>Theme</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {THEMES.map(t => (
                <button key={t.id} type="button" onClick={() => selectTheme(t.id)}
                  style={{
                    padding: '6px 14px', fontSize: 13, borderRadius: 6, cursor: 'pointer',
                    border: `1.5px solid ${colorScheme === t.id ? 'var(--accent)' : 'var(--border2)'}`,
                    background: colorScheme === t.id ? 'var(--accent-faint)' : 'var(--surface)',
                    color: colorScheme === t.id ? 'var(--accent-text)' : 'var(--text2)',
                    fontWeight: colorScheme === t.id ? 500 : 400,
                    minHeight: 36,
                  }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button type="submit" className="btn-primary" disabled={saving || !characterName.trim()} style={{ minWidth: 100 }}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            {savedMsg && <span style={{ fontSize: 13, color: 'var(--accent-text)' }}>✓ {savedMsg}</span>}
          </div>
        </form>

        <div style={{ marginTop: 48, paddingTop: 24, borderTop: '0.5px solid var(--border)' }}>
          <p className="label-caps" style={{ marginBottom: 16 }}>Danger zone</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start' }}>
            <button className="btn-danger" onClick={() => setShowResetConfirm(true)}>
              Reset character
            </button>
            <button className="btn-danger" onClick={() => setShowDeleteConfirm(true)}>
              Delete account
            </button>
          </div>
        </div>
      </div>

      {/* Reset character confirm */}
      {showResetConfirm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border2)', borderRadius: 12, padding: 28, maxWidth: 380, width: '100%' }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 10 }}>Reset character?</p>
            <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 24, lineHeight: 1.5 }}>
              This will delete all your sessions and entries. Your character name, note, and API key will be kept.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-danger" onClick={handleResetCharacter} disabled={resetting} style={{ flex: 1 }}>
                {resetting ? 'Resetting...' : 'Yes, reset'}
              </button>
              <button className="btn-ghost" onClick={() => setShowResetConfirm(false)} style={{ flex: 1 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete account confirm */}
      {showDeleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border2)', borderRadius: 12, padding: 28, maxWidth: 380, width: '100%' }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 10 }}>Delete account?</p>
            <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 24, lineHeight: 1.5 }}>
              This will permanently delete your account, all sessions, and all entries. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-danger" onClick={handleDeleteAccount} disabled={deleting} style={{ flex: 1 }}>
                {deleting ? 'Deleting...' : 'Yes, delete everything'}
              </button>
              <button className="btn-ghost" onClick={() => setShowDeleteConfirm(false)} style={{ flex: 1 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
