# Known Issues & Gaps

A consolidated punch list of things a new contributor should know are
*incomplete* rather than broken. Cross-referenced from other docs.

## Not yet implemented

- **No `/settings`, `/settings/priorities`, `/settings/labels`, or
  `/settings/work-item-types` pages**, even though the sidebar
  (`src/components/app-sidebar.tsx`) links to all of them — these are
  currently dead links (404). Lookup table values (statuses, types,
  priorities, labels) must be managed directly via SQL/Supabase dashboard
  until these pages exist.
- **No assignee support.** The `work_items` table has no assignee column
  (and there's no `users`/`profiles` table to assign from), so the UI does
  not show or set an assignee. Adding this would require a users/members
  table and a way to list assignable users.
- **No work item creation/editing UI.** Work items must currently be
  inserted directly via SQL/Supabase dashboard — the boards only support
  moving existing items between statuses/sprints and creating sprints.
- **Email confirmation required for new accounts.** Supabase's
  `mailer_autoconfirm` is off for this project, so after signing up at
  `/signup` a user must click the confirmation link emailed to them before
  `/login` will work.
- **No test suite** — no Jest/Vitest/Playwright, no test files, no `test`
  script in `package.json`.

## Inconsistencies to reconcile

- **`next-themes` dependency is unused for its intended purpose.** The root
  layout (`src/app/layout.tsx`) hardcodes dark mode
  (`className="dark"`, `style={{ colorScheme: "dark" }}`) instead of using
  `next-themes` for a light/dark toggle.
- **Client boards don't re-sync with server state after a successful
  mutation.** `SprintBoard` and `BacklogsBoard` seed local state once from
  server-fetched props and then manage it optimistically; `revalidatePath`
  refreshes the Server Component's data on next navigation, but a
  same-session board won't pick up changes made by other users/tabs without
  a manual refresh.

## Gotchas (documented in code, easy to miss)

- `src/lib/supabase/proxy.ts`: never add logic between
  `createServerClient(...)` and `await supabase.auth.getUser()` — doing so
  risks users being randomly logged out. Also, always return the
  `supabaseResponse` object as-is from `updateSession()` so cookies stay in
  sync — constructing a new `NextResponse` at the end will break auth.
- Next.js 16 renamed **Middleware** to **Proxy**. If you're looking for
  `middleware.ts`, it's [`src/proxy.ts`](../src/proxy.ts). Per
  [`AGENTS.md`](../AGENTS.md), consult `node_modules/next/dist/docs/` before
  writing Next.js code in this repo, since other APIs/conventions may also
  differ from what you'd expect based on prior Next.js knowledge.
- Tailwind v4 uses **CSS-first config** — there is no `tailwind.config.js`.
  Design tokens and Tailwind setup live in `src/app/globals.css`.
- Row Level Security allows anonymous **reads** on all board tables but
  blocks anonymous **writes** — drag-and-drop and "Create sprint" will fail
  with a toast error if you're not signed in.

## Suggested next steps (not yet scheduled/assigned)

1. Build `/settings/*` pages for managing statuses, types, priorities, and
   labels instead of editing them via SQL.
2. Build work item creation/editing UI (currently insert-only via SQL).
3. Design and add assignee support (users/members table, RLS policies,
   UI for picking an assignee).
4. Decide whether to keep `next-themes` (and build a theme toggle) or
   remove the dependency if dark-mode-only is a permanent choice.
5. Introduce a test framework (e.g. Vitest + React Testing Library, and/or
   Playwright for e2e) to catch regressions in drag-and-drop and data
   mutations automatically.
