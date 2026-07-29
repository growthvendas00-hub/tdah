-- Execute no SQL Editor de um projeto Supabase novo.
create extension if not exists pgcrypto;
create type public.workspace_role as enum ('owner', 'member');
create type public.workspace_task_status as enum ('backlog', 'hoje', 'andamento', 'revisao', 'concluida');
create type public.workspace_task_priority as enum ('urgente', 'importante', 'normal');
create type public.workspace_area as enum ('trafego', 'sites', 'campanhas', 'clientes', 'vsl', 'operacao', 'geral');
create type public.habit_kind as enum ('tabaco', 'cannabis');
create type public.habit_mode as enum ('reduzir', 'parar');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 60),
  avatar_color text not null default '#6e9174',
  workspace_xp integer not null default 0 check (workspace_xp >= 0),
  trophies integer not null default 0 check (trophies >= 0),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  description text not null default '',
  invite_code text not null unique default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.workspace_role not null default 'member', joined_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);
create index workspace_members_user_idx on public.workspace_members(user_id, workspace_id);

create table public.workspace_projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 100), summary text not null default '',
  color text not null default '#6e9174', status text not null default 'ativo' check (status in ('ativo', 'pausado', 'concluido')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index workspace_projects_workspace_idx on public.workspace_projects(workspace_id);

create table public.workspace_tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid references public.workspace_projects(id) on delete set null,
  title text not null check (char_length(title) between 3 and 160), description text not null default '',
  area public.workspace_area not null default 'geral', assignee_id uuid references public.profiles(id) on delete set null,
  status public.workspace_task_status not null default 'backlog',
  priority public.workspace_task_priority not null default 'normal',
  points integer not null default 10 check (points between 5 and 100), due_date date not null default current_date,
  created_by uuid not null references public.profiles(id), completed_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index workspace_tasks_board_idx on public.workspace_tasks(workspace_id, status, due_date);
create index workspace_tasks_assignee_idx on public.workspace_tasks(assignee_id, due_date);

create table public.workspace_goals (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 140), metric text not null check (char_length(metric) between 2 and 80),
  target integer not null check (target > 0), current integer not null default 0 check (current >= 0),
  deadline date not null, reward_xp integer not null default 80 check (reward_xp between 10 and 500),
  completed boolean not null default false, created_at timestamptz not null default now()
);
create index workspace_goals_workspace_idx on public.workspace_goals(workspace_id, completed);

create table public.workspace_activities (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade, title text not null,
  points integer not null check (points >= 0), activity_date date not null default current_date,
  type text not null check (type in ('task', 'goal', 'streak')), created_at timestamptz not null default now()
);
create index workspace_activities_ranking_idx on public.workspace_activities(workspace_id, activity_date, user_id);

create table public.habit_plans (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete set null, kind public.habit_kind not null,
  mode public.habit_mode not null default 'reduzir', baseline numeric(8,2) not null check (baseline >= 0),
  target numeric(8,2) not null check (target >= 0), unit text not null,
  share_with_workspace boolean not null default false, started_at date not null default current_date,
  created_at timestamptz not null default now(), unique (user_id, kind)
);
create table public.habit_logs (
  id uuid primary key default gen_random_uuid(), plan_id uuid not null references public.habit_plans(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade, date date not null default current_date,
  amount numeric(8,2) not null check (amount >= 0), craving smallint check (craving between 1 and 5),
  note text check (char_length(note) <= 500), created_at timestamptz not null default now(), unique (plan_id, date)
);
create index habit_logs_user_date_idx on public.habit_logs(user_id, date desc);

create or replace function public.is_workspace_member(workspace_id_input uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from workspace_members where workspace_id = workspace_id_input and user_id = auth.uid()) $$;
create or replace function public.is_workspace_owner(workspace_id_input uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from workspace_members where workspace_id = workspace_id_input and user_id = auth.uid() and role = 'owner') $$;
create or replace function public.shares_workspace(other_user_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from workspace_members mine join workspace_members theirs using (workspace_id) where mine.user_id = auth.uid() and theirs.user_id = other_user_id) $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$ begin
  insert into profiles(id, display_name) values (new.id, coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'), ''), split_part(new.email, '@', 1)));
  return new;
end $$;
create trigger auth_user_profile after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.add_workspace_owner()
returns trigger language plpgsql security definer set search_path = public
as $$ begin insert into workspace_members(workspace_id, user_id, role) values(new.id, new.created_by, 'owner'); return new; end $$;
create trigger workspace_owner_after_insert after insert on public.workspaces for each row execute function public.add_workspace_owner();

create or replace function public.validate_workspace_task()
returns trigger language plpgsql security definer set search_path = public
as $$ begin
  if new.project_id is not null and not exists(select 1 from workspace_projects where id = new.project_id and workspace_id = new.workspace_id) then
    raise exception 'O projeto não pertence a este workspace.';
  end if;
  if new.assignee_id is not null and not exists(select 1 from workspace_members where workspace_id = new.workspace_id and user_id = new.assignee_id) then
    raise exception 'O responsável não pertence a este workspace.';
  end if;
  new.points := case new.priority when 'urgente' then 30 when 'importante' then 20 else 10 end;
  return new;
end $$;
create trigger validate_task_before_write before insert or update on public.workspace_tasks for each row execute function public.validate_workspace_task();

create or replace function public.join_workspace_by_code(join_code text)
returns uuid language plpgsql security definer set search_path = public
as $$ declare target_id uuid; begin
  if auth.uid() is null then raise exception 'Faça login para entrar no workspace.'; end if;
  select id into target_id from workspaces where invite_code = upper(trim(join_code));
  if target_id is null then raise exception 'Código de convite inválido.'; end if;
  insert into workspace_members(workspace_id, user_id, role) values(target_id, auth.uid(), 'member') on conflict do nothing;
  return target_id;
end $$;

create or replace function public.reward_completed_task()
returns trigger language plpgsql security definer set search_path = public
as $$ declare credited_user uuid; begin
  new.workspace_id := old.workspace_id; new.created_by := old.created_by;
  new.points := case new.priority when 'urgente' then 30 when 'importante' then 20 else 10 end;
  if new.status = 'concluida' and old.status <> 'concluida' then
    credited_user := coalesce(new.assignee_id, auth.uid(), new.created_by); new.completed_at := now();
    update profiles set workspace_xp = workspace_xp + new.points,
      trophies = trophies + case when new.points >= 30 then 1 else 0 end, updated_at = now() where id = credited_user;
    insert into workspace_activities(workspace_id, user_id, title, points, type) values(new.workspace_id, credited_user, new.title, new.points, 'task');
  elsif new.status <> 'concluida' then new.completed_at := null; end if;
  new.updated_at := now(); return new;
end $$;
create trigger reward_task_before_update before update of status on public.workspace_tasks for each row execute function public.reward_completed_task();

create or replace function public.advance_workspace_goal(goal_id_input uuid)
returns void language plpgsql security definer set search_path = public
as $$ declare target_goal workspace_goals; next_value integer; begin
  select * into target_goal from workspace_goals where id = goal_id_input;
  if target_goal.id is null or not is_workspace_member(target_goal.workspace_id) then raise exception 'Objetivo não encontrado.'; end if;
  if target_goal.completed then return; end if;
  next_value := least(target_goal.target, target_goal.current + 1);
  update workspace_goals set current = next_value, completed = next_value >= target_goal.target where id = target_goal.id;
  if next_value >= target_goal.target then
    update profiles set workspace_xp = workspace_xp + target_goal.reward_xp, trophies = trophies + 1, updated_at = now() where id = auth.uid();
    insert into workspace_activities(workspace_id, user_id, title, points, type) values(target_goal.workspace_id, auth.uid(), 'Objetivo: ' || target_goal.title, target_goal.reward_xp, 'goal');
  end if;
end $$;

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.workspace_projects enable row level security;
alter table public.workspace_tasks enable row level security;
alter table public.workspace_goals enable row level security;
alter table public.workspace_activities enable row level security;
alter table public.habit_plans enable row level security;
alter table public.habit_logs enable row level security;
create policy profiles_read on public.profiles for select to authenticated using (id = (select auth.uid()) or shares_workspace(id));
create policy profiles_update on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy workspaces_read on public.workspaces for select to authenticated using (is_workspace_member(id));
create policy workspaces_create on public.workspaces for insert to authenticated with check (created_by = (select auth.uid()));
create policy workspaces_update on public.workspaces for update to authenticated using (is_workspace_owner(id)) with check (is_workspace_owner(id));
create policy members_read on public.workspace_members for select to authenticated using (is_workspace_member(workspace_id));
create policy members_delete on public.workspace_members for delete to authenticated using (user_id = (select auth.uid()) or is_workspace_owner(workspace_id));
create policy projects_all on public.workspace_projects for all to authenticated using (is_workspace_member(workspace_id)) with check (is_workspace_member(workspace_id));
create policy tasks_read on public.workspace_tasks for select to authenticated using (is_workspace_member(workspace_id));
create policy tasks_create on public.workspace_tasks for insert to authenticated with check (is_workspace_member(workspace_id) and created_by = (select auth.uid()));
create policy tasks_update on public.workspace_tasks for update to authenticated using (is_workspace_member(workspace_id)) with check (is_workspace_member(workspace_id));
create policy tasks_delete on public.workspace_tasks for delete to authenticated using (is_workspace_member(workspace_id));
create policy goals_all on public.workspace_goals for all to authenticated using (is_workspace_member(workspace_id)) with check (is_workspace_member(workspace_id));
create policy activities_read on public.workspace_activities for select to authenticated using (is_workspace_member(workspace_id));
create policy habits_read on public.habit_plans for select to authenticated using (user_id = (select auth.uid()) or (share_with_workspace and workspace_id is not null and is_workspace_member(workspace_id)));
create policy habits_create on public.habit_plans for insert to authenticated with check (user_id = (select auth.uid()) and (workspace_id is null or is_workspace_member(workspace_id)));
create policy habits_update on public.habit_plans for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()) and (workspace_id is null or is_workspace_member(workspace_id)));
create policy logs_read on public.habit_logs for select to authenticated using (user_id = (select auth.uid()) or exists(select 1 from habit_plans p where p.id = plan_id and p.share_with_workspace and p.workspace_id is not null and is_workspace_member(p.workspace_id)));
create policy logs_create on public.habit_logs for insert to authenticated with check (user_id = (select auth.uid()) and exists(select 1 from habit_plans p where p.id = plan_id and p.user_id = (select auth.uid())));
create policy logs_update on public.habit_logs for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()) and exists(select 1 from habit_plans p where p.id = plan_id and p.user_id = (select auth.uid())));
revoke update on public.profiles from authenticated;
grant update(display_name, avatar_color) on public.profiles to authenticated;
revoke execute on function public.is_workspace_member(uuid) from public;
revoke execute on function public.is_workspace_owner(uuid) from public;
revoke execute on function public.shares_workspace(uuid) from public;
grant execute on function public.is_workspace_member(uuid) to authenticated;
grant execute on function public.is_workspace_owner(uuid) to authenticated;
grant execute on function public.shares_workspace(uuid) to authenticated;
grant execute on function public.join_workspace_by_code(text) to authenticated;
grant execute on function public.advance_workspace_goal(uuid) to authenticated;
alter publication supabase_realtime add table public.workspace_tasks;
alter publication supabase_realtime add table public.workspace_activities;
