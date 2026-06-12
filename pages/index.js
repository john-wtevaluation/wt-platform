// pages/index.js - Wilson & Tubbs Evaluation Management Platform (Phase 1)
import React, { useState, useEffect, useRef, useMemo } from "react";
import Head from "next/head";
import {
  LayoutDashboard, Users, FolderKanban, Clock, DollarSign,
  Plus, ChevronDown, ChevronUp, Check, ArrowRight, ArrowLeft,
  AlertTriangle, Circle
} from "lucide-react";

const NAVY = "#1B2266";
const PARTNERS = ["John", "Evan"];
const OPP_STATUSES = ["Lead", "Discovery", "Proposal", "Negotiation", "Won", "Lost"];
const PROJ_STATUSES = ["Not Started", "Active", "On Hold", "Completed", "Cancelled"];
const TASK_STATUSES = ["Backlog", "Not Started", "In Progress", "Waiting", "Complete"];
const INV_FLOW = ["Draft", "Sent", "Paid"];

const uid = () => Math.random().toString(36).slice(2, 10);
const today = () => new Date().toISOString().slice(0, 10);
const fmt$ = (n) => (n == null || isNaN(n) ? "\u2014" : "$" + Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 }));
const fmtD = (d) => (d ? new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "\u2014");
const isPast = (d) => d && d < today();
const within = (d, days) => { if (!d) return false; const diff = (new Date(d) - new Date(today())) / 86400000; return diff >= 0 && diff <= days; };

const seed = () => ({
  opportunities: [
    { id: uid(), org: "Cincinnati Children's Hospital (CCHMC)", contact: "Eileen Clark", title: "Child Life data infrastructure (3-tier proposal)", value: null, status: "Proposal", securing: "John", proposalSent: "2026-06-01", expectedClose: "2026-07-15", followUp: "2026-06-16", notes: "Tiered proposal delivered. Epic/REDCap double-entry problem. Sarah Braukman operational lead." },
    { id: uid(), org: "Memphis Child Advocacy Center", contact: "Toby Foster", title: "Access DB modernization: Power Apps + Power BI + Forms", value: null, status: "Proposal", securing: "John", proposalSent: "2026-05-15", expectedClose: "2026-07-01", followUp: "2026-06-18", notes: "Referred by August. VOCA/VAWA funding likely has data systems line items." }
  ],
  projects: [
    { id: "p-rapc", name: "RAPC Independent Evaluation", org: "Rural Alabama Prevention Center", value: 10000, status: "Active", start: "2025-08-01", end: "2026-07-21", securing: "John",
      milestones: [
        { id: uid(), name: "Biweekly data check-ins", due: "2026-07-21", pct: 85 },
        { id: uid(), name: "Monthly data summaries", due: "2026-07-21", pct: 85 },
        { id: uid(), name: "HRSA deliverables (PIMs)", due: "2026-07-21", pct: 75 },
        { id: uid(), name: "Grant writing support", due: "2026-07-21", pct: 60 }
      ] },
    { id: "p-gcyspc", name: "GCYSPC Evaluation System", org: "Greene County Coalition (via RAPC)", value: null, status: "Active", start: "2025-08-01", end: "2026-07-31", securing: "John",
      milestones: [
        { id: uid(), name: "Drive folder structure", due: "2026-04-30", pct: 100 },
        { id: uid(), name: "Master spreadsheet", due: "2026-05-15", pct: 100 },
        { id: uid(), name: "Apps Script build (~900 lines)", due: "2026-06-15", pct: 90 },
        { id: uid(), name: "Script delivery + START HERE guide", due: "2026-06-30", pct: 0 },
        { id: uid(), name: "Role-based user guides", due: "2026-07-15", pct: 0 }
      ] }
  ],
  tasks: [
    { id: uid(), projectId: "p-rapc", title: "Send June 15 invoice to RAPC", assignee: "John", due: "2026-06-15", priority: "Critical", status: "Not Started" },
    { id: uid(), projectId: "p-gcyspc", title: "Deliver Apps Script as Google Doc in 01_Guides", assignee: "John", due: "2026-06-20", priority: "High", status: "In Progress" },
    { id: uid(), projectId: "p-gcyspc", title: "Write START HERE setup guide", assignee: "John", due: "2026-06-27", priority: "High", status: "Not Started" },
    { id: uid(), projectId: "p-gcyspc", title: "Draft role-based user guides", assignee: "John", due: "2026-07-10", priority: "Medium", status: "Not Started" },
    { id: uid(), projectId: null, title: "Follow up with Eileen Clark (CCHMC)", assignee: "John", due: "2026-06-16", priority: "High", status: "Not Started" }
  ],
  time: [],
  invoices: [
    { id: uid(), number: "WT-001", org: "Rural Alabama Prevention Center", projectId: "p-rapc", amount: 2500, due: "2025-09-15", status: "Paid", paidDate: "2025-10-01" },
    { id: uid(), number: "WT-002", org: "Rural Alabama Prevention Center", projectId: "p-rapc", amount: 2500, due: "2025-12-15", status: "Paid", paidDate: "2026-01-05" },
    { id: uid(), number: "WT-003", org: "Rural Alabama Prevention Center", projectId: "p-rapc", amount: 2500, due: "2026-03-15", status: "Paid", paidDate: "2026-04-02" },
    { id: uid(), number: "WT-004", org: "Rural Alabama Prevention Center", projectId: "p-rapc", amount: 2500, due: "2026-06-15", status: "Draft", paidDate: null }
  ],
  expenses: []
});

function projectHealth(p, tasks) {
  if (p.status !== "Active") return "neutral";
  if ((p.milestones || []).some((m) => isPast(m.due) && m.pct < 100)) return "red";
  const pt = tasks.filter((t) => t.projectId === p.id && t.status !== "Complete");
  if (pt.some((t) => isPast(t.due)) || pt.some((t) => !t.assignee)) return "yellow";
  return "green";
}
const HealthDot = ({ h }) => {
  const c = { green: "#1F7A4D", yellow: "#B7791F", red: "#B3322B", neutral: "#9CA3AF" }[h];
  return <span className="inline-block w-2.5 h-2.5 rounded-full mr-2 shrink-0" style={{ background: c }} />;
};
const Card = ({ children, className = "" }) => <div className={`bg-white rounded-xl border border-gray-200 ${className}`}>{children}</div>;
const SectionTitle = ({ children }) => <div className="text-[11px] font-semibold tracking-widest uppercase text-gray-400 mb-2 px-1">{children}</div>;
const Field = ({ label, children }) => <label className="block mb-2"><span className="block text-xs text-gray-500 mb-1">{label}</span>{children}</label>;
const inp = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300";
const btnPrimary = "px-4 py-2 rounded-lg text-sm font-semibold text-white";
const btnGhost = "px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-300 text-gray-600 active:bg-gray-100";
const Stat = ({ label, value, sub, alert }) => (
  <Card className="p-3">
    <div className="text-[11px] uppercase tracking-wide text-gray-400 leading-tight">{label}</div>
    <div className="text-xl font-bold mt-0.5" style={{ color: alert ? "#B3322B" : NAVY, fontVariantNumeric: "tabular-nums" }}>{value}</div>
    {sub && <div className="text-[11px] text-gray-400 mt-0.5">{sub}</div>}
  </Card>
);

const api = {
  key: () => (typeof window !== "undefined" ? localStorage.getItem("wt-key") : null),
  async load() {
    const r = await fetch("/api/state", { headers: { "x-wt-key": api.key() || "" } });
    if (r.status === 401) throw new Error("auth");
    if (!r.ok) throw new Error("server");
    return (await r.json()).data;
  },
  async save(data) {
    const r = await fetch("/api/state", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-wt-key": api.key() || "" },
      body: JSON.stringify(data)
    });
    if (!r.ok) throw new Error("save");
  }
};

export default function Home() {
  const [authed, setAuthed] = useState(null);
  const [pw, setPw] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("dash");
  const [saveState, setSaveState] = useState("idle");
  const saveTimer = useRef(null);

  const boot = async () => {
    try {
      const d = await api.load();
      if (d) setData(d);
      else { const s = seed(); setData(s); await api.save(s); }
      setAuthed(true);
    } catch (e) {
      if (e.message === "auth") setAuthed(false);
      else { setAuthed(false); setLoginErr("Could not reach the database. Check Vercel env vars."); }
    }
  };

  useEffect(() => { if (api.key()) boot(); else setAuthed(false); }, []);

  const tryLogin = async () => {
    localStorage.setItem("wt-key", pw);
    setLoginErr("");
    setAuthed(null);
    try { await boot(); } catch { setAuthed(false); setLoginErr("Wrong password."); }
  };

  const update = (fn) => {
    setData((prev) => {
      const next = typeof fn === "function" ? fn(prev) : fn;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      setSaveState("saving");
      saveTimer.current = setTimeout(async () => {
        try { await api.save(next); setSaveState("saved"); setTimeout(() => setSaveState("idle"), 1500); }
        catch { setSaveState("error"); }
      }, 700);
      return next;
    });
  };

  const shell = (inner) => (
    <>
      <Head>
        <title>WT Platform</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600;700&display=swap" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="WT Platform" />
        <meta name="theme-color" content="#1B2266" />
        <link rel="apple-touch-icon" href="/api/icon" />
      </Head>
      {inner}
    </>
  );

  if (authed === null || (authed && !data))
    return shell(<div className="min-h-screen flex items-center justify-center text-gray-400 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>{"Loading your firm..."}</div>);

  if (!authed)
    return shell(
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: NAVY, fontFamily: "Inter, sans-serif" }}>
        <div className="w-full max-w-xs text-center">
          <div className="text-white text-2xl font-bold mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Wilson <span className="opacity-50">&</span> Tubbs</div>
          <div className="text-[10px] tracking-[0.25em] uppercase text-white opacity-60 mb-8">Measuring Impact | Driving Results</div>
          <input type="password" className="w-full rounded-lg px-4 py-3 text-sm mb-3" placeholder="Firm password"
            value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === "Enter" && tryLogin()} />
          <button className="w-full py-3 rounded-lg text-sm font-bold" style={{ background: "white", color: NAVY }} onClick={tryLogin}>Enter</button>
          {loginErr && <div className="text-xs text-red-300 mt-3">{loginErr}</div>}
        </div>
      </div>
    );

  const tabs = [
    { k: "dash", label: "Home", icon: LayoutDashboard },
    { k: "crm", label: "Pipeline", icon: Users },
    { k: "proj", label: "Projects", icon: FolderKanban },
    { k: "time", label: "Time", icon: Clock },
    { k: "money", label: "Money", icon: DollarSign }
  ];

  return shell(
    <div className="min-h-screen pb-24" style={{ background: "#F6F6F3", fontFamily: "Inter, system-ui, sans-serif", color: "#16181D" }}>
      <header className="px-4 pt-5 pb-4 text-white" style={{ background: NAVY }}>
        <div className="flex items-baseline justify-between max-w-2xl mx-auto">
          <div>
            <div className="text-lg font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Wilson <span className="opacity-50">&</span> Tubbs</div>
            <div className="text-[10px] tracking-[0.2em] uppercase opacity-60">Measuring Impact | Driving Results</div>
          </div>
          <div className="text-[10px] opacity-60">{saveState === "saving" ? "Saving..." : saveState === "saved" ? "Saved" : saveState === "error" ? "Save failed - retry" : ""}</div>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-3 pt-4">
        {tab === "dash" && <Dashboard data={data} setTab={setTab} />}
        {tab === "crm" && <CRM data={data} update={update} />}
        {tab === "proj" && <Projects data={data} update={update} />}
        {tab === "time" && <Time data={data} update={update} />}
        {tab === "money" && <Money data={data} update={update} />}
      </main>
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200">
        <div className="max-w-2xl mx-auto grid grid-cols-5">
          {tabs.map(({ k, label, icon: Icon }) => (
            <button key={k} onClick={() => setTab(k)} className="py-2.5 flex flex-col items-center gap-0.5" aria-label={label}>
              <Icon size={20} color={tab === k ? NAVY : "#9CA3AF"} strokeWidth={tab === k ? 2.4 : 1.8} />
              <span className="text-[10px]" style={{ color: tab === k ? NAVY : "#9CA3AF", fontWeight: tab === k ? 700 : 500 }}>{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

function Dashboard({ data, setTab }) {
  const { projects, tasks, invoices, opportunities } = data;
  const active = projects.filter((p) => p.status === "Active");
  const atRisk = active.filter((p) => projectHealth(p, tasks) === "red").length;
  const openTasks = tasks.filter((t) => t.status !== "Complete");
  const outstanding = invoices.filter((i) => i.status === "Sent").reduce((s, i) => s + (i.amount || 0), 0);
  const yr = today().slice(0, 4);
  const ytd = invoices.filter((i) => i.status === "Paid" && i.paidDate && i.paidDate.startsWith(yr)).reduce((s, i) => s + (i.amount || 0), 0);
  const pipeline = opportunities.filter((o) => !["Won", "Lost"].includes(o.status)).reduce((s, o) => s + (o.value || 0), 0);
  const month = today().slice(0, 7);
  const hrsMonth = data.time.filter((t) => t.date && t.date.startsWith(month)).reduce((s, t) => s + (t.hours || 0), 0);

  const upcoming = [
    ...openTasks.filter((t) => within(t.due, 7) || isPast(t.due)).map((t) => ({ kind: "task", label: t.title, due: t.due, overdue: isPast(t.due) })),
    ...invoices.filter((i) => i.status !== "Paid" && (within(i.due, 7) || isPast(i.due))).map((i) => ({ kind: "invoice", label: `Invoice ${i.number} \u2014 ${i.org}`, due: i.due, overdue: isPast(i.due) })),
    ...opportunities.filter((o) => o.followUp && (within(o.followUp, 7) || isPast(o.followUp)) && !["Won", "Lost"].includes(o.status)).map((o) => ({ kind: "follow-up", label: `Follow up: ${o.org}`, due: o.followUp, overdue: isPast(o.followUp) }))
  ].sort((a, b) => (a.due || "").localeCompare(b.due || ""));

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <Stat label="Active projects" value={active.length} sub={atRisk ? `${atRisk} at risk` : "all tracking"} alert={atRisk > 0} />
        <Stat label="Open pipeline" value={pipeline ? fmt$(pipeline) : `${opportunities.filter((o) => !["Won", "Lost"].includes(o.status)).length} opps`} sub="unweighted" />
        <Stat label="Outstanding invoices" value={fmt$(outstanding)} sub="sent, unpaid" />
        <Stat label={`${yr} revenue`} value={fmt$(ytd)} sub="paid YTD" />
        <Stat label="Hours this month" value={hrsMonth || 0} />
        <Stat label="Open tasks" value={openTasks.length} sub={`${openTasks.filter((t) => isPast(t.due)).length} overdue`} alert={openTasks.some((t) => isPast(t.due))} />
      </div>
      <SectionTitle>Project health</SectionTitle>
      <Card className="divide-y divide-gray-100 mb-4">
        {active.map((p) => {
          const h = projectHealth(p, tasks);
          const next = (p.milestones || []).filter((m) => m.pct < 100).sort((a, b) => (a.due || "").localeCompare(b.due || ""))[0];
          return (
            <button key={p.id} onClick={() => setTab("proj")} className="w-full text-left px-3 py-2.5 flex items-center">
              <HealthDot h={h} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{p.name}</div>
                <div className="text-xs text-gray-400 truncate">{next ? `Next: ${next.name} \u00b7 ${fmtD(next.due)}` : "All milestones complete"}</div>
              </div>
              <ArrowRight size={14} className="text-gray-300" />
            </button>
          );
        })}
        {active.length === 0 && <div className="px-3 py-4 text-sm text-gray-400">No active projects. Win one in the pipeline.</div>}
      </Card>
      <SectionTitle>Next 7 days</SectionTitle>
      <Card className="divide-y divide-gray-100">
        {upcoming.map((u, i) => (
          <div key={i} className="px-3 py-2.5 flex items-center gap-2">
            {u.overdue ? <AlertTriangle size={14} color="#B3322B" /> : <Circle size={8} className="text-gray-300" fill="currentColor" />}
            <div className="flex-1 min-w-0">
              <div className="text-sm truncate">{u.label}</div>
              <div className="text-[11px] text-gray-400">{u.kind}{" \u00b7 "}{u.overdue ? "overdue " : "due "}{fmtD(u.due)}</div>
            </div>
          </div>
        ))}
        {upcoming.length === 0 && <div className="px-3 py-4 text-sm text-gray-400">Nothing due this week.</div>}
      </Card>
    </div>
  );
}

function CRM({ data, update }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ org: "", contact: "", title: "", value: "", securing: "John" });
  const [open, setOpen] = useState(null);

  const move = (o, dir) => {
    const i = OPP_STATUSES.indexOf(o.status);
    const newStatus = OPP_STATUSES[Math.min(Math.max(i + dir, 0), OPP_STATUSES.length - 1)];
    update((d) => {
      let projects = d.projects;
      if (newStatus === "Won" && o.status !== "Won") {
        projects = [...d.projects, {
          id: uid(), name: o.title || `${o.org} engagement`, org: o.org, value: o.value || null,
          status: "Not Started", start: today(), end: null, securing: o.securing,
          milestones: ["Kickoff", "Data Collection", "Analysis", "Dashboard Build", "Draft Report", "Final Report", "Client Presentation"].map((name) => ({ id: uid(), name, due: null, pct: 0 }))
        }];
      }
      return { ...d, projects, opportunities: d.opportunities.map((x) => (x.id === o.id ? { ...x, status: newStatus } : x)) };
    });
  };

  const saveOpp = () => {
    if (!form.org) return;
    update((d) => ({ ...d, opportunities: [...d.opportunities, { id: uid(), ...form, value: form.value ? Number(form.value) : null, status: "Lead", proposalSent: null, expectedClose: null, followUp: null, notes: "" }] }));
    setForm({ org: "", contact: "", title: "", value: "", securing: "John" });
    setAdding(false);
  };

  const setOppField = (id, field, val) => update((d) => ({ ...d, opportunities: d.opportunities.map((o) => (o.id === id ? { ...o, [field]: val } : o)) }));
  const activeStages = OPP_STATUSES.filter((s) => !["Won", "Lost"].includes(s));
  const closed = data.opportunities.filter((o) => ["Won", "Lost"].includes(o.status));

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <SectionTitle>Pipeline</SectionTitle>
        <button className={btnPrimary} style={{ background: NAVY }} onClick={() => setAdding(!adding)}>{adding ? "Cancel" : "+ Opportunity"}</button>
      </div>
      {adding && (
        <Card className="p-3 mb-3">
          <Field label="Organization"><input className={inp} value={form.org} onChange={(e) => setForm({ ...form, org: e.target.value })} /></Field>
          <Field label="Contact"><input className={inp} value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} /></Field>
          <Field label="Opportunity title"><input className={inp} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Est. value ($)"><input type="number" className={inp} value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} /></Field>
            <Field label="Secured by"><select className={inp} value={form.securing} onChange={(e) => setForm({ ...form, securing: e.target.value })}>{PARTNERS.map((p) => <option key={p}>{p}</option>)}</select></Field>
          </div>
          <button className={btnPrimary + " w-full mt-1"} style={{ background: NAVY }} onClick={saveOpp}>Add to pipeline</button>
        </Card>
      )}
      {activeStages.map((stage) => {
        const opps = data.opportunities.filter((o) => o.status === stage);
        if (!opps.length) return null;
        return (
          <div key={stage} className="mb-4">
            <div className="text-xs font-bold uppercase tracking-wider mb-1.5 px-1" style={{ color: NAVY }}>{stage} <span className="text-gray-300 font-medium">{"\u00b7 "}{opps.length}</span></div>
            {opps.map((o) => (
              <Card key={o.id} className="p-3 mb-2">
                <button className="w-full text-left" onClick={() => setOpen(open === o.id ? null : o.id)}>
                  <div className="flex justify-between items-start">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">{o.org}</div>
                      <div className="text-xs text-gray-400 truncate">{o.title || "\u2014"}</div>
                    </div>
                    <div className="text-sm font-bold ml-2" style={{ color: NAVY, fontVariantNumeric: "tabular-nums" }}>{fmt$(o.value)}</div>
                  </div>
                  <div className="text-[11px] text-gray-400 mt-1">{o.contact && `${o.contact} \u00b7 `}secured by {o.securing}{o.followUp && ` \u00b7 follow up ${fmtD(o.followUp)}`}</div>
                </button>
                {open === o.id && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-2">
                      <Field label="Value ($)"><input type="number" className={inp} value={o.value ?? ""} onChange={(e) => setOppField(o.id, "value", e.target.value ? Number(e.target.value) : null)} /></Field>
                      <Field label="Follow-up date"><input type="date" className={inp} value={o.followUp ?? ""} onChange={(e) => setOppField(o.id, "followUp", e.target.value)} /></Field>
                    </div>
                    <Field label="Notes"><textarea className={inp} rows={2} value={o.notes ?? ""} onChange={(e) => setOppField(o.id, "notes", e.target.value)} /></Field>
                  </div>
                )}
                <div className="flex gap-2 mt-2">
                  <button className={btnGhost} onClick={() => move(o, -1)}><ArrowLeft size={12} className="inline" /> Back</button>
                  <button className={btnGhost + " flex-1"} style={{ borderColor: NAVY, color: NAVY }} onClick={() => move(o, 1)}>Advance <ArrowRight size={12} className="inline" /></button>
                  <button className={btnGhost} onClick={() => setOppField(o.id, "status", "Lost")}>Lost</button>
                </div>
              </Card>
            ))}
          </div>
        );
      })}
      {closed.length > 0 && (
        <>
          <SectionTitle>Closed</SectionTitle>
          <Card className="divide-y divide-gray-100">
            {closed.map((o) => (
              <div key={o.id} className="px-3 py-2 flex justify-between text-sm">
                <span className="truncate">{o.org}</span>
                <span className={o.status === "Won" ? "text-green-700 font-semibold" : "text-gray-400"}>{o.status}</span>
              </div>
            ))}
          </Card>
        </>
      )}
    </div>
  );
}

function Projects({ data, update }) {
  const [open, setOpen] = useState(null);
  const [taskForm, setTaskForm] = useState({});

  const setMs = (pid, mid, pct) => update((d) => ({ ...d, projects: d.projects.map((p) => (p.id === pid ? { ...p, milestones: p.milestones.map((m) => (m.id === mid ? { ...m, pct: Math.min(100, Math.max(0, pct)) } : m)) } : p)) }));
  const setProjStatus = (pid, status) => update((d) => ({ ...d, projects: d.projects.map((p) => (p.id === pid ? { ...p, status } : p)) }));
  const cycleTask = (tid) => update((d) => ({ ...d, tasks: d.tasks.map((t) => (t.id === tid ? { ...t, status: TASK_STATUSES[(TASK_STATUSES.indexOf(t.status) + 1) % TASK_STATUSES.length] } : t)) }));
  const addTask = (pid) => {
    const f = taskForm[pid] || {};
    if (!f.title) return;
    update((d) => ({ ...d, tasks: [...d.tasks, { id: uid(), projectId: pid, title: f.title, assignee: f.assignee || "John", due: f.due || null, priority: f.priority || "Medium", status: "Not Started" }] }));
    setTaskForm({ ...taskForm, [pid]: { title: "" } });
  };

  return (
    <div>
      <SectionTitle>Projects</SectionTitle>
      {data.projects.map((p) => {
        const h = projectHealth(p, data.tasks);
        const pt = data.tasks.filter((t) => t.projectId === p.id);
        const openCt = pt.filter((t) => t.status !== "Complete").length;
        const avgPct = p.milestones?.length ? Math.round(p.milestones.reduce((s, m) => s + m.pct, 0) / p.milestones.length) : 0;
        const f = taskForm[p.id] || {};
        return (
          <Card key={p.id} className="mb-3 overflow-hidden">
            <button className="w-full text-left p-3" onClick={() => setOpen(open === p.id ? null : p.id)}>
              <div className="flex items-center">
                <HealthDot h={h} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{p.name}</div>
                  <div className="text-xs text-gray-400 truncate">{p.org}{" \u00b7 "}{p.status}{p.value ? ` \u00b7 ${fmt$(p.value)}` : ""}</div>
                </div>
                {open === p.id ? <ChevronUp size={16} className="text-gray-300" /> : <ChevronDown size={16} className="text-gray-300" />}
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-gray-100 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${avgPct}%`, background: NAVY }} /></div>
              <div className="text-[11px] text-gray-400 mt-1" style={{ fontVariantNumeric: "tabular-nums" }}>{avgPct}% complete{" \u00b7 "}{openCt} open task{openCt === 1 ? "" : "s"}</div>
            </button>
            {open === p.id && (
              <div className="px-3 pb-3 border-t border-gray-100">
                <div className="flex gap-1.5 my-2 flex-wrap">
                  {PROJ_STATUSES.map((s) => (
                    <button key={s} onClick={() => setProjStatus(p.id, s)} className="px-2 py-1 rounded-md text-[11px] font-medium border"
                      style={p.status === s ? { background: NAVY, color: "white", borderColor: NAVY } : { borderColor: "#E5E7EB", color: "#6B7280" }}>{s}</button>
                  ))}
                </div>
                <div className="text-xs font-bold uppercase tracking-wider mt-3 mb-1.5" style={{ color: NAVY }}>Milestones</div>
                {(p.milestones || []).map((m) => (
                  <div key={m.id} className="flex items-center gap-2 py-1.5">
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm truncate ${m.pct === 100 ? "text-gray-300 line-through" : ""}`}>{m.name}</div>
                      <div className="text-[11px]" style={{ color: isPast(m.due) && m.pct < 100 ? "#B3322B" : "#9CA3AF" }}>{m.due ? fmtD(m.due) : "no date"}</div>
                    </div>
                    <button className={btnGhost} onClick={() => setMs(p.id, m.id, m.pct - 10)}>-</button>
                    <span className="text-sm font-bold w-10 text-center" style={{ color: NAVY, fontVariantNumeric: "tabular-nums" }}>{m.pct}%</span>
                    <button className={btnGhost} onClick={() => setMs(p.id, m.id, m.pct + 10)}>+</button>
                  </div>
                ))}
                <div className="text-xs font-bold uppercase tracking-wider mt-3 mb-1.5" style={{ color: NAVY }}>Tasks</div>
                {pt.map((t) => (
                  <button key={t.id} onClick={() => cycleTask(t.id)} className="w-full flex items-center gap-2 py-1.5 text-left">
                    <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${t.status === "Complete" ? "border-green-700 bg-green-700" : "border-gray-300"}`}>
                      {t.status === "Complete" && <Check size={11} color="white" />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm truncate ${t.status === "Complete" ? "text-gray-300 line-through" : ""}`}>{t.title}</div>
                      <div className="text-[11px]" style={{ color: isPast(t.due) && t.status !== "Complete" ? "#B3322B" : "#9CA3AF" }}>{t.assignee}{" \u00b7 "}{t.status}{t.due ? ` \u00b7 ${fmtD(t.due)}` : ""}{" \u00b7 "}{t.priority}</div>
                    </div>
                  </button>
                ))}
                <div className="flex gap-2 mt-2">
                  <input className={inp + " flex-1"} placeholder="New task..." value={f.title || ""} onChange={(e) => setTaskForm({ ...taskForm, [p.id]: { ...f, title: e.target.value } })} />
                  <button className={btnPrimary} style={{ background: NAVY }} onClick={() => addTask(p.id)}><Plus size={16} /></button>
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

function Time({ data, update }) {
  const [f, setF] = useState({ projectId: data.projects[0]?.id || "", person: "John", date: today(), hours: "", billable: true, note: "" });
  const add = () => {
    if (!f.hours || !f.projectId) return;
    update((d) => ({ ...d, time: [{ id: uid(), ...f, hours: Number(f.hours) }, ...d.time] }));
    setF({ ...f, hours: "", note: "" });
  };
  const month = today().slice(0, 7);
  const monthEntries = data.time.filter((t) => t.date && t.date.startsWith(month));
  const byProject = useMemo(() => { const m = {}; monthEntries.forEach((t) => { m[t.projectId] = (m[t.projectId] || 0) + t.hours; }); return m; }, [data.time]);
  const projName = (id) => data.projects.find((p) => p.id === id)?.name || "\u2014";

  return (
    <div>
      <SectionTitle>Log time</SectionTitle>
      <Card className="p-3 mb-4">
        <Field label="Project"><select className={inp} value={f.projectId} onChange={(e) => setF({ ...f, projectId: e.target.value })}>{data.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>
        <div className="grid grid-cols-3 gap-2">
          <Field label="Hours"><input type="number" step="0.25" className={inp} value={f.hours} onChange={(e) => setF({ ...f, hours: e.target.value })} /></Field>
          <Field label="Date"><input type="date" className={inp} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field>
          <Field label="Who"><select className={inp} value={f.person} onChange={(e) => setF({ ...f, person: e.target.value })}>{PARTNERS.map((p) => <option key={p}>{p}</option>)}</select></Field>
        </div>
        <div className="flex items-center justify-between mt-1">
          <button onClick={() => setF({ ...f, billable: !f.billable })} className={btnGhost} style={f.billable ? { background: NAVY, color: "white", borderColor: NAVY } : {}}>{f.billable ? "Billable" : "Non-billable"}</button>
          <button className={btnPrimary} style={{ background: NAVY }} onClick={add}>Log hours</button>
        </div>
      </Card>
      <SectionTitle>This month by project</SectionTitle>
      <Card className="divide-y divide-gray-100 mb-4">
        {Object.entries(byProject).map(([pid, hrs]) => (
          <div key={pid} className="px-3 py-2.5 flex justify-between text-sm"><span className="truncate">{projName(pid)}</span><span className="font-bold" style={{ color: NAVY, fontVariantNumeric: "tabular-nums" }}>{hrs} h</span></div>
        ))}
        {Object.keys(byProject).length === 0 && <div className="px-3 py-4 text-sm text-gray-400">No hours logged this month yet.</div>}
      </Card>
      <SectionTitle>Recent entries</SectionTitle>
      <Card className="divide-y divide-gray-100">
        {data.time.slice(0, 12).map((t) => (
          <div key={t.id} className="px-3 py-2 text-sm flex justify-between">
            <div className="min-w-0">
              <div className="truncate">{projName(t.projectId)}{t.note ? ` \u2014 ${t.note}` : ""}</div>
              <div className="text-[11px] text-gray-400">{t.person}{" \u00b7 "}{fmtD(t.date)}{" \u00b7 "}{t.billable ? "billable" : "non-billable"}</div>
            </div>
            <span className="font-bold ml-2" style={{ color: NAVY, fontVariantNumeric: "tabular-nums" }}>{t.hours}h</span>
          </div>
        ))}
        {data.time.length === 0 && <div className="px-3 py-4 text-sm text-gray-400">Nothing yet. Log your first entry above.</div>}
      </Card>
    </div>
  );
}

function Money({ data, update }) {
  const [addingInv, setAddingInv] = useState(false);
  const [inv, setInv] = useState({ org: "", amount: "", due: "", projectId: "" });
  const [addingExp, setAddingExp] = useState(false);
  const [exp, setExp] = useState({ desc: "", amount: "", date: today() });

  const nextNumber = () => `WT-${String(data.invoices.length + 1).padStart(3, "0")}`;
  const cycleInvoice = (id) => update((d) => ({
    ...d,
    invoices: d.invoices.map((i) => {
      if (i.id !== id) return i;
      const idx = INV_FLOW.indexOf(i.status === "Overdue" ? "Sent" : i.status);
      const next = INV_FLOW[Math.min(idx + 1, INV_FLOW.length - 1)];
      return { ...i, status: next, paidDate: next === "Paid" ? today() : i.paidDate };
    })
  }));
  const addInvoice = () => {
    if (!inv.org || !inv.amount) return;
    update((d) => ({ ...d, invoices: [...d.invoices, { id: uid(), number: nextNumber(), org: inv.org, projectId: inv.projectId || null, amount: Number(inv.amount), due: inv.due || null, status: "Draft", paidDate: null }] }));
    setInv({ org: "", amount: "", due: "", projectId: "" });
    setAddingInv(false);
  };
  const addExpense = () => {
    if (!exp.desc || !exp.amount) return;
    update((d) => ({ ...d, expenses: [...d.expenses, { id: uid(), desc: exp.desc, amount: Number(exp.amount), date: exp.date, approvals: [] }] }));
    setExp({ desc: "", amount: "", date: today() });
    setAddingExp(false);
  };
  const approveExp = (id, partner) => update((d) => ({ ...d, expenses: d.expenses.map((e) => (e.id === id ? { ...e, approvals: e.approvals.includes(partner) ? e.approvals : [...e.approvals, partner] } : e)) }));

  const yr = today().slice(0, 4);
  const paidYr = data.invoices.filter((i) => i.status === "Paid" && i.paidDate && i.paidDate.startsWith(yr));
  const revenue = paidYr.reduce((s, i) => s + i.amount, 0);
  const commissionBy = {};
  paidYr.forEach((i) => {
    const proj = data.projects.find((p) => p.id === i.projectId);
    const who = proj?.securing || "John";
    commissionBy[who] = (commissionBy[who] || 0) + i.amount * 0.1;
  });
  const commissionTotal = Object.values(commissionBy).reduce((s, v) => s + v, 0);
  const approvedExp = data.expenses.filter((e) => e.approvals.length >= 2).reduce((s, e) => s + e.amount, 0);
  const profit = revenue - commissionTotal - approvedExp;
  const taxReserve = Math.max(profit * 0.3, 0);
  const retained = Math.max(profit * 0.05, 0);
  const distributable = Math.max(profit - taxReserve - retained, 0);
  const perPartner = distributable / 2;
  const invStatusColor = (s, due) => (s === "Paid" ? "#1F7A4D" : s === "Sent" && isPast(due) ? "#B3322B" : s === "Sent" ? "#B7791F" : "#9CA3AF");

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <SectionTitle>Invoices</SectionTitle>
        <button className={btnPrimary} style={{ background: NAVY }} onClick={() => setAddingInv(!addingInv)}>{addingInv ? "Cancel" : "+ Invoice"}</button>
      </div>
      {addingInv && (
        <Card className="p-3 mb-3">
          <Field label="Client / organization"><input className={inp} value={inv.org} onChange={(e) => setInv({ ...inv, org: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Amount ($)"><input type="number" className={inp} value={inv.amount} onChange={(e) => setInv({ ...inv, amount: e.target.value })} /></Field>
            <Field label="Due date"><input type="date" className={inp} value={inv.due} onChange={(e) => setInv({ ...inv, due: e.target.value })} /></Field>
          </div>
          <Field label="Project (drives commission)"><select className={inp} value={inv.projectId} onChange={(e) => setInv({ ...inv, projectId: e.target.value })}><option value="">{"\u2014 none \u2014"}</option>{data.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>
          <button className={btnPrimary + " w-full"} style={{ background: NAVY }} onClick={addInvoice}>Create {nextNumber()}</button>
        </Card>
      )}
      <Card className="divide-y divide-gray-100 mb-5">
        {data.invoices.slice().sort((a, b) => (b.due || "").localeCompare(a.due || "")).map((i) => {
          const displayStatus = i.status === "Sent" && isPast(i.due) ? "Overdue" : i.status;
          return (
            <div key={i.id} className="px-3 py-2.5 flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">{i.number} <span className="font-normal text-gray-500">{"\u00b7 "}{i.org}</span></div>
                <div className="text-[11px] text-gray-400">due {fmtD(i.due)}{i.paidDate ? ` \u00b7 paid ${fmtD(i.paidDate)}` : ""}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold" style={{ color: NAVY, fontVariantNumeric: "tabular-nums" }}>{fmt$(i.amount)}</div>
                <button onClick={() => cycleInvoice(i.id)} disabled={i.status === "Paid"} className="text-[11px] font-bold uppercase tracking-wide" style={{ color: invStatusColor(i.status, i.due) }}>
                  {displayStatus}{i.status !== "Paid" && " \u2192"}
                </button>
              </div>
            </div>
          );
        })}
      </Card>

      <div className="flex justify-between items-center mb-3">
        <SectionTitle>Expenses (dual approval)</SectionTitle>
        <button className={btnPrimary} style={{ background: NAVY }} onClick={() => setAddingExp(!addingExp)}>{addingExp ? "Cancel" : "+ Expense"}</button>
      </div>
      {addingExp && (
        <Card className="p-3 mb-3">
          <Field label="Description"><input className={inp} value={exp.desc} onChange={(e) => setExp({ ...exp, desc: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Amount ($)"><input type="number" className={inp} value={exp.amount} onChange={(e) => setExp({ ...exp, amount: e.target.value })} /></Field>
            <Field label="Date"><input type="date" className={inp} value={exp.date} onChange={(e) => setExp({ ...exp, date: e.target.value })} /></Field>
          </div>
          <button className={btnPrimary + " w-full"} style={{ background: NAVY }} onClick={addExpense}>Submit for approval</button>
        </Card>
      )}
      <Card className="divide-y divide-gray-100 mb-5">
        {data.expenses.map((e) => (
          <div key={e.id} className="px-3 py-2.5">
            <div className="flex justify-between text-sm"><span className="truncate">{e.desc}</span><span className="font-bold" style={{ color: NAVY }}>{fmt$(e.amount)}</span></div>
            <div className="flex gap-2 mt-1.5">
              {PARTNERS.map((p) => (
                <button key={p} onClick={() => approveExp(e.id, p)} className={btnGhost} style={e.approvals.includes(p) ? { background: "#1F7A4D", color: "white", borderColor: "#1F7A4D" } : {}}>
                  {e.approvals.includes(p) ? `${p} \u2713` : `${p} approve`}
                </button>
              ))}
              <span className="text-[11px] text-gray-400 self-center ml-auto">{e.approvals.length >= 2 ? "Approved" : `${e.approvals.length}/2`}</span>
            </div>
          </div>
        ))}
        {data.expenses.length === 0 && <div className="px-3 py-4 text-sm text-gray-400">No expenses submitted. Both partners must approve per the operating agreement.</div>}
      </Card>

      <SectionTitle>Distribution preview {"\u00b7"} {yr} YTD</SectionTitle>
      <Card className="p-3 mb-4">
        <Ledger label="Revenue (paid invoices)" value={revenue} bold />
        <Ledger label={`Acquisition commission 10%${Object.keys(commissionBy).length ? " (" + Object.entries(commissionBy).map(([k, v]) => `${k} ${fmt$(v)}`).join(", ") + ")" : ""}`} value={-commissionTotal} />
        <Ledger label="Approved expenses" value={-approvedExp} />
        <Ledger label="Net profit" value={profit} bold rule />
        <Ledger label="Tax reserve (30%)" value={-taxReserve} />
        <Ledger label="Retained earnings (5%)" value={-retained} />
        <Ledger label="Distributable" value={distributable} bold rule />
        {PARTNERS.map((p) => (
          <Ledger key={p} label={`${p} \u00b7 50% share${commissionBy[p] ? ` + ${fmt$(commissionBy[p])} commission` : ""}`} value={perPartner + (commissionBy[p] || 0)} accent />
        ))}
        <div className="text-[11px] text-gray-400 mt-3 leading-snug">
          Commission, tax reserve, and retained earnings rules come from the draft operating agreement. Confirm the executed agreement is amended before treating this as binding.
        </div>
      </Card>
    </div>
  );
}

const Ledger = ({ label, value, bold, rule, accent }) => (
  <div className={`flex justify-between items-baseline py-1.5 ${rule ? "border-t border-gray-200 mt-1 pt-2" : ""}`}>
    <span className={`text-sm ${bold ? "font-semibold" : "text-gray-500"} ${accent ? "font-semibold" : ""}`} style={accent ? { color: NAVY } : {}}>{label}</span>
    <span className={`text-sm ${bold || accent ? "font-bold" : ""}`} style={{ fontVariantNumeric: "tabular-nums", color: accent ? "#1F7A4D" : value < 0 ? "#6B7280" : NAVY, fontFamily: "'Space Grotesk', sans-serif" }}>
      {value < 0 ? `(${fmt$(Math.abs(value))})` : fmt$(value)}
    </span>
  </div>
);
