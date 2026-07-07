# Project Overview

## What is this?

**Vibed Lite Jira** is a lightweight, Jira-style project tracker. It provides
a kanban-style "Active Sprint" board and a "Backlogs" view for organizing
work items across sprints. It is aimed at small teams that want the core
Jira workflow (statuses, sprints, priorities, work item types, labels)
without the overhead of full Jira.

**Current state**: the UI (board + backlogs + drag-and-drop) is wired up to
Supabase Postgres. Both pages fetch live data on the server
(`src/lib/data/board.ts`), and drag-and-drop / "Create sprint" call Server
Actions (`src/lib/actions/board.ts`) that write to the database, with
optimistic UI updates that roll back on error. Row Level Security requires
an authenticated session for writes, so minimal `/login` and `/signup`
pages exist as well. There is still no UI for creating/editing work items
or managing lookup tables (statuses/types/priorities/labels) — those are
managed directly via SQL for now. See
[08-known-issues.md](./08-known-issues.md) for the full list of gaps.

## Who uses it

Small dev/product teams who want a minimal sprint board: track work items
through To Do → In Progress → Done, group items into sprints, and triage
unassigned work in a backlog.

## Core problem it solves

Full Jira is heavyweight (complex permissions, workflows, plugins) for small
teams or side projects. This app aims to cover the 20% of Jira features that
cover 80% of day-to-day sprint planning: a board, a backlog, sprints, and
basic work item metadata (type, priority, labels).

## High-level architecture

```
┌─────────────────────────────────────────────┐
│                Browser (Client)               │
│  Next.js App Router pages (React 19, TSX)     │
│  - "/"          Active Sprint board           │
│  - "/backlogs"  Backlogs view                 │
│  - "/login", "/signup"                        │
│  Drag & drop via native HTML5 DnD API,        │
│  optimistic updates + Server Action calls     │
└───────────────┬───────────────────────────────┘
                │  (Server Actions: src/lib/actions/*)
                ▼
┌─────────────────────────────────────────────┐
│           Next.js Server (Vercel)             │
│  - src/proxy.ts (Middleware/"Proxy" in Next 16)│
│    refreshes Supabase session cookie on every  │
│    request, redirects unauthenticated users    │
│  - Server Components read via                 │
│    src/lib/data/board.ts                       │
│  - Server Actions write via                   │
│    src/lib/actions/board.ts, actions/auth.ts   │
│    (src/lib/supabase/server.ts)                │
└───────────────┬───────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────┐
│                 Supabase                      │
│  - Postgres (schema in docs/db_schema.sql)    │
│  - Auth (cookie-based sessions)               │
│  - RLS: anonymous read, authenticated write   │
└─────────────────────────────────────────────┘
```

There are no traditional API routes (`route.ts`) in the app — reads happen
directly in Server Components and writes go through Server Actions.

## Tech stack and rationale

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16.2.10 (App Router, Turbopack) | Modern React framework with SSR/RSC, file-based routing, and built-in deployment story on Vercel. Note: Next.js 16 renamed Middleware to **Proxy** — see [05-workflows.md](./05-workflows.md) and [08-known-issues.md](./08-known-issues.md). |
| UI library | React 19.2.4 | Paired with Next.js 16; enables Server Components. |
| Language | TypeScript (strict mode) | Type safety across components and domain models (`WorkItem`, `Sprint`, etc.). |
| Styling | Tailwind CSS v4 + shadcn/ui | Utility-first CSS with a CSS-first config (no `tailwind.config.js`); shadcn/ui gives accessible, unstyled-by-default primitives (dialog, dropdown, select, etc.) that are copied into the repo (`src/components/ui/`) rather than installed as an opaque dependency. |
| Backend/DB | Supabase (Postgres + Auth) | Managed Postgres with built-in auth and row-level security, avoids running/hosting a separate backend for a small app. |
| Data access | `@supabase/supabase-js` + `@supabase/ssr` directly (no ORM) | Small schema, direct SQL/PostgREST via the Supabase client was deemed sufficient; no Prisma/Drizzle layer has been introduced. |
| Icons | lucide-react | Standard icon set paired with shadcn/ui. |
| Toasts | sonner | Lightweight toast notifications, used via the `<Toaster />` in the root layout. |
| Hosting | Vercel | First-class Next.js support, zero-config deploys from git. |

## Where to go next

- New to the project? Start with [02-getting-started.md](./02-getting-started.md).
- Want to know where code lives? See [03-codebase-map.md](./03-codebase-map.md).
- Need the data model or request flow? See [04-architecture-and-data.md](./04-architecture-and-data.md).
