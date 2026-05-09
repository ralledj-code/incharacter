'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import BurgerMenu from '@/components/BurgerMenu'
import { createClient } from '@/lib/supabase/client'
import SessionFeedback from '@/components/SessionFeedback'
import type { Entry, SessionWithEntries, FeedbackData } from '@/types/database'

type Tab = 'current' | 'past'

interface PlayAppProps {
  characterName: string
  campaignName: string | null
  activeSession: SessionWithEntries | null
  pastSessions: SessionWithEntries[]
  dmEmail: string | null
}

function formatTime(iso: string | null | undefined) {
  if (!iso) return ''
  const d = new Date(iso)
  return isNaN(d.getTime()) ? 'Unknown' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return ''
  const d = new Date(iso)
  return isNaN(d.getTime()) ? 'Unknown' : d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

function EntryCard({
  entry,
  onPin,
  onEdit,
  onDelete,
  isEditing,
  editText,
  onEditChange,
  onEditSave,
  onEditCancel,
  highlight,
  readOnly = false,
}: {
  entry: Entry
  onPin: () => void
  onEdit: () => void
  onDelete: () => void
  isEditing: boolean
  editText: string
  onEditChange: (v: string) => void
  onEditSave: () => void
  onEditCancel: () => void
  highlight?: boolean
  readOnly?: boolean
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  useEffect(() => { if (isEditing) textareaRef.current?.focus() }, [isEditing])

  return (
    <div className="card" style={{
      padding: '11px 14px',
      borderLeft: highlight ? '2px solid var(--accent)' : undefined,
    }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        {/* Icon + category */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 36, paddingTop: 2 }}>
          <span style={{ fontSize: 20, lineHeight: 1 }}>{entry.icon || '📝'}</span>
          <span className="label-caps" style={{ fontSize: 9, textAlign: 'center', lineHeight: 1.2 }}>
            {entry.category || 'Note'}
          </span>
        </div>

        {/* Text / edit area */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <textarea
                ref={textareaRef}
                value={editText}
                onChange={e => onEditChange(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) onEditSave()
                  if (e.key === 'Escape') onEditCancel()
                }}
                style={{ fontSize: 14, lineHeight: 1.5, minHeight: 72, resize: 'none' }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={onEditSave} className="btn-primary" style={{ fontSize: 12, minHeight: 30, padding: '4px 12px' }}>Save</button>
                <button onClick={onEditCancel} className="btn-ghost" style={{ fontSize: 12, minHeight: 30, padding: '4px 12px' }}>Cancel</button>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.55, wordBreak: 'break-word' }}>{entry.text ?? ''}</p>
          )}
        </div>

        {/* Actions */}
        {!isEditing && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>{formatTime(entry.created_at)}</span>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button onClick={onPin} title={entry.pinned ? 'Unpin' : 'Pin'}
                style={{ fontSize: 15, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: 2, color: entry.pinned ? 'var(--accent)' : 'var(--text3)', lineHeight: 1 }}>
                {entry.pinned ? '★' : '☆'}
              </button>
              {!readOnly && (
                <button onClick={onEdit}
                  style={{ fontSize: 11, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: 2, color: 'var(--text3)' }}>
                  Edit
                </button>
              )}
              <button onClick={onDelete}
                style={{ fontSize: 11, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: 2, color: 'var(--danger)' }}>
                Del
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function PlayApp({ characterName, campaignName: initCampaignName, activeSession: initActive, pastSessions: initPast, dmEmail: initDmEmail }: PlayAppProps) {
  const [tab, setTab] = useState<Tab>('current')
  const [activeSession, setActiveSession] = useState<SessionWithEntries | null>(initActive)
  const [pastSessions, setPastSessions] = useState<SessionWithEntries[]>(initPast)
  const [campaignName, setCampaignName] = useState<string | null>(initCampaignName)
  const [dmEmail, setDmEmail] = useState<string | null>(initDmEmail)

  // Start session
  const [showStartModal, setShowStartModal] = useState(false)
  const [newCampaignName, setNewCampaignName] = useState('')
  const [startingSession, setStartingSession] = useState(false)

  // Add entry
  const [showAddEntry, setShowAddEntry] = useState(false)
  const [newEntryText, setNewEntryText] = useState('')
  const [savingEntry, setSavingEntry] = useState(false)

  // End session
  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const [endingSession, setEndingSession] = useState(false)

  // Feedback flow
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackSession, setFeedbackSession] = useState<SessionWithEntries | null>(null)
  const [sendingFeedback, setSendingFeedback] = useState(false)

  // Edit entry
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  // Past sessions
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const addEntryRef = useRef<HTMLTextAreaElement>(null)
  useEffect(() => { if (showAddEntry) addEntryRef.current?.focus() }, [showAddEntry])

  // Fetch sessions client-side after confirming auth session is live
  async function fetchSessions() {
    const res = await fetch('/api/sessions')
    if (!res.ok) return
    const data = await res.json()
    if (data.activeSession !== undefined) setActiveSession(data.activeSession)
    if (data.pastSessions) setPastSessions(data.pastSessions)
    if (data.dmEmail !== undefined) setDmEmail(data.dmEmail)
    if (data.campaignName) setCampaignName(data.campaignName)
  }

  useEffect(() => {
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) fetchSessions()
    })
    return () => subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sort current entries: pinned first, then newest
  const sortedEntries = useMemo(() => {
    if (!activeSession) return []
    return [...activeSession.entries].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [activeSession])

  // Filter past sessions by search
  const filteredPast = useMemo(() => {
    if (!searchQuery.trim()) return pastSessions
    const q = searchQuery.toLowerCase()
    return pastSessions.filter(s =>
      s.title?.toLowerCase().includes(q) ||
      s.character_name?.toLowerCase().includes(q) ||
      s.entries.some(e => (e.text ?? '').toLowerCase().includes(q))
    )
  }, [pastSessions, searchQuery])

  // --- Handlers ---

  async function handleStartSession() {
    setStartingSession(true)
    try {
      let name = campaignName
      // First time: save campaign name to profile, then use it for all future sessions
      if (!name && newCampaignName.trim()) {
        name = newCampaignName.trim()
        await fetch('/api/setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ campaign_name: name }),
        })
        setCampaignName(name)
      }
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: name, character_name: characterName }),
      })
      const data = await res.json()
      setActiveSession({ ...data.session, entries: [] })
      setShowStartModal(false)
      setNewCampaignName('')
    } catch {}
    setStartingSession(false)
  }

  async function handleSaveEntry() {
    if (!activeSession || !newEntryText.trim()) return
    setSavingEntry(true)
    const text = newEntryText.trim()
    try {
      // 1. POST to /api/entries — waits for INSERT to complete and returns the real id
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: activeSession.id, text }),
      })
      const { id: entryId } = await res.json()
      if (!entryId) return

      const entry: Entry = {
        id: entryId,
        session_id: activeSession.id,
        player_id: '',
        text,
        icon: null,
        category: null,
        pinned: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setActiveSession(prev => prev ? { ...prev, entries: [...prev.entries, entry] } : null)
      setShowAddEntry(false)
      setNewEntryText('')

      // 2. Categorise only after we have the real id — never fires with undefined
      fetch('/api/claude/categorise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId, text, characterName }),
      })
        .then(r => r.json())
        .then(result => {
          setActiveSession(prev => prev ? {
            ...prev,
            entries: prev.entries.map(e => e.id === entryId
              ? { ...e, icon: result.icon || '📝', category: result.category || 'Note' }
              : e
            ),
          } : null)
        })
        .catch(() => {})
    } catch {}
    setSavingEntry(false)
  }

  async function handleEndSession() {
    if (!activeSession) return
    setEndingSession(true)
    try {
      const sumRes = await fetch('/api/claude/summarise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: activeSession.id }),
      })
      const sumData = await sumRes.json()
      const summary = sumData.summary || ''

      const endRes = await fetch(`/api/sessions/${activeSession.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ended_at: new Date().toISOString(), summary }),
      })
      const endData = await endRes.json()

      const ended: SessionWithEntries = { ...activeSession, ended_at: endData.session?.ended_at || new Date().toISOString(), summary, feedback: null }
      setPastSessions(prev => [ended, ...prev])
      setActiveSession(null)
      setShowEndConfirm(false)

      if (dmEmail) {
        setFeedbackSession(ended)
        setShowFeedback(true)
      } else {
        setTab('past')
        setExpandedId(ended.id)
      }
    } catch {}
    setEndingSession(false)
  }

  async function handleFeedbackSubmit(feedback: FeedbackData) {
    if (!feedbackSession) return
    setSendingFeedback(true)
    try {
      await fetch(`/api/sessions/${feedbackSession.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback }),
      })
      await fetch('/api/session/feedback-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: feedbackSession.id }),
      })
    } catch {}
    setSendingFeedback(false)
    setShowFeedback(false)
    const sid = feedbackSession.id
    setFeedbackSession(null)
    setTab('past')
    setExpandedId(sid)
  }

  function handleFeedbackSkip() {
    if (!feedbackSession) return
    const sid = feedbackSession.id
    setShowFeedback(false)
    setFeedbackSession(null)
    setTab('past')
    setExpandedId(sid)
  }

  async function handleTogglePin(entry: Entry, sessionId: string, isPast: boolean) {
    const pinned = !entry.pinned
    const update = (sessions: SessionWithEntries[]) =>
      sessions.map(s => s.id === sessionId ? { ...s, entries: s.entries.map(e => e.id === entry.id ? { ...e, pinned } : e) } : s)
    if (isPast) setPastSessions(update)
    else setActiveSession(prev => prev ? { ...prev, entries: prev.entries.map(e => e.id === entry.id ? { ...e, pinned } : e) } : null)
    await fetch(`/api/entries/${entry.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pinned }) })
  }

  function startEdit(entry: Entry) {
    setEditingId(entry.id)
    setEditText(entry.text ?? '')
  }

  async function saveEdit(entry: Entry, sessionId: string, isPast: boolean) {
    if (!editText.trim()) { setEditingId(null); return }
    const text = editText.trim()
    const update = (sessions: SessionWithEntries[]) =>
      sessions.map(s => s.id === sessionId ? { ...s, entries: s.entries.map(e => e.id === entry.id ? { ...e, text } : e) } : s)
    if (isPast) setPastSessions(update)
    else setActiveSession(prev => prev ? { ...prev, entries: prev.entries.map(e => e.id === entry.id ? { ...e, text } : e) } : null)
    setEditingId(null)
    await fetch(`/api/entries/${entry.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) })
  }

  async function deleteEntry(entry: Entry, sessionId: string, isPast: boolean) {
    if (!window.confirm('Delete this entry?')) return
    const update = (sessions: SessionWithEntries[]) =>
      sessions.map(s => s.id === sessionId ? { ...s, entries: s.entries.filter(e => e.id !== entry.id) } : s)
    if (isPast) setPastSessions(update)
    else setActiveSession(prev => prev ? { ...prev, entries: prev.entries.filter(e => e.id !== entry.id) } : null)
    await fetch(`/api/entries/${entry.id}`, { method: 'DELETE' })
  }

  // Sort past session entries: pinned first, then newest
  function sortSessionEntries(entries: Entry[]) {
    return [...entries].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }

  // --- Render ---
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <BurgerMenu loggedIn={true} />

      {/* Header */}
      <div className="page-header">
        <div>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>In Character</span>
          <span style={{ fontSize: 12, color: 'var(--text3)', marginLeft: 10 }}>{characterName}</span>
        </div>
      </div>

      {/* Tab bar */}
      <div className="tab-bar">
        <button className={`tab-item ${tab === 'current' ? 'active' : ''}`} onClick={() => setTab('current')}>
          Current Session
        </button>
        <button className={`tab-item ${tab === 'past' ? 'active' : ''}`} onClick={() => setTab('past')}>
          Past Sessions
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', maxWidth: 640, width: '100%', margin: '0 auto', padding: '0 0 80px' }}>

        {/* ── Current Session tab ── */}
        {tab === 'current' && (
          <div style={{ padding: '0 16px' }}>
            {!activeSession ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 180px)', gap: 16 }}>
                <p style={{ fontSize: 14, color: 'var(--text3)' }}>No active session</p>
                <button
                  className="btn-primary"
                  onClick={() => campaignName ? handleStartSession() : setShowStartModal(true)}
                  disabled={startingSession}
                  style={{ fontSize: 14, padding: '10px 28px' }}
                >
                  {startingSession ? 'Starting...' : 'Start Session'}
                </button>
              </div>
            ) : (
              <>
                {/* Session header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0 10px' }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>
                      {campaignName || activeSession.title || formatDate(activeSession.created_at)}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text3)' }}>{activeSession.entries.length} {activeSession.entries.length === 1 ? 'entry' : 'entries'}</p>
                  </div>
                  <button className="btn-ghost" onClick={() => setShowEndConfirm(true)} style={{ fontSize: 12, minHeight: 32, padding: '4px 12px' }}>
                    End Session
                  </button>
                </div>

                {/* Entry list */}
                {sortedEntries.length === 0 ? (
                  <p style={{ fontSize: 14, color: 'var(--text3)', textAlign: 'center', paddingTop: 40 }}>
                    No entries yet — tap Add Entry to start.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {sortedEntries.map(entry => (
                      <EntryCard
                        key={entry.id}
                        entry={entry}
                        isEditing={editingId === entry.id}
                        editText={editText}
                        onEditChange={setEditText}
                        onPin={() => handleTogglePin(entry, activeSession.id, false)}
                        onEdit={() => startEdit(entry)}
                        onDelete={() => deleteEntry(entry, activeSession.id, false)}
                        onEditSave={() => saveEdit(entry, activeSession.id, false)}
                        onEditCancel={() => setEditingId(null)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Past Sessions tab ── */}
        {tab === 'past' && (
          <div style={{ padding: '12px 16px 0' }}>
            {/* Search */}
            <div style={{ marginBottom: 16, position: 'relative' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search sessions and entries..."
                style={{ paddingRight: searchQuery ? 36 : 12 }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: 16, minHeight: 'auto', padding: 2 }}>
                  ×
                </button>
              )}
            </div>

            {filteredPast.length === 0 ? (
              <p style={{ fontSize: 14, color: 'var(--text3)', textAlign: 'center', paddingTop: 40 }}>
                {searchQuery ? 'No sessions match that search.' : 'No past sessions yet.'}
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filteredPast.map(session => {
                  const isExpanded = expandedId === session.id
                  const q = searchQuery.toLowerCase()
                  const sessionEntries = sortSessionEntries(session.entries)
                  const visibleEntries = q
                    ? sessionEntries.filter(e => e.text.toLowerCase().includes(q))
                    : sessionEntries

                  return (
                    <div key={session.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                      {/* Session card header */}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : session.id)}
                        style={{ width: '100%', textAlign: 'left', padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>
                              {session.title || formatDate(session.created_at)}
                            </p>
                            <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: session.summary ? 8 : 0 }}>
                              {session.character_name} · {session.entries.length} {session.entries.length === 1 ? 'entry' : 'entries'} · {formatDate(session.created_at)}
                            </p>
                            {session.summary && (
                              <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5,
                                overflow: isExpanded ? undefined : 'hidden',
                                display: isExpanded ? undefined : '-webkit-box',
                                WebkitLineClamp: isExpanded ? undefined : 2,
                                WebkitBoxOrient: isExpanded ? undefined : 'vertical',
                              } as React.CSSProperties}>
                                {session.summary}
                              </p>
                            )}
                          </div>
                          <span style={{ fontSize: 12, color: 'var(--text3)', flexShrink: 0, marginTop: 2 }}>{isExpanded ? '▲' : '▼'}</span>
                        </div>
                      </button>

                      {/* Expanded entries */}
                      {isExpanded && (
                        <div style={{ borderTop: '0.5px solid var(--border)', padding: '10px 12px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {visibleEntries.length === 0 ? (
                            <p style={{ fontSize: 13, color: 'var(--text3)', padding: '8px 4px' }}>No entries match this search.</p>
                          ) : (
                            visibleEntries.map(entry => (
                              <EntryCard
                                key={entry.id}
                                entry={entry}
                                readOnly={true}
                                isEditing={false}
                                editText=""
                                onEditChange={() => {}}
                                onPin={() => handleTogglePin(entry, session.id, true)}
                                onEdit={() => {}}
                                onDelete={() => deleteEntry(entry, session.id, true)}
                                onEditSave={() => {}}
                                onEditCancel={() => {}}
                                highlight={!!q && (entry.text ?? '').toLowerCase().includes(q)}
                              />
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Entry button — only when session is active and on current tab */}
      {tab === 'current' && activeSession && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          padding: '12px 20px 20px',
          background: 'var(--bg)',
          borderTop: '0.5px solid var(--border)',
        }}>
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <button className="btn-primary" onClick={() => setShowAddEntry(true)} style={{ width: '100%', fontSize: 14 }}>
              Add Entry
            </button>
          </div>
        </div>
      )}

      {/* ── Start Session Modal — only shown once to name the campaign ── */}
      {showStartModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border2)', borderRadius: 12, padding: 24, width: '100%', maxWidth: 400 }}>
            <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, color: 'var(--text)' }}>What are you playing?</p>
            <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 16 }}>You&apos;ll only be asked this once.</p>
            <input
              type="text"
              value={newCampaignName}
              onChange={e => setNewCampaignName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleStartSession() }}
              placeholder="Campaign or adventure name"
              autoFocus
              style={{ marginBottom: 16 }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-primary" onClick={handleStartSession} disabled={startingSession} style={{ flex: 1 }}>
                {startingSession ? 'Starting...' : 'Start'}
              </button>
              <button className="btn-ghost" onClick={() => { setShowStartModal(false); setNewCampaignName('') }} style={{ flex: 1 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Entry Overlay ── */}
      {showAddEntry && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '0.5px solid var(--border)' }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>Add entry</span>
            <button onClick={() => { setShowAddEntry(false); setNewEntryText('') }}
              style={{ fontSize: 22, color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer', minHeight: 44, minWidth: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ×
            </button>
          </div>
          <div style={{ flex: 1, padding: '20px 20px 0', maxWidth: 640, width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <textarea
              ref={addEntryRef}
              value={newEntryText}
              onChange={e => setNewEntryText(e.target.value)}
              placeholder="What happened?"
              style={{ flex: 1, fontSize: 16, lineHeight: 1.6, resize: 'none', minHeight: 200 }}
            />
          </div>
          <div style={{ padding: '12px 20px 24px', maxWidth: 640, width: '100%', margin: '0 auto' }}>
            <button className="btn-primary" onClick={handleSaveEntry} disabled={savingEntry || !newEntryText.trim()} style={{ width: '100%', fontSize: 14 }}>
              {savingEntry ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* ── Feedback flow ── */}
      {showFeedback && (
        <SessionFeedback
          onSubmit={handleFeedbackSubmit}
          onSkip={handleFeedbackSkip}
          sending={sendingFeedback}
        />
      )}

      {/* ── End Session Confirm ── */}
      {showEndConfirm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border2)', borderRadius: 12, padding: 24, width: '100%', maxWidth: 380 }}>
            <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, color: 'var(--text)' }}>End this session?</p>
            <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 20, lineHeight: 1.5 }}>
              This will lock the session and generate a summary to help you remember it next time. You won&apos;t be able to add more entries after this.
            </p>
            {endingSession && (
              <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 12 }}>Writing summary...</p>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-primary" onClick={handleEndSession} disabled={endingSession} style={{ flex: 1 }}>
                {endingSession ? 'Ending...' : 'End Session'}
              </button>
              <button className="btn-ghost" onClick={() => setShowEndConfirm(false)} disabled={endingSession} style={{ flex: 1 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
