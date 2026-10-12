import { createFileRoute } from "@tanstack/react-router";
import { DogeFoundationApp } from "@/components/app/doge-foundation-app";

export const Route = createFileRoute("/_authenticated/app")({
  head: () => ({ meta: [
    { title: "Directory — Proxy Hub" },
     { name: "description", content: "Browse proxies, alternate links, and saved favorites." },
    { property: "og:title", content: "Directory — Proxy Hub" },
     { property: "og:description", content: "Browse proxies, alternate links, and saved favorites." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: DogeFoundationApp,
});