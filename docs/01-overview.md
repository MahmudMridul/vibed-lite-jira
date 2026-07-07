# Project Overview

## What is this?

**Vibed Lite Jira** is a lightweight, Jira-style project tracker. It provides
a kanban-style "Active Sprint" board and a "Backlogs" view for organizing
work items across sprints. It is aimed at small teams that want the core
Jira workflow (statuses, sprints, priorities, work item types, labels)
without the overhead of full Jira.

**Current state**: the UI (board + backlogs + drag-and-drop) is fully built
but runs on **in-memory mock data** (`src/lib/mock-sprint-data.ts`). Nothing
is persisted to the database yet — dragging a card or creating a sprint only
updates local React state and is lost on refresh. Supabase is wired up for
**auth only** at this point. See [08-known-issues.md](./08-known-issues.md)
for the full list of gaps.

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
│  Drag & drop via native HTML5 DnD API         │
└───────────────┬───────────────────────────────┘
                │  (Supabase JS client - auth only today)
                ▼
┌─────────────────────────────────────────────┐
│           Next.js Server (Vercel)             │
│  - src/proxy.ts (Middleware/"Proxy" in Next 16)│
│    refreshes Supabase session cookie on every  │
│    request, redirects unauthenticated users    │
│  - Server Components can use                  │
│    src/lib/supabase/server.ts                  │
└───────────────┬───────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────┐
│                 Supabase                      │
│  - Postgres (schema in db.sql / db_schema.sql)│
│  - Auth (used today, cookie-based sessions)   │
│  - Board/backlog data (schema exists, NOT yet │
│    read/written by the app)                   │
└─────────────────────────────────────────────┘
```

There are no API routes or Server Actions in the app yet — all board
interactivity is client-side `useState` against mock data.

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
