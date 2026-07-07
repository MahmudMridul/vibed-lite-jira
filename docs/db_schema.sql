create table public.labels (
  id uuid not null default gen_random_uuid (),
  name text not null,
  constraint labels_pkey primary key (id),
  constraint labels_name_key unique (name)
) TABLESPACE pg_default;

create table public.priorities (
  id uuid not null default gen_random_uuid (),
  name text not null,
  sort_order integer null default 0,
  constraint priorities_pkey primary key (id),
  constraint priorities_name_key unique (name)
) TABLESPACE pg_default;

create table public.sprints (
  id uuid not null default gen_random_uuid (),
  name text not null,
  start_date date null,
  end_date date null,
  created_at timestamp with time zone null default now(),
  current_sprint boolean null default false,
  constraint sprints_pkey primary key (id)
) TABLESPACE pg_default;

create table public.statuses (
  id uuid not null default gen_random_uuid (),
  name text not null,
  sort_order integer null default 0,
  constraint statuses_pkey primary key (id),
  constraint statuses_name_key unique (name)
) TABLESPACE pg_default;

create table public.types (
  id uuid not null default gen_random_uuid (),
  name text not null,
  constraint types_pkey primary key (id),
  constraint types_name_key unique (name)
) TABLESPACE pg_default;

create table public.work_item_labels (
  work_item_id uuid not null,
  label_id uuid not null,
  constraint work_item_labels_pkey primary key (work_item_id, label_id),
  constraint work_item_labels_label_id_fkey foreign KEY (label_id) references labels (id) on delete CASCADE,
  constraint work_item_labels_work_item_id_fkey foreign KEY (work_item_id) references work_items (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.work_item_links (
  id uuid not null default gen_random_uuid (),
  work_item_id uuid null,
  linked_item_id uuid null,
  link_type text null default 'related'::text,
  constraint work_item_links_pkey primary key (id),
  constraint work_item_links_linked_item_id_fkey foreign KEY (linked_item_id) references work_items (id) on delete CASCADE,
  constraint work_item_links_work_item_id_fkey foreign KEY (work_item_id) references work_items (id) on delete CASCADE,
  constraint work_item_links_check check ((work_item_id <> linked_item_id))
) TABLESPACE pg_default;

create table public.work_item_links (
  id uuid not null default gen_random_uuid (),
  work_item_id uuid null,
  linked_item_id uuid null,
  link_type text null default 'related'::text,
  constraint work_item_links_pkey primary key (id),
  constraint work_item_links_linked_item_id_fkey foreign KEY (linked_item_id) references work_items (id) on delete CASCADE,
  constraint work_item_links_work_item_id_fkey foreign KEY (work_item_id) references work_items (id) on delete CASCADE,
  constraint work_item_links_check check ((work_item_id <> linked_item_id))
) TABLESPACE pg_default;