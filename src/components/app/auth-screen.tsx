import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Chrome, LoaderCircle, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import dogeMark from "@/assets/doge-foundation-mark.png";

export function AuthScreen() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
      else await navigate({ to: "/app" });
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin, data: { display_name: displayName } },
      });
      if (error) setMessage(error.message);
      else if (!data.session) setMessage("Check your email to confirm your account.");
      else await navigate({ to: "/app" });
    }
    setBusy(false);
  }

  async function googleSignIn() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) setMessage(result.error.message);
    else if (!result.redirected) await navigate({ to: "/app" });
    setBusy(false);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="auth-grid absolute inset-0" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center px-5 py-10 sm:px-8">
        <section className="grid w-full gap-14 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
          <div className="max-w-2xl">
            <div className="mb-10 flex items-center gap-3 font-display text-lg font-semibold tracking-normal">
              <span className="grid size-10 place-items-center overflow-hidden rounded-md border border-border bg-secondary"><img src={dogeMark} alt="Doge" className="h-full w-full object-contain" /></span>
              The Doge Foundation
            </div>
            <p className="mb-5 font-mono text-xs uppercase text-primary">open directory / v2.0</p>
            <h1 className="max-w-xl font-display text-5xl font-semibold leading-[1.02] tracking-normal sm:text-7xl">
              The open toolkit for curious minds.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">
              Explore the complete collection of proxies, bookmarklets, game routes, quests, and useful tools.
            </p>
            <div className="mt-10 flex items-center gap-3 text-sm text-muted-foreground">
              <LockKeyhole className="size-4 text-success" /> Your account data stays private.
            </div>
          </div>

          <div className="w-full max-w-md justify-self-end rounded-lg border border-border bg-card/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
            <div className="mb-7">
              <p className="font-mono text-xs text-muted-foreground">SECURE ACCESS</p>
              <h2 className="mt-2 text-2xl font-semibold">{mode === "signin" ? "Welcome back" : "Create your account"}</h2>
               <p className="mt-2 text-sm text-muted-foreground">{mode === "signin" ? "Sign in to open your personal directory." : "Create an account with complete access from day one."}</p>
            </div>
            <Button variant="outline" className="h-11 w-full" onClick={googleSignIn} disabled={busy}>
              <Chrome /> Continue with Google
            </Button>
            <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or continue with email<span className="h-px flex-1 bg-border" /></div>
            <form onSubmit={submit} className="space-y-4">
              {mode === "signup" && <Input aria-label="Display name" placeholder="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />}
              <Input aria-label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Input aria-label="Password" type="password" placeholder="Password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
              {message && <p className="rounded-md border border-border bg-secondary px-3 py-2 text-sm text-muted-foreground">{message}</p>}
              <Button className="h-11 w-full" disabled={busy}>
                {busy ? <LoaderCircle className="animate-spin" /> : <>{mode === "signin" ? "Sign in" : "Create account"}<ArrowRight /></>}
              </Button>
            </form>
            <button className="mt-6 w-full text-center text-sm text-muted-foreground transition-colors hover:text-foreground" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setMessage(""); }}>
              {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
