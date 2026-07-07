-- One-time seed for lookup tables. Run in the Supabase SQL editor.
-- Safe to re-run: uses ON CONFLICT DO NOTHING against each table's unique `name`.

insert into public.statuses (name, sort_order) values
  ('To Do', 0),
  ('In Progress', 1),
  ('Done', 2)
on conflict (name) do nothing;

insert into public.types (name) values
  ('Task'),
  ('Bug'),
  ('Story')
on conflict (name) do nothing;

insert into public.priorities (name, sort_order) values
  ('Low', 0),
  ('Medium', 1),
  ('High', 2),
  ('Urgent', 3)
on conflict (name) do nothing;
