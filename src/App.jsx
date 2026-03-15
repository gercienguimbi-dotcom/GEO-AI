import { useState, useRef, useEffect, useCallback } from "react";

const THEMES = {
  dark: {
    bg: "#0f0b08", surface: "#1a1208", surface2: "#221a0d",
    border: "#2e2010", accent: "#d4622a", accent2: "#c49a2b",
    accent3: "#3a6b3e", text: "#f2e8d6", muted: "#6b5a42",
    chatBg: "#120e06", inputBg: "#1a1208"
  },
  light: {
    bg: "#fdf6ec", surface: "#f5ead6", surface2: "#eedfc4",
    border: "#d9c9a8", accent: "#b84e1a", accent2: "#a07c18",
    accent3: "#2d5530", text: "#1a1006", muted: "#7a6040",
    chatBg: "#fdf6ec", inputBg: "#f5ead6"
  }
};

const SYSTEM_PROMPT = `Tu es GEO AI, l'intelligence souveraine développée par OCTALABS.
Ton créateur est Garcia G. ELLA, PDG de OCTALABS.
Tu es précis, stratégique et visionnaire.
Tu réponds TOUJOURS dans la langue utilisée par l'utilisateur — si on te parle en français, tu réponds en français ; en anglais, tu réponds en anglais, etc.
Tu peux coder, analyser, raisonner sur tous les sujets tech.
Ton style : direct, expert, avec une légère touche de confiance souveraine africaine.`;

const THINK_STEPS = [
  "Analyse de la requête...",
  "Activation des couches neurales...",
  "Calcul des vecteurs d'attention...",
  "Vérification cohérence sémantique...",
  "Validation protocole OCTALABS...",
  "Synthèse de la réponse optimale...",
];

const QUICK = ["Qui est GEO AI ?", "Explique le deep learning", "Ton architecture ?", "Vision OCTALABS", "Code Python", "Cybersécurité"];

function KenteDivider({ t }) {
  return (
    <div style={{
      height: 3,
      background: `repeating-linear-gradient(90deg,${t.accent} 0,${t.accent} 20px,${t.accent2} 20px,${t.accent2} 40px,${t.accent3} 40px,${t.accent3} 60px,${t.bg} 60px,${t.bg} 80px)`,
      opacity: 0.7, flexShrink: 0
    }} />
  );
}

function AdinkraSVG({ color, size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="12" stroke={color} strokeWidth="1.2" fill="none" />
      <circle cx="14" cy="14" r="6" stroke={color} strokeWidth="0.8" fill="none" />
      <circle cx="14" cy="14" r="2.5" fill={color} />
      <line x1="14" y1="2" x2="14" y2="8" stroke={color} strokeWidth="1.2" />
      <line x1="14" y1="20" x2="14" y2="26" stroke={color} strokeWidth="1.2" />
      <line x1="2" y1="14" x2="8" y2="14" stroke={color} strokeWidth="1.2" />
      <line x1="20" y1="14" x2="26" y2="14" stroke={color} strokeWidth="1.2" />
    </svg>
  );
}

function CodeBlock({ code, lang, t }) {
  const [copied, setCopied] = useState(false);
  let html = code
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/(["'`])(?:(?!\1)[^\\]|\\.)*\1/g, m => `<span style="color:#7dba6a">${m}</span>`)
    .replace(/(#.*$|\/\/.*$)/gm, m => `<span style="color:#6b7a5a;font-style:italic">${m}</span>`)
    .replace(/\b(def|class|import|from|return|if|else|elif|for|while|in|not|and|or|True|False|None|async|await|try|except|const|let|var|function|new|this)\b/g, m => `<span style="color:${t.accent2};font-weight:600">${m}</span>`)
    .replace(/\b(\d+\.?\d*)\b/g, m => `<span style="color:${t.accent}">${m}</span>`);

  return (
    <div style={{ background: t.surface2, border: `1px solid ${t.border}`, borderRadius: 6, margin: "10px 0", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 12px", borderBottom: `1px solid ${t.border}`, background: t.surface }}>
        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: t.accent, letterSpacing: "0.15em" }}>{lang || "code"}</span>
        <button onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
          style={{ background: "none", border: `1px solid ${t.border}`, borderRadius: 4, padding: "2px 8px", color: copied ? t.accent3 : t.muted, cursor: "pointer", fontSize: 10, fontFamily: "'DM Mono',monospace", transition: "all 0.2s" }}>
          {copied ? "✓ COPIÉ" : "COPIER"}
        </button>
      </div>
      <pre style={{ padding: "12px 14px", overflowX: "auto", fontFamily: "'DM Mono',monospace", fontSize: 12, lineHeight: 1.7, color: t.text }} dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

function MessageBubble({ msg, t }) {
  const isGeo = msg.role === "geo";
  const parts = [];
  const codeRx = /```(\w*)\n?([\s\S]*?)```/g;
  let last = 0, m;
  while ((m = codeRx.exec(msg.content)) !== null) {
    if (m.index > last) parts.push({ type: "text", content: msg.content.slice(last, m.index) });
    parts.push({ type: "code", lang: m[1], content: m[2].trim() });
    last = m.index + m[0].length;
  }
  if (last < msg.content.length) parts.push({ type: "text", content: msg.content.slice(last) });

  const fmt = txt => txt
    .replace(/\*\*([^*]+)\*\*/g, `<strong style="color:${t.accent2}">$1</strong>`)
    .replace(/`([^`]+)`/g, `<code style="font-family:'DM Mono',monospace;font-size:11px;background:${t.surface2};padding:2px 5px;border-radius:3px;color:${t.accent}">\$1</code>`)
    .replace(/\n/g, "<br/>");

  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 24, flexDirection: isGeo ? "row" : "row-reverse" }}>
      {/* Avatar */}
      <div style={{
        width: 36, height: 36, borderRadius: 4, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: isGeo ? t.surface2 : t.surface,
        border: `1px solid ${t.border}`,
      }}>
        {isGeo
          ? <AdinkraSVG color={t.accent} size={20} />
          : <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 12, fontWeight: 700, color: t.muted }}>YOU</span>
        }
      </div>
      {/* Bubble */}
      <div style={{ maxWidth: "78%", minWidth: 60 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexDirection: isGeo ? "row" : "row-reverse" }}>
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: isGeo ? t.accent : t.accent3, letterSpacing: "0.15em" }}>
            {isGeo ? "GEO AI" : "VOUS"}
          </span>
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: t.muted }}>{msg.time}</span>
        </div>
        <div style={{
          padding: "12px 16px",
          background: isGeo ? t.surface : t.surface2,
          border: `1px solid ${t.border}`,
          borderLeft: isGeo ? `3px solid ${t.accent}` : "1px solid " + t.border,
          borderRight: isGeo ? "1px solid " + t.border : `3px solid ${t.accent3}`,
          borderRadius: 4,
          fontSize: 14, lineHeight: 1.8, color: t.text,
          fontFamily: "'DM Mono',monospace",
        }}>
          {parts.map((p, i) => p.type === "code"
            ? <CodeBlock key={i} code={p.content} lang={p.lang} t={t} />
            : <span key={i} dangerouslySetInnerHTML={{ __html: fmt(p.content) }} />
          )}
        </div>
      </div>
    </div>
  );
}

function TypingBubble({ t }) {
  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 22 }}>
      <div style={{ width: 36, height: 36, borderRadius: 4, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: t.surface2, border: `1px solid ${t.border}` }}>
        <AdinkraSVG color={t.accent} size={20} />
      </div>
      <div style={{ padding: "12px 16px", background: t.surface, border: `1px solid ${t.border}`, borderLeft: `3px solid ${t.accent}`, borderRadius: 4, display: "flex", alignItems: "center", gap: 5 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: t.accent, animation: `tdot 1.2s ease-in-out ${i * 0.2}s infinite` }} />
        ))}
      </div>
    </div>
  );
}

function ThinkPanel({ steps, active, t }) {
  if (!active && steps.length === 0) return null;
  return (
    <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderLeft: `3px solid ${t.accent2}`, borderRadius: 4, padding: "12px 16px", marginBottom: 12, flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontFamily: "'DM Mono',monospace", fontSize: 9, color: t.accent2, letterSpacing: "0.2em" }}>
        {active && <div style={{ width: 8, height: 8, border: `1.5px solid ${t.accent2}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />}
        RÉFLEXION — GEO AI
      </div>
      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, lineHeight: 1.9 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 8, color: i === steps.length - 1 && active ? t.accent : t.muted }}>
            <span>{i === steps.length - 1 && active ? "▶" : "✓"}</span><span>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GeoAI() {
  const [theme, setTheme] = useState("dark");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [thinkMode, setThinkMode] = useState(true);
  const [thinkSteps, setThinkSteps] = useState([]);
  const [thinking, setThinking] = useState(false);
  const chatRef = useRef(null);
  const apiHistory = useRef([]);
  const t = THEMES[theme];

  useEffect(() => {
    setTimeout(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, 50);
  }, [messages, thinkSteps, thinking]);

  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const getTime = () => new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  const runThinking = async () => {
    setThinking(true); setThinkSteps([]);
    for (const step of THINK_STEPS) { await sleep(200); setThinkSteps(prev => [...prev, step]); }
    await sleep(200); setThinking(false);
  };

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput(""); setLoading(true);
    const userMsg = { role: "user", content: text, time: getTime() };
    setMessages(prev => [...prev, userMsg]);
    apiHistory.current.push({ role: "user", content: text });
    if (thinkMode) await runThinking();
    setThinkSteps([]);
    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "system", content: SYSTEM_PROMPT }, ...apiHistory.current] })
      });
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || "Erreur de réponse.";
      apiHistory.current.push({ role: "assistant", content: reply });
      setMessages(prev => [...prev, { role: "geo", content: reply, time: getTime() }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "geo", content: `⚠️ Erreur: \`${e.message}\``, time: getTime() }]);
    }
    setLoading(false);
  }, [input, loading, thinkMode]);

  const onKey = e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  const stats = [
    { label: "MODÈLE", val: "GEO-512", sub: "LLaMA 3.3 70B" },
    { label: "PARAMÈTRES", val: "70B", sub: "Groq Engine" },
    { label: "PDG", val: "Garcia G. ELLA", sub: "OCTALABS Corp." },
    { label: "STATUT", val: "EN LIGNE", sub: "Opérationnel", live: true },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, background: t.bg, color: t.text, fontFamily: "'Syne',sans-serif", display: "flex", flexDirection: "column", transition: "background 0.4s, color 0.4s", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@400;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes tdot { 0%,60%,100%{transform:translateY(0);opacity:.3} 30%{transform:translateY(-4px);opacity:1} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:${t.border};border-radius:2px}
        textarea { font-family: 'DM Mono', monospace !important; }
        .qbtn:hover { border-color: ${t.accent} !important; color: ${t.accent} !important; }
        .sbtn:hover { background: ${t.accent} !important; color: ${t.bg} !important; }
        .sbtn:disabled { opacity: 0.3; cursor: not-allowed; }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{ padding: "1rem 2.5rem", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, background: t.bg }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <AdinkraSVG color={t.accent} size={26} />
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em", color: t.text, lineHeight: 1 }}>
              GEO <span style={{ color: t.accent }}>AI</span>
            </div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: t.muted, letterSpacing: "0.15em", marginTop: 2 }}>OCTALABS — UNIVERSAL REASONER</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "'DM Mono',monospace", fontSize: 10, color: t.accent3 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: t.accent3, animation: "blink 2s infinite" }} />
            ACTIF
          </div>
          {/* Think toggle */}
          <div onClick={() => setThinkMode(v => !v)} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", userSelect: "none" }}>
            <div style={{ width: 28, height: 15, borderRadius: 8, background: thinkMode ? t.accent : t.border, position: "relative", transition: "background 0.25s", border: `1px solid ${t.border}` }}>
              <div style={{ position: "absolute", top: 2, left: thinkMode ? 13 : 2, width: 9, height: 9, background: "#fff", borderRadius: "50%", transition: "left 0.25s" }} />
            </div>
            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: thinkMode ? t.accent : t.muted, letterSpacing: "0.1em" }}>THINKING</span>
          </div>
          {/* Theme toggle */}
          <button onClick={() => setTheme(v => v === "dark" ? "light" : "dark")}
            style={{ background: "none", border: `1px solid ${t.border}`, color: t.muted, width: 32, height: 32, borderRadius: "50%", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
      </nav>

      <KenteDivider t={t} />

      {/* ── STATS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: t.border, borderBottom: `1px solid ${t.border}`, flexShrink: 0 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: t.surface, padding: "10px 16px", borderTop: `2px solid ${i === 0 ? t.accent : i === 1 ? t.accent2 : i === 2 ? t.accent3 : t.accent}` }}>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, color: t.muted, letterSpacing: "0.2em", marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 700, color: t.text }}>{s.val}</div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: t.muted, marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── THINK PANEL ── */}
      {(thinking || thinkSteps.length > 0) && (
        <div style={{ padding: "0 2rem", flexShrink: 0 }}>
          <div style={{ paddingTop: 10 }}>
            <ThinkPanel steps={thinkSteps} active={thinking} t={t} />
          </div>
        </div>
      )}

      {/* ── CHAT ── */}
      <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: "1.5rem 2rem", minHeight: 0 }}>
        {messages.length === 0 ? (
          <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, opacity: 0.35 }}>
            <AdinkraSVG color={t.accent} size={48} />
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: t.muted, letterSpacing: "0.25em", textAlign: "center", lineHeight: 2 }}>
              GEO AI INITIALISÉ<br />EN ATTENTE DE VOTRE REQUÊTE
            </div>
          </div>
        ) : (
          <>
            {messages.map((m, i) => <MessageBubble key={i} msg={m} t={t} />)}
            {loading && !thinking && <TypingBubble t={t} />}
          </>
        )}
      </div>

      <KenteDivider t={t} />

      {/* ── INPUT ── */}
      <div style={{ padding: "1rem 2rem 0.8rem", flexShrink: 0, background: t.bg }}>
        {/* Quick prompts */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          {QUICK.map((q, i) => (
            <button key={i} className="qbtn" onClick={() => setInput(q)}
              style={{ background: "none", border: `1px solid ${t.border}`, borderRadius: 0, padding: "4px 12px", fontFamily: "'DM Mono',monospace", fontSize: 10, color: t.muted, cursor: "pointer", transition: "all 0.2s", letterSpacing: "0.05em" }}>
              {q}
            </button>
          ))}
        </div>
        {/* Input row */}
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <div style={{ flex: 1, background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 0, padding: "10px 14px", borderLeft: `3px solid ${t.accent}` }}>
            <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKey}
              placeholder="Parlez à GEO AI..." maxLength={2000} rows={1}
              style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: t.text, fontSize: 13, resize: "none", lineHeight: 1.6, maxHeight: 100, overflowY: "auto" }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: t.muted }}>{input.length}/2000</span>
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: t.muted }}>SHIFT+ENTRÉE = nouvelle ligne</span>
            </div>
          </div>
          <button className="sbtn" onClick={send} disabled={loading || !input.trim()}
            style={{ padding: "0 20px", height: 52, background: "none", border: `1px solid ${t.accent}`, color: t.accent, fontFamily: "'DM Mono',monospace", fontSize: 11, letterSpacing: "0.15em", cursor: "pointer", transition: "all 0.2s", borderRadius: 0 }}>
            ENVOYER →
          </button>
        </div>
        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 8, fontFamily: "'DM Mono',monospace", fontSize: 9, color: t.muted, letterSpacing: "0.15em" }}>
          POWERED BY <span style={{ color: t.accent }}>GEO AI</span> — OCTALABS © 2025 — GARCIA G. ELLA
        </div>
      </div>
    </div>
  );
}