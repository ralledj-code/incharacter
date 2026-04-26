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
            <span
              className="font-cinzel text-xs tracking-wider"
              style={{ color: isRed ? 'var(--red)' : 'var(--gold-dim)' }}
            >
              {error.error_type || 'Error'}
            </span>
            {error.screen && (
              <span className="label-caps text-ink-faint">{error.screen}</span>
            )}
            {error.action && (
              <span className="label-caps text-ink-faint">· {error.action}</span>
            )}
          </div>
          <p className="font-garamond text-ink-dim text-sm leading-relaxed line-clamp-1">
            {error.error_message || 'Unknown error'}
          </p>
        </div>
        <span className="font-garamond text-ink-faint text-xs flex-shrink-0">{ts}</span>
      </div>

      {expanded && (
        <div className="px-4 pb-4 animate-fade-in space-y-3">
          {error.stack_trace && (
            <div>
              <p className="label-caps mb-1">Stack Trace</p>
              <pre
                className="font-mono text-xs p-3 overflow-x-auto"
                style={{ background: 'var(--surface2)', borderRadius: 2, color: 'var(--text-dim)' }}
              >
                {error.stack_trace}
              </pre>
            </div>
          )}
          {error.app_state && (
            <div>
              <p className="label-caps mb-1">App State</p>
              <pre
                className="font-mono text-xs p-3 overflow-x-auto"
                style={{ background: 'var(--surface2)', borderRadius: 2, color: 'var(--text-dim)' }}
              >
                {JSON.stringify(error.app_state, null, 2)}
              </pre>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 text-xs">
            {error.user_id && (
              <div>
                <p className="label-caps mb-1">User ID</p>
                <p className="font-mono text-ink-dim break-all">{error.user_id}</p>
              </div>
            )}
            {error.character_id && (
              <div>
                <p className="label-caps mb-1">Character ID</p>
                <p className="font-mono text-ink-dim break-all">{error.character_id}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function UserRow({ user }: { user: Profile }) {
  return (
    <div
      className="px-4 py-3 flex items-center justify-between"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <div>
        <p className="font-garamond text-ink text-sm">{user.username || '—'}</p>
        <p className="font-mono text-ink-faint text-xs">{user.id}</p>
      </div>
      <div className="flex items-center gap-3">
        <span
          className="font-cinzel text-xs tracking-wider"
          style={{ color: user.role === 'admin' ? 'var(--red)' : user.role === 'dm' ? 'var(--gold)' : 'var(--text-dim)' }}
        >
          {user.role || 'player'}
        </span>
        <span className="font-garamond text-ink-faint text-xs">
          {new Date(user.created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  )
}

export default function AdminPanel({ errors, users }: AdminPanelProps) {
  const [tab, setTab] = useState<'errors' | 'users'>('errors')

  return (
    <div className="min-h-screen bg-bg">
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <h1 className="font-cinzel text-gold text-lg tracking-wider">Admin</h1>
        <a href="/play/now" className="label-caps text-ink-faint hover:text-ink-dim transition-colors">
          Back to App
        </a>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Tab bar */}
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
                color: tab === t.id ? 'var(--gold)' : 'var(--text-faint)',
                borderBottom: tab === t.id ? '1px solid var(--gold)' : '1px solid transparent',
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
                <p className="font-cinzel text-ink-faint text-sm tracking-wider">No errors logged</p>
              </div>
            ) : (
              errors.map(error => <ErrorRow key={error.id} error={error} />)
            )}
          </div>
        )}

        {tab === 'users' && (
          <div>
            {users.map(user => <UserRow key={user.id} user={user} />)}
          </div>
        )}
      </div>
    </div>
  )
}
