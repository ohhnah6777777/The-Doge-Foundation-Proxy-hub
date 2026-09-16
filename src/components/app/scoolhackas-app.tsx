import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Award, Bookmark, Braces, Check, CircleUserRound, Clock3, Code2, House, Link2, LockKeyhole, LogOut, Mail, Moon, Network, Orbit, Pencil, Play, RotateCw, Send, ShieldCheck, Sparkles, Sun, UserRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import autoclickerIcon from "@/assets/hack-autoclicker.png";

const ranks = [
  { name: "Beginner hacka", min: 1, max: 5 }, { name: "Intermediate hacka", min: 6, max: 12 },
  { name: "Pro hacka", min: 13, max: 20 }, { name: "Alpha hacka", min: 21, max: 30 },
  { name: "Omega hacka", min: 31, max: 45 }, { name: "The Hacka", min: 46, max: Infinity },
] as const;
const TIER_NAMES = ["Beginner", "Intermediate", "Pro", "Alpha", "Omega", "The Hacka"] as const;
const PROXY_TIER = 2;
const CONTACT_TIER = 4;

const quests = [
  { id: "bookmarklet", tier: 0, title: "Create your first hack bookmarklet", xp: 100, seconds: 20 },
  { id: "cloak", tier: 1, title: "Deploy your first cloak panel", xp: 180, seconds: 45 },
  { id: "blooket", tier: 2, title: "Hack your first Blooket game", xp: 300, seconds: 120 },
  { id: "handshake", tier: 3, title: "Initialize a proxy handshake", xp: 420, seconds: 75 },
  { id: "omega", tier: 4, title: "Complete an omega systems check", xp: 600, seconds: 90 },
] as const;

type HackEntry = { id: string; name: string; description: string; url: string; steps: string[]; image?: string };
const hackLibrary: { tier: number; title: string; hacks: HackEntry[] }[] = [
  {
    tier: 0,
    title: "Beginner hacks",
    hacks: [
      {
        id: "autoclicker",
        name: "Auto clicker bookmarklet",
        description: "A one-click bookmarklet that repeatedly clicks wherever you point, great for idle games and repetitive clicking.",
        url: "https://github.com/sparemind/AutoClickerBookmarklet",
        image: autoclickerIcon,
        steps: [
          "Open the GitHub link and copy the bookmarklet code block.",
          "Show your browser bookmarks bar (Ctrl/Cmd + Shift + B).",
          "Right-click the bookmarks bar and choose \"Add page\" / \"New bookmark\".",
          "Name it \"auto clicker\" and paste the copied code into the URL field.",
          "Open the page you want to use it on, then click the bookmark to start.",
          "Click the bookmark again to stop the clicking.",
        ],
      },
      {
        id: "editpage",
        name: "Edit page bookmarklet",
        description: "Turns any page into an editable document so you can rewrite text on screen. Changes are local only and disappear on refresh.",
        url: "https://github.com/TacocatDev01/Edit-Page-Bookmarklet",
        steps: [
          "Open the GitHub link and copy the bookmarklet code block.",
          "Show your browser bookmarks bar (Ctrl/Cmd + Shift + B).",
          "Right-click the bookmarks bar and choose \"Add page\" / \"New bookmark\".",
          "Name it \"edit page\" and paste the copied code into the URL field.",
          "Open any page and click the bookmark to toggle editing on.",
          "Click into the text and type. Refresh the page to undo everything.",
        ],
      },
    ],
  },
  { tier: 1, title: "Intermediate hacks", hacks: [] },
  { tier: 2, title: "Pro hacks", hacks: [] },
  { tier: 3, title: "Alpha hacks", hacks: [] },
  { tier: 4, title: "Omega hacks", hacks: [] },
  { tier: 5, title: "The Hacka vault", hacks: [] },
];

type Tab = "Home" | "Hacks" | "Proxy" | "Other hacka stuff" | "Contact owner" | "You";
const nav: { label: Tab; icon: typeof House }[] = [
  { label: "Home", icon: House }, { label: "Hacks", icon: Code2 }, { label: "Proxy", icon: Network },
  { label: "Other hacka stuff", icon: Orbit }, { label: "Contact owner", icon: Mail }, { label: "You", icon: UserRound },
];

function levelForXp(xp: number) { return Math.floor(xp / 500) + 1; }
function tierForLevel(level: number) { return Math.max(0, ranks.findIndex((rank) => level >= rank.min && level <= rank.max)); }
function formatTime(total: number) { return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`; }

type Run = { questId: string; phase: "confirming" | "counting" | "ready"; remaining: number };

export function ScoolhackasApp() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("Home");
  const [xp, setXp] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);
  const [run, setRun] = useState<Run | null>(null);
  const [confirmExit, setConfirmExit] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [cloak, setCloak] = useState(false);
  const [profile, setProfile] = useState({ id: "", display_name: "", created_at: "", persona: "" });
  const [draftName, setDraftName] = useState("");
  const [saved, setSaved] = useState(false);
  const [onboarding, setOnboarding] = useState(false);
  const [levelUp, setLevelUp] = useState<string | null>(null);

  const level = levelForXp(xp);
  const tier = tierForLevel(level);
  const rank = ranks[tier] ?? ranks[0];
  const levelXp = xp % 500;

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("scoolhackas-progress") ?? "null") as { xp?: number; completed?: string[] } | null;
    if (stored) { setXp(stored.xp ?? 0); setCompleted(stored.completed ?? []); }
    const storedTheme = localStorage.getItem("scoolhackas-theme") === "light" ? "light" : "dark";
    setTheme(storedTheme); document.documentElement.classList.toggle("dark", storedTheme === "dark");
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("id,display_name,created_at,google_cloak_enabled,persona,onboarded").eq("id", user.id).maybeSingle();
      if (data) {
        setProfile({ id: data.id, display_name: data.display_name, created_at: data.created_at, persona: data.persona });
        setDraftName(data.display_name); setCloak(data.google_cloak_enabled); setOnboarding(!data.onboarded);
      } else {
        const displayName = String(user.user_metadata?.["display_name"] ?? user.user_metadata?.["full_name"] ?? user.email?.split("@")[0] ?? "hacka");
        const { data: created } = await supabase.from("profiles").insert({ id: user.id, display_name: displayName }).select("id,display_name,created_at,persona").single();
        if (created) {
          setProfile({ id: created.id, display_name: created.display_name, created_at: created.created_at, persona: created.persona });
          setDraftName(created.display_name); setOnboarding(true);
        }
      }
    })();
  }, []);

  useEffect(() => { localStorage.setItem("scoolhackas-progress", JSON.stringify({ xp, completed })); }, [xp, completed]);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("scoolhackas-theme", theme);
  }, [theme]);
  useEffect(() => {
    document.title = cloak ? "Google" : "scoolhackas";
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (link) link.href = cloak ? "https://www.google.com/favicon.ico" : "/favicon.svg";
  }, [cloak]);

  useEffect(() => {
    if (!run || run.phase === "ready") return;
    if (run.phase === "confirming") {
      const id = window.setTimeout(() => setRun((value) => (value ? { ...value, phase: "counting" } : value)), 2600);
      return () => window.clearTimeout(id);
    }
    const id = window.setInterval(() => {
      setRun((value) => {
        if (!value || value.phase !== "counting") return value;
        const next = value.remaining - 1;
        return next <= 0 ? { ...value, remaining: 0, phase: "ready" } : { ...value, remaining: next };
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [run?.phase, run?.questId]);

  const grant = useCallback((id: string, amount: number) => {
    setCompleted((items) => (items.includes(id) ? items : [...items, id]));
    setXp((value) => {
      if (completed.includes(id)) return value;
      const next = value + amount;
      const nextTier = tierForLevel(levelForXp(next));
      if (nextTier > tierForLevel(levelForXp(value))) setLevelUp(ranks[nextTier]?.name ?? null);
      return next;
    });
  }, [completed]);

  const startQuest = (questId: string, seconds: number) => {
    const quest = quests.find((item) => item.id === questId);
    if (!quest || quest.tier > tier || completed.includes(questId)) return;
    if (questId === "blooket") window.open("about:blank", "_blank", "noopener,noreferrer");
    setRun({ questId, phase: "confirming", remaining: seconds });
  };
  const claimRun = () => {
    if (!run) return;
    const quest = quests.find((item) => item.id === run.questId);
    if (quest) grant(quest.id, quest.xp);
    setRun(null);
  };
  const refreshQuests = () => { setRun(null); setConfirmExit(false); };

  const saveProfile = async () => {
    if (!profile.id) return;
    const { error } = await supabase.from("profiles").update({ display_name: draftName.trim() }).eq("id", profile.id);
    if (!error) { setProfile((value) => ({ ...value, display_name: draftName.trim() })); setSaved(true); window.setTimeout(() => setSaved(false), 1800); }
  };
  const setCloakValue = async (checked: boolean) => {
    setCloak(checked);
    if (profile.id) await supabase.from("profiles").update({ google_cloak_enabled: checked }).eq("id", profile.id);
  };
  const finishOnboarding = async (persona: string, chosenTheme: "dark" | "light") => {
    setTheme(chosenTheme); setProfile((value) => ({ ...value, persona })); setOnboarding(false);
    if (profile.id) await supabase.from("profiles").update({ persona, onboarded: true }).eq("id", profile.id);
  };
  const signOut = async () => { await supabase.auth.signOut(); await navigate({ to: "/auth", replace: true }); };

  const activeQuest = useMemo(() => quests.find((item) => item.id === run?.questId) ?? null, [run?.questId]);

  return <div className="min-h-screen bg-background text-foreground">
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-5 px-4 sm:px-6">
        <div className="flex shrink-0 items-center gap-2.5 font-display text-base font-semibold"><span className="grid size-8 place-items-center rounded-md border border-border bg-secondary"><Braces className="size-4" /></span>scoolhackas</div>
        <nav className="scrollbar-none flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
          {nav.map((item) => {
            const locked = (item.label === "Proxy" && tier < PROXY_TIER) || (item.label === "Contact owner" && tier < CONTACT_TIER);
            return <Button key={item.label} variant={tab === item.label ? "secondary" : "ghost"} size="sm" onClick={() => setTab(item.label)} className="shrink-0">
              {locked ? <LockKeyhole /> : <item.icon />} <span className="hidden md:inline">{item.label}</span>
            </Button>;
          })}
        </nav>
        <div className="hidden items-center gap-2 border-l border-border pl-5 sm:flex"><span className="size-2 rounded-full bg-success shadow-[0_0_12px_var(--success)]" /><span className="text-xs text-muted-foreground">level {level}</span></div>
      </div>
    </header>

    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      {tab === "Home" && <HomePanel xp={xp} level={level} levelXp={levelXp} rank={rank.name} tier={tier} completed={completed} run={run} startQuest={startQuest} refreshQuests={refreshQuests} />}
      {tab === "Hacks" && <HacksPanel tier={tier} />}
      {tab === "Proxy" && (tier < PROXY_TIER
        ? <LockedPanel eyebrow="PROXY / UTILITIES" title="Proxy" requirement={`Reach ${TIER_NAMES[PROXY_TIER]} rank (level ${ranks[PROXY_TIER]?.min}) to open the proxy panel.`} />
        : <EmptyPanel eyebrow="PROXY / UTILITIES" title="Proxy" description="Proxy panel utilities." icon={Network} />)}
      {tab === "Other hacka stuff" && <OtherPanel />}
      {tab === "Contact owner" && (tier < CONTACT_TIER
        ? <LockedPanel eyebrow="DIRECT LINE" title="Contact owner" requirement={`Reach ${TIER_NAMES[CONTACT_TIER]} rank (level ${ranks[CONTACT_TIER]?.min}) to message the owner directly.`} />
        : <ContactPanel userId={profile.id} />)}
      {tab === "You" && <YouPanel profile={profile} draftName={draftName} setDraftName={setDraftName} saveProfile={saveProfile} saved={saved} rank={rank.name} level={level} theme={theme} setTheme={setTheme} cloak={cloak} setCloak={setCloakValue} signOut={signOut} />}
    </main>

    {run && activeQuest && <QuestOverlay
      title={activeQuest.title} xpReward={activeQuest.xp} run={run}
      confirmExit={confirmExit} askExit={() => setConfirmExit(true)} cancelExit={() => setConfirmExit(false)}
      exit={() => { setConfirmExit(false); setRun(null); }} claim={claimRun}
    />}

    {onboarding && <OnboardingOverlay theme={theme} finish={finishOnboarding} />}
    {levelUp && <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-4"><div className="flex items-center gap-3 rounded-lg border border-border bg-card px-5 py-3 shadow-xl"><Sparkles className="size-4 text-accent" /><span className="text-sm">Rank unlocked — <strong>{levelUp}</strong></span><Button size="sm" variant="ghost" onClick={() => setLevelUp(null)}><X /></Button></div></div>}
  </div>;
}

function QuestOverlay({ title, xpReward, run, confirmExit, askExit, cancelExit, exit, claim }: { title: string; xpReward: number; run: Run; confirmExit: boolean; askExit: () => void; cancelExit: () => void; exit: () => void; claim: () => void }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-background/90 p-5 backdrop-blur-md animate-in fade-in">
    <Button variant="ghost" size="icon" className="absolute left-4 top-4" onClick={askExit} aria-label="Exit quest"><X /></Button>
    <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 text-center">
      <p className="section-label">QUEST IN PROGRESS</p>
      <h2 className="mt-2 text-xl font-semibold">{title}</h2>
      {run.phase === "confirming" && <p className="mt-8 animate-pulse font-mono text-sm text-accent">waiting for hack confirmation…</p>}
      {run.phase === "counting" && <>
        <div className="mt-8 flex items-center justify-center gap-3 font-mono text-4xl"><Clock3 className="size-6 animate-pulse text-accent" />{formatTime(run.remaining)}</div>
        <p className="mt-3 text-sm text-muted-foreground">Hacking game network…</p>
      </>}
      {run.phase === "ready" && <>
        <p className="mt-8 text-sm text-muted-foreground">Sequence complete. Reward ready.</p>
        <Button className="mt-5" onClick={claim}>Claim reward (+{xpReward} XP) <Sparkles /></Button>
      </>}
    </div>
    {confirmExit && <div className="absolute inset-0 grid place-items-center bg-background/80 p-5">
      <div className="w-full max-w-sm rounded-lg border border-destructive/40 bg-card p-6">
        <h3 className="font-semibold">Exit this quest?</h3>
        <p className="mt-2 text-sm text-muted-foreground">The sequence will be cancelled and you will not earn the {xpReward} XP. You can start it again later.</p>
        <div className="mt-6 flex justify-end gap-2"><Button variant="ghost" onClick={cancelExit}>Stay</Button><Button variant="destructive" onClick={exit}>Exit quest</Button></div>
      </div>
    </div>}
  </div>;
}

function OnboardingOverlay({ theme, finish }: { theme: "dark" | "light"; finish: (persona: string, theme: "dark" | "light") => void }) {
  const [step, setStep] = useState(0);
  const [persona, setPersona] = useState("");
  const [pick, setPick] = useState<"dark" | "light">(theme);
  const personas = ["Student", "Teacher", "Just curious", "Something else"];
  return <div className="fixed inset-0 z-50 grid place-items-center bg-background/95 p-5 backdrop-blur-md animate-in fade-in">
    <div className="w-full max-w-lg rounded-lg border border-border bg-card p-8">
      <p className="section-label">FIRST-TIME SETUP</p>
      {step === 0 ? <>
        <h2 className="mt-2 text-2xl font-semibold">Who are you?</h2>
        <p className="mt-2 text-sm text-muted-foreground">This just personalises your console.</p>
        <div className="mt-6 grid gap-2">{personas.map((item) => <button key={item} onClick={() => setPersona(item)} className={`rounded-md border px-4 py-3 text-left text-sm transition-colors ${persona === item ? "border-primary bg-primary/10" : "border-border hover:bg-secondary"}`}>{item}</button>)}</div>
        <Button className="mt-6 w-full" disabled={!persona} onClick={() => setStep(1)}>Continue</Button>
      </> : <>
        <h2 className="mt-2 text-2xl font-semibold">Pick your look</h2>
        <p className="mt-2 text-sm text-muted-foreground">You can change this any time from the You page.</p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          {(["dark", "light"] as const).map((option) => <button key={option} onClick={() => setPick(option)} className={`flex items-center gap-3 rounded-md border px-4 py-4 text-sm capitalize transition-colors ${pick === option ? "border-primary bg-primary/10" : "border-border hover:bg-secondary"}`}>{option === "dark" ? <Moon className="size-4" /> : <Sun className="size-4" />}{option} mode</button>)}
        </div>
        <Button className="mt-6 w-full" onClick={() => finish(persona, pick)}>Enter scoolhackas</Button>
      </>}
    </div>
  </div>;
}

function HomePanel({ xp, level, levelXp, rank, tier, completed, run, startQuest, refreshQuests }: { xp:number; level:number; levelXp:number; rank:string; tier:number; completed:string[]; run:Run|null; startQuest:(id:string, seconds:number)=>void; refreshQuests:()=>void }) {
  return <div className="animate-in fade-in duration-500">
    <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="section-label">COMMAND CENTER</p><h1 className="page-title">Good evening, hacka.</h1><p className="page-copy">Keep moving. Every quest gets you closer to the next rank.</p></div><div className="rank-chip"><ShieldCheck className="size-4" />{rank}</div></div>
    <section className="mb-12 border-y border-border py-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end"><div><div className="mb-4 flex items-end justify-between"><div><span className="text-sm text-muted-foreground">Current level</span><div className="mt-1 font-display text-5xl font-semibold">{level.toString().padStart(2,"0")}</div></div><div className="text-right"><span className="font-mono text-sm text-foreground">{levelXp} / 500 XP</span><p className="mt-1 text-xs text-muted-foreground">to level {level + 1}</p></div></div><div className="h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${(levelXp / 500) * 100}%` }} /></div></div><div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border"><Stat label="TOTAL XP" value={xp.toLocaleString()} /><Stat label="QUESTS DONE" value={`${completed.length}/${quests.length}`} /></div></div>
    </section>
    <div className="mb-5 flex items-center justify-between gap-4"><div><p className="section-label">ACTIVE QUEUE</p><h2 className="mt-1 text-xl font-semibold">Rank quests</h2></div><div className="flex items-center gap-3"><p className="hidden text-xs text-muted-foreground sm:block">{quests.length - completed.length} remaining</p><Button variant="outline" size="sm" onClick={refreshQuests}><RotateCw /> Refresh</Button></div></div>
    <div className="divide-y divide-border border-y border-border">{quests.map((quest, index) => {
      const done = completed.includes(quest.id);
      const locked = quest.tier > tier;
      const active = run?.questId === quest.id;
      return <div key={quest.id} className={`grid gap-4 py-5 sm:grid-cols-[40px_1fr_auto] sm:items-center ${locked ? "opacity-60" : ""}`}>
        <div className={`grid size-10 place-items-center rounded-md border ${done ? "border-success/40 bg-success/10 text-success" : "border-border bg-secondary text-muted-foreground"}`}>{done ? <Check className="size-4" /> : locked ? <LockKeyhole className="size-4" /> : <span className="font-mono text-xs">0{index+1}</span>}</div>
        <div>
          <div className="mb-1 flex flex-wrap items-center gap-2"><h3 className="font-medium">{quest.title}</h3><span className="tier-label">{TIER_NAMES[quest.tier]}</span></div>
          <p className="text-sm text-muted-foreground">{done ? "Quest complete" : locked ? `Locked — reach ${TIER_NAMES[quest.tier]} rank (level ${ranks[quest.tier]?.min}) to attempt this.` : active ? "Running…" : `Earn ${quest.xp} XP`}</p>
        </div>
        {done ? <span className="font-mono text-xs text-success">+{quest.xp} XP</span>
          : locked ? <span className="flex items-center gap-2 text-xs text-muted-foreground"><LockKeyhole className="size-3" /> Locked</span>
          : <Button size="sm" variant="outline" disabled={!!run} onClick={()=>startQuest(quest.id, quest.seconds)}>Go <Play /></Button>}
      </div>;
    })}</div>
  </div>;
}

function HacksPanel({ tier }: { tier: number }) {
  return <section className="animate-in fade-in duration-500">
    <p className="section-label">HACKS / LIBRARY</p>
    <h1 className="page-title">Hacks</h1>
    <p className="page-copy">Submenus unlock as your rank climbs.</p>
    <div className="mt-10 space-y-10">
      {hackLibrary.map((group) => {
        const locked = group.tier > tier;
        return <div key={group.title}>
          <div className="mb-4 flex items-center gap-3"><h2 className="text-lg font-semibold">{group.title}</h2>{locked && <span className="tier-label flex items-center gap-1"><LockKeyhole className="size-3" /> locked</span>}</div>
          {locked ? <div className="grid min-h-28 place-items-center rounded-lg border border-dashed border-border bg-card/30 p-6 text-center text-sm text-muted-foreground">Reach {TIER_NAMES[group.tier]} rank (level {ranks[group.tier]?.min}) to unlock.</div>
            : group.hacks.length === 0 ? <div className="grid min-h-28 place-items-center rounded-lg border border-dashed border-border bg-card/30 p-6 text-center text-sm text-muted-foreground">No hacks unlocked for your current rank yet.</div>
            : <div className="grid gap-5 lg:grid-cols-2">{group.hacks.map((hack) => <HackCard key={hack.id} hack={hack} />)}</div>}
        </div>;
      })}
    </div>
  </section>;
}

function HackCard({ hack }: { hack: HackEntry }) {
  return <article className="rounded-lg border border-border bg-card p-6">
    <div className="flex items-start gap-4">
      {hack.image
        ? <img src={hack.image} alt="Pixelated arrow cursor icon" loading="lazy" width={816} height={816} className="size-12 shrink-0 rounded-md border border-border bg-white object-contain p-1" />
        : <span className="grid size-12 shrink-0 place-items-center rounded-md border border-border bg-secondary"><Pencil className="size-5 text-muted-foreground" /></span>}
      <div className="min-w-0">
        <h3 className="font-semibold">{hack.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{hack.description}</p>
      </div>
    </div>
    <div className="mt-5 border-t border-border pt-5">
      <p className="font-mono text-[10px] tracking-widest text-muted-foreground">INSTRUCTIONS</p>
      <ol className="mt-3 space-y-2 text-sm text-muted-foreground">{hack.steps.map((step, index) => <li key={step} className="flex gap-3"><span className="font-mono text-xs text-accent">{String(index + 1).padStart(2, "0")}</span><span>{step}</span></li>)}</ol>
      <a href={hack.url} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"><Link2 className="size-4" /> Open the source</a>
    </div>
  </article>;
}

function ContactPanel({ userId }: { userId: string }) {
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);
  const [history, setHistory] = useState<{ id: string; body: string; created_at: string }[]>([]);
  useEffect(() => {
    if (!userId) return;
    void (async () => {
      const { data } = await supabase.from("owner_messages").select("id,body,created_at").order("created_at", { ascending: false }).limit(20);
      if (data) setHistory(data);
    })();
  }, [userId]);
  const send = async () => {
    const text = body.trim();
    if (!text || !userId) return;
    const { data, error } = await supabase.from("owner_messages").insert({ user_id: userId, body: text }).select("id,body,created_at").single();
    if (!error && data) { setHistory((items) => [data, ...items]); setBody(""); setSent(true); window.setTimeout(() => setSent(false), 2000); }
  };
  return <section className="animate-in fade-in duration-500">
    <p className="section-label">DIRECT LINE</p>
    <h1 className="page-title">Contact owner</h1>
    <p className="page-copy">Top-rank privilege. Messages go straight to the owner.</p>
    <div className="mt-10 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
      <div className="rounded-lg border border-border bg-card p-6">
        <label className="text-xs font-medium text-muted-foreground" htmlFor="owner-message">YOUR MESSAGE</label>
        <textarea id="owner-message" value={body} onChange={(e) => setBody(e.target.value)} rows={7} maxLength={1200} placeholder="Ask for a hack, report a bug, or say hi." className="mt-2 w-full resize-none rounded-md border border-input bg-background p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
        <div className="mt-4 flex items-center justify-between"><span className="font-mono text-xs text-muted-foreground">{body.length}/1200</span><Button onClick={send} disabled={!body.trim()}>{sent ? <Check /> : <Send />} {sent ? "Sent" : "Send message"}</Button></div>
      </div>
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="font-semibold">Sent messages</h2>
        {history.length === 0 ? <div className="mt-6 grid min-h-32 place-items-center rounded-md border border-dashed border-border"><p className="text-sm text-muted-foreground">No messages yet</p></div>
          : <ul className="mt-5 divide-y divide-border">{history.map((item) => <li key={item.id} className="py-4"><p className="text-sm">{item.body}</p><p className="mt-1 font-mono text-[10px] text-muted-foreground">{new Date(item.created_at).toLocaleString()}</p></li>)}</ul>}
      </div>
    </div>
  </section>;
}

function Stat({label,value}:{label:string;value:string}) { return <div className="min-w-32 bg-card px-5 py-4"><p className="font-mono text-[10px] text-muted-foreground">{label}</p><p className="mt-1 text-xl font-semibold">{value}</p></div>; }
function EmptyPanel({eyebrow,title,description,icon:Icon}:{eyebrow:string;title:string;description:string;icon:typeof Code2}) { return <section className="animate-in fade-in duration-500"><p className="section-label">{eyebrow}</p><h1 className="page-title">{title}</h1><div className="mt-10 grid min-h-96 place-items-center rounded-lg border border-dashed border-border bg-card/30 p-8 text-center"><div><span className="mx-auto mb-5 grid size-12 place-items-center rounded-md border border-border bg-secondary"><Icon className="size-5 text-muted-foreground" /></span><p className="text-sm text-muted-foreground">{description}</p></div></div></section>; }
function LockedPanel({eyebrow,title,requirement}:{eyebrow:string;title:string;requirement:string}) { return <section className="animate-in fade-in duration-500"><p className="section-label">{eyebrow}</p><h1 className="page-title">{title}</h1><div className="mt-10 grid min-h-96 place-items-center rounded-lg border border-dashed border-border bg-card/30 p-8 text-center"><div><span className="mx-auto mb-5 grid size-12 place-items-center rounded-md border border-border bg-secondary"><LockKeyhole className="size-5 text-muted-foreground" /></span><p className="text-sm text-muted-foreground">{requirement}</p></div></div></section>; }
function OtherPanel() { return <section className="animate-in fade-in duration-500"><p className="section-label">OTHER / WORKSPACE</p><h1 className="page-title">Other hacka stuff</h1><div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">{[1,2,3,4,5,6].map((item)=><div key={item} className="aspect-[1.5] rounded-lg border border-dashed border-border bg-card/30" />)}</div></section>; }
function YouPanel({profile,draftName,setDraftName,saveProfile,saved,rank,level,theme,setTheme,cloak,setCloak,signOut}:{profile:{display_name:string;created_at:string;persona:string};draftName:string;setDraftName:(v:string)=>void;saveProfile:()=>void;saved:boolean;rank:string;level:number;theme:"dark"|"light";setTheme:(v:"dark"|"light")=>void;cloak:boolean;setCloak:(v:boolean)=>void;signOut:()=>void}) { const joined=profile.created_at ? new Intl.DateTimeFormat("en",{month:"long",year:"numeric"}).format(new Date(profile.created_at)) : "Loading…"; return <section className="animate-in fade-in duration-500"><div className="mb-10 flex items-end justify-between"><div><p className="section-label">PERSONAL DASHBOARD</p><h1 className="page-title">You</h1></div><Button variant="ghost" size="sm" onClick={signOut}><LogOut /> Sign out</Button></div><div className="grid gap-5 lg:grid-cols-2"><div className="rounded-lg border border-border bg-card p-6"><div className="mb-8 flex items-center gap-4"><span className="grid size-12 place-items-center rounded-md bg-primary text-primary-foreground"><CircleUserRound /></span><div><h2 className="font-semibold">{profile.display_name || "hacka"}</h2><p className="text-sm text-muted-foreground">Joined {joined}{profile.persona ? ` · ${profile.persona}` : ""}</p></div></div><label className="text-xs font-medium text-muted-foreground">DISPLAY NAME</label><div className="mt-2 flex gap-2"><Input value={draftName} onChange={(e)=>setDraftName(e.target.value)} maxLength={40}/><Button onClick={saveProfile}>{saved ? <Check /> : "Save"}</Button></div><div className="mt-6 flex items-center justify-between border-t border-border pt-5"><div><p className="text-sm font-medium">{rank}</p><p className="text-xs text-muted-foreground">Current rank · level {level}</p></div><Award className="text-accent" /></div></div><div className="rounded-lg border border-border bg-card p-6"><h2 className="font-semibold">Preferences</h2><div className="mt-6 divide-y divide-border"><Preference icon={theme === "dark" ? Moon : Sun} title="Appearance" description={`${theme === "dark" ? "Dark" : "Light"} mode`} control={<Switch checked={theme==="light"} onCheckedChange={(v)=>setTheme(v?"light":"dark")} />} /><Preference icon={ShieldCheck} title="Enable Google Cloak" description="Disguise this browser tab" control={<Switch checked={cloak} onCheckedChange={setCloak} />} /></div></div><div className="rounded-lg border border-border bg-card p-6 lg:col-span-2"><div className="flex items-center justify-between"><div><h2 className="font-semibold">My Bookmarked Hacks</h2><p className="mt-1 text-sm text-muted-foreground">Your saved collection will appear here.</p></div><Bookmark className="text-muted-foreground" /></div><div className="mt-6 grid min-h-32 place-items-center rounded-md border border-dashed border-border"><p className="text-sm text-muted-foreground">No bookmarks yet</p></div></div></div></section>; }
function Preference({icon:Icon,title,description,control}:{icon:typeof Moon;title:string;description:string;control:React.ReactNode}) { return <div className="flex items-center gap-3 py-5 first:pt-0 last:pb-0"><Icon className="size-4 text-muted-foreground"/><div className="flex-1"><p className="text-sm font-medium">{title}</p><p className="text-xs text-muted-foreground">{description}</p></div>{control}</div>; }
