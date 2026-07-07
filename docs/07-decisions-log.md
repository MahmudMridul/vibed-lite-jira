# Decisions Log (ADRs)

Short records of notable decisions inferred from the codebase and commit
history. These are reconstructed after the fact (no formal ADR process has
been followed) — treat them as best-effort explanations of "why," and
update this file going forward when making similarly significant calls.

---

### ADR-1: Use Supabase instead of a self-hosted database + custom auth

**Decision**: Use Supabase (managed Postgres + Auth) rather than a
self-hosted database with a custom auth solution (e.g. NextAuth + a
separately hosted Postgres instance).

**Why**: For a lightweight/small-team tool, Supabase provides Postgres,
authentication, and row-level security out of the box with minimal
infrastructure to manage, and integrates cleanly with Next.js via
`@supabase/ssr` for cookie-based sessions in both client and server contexts.

**Alternatives considered (implicit)**: Self-hosted Postgres + NextAuth/Clerk
would require more infrastructure and glue code for a project of this scope.

---

### ADR-2: No ORM — use the Supabase client directly

**Decision**: Access Postgres via `@supabase/supabase-js` / PostgREST
directly rather than introducing Prisma, Drizzle, or another ORM/query
builder.

**Why**: The schema is small (7 tables) and Supabase's generated
client/PostgREST already provides a reasonably ergonomic query API. Adding
an ORM would mean maintaining a second schema representation (migrations)
in addition to the SQL files.

**Trade-off / open risk**: Without an ORM's migration tooling, schema
changes must be tracked manually against [`docs/db_schema.sql`](./db_schema.sql)
(the live schema export). If the project grows, revisit whether a migration
tool (e.g. Supabase CLI migrations, or an ORM) is worth the overhead.

---

### ADR-3 (resolved): `db.sql` vs `db_schema.sql` schema drift

**Original situation**: two schema files existed — a hand-authored `db.sql`
and a Supabase export `db_schema.sql` — and had drifted (missing
`current_sprint` column, missing `work_items` table in the dump, duplicated
`work_item_links` block).

**Resolution**: `db.sql` was deleted and `db_schema.sql` was moved to
[`docs/db_schema.sql`](./db_schema.sql), which is now the single source of
truth for the schema (confirmed against the live Supabase project via
PostgREST introspection when wiring up persistence). Treat it as a
disposable, regenerable export — don't hand-edit it, regenerate it from
Supabase when the schema changes, or move to Supabase CLI-managed
migrations if schema changes become frequent.

---

### ADR-4 (superseded): UI was built against mock data before wiring up persistence

**Original decision**: build the Active Sprint board and Backlogs UI
against an in-memory mock dataset (`src/lib/mock-sprint-data.ts`) before
connecting either page to Supabase, to iterate on UI/UX independent of data
fetching.

**Current state**: persistence has since been wired up — `mock-sprint-data.ts`
has been deleted. Both pages are Server Components that fetch live data via
`src/lib/data/board.ts`; mutations go through Server Actions in
`src/lib/actions/board.ts`. See [04-architecture-and-data.md](./04-architecture-and-data.md).
Along the way, the mock data's `assignee` field was dropped rather than
carried into the DB-backed model, since the schema has no assignee concept
(see ADR-6).

---

### ADR-6: Dropped assignee instead of inventing schema for it

**Decision**: When wiring the UI to Supabase, remove the assignee
avatar/field from `WorkItemCard` rather than add an `assignee_id` column or
a `users`/`profiles` table.

**Why**: The live schema has no assignee concept anywhere (no column, no
users/profiles table), and Supabase's `auth.users` table isn't meant to be
queried directly from the client for this purpose. Inventing a schema for
assignees (a table, RLS policies, a UI for picking a user) is a separate
feature decision, not something to improvise while wiring up existing
boards to the database.

**How to apply**: If assignee support is added later, it needs its own
design pass — likely a `profiles` table keyed to `auth.users(id)` (populated
via a trigger on signup) plus an `assignee_id` FK on `work_items`, RLS
policies for reading profiles, and UI for assignment. See
[08-known-issues.md](./08-known-issues.md).

---

### ADR-5: Native HTML5 Drag and Drop instead of a DnD library

**Decision**: Implement drag-and-drop (status changes on the board, sprint
reassignment in backlogs) using the browser's native HTML5 Drag and Drop
API (`draggable`, `onDragStart/Over/Leave/Drop`, `dataTransfer`) directly in
`sprint-board.tsx` and `backlogs-board.tsx`, rather than a library like
`@dnd-kit` or `react-beautiful-dnd`.

**Why**: Avoids an extra dependency for what is currently simple
single-list-to-single-list reordering; native DnD is sufficient for the
current two use cases (column-to-column status change, section-to-section
sprint reassignment).

**Trade-off / open risk**: Native HTML5 DnD has known accessibility and
mobile/touch limitations (no built-in touch support, harder keyboard
navigation) compared to dedicated libraries. If mobile drag support or
reordering *within* a column becomes a requirement, revisit this decision.

---

### ADR-7: Built minimal `/login` and `/signup` pages as part of wiring up persistence

**Decision**: When connecting the boards to Supabase, also build basic
email/password `/login` and `/signup` pages (`src/app/login`,
`src/app/signup`, backed by `src/lib/actions/auth.ts`), rather than leaving
writes unauthenticated-only or stubbed out.

**Why**: Row Level Security on all board tables allows anonymous reads but
requires an authenticated session for writes (insert/update). Without a way
to sign in, drag-and-drop and "Create sprint" would always fail once wired
to the real database — persistence would be read-only in practice. A
minimal auth flow was the smallest change that makes the existing write
paths actually work end-to-end.

**How to apply**: This is intentionally minimal — email/password only, no
password reset, no OAuth providers (all disabled in Supabase Auth settings
at the time), and email confirmation is required before a new account can
sign in (see [08-known-issues.md](./08-known-issues.md)). Treat `/login` and
`/signup` as a starting point, not a complete auth UX.
