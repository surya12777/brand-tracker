import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ScatterChart, Scatter, ZAxis, ReferenceLine, ReferenceArea, BarChart, Bar, Cell, Legend
} from "recharts";
import { ChevronDown, ChevronLeft, TrendingUp, TrendingDown, X, Radio, MessageSquare, Calendar as CalendarIcon } from "lucide-react";

/* ---------------------------------------------------------------
   TOKENS
   ink        #12181B  deep blue-charcoal — page base
   panel      #1B2327  card surface on dark
   paper      #F7F3EA  warm paper — light surfaces
   marigold   #E5A13C  primary accent (India / saffron)
   teal       #2B8C82  positive / left-cohort accent
   rose       #C6584B  negative / right-cohort accent
   mist       #8A9AA0  muted text on dark
---------------------------------------------------------------- */

const C = {
  ink: "#12181B",
  panel: "#1B2327",
  panel2: "#212A2F",
  paper: "#F7F3EA",
  marigold: "#E5A13C",
  teal: "#2B8C82",
  rose: "#C6584B",
  mist: "#8A9AA0",
  line: "#2E383D",
};

const LEFT_BRANDS = ["Axe", "Dove", "Rexona"];
const RIGHT_BRANDS = ["Fogg", "Engage", "Nivea", "Minimalist", "Chemist at Play", "Wishcare", "Juicy Chemistry", "Sanfe", "Old Spice"];
const ALL_BRANDS = [...LEFT_BRANDS, ...RIGHT_BRANDS];

const ATTRIBUTES = [
  "Allergy", "Scent", "Absorbs odor", "Residue free", "Suitability", "Apply for less time",
  "Alcohol free", "Sticky vs dry", "Instant freshness", "Premium scent feel", "Mild", "Strong scent",
  "Aluminum-free", "Paraben-free", "Natural ingredients", "Vegan", "Cruelty free", "Dermatologist tested",
  "Dermatologist recommended", "Hypoallergenic", "Clean beauty ingredients", "Easy application",
  "Travel friendly", "Portable packaging", "Leak proof", "Trustworthy", "Affordable", "Innovative",
  "Authentic", "Trendy", "Inclusive", "Recyclable packaging", "Sustainable", "Reduce plastic usage",
  "Confidence", "Maximum protection", "Long lasting", "Safe", "Attractive", "Youthful",
  "Sweat protection", "Reliable", "No gas",
];

const MONTHS = (() => {
  const out = [];
  let y = 2025, m = 0; // Jan 2025
  while (!(y === 2026 && m === 6)) { // through Jun 2026 inclusive
    out.push({ y, m, label: new Date(y, m, 1).toLocaleString("en-US", { month: "short", year: "2-digit" }) });
    m++; if (m === 12) { m = 0; y++; }
  }
  out.push({ y: 2026, m: 5, label: "Jun 26" });
  return out.filter((v, i, a) => a.findIndex(x => x.label === v.label) === i);
})();

// deterministic pseudo-random
function seedNum(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return Math.abs(h);
}
function rand(seedStr, min, max) {
  const s = seedNum(seedStr);
  const x = Math.sin(s) * 10000;
  const frac = x - Math.floor(x);
  return min + frac * (max - min);
}

const BRAND_PALETTE = {
  Axe: "#2B8C82",
  Dove: "#5FA8D3",
  Rexona: "#7FB069",
  Fogg: "#C6584B",
  Engage: "#E5A13C",
  Nivea: "#8E6FB0",
  Minimalist: "#D4889A",
  "Chemist at Play": "#4FB8A8",
  Wishcare: "#B07D4F",
  "Juicy Chemistry": "#94B447",
  Sanfe: "#D67BC4",
  "Old Spice": "#5A7AA6",
};
const BRAND_COLOR = (b) => BRAND_PALETTE[b] || C.mist;

// share of voice + sentiment per brand
const BRAND_STATS = ALL_BRANDS.map((b) => {
  const sov = rand(b + "sov", 3, 18);
  const sentiment = rand(b + "sent", -25, 55);
  const mentions = Math.round(rand(b + "men", 8000, 95000));
  const trend = rand(b + "trend", -8, 12);
  return { brand: b, sov: +sov.toFixed(1), sentiment: Math.round(sentiment), mentions, trend: +trend.toFixed(1) };
});
const SOV_TOTAL = BRAND_STATS.reduce((a, b) => a + b.sov, 0);

// peak event labels for deep dive
const PEAK_EVENTS = [
  "Festive campaign launch", "Influencer collab spike", "New variant drop", "Cricket sponsorship moment",
  "Price-cut promo", "Negative review thread", "Packaging redesign buzz", "Celebrity endorsement",
  "Sale-season surge", "Ingredient controversy", "Award / recognition", "Limited-edition scent drop",
];

function brandTimeSeries(brand) {
  return MONTHS.map((mo, i) => {
    const base = rand(brand + mo.label + "m", 2000, 9000);
    const wobble = Math.sin(i / 2 + seedNum(brand) % 5) * 1500;
    const mentions = Math.max(300, Math.round(base + wobble));
    const sentiment = Math.round(rand(brand + mo.label + "s", -20, 60) + Math.sin(i / 3) * 10);
    return { ...mo, mentions, sentiment };
  });
}

function peaksFor(series, brand) {
  const sorted = [...series].sort((a, b) => b.mentions - a.mentions).slice(0, 3);
  return sorted.map((pt) => ({
    ...pt,
    event: PEAK_EVENTS[seedNum(brand + pt.label) % PEAK_EVENTS.length],
  }));
}

// attribute frequency + sentiment per brand
function attrStat(brand, attr) {
  const freq = Math.round(rand(brand + attr + "f", 40, 4200));
  const sentiment = Math.round(rand(brand + attr + "s", -40, 65));
  return { freq, sentiment };
}

const ATTR_PALETTE = [
  "#E5A13C", "#2B8C82", "#C6584B", "#5FA8D3", "#7FB069", "#D4889A", "#8E6FB0", "#4FB8A8",
  "#B07D4F", "#94B447", "#D67BC4", "#5A7AA6", "#E08A4B", "#6FA8DC", "#A8C66C", "#C97B9A",
  "#4A9B8E", "#D98E6B", "#7B9ACC", "#B8D14B", "#E27D9E", "#5C8A6B", "#D6A85E", "#9A7BC9",
  "#67B3A3", "#CC6F6F", "#8BAF5C", "#E0A6C9", "#4F8FA6", "#D9B35E", "#A67BB0", "#6FAF8A",
  "#C98B5E", "#7BA3D6", "#B0C95E", "#D67B9E", "#5E9ACC", "#A8915C", "#7BC9A8", "#CC9A6F",
  "#8A6FC9", "#5EB3B8", "#D6896F",
];
const ATTR_COLOR = (attr) => ATTR_PALETTE[ATTRIBUTES.indexOf(attr) % ATTR_PALETTE.length];
function quadrantData(brand) {
  return ATTRIBUTES.map((attr) => {
    const x = +rand(brand + attr + "x", -50, 65).toFixed(1);
    const y = +rand(brand + attr + "y", 5, 95).toFixed(1);
    return { attr, x, y, brand };
  });
}

/* ---------------------------------------------------------------
   SHARED UI BITS
---------------------------------------------------------------- */

function Pill({ children, tone = "mist" }) {
  const bg = tone === "teal" ? "rgba(43,140,130,0.18)" : tone === "rose" ? "rgba(198,88,75,0.18)" : "rgba(138,154,160,0.15)";
  const fg = tone === "teal" ? C.teal : tone === "rose" ? C.rose : C.mist;
  return (
    <span style={{ background: bg, color: fg, fontFamily: "'IBM Plex Mono', monospace" }}
      className="text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full">
      {children}
    </span>
  );
}

function Dropdown({ value, onChange, options, accent }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)}
        style={{ background: C.panel2, border: `1px solid ${accent}55`, color: C.paper }}
        className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-lg text-sm font-medium">
        <span style={{ color: accent }} className="w-2 h-2 rounded-full" >
          <span style={{ background: accent }} className="block w-2 h-2 rounded-full" />
        </span>
        <span className="flex-1 text-left">{value}</span>
        <ChevronDown size={16} color={C.mist} />
      </button>
      {open && (
        <div style={{ background: C.panel2, border: `1px solid ${C.line}` }}
          className="absolute z-20 mt-1 w-full max-h-64 overflow-auto rounded-lg shadow-xl">
          {options.map(o => (
            <button key={o} onClick={() => { onChange(o); setOpen(false); }}
              style={{ color: o === value ? accent : C.paper }}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-white/5">
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const START_DATE = new Date(2025, 0, 1);
const END_DATE = new Date(2026, 5, 30);

function fmtDate(d) {
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function clampDate(d) {
  if (d < START_DATE) return START_DATE;
  if (d > END_DATE) return END_DATE;
  return d;
}
function dateToMonthIndex(d) {
  let best = 0, bestDiff = Infinity;
  MONTHS.forEach((m, i) => {
    const diff = Math.abs(new Date(m.y, m.m, 15) - d);
    if (diff < bestDiff) { bestDiff = diff; best = i; }
  });
  return best;
}

function daysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }

function CalendarDateInput({ label, value, onChange, accent, minDate, maxDate }) {
  const [open, setOpen] = useState(false);
  const [viewY, setViewY] = useState(value.getFullYear());
  const [viewM, setViewM] = useState(value.getMonth());

  const first = new Date(viewY, viewM, 1);
  const startOffset = first.getDay(); // 0 = Sun
  const totalDays = daysInMonth(viewY, viewM);
  const cells = [...Array(startOffset).fill(null), ...Array(totalDays).fill(0).map((_, i) => i + 1)];

  const goMonth = (delta) => {
    let m = viewM + delta, y = viewY;
    if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; }
    setViewM(m); setViewY(y);
  };

  return (
    <div className="relative flex-1">
      <span style={{ color: C.mist, fontFamily: "'IBM Plex Mono', monospace" }} className="block text-[9px] uppercase tracking-widest mb-1">{label}</span>
      <button onClick={() => setOpen(o => !o)}
        style={{ background: C.panel2, border: `1px solid ${accent}55`, color: C.paper }}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm font-medium">
        <span className="flex items-center gap-2">
          <CalendarIcon size={14} color={accent} />
          {fmtDate(value)}
        </span>
        <ChevronDown size={14} color={C.mist} />
      </button>
      {open && (
        <div style={{ background: C.panel2, border: `1px solid ${C.line}` }}
          className="absolute z-20 mt-1 w-72 rounded-lg shadow-xl p-3" onMouseLeave={() => {}}>
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => goMonth(-1)} style={{ color: C.mist }} className="px-2 py-1 hover:text-white"><ChevronLeft size={14} /></button>
            <span style={{ color: C.paper, fontFamily: "'IBM Plex Mono', monospace" }} className="text-xs">
              {new Date(viewY, viewM, 1).toLocaleString("en-US", { month: "long", year: "numeric" })}
            </span>
            <button onClick={() => goMonth(1)} style={{ color: C.mist }} className="px-2 py-1 hover:text-white rotate-180"><ChevronLeft size={14} /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <div key={i} style={{ color: C.mist }} className="text-[10px] text-center">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (!day) return <div key={i} />;
              const d = new Date(viewY, viewM, day);
              const disabled = d < minDate || d > maxDate;
              const selected = d.toDateString() === value.toDateString();
              return (
                <button key={i} disabled={disabled}
                  onClick={() => { onChange(d); setOpen(false); }}
                  style={{
                    background: selected ? accent : "transparent",
                    color: disabled ? `${C.mist}55` : selected ? C.ink : C.paper,
                    cursor: disabled ? "not-allowed" : "pointer",
                  }}
                  className="text-[11px] rounded-md py-1.5 hover:bg-white/10">
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function MonthRangeFilter({ dateRange, setDateRange }) {
  const [start, end] = dateRange;
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}` }} className="rounded-xl px-4 py-3 flex items-end gap-4 flex-wrap">
      <span style={{ fontFamily: "'IBM Plex Mono', monospace" }} className="text-[10px] uppercase tracking-widest self-center" >
        <span style={{ color: C.mist }}>Timeframe</span>
      </span>
      <div className="flex items-end gap-3 flex-1 min-w-[300px]">
        <CalendarDateInput label="Start date" value={start} accent={C.teal} minDate={START_DATE} maxDate={end}
          onChange={(d) => setDateRange([clampDate(d), end])} />
        <div style={{ background: C.line }} className="h-px w-6 mb-3.5" />
        <CalendarDateInput label="End date" value={end} accent={C.marigold} minDate={start} maxDate={END_DATE}
          onChange={(d) => setDateRange([start, clampDate(d)])} />
      </div>
      <Pill>India · Social + Reviews</Pill>
    </div>
  );
}

/* ---------------------------------------------------------------
   SCREEN 1 — Share of Voice & Sentiment
---------------------------------------------------------------- */

function Screen1({ range }) {
  const [active, setActive] = useState(null);
  const months = MONTHS.slice(range[0], range[1] + 1);

  return (
    <div className="grid grid-cols-12 gap-5">
      <div className="col-span-12">
        <h2 style={{ color: C.paper, fontFamily: "'Fraunces', serif" }} className="text-2xl mb-1">Share of voice &amp; sentiment</h2>
        <p style={{ color: C.mist }} className="text-sm mb-5">12 brands, ranked by share of conversation across social and review channels. Click any brand to open its trend deep dive.</p>
      </div>

      <div className="col-span-12 lg:col-span-7">
        <div style={{ background: C.panel, border: `1px solid ${C.line}` }} className="rounded-2xl p-5">
          <div style={{ fontFamily: "'IBM Plex Mono', monospace" }} className="text-[10px] uppercase tracking-widest mb-4" >
            <span style={{ color: C.mist }}>Share of voice — ranked</span>
          </div>
          <div className="space-y-2.5">
            {BRAND_STATS.slice().sort((a, b) => b.sov - a.sov).map((b) => {
              const widthPct = (b.sov / SOV_TOTAL) * 100 * 2.2;
              return (
                <button key={b.brand} onClick={() => setActive(b.brand)}
                  className="w-full text-left group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="flex items-center gap-2">
                      <span style={{ background: BRAND_COLOR(b.brand) }} className="w-2 h-2 rounded-full" />
                      <span style={{ color: C.paper }} className="text-sm font-medium group-hover:underline">{b.brand}</span>
                    </span>
                    <span className="flex items-center gap-3">
                      <span style={{ color: C.mist, fontFamily: "'IBM Plex Mono', monospace" }} className="text-xs">{b.sov}%</span>
                      <span style={{ color: b.sentiment >= 0 ? C.teal : C.rose, fontFamily: "'IBM Plex Mono', monospace" }} className="text-xs flex items-center gap-0.5">
                        {b.sentiment >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}{b.sentiment}
                      </span>
                    </span>
                  </div>
                  <div style={{ background: C.panel2 }} className="h-2 rounded-full overflow-hidden">
                    <div style={{ width: `${Math.min(widthPct, 100)}%`, background: BRAND_COLOR(b.brand) }} className="h-full rounded-full" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="col-span-12 lg:col-span-5">
        <div style={{ background: C.panel, border: `1px solid ${C.line}` }} className="rounded-2xl p-5 h-full">
          <div style={{ fontFamily: "'IBM Plex Mono', monospace" }} className="text-[10px] uppercase tracking-widest mb-4">
            <span style={{ color: C.mist }}>Net sentiment snapshot</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={BRAND_STATS.slice().sort((a, b) => b.sentiment - a.sentiment)} layout="vertical" margin={{ left: 0, right: 10 }}>
              <XAxis type="number" domain={[-40, 60]} tick={{ fill: C.mist, fontSize: 10 }} stroke={C.line} />
              <YAxis type="category" dataKey="brand" width={100} tick={{ fill: C.paper, fontSize: 11 }} stroke={C.line} />
              <ReferenceLine x={0} stroke={C.mist} />
              <Tooltip contentStyle={{ background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 8, fontSize: 12 }} labelStyle={{ color: C.paper }} />
              <Bar dataKey="sentiment" radius={[3, 3, 3, 3]}>
                {BRAND_STATS.map((b, i) => <Cell key={i} fill={b.sentiment >= 0 ? C.teal : C.rose} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {active && <DeepDive brand={active} months={months} onClose={() => setActive(null)} />}
    </div>
  );
}

function DeepDive({ brand, months, onClose }) {
  const series = brandTimeSeries(brand).filter(m => months.find(mm => mm.label === m.label));
  const peaks = peaksFor(series, brand);
  const color = BRAND_COLOR(brand);
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.ink, border: `1px solid ${C.line}` }} className="rounded-2xl w-full max-w-3xl max-h-[88vh] overflow-auto p-6">
        <div className="flex items-start justify-between mb-1">
          <div className="flex items-center gap-2">
            <span style={{ background: color }} className="w-2.5 h-2.5 rounded-full" />
            <h3 style={{ color: C.paper, fontFamily: "'Fraunces', serif" }} className="text-xl">{brand} — trend deep dive</h3>
          </div>
          <button onClick={onClose} style={{ color: C.mist }}><X size={18} /></button>
        </div>
        <p style={{ color: C.mist }} className="text-sm mb-5">Mentions and sentiment across the selected timeframe, with the three highest-volume peaks annotated.</p>

        <div style={{ fontFamily: "'IBM Plex Mono', monospace" }} className="text-[10px] uppercase tracking-widest mb-2"><span style={{ color: C.mist }}>Mention volume</span></div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={series}>
            <CartesianGrid stroke={C.line} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: C.mist, fontSize: 10 }} stroke={C.line} />
            <YAxis tick={{ fill: C.mist, fontSize: 10 }} stroke={C.line} />
            <Tooltip contentStyle={{ background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 8, fontSize: 12 }} labelStyle={{ color: C.paper }} />
            <Line type="monotone" dataKey="mentions" stroke={color} strokeWidth={2} dot={false} />
            {peaks.map((p, i) => <ReferenceLine key={i} x={p.label} stroke={C.marigold} strokeDasharray="3 3" />)}
          </LineChart>
        </ResponsiveContainer>

        <div style={{ fontFamily: "'IBM Plex Mono', monospace" }} className="text-[10px] uppercase tracking-widest mt-6 mb-2"><span style={{ color: C.mist }}>Sentiment</span></div>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={series}>
            <CartesianGrid stroke={C.line} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: C.mist, fontSize: 10 }} stroke={C.line} />
            <YAxis tick={{ fill: C.mist, fontSize: 10 }} stroke={C.line} domain={[-30, 70]} />
            <ReferenceLine y={0} stroke={C.mist} />
            <Tooltip contentStyle={{ background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 8, fontSize: 12 }} labelStyle={{ color: C.paper }} />
            <Line type="monotone" dataKey="sentiment" stroke={C.marigold} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>

        <div style={{ fontFamily: "'IBM Plex Mono', monospace" }} className="text-[10px] uppercase tracking-widest mt-6 mb-2"><span style={{ color: C.mist }}>Peak analysis</span></div>
        <div className="space-y-2">
          {peaks.map((p, i) => (
            <div key={i} style={{ background: C.panel, border: `1px solid ${C.line}` }} className="flex items-center justify-between rounded-lg px-4 py-2.5">
              <div className="flex items-center gap-3">
                <span style={{ color: C.marigold, fontFamily: "'IBM Plex Mono', monospace" }} className="text-xs">{p.label}</span>
                <span style={{ color: C.paper }} className="text-sm">{p.event}</span>
              </div>
              <span style={{ color: C.mist, fontFamily: "'IBM Plex Mono', monospace" }} className="text-xs">{p.mentions.toLocaleString()} mentions · {p.sentiment >= 0 ? "+" : ""}{p.sentiment} sent.</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   SCREEN 2 — Attribute comparison
---------------------------------------------------------------- */

function Screen2() {
  const [left, setLeft] = useState("Axe");
  const [right, setRight] = useState("Fogg");
  const [metric, setMetric] = useState("freq");
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    return ATTRIBUTES.map(attr => ({
      attr,
      l: attrStat(left, attr),
      r: attrStat(right, attr),
    })).filter(r => r.attr.toLowerCase().includes(query.toLowerCase()));
  }, [left, right, query]);

  const maxFreq = Math.max(...rows.map(r => Math.max(r.l.freq, r.r.freq)), 1);

  return (
    <div>
      <h2 style={{ color: C.paper, fontFamily: "'Fraunces', serif" }} className="text-2xl mb-1">Attribute comparison</h2>
      <p style={{ color: C.mist }} className="text-sm mb-5">Compare mention frequency and sentiment across 43 brand attributes, two brands at a time.</p>

      <div className="grid grid-cols-12 gap-4 mb-5">
        <div className="col-span-12 sm:col-span-5">
          <Dropdown value={left} onChange={setLeft} options={LEFT_BRANDS} accent={C.teal} />
        </div>
        <div className="col-span-12 sm:col-span-2 flex items-center justify-center">
          <span style={{ color: C.mist, fontFamily: "'IBM Plex Mono', monospace" }} className="text-xs">vs.</span>
        </div>
        <div className="col-span-12 sm:col-span-5">
          <Dropdown value={right} onChange={setRight} options={RIGHT_BRANDS} accent={C.rose} />
        </div>
      </div>

      <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Filter attributes…"
          style={{ background: C.panel2, border: `1px solid ${C.line}`, color: C.paper }}
          className="px-3 py-2 rounded-lg text-sm w-full sm:w-64" />
        <div className="flex gap-2">
          {[["freq", "Mentions"], ["sent", "Sentiment"]].map(([k, l]) => (
            <button key={k} onClick={() => setMetric(k)}
              style={{
                background: metric === k ? C.marigold : C.panel2,
                color: metric === k ? C.ink : C.mist,
                border: `1px solid ${C.line}`
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium">{l}</button>
          ))}
        </div>
      </div>

      <div style={{ background: C.panel, border: `1px solid ${C.line}` }} className="rounded-2xl p-5">
        <div className="flex items-center justify-between text-xs mb-3" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
          <span style={{ color: C.teal }}>{left}</span>
          <span style={{ color: C.mist }}>attribute</span>
          <span style={{ color: C.rose }}>{right}</span>
        </div>
        <div className="space-y-3 max-h-[560px] overflow-auto pr-1">
          {rows.map((r) => {
            if (metric === "freq") {
              const lw = (r.l.freq / maxFreq) * 100;
              const rw = (r.r.freq / maxFreq) * 100;
              return (
                <div key={r.attr} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <div className="flex justify-end">
                    <div style={{ width: `${lw}%`, background: C.teal }} className="h-3 rounded-l-full min-w-[3px]" title={r.l.freq} />
                  </div>
                  <span style={{ color: C.paper }} className="text-[11px] text-center w-40 truncate">{r.attr}</span>
                  <div className="flex">
                    <div style={{ width: `${rw}%`, background: C.rose }} className="h-3 rounded-r-full min-w-[3px]" />
                  </div>
                </div>
              );
            }
            const lw = ((r.l.sentiment + 40) / 105) * 100;
            const rw = ((r.r.sentiment + 40) / 105) * 100;
            return (
              <div key={r.attr} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <div className="flex justify-end items-center gap-2">
                  <span style={{ color: C.mist, fontFamily: "'IBM Plex Mono', monospace" }} className="text-[10px]">{r.l.sentiment}</span>
                  <div style={{ width: `${lw}%`, background: r.l.sentiment >= 0 ? C.teal : "#6b4a45" }} className="h-3 rounded-l-full min-w-[3px]" />
                </div>
                <span style={{ color: C.paper }} className="text-[11px] text-center w-40 truncate">{r.attr}</span>
                <div className="flex items-center gap-2">
                  <div style={{ width: `${rw}%`, background: r.r.sentiment >= 0 ? "#7fae62" : C.rose }} className="h-3 rounded-r-full min-w-[3px]" />
                  <span style={{ color: C.mist, fontFamily: "'IBM Plex Mono', monospace" }} className="text-[10px]">{r.r.sentiment}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   SCREEN 3 — Quadrant map
---------------------------------------------------------------- */

function QuadrantChart({ brand, data, color }) {
  const quadLabel = (x, y) => {
    if (x >= 0 && y >= 50) return "Lead & amplify";
    if (x < 0 && y >= 50) return "Loud but risky";
    if (x >= 0 && y < 50) return "Quiet strengths";
    return "Watch closely";
  };
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}` }} className="rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-2">
        <span style={{ background: color }} className="w-2.5 h-2.5 rounded-full" />
        <span style={{ color: C.paper, fontFamily: "'Fraunces', serif" }} className="text-lg">{brand}</span>
      </div>
      <ResponsiveContainer width="100%" height={420}>
        <ScatterChart margin={{ top: 10, right: 15, bottom: 10, left: 0 }}>
          <CartesianGrid stroke={C.line} />
          <XAxis type="number" dataKey="x" name="Net sentiment" domain={[-55, 70]} tick={{ fill: C.mist, fontSize: 10 }} stroke={C.line}
            label={{ value: "Net sentiment →", position: "insideBottom", offset: -5, fill: C.mist, fontSize: 11 }} />
          <YAxis type="number" dataKey="y" name="Engagement" domain={[0, 100]} tick={{ fill: C.mist, fontSize: 10 }} stroke={C.line}
            label={{ value: "Engagement →", angle: -90, position: "insideLeft", fill: C.mist, fontSize: 11 }} />
          <ZAxis range={[55, 55]} />
          <ReferenceLine x={0} stroke={C.mist} strokeDasharray="4 4" />
          <ReferenceLine y={50} stroke={C.mist} strokeDasharray="4 4" />
          <Tooltip cursor={{ strokeDasharray: "3 3" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload;
              return (
                <div style={{ background: C.panel2, border: `1px solid ${C.line}` }} className="rounded-lg px-3 py-2 text-xs">
                  <div style={{ color: C.paper }} className="font-medium mb-0.5">{p.attr}</div>
                  <div style={{ color: C.mist }}>{quadLabel(p.x, p.y)}</div>
                  <div style={{ color: C.mist }}>sentiment {p.x} · engagement {p.y}</div>
                </div>
              );
            }}
          />
          <Scatter data={data}>
            {data.map((d, i) => <Cell key={i} fill={ATTR_COLOR(d.attr)} fillOpacity={0.9} />)}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

function Screen3() {
  const [left, setLeft] = useState("Dove");
  const [right, setRight] = useState("Nivea");

  const dataL = quadrantData(left);
  const dataR = quadrantData(right);

  return (
    <div>
      <h2 style={{ color: C.paper, fontFamily: "'Fraunces', serif" }} className="text-2xl mb-1">Attribute quadrant map</h2>
      <p style={{ color: C.mist }} className="text-sm mb-5">Net sentiment (x-axis) vs. engagement (y-axis) for all 43 attributes — side-by-side quadrant view per brand.</p>

      <div className="grid grid-cols-12 gap-4 mb-5">
        <div className="col-span-12 sm:col-span-5">
          <Dropdown value={left} onChange={setLeft} options={LEFT_BRANDS} accent={BRAND_COLOR(left)} />
        </div>
        <div className="col-span-12 sm:col-span-2 flex items-center justify-center">
          <span style={{ color: C.mist, fontFamily: "'IBM Plex Mono', monospace" }} className="text-xs">vs.</span>
        </div>
        <div className="col-span-12 sm:col-span-5">
          <Dropdown value={right} onChange={setRight} options={RIGHT_BRANDS} accent={BRAND_COLOR(right)} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <QuadrantChart brand={left} data={dataL} color={BRAND_COLOR(left)} />
        <QuadrantChart brand={right} data={dataR} color={BRAND_COLOR(right)} />
      </div>

      <div style={{ background: C.panel, border: `1px solid ${C.line}` }} className="rounded-2xl p-4 mb-5">
        <div style={{ fontFamily: "'IBM Plex Mono', monospace" }} className="text-[10px] uppercase tracking-widest mb-2">
          <span style={{ color: C.mist }}>Attribute key — same color on both sides</span>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 max-h-32 overflow-auto pr-1">
          {ATTRIBUTES.map(attr => (
            <span key={attr} className="flex items-center gap-1.5">
              <span style={{ background: ATTR_COLOR(attr) }} className="w-2 h-2 rounded-full shrink-0" />
              <span style={{ color: C.paper }} className="text-[10px]">{attr}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          ["Lead & amplify", "+sentiment, high engagement"],
          ["Loud but risky", "−sentiment, high engagement"],
          ["Quiet strengths", "+sentiment, low engagement"],
          ["Watch closely", "−sentiment, low engagement"],
        ].map(([t, d]) => (
          <div key={t} style={{ background: C.panel, border: `1px solid ${C.line}` }} className="rounded-lg px-3 py-2">
            <div style={{ color: C.marigold, fontFamily: "'IBM Plex Mono', monospace" }} className="text-[10px] uppercase tracking-wider">{t}</div>
            <div style={{ color: C.mist }} className="text-[11px] mt-0.5">{d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   APP SHELL
---------------------------------------------------------------- */

export default function App() {
  const [screen, setScreen] = useState(1);
  const [dateRange, setDateRange] = useState([START_DATE, END_DATE]);
  const monthRange = [dateToMonthIndex(dateRange[0]), dateToMonthIndex(dateRange[1])];

  const ticker = BRAND_STATS.slice().sort((a, b) => b.mentions - a.mentions).slice(0, 8);

  return (
    <div style={{ background: C.ink, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;500;600&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
      `}</style>

      {/* pulse strip */}
      <div style={{ background: C.panel, borderBottom: `1px solid ${C.line}` }} className="overflow-hidden whitespace-nowrap py-1.5">
        <div className="inline-flex animate-[scroll_28s_linear_infinite]">
          {[...ticker, ...ticker].map((b, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 mx-4" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              <Radio size={10} color={BRAND_COLOR(b.brand)} />
              <span style={{ color: C.paper }} className="text-[11px]">{b.brand}</span>
              <span style={{ color: b.trend >= 0 ? C.teal : C.rose }} className="text-[11px]">{b.trend >= 0 ? "▲" : "▼"} {Math.abs(b.trend)}%</span>
            </span>
          ))}
        </div>
      </div>
      <style>{`@keyframes scroll { from{transform:translateX(0)} to{transform:translateX(-50%)} }`}</style>

      <header className="px-6 pt-6 pb-4 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare size={16} color={C.marigold} />
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: C.mist }} className="text-[11px] uppercase tracking-widest">Brand &amp; attribute listening · India</span>
          </div>
          <h1 style={{ color: C.paper, fontFamily: "'Fraunces', serif" }} className="text-3xl">Personal care category tracker</h1>
        </div>
        <nav className="flex gap-1.5">
          {[1, 2, 3].map(n => (
            <button key={n} onClick={() => setScreen(n)}
              style={{
                background: screen === n ? C.marigold : C.panel,
                color: screen === n ? C.ink : C.mist,
                border: `1px solid ${C.line}`
              }}
              className="px-4 py-2 rounded-full text-sm font-medium">
              {n === 1 ? "Share of voice" : n === 2 ? "Attribute compare" : "Quadrant map"}
            </button>
          ))}
        </nav>
      </header>

      <div className="px-6 mb-5">
        <MonthRangeFilter dateRange={dateRange} setDateRange={setDateRange} />
      </div>

      <main className="px-6 pb-12">
        {screen === 1 && <Screen1 range={monthRange} />}
        {screen === 2 && <Screen2 />}
        {screen === 3 && <Screen3 />}
      </main>
    </div>
  );
}
