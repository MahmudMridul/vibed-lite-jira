# Operational Knowledge

## Environments

| Environment | How it runs | Notes |
|---|---|---|
| Local dev | `npm run dev` on `localhost:3000` | Uses whatever Supabase project is configured in `.env.local` — typically a personal/dev Supabase project, not shared prod data |
| Preview (Vercel) | Automatic per-branch/PR deploy | Uses env vars configured in Vercel project settings; currently the same two `NEXT_PUBLIC_SUPABASE_*` vars — there is no environment-specific override documented, so confirm whether preview deploys point at a dev or prod Supabase project before testing writes there |
| Production (Vercel) | Deploy from the production branch | Same env var set. The app now reads and writes real board data, so treat production Supabase data with the same care as any other production database — e.g. don't run ad hoc destructive SQL against it |

Because only two env vars exist and both are `NEXT_PUBLIC_*` (exposed to the
browser), there are currently no server-only secrets to manage. Reads and
writes both go through the anon key, gated by Row Level Security (RLS) —
anonymous reads are allowed, writes require an authenticated user session.
If privileged server-only operations are added later (e.g. an admin
action bypassing RLS), they would need a `SUPABASE_SERVICE_ROLE_KEY`
(server-only, never `NEXT_PUBLIC_*`), which must never be exposed to the
client.

## Logging / monitoring

- No application logging, error tracking (e.g. Sentry), or monitoring
  integration exists in the codebase today.
- For deployment-level issues, use the Vercel dashboard (build logs,
  function logs, deployment history).
- For auth issues, check the Supabase dashboard's Auth logs.
- For data issues, check the Supabase dashboard's Table Editor / Logs
  (e.g. to see if an insert/update from a Server Action actually landed, or
  was blocked by RLS).
- When something breaks in local dev, the browser console and terminal
  running `npm run dev` are the only sources of truth right now. Server
  Action errors are returned to the client as `{ error: string }` and
  surfaced via toast (sonner) rather than thrown, so check the toast message
  first.

## Known issues, tech debt, and gotchas

See [08-known-issues.md](./08-known-issues.md) for the full list. Highlights
that are most likely to trip up a new contributor:

1. **No UI for creating/editing work items or lookup table values.** The
   boards only support moving existing work items (status/sprint) and
   creating empty sprints. Work items, statuses, types, priorities, and
   labels must be managed directly via SQL/Supabase dashboard until
   `/settings/*` and a work-item editor are built.
2. **Writes require sign-in.** RLS allows anonymous reads but blocks
   anonymous writes. If drag-and-drop or "Create sprint" silently fail with
   a toast error, check whether you're signed in at `/login`.
3. **Dead sidebar links.** The sidebar links to `/settings`,
   `/settings/priorities`, `/settings/labels`, and `/settings/work-item-types`,
   none of which have page files yet — clicking them 404s.
4. **`next-themes` is installed but unused for its purpose.** The root
   layout hardcodes `className="dark"` and `colorScheme: "dark"` rather than
   using `next-themes` to support a light/dark toggle.
5. **New accounts require email confirmation** before they can sign in
   (Supabase `mailer_autoconfirm` is off for this project).
6. **Auth proxy gotcha (intentional, documented in code):** in
   `src/lib/supabase/proxy.ts`, do not add any logic between
   `createServerClient(...)` and `await supabase.auth.getUser()` — a stray
   side effect there can cause users to be randomly logged out. Also, the
   final `supabaseResponse` must be returned as-is (not a new
   `NextResponse`) or cookie sync breaks.
7. **No test suite.** Correctness today is verified by `npm run build`,
   ESLint, and manual browser testing — there's no regression safety net
   from automated tests.
