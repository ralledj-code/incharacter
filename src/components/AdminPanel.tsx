'use client'

import { useState } from 'react'
import { ErrorLog, Profile } from '@/types/database'

interface AdminPanelProps {
  errors: ErrorLog[]
  users: Profile[]
}

function ErrorRow({ error }: { error: ErrorLog }) {
  const [expanded, setExpanded] = useState(false)
  const ts = new Date(error.created_at).toLocaleString()
  const isRed = error.error_type !== 'Warning'

  return (
    <div
      className="animate-fade-in cursor-pointer"
      style={{
        borderBottom: '1px solid var(--border)',
        borderLeft: `2px solid ${isRed ? 'var(--red)' : 'var(--gold-dim)'}`,
      }}
      onClick={() => setExpanded(e => !e)}
    >
      <div className="px-4 py-3 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-cinzel text-xs tracking-wider"
                  style={{ color: isRed ? 'var(--red)' : 'var(--gold-dim)' }}>
              {error.error_type || 'Error'}
            </span>
            {error.screen && <span className="label-caps" style={{ color: 'var(--text-faint)' }}>{error.screen}</span>}
            {error.action && <span className="label-caps" style={{ color: 'var(--text-faint)' }}>· {error.action}</span>}
          </div>
          <p className="font-garamond text-sm leading-relaxed line-clamp-1" style={{ color: 'var(--text-dim)' }}>
            {error.error_message || 'Unknown error'}
          </p>
        </div>
        <span className="font-garamond text-xs flex-shrink-0" style={{ color: 'var(--text-faint)' }}>{ts}</span>
      </div>

      {expanded && (
        <div className="px-4 pb-4 animate-fade-in space-y-3">
          {error.stack_trace && (
            <div>
              <p className="label-caps mb-1">Stack Trace</p>
              <pre className="font-mono text-xs p-3 overflow-x-auto"
                   style={{ background: 'var(--surface2)', borderRadius: 2, color: 'var(--text-dim)' }}>
                {error.stack_trace}
              </pre>
            </div>
          )}
          {error.app_state && (
            <div>
              <p className="label-caps mb-1">App State</p>
              <pre className="font-mono text-xs p-3 overflow-x-auto"
                   style={{ background: 'var(--surface2)', borderRadius: 2, color: 'var(--text-dim)' }}>
                {JSON.stringify(error.app_state, null, 2)}
              </pre>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 text-xs">
            {error.user_id && (
              <div>
                <p className="label-caps mb-1">User ID</p>
                <p className="font-mono break-all" style={{ color: 'var(--text-dim)' }}>{error.user_id}</p>
              </div>
            )}
            {error.character_id && (
              <div>
                <p className="label-caps mb-1">Character ID</p>
                <p className="font-mono break-all" style={{ color: 'var(--text-dim)' }}>{error.character_id}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function UserRow({ user, onRoleChange }: { user: Profile; onRoleChange: (id: string, role: string) => void }) {
  const [loading, setLoading] = useState(false)
  const [currentRole, setCurrentRole] = useState<'player' | 'dm' | 'admin'>((user.role as 'player' | 'dm' | 'admin') || 'player')

  async function grantRole(role: string) {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/grant-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, role }),
      })
      if (res.ok) {
        setCurrentRole(role as 'player' | 'dm' | 'admin')
        onRoleChange(user.id, role)
      }
    } catch {}
    setLoading(false)
  }

  const roleColor = currentRole === 'admin'
    ? 'var(--red)'
    : currentRole === 'dm'
    ? 'var(--accent)'
    : 'var(--text-dim)'

  return (
    <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-garamond text-sm" style={{ color: 'var(--text)' }}>
            {user.username || '—'}
          </p>
          <p className="font-mono text-xs break-all" style={{ color: 'var(--text-faint)' }}>{user.id}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="font-cinzel text-xs tracking-wider" style={{ color: roleColor }}>
            {currentRole}
          </span>
          <span className="font-garamond text-xs" style={{ color: 'var(--text-faint)' }}>
            {new Date(user.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Role controls */}
      <div className="flex gap-2 mt-2">
        {(['player', 'dm', 'admin'] as const).map(r => (
          <button
            key={r}
            disabled={loading || currentRole === r}
            onClick={() => grantRole(r)}
            className="font-cinzel text-xs px-2 py-1 transition-all disabled:opacity-30"
            style={{
              border: `1px solid ${r === 'admin' ? 'var(--red)' : r === 'dm' ? 'var(--accent)' : 'var(--border)'}`,
              color: r === 'admin' ? 'var(--red)' : r === 'dm' ? 'var(--accent)' : 'var(--text-faint)',
              background: currentRole === r ? (r === 'admin' ? 'var(--red-dim)' : r === 'dm' ? 'var(--gold-faint)' : 'var(--surface2)') : 'transparent',
              borderRadius: 2,
              minHeight: 28,
            }}
          >
            {loading ? '...' : `→ ${r}`}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function AdminPanel({ errors, users: initialUsers }: AdminPanelProps) {
  const [tab, setTab] = useState<'errors' | 'users'>('errors')
  const [users, setUsers] = useState(initialUsers)

  function handleRoleChange(id: string, role: string) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role: role as Profile['role'] } : u))
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="px-6 py-4 flex items-center justify-between"
           style={{ borderBottom: '1px solid var(--border)' }}>
        <h1 className="font-cinzel text-lg tracking-wider" style={{ color: 'var(--accent)' }}>Admin</h1>
        <a href="/play/now" className="label-caps transition-colors"
           style={{ color: 'var(--text-faint)' }}>
          Back to App
        </a>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="flex px-6 py-0" style={{ borderBottom: '1px solid var(--border)' }}>
          {[
            { id: 'errors' as const, label: `Errors (${errors.length})` },
            { id: 'users' as const, label: `Users (${users.length})` },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="py-3 px-4 font-cinzel text-xs tracking-widest transition-colors"
              style={{
                color: tab === t.id ? 'var(--accent)' : 'var(--text-faint)',
                borderBottom: tab === t.id ? '1px solid var(--accent)' : '1px solid transparent',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'errors' && (
          <div>
            {errors.length === 0 ? (
              <div className="text-center py-16">
                <p className="font-cinzel text-sm tracking-wider" style={{ color: 'var(--text-faint)' }}>
                  No errors logged
                </p>
              </div>
            ) : (
              errors.map(error => <ErrorRow key={error.id} error={error} />)
            )}
          </div>
        )}

        {tab === 'users' && (
          <div>
            <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <p className="font-garamond text-sm" style={{ color: 'var(--text-faint)' }}>
                Use the role buttons to grant or change access. Admin role grants full panel access.
                To re-grant admin after re-signup, set role → admin for your email.
              </p>
            </div>
            {users.map(user => (
              <UserRow key={user.id} user={user} onRoleChange={handleRoleChange} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
