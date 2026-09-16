import { createFileRoute, redirect } from "@tanstack/react-router";
import { AuthScreen } from "@/components/app/auth-screen";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: "/app" });
  },
  head: () => ({ meta: [
    { title: "sign in — scoolhackas" },
    { name: "description", content: "Sign in or create your scoolhackas account." },
    { property: "og:title", content: "sign in — scoolhackas" },
    { property: "og:description", content: "Sign in or create your scoolhackas account." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: AuthScreen,
});