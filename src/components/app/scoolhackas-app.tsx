import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Award, Bookmark, Braces, Check, ChevronRight, CircleUserRound, Clock3, Code2, House, LockKeyhole, LogOut, Moon, Network, Orbit, Play, ShieldCheck, Sparkles, Sun, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";

const ranks = [
  { name: "Beginner hacka", min: 1, max: 5 }, { name: "Intermediate hacka", min: 6, max: 12 },
  { name: "Pro hacka", min: 13, max: 20 }, { name: "Alpha hacka", min: 21, max: 30 },
  { name: "Omega hacka", min: 31, max: 45 }, { name: "The Hacka", min: 46, max: Infinity },
] as const;
const quests = [
  { id: "bookmarklet", tier: "Beginner", title: "Create your first hack bookmarklet", xp: 100, seconds: 0 },
  { id: "cloak", tier: "Intermediate", title: "Deploy your first cloak panel", xp: 180, seconds: 45 },
  { id: "blooket", tier: "Pro", title: "Hack your first Blooket game", xp: 300, seconds: 120 },
  { id: "handshake", tier: "Alpha", title: "Initialize a proxy handshake", xp: 420, seconds: 75 },
  { id: "omega", tier: "Omega", title: "Complete an omega systems check", xp: 600, seconds: 90 },
] as const;
type Tab = "Home" | "Hacks" | "Proxy" | "Other hacka stuff" | "You";
type Timers = Record<string, number>;
const nav: { label: Tab; icon: typeof House }[] = [
  { label: "Home", icon: House }, { label: "Hacks", icon: Code2 }, { label: "Proxy", icon: Network },
  { label: "Other hacka stuff", icon: Orbit }, { label: "You", icon: UserRound },
];

function levelForXp(xp: number) { return Math.floor(xp / 500) + 1; }
function rankForLevel(level: number) { return ranks.find((rank) => level >= rank.min && level <= rank.max) ?? ranks[5]; }
function formatTime(total: number) { return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`; }

export function ScoolhackasApp() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("Home");
  const [xp, setXp] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);
  const [timers, setTimers] = useState<Timers>({});
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [cloak, setCloak] = useState(false);
  const [profile, setProfile] = useState({ id: "", display_name: "", created_at: "" });
  const [draftName, setDraftName] = useState("");
  const [saved, setSaved] = useState(false);
  const level = levelForXp(xp);
  const rank = rankForLevel(level);
  const levelXp = xp % 500;

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("scoolhackas-progress") ?? "null") as { xp?: number; completed?: string[] } | null;
    if (stored) { setXp(stored.xp ?? 0); setCompleted(stored.completed ?? []); }
    const storedTheme = localStorage.getItem("scoolhackas-theme") === "light" ? "light" : "dark";
    setTheme(storedTheme); document.documentElement.classList.toggle("dark", storedTheme === "dark");
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("id,display_name,created_at,google_cloak_enabled").eq("id", user.id).maybeSingle();
      if (data) { setProfile(data); setDraftName(data.display_name); setCloak(data.google_cloak_enabled); }
      else {
        const displayName = String(user.user_metadata?.["display_name"] ?? user.user_metadata?.["full_name"] ?? user.email?.split("@")[0] ?? "hacka");
        const { data: created } = await supabase.from("profiles").insert({ id: user.id, display_name: displayName }).select("id,display_name,created_at,google_cloak_enabled").single();
        if (created) { setProfile(created); setDraftName(created.display_name); }
      }
    })();
  }, []);

  useEffect(() => { localStorage.setItem("scoolhackas-progress", JSON.stringify({ xp, completed })); }, [xp, completed]);
  useEffect(() => {
    const interval = window.setInterval(() => setTimers((current) => Object.fromEntries(Object.entries(current).map(([key, value]) => [key, Math.max(0, value - 1)]))), 1000);
    return () => window.clearInterval(interval);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("scoolhackas-theme", theme);
  }, [theme]);
  useEffect(() => {
    document.title = cloak ? "Google" : "scoolhackas";
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (link) link.href = cloak ? "https://www.google.com/favicon.ico" : "/favicon.svg";
  }, [cloak]);

  const grant = useCallback((id: string, amount: number) => {
    if (completed.includes(id)) return;
    setCompleted((items) => [...items, id]); setXp((value) => value + amount);
  }, [completed]);
  const startQuest = (id: string, seconds: number) => {
    if (seconds === 0) { setTab("Home"); grant(id, 100); return; }
    if (id === "blooket") window.open("about:blank", "_blank", "noopener,noreferrer");
    setTimers((value) => ({ ...value, [id]: seconds }));
  };
  const saveProfile = async () => {
    if (!profile.id) return;
    const { error } = await supabase.from("profiles").update({ display_name: draftName.trim() }).eq("id", profile.id);
    if (!error) { setProfile((value) => ({ ...value, display_name: draftName.trim() })); setSaved(true); window.setTimeout(() => setSaved(false), 1800); }
  };
  const setCloakValue = async (checked: boolean) => {
    setCloak(checked);
    if (profile.id) await supabase.from("profiles").update({ google_cloak_enabled: checked }).eq("id", profile.id);
  };
  const signOut = async () => { await supabase.auth.signOut(); await navigate({ to: "/auth", replace: true }); };

  return <div className="min-h-screen bg-background text-foreground">
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-5 px-4 sm:px-6">
        <div className="flex shrink-0 items-center gap-2.5 font-display text-base font-semibold"><span className="grid size-8 place-items-center rounded-md border border-border bg-secondary"><Braces className="size-4" /></span>scoolhackas</div>
        <nav className="scrollbar-none flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
          {nav.map((item) => <Button key={item.label} variant={tab === item.label ? "secondary" : "ghost"} size="sm" onClick={() => setTab(item.label)} className="shrink-0"><item.icon /> <span className="hidden md:inline">{item.label}</span></Button>)}
        </nav>
        <div className="hidden items-center gap-2 border-l border-border pl-5 sm:flex"><span className="size-2 rounded-full bg-success shadow-[0_0_12px_var(--success)]" /><span className="text-xs text-muted-foreground">level {level}</span></div>
      </div>
    </header>

    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      {tab === "Home" && <HomePanel xp={xp} level={level} levelXp={levelXp} rank={rank.name} completed={completed} timers={timers} startQuest={startQuest} grant={grant} />}
      {tab === "Hacks" && <EmptyPanel eyebrow="HACKS / LIBRARY" title="Hacks" description="No hacks unlocked for your current rank yet." icon={Code2} />}
      {tab === "Proxy" && <EmptyPanel eyebrow="PROXY / UTILITIES" title="Proxy" description="Proxy panel utilities." icon={Network} />}
      {tab === "Other hacka stuff" && <OtherPanel />}
      {tab === "You" && <YouPanel profile={profile} draftName={draftName} setDraftName={setDraftName} saveProfile={saveProfile} saved={saved} rank={rank.name} level={level} theme={theme} setTheme={setTheme} cloak={cloak} setCloak={setCloakValue} signOut={signOut} />}
    </main>
  </div>;
}

function HomePanel({ xp, level, levelXp, rank, completed, timers, startQuest, grant }: { xp:number; level:number; levelXp:number; rank:string; completed:string[]; timers:Timers; startQuest:(id:string, seconds:number)=>void; grant:(id:string,xp:number)=>void }) {
  return <div className="animate-in fade-in duration-500">
    <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="section-label">COMMAND CENTER</p><h1 className="page-title">Good evening, hacka.</h1><p className="page-copy">Keep moving. Every quest gets you closer to the next rank.</p></div><div className="rank-chip"><ShieldCheck className="size-4" />{rank}</div></div>
    <section className="mb-12 border-y border-border py-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end"><div><div className="mb-4 flex items-end justify-between"><div><span className="text-sm text-muted-foreground">Current level</span><div className="mt-1 font-display text-5xl font-semibold">{level.toString().padStart(2,"0")}</div></div><div className="text-right"><span className="font-mono text-sm text-foreground">{levelXp} / 500 XP</span><p className="mt-1 text-xs text-muted-foreground">to level {level + 1}</p></div></div><div className="h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${(levelXp / 500) * 100}%` }} /></div></div><div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border"><Stat label="TOTAL XP" value={xp.toLocaleString()} /><Stat label="QUESTS DONE" value={`${completed.length}/${quests.length}`} /></div></div>
    </section>
    <div className="mb-5 flex items-center justify-between"><div><p className="section-label">ACTIVE QUEUE</p><h2 className="mt-1 text-xl font-semibold">Rank quests</h2></div><p className="text-xs text-muted-foreground">{quests.length - completed.length} remaining</p></div>
    <div className="divide-y divide-border border-y border-border">{quests.map((quest, index) => { const remaining=timers[quest.id] ?? -1; const done=completed.includes(quest.id); const running=remaining > 0; const ready=remaining === 0; return <div key={quest.id} className="grid gap-4 py-5 sm:grid-cols-[40px_1fr_auto] sm:items-center"><div className={`grid size-10 place-items-center rounded-md border ${done ? "border-success/40 bg-success/10 text-success" : "border-border bg-secondary text-muted-foreground"}`}>{done ? <Check className="size-4" /> : <span className="font-mono text-xs">0{index+1}</span>}</div><div><div className="mb-1 flex flex-wrap items-center gap-2"><h3 className="font-medium">{quest.title}</h3><span className="tier-label">{quest.tier}</span></div><p className="text-sm text-muted-foreground">{done ? "Quest complete" : running ? "Hacking game network..." : ready ? "Sequence complete. Reward ready." : `Earn ${quest.xp} XP`}</p></div>{done ? <span className="font-mono text-xs text-success">+{quest.xp} XP</span> : running ? <div className="flex min-w-28 items-center justify-end gap-2 font-mono text-sm"><Clock3 className="size-4 animate-pulse text-accent" />{formatTime(remaining)}</div> : ready ? <Button size="sm" onClick={()=>grant(quest.id,quest.xp)}>Claim reward <Sparkles /></Button> : <Button size="sm" variant="outline" onClick={()=>startQuest(quest.id,quest.seconds)}>Go <Play /></Button>}</div>})}</div>
  </div>;
}
function Stat({label,value}:{label:string;value:string}) { return <div className="min-w-32 bg-card px-5 py-4"><p className="font-mono text-[10px] text-muted-foreground">{label}</p><p className="mt-1 text-xl font-semibold">{value}</p></div>; }
function EmptyPanel({eyebrow,title,description,icon:Icon}:{eyebrow:string;title:string;description:string;icon:typeof Code2}) { return <section className="animate-in fade-in duration-500"><p className="section-label">{eyebrow}</p><h1 className="page-title">{title}</h1><div className="mt-10 grid min-h-96 place-items-center rounded-lg border border-dashed border-border bg-card/30 p-8 text-center"><div><span className="mx-auto mb-5 grid size-12 place-items-center rounded-md border border-border bg-secondary"><Icon className="size-5 text-muted-foreground" /></span><p className="text-sm text-muted-foreground">{description}</p></div></div></section>; }
function OtherPanel() { return <section className="animate-in fade-in duration-500"><p className="section-label">OTHER / WORKSPACE</p><h1 className="page-title">Other hacka stuff</h1><div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">{[1,2,3,4,5,6].map((item)=><div key={item} className="aspect-[1.5] rounded-lg border border-dashed border-border bg-card/30" />)}</div></section>; }
function YouPanel({profile,draftName,setDraftName,saveProfile,saved,rank,level,theme,setTheme,cloak,setCloak,signOut}:{profile:{display_name:string;created_at:string};draftName:string;setDraftName:(v:string)=>void;saveProfile:()=>void;saved:boolean;rank:string;level:number;theme:"dark"|"light";setTheme:(v:"dark"|"light")=>void;cloak:boolean;setCloak:(v:boolean)=>void;signOut:()=>void}) { const joined=profile.created_at ? new Intl.DateTimeFormat("en",{month:"long",year:"numeric"}).format(new Date(profile.created_at)) : "Loading…"; return <section className="animate-in fade-in duration-500"><div className="mb-10 flex items-end justify-between"><div><p className="section-label">PERSONAL DASHBOARD</p><h1 className="page-title">You</h1></div><Button variant="ghost" size="sm" onClick={signOut}><LogOut /> Sign out</Button></div><div className="grid gap-5 lg:grid-cols-2"><div className="rounded-lg border border-border bg-card p-6"><div className="mb-8 flex items-center gap-4"><span className="grid size-12 place-items-center rounded-md bg-primary text-primary-foreground"><CircleUserRound /></span><div><h2 className="font-semibold">{profile.display_name || "hacka"}</h2><p className="text-sm text-muted-foreground">Joined {joined}</p></div></div><label className="text-xs font-medium text-muted-foreground">DISPLAY NAME</label><div className="mt-2 flex gap-2"><Input value={draftName} onChange={(e)=>setDraftName(e.target.value)} maxLength={40}/><Button onClick={saveProfile}>{saved ? <Check /> : "Save"}</Button></div><div className="mt-6 flex items-center justify-between border-t border-border pt-5"><div><p className="text-sm font-medium">{rank}</p><p className="text-xs text-muted-foreground">Current rank · level {level}</p></div><Award className="text-accent" /></div></div><div className="rounded-lg border border-border bg-card p-6"><h2 className="font-semibold">Preferences</h2><div className="mt-6 divide-y divide-border"><Preference icon={theme === "dark" ? Moon : Sun} title="Appearance" description={`${theme === "dark" ? "Dark" : "Light"} mode`} control={<Switch checked={theme==="light"} onCheckedChange={(v)=>setTheme(v?"light":"dark")} />} /><Preference icon={ShieldCheck} title="Enable Google Cloak" description="Disguise this browser tab" control={<Switch checked={cloak} onCheckedChange={setCloak} />} /></div></div><div className="rounded-lg border border-border bg-card p-6 lg:col-span-2"><div className="flex items-center justify-between"><div><h2 className="font-semibold">My Bookmarked Hacks</h2><p className="mt-1 text-sm text-muted-foreground">Your saved collection will appear here.</p></div><Bookmark className="text-muted-foreground" /></div><div className="mt-6 grid min-h-32 place-items-center rounded-md border border-dashed border-border"><p className="text-sm text-muted-foreground">No bookmarks yet</p></div></div></div></section>; }
function Preference({icon:Icon,title,description,control}:{icon:typeof Moon;title:string;description:string;control:React.ReactNode}) { return <div className="flex items-center gap-3 py-5 first:pt-0 last:pb-0"><Icon className="size-4 text-muted-foreground"/><div className="flex-1"><p className="text-sm font-medium">{title}</p><p className="text-xs text-muted-foreground">{description}</p></div>{control}</div>; }
