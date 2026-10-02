import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    throw redirect({ to: data.user ? "/app" : "/auth" });
  },
  head: () => ({
    meta: [
      { title: "The Doge Foundation — open toolkit" },
       { name: "description", content: "Explore an open directory of proxies, bookmarklets, games, and useful tools." },
      { property: "og:title", content: "The Doge Foundation — open toolkit" },
       { property: "og:description", content: "Explore an open directory of proxies, bookmarklets, games, and useful tools." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => null,
});
