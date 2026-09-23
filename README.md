# The Doge Foundation

Create a highly polished, premium, and ultra-modern web application named "scoolhackas" (keep the name strictly lowercase everywhere) using React, Tailwind CSS, and shadcn/ui. The application must feature built-in authentication and user account management using Supabase or the Lovable native backend.

# Visual & Aesthetic Direction

- Style: Ultra-minimalist, sleek, modern SaaS interface (similar to Vercel, Linear, or Stripe).

- Theme: Dual theme support. Set a clean dark mode by default featuring deep slate and charcoal background colors (#0B0F19 to #030712) paired with crisp white typography and subtle gray borders. 

- Elements: Flat, crisp borders, subtle backdrop blurs, fluid micro-animations, and sharp iconography using Lucide icons.

- Default Favicon: Design a custom favicon for the site using a clean, lowercase stylized "sh" or code-bracket logo.

# Layout & Navigation

Create an app shell with a sticky top navigation bar containing:

1. Logo: "scoolhackas" in a bold, geometric, clean sans-serif lowercase typeface.

2. Main Navigation Items (Strictly empty dashboards - DO NOT add any hacks, buttons, or links here):

- Home: The primary dashboard landing page displaying the user's progress.

- Hacks: A clean, empty panel layout framework with a minimalist text label: "No hacks unlocked for your current rank yet." Do not generate any placeholder hacks, text scripts, or buttons here.

- Proxy: A clean, empty panel layout framework with a minimalist text label: "Proxy panel utilities." Do not generate any proxy frames, inputs, or placeholder URLs here.

- Other hacka stuff: A structured, completely empty layout grid ready for the creator to add miscellaneous student tools later.

- You: The personal dashboard section for the logged-in user (Fully implemented).

# Core System 1: Gamified Rank & Level-Up System

Create a global state system tracking Level, Experience Points (XP), and Hacka Rank. Store this data in localStorage so progress persists. Implement these 6 specific ranks with gated permissions:

1. Beginner hacka: (Levels 1-5). Can only access the basic profile dashboard. No website hacks or proxy access.

2. Intermediate hacka: (Levels 6-12). Unlocks access to cloak panels, utility tool panels, and all Beginner tier features.

3. Pro hacka: (Levels 13-20). Unlocks access to half of the network proxies, 25% of unblocked game sites, basic Blooket scripts, and everything below.

4. Alpha hacka: (Levels 21-30). Unlocks access to basic Blooket hacks, selection of Kahoot scripts, and everything below.

5. Omega hacka: (Levels 31-45). Unlocks access to 75% of unblocked game sites, full access to Kahoot/Blooket suites, 75% of proxies, and everything below.

6. The Hacka: (Levels 46+). Unlocks 100% total access to all public hacks, and reveals a special "Contact Owner" messaging interface. (Secret hacks remain locked).

# Core System 2: Dynamic Home Dashboard & Quest Engine

The 'Home' navigation tab should serve as the central hub:

- Progress Interface: Displays a beautiful progress bar showing current level, numeric XP (e.g., 250 / 500 XP), and a premium badge indicating the active Hacka Rank.

- Daily/Rank Quests Dashboard: Create a list of interactive quests that grant XP upon completion:

  * Quest 1 (Beginner): "Create your first hack bookmarklet". Includes a "Go" button routing them to the Home panel view. Clicking completes it and rewards 100 XP.

  * Quest 2 (Pro): "Hack your first Blooket game". Includes a "Go" button linking to an external blank window mockup. Since background checking isn't native, clicking the button starts an elegant visual 2-minute loading countdown timer ("Hacking game network..."). Once the 2 minutes expire, a "Claim Reward" button appears to grant 300 XP.

  * Populate other mock quests appropriate for intermediate, alpha, and omega levels (e.g., "Deploy your first cloak panel", "Initialize a proxy handshake") utilizing similar interactive button and timer frameworks.

# Core System 3: User Dashboard ("You" Page) & Tab Cloak

- User Profile Dashboard: A space where logged-in users manage their profile, view their registration date, update their display name, and see a card for "My Bookmarked Hacks".

- Mode Toggle: Includes a button to switch between Light Mode and Dark Mode.

- Google Tab Cloak Feature:

  * Add a functional toggle switch labeled "Enable Google Cloak".

  * When turned ON, use JavaScript (`document.title` and a dynamic favicon link injection) to instantly rename the browser tab to "Google" (capitalized normally) and replace the website's tab icon with the official Google favicon (`https://google.com`).

  * When turned OFF, instantly revert the tab title back to "scoolhackas" (lowercase) and restore the original site favicon.

# Guidelines

- Keep the interface incredibly clean, avoiding cluttered hacker clichés or flashy neon colors. Focus on perfect alignment, padding, and premium typography.

- Keep the brand name "scoolhackas" strictly all lower case across text, titles, and menus.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://the-doge-foundation.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b706f2d7-8333-40f0-a541-635e914a7f3c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
