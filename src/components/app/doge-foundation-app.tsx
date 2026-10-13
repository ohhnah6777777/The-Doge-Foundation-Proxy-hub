import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Bookmark, Check, ExternalLink, Inbox, KeyRound, LogOut, Moon, Network,
  Plus, Search, Send, ShieldCheck, Sun, ThumbsUp, ThumbsDown, Trash2, UserRound, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { claimAdmin } from "@/lib/admin.functions";
import { proxyLibrary, quickLinks, type ProxyEntry } from "@/lib/proxy-data";
import dogeMark from "@/assets/proxy-hub-mark.png";

type Tab = "Proxy" | "You";
const nav: { label: Tab; icon: typeof Network }[] = [{ label: "Proxy", icon: Network }, { label: "You", icon: UserRound }];

// One-time pseudo-random baseline (1-10) so a single account cannot reorder the directory.
function baseline(id: string, salt: number) {
  let h = salt;
  for (const c of id) h = (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0;
  return (h % 10) + 1;
}
type CustomProxyRow = { id: string; name: string; description: string; status: string; links: string[] };
function toEntry(row: CustomProxyRow): ProxyEntry {
  const status = row.status === "partial" || row.status === "down" ? row.status : "working";
  return { id: `custom-${row.id}`, name: row.name, status, description: row.description || "Community-added proxy.", links: row.links.map((url, i) => ({ label: i === 0 ? "Main link" : `Alternate ${i}`, url, note: i === 0 ? "Primary access point" : "Alternate access point" })) };
}

const STORAGE_PREFIX = "doge-foundation";
type ProxyPreference = { vote: "like" | "dislike" | null; saved: boolean };
type ProxyControls = { preferences: Record<string, ProxyPreference>; update: (id: string, action: "like" | "dislike" | "save") => void };
const emptyPreference: ProxyPreference = { vote: null, saved: false };

export function DogeFoundationApp() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("Proxy");
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [cloak, setCloak] = useState(false);
  const [profile, setProfile] = useState({ id: "", display_name: "", created_at: "", persona: "" });
  const [draftName, setDraftName] = useState("");
  const [saved, setSaved] = useState(false);
  const [onboarding, setOnboarding] = useState(false);
  const [preferences, setPreferences] = useState<Record<string, ProxyPreference>>({});
  const [preferencesAccount, setPreferencesAccount] = useState("");
  const [customProxies, setCustomProxies] = useState<ProxyEntry[]>([]);
  const loadCustom = useCallback(async () => {
    const { data } = await supabase.from("custom_proxies").select("id,name,description,status,links").order("created_at");
    if (data) setCustomProxies(data.map(toEntry));
  }, []);
  useEffect(() => { void loadCustom(); }, [loadCustom]);
  useEffect(() => {
    if (!profile.id) return;
    let restored: Record<string, ProxyPreference> = {};
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}-proxy-preferences-${profile.id}`) ?? "{}");
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        for (const [id, value] of Object.entries(parsed)) {
          if (value && typeof value === "object" && "vote" in value && "saved" in value &&
            (value.vote === null || value.vote === "like" || value.vote === "dislike") && typeof value.saved === "boolean") {
            restored[id] = { vote: value.vote, saved: value.saved };
          }
        }
      }
    } catch { /* Unavailable or invalid browser storage starts a fresh collection. */ }
    setPreferences(restored);
    setPreferencesAccount(profile.id);
  }, [profile.id]);
  useEffect(() => {
    if (!preferencesAccount || preferencesAccount !== profile.id) return;
    try { localStorage.setItem(`${STORAGE_PREFIX}-proxy-preferences-${preferencesAccount}`, JSON.stringify(preferences)); } catch { /* Keep controls usable when storage is unavailable. */ }
  }, [preferences, preferencesAccount, profile.id]);
  const controls: ProxyControls = { preferences, update: (id, action) => setPreferences((current) => {
    const previous = current[id] ?? emptyPreference;
    return { ...current, [id]: action === "save" ? { ...previous, saved: !previous.saved } : { ...previous, vote: previous.vote === action ? null : action } };
  }) };

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
    document.title = cloak ? "Google" : "Proxy Hub";
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
          <span className="grid size-10 place-items-center overflow-hidden rounded-md border border-border bg-secondary"><img src={dogeMark} alt="Proxy Hub" className="h-full w-full object-contain" /></span>
          <BrandName />
        </div>
        <nav className="scrollbar-none flex w-full min-w-0 items-center justify-between gap-1 overflow-x-auto sm:w-auto sm:flex-1 sm:justify-end">
          {nav.map((item) => <Button key={item.label} variant={tab === item.label ? "secondary" : "ghost"} size="sm" onClick={() => setTab(item.label)} aria-label={item.label} title={item.label} className="h-10 shrink-0 px-2 text-[10px] sm:px-3 sm:text-xs"><item.icon className="size-4" /><span className="hidden sm:inline">{item.label}</span></Button>)}
        </nav>
      </div>
    </header>
    <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9">
      {tab === "Proxy" && <ProxyPanel controls={controls} custom={customProxies} userId={profile.id} />}
      {tab === "You" && <YouPanel profile={profile} draftName={draftName} setDraftName={setDraftName} saveProfile={saveProfile} saved={saved} theme={theme} setTheme={setTheme} cloak={cloak} setCloak={setCloakValue} signOut={signOut} controls={controls} custom={customProxies} reloadCustom={loadCustom} />}
    </main>
    {onboarding && <OnboardingOverlay theme={theme} finish={finishOnboarding} />}
  </div>;
}

function BrandName() {
  return <span className="rounded-md border border-primary/50 bg-primary/15 px-2 py-0.5">Proxy <span className="rounded bg-highlight px-1 text-highlight-foreground">Hub</span></span>;
}

function sortByNetLikes(list: ProxyEntry[], prefs: Record<string, ProxyPreference>) {
  const net = (p: ProxyEntry) => {
    const likes = baseline(p.id, 3) + (prefs[p.id]?.vote === "like" ? 1 : 0);
    const dislikes = baseline(p.id, 7) + (prefs[p.id]?.vote === "dislike" ? 1 : 0);
    return Math.max(0, likes - dislikes);
  };
  return list.map((p, i) => ({ p, i })).sort((x, y) => net(y.p) - net(x.p) || x.i - y.i).map((x) => x.p);
}

function ProxyPanel({ controls, custom, userId }: { controls: ProxyControls; custom: ProxyEntry[]; userId: string }) {
  const [requesting, setRequesting] = useState(false);
  const all = sortByNetLikes([...proxyLibrary, ...custom], controls.preferences);
  const [savedOnly, setSavedOnly] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedProxy, setSelectedProxy] = useState<ProxyEntry | null>(null);
  const filtered = all.filter((proxy) => (!savedOnly || controls.preferences[proxy.id]?.saved) && `${proxy.name} ${proxy.description}`.toLowerCase().includes(query.toLowerCase()));
  return <section className="animate-in fade-in duration-500"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="section-label">OPEN NETWORK</p><h1 className="page-title">Proxy directory</h1><p className="page-copy">{all.length} proxies · {quickLinks.length} quick links</p></div><div className="relative w-full sm:max-w-xs"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search directory" placeholder="Search directory" className="pl-9" /></div></div><div className="mt-5 flex items-center gap-2"><Button variant={savedOnly ? "secondary" : "ghost"} size="sm" aria-pressed={savedOnly} onClick={() => setSavedOnly((value) => !value)}><Bookmark />Saved ({Object.values(controls.preferences).filter((value) => value.saved).length})</Button></div><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{filtered.map((proxy) => <ProxyCard controls={controls} key={proxy.id} proxy={proxy} onLaunch={() => setSelectedProxy(proxy)} />)}</div>{filtered.length === 0 && <div className="mt-10 rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted-foreground">{savedOnly ? "No saved proxies match. Save a proxy to add it here." : "No proxy matches that search."}</div>}<div className="mt-14 border-t border-border pt-10"><p className="section-label">FAST ACCESS</p><h2 className="mt-1 text-xl font-semibold">Quick links</h2><div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{quickLinks.map((link) => <div key={link.name} className="flex items-center justify-between gap-3 rounded-md border border-border v3-surface bg-card px-4 py-3"><span className="min-w-0 truncate text-sm font-medium">{link.name}</span><LaunchLink url={link.url} label={link.name} /></div>)}</div></div><div className="v3-surface mt-14 flex flex-col items-center gap-4 rounded-lg border border-dashed border-border bg-card p-8 text-center"><p className="text-sm text-muted-foreground">Missing a proxy? Click the button below to request a proxy.</p><Button onClick={() => setRequesting(true)}><Plus />Request a proxy</Button></div>{requesting && <RequestDialog userId={userId} close={() => setRequesting(false)} />}{selectedProxy && <ProxyLinksPanel proxy={selectedProxy} close={() => setSelectedProxy(null)} />}</section>;
}

function ProxyCard({ proxy, onLaunch, controls }: { proxy: ProxyEntry; onLaunch: () => void; controls: ProxyControls }) {
  const preference = controls.preferences[proxy.id] ?? emptyPreference;
  const tone = proxy.status === "working" ? "border-success/30 bg-success/10 text-success" : proxy.status === "partial" ? "border-primary/30 bg-primary/10 text-primary" : "border-destructive/30 bg-destructive/10 text-destructive";
   return <article className="proxy-tile v3-surface flex min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card">{proxy.banner && <img src={proxy.banner} alt={`${proxy.name} website preview`} loading="lazy" className="aspect-video w-full border-b border-border bg-secondary object-cover object-top" />}<div className="flex flex-1 flex-col p-3 sm:p-4"><div className="flex flex-col items-start gap-2"><h2 className="min-h-10 text-sm font-bold leading-5 sm:text-base">{proxy.name}</h2><span className={`rounded-full border px-2 py-0.5 font-mono text-[10px] ${tone}`}>{proxy.status === "working" ? "working" : proxy.status === "partial" ? "partly working" : "proxy down"}</span></div><p className="mt-2 min-h-14 flex-1 text-xs leading-5 text-muted-foreground line-clamp-3">{proxy.description}</p><div className="mt-3 flex items-center gap-1 border-t border-border pt-2">
      <Button size="icon" variant="ghost" aria-label={`Like ${proxy.name}`} title="Like" aria-pressed={preference.vote === "like"} className={preference.vote === "like" ? "text-success bg-success/10" : "text-muted-foreground"} onClick={() => controls.update(proxy.id, "like")}><ThumbsUp /></Button><span className="-ml-1 text-xs tabular-nums text-muted-foreground">{baseline(proxy.id, 3) + (preference.vote === "like" ? 1 : 0)}</span>
      <Button size="icon" variant="ghost" aria-label={`Dislike ${proxy.name}`} title="Dislike" aria-pressed={preference.vote === "dislike"} className={preference.vote === "dislike" ? "text-destructive bg-destructive/10" : "text-muted-foreground"} onClick={() => controls.update(proxy.id, "dislike")}><ThumbsDown /></Button><span className="-ml-1 text-xs tabular-nums text-muted-foreground">{baseline(proxy.id, 7) + (preference.vote === "dislike" ? 1 : 0)}</span>
      <Button size="icon" variant="ghost" aria-label={`Save ${proxy.name}`} title={preference.saved ? "Unsave" : "Save"} aria-pressed={preference.saved} className={`ml-auto ${preference.saved ? "text-primary bg-primary/10" : "text-muted-foreground"}`} onClick={() => controls.update(proxy.id, "save")}><Bookmark className={preference.saved ? "fill-current" : ""} /></Button>
    </div><Button className="mt-2 h-9 w-full text-xs" variant="launch" onClick={onLaunch}>Launch<ExternalLink /></Button></div></article>;
}

function LaunchLink({ url, label }: { url: string; label: string }) {
  return <span className="group relative inline-flex shrink-0">
    <Button asChild variant="launch" size="sm"><a href={url} target="_blank" rel="noopener noreferrer" aria-label={`Launch ${label}`} title={url}>Launch<ExternalLink /></a></Button>
    <span role="tooltip" className="pointer-events-none absolute right-0 bottom-full z-10 mb-2 hidden w-max max-w-[min(22rem,75vw)] break-all rounded-md border border-border bg-popover p-3 font-mono text-xs text-popover-foreground shadow-lg group-hover:block group-focus-within:block">{url}</span>
  </span>;
}

function ProxyLinksPanel({ proxy, close }: { proxy: ProxyEntry; close: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key !== "Tab") return;
      const dialog = closeRef.current?.closest('[role="dialog"]');
      const targets = dialog?.querySelectorAll<HTMLElement>('button, a[href]');
      const first = targets?.[0];
      const last = targets?.[targets.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", handleKey);
    return () => { document.body.style.overflow = overflow; document.removeEventListener("keydown", handleKey); if (previous instanceof HTMLElement) previous.focus(); };
  }, [close]);
  return <div className="fixed inset-0 z-50 grid place-items-center bg-background/85 p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="proxy-links-title" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
    <div className="v3-surface max-h-[85vh] w-full max-w-2xl overflow-auto rounded-lg border border-border bg-card shadow-2xl">
      <div className="sticky top-0 z-20 flex items-start justify-between gap-4 border-b border-border bg-card/95 p-5 backdrop-blur"><div><p className="section-label">AVAILABLE LINKS</p><h2 id="proxy-links-title" className="mt-1 text-xl font-semibold">{proxy.name}</h2></div><Button ref={closeRef} size="icon" variant="ghost" aria-label="Close links" title="Close" onClick={close}><X /></Button></div>
      <ul className="divide-y divide-border px-5 pb-5 pt-12">{proxy.links.map((link, index) => <li key={`${link.url}-${index}`} className="flex items-center justify-between gap-3 py-4"><div className="min-w-0"><p className="text-sm font-medium">{link.label}</p><p className="mt-1 text-xs text-muted-foreground">{link.note}</p></div><LaunchLink url={link.url} label={`${proxy.name} ${link.label}`} /></li>)}</ul>
    </div>
  </div>;
}

function YouPanel({ profile, draftName, setDraftName, saveProfile, saved, theme, setTheme, cloak, setCloak, signOut, controls, custom, reloadCustom }: { profile: { display_name: string; created_at: string; persona: string }; draftName: string; setDraftName: (value: string) => void; saveProfile: () => void; saved: boolean; theme: "dark" | "light"; setTheme: (value: "dark" | "light") => void; cloak: boolean; setCloak: (value: boolean) => void; signOut: () => void; controls: ProxyControls; custom: ProxyEntry[]; reloadCustom: () => Promise<void> }) {
  const [selectedProxy, setSelectedProxy] = useState<ProxyEntry | null>(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const bookmarked = [...proxyLibrary, ...custom].filter((p) => controls.preferences[p.id]?.saved);
  const joined = profile.created_at ? new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(new Date(profile.created_at)) : "Loading…";
  return <section className="animate-in fade-in duration-500"><div className="mb-10 flex items-end justify-between"><div><p className="section-label">ACCOUNT</p><h1 className="page-title">You</h1></div><Button variant="ghost" size="sm" onClick={signOut}><LogOut />Sign out</Button></div><div className="grid gap-5 lg:grid-cols-2"><div className="rounded-lg border border-border v3-surface bg-card p-6"><div className="mb-8 flex items-center gap-4"><span className="grid size-14 place-items-center overflow-hidden rounded-md border border-border bg-secondary"><img src={dogeMark} alt="Avatar" className="h-full w-full object-contain" /></span><div><h2 className="font-semibold">{profile.display_name || "member"}</h2><p className="text-sm text-muted-foreground">Joined {joined}{profile.persona ? ` · ${profile.persona}` : ""}</p></div></div><label className="text-xs font-medium text-muted-foreground">Display name</label><div className="mt-2 flex gap-2"><Input value={draftName} onChange={(event) => setDraftName(event.target.value)} maxLength={40} /><Button onClick={saveProfile}>{saved ? <Check /> : "Save"}</Button></div><div className="mt-6 flex items-center justify-between border-t border-border pt-5"><div><p className="text-sm font-medium">Full access member</p><p className="text-xs text-muted-foreground">Every directory and tool is unlocked.</p></div><ShieldCheck className="text-primary" /></div></div><div className="rounded-lg border border-border v3-surface bg-card p-6"><h2 className="font-semibold">Preferences</h2><div className="mt-6 divide-y divide-border"><Preference icon={theme === "dark" ? Moon : Sun} title="Appearance" description={`${theme === "dark" ? "Dark" : "Light"} mode`} control={<Switch checked={theme === "light"} onCheckedChange={(value) => setTheme(value ? "light" : "dark")} />} /><Preference icon={ShieldCheck} title="Google Cloak" description="Disguise this browser tab" control={<Switch checked={cloak} onCheckedChange={setCloak} />} /></div></div><div className="rounded-lg border border-border v3-surface bg-card p-6 lg:col-span-2"><div className="flex items-center justify-between"><div><h2 className="font-semibold">My Bookmarked Proxies</h2><p className="mt-1 text-sm text-muted-foreground">Proxies you save appear here.</p></div><Bookmark className="text-muted-foreground" /></div>{bookmarked.length ? <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{bookmarked.map((p) => <ProxyCard key={p.id} proxy={p} controls={controls} onLaunch={() => setSelectedProxy(p)} />)}</div> : <div className="mt-6 grid min-h-28 place-items-center rounded-md border border-dashed border-border text-sm text-muted-foreground">No bookmarked proxies yet</div>}</div></div>{selectedProxy && <ProxyLinksPanel proxy={selectedProxy} close={() => setSelectedProxy(null)} />}<button type="button" aria-label="Admin" onClick={() => setAdminOpen(true)} className="fixed bottom-2 left-2 z-30 rounded p-1.5 text-foreground opacity-[0.12] transition-opacity hover:opacity-60 focus-visible:opacity-80"><KeyRound className="size-3.5" /></button>{adminOpen && <AdminPanel close={() => setAdminOpen(false)} custom={custom} reloadCustom={reloadCustom} />}</section>;
}

function OnboardingOverlay({ theme, finish }: { theme: "dark" | "light"; finish: (persona: string, theme: "dark" | "light") => void }) {
  const [step, setStep] = useState(0); const [persona, setPersona] = useState(""); const [pick, setPick] = useState<"dark" | "light">(theme);
  return <div className="fixed inset-0 z-50 grid place-items-center bg-background/95 p-5 backdrop-blur-md"><div className="v3-surface w-full max-w-lg rounded-lg border border-border bg-card p-8"><div className="mb-5 flex items-center gap-3"><img src={dogeMark} alt="Proxy Hub" className="size-12 object-contain" /><div><p className="section-label">WELCOME</p><h2 className="text-xl font-semibold">Proxy Hub</h2></div></div>{step === 0 ? <><h3 className="mt-6 text-2xl font-semibold">Who are you?</h3><p className="mt-2 text-sm text-muted-foreground">Choose the description that fits best.</p><div className="mt-6 grid gap-2">{["Student", "Teacher", "Just curious", "Something else"].map((option) => <Button key={option} type="button" variant={persona === option ? "default" : "outline"} className="justify-start" onClick={() => setPersona(option)}>{option}</Button>)}</div><Button className="mt-6 w-full" disabled={!persona} onClick={() => setStep(1)}>Continue</Button></> : <><h3 className="mt-6 text-2xl font-semibold">Choose your appearance</h3><p className="mt-2 text-sm text-muted-foreground">You can change this later from You.</p><div className="mt-6 grid grid-cols-2 gap-3">{(["light", "dark"] as const).map((option) => <Button key={option} type="button" variant={pick === option ? "default" : "outline"} className="h-14 capitalize" onClick={() => setPick(option)}>{option === "light" ? <Sun /> : <Moon />}{option}</Button>)}</div><Button className="mt-6 w-full" onClick={() => finish(persona, pick)}>Enter Proxy Hub</Button></>}</div></div>;
}

function Preference({ icon: Icon, title, description, control }: { icon: typeof Moon; title: string; description: string; control: React.ReactNode }) {
  return <div className="flex items-center gap-3 py-5 first:pt-0 last:pb-0"><Icon className="size-4 text-primary" /><div className="flex-1"><p className="text-sm font-medium">{title}</p><p className="text-xs text-muted-foreground">{description}</p></div>{control}</div>;
}

function Modal({ title, label, close, children }: { title: string; label: string; close: () => void; children: React.ReactNode }) {
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === "Escape") close(); }; document.addEventListener("keydown", k); return () => document.removeEventListener("keydown", k); }, [close]);
  return <div className="fixed inset-0 z-50 grid place-items-center bg-background/85 p-4 backdrop-blur-md" role="dialog" aria-modal="true" onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
    <div className="v3-surface max-h-[88vh] w-full max-w-2xl overflow-auto rounded-lg border border-border bg-card shadow-2xl">
      <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border bg-card/95 p-5 backdrop-blur"><div><p className="section-label">{label}</p><h2 className="mt-1 text-xl font-semibold">{title}</h2></div><Button size="icon" variant="ghost" aria-label="Close" onClick={close}><X /></Button></div>
      <div className="p-5">{children}</div>
    </div>
  </div>;
}

function RequestDialog({ userId, close }: { userId: string; close: () => void }) {
  const [name, setName] = useState(""); const [url, setUrl] = useState(""); const [note, setNote] = useState(""); const [state, setState] = useState<"idle" | "sent" | "error">("idle");
  const submit = async () => {
    if (!userId || !name.trim() || !/^https?:\/\//i.test(url.trim())) { setState("error"); return; }
    const { error } = await supabase.from("proxy_requests").insert({ user_id: userId, name: name.trim(), url: url.trim(), note: note.trim() });
    setState(error ? "error" : "sent");
  };
  return <Modal title="Request a proxy" label="MISSING SOMETHING?" close={close}>{state === "sent" ? <p className="text-sm">Thanks! Your request was sent for review.</p> : <div className="space-y-3"><Input placeholder="Proxy name" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} /><Input placeholder="https://..." value={url} maxLength={500} onChange={(e) => setUrl(e.target.value)} /><textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} rows={3} placeholder="Anything else? (optional)" className="w-full rounded-md border border-input bg-transparent p-3 text-sm" />{state === "error" && <p className="text-xs text-destructive">Add a name and a link starting with http:// or https://.</p>}<Button onClick={submit}><Send />Send request</Button></div>}</Modal>;
}

type RequestRow = { id: string; name: string; url: string; note: string; status: string; created_at: string };
function AdminPanel({ close, custom, reloadCustom }: { close: () => void; custom: ProxyEntry[]; reloadCustom: () => Promise<void> }) {
  const claim = useServerFn(claimAdmin);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [code, setCode] = useState(""); const [error, setError] = useState("");
  const [section, setSection] = useState<"requests" | "new" | "manage" | "messages">("requests");
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [messages, setMessages] = useState<{ id: string; body: string; created_at: string }[]>([]);
  const [form, setForm] = useState({ name: "", description: "", status: "working", links: "" });
  const check = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setIsAdmin(false);
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    setIsAdmin(!!data);
  }, []);
  const load = useCallback(async () => {
    const [r, m] = await Promise.all([
      supabase.from("proxy_requests").select("id,name,url,note,status,created_at").order("created_at", { ascending: false }),
      supabase.from("owner_messages").select("id,body,created_at").order("created_at", { ascending: false }).limit(50),
    ]);
    if (r.data) setRequests(r.data); if (m.data) setMessages(m.data);
  }, []);
  useEffect(() => { void check(); }, [check]);
  useEffect(() => { if (isAdmin) void load(); }, [isAdmin, load]);
  const unlock = async () => { setError(""); const res = await claim({ data: { code } }); if (res.ok) await check(); else setError("Wrong passcode."); };
  const decide = async (r: RequestRow, status: "accepted" | "declined") => {
    if (status === "accepted") await supabase.from("custom_proxies").insert({ name: r.name, description: r.note, links: [r.url] });
    await supabase.from("proxy_requests").update({ status }).eq("id", r.id);
    await Promise.all([load(), reloadCustom()]);
  };
  const createProxy = async () => {
    const links = form.links.split(/\s+/).filter((l) => /^https?:\/\//i.test(l));
    if (!form.name.trim() || !links.length) { setError("Add a name and at least one http(s) link."); return; }
    setError("");
    const { error: e } = await supabase.from("custom_proxies").insert({ name: form.name.trim(), description: form.description.trim(), status: form.status, links });
    if (e) setError(e.message); else { setForm({ name: "", description: "", status: "working", links: "" }); await reloadCustom(); setSection("manage"); }
  };
  const remove = async (id: string) => { await supabase.from("custom_proxies").delete().eq("id", id.replace(/^custom-/, "")); await reloadCustom(); };
  const pending = requests.filter((r) => r.status === "pending");
  if (isAdmin === null) return <Modal title="Developer panel" label="RESTRICTED" close={close}><p className="text-sm text-muted-foreground">Checking access…</p></Modal>;
  if (!isAdmin) return <Modal title="Developer panel" label="RESTRICTED" close={close}><div className="space-y-3"><Input type="password" placeholder="Passcode" value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") void unlock(); }} />{error && <p className="text-xs text-destructive">{error}</p>}<Button onClick={unlock}><KeyRound />Unlock</Button></div></Modal>;
  return <Modal title="Developer panel" label="ADMIN" close={close}>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{[["Proxies", proxyLibrary.length + custom.length], ["Custom", custom.length], ["Pending", pending.length], ["Messages", messages.length]].map(([l, v]) => <div key={l} className="rounded-md border border-border p-3"><p className="text-xs text-muted-foreground">{l}</p><p className="text-xl font-bold">{v}</p></div>)}</div>
    <div className="mt-4 flex flex-wrap gap-1">{([["requests", "Requests", Inbox], ["new", "New proxy", Plus], ["manage", "Manage", Network], ["messages", "Messages", Send]] as const).map(([k, l, I]) => <Button key={k} size="sm" variant={section === k ? "secondary" : "ghost"} onClick={() => setSection(k)}><I />{l}</Button>)}</div>
    <div className="mt-4">
      {section === "requests" && (requests.length ? <ul className="divide-y divide-border">{requests.map((r) => <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div className="min-w-0"><p className="text-sm font-medium">{r.name} <span className="ml-1 font-mono text-[10px] text-muted-foreground">{r.status}</span></p><p className="truncate font-mono text-xs text-muted-foreground">{r.url}</p>{r.note && <p className="text-xs text-muted-foreground">{r.note}</p>}</div>{r.status === "pending" && <div className="flex gap-2"><Button size="sm" variant="launch" onClick={() => decide(r, "accepted")}><Check />Accept</Button><Button size="sm" variant="ghost" onClick={() => decide(r, "declined")}><X />Decline</Button></div>}</li>)}</ul> : <p className="text-sm text-muted-foreground">No requests yet.</p>)}
      {section === "new" && <div className="space-y-3"><Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /><Input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm"><option value="working">Working</option><option value="partial">Partial</option><option value="down">Down</option></select><textarea rows={4} value={form.links} onChange={(e) => setForm({ ...form, links: e.target.value })} placeholder="Links, one per line (first is main)" className="w-full rounded-md border border-input bg-transparent p-3 text-sm" />{error && <p className="text-xs text-destructive">{error}</p>}<Button onClick={createProxy}><Plus />Create proxy</Button></div>}
      {section === "manage" && (custom.length ? <ul className="divide-y divide-border">{custom.map((p) => <li key={p.id} className="flex items-center justify-between gap-3 py-3"><div className="min-w-0"><p className="text-sm font-medium">{p.name}</p><p className="truncate text-xs text-muted-foreground">{p.links.length} link(s)</p></div><Button size="sm" variant="ghost" onClick={() => remove(p.id)}><Trash2 />Delete</Button></li>)}</ul> : <p className="text-sm text-muted-foreground">No custom proxies yet.</p>)}
      {section === "messages" && (messages.length ? <ul className="divide-y divide-border">{messages.map((m) => <li key={m.id} className="py-3 text-sm"><p className="whitespace-pre-wrap">{m.body}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString()}</p></li>)}</ul> : <p className="text-sm text-muted-foreground">No messages.</p>)}
    </div>
  </Modal>;
}
