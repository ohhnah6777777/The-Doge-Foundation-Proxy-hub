# The Doge Foundation revamp

## Overview
Rebrand the authenticated app and sign-in experience as **The Doge Foundation**, replace the current blue/slate styling with a warm light-brown gradient system, use the supplied Doge image as the brand mark and favicon, expand the proxy directory with every supplied link, and remove rank/admin gating so every signed-in user can use all existing content.

## What will change
- Replace all visible `scoolhackas` branding and page metadata with “The Doge Foundation.”
- Put the Doge icon and project title at the top-left as a non-clickable brand title.
- Derive a compact favicon from the supplied Doge image and use the same image in the app and sign-in screen.
- Replace the dark blue theme with a polished warm light-brown to deeper light-brown gradient theme, while keeping light/dark appearance controls coherent.
- Remove XP, levels, ranks, level-up messages, rank badges, rank-specific quest restrictions, developer mode, and the complete admin panel UI.
- Make Proxy, Contact owner, every hack category, and every existing quest immediately accessible.
- Rework Home into an open activity dashboard with trending items and quest cards that no longer award XP or depend on tiers.
- Add all supplied full proxy entries with icons, concise descriptions, status labels, main links, and alternates.
- Add the supplied quick links in a separate compact “Quick links” section, including the expanded group.
- Keep account preferences, Google Cloak, profile editing, sign out, messaging, bookmarklet copy buttons, quest launch links, and refresh behavior.

## Technical details
- Rebuild the oversized app module around open-access content, removing the currently broken admin markup and unused admin imports/state.
- Store the uploaded Doge image through the project asset flow; create a resized real favicon in `public/`.
- Update semantic color tokens in the global stylesheet rather than hardcoding theme colors in page markup.
- Update route-level title, description, Open Graph, and Twitter metadata for each content route.
- Preserve all supplied URLs exactly, including HTTP links, duplicate alternates, and direct SVG/CDN targets.
- Verify the sign-in page and authenticated app at desktop and mobile widths, including link-card layout, no overlap, and a clean build.
