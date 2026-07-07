# Known Issues & Gaps

A consolidated punch list of things a new contributor should know are
*incomplete* rather than broken. Cross-referenced from other docs.

## Not yet implemented

- **No persistence for board/backlog data.** `/` and `/backlogs` operate
  entirely on mock data (`src/lib/mock-sprint-data.ts`). Drag-and-drop
  status/sprint changes and "Create sprint" only update local React state
  and are lost on reload. No Supabase queries or mutations exist for
  `work_items`, `sprints`, `statuses`, `types`, `priorities`, or `labels`.
- **No `/login`, `/signup`, or `/auth` pages**, even though
  `src/lib/supabase/proxy.ts` treats them as public routes and redirects
  unauthenticated users to `/login` for any non-public route.
- **No `/settings`, `/settings/priorities`, `/settings/labels`, or
  `/settings/work-item-types` pages**, even though the sidebar
  (`src/components/app-sidebar.tsx`) links to all of them — these are
  currently dead links (404).
- **No API routes or Server Actions** anywhere in the app.
- **No test suite** — no Jest/Vitest/Playwright, no test files, no `test`
  script in `package.json`.

## Inconsistencies to reconcile

- **`db.sql` vs `db_schema.sql` drift** — see
  [ADR-3 in 07-decisions-log.md](./07-decisions-log.md):
  - `current_sprint` boolean column on `sprints` exists only in
    `db_schema.sql`.
  - `work_items` table definition is missing entirely from `db_schema.sql`.
  - `work_item_links` is defined twice (duplicate block) in `db_schema.sql`.
- **`next-themes` dependency is unused for its intended purpose.** The root
  layout (`src/app/layout.tsx`) hardcodes dark mode
  (`className="dark"`, `style={{ colorScheme: "dark" }}`) instead of using
  `next-themes` for a light/dark toggle.

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

## Suggested next steps (not yet scheduled/assigned)

1. Wire up Supabase queries/Server Actions for `work_items` and `sprints`
   to replace the mock data layer.
2. Reconcile `db.sql` and `db_schema.sql` into a single source of truth
   (or move to Supabase CLI-managed migrations).
3. Build `/login`, `/signup`, and the `/settings/*` pages referenced by
   existing navigation/redirect logic.
4. Decide whether to keep `next-themes` (and build a theme toggle) or
   remove the dependency if dark-mode-only is a permanent choice.
5. Introduce a test framework (e.g. Vitest + React Testing Library, and/or
   Playwright for e2e) before persistence logic is added, so regressions in
   drag-and-drop and data mutations are caught automatically.
