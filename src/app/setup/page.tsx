'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SetupPage() {
  const router = useRouter()
  const [characterName, setCharacterName] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'ok' | 'fail' | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function testKey() {
    if (!apiKey.trim()) return
    setTesting(true)
    setTestResult(null)
    try {
      const res = await fetch('/api/setup', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ api_key: apiKey.trim() }) })
      setTestResult(res.ok ? 'ok' : 'fail')
    } catch {
      setTestResult('fail')
    }
    setTesting(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!characterName.trim() || !apiKey.trim()) { setError('Both fields are required.'); return }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ character_name: characterName.trim(), api_key: apiKey.trim() }),
      })
      if (res.ok) {
        router.push('/play')
      } else {
        const data = await res.json()
        setError(data.error || 'Something went wrong.')
      }
    } catch {
      setError('Something went wrong.')
    }
    setSaving(false)
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: 4 }}>In Character</h1>
          <p style={{ fontSize: 14, color: 'var(--text3)' }}>Set up your journal to get started.</p>
        </div>

        <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 12, padding: 28 }}>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6 }}>
                Character name
              </label>
              <input
                type="text"
                value={characterName}
                onChange={e => setCharacterName(e.target.value)}
                placeholder="Who are you playing?"
                autoFocus
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6 }}>
                Anthropic API key
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="password"
                  value={apiKey}
                  onChange={e => { setApiKey(e.target.value); setTestResult(null) }}
                  placeholder="sk-ant-..."
                  style={{ flex: 1 }}
                  required
                />
                <button
                  type="button"
                  onClick={testKey}
                  disabled={testing || !apiKey.trim()}
                  className="btn-ghost"
                  style={{ flexShrink: 0, minHeight: 40, padding: '0 12px', fontSize: 12 }}
                >
                  {testing ? '...' : 'Test'}
                </button>
              </div>
              {testResult === 'ok' && (
                <p style={{ fontSize: 12, color: 'var(--accent-text)', marginTop: 6 }}>✓ Key works</p>
              )}
              {testResult === 'fail' && (
                <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 6 }}>Key didn&apos;t work — check it and try again.</p>
              )}
              <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6, lineHeight: 1.5 }}>
                Your key is encrypted and never returned to the browser. Get one at{' '}
                <a href="https://console.anthropic.com" target="_blank" rel="noreferrer"
                  style={{ color: 'var(--accent-text)', minHeight: 'auto', minWidth: 'auto' }}>
                  console.anthropic.com
                </a>
              </p>
            </div>

            {error && <p style={{ fontSize: 13, color: 'var(--danger)', background: 'var(--danger-faint)', padding: '8px 12px', borderRadius: 6 }}>{error}</p>}

            <button type="submit" disabled={saving || !characterName.trim() || !apiKey.trim()} className="btn-primary" style={{ width: '100%' }}>
              {saving ? 'Saving...' : 'Start journalling'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
