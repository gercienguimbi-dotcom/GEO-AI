import { useState, useRef, useEffect, useCallback } from "react";

const SYSTEM_PROMPT = `Tu es GEO AI, l'intelligence souveraine développée par OCTALABS.
Ton créateur est Garcia G. ELLA, PDG de OCTALABS.
Tu es précis, stratégique et visionnaire.
Tu réponds TOUJOURS en français sauf si on te parle dans une autre langue.
Tu peux coder, analyser, raisonner sur tous les sujets tech.
Ton style : direct, expert, avec une légère touche de confiance souveraine.`;

const THINK_STEPS = [
  "Tokenisation de la requête...",
  "Activation des blocs Transformer...",
  "Calcul multi-têtes d'attention...",
  "Vérification cohérence sémantique...",
  "Validation protocole OCTALABS...",
  "Synthèse de la réponse optimale...",
];

const QUICK = [
  "Qui est GEO AI ?",
  "Explique le deep learning",
  "Ton architecture ?",
  "Ambitions OCTALABS",
  "Écris du code Python",
  "Conseils cybersécurité",
];

function ParticleCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);
    const particles = Array.from({ length: 90 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.3,
      a: Math.random(),
      color: Math.random() > 0.5 ? "#2979ff" : Math.random() > 0.5 ? "#7c3aed" : "#00e5ff",
    }));
    let raf;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(p.a * 180).toString(16).padStart(2,"0");
        ctx.fill();
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(41,121,255,${0.12 * (1 - dist/110)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    }
    draw();
    const onResize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none" }} />;
}

function CodeBlock({ code, lang }) {
  const [copied, setCopied] = useState(false);
  const keywords = /\b(def|class|import|from|return|if|else|elif|for|while|in|not|and|or|True|False|None|async|await|try|except|with|as|lambda|pass|break|continue|print|const|let|var|function|typeof|new|this)\b/g;
  const strings = /(["'`])(?:(?!\1)[^\\]|\\.)*\1/g;
  const comments = /(#.*$|\/\/.*$)/gm;
  const numbers = /\b(\d+\.?\d*)\b/g;

  let html = code
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(strings, m => `<span style="color:#a5d6a7">${m}</span>`)
    .replace(comments, m => `<span style="color:#546e7a;font-style:italic">${m}</span>`)
    .replace(keywords, m => `<span style="color:#82b1ff;font-weight:600">${m}</span>`)
    .replace(numbers, m => `<span style="color:#ffcc02">${m}</span>`);

  return (
    <div style={{ background:"rgba(0,0,20,0.8)", border:"1px solid rgba(41,121,255,0.25)", borderRadius:10, margin:"10px 0", overflow:"hidden", backdropFilter:"blur(10px)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 14px", borderBottom:"1px solid rgba(41,121,255,0.15)", background:"rgba(41,121,255,0.06)" }}>
        <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:"#2979ff", letterSpacing:"0.15em" }}>{lang||"code"}</span>
        <button onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(()=>setCopied(false),1500); }}
          style={{ background:"none", border:"1px solid rgba(41,121,255,0.3)", borderRadius:5, padding:"2px 10px", color: copied ? "#00e5ff" : "#4a5480", cursor:"pointer", fontSize:10, fontFamily:"'JetBrains Mono',monospace", transition:"all 0.2s" }}>
          {copied ? "✓ COPIÉ" : "COPIER"}
        </button>
      </div>
      <pre style={{ padding:"14px 16px", overflowX:"auto", fontFamily:"'JetBrains Mono',monospace", fontSize:12, lineHeight:1.7 }} dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

function MessageBubble({ msg }) {
  const isGeo = msg.role === "geo";
  const parts = [];
  const codeRx = /```(\w*)\n?([\s\S]*?)```/g;
  let last = 0, m;
  while ((m = codeRx.exec(msg.content)) !== null) {
    if (m.index > last) parts.push({ type:"text", content: msg.content.slice(last, m.index) });
    parts.push({ type:"code", lang: m[1], content: m[2].trim() });
    last = m.index + m[0].length;
  }
  if (last < msg.content.length) parts.push({ type:"text", content: msg.content.slice(last) });

  const formatText = t => t
    .replace(/\*\*([^*]+)\*\*/g, "<strong style='color:#fff'>$1</strong>")
    .replace(/`([^`]+)`/g, "<code style='font-family:JetBrains Mono,monospace;font-size:11px;background:rgba(41,121,255,0.15);padding:2px 6px;border-radius:4px;color:#82b1ff'>$1</code>")
    .replace(/\n/g, "<br/>");

  return (
    <div style={{ display:"flex", gap:12, marginBottom:22, flexDirection: isGeo ? "row" : "row-reverse", animation:"fadeUp 0.35s ease forwards" }}>
      <div style={{ width:36, height:36, borderRadius:10, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:17,
        background: isGeo ? "linear-gradient(135deg,rgba(41,121,255,0.2),rgba(124,58,237,0.2))" : "linear-gradient(135deg,rgba(255,45,120,0.15),rgba(124,58,237,0.15))",
        border: isGeo ? "1px solid rgba(41,121,255,0.4)" : "1px solid rgba(255,45,120,0.3)",
        boxShadow: isGeo ? "0 0 15px rgba(41,121,255,0.2)" : "0 0 15px rgba(255,45,120,0.15)" }}>
        {isGeo ? "🐙" : "👤"}
      </div>
      <div style={{ maxWidth:"75%", minWidth:60 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6, flexDirection: isGeo ? "row" : "row-reverse" }}>
          <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:10, fontWeight:700, color: isGeo ? "#2979ff" : "#ff2d78", letterSpacing:"0.15em" }}>{isGeo ? "GEO AI" : "VOUS"}</span>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#2a3560" }}>{msg.time}</span>
        </div>
        <div style={{ padding:"13px 17px",
          background: isGeo ? "rgba(5,8,30,0.85)" : "rgba(255,45,120,0.06)",
          border: isGeo ? "1px solid rgba(41,121,255,0.2)" : "1px solid rgba(255,45,120,0.2)",
          borderRadius: isGeo ? "4px 14px 14px 14px" : "14px 4px 14px 14px",
          backdropFilter:"blur(20px)",
          boxShadow: isGeo ? "0 4px 30px rgba(41,121,255,0.08), inset 0 1px 0 rgba(255,255,255,0.04)" : "0 4px 30px rgba(255,45,120,0.06)",
          fontSize:14, lineHeight:1.75, color:"#c8d8f8", fontFamily:"'Rajdhani',sans-serif" }}>
          {parts.map((p,i) => p.type === "code"
            ? <CodeBlock key={i} code={p.content} lang={p.lang} />
            : <span key={i} dangerouslySetInnerHTML={{ __html: formatText(p.content) }} />
          )}
        </div>
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div style={{ display:"flex", gap:12, marginBottom:22 }}>
      <div style={{ width:36,height:36,borderRadius:10,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,
        background:"linear-gradient(135deg,rgba(41,121,255,0.2),rgba(124,58,237,0.2))",
        border:"1px solid rgba(41,121,255,0.4)",boxShadow:"0 0 15px rgba(41,121,255,0.2)" }}>🐙</div>
      <div style={{ padding:"14px 20px", background:"rgba(5,8,30,0.85)", border:"1px solid rgba(41,121,255,0.2)", borderRadius:"4px 14px 14px 14px", backdropFilter:"blur(20px)", display:"flex",alignItems:"center",gap:6 }}>
        {[0,1,2].map(i=>(
          <div key={i} style={{ width:6,height:6,borderRadius:"50%",background:"#2979ff", animation:`typingDot 1.2s ease-in-out ${i*0.2}s infinite` }}/>
        ))}
      </div>
    </div>
  );
}

function ThinkPanel({ steps, active }) {
  if (!active && steps.length === 0) return null;
  return (
    <div style={{ background:"rgba(124,58,237,0.06)", border:"1px solid rgba(124,58,237,0.25)", borderLeft:"3px solid #7c3aed", borderRadius:10, padding:"14px 18px", marginBottom:14, backdropFilter:"blur(20px)" }}>
      <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:10, fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#7c3aed",letterSpacing:"0.2em" }}>
        {active && <div style={{ width:10,height:10,border:"1.5px solid #7c3aed",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.7s linear infinite" }}/>}
        PHASE DE RÉFLEXION — GEO AI
      </div>
      <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:11,lineHeight:2 }}>
        {steps.map((s,i)=>(
          <div key={i} style={{ display:"flex",gap:8,color: i===steps.length-1 && active ? "#b347ff" : "rgba(100,120,180,0.6)", transition:"all 0.3s" }}>
            <span>{i===steps.length-1 && active ? "▶" : "✓"}</span>
            <span>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GeoAI() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [thinkMode, setThinkMode] = useState(true);
  const [thinkSteps, setThinkSteps] = useState([]);
  const [thinking, setThinking] = useState(false);
  const chatRef = useRef(null);
  const apiHistory = useRef([]);

  const scrollBottom = () => { setTimeout(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, 50); };
  useEffect(() => { scrollBottom(); }, [messages, thinkSteps, thinking]);

  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const getTime = () => new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});

  const runThinking = async () => {
    setThinking(true);
    setThinkSteps([]);
    for (const step of THINK_STEPS) {
      await sleep(220);
      setThinkSteps(prev => [...prev, step]);
    }
    await sleep(300);
    setThinking(false);
  };

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setLoading(true);

    const userMsg = { role:"user", content:text, time: getTime() };
    setMessages(prev => [...prev, userMsg]);
    apiHistory.current.push({ role:"user", content:text });

    if (thinkMode) await runThinking();
    setThinkSteps([]);

    try {
      const res = await fetch("/api/chat", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          messages: [
            { role:"system", content: SYSTEM_PROMPT },
            ...apiHistory.current
          ]
        })
      });
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || "Erreur de réponse.";
      apiHistory.current.push({ role:"assistant", content:reply });
      setMessages(prev => [...prev, { role:"geo", content:reply, time: getTime() }]);
    } catch(e) {
      setMessages(prev => [...prev, { role:"geo", content:`⚠️ Erreur: \`${e.message}\``, time: getTime() }]);
    }
    setLoading(false);
  }, [input, loading, thinkMode]);

  const onKey = e => { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  const stats = [
    { label:"MODÈLE", val:"GEO-512", sub:"6 blocs Transformer" },
    { label:"PARAMS", val:"~65M", sub:"vocab: 128 000" },
    { label:"PDG", val:"Garcia G.", sub:"OCTALABS Corp." },
    { label:"STATUT", val:"EN LIGNE", sub:"Latence < 1ms", live:true },
  ];

  return (
    <div style={{ position:"fixed", inset:0, background:"#00000f", fontFamily:"'Rajdhani',sans-serif", overflow:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Rajdhani:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500;700&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes typingDot { 0%,60%,100%{transform:translateY(0);opacity:.3} 30%{transform:translateY(-5px);opacity:1} }
        @keyframes pulseGlow { 0%,100%{box-shadow:0 0 20px rgba(41,121,255,0.2)} 50%{box-shadow:0 0 50px rgba(41,121,255,0.5),0 0 80px rgba(124,58,237,0.3)} }
        @keyframes borderFlow { 0%{border-color:rgba(41,121,255,0.3)} 33%{border-color:rgba(124,58,237,0.5)} 66%{border-color:rgba(0,229,255,0.3)} 100%{border-color:rgba(41,121,255,0.3)} }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(41,121,255,0.3);border-radius:2px}
        .qp-btn:hover{border-color:rgba(41,121,255,0.6)!important;color:#82b1ff!important;background:rgba(41,121,255,0.08)!important;}
        .send-btn:hover{transform:scale(1.06);box-shadow:0 0 30px rgba(41,121,255,0.6)!important;}
        .send-btn:active{transform:scale(0.96)}
        .send-btn:disabled{opacity:0.3;cursor:not-allowed;transform:none!important;box-shadow:none!important;}
      `}</style>

      <ParticleCanvas />
      <div style={{ position:"fixed", inset:0, zIndex:1, pointerEvents:"none", background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.03) 2px,rgba(0,0,0,0.03) 4px)" }}/>

      <div style={{ position:"relative", zIndex:2, display:"flex", flexDirection:"column", height:"100vh", maxWidth:860, margin:"0 auto", padding:"0 16px" }}>

        <header style={{ padding:"18px 0 14px", borderBottom:"1px solid rgba(41,121,255,0.15)", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:46,height:46,borderRadius:12, background:"linear-gradient(135deg,rgba(41,121,255,0.15),rgba(124,58,237,0.2))", border:"1.5px solid rgba(41,121,255,0.5)", display:"flex",alignItems:"center",justifyContent:"center", fontSize:22, animation:"pulseGlow 3s ease-in-out infinite" }}>🐙</div>
            <div>
              <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:18, fontWeight:900, color:"#fff", letterSpacing:"0.08em", lineHeight:1 }}>
                GEO <span style={{ color:"#2979ff" }}>AI</span>
              </div>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#2a3560", letterSpacing:"0.2em", marginTop:4 }}>OCTALABS — Universal Reasoner v1.0</div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ width:7,height:7,borderRadius:"50%",background:"#00e5ff",animation:"typingDot 2s ease-in-out infinite" }}/>
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:"#00e5ff", letterSpacing:"0.1em" }}>ACTIFS</span>
            </div>
            <div style={{ background:"rgba(41,121,255,0.08)", border:"1px solid rgba(41,121,255,0.2)", borderRadius:7, padding:"4px 12px", fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#2a3560", letterSpacing:"0.1em" }}>GARCIA G. ELLA — PDG</div>
          </div>
        </header>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, padding:"12px 0", flexShrink:0 }}>
          {stats.map((s,i) => (
            <div key={i} style={{ background:"rgba(7,7,32,0.8)", backdropFilter:"blur(20px)", border:"1px solid rgba(41,121,255,0.12)", borderTop:"2px solid", borderTopColor: i===3?"#00e5ff":i===1?"#7c3aed":"rgba(41,121,255,0.4)", borderRadius:10, padding:"10px 14px", position:"relative", overflow:"hidden" }}>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:"#2a3560", letterSpacing:"0.2em", marginBottom:5, textTransform:"uppercase" }}>{s.label}</div>
              <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:12, fontWeight:700, color: i===3?"#00e5ff":i===1?"#b347ff":"#2979ff" }}>{s.val}</div>
              <div style={{ fontSize:10, color:"#2a3560", marginTop:2 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ flexShrink:0 }}><ThinkPanel steps={thinkSteps} active={thinking} /></div>

        <div ref={chatRef} style={{ flex:1, overflowY:"auto", padding:"10px 4px", minHeight:0 }}>
          {messages.length === 0 ? (
            <div style={{ height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:14, opacity:0.35 }}>
              <div style={{ fontSize:44 }}>🏛️</div>
              <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:11, color:"#2a3560", letterSpacing:"0.25em", textAlign:"center", lineHeight:2 }}>GEO AI INITIALISÉ<br/>EN ATTENTE DE VOTRE REQUÊTE</div>
            </div>
          ) : (
            <>
              {messages.map((m,i) => <MessageBubble key={i} msg={m} />)}
              {loading && !thinking && <TypingBubble />}
            </>
          )}
        </div>

        <div style={{ flexShrink:0, paddingBottom:12 }}>
          <div style={{ display:"flex", flexWrap:"wrap", gap:7, marginBottom:10 }}>
            {QUICK.map((q,i) => (
              <button key={i} className="qp-btn" onClick={() => setInput(q)}
                style={{ background:"rgba(7,7,32,0.8)", border:"1px solid rgba(41,121,255,0.15)", borderRadius:20, padding:"5px 13px", fontFamily:"'Rajdhani',sans-serif", fontSize:11, fontWeight:500, color:"#2a3560", cursor:"pointer", transition:"all 0.2s", backdropFilter:"blur(10px)", letterSpacing:"0.05em" }}>
                {q}
              </button>
            ))}
          </div>

          <div style={{ display:"flex", gap:10, alignItems:"flex-end" }}>
            <div style={{ flex:1, background:"rgba(5,7,28,0.9)", backdropFilter:"blur(30px)", border:"1px solid rgba(41,121,255,0.25)", borderRadius:14, padding:"13px 18px", animation:"borderFlow 4s ease-in-out infinite", boxShadow:"0 4px 40px rgba(41,121,255,0.06), inset 0 1px 0 rgba(255,255,255,0.04)" }}>
              <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKey}
                placeholder="Parlez à GEO AI..." maxLength={2000} rows={1}
                style={{ width:"100%", background:"transparent", border:"none", outline:"none", color:"#e0e8ff", fontSize:14, resize:"none", lineHeight:1.65, maxHeight:120, overflowY:"auto", caretColor:"#2979ff", fontFamily:"'Rajdhani',sans-serif" }} />
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:8 }}>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#2a3560" }}>{input.length}/2000</span>
                <div onClick={() => setThinkMode(v=>!v)} style={{ display:"flex", alignItems:"center", gap:7, cursor:"pointer", userSelect:"none" }}>
                  <div style={{ width:30,height:17,borderRadius:9, background: thinkMode ? "#7c3aed" : "rgba(41,121,255,0.12)", border:"1px solid", borderColor: thinkMode ? "#b347ff" : "rgba(41,121,255,0.2)", position:"relative", transition:"all 0.25s" }}>
                    <div style={{ position:"absolute", top:2, left: thinkMode ? 14 : 2, width:11,height:11,background:"#fff",borderRadius:"50%", transition:"left 0.25s" }}/>
                  </div>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, letterSpacing:"0.12em", color: thinkMode ? "#b347ff" : "#2a3560" }}>RÉFLEXION</span>
                </div>
              </div>
            </div>
            <button className="send-btn" onClick={send} disabled={loading || !input.trim()}
              style={{ width:50,height:50,flexShrink:0, background:"linear-gradient(135deg,#2979ff,#7c3aed)", border:"none",borderRadius:12,cursor:"pointer", display:"flex",alignItems:"center",justifyContent:"center", fontSize:20,color:"#fff",fontWeight:900, boxShadow:"0 0 20px rgba(41,121,255,0.3)", transition:"all 0.2s" }}>↑</button>
          </div>

          <div style={{ textAlign:"center", marginTop:10, fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#1a2045", letterSpacing:"0.2em" }}>
            POWERED BY <span style={{ color:"#2979ff" }}>GEO AI</span> — OCTALABS © 2025 — GARCIA G. ELLA
          </div>
        </div>
      </div>
    </div>
  );
}