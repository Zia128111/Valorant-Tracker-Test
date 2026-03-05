import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  bg:      "hsl(240 15% 6%)",
  surface: "hsl(240 15% 10%)",
  raised:  "hsl(240 15% 13%)",
  inset:   "hsl(240 15% 8%)",
  stroke:  "hsl(240 10% 18%)",
  muted:   "hsl(240 5% 55%)",
  text:    "hsl(0 0% 96%)",
  accent:  "#ff4655",
  green:   "#22c55e",
  purple:  "#a78bfa",
};

// Reusable inner wrapper — max-width + horizontal padding
const Inner = ({ children, style = {} }) => (
  <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 48px", ...style }}>
    {children}
  </div>
);

// Section label + heading
const SectionHead = ({ label, title }) => (
  <div style={{ marginBottom: 48 }}>
    <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11, letterSpacing: "0.45em", color: C.accent, marginBottom: 8, textTransform: "uppercase" }}>{label}</div>
    <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 700, color: C.text, letterSpacing: "0.03em", margin: 0 }}>{title}</h2>
  </div>
);

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const SKIN_MARKET = [
  { id: 1, name: "Reaver Vandal",      weapon: "Vandal",   price: 2475, change: 4.2,  volume: "12.4k", positive: true,  sparks: [40,55,45,60,52,70,65,80,75,90] },
  { id: 2, name: "Prime Phantom",      weapon: "Phantom",  price: 1775, change: -2.1, volume: "9.1k",  positive: false, sparks: [80,70,75,60,65,50,55,45,50,40] },
  { id: 3, name: "Glitchpop Operator", weapon: "Operator", price: 2675, change: 7.8,  volume: "6.8k",  positive: true,  sparks: [30,35,40,55,50,60,70,75,80,95] },
];

const MATCHES = [
  { id: 1, map: "Ascent", result: "VICTORY", agent: "Jett",    agentEmoji: "🌪️", kda: "24/8/6",   acs: 312, hs: "38%", damage: 85, entry: 72, clutch: 60, rr: "+22", duration: "28:14" },
  { id: 2, map: "Bind",   result: "DEFEAT",  agent: "Omen",    agentEmoji: "🌑", kda: "14/15/9",  acs: 198, hs: "22%", damage: 58, entry: 44, clutch: 30, rr: "-15", duration: "35:47" },
  { id: 3, map: "Haven",  result: "VICTORY", agent: "Sage",    agentEmoji: "🌿", kda: "18/10/14", acs: 241, hs: "29%", damage: 67, entry: 55, clutch: 45, rr: "+18", duration: "31:02" },
  { id: 4, map: "Pearl",  result: "DEFEAT",  agent: "Chamber", agentEmoji: "🎯", kda: "11/18/4",  acs: 172, hs: "19%", damage: 48, entry: 38, clutch: 20, rr: "-20", duration: "33:55" },
];

const INSIGHTS = [
  { icon: "📍", text: "You perform 18% better on Ascent than any other map" },
  { icon: "⚡", text: "Your clutch rate improved by 12% this week" },
  { icon: "🛡️", text: "Play more Controller for higher team win rate" },
  { icon: "🎯", text: "Headshot % peaks during the first 3 rounds — stay aggressive" },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function useCountUp(target, duration = 1600, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let t0 = null;
    const tick = (ts) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / duration, 1);
      setCount(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration, start]);
  return count;
}

function Sparkline({ data, positive }) {
  const max = Math.max(...data), min = Math.min(...data);
  const h = (v) => 28 - ((v - min) / (max - min || 1)) * 24;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${h(v)}`).join(" ");
  return (
    <svg viewBox="0 0 100 28" style={{ width: "100%", height: 32 }} preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={positive ? C.green : C.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ProgressBar({ value, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} style={{ height: 5, borderRadius: 99, background: C.stroke, overflow: "hidden" }}>
      <motion.div
        style={{ height: "100%", borderRadius: 99, background: `linear-gradient(90deg, ${C.accent}, #ff7b7b)` }}
        initial={{ width: 0 }}
        animate={{ width: inView ? `${value}%` : 0 }}
        transition={{ duration: 1.1, ease: "easeOut", delay }}
      />
    </div>
  );
}

function CircleStat({ label, value, color = C.accent }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const r = 38, dash = 2 * Math.PI * r;
  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <svg width={96} height={96} viewBox="0 0 96 96">
        <circle cx={48} cy={48} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={7} />
        <motion.circle
          cx={48} cy={48} r={r} fill="none" stroke={color} strokeWidth={7} strokeLinecap="round"
          strokeDasharray={dash}
          initial={{ strokeDashoffset: dash }}
          animate={{ strokeDashoffset: inView ? dash - (dash * value) / 100 : dash }}
          transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }}
          style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
        />
        <text x={48} y={53} textAnchor="middle" fill="white" fontSize={13} fontWeight={700} fontFamily="'Orbitron', sans-serif">{value}%</text>
      </svg>
      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</span>
    </div>
  );
}

// ─── LOADING SCREEN ───────────────────────────────────────────────────────────
function LoadingScreen({ onComplete }) {
  const [count, setCount] = useState(0);
  const [wordIdx, setWordIdx] = useState(0);
  const words = ["TRACK", "ANALYZE", "DOMINATE"];
  const done = useRef(false);

  useEffect(() => {
    const iv = setInterval(() => setCount(c => { if (c >= 100) { clearInterval(iv); return 100; } return c + 1; }), 20);
    const wv = setInterval(() => setWordIdx(w => (w + 1) % 3), 600);
    const t  = setTimeout(() => { if (!done.current) { done.current = true; onComplete(); } }, 2500);
    return () => { clearInterval(iv); clearInterval(wv); clearTimeout(t); };
  }, []);

  return (
    <motion.div exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
      style={{ position: "fixed", inset: 0, zIndex: 50, background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
        <div style={{ position: "absolute", inset: -120, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,70,85,0.18) 0%, transparent 70%)" }} />
        <div style={{ textAlign: "center", position: "relative" }}>
          <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11, letterSpacing: "0.5em", color: C.accent, marginBottom: 16 }}>SPIKESTATS</div>
          <AnimatePresence mode="wait">
            <motion.div key={wordIdx}
              style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "clamp(3rem,8vw,6rem)", fontWeight: 800, color: "white", letterSpacing: "0.12em" }}
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} transition={{ duration: 0.28 }}>
              {words[wordIdx]}
            </motion.div>
          </AnimatePresence>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, width: 260 }}>
          <div style={{ width: "100%", height: 2, background: C.stroke, borderRadius: 99, overflow: "hidden", position: "relative" }}>
            <motion.div animate={{ width: `${count}%` }} transition={{ ease: "linear", duration: 0.02 }}
              style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, ${C.accent}, #ff7b7b)`, boxShadow: `0 0 12px ${C.accent}` }} />
          </div>
          <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, color: C.muted, letterSpacing: "0.25em" }}>{String(count).padStart(3, "0")}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
function Navbar({ activeSection }) {
  const links = ["Home", "Market", "Matches", "Stats"];
  const ids   = ["hero", "market", "matches", "stats"];

  return (
    <motion.nav initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.1 }}
      style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 40, background: "hsla(240,15%,6%,0.9)", backdropFilter: "blur(18px)", borderBottom: `1px solid ${C.stroke}` }}>
      <Inner style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 48px" }}>
        <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 17, fontWeight: 700, letterSpacing: "0.08em" }}>
          <span style={{ color: C.accent }}>SPIKE</span><span style={{ color: "white" }}>STATS</span>
        </div>
        <div style={{ display: "flex", gap: 36 }}>
          {links.map((l, i) => (
            <a key={l} href={`#${ids[i]}`}
              onClick={e => { e.preventDefault(); document.getElementById(ids[i])?.scrollIntoView({ behavior: "smooth" }); }}
              style={{ position: "relative", fontFamily: "'Inter', sans-serif", fontSize: 13, letterSpacing: "0.05em", color: activeSection === ids[i] ? "white" : C.muted, textDecoration: "none", transition: "color 0.2s", paddingBottom: 4 }}>
              {l}
              {activeSection === ids[i] && (
                <motion.div layoutId="navline" style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, ${C.accent}, #ff7b7b)` }} />
              )}
            </a>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.green, boxShadow: `0 0 8px ${C.green}` }} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: C.green, letterSpacing: "0.1em" }}>LIVE</span>
        </div>
      </Inner>
    </motion.nav>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function HeroSearch() {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("NA");
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const go = () => {
    if (!query.trim()) return;
    setSearching(true);
    setTimeout(() => { setSearching(false); setSearched(true); document.getElementById("matches")?.scrollIntoView({ behavior: "smooth" }); }, 1200);
  };

  return (
    <section id="hero" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", paddingTop: 100, paddingBottom: 80 }}>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `linear-gradient(${C.stroke}55 1px, transparent 1px), linear-gradient(90deg, ${C.stroke}55 1px, transparent 1px)`,
        backgroundSize: "60px 60px" }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
        <div style={{ width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,70,85,0.1) 0%, transparent 70%)" }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
        style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 36, padding: "0 32px", textAlign: "center", maxWidth: 700, width: "100%" }}>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
          style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11, letterSpacing: "0.45em", color: C.accent, padding: "8px 20px", borderRadius: 99, background: "rgba(255,70,85,0.1)", border: "1px solid rgba(255,70,85,0.25)" }}>
          VALORANT PERFORMANCE TRACKER
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7 }}
          style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "clamp(1.9rem, 4vw, 3.4rem)", fontWeight: 700, color: "white", lineHeight: 1.15, letterSpacing: "0.02em", margin: 0 }}>
          Track Your Valorant<br />
          <span style={{ background: "linear-gradient(90deg, #ff4655, #ff7b7b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Performance</span>{" "}Like a Pro
        </motion.h1>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          style={{ fontFamily: "'Inter', sans-serif", color: C.muted, fontSize: 15, maxWidth: 480, lineHeight: 1.75, margin: 0 }}>
          Real-time stats, match history, skin market trends and deep performance analytics — all in one place.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
          style={{ display: "flex", gap: 10, width: "100%", maxWidth: 540, flexWrap: "wrap", justifyContent: "center" }}>
          <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && go()}
            placeholder="RiotID#TAG"
            style={{ flex: 1, minWidth: 180, height: 48, padding: "0 20px", borderRadius: 99, background: C.surface, border: `1px solid ${C.stroke}`, color: "white", fontFamily: "'Inter', sans-serif", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          <select value={region} onChange={e => setRegion(e.target.value)}
            style={{ height: 48, padding: "0 16px", borderRadius: 99, background: C.surface, border: `1px solid ${C.stroke}`, color: C.muted, fontFamily: "'Inter', sans-serif", fontSize: 13, outline: "none", minWidth: 84, boxSizing: "border-box" }}>
            {["NA","EU","AP","KR","BR","LATAM"].map(r => <option key={r}>{r}</option>)}
          </select>
          <motion.button onClick={go} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            style={{ height: 48, padding: "0 28px", borderRadius: 99, background: `linear-gradient(90deg, ${C.accent}, #ff7b7b)`, color: "white", fontFamily: "'Orbitron', sans-serif", fontSize: 12, letterSpacing: "0.06em", fontWeight: 700, border: "none", cursor: "pointer", whiteSpace: "nowrap", boxShadow: "0 0 20px rgba(255,70,85,0.35)", boxSizing: "border-box" }}>
            {searching ? "SEARCHING…" : "TRACK PLAYER"}
          </motion.button>
        </motion.div>

        {searched && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: C.green }}>
            ✓ Player found — showing stats for <strong style={{ color: "white" }}>{query}</strong>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
          style={{ display: "flex", gap: 20, marginTop: 8, opacity: 0.45 }}>
          {[["Diamond","#a78bfa"], ["Ascendant","#22c55e"], ["Immortal","#f97316"], ["Radiant","#ffd700"]].map(([rank, col]) => (
            <div key={rank} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: `${col}22`, border: `1px solid ${col}55`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Orbitron', sans-serif", fontSize: 9, color: col, fontWeight: 700 }}>{rank[0]}</div>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, color: C.muted, letterSpacing: "0.05em" }}>{rank}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
        style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <div style={{ width: 1, height: 40, background: `linear-gradient(to bottom, transparent, ${C.stroke})` }} />
        <div style={{ width: 4, height: 4, borderRadius: "50%", background: C.stroke }} />
      </motion.div>
    </section>
  );
}

// ─── LIVE MARKET ──────────────────────────────────────────────────────────────
function LiveMarket() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [prices, setPrices] = useState(SKIN_MARKET.map(s => s.price));

  useEffect(() => {
    const t = setInterval(() => setPrices(p => p.map(v => Math.max(500, Math.round(v + (Math.random() - 0.5) * 28)))), 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="market" ref={ref} style={{ background: C.inset, padding: "96px 0" }}>
      <Inner>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 48 }}>
          <SectionHead label="Live Overview" title="Skin Market · Daily" />
          <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 4 }}>
            <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}
              style={{ width: 8, height: 8, borderRadius: "50%", background: C.green }} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: C.green, letterSpacing: "0.1em" }}>LIVE</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {SKIN_MARKET.map((skin, i) => {
            const live = prices[i];
            const chg  = (((live - skin.price) / skin.price) * 100 + skin.change).toFixed(1);
            const pos  = parseFloat(chg) >= 0;
            return (
              <motion.div key={skin.id}
                initial={{ opacity: 0, y: 28 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: i * 0.12 }}
                whileHover={{ scale: 1.02, boxShadow: pos ? "0 0 32px rgba(34,197,94,0.14)" : "0 0 32px rgba(255,70,85,0.14)" }}
                style={{ background: C.surface, border: `1px solid ${C.stroke}`, borderRadius: 18, padding: 28, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${pos ? C.green : C.accent}88, transparent)` }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                  <div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>{skin.weapon}</div>
                    <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 15, fontWeight: 700, color: "white" }}>{skin.name}</div>
                  </div>
                  <motion.div key={live} initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 0.25 }} style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 18, fontWeight: 700, color: "white" }}>{live.toLocaleString()} <span style={{ fontSize: 11, color: C.muted }}>VP</span></div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: pos ? C.green : C.accent }}>{pos ? "▲" : "▼"} {Math.abs(chg)}%</div>
                  </motion.div>
                </div>
                <Sparkline data={skin.sparks} positive={pos} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14 }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: C.muted }}>Vol: {skin.volume}</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: C.muted }}>24h</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Inner>
    </section>
  );
}

// ─── RECENT MATCHES ───────────────────────────────────────────────────────────
function RecentMatches() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="matches" ref={ref} style={{ padding: "96px 0" }}>
      <Inner>
        <SectionHead label="Match History" title="Recently Played" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24 }}>
          {MATCHES.map((match, i) => {
            const won = match.result === "VICTORY";
            return (
              <motion.div key={match.id}
                initial={{ opacity: 0, y: 36 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ rotate: won ? 0.4 : -0.4, boxShadow: won ? "0 10px 40px rgba(34,197,94,0.1)" : "0 10px 40px rgba(255,70,85,0.1)" }}
                style={{ background: C.surface, border: `1px solid ${C.stroke}`, borderRadius: 20, padding: 28, position: "relative", overflow: "hidden" }}>

                <div style={{ position: "absolute", top: 0, left: 32, right: 32, height: 1, background: `linear-gradient(90deg, transparent, ${won ? "rgba(34,197,94,0.5)" : "rgba(255,70,85,0.35)"}, transparent)` }} />

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: C.raised, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                      {match.agentEmoji}
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 14, fontWeight: 700, color: "white", marginBottom: 4 }}>{match.map}</div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: C.muted, letterSpacing: "0.04em" }}>{match.agent} · {match.duration}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13, fontWeight: 700, color: won ? C.green : C.accent }}>{match.rr}</span>
                    <div style={{ padding: "5px 12px", borderRadius: 99, background: won ? "rgba(34,197,94,0.1)" : "rgba(255,70,85,0.1)", border: `1px solid ${won ? "rgba(34,197,94,0.28)" : "rgba(255,70,85,0.28)"}`, color: won ? C.green : C.accent, fontFamily: "'Orbitron', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>
                      {match.result}
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 24 }}>
                  {[["K/D/A", match.kda], ["ACS", match.acs], ["HS%", match.hs], ["MODE", "Comp"]].map(([label, val]) => (
                    <div key={label} style={{ background: C.inset, borderRadius: 12, padding: "12px 8px", textAlign: "center" }}>
                      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13, fontWeight: 700, color: "white", marginBottom: 4 }}>{val}</div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {[["DMG Dealt", match.damage], ["Entry", match.entry], ["Clutch", match.clutch]].map(([label, val], bi) => (
                    <div key={label}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: C.muted, letterSpacing: "0.04em" }}>{label}</span>
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: C.muted }}>{val}%</span>
                      </div>
                      <ProgressBar value={val} delay={bi * 0.1 + i * 0.05} />
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </Inner>
    </section>
  );
}

// ─── PERFORMANCE OVERVIEW ─────────────────────────────────────────────────────
function PerformanceOverview() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const rr = useCountUp(78, 1500, inView);
  const wr = useCountUp(62, 1500, inView);
  const kd = useCountUp(142, 1500, inView);
  const hs = useCountUp(31, 1500, inView);

  return (
    <section id="stats" ref={ref} style={{ background: C.inset, padding: "96px 0" }}>
      <Inner>
        <SectionHead label="Analytics" title="Performance Overview" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24, alignItems: "start" }}>

          <motion.div initial={{ opacity: 0, x: -28 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6, delay: 0.1 }}
            style={{ background: C.surface, border: `1px solid ${C.stroke}`, borderRadius: 20, padding: 36 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 32 }}>
              <div style={{ position: "relative" }}>
                <div style={{ width: 76, height: 76, borderRadius: 18, background: "linear-gradient(135deg, hsl(250 60% 20%), hsl(250 60% 30%))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, border: `2px solid ${C.purple}44` }}>💎</div>
                <div style={{ position: "absolute", inset: -4, borderRadius: 20, background: `linear-gradient(135deg, ${C.purple}, #818cf8)`, opacity: 0.25, filter: "blur(8px)", zIndex: -1 }} />
              </div>
              <div>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 10, letterSpacing: "0.3em", color: C.muted, marginBottom: 6 }}>CURRENT RANK</div>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 24, fontWeight: 700, color: "white", marginBottom: 4 }}>Diamond 2</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: C.purple }}>78 / 100 RR</div>
              </div>
            </div>

            <div style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: C.muted }}>Rank Rating Progress</span>
                <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, color: C.purple }}>{rr} RR</span>
              </div>
              <div style={{ height: 8, borderRadius: 99, background: C.stroke, overflow: "hidden" }}>
                <motion.div style={{ height: "100%", borderRadius: 99, background: `linear-gradient(90deg, ${C.purple}, #818cf8)` }}
                  initial={{ width: 0 }} animate={{ width: inView ? `${rr}%` : 0 }} transition={{ duration: 1.3, ease: "easeOut" }} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
              {[["Win Rate", `${wr}%`, "🏆"], ["K/D Ratio", `${(kd / 100).toFixed(2)}`, "⚔️"], ["HS Average", `${hs}%`, "🎯"], ["Avg ACS", "248", "📊"]].map(([label, val, icon]) => (
                <div key={label} style={{ background: C.inset, borderRadius: 14, padding: 18 }}>
                  <div style={{ fontSize: 18, marginBottom: 8 }}>{icon}</div>
                  <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 20, fontWeight: 700, color: "white", marginBottom: 4 }}>{val}</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: C.muted, letterSpacing: "0.07em", textTransform: "uppercase" }}>{label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 28 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6, delay: 0.2 }}
            style={{ background: C.surface, border: `1px solid ${C.stroke}`, borderRadius: 20, padding: 36 }}>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11, letterSpacing: "0.3em", color: C.muted, marginBottom: 32 }}>COMBAT METRICS</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
              <CircleStat label="Duel Win"    value={64} color={C.accent} />
              <CircleStat label="First Blood" value={48} color="#f97316" />
              <CircleStat label="Util Usage"  value={77} color={C.purple} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
              {[["Most Played Agent", "Jett", "🌪️"], ["Best Map", "Ascent", "🗺️"], ["Avg Dmg/Round", "156", "💥"], ["Clutches Won", "24", "🤝"]].map(([label, val, icon]) => (
                <div key={label} style={{ background: C.inset, borderRadius: 14, padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 20 }}>{icon}</span>
                  <div>
                    <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 14, fontWeight: 700, color: "white", marginBottom: 3 }}>{val}</div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: C.muted, letterSpacing: "0.04em" }}>{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </Inner>
    </section>
  );
}

// ─── INSIGHTS ─────────────────────────────────────────────────────────────────
function InsightsPanel() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} style={{ padding: "96px 0" }}>
      <Inner>
        <SectionHead label="AI-Powered" title="Smart Insights" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
          {INSIGHTS.map((ins, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ scale: 1.03, boxShadow: "0 0 28px rgba(255,70,85,0.1)" }}
              style={{ background: C.surface, border: `1px solid ${C.stroke}`, borderRadius: 18, padding: 28, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(255,70,85,0.3), transparent)" }} />
              <div style={{ fontSize: 28, marginBottom: 16 }}>{ins.icon}</div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "hsl(0 0% 82%)", lineHeight: 1.65, margin: 0 }}>{ins.text}</p>
            </motion.div>
          ))}
        </div>
      </Inner>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ background: C.bg, borderTop: `1px solid ${C.stroke}` }}>
      <Inner style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "40px 48px", flexWrap: "wrap", gap: 20 }}>
        <div>
          <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 16, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 6 }}>
            <span style={{ color: C.accent }}>SPIKE</span><span style={{ color: "white" }}>STATS</span>
          </div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: C.muted, letterSpacing: "0.05em" }}>Valorant Performance Tracker</div>
        </div>
        <div style={{ display: "flex", gap: 32 }}>
          {["Twitter", "GitHub", "Discord"].map(l => (
            <a key={l} href="#" style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: C.muted, textDecoration: "none", letterSpacing: "0.05em", transition: "color 0.2s" }}
              onMouseEnter={e => e.target.style.color = "white"} onMouseLeave={e => e.target.style.color = C.muted}>{l}</a>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
            style={{ width: 8, height: 8, borderRadius: "50%", background: C.green, boxShadow: `0 0 8px ${C.green}` }} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: C.green, letterSpacing: "0.1em" }}>API CONNECTED</span>
        </div>
      </Inner>
    </footer>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const l1 = document.createElement("link"); l1.rel = "preconnect"; l1.href = "https://fonts.googleapis.com"; document.head.appendChild(l1);
    const l2 = document.createElement("link"); l2.rel = "stylesheet"; l2.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Orbitron:wght@500;600;700;800&display=swap"; document.head.appendChild(l2);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const ids = ["hero", "market", "matches", "stats"];
    const obs = new IntersectionObserver(entries => entries.forEach(e => e.isIntersecting && setActiveSection(e.target.id)), { threshold: 0.35 });
    ids.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [loaded]);

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: "white" }}>
      <AnimatePresence>
        {!loaded && <LoadingScreen key="loader" onComplete={() => setLoaded(true)} />}
      </AnimatePresence>
      {loaded && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <Navbar activeSection={activeSection} />
          <HeroSearch />
          <LiveMarket />
          <RecentMatches />
          <PerformanceOverview />
          <InsightsPanel />
          <Footer />
        </motion.div>
      )}
    </div>
  );
}
