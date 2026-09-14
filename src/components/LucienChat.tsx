'use client'

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import type { LucienConversationSummary } from '@/types/database'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface LucienChatHandle {
  /** Clears messages from the currently active conversation, keeping the thread. Used by End Session. */
  clearActiveConversation: () => Promise<void>
}

function relativeDate(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' })
}

const LucienChat = forwardRef<LucienChatHandle>(function LucienChat(_props, ref) {
  const [chatOpen, setChatOpen] = useState(false)
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [activeTitle, setActiveTitle] = useState('New conversation')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [conversations, setConversations] = useState<LucienConversationSummary[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const [showConversationList, setShowConversationList] = useState(false)
  const [loadingConversation, setLoadingConversation] = useState(false)
  const [input, setInput] = useState('')

  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useImperativeHandle(ref, () => ({
    async clearActiveConversation() {
      if (!activeConversationId) return
      try {
        await fetch(`/api/lucien/conversations/${activeConversationId}/messages`, { method: 'DELETE' })
        setMessages([])
      } catch {}
    },
  }), [activeConversationId])

  async function fetchConversations() {
    try {
      const res = await fetch('/api/lucien/conversations')
      if (!res.ok) return
      const data = await res.json()
      setConversations(data.conversations || [])
    } catch {}
  }

  useEffect(() => { fetchConversations() }, [])

  async function createConversation() {
    try {
      const res = await fetch('/api/lucien/conversations', { method: 'POST' })
      const data = await res.json()
      setActiveConversationId(data.id)
      setActiveTitle(data.title || 'New conversation')
      setMessages([])
      fetchConversations()
    } catch {}
  }

  async function loadConversation(id: string) {
    setLoadingConversation(true)
    setShowConversationList(false)
    try {
      const res = await fetch(`/api/lucien/conversations/${id}`)
      const data = await res.json()
      setActiveConversationId(id)
      setActiveTitle(data.conversation?.title || 'New conversation')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setMessages((data.messages || []).map((m: any) => ({ role: m.role, content: m.content })))
    } catch {}
    setLoadingConversation(false)
  }

  async function deleteConversation(id: string) {
    try {
      await fetch(`/api/lucien/conversations/${id}`, { method: 'DELETE' })
      setConversations(prev => prev.filter(c => c.id !== id))
      if (id === activeConversationId) {
        setActiveConversationId(null)
        setActiveTitle('New conversation')
        setMessages([])
      }
    } catch {}
  }

  function openChat() {
    setChatOpen(true)
    if (!activeConversationId) createConversation()
  }

  function closeChat() {
    setChatOpen(false)
    setShowConversationList(false)
  }

  async function sendMessage() {
    const text = input.trim()
    if (!text || isThinking || !activeConversationId) return
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setIsThinking(true)
    try {
      const res = await fetch('/api/lucien/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: activeConversationId, message: text }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response || '' }])
        if (data.title) setActiveTitle(data.title)
        setConversations(prev => prev.map(c => c.id === activeConversationId
          ? { ...c, title: data.title || c.title, updated_at: new Date().toISOString() }
          : c
        ))
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: "...something's wrong. Try again in a bit." }])
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "...something's wrong. Try again in a bit." }])
    }
    setIsThinking(false)
  }

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [messages, isThinking])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    const lineHeight = 20
    const maxHeight = lineHeight * 4 + 16
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`
  }

  return (
    <>
      <button
        className="lucien-fab"
        onClick={() => (chatOpen ? closeChat() : openChat())}
        aria-label={chatOpen ? 'Close Lucien chat' : 'Open Lucien chat'}
      >
        {chatOpen ? '×' : '✒️'}
      </button>

      {chatOpen && (
        <div className="lucien-panel">
          {/* Header */}
          <div style={{
            height: 52, flexShrink: 0,
            borderBottom: '0.5px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 12px',
          }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)', flexShrink: 0 }}>Lucien</span>
            <span style={{
              fontSize: 12, color: 'var(--text2)', flex: 1,
              textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              padding: '0 8px',
            }}>
              {showConversationList ? 'Conversations' : activeTitle}
            </span>
            <div style={{ display: 'flex', gap: 2, flexShrink: 0, alignItems: 'center' }}>
              <button
                onClick={() => setShowConversationList(v => !v)}
                title="Conversations"
                style={{ fontSize: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)', minHeight: 32, minWidth: 32, padding: 0 }}
              >
                ↺
              </button>
              <button
                onClick={closeChat}
                aria-label="Close"
                style={{ fontSize: 20, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', minHeight: 32, minWidth: 32, padding: 0 }}
              >
                ×
              </button>
            </div>
          </div>

          {showConversationList ? (
            <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
              <button className="btn-primary" onClick={createConversation} style={{ width: '100%', marginBottom: 14, fontSize: 13 }}>
                New conversation
              </button>
              {conversations.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--text3)', textAlign: 'center', marginTop: 20 }}>No conversations yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {conversations.map(c => (
                    <div
                      key={c.id}
                      className="card"
                      onClick={() => loadConversation(c.id)}
                      style={{
                        padding: '10px 12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                        cursor: 'pointer',
                        borderLeft: c.id === activeConversationId ? '2px solid var(--accent)' : undefined,
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.title}
                        </p>
                        <p style={{ fontSize: 11, color: 'var(--text3)' }}>{relativeDate(c.updated_at)}</p>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); deleteConversation(c.id) }}
                        aria-label="Delete conversation"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: 'var(--text3)', flexShrink: 0, padding: 4, minHeight: 'auto' }}
                      >
                        🗑
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Message area */}
              <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
                {loadingConversation ? (
                  <p style={{ fontSize: 14, color: 'var(--text3)', textAlign: 'center', marginTop: 40 }}>Loading...</p>
                ) : messages.length === 0 ? (
                  <p style={{ fontSize: 14, color: 'var(--text3)', textAlign: 'center', marginTop: 40 }}>Lucien is listening.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {messages.map((m, i) => (
                      <div
                        key={i}
                        style={{
                          alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                          maxWidth: m.role === 'user' ? '80%' : '85%',
                          background: m.role === 'user' ? 'var(--accent-faint)' : 'var(--surface2)',
                          color: 'var(--text)',
                          fontSize: 14,
                          padding: '8px 12px',
                          borderRadius: 8,
                          borderLeft: m.role === 'assistant' ? '2px solid var(--accent)' : undefined,
                          lineHeight: m.role === 'assistant' ? 1.65 : 1.4,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}
                      >
                        {m.content}
                      </div>
                    ))}
                    {isThinking && (
                      <div style={{
                        alignSelf: 'flex-start', maxWidth: '85%',
                        background: 'var(--surface2)', borderLeft: '2px solid var(--accent)',
                        padding: '8px 12px', borderRadius: 8,
                      }}>
                        <span className="thinking-dot" />
                        <span className="thinking-dot" />
                        <span className="thinking-dot" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Input area */}
              <div style={{ borderTop: '0.5px solid var(--border)', padding: 12, flexShrink: 0 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask Lucien anything..."
                    disabled={isThinking}
                    rows={1}
                    style={{
                      flex: 1, resize: 'none', fontSize: 14, borderRadius: 7,
                      background: 'var(--surface)', border: '0.5px solid var(--border2)',
                      padding: '8px 10px', minHeight: 36, maxHeight: 96, lineHeight: '20px',
                    }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={isThinking || !input.trim()}
                    className="btn-primary"
                    style={{ width: 36, height: 36, minHeight: 36, padding: 0, flexShrink: 0, fontSize: 16 }}
                  >
                    →
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
})

export default LucienChat
