-- Run this once in Supabase: SQL Editor -> New query -> paste -> Run
create table if not exists todos (
  id bigint generated always as identity primary key,
  title text not null,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

alter table todos enable row level security;
-- No public policies: only the backend (service key) can read/write.

insert into todos (title) values ('Deploy my first full-stack app');
