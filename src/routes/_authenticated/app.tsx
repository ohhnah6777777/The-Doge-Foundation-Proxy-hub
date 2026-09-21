import { createFileRoute } from "@tanstack/react-router";
import { DogeFoundationApp } from "@/components/app/doge-foundation-app";

export const Route = createFileRoute("/_authenticated/app")({
  head: () => ({ meta: [
    { title: "Directory — The Doge Foundation" },
    { name: "description", content: "Browse open proxies, bookmarklets, game routes, quests, and personal tools." },
    { property: "og:title", content: "Directory — The Doge Foundation" },
    { property: "og:description", content: "Browse open proxies, bookmarklets, game routes, quests, and personal tools." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: DogeFoundationApp,
});