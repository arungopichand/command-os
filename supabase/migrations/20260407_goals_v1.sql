create extension if not exists pgcrypto;

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  description text,
  status text not null default 'active',
  progress integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.goals add column if not exists description text;
alter table public.goals add column if not exists status text default 'active';
alter table public.goals add column if not exists progress integer default 0;
alter table public.goals add column if not exists created_at timestamptz default timezone('utc', now());
alter table public.goals add column if not exists updated_at timestamptz default timezone('utc', now());

update public.goals
set progress = 0
where progress is null;

update public.goals
set progress = greatest(0, least(progress, 100))
where progress < 0 or progress > 100;

update public.goals
set created_at = timezone('utc', now())
where created_at is null;

update public.goals
set updated_at = timezone('utc', now())
where updated_at is null;

update public.goals
set status = case
  when status in ('pending', 'in_progress', 'active') then 'active'
  when status = 'completed' then 'completed'
  when status = 'paused' then 'paused'
  else 'active'
end
where status is null
   or status not in ('active', 'completed', 'paused');

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'goals'
      and column_name = 'deadline'
  ) then
    alter table public.goals drop column deadline;
  end if;
end $$;

alter table public.goals alter column title set not null;
alter table public.goals alter column progress set not null;
alter table public.goals alter column progress set default 0;
alter table public.goals alter column status set not null;
alter table public.goals alter column status set default 'active';
alter table public.goals alter column created_at set not null;
alter table public.goals alter column created_at set default timezone('utc', now());
alter table public.goals alter column updated_at set not null;
alter table public.goals alter column updated_at set default timezone('utc', now());

alter table public.goals drop constraint if exists goals_progress_range;
alter table public.goals add constraint goals_progress_range check (progress between 0 and 100);

alter table public.goals drop constraint if exists goals_status_allowed;
alter table public.goals add constraint goals_status_allowed check (status in ('active', 'completed', 'paused'));

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'goals_user_id_fkey'
  ) then
    alter table public.goals
      add constraint goals_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete cascade;
  end if;
end $$;

create index if not exists goals_user_id_updated_at_idx on public.goals (user_id, updated_at desc);

create or replace function public.set_goals_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_goals_updated_at on public.goals;
create trigger set_goals_updated_at
before update on public.goals
for each row
execute function public.set_goals_updated_at();

alter table public.goals enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'goals'
      and policyname = 'goals_select_own'
  ) then
    create policy goals_select_own
      on public.goals
      for select
      to authenticated
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'goals'
      and policyname = 'goals_insert_own'
  ) then
    create policy goals_insert_own
      on public.goals
      for insert
      to authenticated
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'goals'
      and policyname = 'goals_update_own'
  ) then
    create policy goals_update_own
      on public.goals
      for update
      to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'goals'
      and policyname = 'goals_delete_own'
  ) then
    create policy goals_delete_own
      on public.goals
      for delete
      to authenticated
      using (auth.uid() = user_id);
  end if;
end $$;
