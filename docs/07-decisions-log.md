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
changes are tracked manually in `db.sql` / `db_schema.sql`, which have
already drifted from each other (see ADR-3). If the project grows, revisit
whether a migration tool (e.g. Supabase CLI migrations, or an ORM) is worth
the overhead.

---

### ADR-3: Two schema files exist (`db.sql` and `db_schema.sql`) — how to treat them

**Situation**: `db.sql` is a hand-authored schema with explanatory comments
(the design intent). `db_schema.sql` appears to be a raw export/dump from
the actual Supabase project (uses `TABLESPACE pg_default`, explicit
constraint names). They have drifted:

- `db_schema.sql`'s `sprints` table has a `current_sprint boolean` column
  not present in `db.sql`.
- `db_schema.sql` is missing the `work_items` table definition entirely
  (likely omitted when the dump was assembled/pasted).
- `db_schema.sql` has `work_item_links` defined twice (duplicate block).

**Decision (recommended going forward)**: Treat `db.sql` as the source of
truth for *intent* and update it whenever the live schema changes (e.g. add
`current_sprint` to `db.sql`). Treat `db_schema.sql` as a disposable,
regenerable export — don't hand-edit it; regenerate it from Supabase when
needed, or remove it in favor of proper Supabase CLI migrations.

**Why this matters**: Anyone provisioning a new environment from `db.sql`
alone would miss the `current_sprint` column that the running app/dashboard
may already depend on. This should be reconciled before onboarding a second
environment (e.g. staging).

---

### ADR-4: UI built against mock data before wiring up persistence

**Decision**: Build the Active Sprint board and Backlogs UI (including
drag-and-drop) entirely against an in-memory mock dataset
(`src/lib/mock-sprint-data.ts`) before connecting either page to Supabase.

**Why**: Allows UI/UX (kanban interactions, layout, responsiveness) to be
iterated on quickly without also solving data-fetching, mutations, and
optimistic UI at the same time. Matches the commit history: schema was
added (`feat: add db schema`) but the boards that followed
(`feat: implement swimlanes with drag feature`, `feat: create backlogs UI`)
still use mock data.

**How to apply**: When wiring up persistence, the mock data's shape
(`WorkItem`, `Sprint` types in `mock-sprint-data.ts`) is the de facto
contract the UI expects — align Supabase queries/Server Actions to return
data in that shape (or adapt it at the boundary) rather than reshaping all
the UI components at once.

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
