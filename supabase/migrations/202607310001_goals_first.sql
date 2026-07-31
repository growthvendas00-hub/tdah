-- Goals-first workspace: ordered execution, dependencies, ideas and idempotent rewards.
alter type public.workspace_area add value if not exists 'estudo';

alter table public.workspace_projects
  add column if not exists priority public.workspace_task_priority not null default 'normal',
  add column if not exists sort_order integer not null default 0;

alter table public.workspace_goals
  add column if not exists description text not null default '',
  add column if not exists project_id uuid references public.workspace_projects(id) on delete set null,
  add column if not exists depends_on_goal_id uuid references public.workspace_goals(id) on delete set null,
  add column if not exists owner_id uuid references public.profiles(id) on delete set null,
  add column if not exists status text not null default 'planejada' check (status in ('planejada','andamento','bloqueada','concluida')),
  add column if not exists priority public.workspace_task_priority not null default 'normal',
  add column if not exists sort_order integer not null default 0,
  add column if not exists updated_at timestamptz not null default now();
alter table public.workspace_goals alter column deadline drop not null;

alter table public.workspace_tasks
  add column if not exists goal_id uuid references public.workspace_goals(id) on delete cascade,
  add column if not exists depends_on_task_id uuid references public.workspace_tasks(id) on delete set null,
  add column if not exists sort_order integer not null default 0;
alter table public.workspace_tasks alter column due_date drop not null;

create index if not exists workspace_projects_order_idx on public.workspace_projects(workspace_id, sort_order);
create index if not exists workspace_goals_order_idx on public.workspace_goals(workspace_id, priority, sort_order);
create index if not exists workspace_tasks_goal_order_idx on public.workspace_tasks(goal_id, sort_order);

create table public.workspace_subtasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  task_id uuid not null references public.workspace_tasks(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 160),
  completed boolean not null default false,
  sort_order integer not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index workspace_subtasks_task_idx on public.workspace_subtasks(task_id, sort_order);

create table public.workspace_ideas (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 160),
  notes text not null default '' check (char_length(notes) <= 3000),
  status text not null default 'inbox' check (status in ('inbox','avaliando','aprovada','arquivada')),
  priority public.workspace_task_priority not null default 'normal',
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index workspace_ideas_workspace_idx on public.workspace_ideas(workspace_id, status, created_at desc);

alter table public.workspace_activities add column if not exists source_key text;
create unique index if not exists workspace_activities_source_key_idx on public.workspace_activities(workspace_id, source_key) where source_key is not null;
alter table public.workspace_activities drop constraint if exists workspace_activities_type_check;
alter table public.workspace_activities add constraint workspace_activities_type_check check (type in ('task','goal','streak','bonus'));

create or replace function public.validate_workspace_task()
returns trigger language plpgsql security definer set search_path = public
as $$ begin
  if new.project_id is not null and not exists(select 1 from workspace_projects where id = new.project_id and workspace_id = new.workspace_id) then raise exception 'A operação não pertence a este workspace.'; end if;
  if new.goal_id is not null and not exists(select 1 from workspace_goals where id = new.goal_id and workspace_id = new.workspace_id) then raise exception 'A meta não pertence a este workspace.'; end if;
  if new.depends_on_task_id = new.id then raise exception 'Uma tarefa não pode depender dela mesma.'; end if;
  if new.depends_on_task_id is not null and not exists(select 1 from workspace_tasks where id = new.depends_on_task_id and workspace_id = new.workspace_id) then raise exception 'A dependência não pertence a este workspace.'; end if;
  if new.assignee_id is not null and not exists(select 1 from workspace_members where workspace_id = new.workspace_id and user_id = new.assignee_id) then raise exception 'O responsável não pertence a este workspace.'; end if;
  new.points := case new.priority when 'urgente' then 30 when 'importante' then 20 else 10 end;
  return new;
end $$;

create or replace function public.validate_workspace_goal()
returns trigger language plpgsql security definer set search_path = public
as $$ begin
  if new.project_id is not null and not exists(select 1 from workspace_projects where id = new.project_id and workspace_id = new.workspace_id) then raise exception 'A operação não pertence a este workspace.'; end if;
  if new.depends_on_goal_id = new.id then raise exception 'Uma meta não pode depender dela mesma.'; end if;
  if new.depends_on_goal_id is not null and not exists(select 1 from workspace_goals where id = new.depends_on_goal_id and workspace_id = new.workspace_id) then raise exception 'A dependência não pertence a este workspace.'; end if;
  if new.owner_id is not null and not exists(select 1 from workspace_members where workspace_id = new.workspace_id and user_id = new.owner_id) then raise exception 'O responsável não pertence a este workspace.'; end if;
  new.completed := new.status = 'concluida'; new.updated_at := now(); return new;
end $$;
create trigger validate_goal_before_write before insert or update on public.workspace_goals for each row execute function public.validate_workspace_goal();

create or replace function public.validate_workspace_subtask()
returns trigger language plpgsql security definer set search_path = public
as $$ begin
  if not exists(select 1 from workspace_tasks where id = new.task_id and workspace_id = new.workspace_id) then raise exception 'A tarefa não pertence a este workspace.'; end if;
  if new.completed and (tg_op = 'INSERT' or not old.completed) then new.completed_at := now(); elsif not new.completed then new.completed_at := null; end if;
  new.updated_at := now(); return new;
end $$;
create trigger validate_subtask_before_write before insert or update on public.workspace_subtasks for each row execute function public.validate_workspace_subtask();

create or replace function public.reward_completed_task()
returns trigger language plpgsql security definer set search_path = public
as $$ declare credited_user uuid; activity_id uuid; begin
  new.workspace_id := old.workspace_id; new.created_by := old.created_by;
  new.points := case new.priority when 'urgente' then 30 when 'importante' then 20 else 10 end;
  if new.status = 'concluida' and old.status <> 'concluida' then
    credited_user := coalesce(new.assignee_id, auth.uid(), new.created_by); new.completed_at := coalesce(old.completed_at, now());
    insert into workspace_activities(workspace_id,user_id,title,points,type,source_key) values(new.workspace_id,credited_user,new.title,new.points,'task','task:' || new.id)
      on conflict (workspace_id, source_key) where source_key is not null do nothing returning id into activity_id;
    if activity_id is not null then update profiles set workspace_xp = workspace_xp + new.points, trophies = trophies + case when new.points >= 30 then 1 else 0 end, updated_at = now() where id = credited_user; end if;
  elsif new.status <> 'concluida' then new.completed_at := null; end if;
  new.updated_at := now(); return new;
end $$;

create or replace function public.recalculate_workspace_goal(target_goal_id uuid)
returns void language plpgsql security definer set search_path = public
as $$ declare total_count integer; done_count integer; target_goal workspace_goals; activity_id uuid; credited_user uuid; begin
  if target_goal_id is null then return; end if;
  select count(*), count(*) filter(where status = 'concluida') into total_count, done_count from workspace_tasks where goal_id = target_goal_id;
  select * into target_goal from workspace_goals where id = target_goal_id;
  if target_goal.id is null then return; end if;
  update workspace_goals set current = done_count, target = greatest(1,total_count), completed = total_count > 0 and done_count = total_count,
    status = case when total_count > 0 and done_count = total_count then 'concluida' when status = 'concluida' then 'andamento' else status end, updated_at = now() where id = target_goal_id;
  if total_count > 0 and done_count = total_count then
    credited_user := coalesce(target_goal.owner_id, auth.uid());
    insert into workspace_activities(workspace_id,user_id,title,points,type,source_key) values(target_goal.workspace_id,credited_user,'Meta: ' || target_goal.title,target_goal.reward_xp,'goal','goal:' || target_goal.id)
      on conflict (workspace_id, source_key) where source_key is not null do nothing returning id into activity_id;
    if activity_id is not null then update profiles set workspace_xp = workspace_xp + target_goal.reward_xp, trophies = trophies + 1, updated_at = now() where id = credited_user; end if;
  end if;
end $$;
revoke execute on function public.recalculate_workspace_goal(uuid) from public, authenticated;

create or replace function public.sync_goal_from_tasks()
returns trigger language plpgsql security definer set search_path = public
as $$ begin
  if tg_op = 'DELETE' then perform recalculate_workspace_goal(old.goal_id); return old; end if;
  if tg_op = 'UPDATE' and old.goal_id is distinct from new.goal_id then perform recalculate_workspace_goal(old.goal_id); end if;
  perform recalculate_workspace_goal(new.goal_id); return new;
end $$;
create trigger sync_goal_after_task_insert after insert on public.workspace_tasks for each row execute function public.sync_goal_from_tasks();
create trigger sync_goal_after_task_update after update of status, goal_id on public.workspace_tasks for each row execute function public.sync_goal_from_tasks();
create trigger sync_goal_after_task_delete after delete on public.workspace_tasks for each row execute function public.sync_goal_from_tasks();

alter table public.workspace_subtasks enable row level security;
alter table public.workspace_ideas enable row level security;
create policy subtasks_all on public.workspace_subtasks for all to authenticated using (is_workspace_member(workspace_id)) with check (is_workspace_member(workspace_id));
create policy ideas_read on public.workspace_ideas for select to authenticated using (is_workspace_member(workspace_id));
create policy ideas_create on public.workspace_ideas for insert to authenticated with check (is_workspace_member(workspace_id) and created_by = (select auth.uid()));
create policy ideas_update on public.workspace_ideas for update to authenticated using (is_workspace_member(workspace_id)) with check (is_workspace_member(workspace_id));
create policy ideas_delete on public.workspace_ideas for delete to authenticated using (is_workspace_member(workspace_id));

-- Progress is derived from tasks; the old manual counter cannot grant a second goal bonus.
revoke execute on function public.advance_workspace_goal(uuid) from public, authenticated;

alter publication supabase_realtime add table public.workspace_projects;
alter publication supabase_realtime add table public.workspace_subtasks;
alter publication supabase_realtime add table public.workspace_goals;
alter publication supabase_realtime add table public.workspace_ideas;
