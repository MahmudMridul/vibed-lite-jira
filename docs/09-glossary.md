# Glossary

| Term | Meaning |
|---|---|
| **Work item** | The core unit of work tracked by the app (equivalent to a Jira "issue"). Has a title, description, deadline, status, type, priority, optional sprint assignment, optional parent (for subtasks), and labels. Defined by the `work_items` table and the `WorkItem` TypeScript type in `src/lib/mock-sprint-data.ts`. |
| **Sprint** | A time-boxed grouping of work items with a name and optional start/end dates. The `sprints` table has a `current_sprint` flag (in `db_schema.sql`) to mark the currently active sprint shown on the Active Sprint board. |
| **Backlog** | Work items not assigned to any sprint (`sprint_id is null`). Represented in the UI by the sentinel `BACKLOG_SPRINT_ID` in `mock-sprint-data.ts` and rendered as a trailing section on `/backlogs`. |
| **Status** | The kanban column / workflow state of a work item (e.g. To Do, In Progress, Done). Configurable via the `statuses` lookup table (`sort_order` controls column order); currently hardcoded as `STATUS_COLUMNS` in mock data rather than fetched from the DB. |
| **Type** | The category of a work item, e.g. Bug, Story/Task, etc. Visualized with distinct icons in `work-item-card.tsx` (`Bug`, `BookText`, `SquareCheck`). Backed by the `types` lookup table. |
| **Priority** | Urgency ranking of a work item (e.g. Low/Medium/High), rendered as a badge on the card. Backed by the `priorities` lookup table. |
| **Label** | A free-form tag attachable to multiple work items (many-to-many via `work_item_labels`). Backed by the `labels` table. |
| **Linked work item** | A relationship between two work items that is *not* parent/child (e.g. "blocks", "relates to"), stored in `work_item_links` with a `link_type` (default `'related'`). Distinct from the `parent_id` subtask relationship on `work_items`. |
| **Subtask / parent item** | A work item can reference another work item as its `parent_id` (self-referential FK, cascade delete), representing a subtask hierarchy — distinct from `work_item_links`. |
| **Active Sprint board** | The `/` page: a 3-column kanban board (To Do / In Progress / Done) for the current sprint's work items, with drag-and-drop status changes. |
| **Backlogs view** | The `/backlogs` page: lists every sprint (each showing its work items) plus a trailing Backlog section for unassigned items, supporting drag-and-drop sprint reassignment and sprint creation. |
| **Proxy** | Next.js 16's renamed term for what was previously called "Middleware." In this repo, `src/proxy.ts` intercepts requests to refresh the Supabase auth session and enforce route protection. |
| **Public route** | A route accessible without authentication, defined by the `PUBLIC_ROUTES` array in `src/lib/supabase/proxy.ts`: `/`, `/backlogs`, `/login`, `/signup`, `/auth`. |
| **shadcn/ui** | A collection of copy-in (not npm-installed-as-a-black-box) accessible React component primitives built on Radix/Base UI + Tailwind, vendored into `src/components/ui/` and customized via `components.json`. |
| **RLS (Row-Level Security)** | Postgres/Supabase feature for restricting row access by policy; relevant once the app starts querying Supabase directly from the client for board data (not yet configured/verified in this repo). |
