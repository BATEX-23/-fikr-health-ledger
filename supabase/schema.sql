-- Run this once in your Supabase project's SQL editor (Project → SQL Editor → New query).
-- It creates the single table the app uses to store its data, and makes it
-- readable/writable so every device using the app link shares the same data.

create table if not exists kv_store (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table kv_store enable row level security;

-- No login system in the app (see README "Security note") — the app link
-- itself is what controls who can reach this data, so these policies allow
-- anyone holding the anon key (i.e. anyone with the app link) full access.
create policy "kv_store anon select" on kv_store for select using (true);
create policy "kv_store anon insert" on kv_store for insert with check (true);
create policy "kv_store anon update" on kv_store for update using (true);
create policy "kv_store anon delete" on kv_store for delete using (true);

-- Enables live updates (Supabase Realtime) so open tabs/devices update
-- automatically when someone else records a sale, expense, etc.
alter publication supabase_realtime add table kv_store;
