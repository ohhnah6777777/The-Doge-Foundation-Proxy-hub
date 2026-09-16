import { createFileRoute } from "@tanstack/react-router";
import { ScoolhackasApp } from "@/components/app/scoolhackas-app";

export const Route = createFileRoute("/_authenticated/app")({
  head: () => ({ meta: [
    { title: "dashboard — scoolhackas" },
    { name: "description", content: "Track your scoolhackas rank, XP, quests, and personal tools." },
    { property: "og:title", content: "dashboard — scoolhackas" },
    { property: "og:description", content: "Track your scoolhackas rank, XP, quests, and personal tools." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: ScoolhackasApp,
});