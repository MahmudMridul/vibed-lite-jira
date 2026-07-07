# Architecture & Data

## Data model

The schema lives in [`docs/db_schema.sql`](./db_schema.sql) (a live export
from the Supabase project) and targets Postgres via Supabase. As of this
writing, the app queries these tables directly: `src/lib/data/board.ts`
reads sprints/work items/lookup tables for both pages, and
`src/lib/actions/board.ts` writes status/sprint changes and new sprints.
Row Level Security allows anonymous reads on all tables but requires an
authenticated session for writes — see [05-workflows.md](./05-workflows.md)
and the `/login` / `/signup` pages.

### Tables

**Lookup tables** (dynamic — admins add/remove/update values; intended to
back the not-yet-built `/settings/*` pages; seeded via
[`docs/seed.sql`](./seed.sql)):

| Table | Columns |
|---|---|
| `statuses` | `id` (uuid, pk), `name` (text, unique), `sort_order` (int, default 0) |
| `types` | `id` (uuid, pk), `name` (text, unique) |
| `priorities` | `id` (uuid, pk), `name` (text, unique), `sort_order` (int, default 0) |
| `labels` | `id` (uuid, pk), `name` (text, unique) |

**Core entities:**

| Table | Columns |
|---|---|
| `sprints` | `id` (uuid, pk), `name` (text), `start_date` (date), `end_date` (date), `created_at` (timestamptz, default now()), `current_sprint` (boolean, default false — marks the active sprint) |
| `work_items` | `id` (uuid, pk), `title` (text), `description` (text), `deadline` (date), `status_id` → `statuses.id`, `type_id` → `types.id`, `priority_id` → `priorities.id`, `sprint_id` → `sprints.id`, `parent_id` → `work_items.id` (self-referential, `on delete cascade`, for subtasks), `created_at` (timestamptz), `deleted_at` (timestamptz, soft delete). **No assignee column** — the UI does not show an assignee. |

**Join / relation tables:**

| Table | Columns | Purpose |
|---|---|---|
| `work_item_labels` | `work_item_id` → `work_items.id` (cascade), `label_id` → `labels.id` (cascade), pk = (`work_item_id`, `label_id`) | Many-to-many: work items can have multiple labels |
| `work_item_links` | `id` (pk), `work_item_id` → `work_items.id` (cascade), `linked_item_id` → `work_items.id` (cascade), `link_type` (text, default `'related'`), `check (work_item_id <> linked_item_id)` | Arbitrary "related to" links between items, **distinct** from the `parent_id` subtask relationship |

### Entity relationships

```
sprints ──< work_items >── statuses
                │  │  └──< types
                │  └───< priorities
                │
                ├──< work_item_labels >── labels
                │
                └──< work_item_links >── (self, via linked_item_id)
                │
                └── parent_id (self-referential, subtasks)
```

- A `work_item` belongs to zero-or-one `sprint` (unassigned = backlog).
- A `work_item` has exactly one `status`, one `type`, and optionally one
  `priority`.
- A `work_item` can have many `labels` (via `work_item_labels`).
- A `work_item` can be linked to other work items via `work_item_links`
  (e.g. "blocks", "relates to") — this is separate from the `parent_id`
  parent/subtask hierarchy.
- Soft deletes: `work_items.deleted_at` — deleted items should be filtered
  by queries, not physically removed.

## Request lifecycle

**Page load (read path):**

```
1. Browser requests a page (e.g. GET /backlogs)
2. src/proxy.ts (Next.js 16 Proxy, formerly "Middleware") intercepts the
   request for all paths except static assets/images
3. updateSession() in src/lib/supabase/proxy.ts:
   a. Creates a Supabase server client bound to the request/response cookies
   b. Calls supabase.auth.getUser() to refresh/validate the session
   c. If no user AND the route is not in PUBLIC_ROUTES
      (["/", "/backlogs", "/login", "/signup", "/auth"]),
      redirects to /login
   d. Returns the response with refreshed auth cookies attached
4. The matched page.tsx (a Server Component) calls getBoardData() in
   src/lib/data/board.ts, which queries Supabase directly (sprints, work
   items with joined labels, statuses, types, priorities) using the
   request-scoped server client
5. Client Components (SprintBoard, BacklogsBoard) hydrate with that data as
   initial React state
```

**Mutation (write path — status change, sprint reassignment, create sprint):**

```
1. User drags a card or submits "Create sprint" in a Client Component
2. The component optimistically updates local state, then calls a Server
   Action from src/lib/actions/board.ts (updateWorkItemStatus,
   updateWorkItemSprint, or createSprint)
3. The Server Action runs on the server using the authenticated user's
   Supabase session (src/lib/supabase/server.ts) and issues the
   update/insert against Postgres
4. Row Level Security requires an authenticated session for writes; if the
   user isn't signed in, the mutation fails and the action returns an error
5. On success, the action calls revalidatePath() for the affected route;
   on failure, the client rolls back its optimistic update and shows a
   toast (sonner)
```

Auth mutations (`signIn`, `signUp`, `signOut` in `src/lib/actions/auth.ts`)
follow the same Server Action pattern, redirecting on success.

## External integrations / dependencies

| Integration | Used for | Client |
|---|---|---|
| Supabase Auth | Session management, login/signup/signout, login redirects | `@supabase/ssr` in `src/proxy.ts`, `src/lib/supabase/proxy.ts`, `src/lib/actions/auth.ts` |
| Supabase Postgres | All board/backlog reads and writes | `src/lib/data/board.ts` (reads), `src/lib/actions/board.ts` (writes), via `src/lib/supabase/server.ts` |
| Vercel | Hosting/deployment | N/A (CI/CD via git integration) |

There are no other external APIs, queues, or storage services integrated.
