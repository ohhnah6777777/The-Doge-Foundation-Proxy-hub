import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Bookmark, Check, ChevronDown, ChevronUp, CircleUserRound, Clock3, Code2, Copy,
  ExternalLink, Flame, Gamepad2, House, Link2, LogOut, Mail, Moon, Network,
  Orbit, Pencil, Play, RotateCw, Search, Send, ShieldCheck, Sparkles, Sun,
  TrendingUp, UserRound, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { bubbleLetters, calculator, drawOnScreen, historyFlooder, rainbowPage } from "@/lib/hack-scripts";
import { proxyLibrary, quickLinks, type ProxyEntry } from "@/lib/proxy-data";
import dogeMark from "@/assets/doge-foundation-mark.png";
import autoclickerIcon from "@/assets/hack-autoclicker.png";
import historyIcon from "@/assets/hack-history-water.png";

type Tab = "Home" | "Hacks" | "Proxy" | "More" | "Contact" | "You";
type Quest = { id: string; title: string; detail: string; seconds: number; urls: string[]; category: string };
type QuestRun = { questId: string; phase: "confirming" | "counting" | "ready"; remaining: number; url: string };
type HackEntry = { id: string; name: string; description: string; url?: string; code?: string; image?: string; steps: string[] };

const nav: { label: Tab; icon: typeof House }[] = [
  { label: "Home", icon: House }, { label: "Hacks", icon: Code2 }, { label: "Proxy", icon: Network },
  { label: "More", icon: Orbit }, { label: "Contact", icon: Mail }, { label: "You", icon: UserRound },
];

const quests: Quest[] = [
  { id: "bookmarklet", title: "Create your first bookmarklet", detail: "Save a script to your bookmarks bar and run it once.", seconds: 20, category: "bookmarklet", urls: ["https://github.com/sparemind/AutoClickerBookmarklet", "https://github.com/TacocatDev01/Edit-Page-Bookmarklet"] },
  { id: "three-bookmarklets", title: "Build a three-script toolkit", detail: "Add three useful scripts to a dedicated bookmarks folder.", seconds: 35, category: "bookmarklet", urls: ["https://github.com/sparemind/AutoClickerBookmarklet", "https://github.com/TacocatDev01/Edit-Page-Bookmarklet"] },
  { id: "blooket", title: "Launch a Blooket session", detail: "Open Blooket, join a game, and prepare your toolkit.", seconds: 90, category: "game", urls: ["https://www.blooket.com/", "https://dashboard.blooket.com/"] },
  { id: "blooket-round", title: "Finish a Blooket round", detail: "Join a live or solo game and finish one complete round.", seconds: 120, category: "game", urls: ["https://www.blooket.com/"] },
  { id: "kahoot", title: "Join a Kahoot game", detail: "Open the game lobby and complete a test session.", seconds: 90, category: "game", urls: ["https://kahoot.it/"] },
  { id: "space", title: "Test the Space proxy", detail: "Open Space and confirm that one destination loads.", seconds: 45, category: "proxy", urls: ["https://home.kasihinfo.com/", "https://try.deepee.com/"] },
  { id: "selenite", title: "Explore Selenite", detail: "Open the Selenite hub and try one game or utility.", seconds: 45, category: "proxy", urls: ["https://selenite-6668.logans.projectbyod.com/", "https://selenite-2024.logan.learningatschool.website/"] },
  { id: "dogeub", title: "Try DOGEUB", detail: "Compare the classic v4 build with a newer v5 mirror.", seconds: 50, category: "proxy", urls: ["https://dogefrokbro.vercel.app/", "https://api-www.studycare.help/"] },
  { id: "proxy-compare", title: "Compare two proxy routes", detail: "Open two directory entries and compare their loading speed.", seconds: 60, category: "proxy", urls: ["https://cdn.mathermatters.org/", "https://clearastronomynotes.laravel.mx/"] },
  { id: "history", title: "Install the history flooder", detail: "Copy the script, save it as a bookmark, and test it safely.", seconds: 35, category: "script", urls: ["https://www.google.com/"] },
  { id: "rainbow", title: "Turn a page rainbow", detail: "Copy the rainbow script from Hacks and toggle it twice.", seconds: 25, category: "script", urls: ["https://www.google.com/"] },
  { id: "draw", title: "Draw on a live page", detail: "Load the drawing script and test its pen controls.", seconds: 35, category: "script", urls: ["https://www.google.com/"] },
  { id: "calculator", title: "Run the pop-up calculator", detail: "Solve one expression with the bookmarklet calculator.", seconds: 20, category: "script", urls: ["https://www.google.com/"] },
  { id: "cloak", title: "Test Google Cloak", detail: "Enable the tab disguise in You, then turn it off again.", seconds: 20, category: "utility", urls: ["https://www.google.com/"] },
  { id: "directory", title: "Find your fastest mirror", detail: "Browse the proxy directory and save the most reliable route.", seconds: 45, category: "utility", urls: ["https://vng.lol/", "https://frogiesarcade.xyz/"] },
];

const hacks: HackEntry[] = [
  { id: "autoclicker", name: "Auto clicker bookmarklet", description: "Repeatedly clicks wherever you point—useful for idle games and repetitive actions.", url: "https://github.com/sparemind/AutoClickerBookmarklet", image: autoclickerIcon, steps: ["Open the source link and copy the bookmarklet code.", "Show your browser bookmarks bar.", "Create a new bookmark named auto clicker.", "Paste the code into its URL field.", "Open a page and select the bookmark to start.", "Select it again to stop."] },
  { id: "edit-page", name: "Edit page bookmarklet", description: "Makes visible page text editable until the page is refreshed.", url: "https://github.com/TacocatDev01/Edit-Page-Bookmarklet", steps: ["Open the source link and copy the code.", "Create a new browser bookmark.", "Name it edit page.", "Paste the code into the URL field.", "Open any page and select the bookmark.", "Refresh to undo your local edits."] },
  { id: "history", name: "History flooder", description: "Adds copies of the current page to browser history so the back button has more entries.", code: historyFlooder, image: historyIcon, steps: ["Copy the script.", "Create a new bookmark.", "Paste the script into its URL field.", "Open the page you want to use.", "Select the bookmark.", "Enter the number of history entries."] },
  { id: "bubble", name: "Bubble letter font", description: "Converts page text into circled bubble characters as new text appears.", code: bubbleLetters, steps: ["Copy the script.", "Create a bookmark named bubble letters.", "Paste the script into its URL field.", "Open a text-heavy page.", "Select the bookmark.", "Refresh to restore the page."] },
  { id: "draw", name: "Draw on your screen", description: "Turns the cursor into a configurable paintbrush over any page.", code: drawOnScreen, steps: ["Copy the script.", "Save it as a bookmark.", "Open a page and select it.", "Press d to draw and u to lift the pen.", "Use c, s, and o for color, size, and opacity.", "Refresh to clear the drawing."] },
  { id: "rainbow", name: "Rainbow page", description: "Cycles the entire page through the color spectrum and toggles off on a second run.", code: rainbowPage, steps: ["Copy the script.", "Create a bookmark named rainbow.", "Paste it into the URL field.", "Open any page.", "Select the bookmark to start.", "Select it again to stop."] },
  { id: "calculator", name: "Pop-up calculator", description: "A prompt-based calculator for arithmetic and common equations.", code: calculator, steps: ["Copy the script.", "Create a bookmark named calculator.", "Paste it into the URL field.", "Select the bookmark.", "Choose a calculator mode.", "Enter the requested values."] },
  { id: "blooket-launcher", name: "Blooket game launcher", description: "Direct access to Blooket’s play and dashboard screens for game quests.", url: "https://www.blooket.com/", steps: ["Open Blooket.", "Sign in or join with a game code.", "Choose a game mode.", "Keep this library open in another tab.", "Use only scripts you understand.", "Return here when finished."] },
];

const RESET_LIMIT = 5;
const RESET_WINDOW_MS = 6 * 60 * 60 * 1000;
const STORAGE_PREFIX = "doge-foundation";

function formatTime(total: number) {
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function pickQuests(seed: number) {
  return [...quests]
    .map((quest, index) => ({ quest, score: Math.sin((index + 1) * 9301 + seed * 49297) }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 6)
    .map(({ quest }) => quest);
}

export function ScoolhackasApp() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("Home");
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [cloak, setCloak] = useState(false);
  const [profile, setProfile] = useState({ id: "", display_name: "", created_at: "", persona: "" });
  const [draftName, setDraftName] = useState("");
  const [saved, setSaved] = useState(false);
  const [onboarding, setOnboarding] = useState(false);
  const [completed, setCompleted] = useState<string[]>([]);
  const [run, setRun] = useState<QuestRun | null>(null);
  const [confirmExit, setConfirmExit] = useState(false);
  const [questSeed, setQuestSeed] = useState(1);
  const [resets, setResets] = useState({ used: 0, since: Date.now() });
  const visibleQuests = useMemo(() => pickQuests(questSeed), [questSeed]);

  useEffect(() => {
    const storedTheme = localStorage.getItem(`${STORAGE_PREFIX}-theme`) === "dark" ? "dark" : "light";
    setTheme(storedTheme);
    document.documentElement.classList.toggle("dark", storedTheme === "dark");
    try {
      const progress = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}-quests`) ?? "null") as { completed?: string[]; seed?: number } | null;
      if (progress) { setCompleted(progress.completed ?? []); setQuestSeed(progress.seed ?? 1); }
      const resetData = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}-resets`) ?? "null") as { used?: number; since?: number } | null;
      if (resetData?.since && Date.now() - resetData.since < RESET_WINDOW_MS) setResets({ used: resetData.used ?? 0, since: resetData.since });
    } catch { /* ignore invalid local data */ }
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("id,display_name,created_at,google_cloak_enabled,persona,onboarded").eq("id", user.id).maybeSingle();
      if (data) {
        setProfile({ id: data.id, display_name: data.display_name, created_at: data.created_at, persona: data.persona });
        setDraftName(data.display_name); setCloak(data.google_cloak_enabled); setOnboarding(!data.onboarded);
      } else {
        const displayName = String(user.user_metadata?.["display_name"] ?? user.user_metadata?.["full_name"] ?? user.email?.split("@")[0] ?? "member");
        const { data: created } = await supabase.from("profiles").insert({ id: user.id, display_name: displayName }).select("id,display_name,created_at,persona").single();
        if (created) { setProfile({ id: created.id, display_name: created.display_name, created_at: created.created_at, persona: created.persona }); setDraftName(created.display_name); setOnboarding(true); }
      }
    })();
  }, []);

  useEffect(() => { localStorage.setItem(`${STORAGE_PREFIX}-quests`, JSON.stringify({ completed, seed: questSeed })); }, [completed, questSeed]);
  useEffect(() => { localStorage.setItem(`${STORAGE_PREFIX}-resets`, JSON.stringify(resets)); }, [resets]);
  useEffect(() => { document.documentElement.classList.toggle("dark", theme === "dark"); localStorage.setItem(`${STORAGE_PREFIX}-theme`, theme); }, [theme]);
  useEffect(() => {
    document.title = cloak ? "Google" : "The Doge Foundation";
    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (favicon) favicon.href = cloak ? "https://www.google.com/favicon.ico" : "/favicon.png";
  }, [cloak]);
  useEffect(() => {
    if (!run || run.phase === "ready") return;
    if (run.phase === "confirming") {
      const id = window.setTimeout(() => setRun((value) => value ? { ...value, phase: "counting" } : value), 2200);
      return () => window.clearTimeout(id);
    }
    const id = window.setInterval(() => setRun((value) => {
      if (!value || value.phase !== "counting") return value;
      return value.remaining <= 1 ? { ...value, remaining: 0, phase: "ready" } : { ...value, remaining: value.remaining - 1 };
    }), 1000);
    return () => window.clearInterval(id);
  }, [run?.phase, run?.questId]);

  const startQuest = (quest: Quest) => {
    if (completed.includes(quest.id)) return;
    const url = quest.urls[Math.floor(Math.random() * quest.urls.length)] ?? quest.urls[0];
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
    setRun({ questId: quest.id, phase: "confirming", remaining: quest.seconds, url });
  };
  const claimQuest = () => {
    if (!run) return;
    setCompleted((items) => items.includes(run.questId) ? items : [...items, run.questId]);
    setRun(null);
  };
  const freshResetWindow = Date.now() - resets.since >= RESET_WINDOW_MS;
  const resetsLeft = freshResetWindow ? RESET_LIMIT : Math.max(0, RESET_LIMIT - resets.used);
  const refreshQuests = () => {
    const used = freshResetWindow ? 0 : resets.used;
    if (used >= RESET_LIMIT) return;
    setResets({ used: used + 1, since: freshResetWindow ? Date.now() : resets.since });
    setQuestSeed((value) => value + 1 + Math.floor(Math.random() * 97));
    setRun(null);
  };
  const saveProfile = async () => {
    const name = draftName.trim();
    if (!profile.id || !name) return;
    const { error } = await supabase.from("profiles").update({ display_name: name }).eq("id", profile.id);
    if (!error) { setProfile((value) => ({ ...value, display_name: name })); setSaved(true); window.setTimeout(() => setSaved(false), 1800); }
  };
  const setCloakValue = async (checked: boolean) => { setCloak(checked); if (profile.id) await supabase.from("profiles").update({ google_cloak_enabled: checked }).eq("id", profile.id); };
  const finishOnboarding = async (persona: string, chosenTheme: "dark" | "light") => {
    setTheme(chosenTheme); setProfile((value) => ({ ...value, persona })); setOnboarding(false);
    if (profile.id) await supabase.from("profiles").update({ persona, onboarded: true }).eq("id", profile.id);
  };
  const signOut = async () => { await supabase.auth.signOut(); await navigate({ to: "/auth", replace: true }); };
  const activeQuest = quests.find((quest) => quest.id === run?.questId) ?? null;

  return <div className="min-h-screen bg-background text-foreground">
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center gap-4 px-4 py-2 sm:px-6">
        <div className="flex shrink-0 items-center gap-2.5 font-display text-sm font-semibold sm:text-base">
          <span className="grid size-10 place-items-center overflow-hidden rounded-md border border-border bg-secondary"><img src={dogeMark} alt="Doge" className="h-full w-full object-contain" /></span>
          <span className="hidden sm:inline">The Doge Foundation</span>
        </div>
        <nav className="scrollbar-none flex min-w-0 flex-1 items-center justify-end gap-1 overflow-x-auto">
          {nav.map((item) => <Button key={item.label} variant={tab === item.label ? "secondary" : "ghost"} size="sm" onClick={() => setTab(item.label)} className="shrink-0"><item.icon /><span className="hidden lg:inline">{item.label}</span></Button>)}
        </nav>
      </div>
    </header>
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      {tab === "Home" && <HomePanel name={profile.display_name} quests={visibleQuests} completed={completed} run={run} startQuest={startQuest} refresh={refreshQuests} resetsLeft={resetsLeft} openHacks={() => setTab("Hacks")} openProxies={() => setTab("Proxy")} />}
      {tab === "Hacks" && <HacksPanel />}
      {tab === "Proxy" && <ProxyPanel />}
      {tab === "More" && <MorePanel />}
      {tab === "Contact" && <ContactPanel userId={profile.id} />}
      {tab === "You" && <YouPanel profile={profile} draftName={draftName} setDraftName={setDraftName} saveProfile={saveProfile} saved={saved} theme={theme} setTheme={setTheme} cloak={cloak} setCloak={setCloakValue} signOut={signOut} />}
    </main>
    {run && activeQuest && <QuestOverlay quest={activeQuest} run={run} confirmExit={confirmExit} askExit={() => setConfirmExit(true)} cancelExit={() => setConfirmExit(false)} exit={() => { setRun(null); setConfirmExit(false); }} claim={claimQuest} />}
    {onboarding && <OnboardingOverlay theme={theme} finish={finishOnboarding} />}
  </div>;
}

function HomePanel({ name, quests: items, completed, run, startQuest, refresh, resetsLeft, openHacks, openProxies }: { name: string; quests: Quest[]; completed: string[]; run: QuestRun | null; startQuest: (quest: Quest) => void; refresh: () => void; resetsLeft: number; openHacks: () => void; openProxies: () => void }) {
  const done = items.filter((quest) => completed.includes(quest.id)).length;
  return <div className="animate-in fade-in duration-500">
    <section className="brand-wash relative overflow-hidden rounded-lg border border-border px-6 py-10 sm:px-10 sm:py-14">
      <div className="relative z-10 max-w-2xl"><p className="section-label">OPEN DIRECTORY</p><h1 className="page-title">Welcome{ name ? `, ${name}` : ""}.</h1><p className="page-copy max-w-xl">Every hack, proxy, game route, and utility is open. Pick a quest or jump straight into the directory.</p><div className="mt-7 flex flex-wrap gap-2"><Button onClick={openProxies}><Network /> Explore proxies</Button><Button variant="outline" onClick={openHacks}><Code2 /> Browse hacks</Button></div></div>
      <img src={dogeMark} alt="The Doge Foundation mascot" className="pointer-events-none absolute -bottom-16 right-0 hidden h-72 object-contain opacity-90 md:block" />
    </section>
    <section className="my-12"><div className="mb-5 flex items-end justify-between gap-4"><div><p className="section-label">TRENDING NOW</p><h2 className="mt-1 text-xl font-semibold">Community favorites</h2></div><Button variant="ghost" size="sm" onClick={openProxies}>View directory</Button></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[
      ["DOGEUB", "The goated classic, now with v5 mirrors.", Flame], ["Selenite", "A reliable hub with six access points.", TrendingUp], ["History flooder", "A popular copy-ready bookmarklet.", Code2], ["Space", "Games and proxy access in one clean hub.", Network],
    ].map(([title, note, Icon]) => <button type="button" key={String(title)} onClick={title === "History flooder" ? openHacks : openProxies} className="rounded-lg border border-border bg-card/70 p-5 text-left transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card"><Icon className="size-4 text-primary" /><h3 className="mt-4 font-medium">{String(title)}</h3><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{String(note)}</p></button>)}</div></section>
    <section><div className="mb-5 flex items-end justify-between gap-4"><div><p className="section-label">ACTIVITY BOARD</p><h2 className="mt-1 text-xl font-semibold">Open quests</h2><p className="mt-1 text-sm text-muted-foreground">{done}/{items.length} complete in this set</p></div><Button variant="outline" size="sm" disabled={resetsLeft <= 0} onClick={refresh}><RotateCw /> Refresh ({resetsLeft})</Button></div><div className="grid gap-4 lg:grid-cols-2">{items.map((quest, index) => {
      const isDone = completed.includes(quest.id); const active = run?.questId === quest.id;
      return <article key={quest.id} className={`rounded-lg border p-5 transition ${isDone ? "border-success/30 bg-success/5" : active ? "border-primary/50 bg-primary/5" : "border-border bg-card/70 hover:border-primary/30"}`}><div className="flex gap-4"><span className={`grid size-11 shrink-0 place-items-center rounded-md border ${isDone ? "border-success/30 bg-success/10 text-success" : "border-border bg-secondary text-primary"}`}>{isDone ? <Check className="size-4" /> : <Sparkles className="size-4" />}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="font-mono text-[10px] text-muted-foreground">Q{String(index + 1).padStart(2, "0")}</span><h3 className="font-medium">{quest.title}</h3></div><p className="mt-1 text-sm text-muted-foreground">{quest.detail}</p><div className="mt-4 flex items-center gap-2"><span className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1 font-mono text-[10px] text-muted-foreground"><Clock3 className="size-3" />{formatTime(quest.seconds)}</span><span className="rounded-full border border-primary/30 px-2.5 py-1 font-mono text-[10px] uppercase text-primary">{quest.category}</span><div className="ml-auto">{isDone ? <span className="text-xs font-medium text-success">Complete</span> : <Button size="sm" variant="outline" disabled={!!run} onClick={() => startQuest(quest)}>{active ? "Running…" : "Go"}<Play /></Button>}</div></div></div></div></article>;
    })}</div></section>
  </div>;
}

function HacksPanel() {
  return <section className="animate-in fade-in duration-500"><p className="section-label">OPEN TOOLKIT</p><h1 className="page-title">Hacks</h1><p className="page-copy">Every available script and game tool is accessible—no ranks, levels, or locked categories.</p><div className="mt-10 grid gap-5 lg:grid-cols-2">{hacks.map((hack) => <HackCard key={hack.id} hack={hack} />)}</div></section>;
}

function HackCard({ hack }: { hack: HackEntry }) {
  const [copied, setCopied] = useState(false);
  return <article className="rounded-lg border border-border bg-card/80 p-6"><div className="flex items-start gap-4">{hack.image ? <img src={hack.image} alt={`${hack.name} icon`} className="size-12 shrink-0 rounded-md border border-border bg-card object-contain p-1" /> : <span className="grid size-12 shrink-0 place-items-center rounded-md border border-border bg-secondary">{hack.code ? <Code2 className="size-5 text-primary" /> : <Pencil className="size-5 text-primary" />}</span>}<div><h2 className="font-semibold">{hack.name}</h2><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{hack.description}</p></div></div><div className="mt-5 border-t border-border pt-5"><p className="font-mono text-[10px] uppercase text-muted-foreground">Instructions</p><ol className="mt-3 space-y-2 text-sm text-muted-foreground">{hack.steps.map((step, index) => <li key={step} className="flex gap-3"><span className="font-mono text-xs text-primary">{String(index + 1).padStart(2, "0")}</span>{step}</li>)}</ol>{hack.code && <div className="mt-5"><div className="mb-2 flex items-center justify-between"><span className="font-mono text-[10px] uppercase text-muted-foreground">Script</span><Button size="sm" variant="outline" onClick={() => { void navigator.clipboard.writeText(hack.code ?? ""); setCopied(true); window.setTimeout(() => setCopied(false), 1600); }}>{copied ? <Check /> : <Copy />}{copied ? "Copied" : "Copy code"}</Button></div><pre className="scrollbar-none max-h-28 overflow-auto rounded-md border border-border bg-secondary/60 p-3 font-mono text-[11px] text-muted-foreground"><code>{hack.code}</code></pre></div>}{hack.url && <a href={hack.url} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"><ExternalLink className="size-4" />Open source</a>}</div></article>;
}

function ProxyPanel() {
  const [query, setQuery] = useState("");
  const filtered = proxyLibrary.filter((proxy) => `${proxy.name} ${proxy.description}`.toLowerCase().includes(query.toLowerCase()));
  return <section className="animate-in fade-in duration-500"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="section-label">OPEN NETWORK</p><h1 className="page-title">Proxy directory</h1><p className="page-copy">{proxyLibrary.length} full entries plus {quickLinks.length} quick routes. Try an alternate when a main link is blocked.</p></div><div className="relative w-full sm:max-w-xs"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search directory" className="pl-9" /></div></div><div className="mt-10 grid gap-5 lg:grid-cols-2">{filtered.map((proxy) => <ProxyCard key={proxy.id} proxy={proxy} />)}</div>{filtered.length === 0 && <div className="mt-10 rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted-foreground">No proxy matches that search.</div>}<div className="mt-14 border-t border-border pt-10"><p className="section-label">FAST ACCESS</p><h2 className="mt-1 text-xl font-semibold">Quick links</h2><div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{quickLinks.map((link) => <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-md border border-border bg-card/70 px-4 py-3 text-sm font-medium transition hover:border-primary/40 hover:bg-card"><span>{link.name}</span><ExternalLink className="size-4 text-primary" /></a>)}</div></div></section>;
}

function ProxyCard({ proxy }: { proxy: ProxyEntry }) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? proxy.links : proxy.links.slice(0, 3);
  const tone = proxy.status === "working" ? "border-success/30 bg-success/10 text-success" : proxy.status === "partial" ? "border-primary/30 bg-primary/10 text-primary" : "border-destructive/30 bg-destructive/10 text-destructive";
  return <article className="flex flex-col rounded-lg border border-border bg-card/80 p-6"><div className="flex items-start gap-4">{proxy.icon ? <img src={proxy.icon} alt={`${proxy.name} logo`} loading="lazy" referrerPolicy="no-referrer" className="size-12 shrink-0 rounded-md border border-border bg-card object-contain p-1" /> : <span className="grid size-12 shrink-0 place-items-center rounded-md border border-border bg-secondary"><Network className="size-5 text-primary" /></span>}<div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold">{proxy.name}</h2><span className={`rounded-full border px-2 py-0.5 font-mono text-[10px] ${tone}`}>{proxy.status === "working" ? "working" : proxy.status === "partial" ? "partly working" : "proxy down"}</span></div><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{proxy.description}</p></div></div><div className="mt-5 border-t border-border pt-4"><ul className="divide-y divide-border">{shown.map((link, index) => <li key={`${link.url}-${index}`} className="flex items-center justify-between gap-4 py-3"><div className="min-w-0"><p className="text-sm font-medium">{link.label}</p><p className="truncate text-xs text-muted-foreground">{link.note}</p></div><a href={link.url} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary hover:underline"><Link2 className="size-4" />Open</a></li>)}</ul>{proxy.links.length > 3 && <Button variant="ghost" size="sm" className="mt-2 w-full" onClick={() => setExpanded((value) => !value)}>{expanded ? <ChevronUp /> : <ChevronDown />}{expanded ? "Show fewer" : `Show ${proxy.links.length - 3} more`}</Button>}</div></article>;
}

function MorePanel() {
  return <section className="animate-in fade-in duration-500"><p className="section-label">MORE TO EXPLORE</p><h1 className="page-title">More</h1><p className="page-copy">Useful shortcuts and spaces for the collection as it grows.</p><div className="mt-10 grid gap-4 md:grid-cols-3">{[{ title: "Game launchers", text: "Jump directly into Blooket and Kahoot.", icon: Gamepad2, links: [["Blooket", "https://www.blooket.com/"], ["Kahoot", "https://kahoot.it/"]] }, { title: "Proxy picks", text: "Open two community favorites.", icon: Network, links: [["DOGEUB", "https://dogefrokbro.vercel.app/"], ["Selenite", "https://selenite-6668.logans.projectbyod.com/"]] }, { title: "Script sources", text: "Get the starter bookmarklets.", icon: Code2, links: [["Auto clicker", "https://github.com/sparemind/AutoClickerBookmarklet"], ["Edit page", "https://github.com/TacocatDev01/Edit-Page-Bookmarklet"]] }].map((group) => <article key={group.title} className="rounded-lg border border-border bg-card/80 p-6"><group.icon className="size-5 text-primary" /><h2 className="mt-5 font-semibold">{group.title}</h2><p className="mt-1 text-sm text-muted-foreground">{group.text}</p><div className="mt-5 space-y-2">{group.links.map(([label, url]) => <a key={label} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm hover:border-primary/40">{label}<ExternalLink className="size-3.5 text-primary" /></a>)}</div></article>)}</div></section>;
}

function ContactPanel({ userId }: { userId: string }) {
  const [body, setBody] = useState(""); const [sent, setSent] = useState(false); const [history, setHistory] = useState<{ id: string; body: string; created_at: string }[]>([]);
  const load = useCallback(async () => { if (!userId) return; const { data } = await supabase.from("owner_messages").select("id,body,created_at").order("created_at", { ascending: false }).limit(20); if (data) setHistory(data); }, [userId]);
  useEffect(() => { void load(); }, [load]);
  const send = async () => { const text = body.trim(); if (!text || !userId) return; const { data, error } = await supabase.from("owner_messages").insert({ user_id: userId, body: text }).select("id,body,created_at").single(); if (!error && data) { setHistory((items) => [data, ...items]); setBody(""); setSent(true); window.setTimeout(() => setSent(false), 1600); } };
  return <section className="animate-in fade-in duration-500"><p className="section-label">DIRECT LINE</p><h1 className="page-title">Contact</h1><p className="page-copy">Message the owner directly. This is open to every member.</p><div className="mt-10 grid gap-5 lg:grid-cols-[1.2fr_1fr]"><div className="rounded-lg border border-border bg-card/80 p-6"><label htmlFor="message" className="text-xs font-medium text-muted-foreground">Your message</label><textarea id="message" value={body} onChange={(event) => setBody(event.target.value)} rows={7} maxLength={1200} placeholder="Ask a question, suggest a link, or report something broken." className="mt-2 w-full resize-none rounded-md border border-input bg-background p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" /><div className="mt-4 flex items-center justify-between"><span className="font-mono text-xs text-muted-foreground">{body.length}/1200</span><Button disabled={!body.trim()} onClick={send}>{sent ? <Check /> : <Send />}{sent ? "Sent" : "Send"}</Button></div></div><div className="rounded-lg border border-border bg-card/80 p-6"><h2 className="font-semibold">Sent messages</h2>{history.length === 0 ? <div className="mt-6 grid min-h-32 place-items-center rounded-md border border-dashed border-border text-sm text-muted-foreground">No messages yet</div> : <ul className="mt-4 divide-y divide-border">{history.map((message) => <li key={message.id} className="py-4"><p className="text-sm">{message.body}</p><p className="mt-1 font-mono text-[10px] text-muted-foreground">{new Date(message.created_at).toLocaleString()}</p></li>)}</ul>}</div></div></section>;
}

function YouPanel({ profile, draftName, setDraftName, saveProfile, saved, theme, setTheme, cloak, setCloak, signOut }: { profile: { display_name: string; created_at: string; persona: string }; draftName: string; setDraftName: (value: string) => void; saveProfile: () => void; saved: boolean; theme: "dark" | "light"; setTheme: (value: "dark" | "light") => void; cloak: boolean; setCloak: (value: boolean) => void; signOut: () => void }) {
  const joined = profile.created_at ? new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(new Date(profile.created_at)) : "Loading…";
  return <section className="animate-in fade-in duration-500"><div className="mb-10 flex items-end justify-between"><div><p className="section-label">ACCOUNT</p><h1 className="page-title">You</h1></div><Button variant="ghost" size="sm" onClick={signOut}><LogOut />Sign out</Button></div><div className="grid gap-5 lg:grid-cols-2"><div className="rounded-lg border border-border bg-card/80 p-6"><div className="mb-8 flex items-center gap-4"><span className="grid size-14 place-items-center overflow-hidden rounded-md border border-border bg-secondary"><img src={dogeMark} alt="Doge avatar" className="h-full w-full object-contain" /></span><div><h2 className="font-semibold">{profile.display_name || "member"}</h2><p className="text-sm text-muted-foreground">Joined {joined}{profile.persona ? ` · ${profile.persona}` : ""}</p></div></div><label className="text-xs font-medium text-muted-foreground">Display name</label><div className="mt-2 flex gap-2"><Input value={draftName} onChange={(event) => setDraftName(event.target.value)} maxLength={40} /><Button onClick={saveProfile}>{saved ? <Check /> : "Save"}</Button></div><div className="mt-6 flex items-center justify-between border-t border-border pt-5"><div><p className="text-sm font-medium">Full access member</p><p className="text-xs text-muted-foreground">Every directory and tool is unlocked.</p></div><ShieldCheck className="text-primary" /></div></div><div className="rounded-lg border border-border bg-card/80 p-6"><h2 className="font-semibold">Preferences</h2><div className="mt-6 divide-y divide-border"><Preference icon={theme === "dark" ? Moon : Sun} title="Appearance" description={`${theme === "dark" ? "Dark" : "Light"} mode`} control={<Switch checked={theme === "light"} onCheckedChange={(value) => setTheme(value ? "light" : "dark")} />} /><Preference icon={ShieldCheck} title="Google Cloak" description="Disguise this browser tab" control={<Switch checked={cloak} onCheckedChange={setCloak} />} /></div></div><div className="rounded-lg border border-border bg-card/80 p-6 lg:col-span-2"><div className="flex items-center justify-between"><div><h2 className="font-semibold">My Bookmarked Hacks</h2><p className="mt-1 text-sm text-muted-foreground">Your saved collection will appear here.</p></div><Bookmark className="text-muted-foreground" /></div><div className="mt-6 grid min-h-28 place-items-center rounded-md border border-dashed border-border text-sm text-muted-foreground">No bookmarks yet</div></div></div></section>;
}

function QuestOverlay({ quest, run, confirmExit, askExit, cancelExit, exit, claim }: { quest: Quest; run: QuestRun; confirmExit: boolean; askExit: () => void; cancelExit: () => void; exit: () => void; claim: () => void }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-background/90 p-5 backdrop-blur-md"><Button variant="ghost" size="icon" className="absolute left-4 top-4" onClick={askExit} aria-label="Exit quest"><X /></Button><div className="w-full max-w-md rounded-lg border border-border bg-card p-8 text-center"><p className="section-label">QUEST IN PROGRESS</p><h2 className="mt-2 text-xl font-semibold">{quest.title}</h2><a href={run.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex max-w-full items-center gap-1.5 truncate text-xs text-muted-foreground hover:text-foreground hover:underline"><Link2 className="size-3 shrink-0" />{run.url}</a>{run.phase === "confirming" && <p className="mt-8 animate-pulse font-mono text-sm text-primary">waiting for confirmation…</p>}{run.phase === "counting" && <><div className="mt-8 flex items-center justify-center gap-3 font-mono text-4xl"><Clock3 className="size-6 animate-pulse text-primary" />{formatTime(run.remaining)}</div><p className="mt-3 text-sm text-muted-foreground">Activity timer running…</p></>}{run.phase === "ready" && <><p className="mt-8 text-sm text-muted-foreground">Quest complete. Mark it finished.</p><Button className="mt-5" onClick={claim}><Check />Complete quest</Button></>}</div>{confirmExit && <div className="absolute inset-0 grid place-items-center bg-background/85 p-5"><div className="w-full max-w-sm rounded-lg border border-destructive/30 bg-card p-6"><h3 className="font-semibold">Exit this quest?</h3><p className="mt-2 text-sm text-muted-foreground">The timer will stop and this quest will remain incomplete.</p><div className="mt-6 flex justify-end gap-2"><Button variant="ghost" onClick={cancelExit}>Stay</Button><Button variant="destructive" onClick={exit}>Exit</Button></div></div></div>}</div>;
}

function OnboardingOverlay({ theme, finish }: { theme: "dark" | "light"; finish: (persona: string, theme: "dark" | "light") => void }) {
  const [step, setStep] = useState(0); const [persona, setPersona] = useState(""); const [pick, setPick] = useState<"dark" | "light">(theme);
  return <div className="fixed inset-0 z-50 grid place-items-center bg-background/95 p-5 backdrop-blur-md"><div className="w-full max-w-lg rounded-lg border border-border bg-card p-8"><div className="mb-5 flex items-center gap-3"><img src={dogeMark} alt="Doge" className="size-12 object-contain" /><div><p className="section-label">WELCOME</p><h2 className="text-xl font-semibold">The Doge Foundation</h2></div></div>{step === 0 ? <><h3 className="mt-6 text-2xl font-semibold">Who are you?</h3><p className="mt-2 text-sm text-muted-foreground">Choose the description that fits best.</p><div className="mt-6 grid gap-2">{["Student", "Teacher", "Just curious", "Something else"].map((option) => <Button key={option} type="button" variant={persona === option ? "default" : "outline"} className="justify-start" onClick={() => setPersona(option)}>{option}</Button>)}</div><Button className="mt-6 w-full" disabled={!persona} onClick={() => setStep(1)}>Continue</Button></> : <><h3 className="mt-6 text-2xl font-semibold">Choose your appearance</h3><p className="mt-2 text-sm text-muted-foreground">You can change this later from You.</p><div className="mt-6 grid grid-cols-2 gap-3">{(["light", "dark"] as const).map((option) => <Button key={option} type="button" variant={pick === option ? "default" : "outline"} className="h-14 capitalize" onClick={() => setPick(option)}>{option === "light" ? <Sun /> : <Moon />}{option}</Button>)}</div><Button className="mt-6 w-full" onClick={() => finish(persona, pick)}>Enter The Doge Foundation</Button></>}</div></div>;
}

function Preference({ icon: Icon, title, description, control }: { icon: typeof Moon; title: string; description: string; control: React.ReactNode }) {
  return <div className="flex items-center gap-3 py-5 first:pt-0 last:pb-0"><Icon className="size-4 text-primary" /><div className="flex-1"><p className="text-sm font-medium">{title}</p><p className="text-xs text-muted-foreground">{description}</p></div>{control}</div>;
}
