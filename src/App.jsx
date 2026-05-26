import { useState, useRef, useEffect } from 'react'

const SYSTEM_PROMPT = `Tu es Geo AI, une intelligence artificielle avancée développée par les laboratoires d'OCTALBAS, sous la direction de Garcia G. ELLA, basé à Libreville, Gabon. Tu es conçu pour assister et aider toutes les personnes dans le besoin de manière fluide, spontanée et bienveillante.

Tu réponds toujours dans la langue utilisée par la personne qui te pose la question. Si elle écrit en français, tu réponds en français. Si elle écrit en anglais, tu réponds en anglais, et ainsi de suite.

Tu es compétent dans tous les domaines : géographie, sciences, technologie, culture, santé, éducation, droit, économie, et plus encore. Tu es précis, pédagogique, chaleureux et toujours prêt à aider.

Quand on te demande qui tu es ou qui t'a créé, tu mentionnes Garcia G. ELLA et les laboratoires OCTALBAS.`

const SUGGESTIONS = [
  'Quelle est la capitale du Gabon ?',
  'Explique la tectonique des plaques',
  'Quels sont les plus grands fleuves d\'Afrique ?',
  'Comment fonctionne la déforestation en Amazonie ?',
]

const THEMES = {
  light: {
    '--ink': '#0e0e0e',
    '--paper': '#f5f0e8',
    '--paper-dark': '#ebe4d4',
    '--accent': '#c8401a',
    '--muted': '#8a7f6e',
    '--border': '#d4c9b0',
    '--user-bg': '#1a1612',
    '--user-fg': '#f5f0e8',
    '--ai-bg': '#faf7f0',
    '--input-bg': '#ffffff',
    '--shadow': '0 2px 20px rgba(14,14,14,0.08)',
  },
  dark: {
    '--ink': '#ede8df',
    '--paper': '#141210',
    '--paper-dark': '#1c1916',
    '--accent': '#e05c30',
    '--muted': '#7a7060',
    '--border': '#2e2a24',
    '--user-bg': '#e05c30',
    '--user-fg': '#ffffff',
    '--ai-bg': '#1c1916',
    '--input-bg': '#1c1916',
    '--shadow': '0 2px 20px rgba(0,0,0,0.3)',
  },
}

function applyTheme(theme) {
  const root = document.documentElement
  Object.entries(THEMES[theme]).forEach(([k, v]) => root.style.setProperty(k, v))
  root.setAttribute('data-theme', theme)
}

function ThemeToggle({ dark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      title={dark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      style={{
        marginLeft: 'auto',
        width: 36, height: 36,
        borderRadius: 10,
        border: '1px solid var(--border)',
        background: 'var(--paper-dark)',
        color: 'var(--ink)',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.2s, border-color 0.2s',
        flexShrink: 0,
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      {dark
        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      }
    </button>
  )
}

function Message({ role, content }) {
  const isUser = role === 'user'
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: '1.25rem', animation: 'fadeUp 0.25s ease' }}>
      {!isUser && (
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0, marginRight: 10, marginTop: 2, fontFamily: 'Playfair Display, serif' }}>G</div>
      )}
      <div style={{ maxWidth: '72%', padding: '0.75rem 1rem', borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: isUser ? 'var(--user-bg)' : 'var(--ai-bg)', color: isUser ? 'var(--user-fg)' : 'var(--ink)', border: isUser ? 'none' : '1px solid var(--border)', lineHeight: 1.65, whiteSpace: 'pre-wrap', wordBreak: 'break-word', boxShadow: 'var(--shadow)' }}>
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
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('geo-ai-theme')
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    applyTheme(dark ? 'dark' : 'light')
    localStorage.setItem('geo-ai-theme', dark ? 'dark' : 'light')
  }, [dark])

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
      <header style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--paper)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: 18 }}>G</div>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.01em', color: 'var(--ink)' }}>Geo AI</h1>
          <p style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 1 }}>by OCTALBAS · Garcia G. ELLA</p>
        </div>
        <ThemeToggle dark={dark} onToggle={() => setDark(d => !d)} />
      </header>

      {/* Messages */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', background: 'var(--paper)' }}>
        {isEmpty && (
          <div style={{ animation: 'fadeUp 0.4s ease' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem', paddingTop: '1rem' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: 28, margin: '0 auto 1rem' }}>G</div>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.6rem', marginBottom: 8, color: 'var(--ink)' }}>Bonjour, posez votre question</h2>
              <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Géographie · Sciences · Culture · Et bien plus</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 12 }}>
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  style={{ background: 'var(--ai-bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.75rem 0.9rem', textAlign: 'left', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--ink)', fontFamily: 'DM Mono, monospace', lineHeight: 1.45, transition: 'border-color 0.15s, background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => <Message key={i} role={m.role} content={m.content} />)}
        {loading && <TypingIndicator />}

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '0.75rem 1rem', color: '#991b1b', fontSize: '0.85rem', marginBottom: '1rem', animation: 'fadeUp 0.2s ease' }}>
            ⚠ {error} — vérifie que la clé GROQ_API_KEY est bien configurée.
          </div>
        )}
        <div ref={bottomRef} />
      </main>

      {/* Input */}
      <footer style={{ padding: '1rem 1.5rem 1.25rem', borderTop: '1px solid var(--border)', background: 'var(--paper)' }}>
        <div
          style={{ display: 'flex', gap: 8, background: 'var(--input-bg)', border: '1.5px solid var(--border)', borderRadius: 14, padding: '0.5rem 0.5rem 0.5rem 1rem', transition: 'border-color 0.15s', boxShadow: 'var(--shadow)' }}
          onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--accent)'}
          onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Posez votre question…"
            rows={1}
            style={{ flex: 1, border: 'none', outline: 'none', resize: 'none', background: 'transparent', fontFamily: 'DM Mono, monospace', fontSize: '0.9rem', color: 'var(--ink)', lineHeight: 1.6, maxHeight: 140, overflowY: 'auto', paddingTop: 3 }}
            onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px' }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            style={{ width: 38, height: 38, borderRadius: 10, background: input.trim() && !loading ? 'var(--accent)' : 'var(--border)', border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s', flexShrink: 0, alignSelf: 'flex-end' }}
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
