import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

// No head() here: the home route inherits title/description/og/twitter from
// __root.tsx, and ships no og:image so serve-time hosting can inject the
// project's social preview (explicit og:image or latest screenshot).
export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    throw redirect({ to: data.user ? "/app" : "/auth" });
  },
  head: () => ({
    meta: [
      { title: "scoolhackas — progress console" },
      { name: "description", content: "A focused dashboard for quests, rank progress, and personal utilities." },
      { property: "og:title", content: "scoolhackas — progress console" },
      { property: "og:description", content: "A focused dashboard for quests, rank progress, and personal utilities." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => null,
});
