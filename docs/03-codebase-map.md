# Codebase Map

## Directory structure

```
.
├── AGENTS.md               # Instructions for AI coding agents working in this repo
├── CLAUDE.md                # Imports AGENTS.md (Claude Code entry point)
├── components.json          # shadcn/ui config (style, base color, icon library)
├── docs/                    # This documentation, plus db_schema.sql and seed.sql
├── .env.example              # Template for required env vars
├── eslint.config.mjs         # ESLint flat config (next/core-web-vitals + next/typescript)
├── next.config.ts            # Minimal Next.js config
├── postcss.config.mjs        # Tailwind v4 PostCSS plugin
├── public/                   # Static assets
├── README.md
├── src/
│   ├── app/                  # App Router: routes, layouts, global styles
│   ├── components/           # React components (business + shadcn/ui primitives)
│   ├── lib/                  # Domain types, Supabase data access, Server Actions, clients, utils
│   └── proxy.ts               # Next.js 16 "Proxy" (formerly Middleware) entry point
└── tsconfig.json
```

## `src/app/` — routes

| Path | File | Purpose |
|---|---|---|
| `/` | `src/app/page.tsx` | Active Sprint kanban board (Server Component; fetches board data from Supabase) |
| `/backlogs` | `src/app/backlogs/page.tsx` | Backlogs view (Server Component; fetches board data from Supabase) |
| `/login` | `src/app/login/page.tsx` | Sign-in page |
| `/signup` | `src/app/signup/page.tsx` | Sign-up page |
| (root layout) | `src/app/layout.tsx` | Loads fonts, wraps pages in `AppShell`, mounts `<Toaster />`, forces dark theme |
| — | `src/app/globals.css` | Tailwind v4 config + CSS variable design tokens (colors, sidebar theme, etc.) |

No `pages/` directory exists — this is a pure App Router project. There are
no `route.ts` API route handlers; server-side reads happen directly in
Server Components (`src/lib/data/board.ts`) and mutations go through Server
Actions (`src/lib/actions/`).

## `src/components/` — components

| File | Purpose |
|---|---|
| `app-shell.tsx` | Top-level shell: renders the sidebar + mobile top bar + main content slot |
| `app-sidebar.tsx` | Desktop collapsible rail + mobile off-canvas drawer; owns the `NAV_ITEMS` nav config and a sign-out form |
| `sidebar-context.tsx` | React Context for sidebar collapsed/mobile-open state, persisted to `localStorage` (`sidebar:collapsed`) |
| `sprint-board.tsx` | Active Sprint board: kanban columns from `statuses`, drag-and-drop status changes (optimistic, calls `updateWorkItemStatus`) |
| `backlogs-board.tsx` | Backlogs view: per-sprint sections, unassigned backlog section, drag-and-drop sprint reassignment (`updateWorkItemSprint`), sprint creation (`createSprint`) |
| `create-sprint-dialog.tsx` | Modal form for creating a new (empty) sprint |
| `work-item-card.tsx` | Draggable card shared by both boards; renders type icon, priority badge (no assignee — not modeled in the DB) |
| `login-form.tsx` / `signup-form.tsx` | Client forms calling the `signIn` / `signUp` Server Actions |
| `ui/` | shadcn/ui primitives: `avatar`, `badge`, `button`, `card`, `dialog`, `dropdown-menu`, `input`, `label`, `select`, `separator`, `sonner`, `textarea` — treat these as vendored library code, not app business logic |

## `src/lib/` — domain logic & infra

| File | Purpose |
|---|---|
| `types.ts` | Domain types: `WorkItem`, `Sprint`, `Status`, `WorkItemType`, `Priority`, and the `BACKLOG_SPRINT_ID` sentinel — shaped to match the Supabase schema |
| `data/board.ts` | `getBoardData()` — server-side read of sprints, work items (with labels), statuses, types, priorities, for use in Server Components |
| `actions/board.ts` | Server Actions: `updateWorkItemStatus`, `updateWorkItemSprint`, `createSprint` — each revalidates the relevant page path |
| `actions/auth.ts` | Server Actions: `signIn`, `signUp`, `signOut` |
| `utils.ts` | `cn()` helper (clsx + tailwind-merge) used everywhere for conditional class names |
| `supabase/client.ts` | Browser-side Supabase client factory (for Client Components) |
| `supabase/server.ts` | Server-side Supabase client factory (for Server Components/Actions) — async, must be awaited |
| `supabase/proxy.ts` | `updateSession()` — refreshes the Supabase auth cookie and redirects unauthenticated users away from protected routes |

## Naming and code conventions

- Components are named in kebab-case files (`work-item-card.tsx`) exporting
  a PascalCase component (`WorkItemCard`).
- Domain types (`WorkItem`, `Sprint`, `Status`, etc.) live in `src/lib/types.ts`,
  shaped to match the Supabase schema (ids are table foreign keys, not enums).
- Path alias `@/*` maps to `./src/*` (see `tsconfig.json`).
- Client Components are explicitly marked with `"use client"` at the top of
  the file (e.g. `app-sidebar.tsx`, the board components); Server Components
  are the default elsewhere.
- Styling uses Tailwind utility classes directly in JSX plus the `cn()`
  helper for conditional/merged classes — no CSS modules or styled-components.
- Commit messages follow **Conventional Commits** (`feat:`, `chore:`) — see
  [05-workflows.md](./05-workflows.md).
