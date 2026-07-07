# Architecture & Data

## Data model

The intended schema (see [`db.sql`](../db.sql)) targets Postgres via
Supabase. **Important:** the app does not currently query any of these
tables for board data — this is the target schema for when persistence is
wired up. See [08-known-issues.md](./08-known-issues.md).

### Tables

**Lookup tables** (dynamic — admins add/remove/update values; intended to
back the not-yet-built `/settings/*` pages):

| Table | Columns |
|---|---|
| `statuses` | `id` (uuid, pk), `name` (text, unique), `sort_order` (int, default 0) |
| `types` | `id` (uuid, pk), `name` (text, unique) |
| `priorities` | `id` (uuid, pk), `name` (text, unique), `sort_order` (int, default 0) |
| `labels` | `id` (uuid, pk), `name` (text, unique) |

**Core entities:**

| Table | Columns |
|---|---|
| `sprints` | `id` (uuid, pk), `name` (text), `start_date` (date), `end_date` (date), `created_at` (timestamptz, default now()), `current_sprint` (boolean, default false — **only in `db_schema.sql`, missing from `db.sql`**, marks the active sprint) |
| `work_items` | `id` (uuid, pk), `title` (text), `description` (text), `deadline` (date), `status_id` → `statuses.id`, `type_id` → `types.id`, `priority_id` → `priorities.id`, `sprint_id` → `sprints.id`, `parent_id` → `work_items.id` (self-referential, `on delete cascade`, for subtasks), `created_at` (timestamptz), `deleted_at` (timestamptz, soft delete) |

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

Since there are no API routes or Server Actions yet, "request lifecycle"
today mostly concerns page loads and auth:

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
4. Next.js renders the matched page.tsx (Server Component by default)
5. Client Components (e.g. SprintBoard, BacklogsBoard) hydrate and manage
   their own state client-side via useState, seeded from mock data in
   src/lib/mock-sprint-data.ts
6. User interactions (drag-and-drop, create sprint) mutate local React
   state only — nothing is sent back to the server or Supabase
```

When persistence is added, the expected shape (not yet implemented) is:
Client Component → Server Action or API route → Supabase client
(`src/lib/supabase/server.ts`) → Postgres.

## External integrations / dependencies

| Integration | Used for | Client |
|---|---|---|
| Supabase Auth | Session management, login redirects | `@supabase/ssr` in `src/proxy.ts` / `src/lib/supabase/proxy.ts` |
| Supabase Postgres | Intended for all board/backlog data (schema exists, not yet queried by app code) | `src/lib/supabase/client.ts` (browser), `src/lib/supabase/server.ts` (server) |
| Vercel | Hosting/deployment | N/A (CI/CD via git integration) |

There are no other external APIs, queues, or storage services integrated.
