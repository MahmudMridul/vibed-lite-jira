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

## 3. (Optional) Set up the database schema

The app's board/backlog UI does not read from Supabase yet (see
[08-known-issues.md](./08-known-issues.md)), so this step is only required
if you're working on wiring up persistence or need auth tables to exist.
Run the SQL in [`db.sql`](../db.sql) against your Supabase project's SQL
editor to create the lookup and work-item tables. Note there is a second,
partially-overlapping file `db_schema.sql` — see
[07-decisions-log.md](./07-decisions-log.md) for why both exist and which
one to trust.

## 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 5. Verify it worked

- The **Active Sprint** board should load at `/` with three columns (To Do,
  In Progress, Done) populated with mock work items. Try dragging a card
  between columns — it should move instantly (client-side only, resets on
  reload).
- Navigate to **Backlogs** (`/backlogs`) via the sidebar. You should see one
  section per mock sprint plus a trailing "Backlog" section, and be able to
  drag items between sections and click "Create sprint" to add a new empty
  sprint.
- If you configured Supabase auth and try to visit a non-public route while
  logged out, you should be redirected to `/login` (note: no `/login` page
  exists yet — see [08-known-issues.md](./08-known-issues.md) — so this will
  currently 404 rather than show a login form).

## Common setup errors

| Symptom | Cause | Fix |
|---|---|---|
| Blank page / Supabase client throws at startup | Missing or malformed `.env.local` | Ensure both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set and the dev server was restarted after editing `.env.local` (Next.js only reads env files at boot). |
| `npm install` produces a different lockfile / peer dep warnings | Using yarn/pnpm instead of npm | Stick to `npm` for this repo. |
| Styles look unstyled / Tailwind classes have no effect | Editing `tailwind.config.js` expecting v3 behavior | This project uses **Tailwind v4's CSS-first config** — there is no `tailwind.config.js`. Config/tokens live in `src/app/globals.css`. |
| Confusion about "middleware" not running | Looking for `middleware.ts` | Next.js 16 renamed Middleware to **Proxy**. The equivalent file is `src/proxy.ts`. See [05-workflows.md](./05-workflows.md). |
| Redirected to `/login` and get a 404 | No `/login` page exists yet | Known gap — see [08-known-issues.md](./08-known-issues.md). Visit a public route (`/` or `/backlogs`) instead. |
