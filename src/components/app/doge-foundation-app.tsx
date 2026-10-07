import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Bookmark, Check, Code2, Copy,
  ExternalLink, Flame, Gamepad2, House, LogOut, Mail, Moon, Network,
  Orbit, Pencil, Search, Send, ShieldCheck, Sun,
  TrendingUp, UserRound, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { bubbleLetters, calculator, drawOnScreen, historyFlooder, rainbowPage } from "@/lib/hack-scripts";
import blooketCheatsPlus from "@/lib/blooket-cheats-plus.txt?raw";
import { proxyLibrary, quickLinks, type ProxyEntry } from "@/lib/proxy-data";
import dogeMark from "@/assets/doge-foundation-mark.png";
import autoclickerIcon from "@/assets/hack-autoclicker.png";
import historyIcon from "@/assets/hack-history-water.png";

type Tab = "Home" | "Hacks" | "Proxy" | "More" | "Contact" | "You";
type HackEntry = { id: string; name: string; description: string; url?: string; code?: string; image?: string; steps: string[] };

const nav: { label: Tab; icon: typeof House }[] = [
  { label: "Home", icon: House }, { label: "Hacks", icon: Code2 }, { label: "Proxy", icon: Network },
  { label: "More", icon: Orbit }, { label: "Contact", icon: Mail }, { label: "You", icon: UserRound },
];

const hacks: HackEntry[] = [
  { id: "autoclicker", name: "Auto clicker bookmarklet", description: "Repeatedly clicks wherever you point—useful for idle games and repetitive actions.", url: "https://github.com/sparemind/AutoClickerBookmarklet", image: autoclickerIcon, steps: ["Open the source link and copy the bookmarklet code.", "Show your browser bookmarks bar.", "Create a new bookmark named auto clicker.", "Paste the code into its URL field.", "Open a page and select the bookmark to start.", "Select it again to stop."] },
  { id: "edit-page", name: "Edit page bookmarklet", description: "Makes visible page text editable until the page is refreshed.", url: "https://github.com/TacocatDev01/Edit-Page-Bookmarklet", steps: ["Open the source link and copy the code.", "Create a new browser bookmark.", "Name it edit page.", "Paste the code into the URL field.", "Open any page and select the bookmark.", "Refresh to undo your local edits."] },
  { id: "history", name: "History flooder", description: "Adds copies of the current page to browser history so the back button has more entries.", code: historyFlooder, image: historyIcon, steps: ["Copy the script.", "Create a new bookmark.", "Paste the script into its URL field.", "Open the page you want to use.", "Select the bookmark.", "Enter the number of history entries."] },
  { id: "bubble", name: "Bubble letter font", description: "Converts page text into circled bubble characters as new text appears.", code: bubbleLetters, steps: ["Copy the script.", "Create a bookmark named bubble letters.", "Paste the script into its URL field.", "Open a text-heavy page.", "Select the bookmark.", "Refresh to restore the page."] },
  { id: "draw", name: "Draw on your screen", description: "Turns the cursor into a configurable paintbrush over any page.", code: drawOnScreen, steps: ["Copy the script.", "Save it as a bookmark.", "Open a page and select it.", "Press d to draw and u to lift the pen.", "Use c, s, and o for color, size, and opacity.", "Refresh to clear the drawing."] },
  { id: "rainbow", name: "Rainbow page", description: "Cycles the entire page through the color spectrum and toggles off on a second run.", code: rainbowPage, steps: ["Copy the script.", "Create a bookmark named rainbow.", "Paste it into the URL field.", "Open any page.", "Select the bookmark to start.", "Select it again to stop."] },
  { id: "calculator", name: "Pop-up calculator", description: "A prompt-based calculator for arithmetic and common equations.", code: calculator, steps: ["Copy the script.", "Create a bookmark named calculator.", "Paste it into the URL field.", "Select the bookmark.", "Choose a calculator mode.", "Enter the requested values."] },
  { id: "blooket-launcher", name: "Blooket game launcher", description: "Direct access to Blooket’s play and dashboard screens.", url: "https://www.blooket.com/", steps: ["Open Blooket.", "Sign in or join with a game code.", "Choose a game mode.", "Keep this library open in another tab.", "Use only scripts you understand.", "Return here when finished."] },
  { id: "blooket-cheats-plus", name: "Blooket Cheats Plus", description: "Community-provided Blooket bookmarklet. This third-party script can change game behavior and makes requests while running; review it before use.", code: blooketCheatsPlus.trim(), steps: ["Review the script before running it on a site where you are signed in.", "Copy the script and save it as a browser bookmark URL.", "Open Blooket in a separate tab.", "Select the bookmark there to open its menu.", "Use only where the game rules permit it."] },
];

const STORAGE_PREFIX = "doge-foundation";

export function DogeFoundationApp() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("Home");
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [cloak, setCloak] = useState(false);
  const [profile, setProfile] = useState({ id: "", display_name: "", created_at: "", persona: "" });
  const [draftName, setDraftName] = useState("");
  const [saved, setSaved] = useState(false);
  const [onboarding, setOnboarding] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem(`${STORAGE_PREFIX}-theme`) === "dark" ? "dark" : "light";
    setTheme(storedTheme);
    document.documentElement.classList.toggle("dark", storedTheme === "dark");
    localStorage.removeItem(`${STORAGE_PREFIX}-quests`);
    localStorage.removeItem(`${STORAGE_PREFIX}-resets`);
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

  useEffect(() => { document.documentElement.classList.toggle("dark", theme === "dark"); localStorage.setItem(`${STORAGE_PREFIX}-theme`, theme); }, [theme]);
  useEffect(() => {
    document.title = cloak ? "Google" : "The Doge Foundation";
    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (favicon) favicon.href = cloak ? "https://www.google.com/favicon.ico" : "/favicon.png";
  }, [cloak]);
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

  return <div className="min-h-screen bg-background text-foreground">
    <header className="sticky top-0 z-40 v3-surface border-b border-border bg-card/95 backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center gap-3 px-4 py-2 sm:px-6">
        <div className="flex shrink-0 items-center gap-2.5 font-display text-base font-bold sm:text-xl">
          <span className="grid size-10 place-items-center overflow-hidden rounded-md border border-border bg-secondary"><img src={dogeMark} alt="Doge" className="h-full w-full object-contain" /></span>
          <span>The Doge Foundation</span><span className="rounded border border-primary/40 px-1.5 py-0.5 font-sans text-[10px] text-primary">V3</span>
        </div>
        <nav className="scrollbar-none flex w-full min-w-0 items-center justify-between gap-1 overflow-x-auto sm:w-auto sm:flex-1 sm:justify-end">
          {nav.map((item) => <Button key={item.label} variant={tab === item.label ? "secondary" : "ghost"} size="sm" onClick={() => setTab(item.label)} aria-label={item.label} title={item.label} className="h-10 shrink-0 px-2 text-[10px] sm:px-3 sm:text-xs"><item.icon className="size-4" /><span className="hidden min-[370px]:inline">{item.label}</span></Button>)}
        </nav>
      </div>
    </header>
    <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9">
       {tab === "Home" && <HomePanel name={profile.display_name} openHacks={() => setTab("Hacks")} openProxies={() => setTab("Proxy")} />}
      {tab === "Hacks" && <HacksPanel />}
      {tab === "Proxy" && <ProxyPanel />}
      {tab === "More" && <MorePanel />}
      {tab === "Contact" && <ContactPanel userId={profile.id} />}
      {tab === "You" && <YouPanel profile={profile} draftName={draftName} setDraftName={setDraftName} saveProfile={saveProfile} saved={saved} theme={theme} setTheme={setTheme} cloak={cloak} setCloak={setCloakValue} signOut={signOut} />}
    </main>
    {onboarding && <OnboardingOverlay theme={theme} finish={finishOnboarding} />}
  </div>;
}

function HomePanel({ name, openHacks, openProxies }: { name: string; openHacks: () => void; openProxies: () => void }) {
  const favorites = proxyLibrary.filter((proxy) => ["Space", "Truffled", "Selenite", "Daydream X"].includes(proxy.name));
  return <div className="animate-in fade-in duration-500">
    <section className="flex items-center justify-between gap-5 border-b border-border pb-7">
      <div><p className="section-label">THE DOGE FOUNDATION / V3.0</p><h1 className="page-title">Your next discovery.</h1><p className="page-copy">Welcome{name ? `, ${name}` : ""}.</p><div className="mt-5 flex flex-wrap gap-2"><Button onClick={openProxies}><Network />Proxy directory</Button><Button variant="outline" onClick={openHacks}><Code2 />Hacks</Button></div></div>
      <img src={dogeMark} alt="Doge mascot" className="hidden size-40 object-contain sm:block" />
    </section>
    <section className="mt-7"><div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-xl font-bold">Community favorites</h2><Button variant="ghost" size="sm" onClick={openProxies}>View all<ExternalLink /></Button></div><div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{favorites.map((proxy) => <ProxyCard key={proxy.id} proxy={proxy} onSeeLinks={openProxies} />)}</div></section>
    <section className="mt-9 border-t border-border pt-6"><div className="flex items-center justify-between gap-4"><h2 className="text-xl font-bold">Trending hacks</h2><Button variant="ghost" size="sm" onClick={openHacks}>Browse hacks<ExternalLink /></Button></div><div className="mt-4 grid gap-3 sm:grid-cols-3">{hacks.filter((hack) => ["autoclicker", "history", "draw"].includes(hack.id)).map((hack) => <Button key={hack.id} variant="outline" onClick={openHacks} className="v3-surface h-20 justify-start bg-card px-4 text-left"><Code2 /><span className="whitespace-normal">{hack.name}</span></Button>)}</div></section>
  </div>;
}

function HacksPanel() {
  return <section className="animate-in fade-in duration-500"><p className="section-label">OPEN TOOLKIT</p><h1 className="page-title">Hacks</h1><p className="page-copy">Bookmarklets and game tools.</p><div className="mt-10 grid gap-5 lg:grid-cols-2">{hacks.map((hack) => <HackCard key={hack.id} hack={hack} />)}</div></section>;
}

function HackCard({ hack }: { hack: HackEntry }) {
  const [copied, setCopied] = useState(false);
   return <article className="rounded-lg border border-border v3-surface bg-card p-6"><div className="flex items-start gap-4">{hack.image ? <img src={hack.image} alt={`${hack.name} icon`} className="size-12 shrink-0 rounded-md border border-border bg-card object-contain p-1" /> : <span className="grid size-12 shrink-0 place-items-center rounded-md border border-border bg-secondary">{hack.code ? <Code2 className="size-5 text-primary" /> : <Pencil className="size-5 text-primary" />}</span>}<div><h2 className="font-semibold">{hack.name}</h2><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{hack.description}</p></div></div><div className="mt-5 border-t border-border pt-5"><p className="font-mono text-[10px] uppercase text-muted-foreground">Instructions</p><ol className="mt-3 space-y-2 text-sm text-muted-foreground">{hack.steps.map((step, index) => <li key={step} className="flex gap-3"><span className="font-mono text-xs text-primary">{String(index + 1).padStart(2, "0")}</span>{step}</li>)}</ol>{hack.code && <div className="mt-5"><div className="mb-2 flex items-center justify-between"><span className="font-mono text-[10px] uppercase text-muted-foreground">Script</span><Button size="sm" variant="outline" onClick={() => { void navigator.clipboard.writeText(hack.code ?? ""); setCopied(true); window.setTimeout(() => setCopied(false), 1600); }}>{copied ? <Check /> : <Copy />}{copied ? "Copied" : "Copy code"}</Button></div><pre className="scrollbar-none max-h-28 overflow-auto rounded-md border border-border bg-secondary/60 p-3 font-mono text-[11px] text-muted-foreground"><code>{hack.code.length > 1000 ? `${hack.code.slice(0, 1000)}…` : hack.code}</code></pre></div>}{hack.url && <a href={hack.url} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"><ExternalLink className="size-4" />Open source</a>}</div></article>;
}

function ProxyPanel() {
  const [query, setQuery] = useState("");
  const [selectedProxy, setSelectedProxy] = useState<ProxyEntry | null>(null);
  const filtered = proxyLibrary.filter((proxy) => `${proxy.name} ${proxy.description}`.toLowerCase().includes(query.toLowerCase()));
  return <section className="animate-in fade-in duration-500"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="section-label">OPEN NETWORK</p><h1 className="page-title">Proxy directory</h1><p className="page-copy">{proxyLibrary.length} proxies · {quickLinks.length} quick links</p></div><div className="relative w-full sm:max-w-xs"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search directory" placeholder="Search directory" className="pl-9" /></div></div><div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{filtered.map((proxy) => <ProxyCard key={proxy.id} proxy={proxy} onSeeLinks={() => setSelectedProxy(proxy)} />)}</div>{filtered.length === 0 && <div className="mt-10 rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted-foreground">No proxy matches that search.</div>}<div className="mt-14 border-t border-border pt-10"><p className="section-label">FAST ACCESS</p><h2 className="mt-1 text-xl font-semibold">Quick links</h2><div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{quickLinks.map((link) => <div key={link.name} className="flex items-center justify-between gap-3 rounded-md border border-border v3-surface bg-card px-4 py-3"><span className="min-w-0 truncate text-sm font-medium">{link.name}</span><Button asChild size="sm" variant="outline"><a href={link.url} target="_blank" rel="noopener noreferrer">Launch<ExternalLink /></a></Button></div>)}</div></div>{selectedProxy && <ProxyLinksPanel proxy={selectedProxy} close={() => setSelectedProxy(null)} />}</section>;
}

function ProxyCard({ proxy, onSeeLinks }: { proxy: ProxyEntry; onSeeLinks: () => void }) {
  const tone = proxy.status === "working" ? "border-success/30 bg-success/10 text-success" : proxy.status === "partial" ? "border-primary/30 bg-primary/10 text-primary" : "border-destructive/30 bg-destructive/10 text-destructive";
   return <article className="proxy-tile v3-surface flex min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card">{proxy.banner && <img src={proxy.banner} alt={`${proxy.name} website preview`} loading="lazy" className="aspect-video w-full border-b border-border bg-secondary object-cover object-top" />}<div className="flex flex-1 flex-col p-3 sm:p-4"><div className="flex flex-col items-start gap-2"><h2 className="min-h-10 text-sm font-bold leading-5 sm:text-base">{proxy.name}</h2><span className={`rounded-full border px-2 py-0.5 font-mono text-[10px] ${tone}`}>{proxy.status === "working" ? "working" : proxy.status === "partial" ? "partly working" : "proxy down"}</span></div><p className="mt-2 min-h-14 flex-1 text-xs leading-5 text-muted-foreground line-clamp-3">{proxy.description}</p><Button className="mt-4 h-9 w-full text-xs" variant="outline" onClick={onSeeLinks}>See links</Button></div></article>;
}

function ProxyLinksPanel({ proxy, close }: { proxy: ProxyEntry; close: () => void }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-background/85 p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="proxy-links-title" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}><div className="v3-surface max-h-[85vh] w-full max-w-2xl overflow-auto rounded-lg border border-border bg-card shadow-2xl"><div className="sticky top-0 flex items-start justify-between gap-4 border-b border-border bg-card/95 p-5 backdrop-blur"><div><p className="section-label">AVAILABLE ROUTES</p><h2 id="proxy-links-title" className="mt-1 text-xl font-semibold">{proxy.name}</h2></div><Button size="icon" variant="ghost" aria-label="Close links" title="Close" onClick={close}><X /></Button></div><ul className="divide-y divide-border p-5 pt-1">{proxy.links.map((link, index) => <li key={`${link.url}-${index}`} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="text-sm font-medium">{link.label}</p><p className="mt-1 text-xs text-muted-foreground">{link.note}</p><p className="mt-1 truncate font-mono text-[10px] text-muted-foreground">{link.url}</p></div><Button asChild size="sm"><a href={link.url} target="_blank" rel="noopener noreferrer">Launch<ExternalLink /></a></Button></li>)}</ul></div></div>;
}

function MorePanel() {
  return <section className="animate-in fade-in duration-500"><p className="section-label">MORE TO EXPLORE</p><h1 className="page-title">More</h1><p className="page-copy">Useful shortcuts and spaces for the collection as it grows.</p><div className="mt-10 grid gap-4 md:grid-cols-3">{[{ title: "Game launchers", text: "Jump directly into Blooket and Kahoot.", icon: Gamepad2, links: [["Blooket", "https://www.blooket.com/"], ["Kahoot", "https://kahoot.it/"]] }, { title: "Proxy picks", text: "Open two community favorites.", icon: Network, links: [["DOGEUB", "https://dogefrokbro.vercel.app/"], ["Selenite", "https://selenite-6668.logans.projectbyod.com/"]] }, { title: "Script sources", text: "Get the starter bookmarklets.", icon: Code2, links: [["Auto clicker", "https://github.com/sparemind/AutoClickerBookmarklet"], ["Edit page", "https://github.com/TacocatDev01/Edit-Page-Bookmarklet"]] }].map((group) => <article key={group.title} className="rounded-lg border border-border v3-surface bg-card p-6"><group.icon className="size-5 text-primary" /><h2 className="mt-5 font-semibold">{group.title}</h2><p className="mt-1 text-sm text-muted-foreground">{group.text}</p><div className="mt-5 space-y-2">{group.links.map(([label, url]) => <a key={label} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm hover:border-primary/40">{label}<ExternalLink className="size-3.5 text-primary" /></a>)}</div></article>)}</div></section>;
}

function ContactPanel({ userId }: { userId: string }) {
  const [body, setBody] = useState(""); const [sent, setSent] = useState(false); const [history, setHistory] = useState<{ id: string; body: string; created_at: string }[]>([]);
  const load = useCallback(async () => { if (!userId) return; const { data } = await supabase.from("owner_messages").select("id,body,created_at").order("created_at", { ascending: false }).limit(20); if (data) setHistory(data); }, [userId]);
  useEffect(() => { void load(); }, [load]);
  const send = async () => { const text = body.trim(); if (!text || !userId) return; const { data, error } = await supabase.from("owner_messages").insert({ user_id: userId, body: text }).select("id,body,created_at").single(); if (!error && data) { setHistory((items) => [data, ...items]); setBody(""); setSent(true); window.setTimeout(() => setSent(false), 1600); } };
  return <section className="animate-in fade-in duration-500"><p className="section-label">DIRECT LINE</p><h1 className="page-title">Contact</h1><p className="page-copy">Message the owner directly. This is open to every member.</p><div className="mt-10 grid gap-5 lg:grid-cols-[1.2fr_1fr]"><div className="rounded-lg border border-border v3-surface bg-card p-6"><label htmlFor="message" className="text-xs font-medium text-muted-foreground">Your message</label><textarea id="message" value={body} onChange={(event) => setBody(event.target.value)} rows={7} maxLength={1200} placeholder="Ask a question, suggest a link, or report something broken." className="mt-2 w-full resize-none rounded-md border border-input bg-background p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" /><div className="mt-4 flex items-center justify-between"><span className="font-mono text-xs text-muted-foreground">{body.length}/1200</span><Button disabled={!body.trim()} onClick={send}>{sent ? <Check /> : <Send />}{sent ? "Sent" : "Send"}</Button></div></div><div className="rounded-lg border border-border v3-surface bg-card p-6"><h2 className="font-semibold">Sent messages</h2>{history.length === 0 ? <div className="mt-6 grid min-h-32 place-items-center rounded-md border border-dashed border-border text-sm text-muted-foreground">No messages yet</div> : <ul className="mt-4 divide-y divide-border">{history.map((message) => <li key={message.id} className="py-4"><p className="text-sm">{message.body}</p><p className="mt-1 font-mono text-[10px] text-muted-foreground">{new Date(message.created_at).toLocaleString()}</p></li>)}</ul>}</div></div></section>;
}

function YouPanel({ profile, draftName, setDraftName, saveProfile, saved, theme, setTheme, cloak, setCloak, signOut }: { profile: { display_name: string; created_at: string; persona: string }; draftName: string; setDraftName: (value: string) => void; saveProfile: () => void; saved: boolean; theme: "dark" | "light"; setTheme: (value: "dark" | "light") => void; cloak: boolean; setCloak: (value: boolean) => void; signOut: () => void }) {
  const joined = profile.created_at ? new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(new Date(profile.created_at)) : "Loading…";
  return <section className="animate-in fade-in duration-500"><div className="mb-10 flex items-end justify-between"><div><p className="section-label">ACCOUNT</p><h1 className="page-title">You</h1></div><Button variant="ghost" size="sm" onClick={signOut}><LogOut />Sign out</Button></div><div className="grid gap-5 lg:grid-cols-2"><div className="rounded-lg border border-border v3-surface bg-card p-6"><div className="mb-8 flex items-center gap-4"><span className="grid size-14 place-items-center overflow-hidden rounded-md border border-border bg-secondary"><img src={dogeMark} alt="Doge avatar" className="h-full w-full object-contain" /></span><div><h2 className="font-semibold">{profile.display_name || "member"}</h2><p className="text-sm text-muted-foreground">Joined {joined}{profile.persona ? ` · ${profile.persona}` : ""}</p></div></div><label className="text-xs font-medium text-muted-foreground">Display name</label><div className="mt-2 flex gap-2"><Input value={draftName} onChange={(event) => setDraftName(event.target.value)} maxLength={40} /><Button onClick={saveProfile}>{saved ? <Check /> : "Save"}</Button></div><div className="mt-6 flex items-center justify-between border-t border-border pt-5"><div><p className="text-sm font-medium">Full access member</p><p className="text-xs text-muted-foreground">Every directory and tool is unlocked.</p></div><ShieldCheck className="text-primary" /></div></div><div className="rounded-lg border border-border v3-surface bg-card p-6"><h2 className="font-semibold">Preferences</h2><div className="mt-6 divide-y divide-border"><Preference icon={theme === "dark" ? Moon : Sun} title="Appearance" description={`${theme === "dark" ? "Dark" : "Light"} mode`} control={<Switch checked={theme === "light"} onCheckedChange={(value) => setTheme(value ? "light" : "dark")} />} /><Preference icon={ShieldCheck} title="Google Cloak" description="Disguise this browser tab" control={<Switch checked={cloak} onCheckedChange={setCloak} />} /></div></div><div className="rounded-lg border border-border v3-surface bg-card p-6 lg:col-span-2"><div className="flex items-center justify-between"><div><h2 className="font-semibold">My Bookmarked Hacks</h2><p className="mt-1 text-sm text-muted-foreground">Your saved collection will appear here.</p></div><Bookmark className="text-muted-foreground" /></div><div className="mt-6 grid min-h-28 place-items-center rounded-md border border-dashed border-border text-sm text-muted-foreground">No bookmarks yet</div></div></div></section>;
}

function OnboardingOverlay({ theme, finish }: { theme: "dark" | "light"; finish: (persona: string, theme: "dark" | "light") => void }) {
  const [step, setStep] = useState(0); const [persona, setPersona] = useState(""); const [pick, setPick] = useState<"dark" | "light">(theme);
  return <div className="fixed inset-0 z-50 grid place-items-center bg-background/95 p-5 backdrop-blur-md"><div className="v3-surface w-full max-w-lg rounded-lg border border-border bg-card p-8"><div className="mb-5 flex items-center gap-3"><img src={dogeMark} alt="Doge" className="size-12 object-contain" /><div><p className="section-label">WELCOME</p><h2 className="text-xl font-semibold">The Doge Foundation</h2></div></div>{step === 0 ? <><h3 className="mt-6 text-2xl font-semibold">Who are you?</h3><p className="mt-2 text-sm text-muted-foreground">Choose the description that fits best.</p><div className="mt-6 grid gap-2">{["Student", "Teacher", "Just curious", "Something else"].map((option) => <Button key={option} type="button" variant={persona === option ? "default" : "outline"} className="justify-start" onClick={() => setPersona(option)}>{option}</Button>)}</div><Button className="mt-6 w-full" disabled={!persona} onClick={() => setStep(1)}>Continue</Button></> : <><h3 className="mt-6 text-2xl font-semibold">Choose your appearance</h3><p className="mt-2 text-sm text-muted-foreground">You can change this later from You.</p><div className="mt-6 grid grid-cols-2 gap-3">{(["light", "dark"] as const).map((option) => <Button key={option} type="button" variant={pick === option ? "default" : "outline"} className="h-14 capitalize" onClick={() => setPick(option)}>{option === "light" ? <Sun /> : <Moon />}{option}</Button>)}</div><Button className="mt-6 w-full" onClick={() => finish(persona, pick)}>Enter The Doge Foundation</Button></>}</div></div>;
}

function Preference({ icon: Icon, title, description, control }: { icon: typeof Moon; title: string; description: string; control: React.ReactNode }) {
  return <div className="flex items-center gap-3 py-5 first:pt-0 last:pb-0"><Icon className="size-4 text-primary" /><div className="flex-1"><p className="text-sm font-medium">{title}</p><p className="text-xs text-muted-foreground">{description}</p></div>{control}</div>;
}
