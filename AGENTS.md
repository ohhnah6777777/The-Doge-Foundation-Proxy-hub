<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep proxy directory records and optional CDN banner references in `src/lib/proxy-data.ts`; this centralizes entry order, links, and imagery without fetching third-party logos at runtime.
- Keep the authenticated directory and its panels in `src/components/app/doge-foundation-app.tsx`; shared account state and panel switching stay together.
- Keep large user-supplied bookmarklets as inert text imported with `?raw`; the app copies them without running third-party code in its own origin.

- Scope framed charcoal surfaces with `v3-surface` in the global stylesheet; local semantic tokens keep text and controls legible against the contrasting page field in both themes.
- Keep proxy reactions in account-scoped browser storage and share them through the directory's parent state; Home and Proxy must show identical selections without changing backend permissions.
