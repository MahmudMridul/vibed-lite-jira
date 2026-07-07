# Getting Started

Following these steps should get you running locally in well under 30
minutes.

## Prerequisites

- **Node.js** (a version compatible with Next.js 16 / React 19 — Node 20 LTS
  or newer is recommended)
- **npm** (repo ships a `package-lock.json`; use npm rather than
  yarn/pnpm to avoid a mismatched lockfile)
- A **Supabase** account and project (free tier is fine) — needed for auth.
  Create one at [supabase.com](https://supabase.com) if you don't have one.
- Git access to the repo: `github.com:MahmudMridul/vibed-lite-jira`

## 1. Clone and install

```bash
git clone git@github.com:MahmudMridul/vibed-lite-jira.git
cd vibed-lite-jira
npm install
```

## 2. Configure environment variables

Copy the example env file:

```bash
cp .env.example .env.local
```

Fill in your Supabase project's URL and anon key (find them in the Supabase
dashboard under **Project Settings → API**):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

These are the **only two environment variables** the app currently uses
(referenced in `src/lib/supabase/client.ts`, `server.ts`, and `proxy.ts`).
`.env.local` is gitignored — never commit it.

## 3. Set up the database schema and seed data

The app reads/writes these tables directly, so they must exist and have
seed data before the boards are usable:

1. Run [`docs/db_schema.sql`](./db_schema.sql) in your Supabase project's
   SQL editor to create the tables (skip if you're using a Supabase project
   that already has this schema, e.g. one shared with a teammate).
2. Run [`docs/seed.sql`](./seed.sql) to populate `statuses`, `types`, and
   `priorities` with default values (To Do/In Progress/Done, Task/Bug/Story,
   Low/Medium/High/Urgent). Safe to re-run.
3. (Optional) Insert a sprint and a few work items via the Supabase table
   editor or SQL — there is no UI yet for creating work items or sprints
   with real data other than empty sprints (see
   [08-known-issues.md](./08-known-issues.md)).

## 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 5. Create an account and sign in

Row Level Security allows anonymous **reads** but requires an authenticated
session for **writes** (status changes, sprint reassignment, creating a
sprint). To exercise those:

1. Go to `/signup` and create an account.
2. Supabase requires email confirmation for new accounts — check your inbox
   for the confirmation link before continuing.
3. Go to `/login` and sign in.

## 6. Verify it worked

- The **Active Sprint** board should load at `/` with a column per row in
  `statuses`. If you seeded data but see no columns, double-check
  `docs/seed.sql` ran successfully.
- Navigate to **Backlogs** (`/backlogs`) via the sidebar. You should see one
  section per sprint plus a trailing "Backlog" section for work items with
  no `sprint_id`.
- While signed in, drag a work item card between columns/sections — it
  should update immediately and persist across a page reload (confirms the
  Server Action write succeeded). While signed out, the same action should
  show an error toast (RLS blocking the anonymous write) rather than
  silently succeeding.
- Click "Create sprint" while signed in — the new sprint should appear and
  persist on reload.

## Common setup errors

| Symptom | Cause | Fix |
|---|---|---|
| Blank page / Supabase client throws at startup | Missing or malformed `.env.local` | Ensure both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set and the dev server was restarted after editing `.env.local` (Next.js only reads env files at boot). |
| Boards load with no columns / no sprints | Lookup tables or sprints are empty | Run [`docs/seed.sql`](./seed.sql) and insert at least one sprint/work item. |
| Drag-and-drop or "Create sprint" fails with a toast error | Not signed in, or RLS blocking the write | Sign in at `/login`. If already signed in and it still fails, check the Supabase project's RLS policies on the affected table. |
| Signed up but can't sign in | Email not confirmed yet | Check your inbox for the Supabase confirmation email and click the link before signing in. |
| `npm install` produces a different lockfile / peer dep warnings | Using yarn/pnpm instead of npm | Stick to `npm` for this repo. |
| Styles look unstyled / Tailwind classes have no effect | Editing `tailwind.config.js` expecting v3 behavior | This project uses **Tailwind v4's CSS-first config** — there is no `tailwind.config.js`. Config/tokens live in `src/app/globals.css`. |
| Confusion about "middleware" not running | Looking for `middleware.ts` | Next.js 16 renamed Middleware to **Proxy**. The equivalent file is `src/proxy.ts`. See [05-workflows.md](./05-workflows.md). |
