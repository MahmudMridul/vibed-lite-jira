-- Dynamic lookup tables (you add/remove/update values)
create table statuses (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order int default 0
);

create table types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table priorities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order int default 0
);

create table labels (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

-- Sprints
create table sprints (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_date date,
  end_date date,
  created_at timestamptz default now()
);

-- Work items
create table work_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  deadline date,
  status_id uuid references statuses(id),
  type_id uuid references types(id),
  priority_id uuid references priorities(id),
  sprint_id uuid references sprints(id),
  parent_id uuid references work_items(id) on delete cascade,
  created_at timestamptz default now(),
  deleted_at timestamptz
);

-- Labels are multi-select, so a join table
create table work_item_labels (
  work_item_id uuid references work_items(id) on delete cascade,
  label_id uuid references labels(id) on delete cascade,
  primary key (work_item_id, label_id)
);

-- Linked work items (not parent/child — just "related to")
create table work_item_links (
  id uuid primary key default gen_random_uuid(),
  work_item_id uuid references work_items(id) on delete cascade,
  linked_item_id uuid references work_items(id) on delete cascade,
  link_type text default 'related',
  check (work_item_id <> linked_item_id)
);