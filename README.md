# Vibed Lite Jira

A lightweight Jira-style project tracker built with Next.js, Supabase, and deployed on Vercel.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, TypeScript, Turbopack)
- [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- [Supabase](https://supabase.com) (Postgres, Auth, `@supabase/ssr` for cookie-based sessions)
- [Vercel](https://vercel.com) for hosting/deployment

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example file and fill in your Supabase project credentials (find them in your Supabase project under Project Settings → API):

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/
  app/                  # App Router routes, layouts, pages
  components/
    ui/                  # shadcn/ui components
    sprint-board.tsx      # Active Sprint kanban board (To Do / In Progress / Done lanes)
    backlogs-board.tsx    # Backlogs view — one section per sprint plus an unassigned Backlog section
    create-sprint-dialog.tsx # Dialog for creating a new empty sprint
    work-item-card.tsx    # Draggable work item card used on the sprint board and backlogs view
  lib/
    mock-sprint-data.ts   # Mock sprints/work items powering the Active Sprint and Backlogs views (UI-only, not wired to Supabase yet)
    supabase/
      client.ts         # browser Supabase client
      server.ts         # server-side Supabase client (Server Components/Actions)
      proxy.ts           # session refresh logic used by src/proxy.ts
  proxy.ts               # Next.js 16 "Proxy" (formerly Middleware) — refreshes auth session on every request
```

## Active Sprint board

The home page (`/`) renders a Jira-style kanban board with three swimlanes — **To Do**, **In Progress**, **Done**. Work items are draggable between lanes to update their status. This is currently backed by mock data in `src/lib/mock-sprint-data.ts`; it is not yet wired to the `work_items`/`statuses`/`sprints` tables in `db.sql`.

> **Note:** Next.js 16 renamed Middleware to Proxy. `src/proxy.ts` is the equivalent of what older Next.js docs/guides call `middleware.ts`.

## Backlogs

The `/backlogs` page lists every sprint, each showing the work items assigned to it, plus a trailing **Backlog** section for unassigned work items. Work item cards are draggable between sprint sections to reassign them, and a **Create sprint** button opens a dialog to add a new empty sprint. Like the Active Sprint board, this is backed by mock data in `src/lib/mock-sprint-data.ts` and is not yet wired to Supabase.

## Supabase usage

- In **Client Components**, import `createClient` from `@/lib/supabase/client`.
- In **Server Components / Route Handlers / Server Actions**, import `createClient` from `@/lib/supabase/server` (it's async — `await` it).
- Auth session refresh is handled centrally in `src/proxy.ts` for every request (except static assets).

## Deploying to Vercel

1. Push this repo to GitHub/GitLab/Bitbucket.
2. Import the project into [Vercel](https://vercel.com/new).
3. Add the same environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the Vercel project settings.
4. Deploy — Vercel auto-detects Next.js.

## Scripts

| Command         | Description              |
| ---------------- | ------------------------ |
| `npm run dev`    | Start the dev server     |
| `npm run build`  | Production build         |
| `npm run start`  | Start the production server |
| `npm run lint`   | Run ESLint               |

## Documentation

Deeper onboarding and reference documentation lives in [`docs/`](./docs):

1. [Project Overview](./docs/01-overview.md) — what this is, who it's for, architecture, tech stack
2. [Getting Started](./docs/02-getting-started.md) — local setup in under 30 minutes
3. [Codebase Map](./docs/03-codebase-map.md) — directory structure, where things live, conventions
4. [Architecture & Data](./docs/04-architecture-and-data.md) — schema, entity relationships, request lifecycle
5. [Workflows](./docs/05-workflows.md) — branching, commits, PRs, build/lint, deployment
6. [Operational Knowledge](./docs/06-operational-knowledge.md) — environments, logging, gotchas
7. [Decisions Log](./docs/07-decisions-log.md) — why key architectural choices were made
8. [Known Issues](./docs/08-known-issues.md) — gaps, drift, and dead links to be aware of
9. [Glossary](./docs/09-glossary.md) — domain terms and jargon

> **Most important thing to know up front**: the UI (Active Sprint board and
> Backlogs view) currently runs entirely on mock data — nothing is
> persisted to the Supabase database yet. See
> [Known Issues](./docs/08-known-issues.md) before assuming any feature
> works end-to-end.
