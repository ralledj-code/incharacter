'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import BurgerMenu from '@/components/BurgerMenu'
import { createClient } from '@/lib/supabase/client'
import SessionFeedback from '@/components/SessionFeedback'
import type { Entry, SessionWithEntries, FeedbackData, QuestWithUpdates } from '@/types/database'

type Tab = 'current' | 'past' | 'threads'

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

  // Quests
  const [quests, setQuests] = useState<QuestWithUpdates[] | null>(null)
  const [questsLoading, setQuestsLoading] = useState(false)
  const [questsBuilding, setQuestsBuilding] = useState(false)
  const [questsNeedRefresh, setQuestsNeedRefresh] = useState(false)
  const [expandedQuestIds, setExpandedQuestIds] = useState<Set<string>>(new Set())
  const [resolvedExpanded, setResolvedExpanded] = useState(false)
  const [recalibrateQuestId, setRecalibrateQuestId] = useState<string | null>(null)
  const [recalibrateText, setRecalibrateText] = useState('')
  const [recalibrating, setRecalibrating] = useState(false)
  const questsRetroRanRef = useRef(false)

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

      // Categorise (fire and forget)
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

      // Quest assignment (fire and forget)
      fetch('/api/claude/quest-assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId }),
      })
        .then(r => r.json())
        .then(({ questId }: { questId: string | null }) => {
          if (!questId) return
          fetch('/api/claude/quest-update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ questId }),
          })
        })
        .then(() => setQuestsNeedRefresh(true))
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

  // Quest handlers

  async function loadQuests() {
    setQuestsLoading(true)
    try {
      const res = await fetch('/api/quests')
      const data = await res.json()
      const existing: QuestWithUpdates[] = data.quests ?? []

      const allEntries = [
        ...(activeSession?.entries ?? []),
        ...pastSessions.flatMap(s => s.entries),
      ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

      if (existing.length === 0 && allEntries.length > 0 && !questsRetroRanRef.current) {
        questsRetroRanRef.current = true
        setQuestsLoading(false)
        setQuestsBuilding(true)

        for (let i = 0; i < allEntries.length; i += 5) {
          const batch = allEntries.slice(i, i + 5)
          for (const entry of batch) {
            try {
              const assignRes = await fetch('/api/claude/quest-assign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ entryId: entry.id }),
              })
              const { questId } = await assignRes.json()
              if (questId) {
                await fetch('/api/claude/quest-update', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ questId }),
                })
              }
            } catch {}
          }
        }

        const finalRes = await fetch('/api/quests')
        const finalData = await finalRes.json()
        setQuests(finalData.quests ?? [])
        setQuestsBuilding(false)
      } else {
        setQuests(existing)
        setQuestsLoading(false)
      }
    } catch {
      setQuestsLoading(false)
      setQuestsBuilding(false)
      setQuests([])
    }
  }

  // Initial load when Threads tab first opened
  useEffect(() => {
    if (tab !== 'threads' || quests !== null) return
    loadQuests()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, quests])

  // Refresh quests after entry save completes
  useEffect(() => {
    if (tab !== 'threads' || !questsNeedRefresh) return
    setQuestsNeedRefresh(false)
    fetch('/api/quests')
      .then(r => r.json())
      .then(d => setQuests(d.quests ?? []))
      .catch(() => {})
  }, [tab, questsNeedRefresh])

  function toggleQuestEntries(id: string) {
    setExpandedQuestIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleDismissQuest(id: string) {
    if (!window.confirm("Dismiss this quest? It won't affect your journal entries.")) return
    await fetch(`/api/quests/${id}/dismiss`, { method: 'PATCH' })
    setQuests(prev => prev ? prev.filter(q => q.id !== id) : prev)
  }

  async function handleReopenQuest(id: string) {
    await fetch(`/api/quests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'active' }),
    })
    setQuests(prev => prev
      ? prev.map(q => q.id === id ? { ...q, status: 'active' as const } : q)
      : prev
    )
  }

  async function handleRecalibrate() {
    if (!recalibrateQuestId || !recalibrateText.trim()) return
    setRecalibrating(true)
    try {
      await fetch('/api/claude/quest-recalibrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId: recalibrateQuestId, instruction: recalibrateText }),
      })
      const freshRes = await fetch('/api/quests')
      const freshData = await freshRes.json()
      setQuests(freshData.quests ?? [])
      setRecalibrateQuestId(null)
      setRecalibrateText('')
    } catch {}
    setRecalibrating(false)
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
        <button className={`tab-item ${tab === 'threads' ? 'active' : ''}`} onClick={() => setTab('threads')}>
          Threads
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

        {/* ── Threads (Quests) tab ── */}
        {tab === 'threads' && (
          <div style={{ padding: '12px 16px 0' }}>
            {(questsLoading || questsBuilding) ? (
              <div style={{ textAlign: 'center', paddingTop: 60 }}>
                <p style={{ fontSize: 14, color: 'var(--text3)' }}>
                  {questsBuilding ? 'Building your quest log...' : 'Loading...'}
                </p>
              </div>
            ) : (() => {
              const allQuests = quests ?? []
              const activeQuests = allQuests
                .filter(q => q.status === 'active')
                .sort((a, b) => {
                  if (a.urgency !== b.urgency) return a.urgency === 'urgent' ? -1 : 1
                  return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
                })
              const resolvedQuests = allQuests.filter(q => q.status === 'resolved')

              return (
                <>
                  {/* ACTIVE section */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span className="label-caps" style={{ fontSize: 10 }}>Active</span>
                      <span style={{ fontSize: 11, color: 'var(--text3)', background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 10, padding: '1px 8px' }}>
                        {activeQuests.length}
                      </span>
                    </div>
                    <div style={{ height: 1, background: 'var(--border)', marginBottom: 8 }} />

                    {activeQuests.length === 0 ? (
                      <p style={{ fontSize: 13, color: 'var(--text3)', paddingTop: 8 }}>No active quests.</p>
                    ) : (
                      activeQuests.map(quest => {
                        const entriesExpanded = expandedQuestIds.has(quest.id)
                        const currentUpdate = quest.updates.find(u => u.is_current)
                        const oldUpdates = quest.updates.filter(u => !u.is_current)
                        const questEntries = [...quest.entries].sort((a, b) =>
                          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                        )

                        return (
                          <div key={quest.id} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '0.5px solid var(--border)' }}>
                            {/* Title row */}
                            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 6 }}>
                              <span style={{ fontSize: 14, color: 'var(--text3)', flexShrink: 0, marginTop: 2 }}>◆</span>
                              <p style={{ flex: 1, fontSize: 15, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>
                                {quest.title}
                              </p>
                              <span style={{ flexShrink: 0, fontSize: 14 }}>{quest.urgency === 'urgent' ? '🔴' : '🟡'}</span>
                            </div>

                            {/* Status history */}
                            <div style={{ paddingLeft: 24 }}>
                              {currentUpdate && (
                                <p style={{ fontSize: 14, color: 'var(--text)', marginBottom: 4, lineHeight: 1.4 }}>
                                  {currentUpdate.status_text}
                                </p>
                              )}
                              {oldUpdates.slice(0, 3).map(u => (
                                <p key={u.id} style={{ fontSize: 13, color: 'var(--text3)', textDecoration: 'line-through', marginBottom: 2, lineHeight: 1.4 }}>
                                  {u.status_text}
                                </p>
                              ))}
                            </div>

                            {/* Action bar */}
                            <div style={{ paddingLeft: 24, display: 'flex', gap: 14, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                              <button
                                onClick={() => toggleQuestEntries(quest.id)}
                                style={{ fontSize: 12, color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, minHeight: 'auto' }}
                              >
                                {entriesExpanded ? '▲' : '▼'} {questEntries.length} {questEntries.length === 1 ? 'entry' : 'entries'}
                              </button>
                              <button
                                onClick={() => { setRecalibrateQuestId(quest.id); setRecalibrateText('') }}
                                style={{ fontSize: 12, color: 'var(--text2)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, minHeight: 'auto' }}
                              >
                                Recalibrate
                              </button>
                              <button
                                onClick={() => handleDismissQuest(quest.id)}
                                style={{ fontSize: 12, color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, minHeight: 'auto' }}
                              >
                                Dismiss
                              </button>
                            </div>

                            {/* Expanded entries */}
                            {entriesExpanded && (
                              <div style={{ paddingLeft: 24, marginTop: 8 }}>
                                {questEntries.length === 0 ? (
                                  <p style={{ fontSize: 13, color: 'var(--text3)' }}>No entries linked yet.</p>
                                ) : (
                                  questEntries.map(entry => (
                                    <div key={entry.id} style={{ padding: '7px 0', borderTop: '0.5px solid var(--border)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                                      <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{entry.icon || '📝'}</span>
                                      <div style={{ flex: 1, minWidth: 0 }}>
                                        <span className="label-caps" style={{ fontSize: 9, display: 'block', marginBottom: 2 }}>{entry.category || 'Note'}</span>
                                        <p style={{
                                          fontSize: 13,
                                          color: 'var(--text2)',
                                          lineHeight: 1.4,
                                          overflow: 'hidden',
                                          display: '-webkit-box',
                                          WebkitLineClamp: 2,
                                          WebkitBoxOrient: 'vertical',
                                        } as React.CSSProperties}>
                                          {entry.text}
                                        </p>
                                      </div>
                                      <span style={{ fontSize: 11, color: 'var(--text3)', flexShrink: 0, paddingTop: 1 }}>{formatTime(entry.created_at)}</span>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>

                  {/* RESOLVED section */}
                  <div style={{ marginBottom: 20 }}>
                    <button
                      onClick={() => setResolvedExpanded(v => !v)}
                      style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 6px', minHeight: 'auto' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="label-caps" style={{ fontSize: 10 }}>Resolved</span>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{ fontSize: 11, color: 'var(--text3)', background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 10, padding: '1px 8px' }}>
                            {resolvedQuests.length}
                          </span>
                          <span style={{ fontSize: 11, color: 'var(--text3)' }}>{resolvedExpanded ? '▲' : '▼'}</span>
                        </div>
                      </div>
                    </button>
                    <div style={{ height: 1, background: 'var(--border)', marginBottom: resolvedExpanded ? 8 : 0 }} />

                    {resolvedExpanded && (
                      resolvedQuests.length === 0 ? (
                        <p style={{ fontSize: 13, color: 'var(--text3)', paddingTop: 8 }}>No resolved quests.</p>
                      ) : (
                        resolvedQuests.map(quest => {
                          const currentUpdate = quest.updates.find(u => u.is_current)
                          return (
                            <div key={quest.id} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '0.5px solid var(--border)' }}>
                              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 6 }}>
                                <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>✅</span>
                                <div style={{ flex: 1 }}>
                                  <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3, marginBottom: currentUpdate ? 4 : 0 }}>
                                    {quest.title}
                                  </p>
                                  {currentUpdate && (
                                    <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.4 }}>
                                      {currentUpdate.status_text}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div style={{ paddingLeft: 24 }}>
                                <button
                                  onClick={() => handleReopenQuest(quest.id)}
                                  className="btn-ghost"
                                  style={{ fontSize: 12, minHeight: 28, padding: '3px 10px' }}
                                >
                                  Reopen
                                </button>
                              </div>
                            </div>
                          )
                        })
                      )
                    )}
                  </div>
                </>
              )
            })()}
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

      {/* ── Start Session Modal ── */}
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

      {/* ── Recalibrate Modal ── */}
      {recalibrateQuestId && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border2)', borderRadius: 12, padding: 24, width: '100%', maxWidth: 420 }}>
            <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, color: 'var(--text)' }}>Recalibrate quest</p>
            <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 16 }}>What should Claude know?</p>
            <textarea
              value={recalibrateText}
              onChange={e => setRecalibrateText(e.target.value)}
              placeholder="e.g. This quest is resolved — Lucien cured himself."
              autoFocus
              style={{ fontSize: 14, lineHeight: 1.5, minHeight: 80, resize: 'none', width: '100%', marginBottom: 16 }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn-primary"
                onClick={handleRecalibrate}
                disabled={recalibrating || !recalibrateText.trim()}
                style={{ flex: 1 }}
              >
                {recalibrating ? 'Recalibrating...' : 'Recalibrate'}
              </button>
              <button
                className="btn-ghost"
                onClick={() => { setRecalibrateQuestId(null); setRecalibrateText('') }}
                disabled={recalibrating}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
            </div>
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
