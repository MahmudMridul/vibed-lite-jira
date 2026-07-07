# Operational Knowledge

## Environments

| Environment | How it runs | Notes |
|---|---|---|
| Local dev | `npm run dev` on `localhost:3000` | Uses whatever Supabase project is configured in `.env.local` — typically a personal/dev Supabase project, not shared prod data |
| Preview (Vercel) | Automatic per-branch/PR deploy | Uses env vars configured in Vercel project settings; currently the same two `NEXT_PUBLIC_SUPABASE_*` vars — there is no environment-specific override documented, so confirm whether preview deploys point at a dev or prod Supabase project before testing destructive actions there |
| Production (Vercel) | Deploy from the production branch | Same env var set; since the app doesn't yet persist board data, "production" risk today is limited to the auth flow |

Because only two env vars exist and both are `NEXT_PUBLIC_*` (exposed to the
browser), there are currently no server-only secrets to manage. This will
change once persistence/service-role operations are added — at that point,
a `SUPABASE_SERVICE_ROLE_KEY` (server-only, never `NEXT_PUBLIC_*`) will
likely be needed for privileged operations, and it must never be exposed to
the client.

## Logging / monitoring

- No application logging, error tracking (e.g. Sentry), or monitoring
  integration exists in the codebase today.
- For deployment-level issues, use the Vercel dashboard (build logs,
  function logs, deployment history).
- For auth issues, check the Supabase dashboard's Auth logs.
- When something breaks in local dev, the browser console and terminal
  running `npm run dev` are the only sources of truth right now.

## Known issues, tech debt, and gotchas

See [08-known-issues.md](./08-known-issues.md) for the full list. Highlights
that are most likely to trip up a new contributor:

1. **The UI is not connected to the database.** Everything on `/` and
   `/backlogs` operates on mock data in `src/lib/mock-sprint-data.ts`.
   Drag-and-drop and "Create sprint" only mutate local component state and
   reset on page reload. Don't assume data you create in the UI persists.
2. **Schema drift between `db.sql` and `db_schema.sql`.** `db_schema.sql`
   (a Supabase export) has a `current_sprint` column on `sprints` that
   `db.sql` (the hand-authored source) lacks, is missing the `work_items`
   table definition entirely, and has a duplicated `work_item_links` block.
   Treat `db.sql` as the intended design and `db_schema.sql` as a
   point-in-time dump that needs reconciling — don't copy-paste from
   `db_schema.sql` without checking against `db.sql` first.
3. **Dead sidebar links.** The sidebar links to `/settings`,
   `/settings/priorities`, `/settings/labels`, and `/settings/work-item-types`,
   none of which have page files yet — clicking them 404s.
4. **`next-themes` is installed but unused for its purpose.** The root
   layout hardcodes `className="dark"` and `colorScheme: "dark"` rather than
   using `next-themes` to support a light/dark toggle.
5. **No `/login` page**, despite the auth proxy redirecting unauthenticated
   users there for protected routes.
6. **Auth proxy gotcha (intentional, documented in code):** in
   `src/lib/supabase/proxy.ts`, do not add any logic between
   `createServerClient(...)` and `await supabase.auth.getUser()` — a stray
   side effect there can cause users to be randomly logged out. Also, the
   final `supabaseResponse` must be returned as-is (not a new
   `NextResponse`) or cookie sync breaks.
7. **No test suite.** Correctness today is verified by `npm run build`,
   ESLint, and manual browser testing — there's no regression safety net
   from automated tests.
