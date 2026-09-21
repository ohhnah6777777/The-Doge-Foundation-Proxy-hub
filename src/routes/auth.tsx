import { createFileRoute, redirect } from "@tanstack/react-router";
import { AuthScreen } from "@/components/app/auth-screen";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: "/app" });
  },
  head: () => ({ meta: [
    { title: "Sign in — The Doge Foundation" },
    { name: "description", content: "Sign in or create your account for The Doge Foundation." },
    { property: "og:title", content: "Sign in — The Doge Foundation" },
    { property: "og:description", content: "Sign in or create your account for The Doge Foundation." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: AuthScreen,
});