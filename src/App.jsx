import { useState, useRef, useEffect } from 'react'

const SYSTEM_PROMPT = `Tu es Geo AI, un assistant expert en géographie, cartographie, géopolitique, environnement et sciences de la Terre. Tu réponds de façon claire, précise et pédagogique. Tu peux aussi répondre à des questions générales.`

const SUGGESTIONS = [
  'Quelle est la capitale du Gabon ?',
  'Explique la tectonique des plaques',
  'Quels sont les plus grands fleuves d\'Afrique ?',
  'Comment fonctionne la déforestation en Amazonie ?',
]

function Message({ role, content }) {
  const isUser = role === 'user'
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: '1.25rem',
        animation: 'fadeUp 0.25s ease',
      }}
    >
      {!isUser && (
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'var(--accent)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 700,
            flexShrink: 0,
            marginRight: 10,
            marginTop: 2,
            fontFamily: 'Playfair Display, serif',
          }}
        >
          G
        </div>
      )}
      <div
        style={{
          maxWidth: '72%',
          padding: '0.75rem 1rem',
          borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          background: isUser ? 'var(--user-bg)' : 'var(--ai-bg)',
          color: isUser ? 'var(--user-fg)' : 'var(--ink)',
          border: isUser ? 'none' : '1px solid var(--border)',
          lineHeight: 1.65,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          boxShadow: 'var(--shadow)',
        }}
      >
        {content}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem', animation: 'fadeUp 0.2s ease' }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, fontFamily: 'Playfair Display, serif', flexShrink: 0 }}>G</div>
      <div style={{ background: 'var(--ai-bg)', border: '1px solid var(--border)', borderRadius: '16px 16px 16px 4px', padding: '0.75rem 1rem', display: 'flex', gap: 5, alignItems: 'center' }}>
        {[0, 150, 300].map(delay => (
          <span key={delay} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'block', animation: `blink 1.1s ${delay}ms infinite` }} />
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage(text) {
    const userText = (text ?? input).trim()
    if (!userText || loading) return

    setInput('')
    setError(null)
    const newMessages = [...messages, { role: 'user', content: userText }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...newMessages,
          ],
        }),
      })

      if (!res.ok) throw new Error(`Erreur ${res.status}`)
      const data = await res.json()
      const reply = data.choices?.[0]?.message?.content ?? 'Aucune réponse reçue.'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (e) {
      setError(e.message)
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setLoading(false)
      textareaRef.current?.focus()
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const isEmpty = messages.length === 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxWidth: 760, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <header style={{
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: 'var(--paper)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'var(--accent)',
          color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Playfair Display, serif',
          fontWeight: 700, fontSize: 18,
        }}>G</div>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.01em' }}>Geo AI</h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 1 }}>Assistant géographique</p>
        </div>
      </header>

      {/* Messages */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
        {isEmpty && (
          <div style={{ animation: 'fadeUp 0.4s ease' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem', paddingTop: '1rem' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'var(--accent)',
                color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Playfair Display, serif',
                fontWeight: 700, fontSize: 28,
                margin: '0 auto 1rem',
              }}>G</div>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.6rem', marginBottom: 8 }}>Bonjour, posez votre question</h2>
              <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Géographie · Cartographie · Géopolitique · Environnement</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 12 }}>
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  style={{
                    background: 'var(--ai-bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    padding: '0.75rem 0.9rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    color: 'var(--ink)',
                    fontFamily: 'DM Mono, monospace',
                    lineHeight: 1.45,
                    transition: 'border-color 0.15s, background 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = '#fff' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--ai-bg)' }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <Message key={i} role={m.role} content={m.content} />
        ))}

        {loading && <TypingIndicator />}

        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fca5a5',
            borderRadius: 10, padding: '0.75rem 1rem',
            color: '#991b1b', fontSize: '0.85rem', marginBottom: '1rem',
            animation: 'fadeUp 0.2s ease',
          }}>
            ⚠ {error} — vérifie que la clé GROQ_API_KEY est bien configurée.
          </div>
        )}

        <div ref={bottomRef} />
      </main>

      {/* Input */}
      <footer style={{
        padding: '1rem 1.5rem 1.25rem',
        borderTop: '1px solid var(--border)',
        background: 'var(--paper)',
      }}>
        <div style={{
          display: 'flex',
          gap: 8,
          background: '#fff',
          border: '1.5px solid var(--border)',
          borderRadius: 14,
          padding: '0.5rem 0.5rem 0.5rem 1rem',
          transition: 'border-color 0.15s',
          boxShadow: 'var(--shadow)',
        }}
          onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--accent)'}
          onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Posez votre question géographique…"
            rows={1}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              resize: 'none',
              background: 'transparent',
              fontFamily: 'DM Mono, monospace',
              fontSize: '0.9rem',
              color: 'var(--ink)',
              lineHeight: 1.6,
              maxHeight: 140,
              overflowY: 'auto',
              paddingTop: 3,
            }}
            onInput={e => {
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px'
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            style={{
              width: 38, height: 38,
              borderRadius: 10,
              background: input.trim() && !loading ? 'var(--accent)' : 'var(--border)',
              border: 'none',
              cursor: input.trim() && !loading ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s',
              flexShrink: 0,
              alignSelf: 'flex-end',
            }}
          >
            {loading
              ? <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'block' }} />
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            }
          </button>
        </div>
        <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--muted)', marginTop: '0.6rem' }}>
          Entrée pour envoyer · Maj+Entrée pour une nouvelle ligne
        </p>
      </footer>
    </div>
  )
}
