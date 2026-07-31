-- Stable mind maps, explicit waiting state and goal history.
alter type public.workspace_task_status add value if not exists 'aguardando';
alter table public.workspace_tasks add column if not exists waiting_until timestamptz;
alter table public.workspace_activities drop constraint if exists workspace_activities_type_check;
alter table public.workspace_activities add constraint workspace_activities_type_check check (type in ('task','goal','streak','bonus','status'));

create table public.workspace_mind_nodes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  goal_id uuid not null references public.workspace_goals(id) on delete cascade,
  parent_id uuid references public.workspace_mind_nodes(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 120),
  note text not null default '' check (char_length(note) <= 500),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index workspace_mind_nodes_goal_idx on public.workspace_mind_nodes(goal_id, parent_id, sort_order);

create or replace function public.validate_workspace_mind_node()
returns trigger language plpgsql security definer set search_path = public
as $$ declare parent_depth integer; has_cycle boolean; begin
  if tg_op = 'UPDATE' then
    new.workspace_id := old.workspace_id; new.goal_id := old.goal_id; new.parent_id := old.parent_id; new.created_by := old.created_by;
  end if;
  if not exists(select 1 from workspace_goals where id = new.goal_id and workspace_id = new.workspace_id) then raise exception 'A meta não pertence a este workspace.'; end if;
  if not exists(select 1 from workspace_members where workspace_id = new.workspace_id and user_id = new.created_by) then raise exception 'O autor não pertence a este workspace.'; end if;
  if new.parent_id is not null then
    if not exists(select 1 from workspace_mind_nodes where id = new.parent_id and goal_id = new.goal_id and workspace_id = new.workspace_id) then raise exception 'O item pai não pertence a este mapa.'; end if;
    with recursive parents as (
      select id, parent_id from workspace_mind_nodes where id = new.parent_id
      union all select node.id, node.parent_id from workspace_mind_nodes node join parents on node.id = parents.parent_id
    ) select count(*), bool_or(id = new.id) into parent_depth, has_cycle from parents;
    if coalesce(has_cycle, false) then raise exception 'O mapa não pode conter ciclos.'; end if;
    if parent_depth >= 4 then raise exception 'O mapa aceita no máximo quatro níveis.'; end if;
  end if;
  if (select count(*) from workspace_mind_nodes where goal_id = new.goal_id) >= 40 and tg_op = 'INSERT' then raise exception 'O mapa aceita no máximo 40 itens.'; end if;
  new.updated_at := now(); return new;
end $$;
create trigger validate_mind_node_before_write before insert or update on public.workspace_mind_nodes for each row execute function public.validate_workspace_mind_node();

alter table public.workspace_mind_nodes enable row level security;
create policy mind_nodes_read on public.workspace_mind_nodes for select to authenticated using (is_workspace_member(workspace_id));
create policy mind_nodes_create on public.workspace_mind_nodes for insert to authenticated with check (is_workspace_member(workspace_id) and created_by = (select auth.uid()));
create policy mind_nodes_update on public.workspace_mind_nodes for update to authenticated using (is_workspace_member(workspace_id)) with check (is_workspace_member(workspace_id));
create policy mind_nodes_delete on public.workspace_mind_nodes for delete to authenticated using (is_workspace_member(workspace_id));

create or replace function public.reward_completed_task()
returns trigger language plpgsql security definer set search_path = public
as $$ declare credited_user uuid; activity_id uuid; status_label text; begin
  new.workspace_id := old.workspace_id; new.created_by := old.created_by;
  new.points := case new.priority when 'urgente' then 30 when 'importante' then 20 else 10 end;
  if new.status is distinct from old.status then
    status_label := case new.status when 'hoje' then 'Hoje' when 'andamento' then 'Em andamento' when 'aguardando' then 'Aguardando' when 'revisao' then 'Em revisão' when 'concluida' then 'Concluída' else 'Caixa de entrada' end;
    insert into workspace_activities(workspace_id,user_id,title,points,type) values(new.workspace_id,coalesce(auth.uid(),new.created_by),status_label || ': ' || new.title,0,'status');
  end if;
  if new.status = 'concluida' and old.status <> 'concluida' then
    credited_user := coalesce(new.assignee_id, auth.uid(), new.created_by); new.completed_at := coalesce(old.completed_at, now());
    insert into workspace_activities(workspace_id,user_id,title,points,type,source_key) values(new.workspace_id,credited_user,new.title,new.points,'task','task:' || new.id)
      on conflict (workspace_id, source_key) where source_key is not null do nothing returning id into activity_id;
    if activity_id is not null then update profiles set workspace_xp = workspace_xp + new.points, trophies = trophies + case when new.points >= 30 then 1 else 0 end, updated_at = now() where id = credited_user; end if;
  elsif new.status <> 'concluida' then new.completed_at := null; end if;
  new.updated_at := now(); return new;
end $$;

alter publication supabase_realtime add table public.workspace_mind_nodes;
