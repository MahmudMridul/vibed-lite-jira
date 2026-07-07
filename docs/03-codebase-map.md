# Codebase Map

## Directory structure

```
.
├── AGENTS.md               # Instructions for AI coding agents working in this repo
├── CLAUDE.md                # Imports AGENTS.md (Claude Code entry point)
├── components.json          # shadcn/ui config (style, base color, icon library)
├── db.sql                   # Hand-authored source-of-truth schema (with comments)
├── db_schema.sql            # Schema export from Supabase (has drifted from db.sql — see below)
├── docs/                    # This documentation
├── .env.example              # Template for required env vars
├── eslint.config.mjs         # ESLint flat config (next/core-web-vitals + next/typescript)
├── next.config.ts            # Minimal Next.js config
├── postcss.config.mjs        # Tailwind v4 PostCSS plugin
├── public/                   # Static assets
├── README.md
├── src/
│   ├── app/                  # App Router: routes, layouts, global styles
│   ├── components/           # React components (business + shadcn/ui primitives)
│   ├── lib/                  # Domain types, mock data, Supabase clients, utils
│   └── proxy.ts               # Next.js 16 "Proxy" (formerly Middleware) entry point
└── tsconfig.json
```

## `src/app/` — routes

| Path | File | Purpose |
|---|---|---|
| `/` | `src/app/page.tsx` | Active Sprint kanban board |
| `/backlogs` | `src/app/backlogs/page.tsx` | Backlogs view |
| (root layout) | `src/app/layout.tsx` | Loads fonts, wraps pages in `AppShell`, mounts `<Toaster />`, forces dark theme |
| — | `src/app/globals.css` | Tailwind v4 config + CSS variable design tokens (colors, sidebar theme, etc.) |

No `pages/` directory exists — this is a pure App Router project. There are
also no `route.ts` API route handlers or Server Actions anywhere in the
codebase yet.

## `src/components/` — components

| File | Purpose |
|---|---|
| `app-shell.tsx` | Top-level shell: renders the sidebar + mobile top bar + main content slot |
| `app-sidebar.tsx` | Desktop collapsible rail + mobile off-canvas drawer; owns the `NAV_ITEMS` nav config |
| `sidebar-context.tsx` | React Context for sidebar collapsed/mobile-open state, persisted to `localStorage` (`sidebar:collapsed`) |
| `sprint-board.tsx` | Active Sprint board: kanban columns, drag-and-drop status changes |
| `backlogs-board.tsx` | Backlogs view: per-sprint sections, unassigned backlog section, drag-and-drop sprint reassignment, sprint creation |
| `create-sprint-dialog.tsx` | Modal form for creating a new (empty) sprint |
| `work-item-card.tsx` | Draggable card shared by both boards; renders type icon, priority badge, etc. |
| `ui/` | shadcn/ui primitives: `avatar`, `badge`, `button`, `card`, `dialog`, `dropdown-menu`, `input`, `label`, `select`, `separator`, `sonner`, `textarea` — treat these as vendored library code, not app business logic |

## `src/lib/` — domain logic & infra

| File | Purpose |
|---|---|
| `mock-sprint-data.ts` | **Current source of truth for data shapes.** Defines `WorkItemStatus`, `WorkItemPriority`, `WorkItemType`, `WorkItem`, `Sprint` types; `STATUS_COLUMNS`; `BACKLOG_SPRINT_ID` sentinel; and the `MOCK_SPRINTS` / `MOCK_WORK_ITEMS` arrays that currently power both boards |
| `utils.ts` | `cn()` helper (clsx + tailwind-merge) used everywhere for conditional class names |
| `supabase/client.ts` | Browser-side Supabase client factory (for Client Components) |
| `supabase/server.ts` | Server-side Supabase client factory (for Server Components/Actions) — async, must be awaited |
| `supabase/proxy.ts` | `updateSession()` — refreshes the Supabase auth cookie and redirects unauthenticated users away from protected routes |

## Naming and code conventions

- Components are named in kebab-case files (`work-item-card.tsx`) exporting
  a PascalCase component (`WorkItemCard`).
- Domain types (`WorkItem`, `Sprint`, `WorkItemStatus`, etc.) live in
  `src/lib/mock-sprint-data.ts` rather than a separate `types/` folder —
  when the app is wired to Supabase, these will likely move to a dedicated
  types module generated from or matching the DB schema.
- Path alias `@/*` maps to `./src/*` (see `tsconfig.json`).
- Client Components are explicitly marked with `"use client"` at the top of
  the file (e.g. `app-sidebar.tsx`, the board components); Server Components
  are the default elsewhere.
- Styling uses Tailwind utility classes directly in JSX plus the `cn()`
  helper for conditional/merged classes — no CSS modules or styled-components.
- Commit messages follow **Conventional Commits** (`feat:`, `chore:`) — see
  [05-workflows.md](./05-workflows.md).
