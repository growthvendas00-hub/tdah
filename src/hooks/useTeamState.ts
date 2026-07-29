import { useCallback, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { localDate } from '../lib/store'
import { createDemoTeamState, loadDemoTeamState, saveDemoTeamState, saveDemoUser } from '../lib/teamStore'
import { supabase, supabaseConfigured } from '../lib/supabase'
import type { HabitPlan, TeamGoal, TeamProfile, TeamProject, TeamState, TeamTask, Workspace, WorkspaceMember } from '../types/team'

// Supabase rows are mapped immediately into the strict domain types below.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>
const uid = () => crypto.randomUUID()
const profile = (r: Row): TeamProfile => ({ id: r.id, displayName: r.display_name, avatarColor: r.avatar_color, workspaceXp: r.workspace_xp, trophies: r.trophies })
const workspace = (r: Row): Workspace => ({ id: r.id, name: r.name, description: r.description ?? '', inviteCode: r.invite_code, createdBy: r.created_by })
const member = (r: Row): WorkspaceMember => ({ workspaceId: r.workspace_id, userId: r.user_id, role: r.role, joinedAt: r.joined_at?.slice(0, 10) })
const project = (r: Row): TeamProject => ({ id: r.id, workspaceId: r.workspace_id, name: r.name, summary: r.summary ?? '', color: r.color, status: r.status })
const task = (r: Row): TeamTask => ({ id: r.id, workspaceId: r.workspace_id, projectId: r.project_id ?? undefined, title: r.title, description: r.description ?? '', area: r.area, assigneeId: r.assignee_id ?? undefined, status: r.status, priority: r.priority, points: r.points, dueDate: r.due_date, createdBy: r.created_by, completedAt: r.completed_at ?? undefined })
const goal = (r: Row): TeamGoal => ({ id: r.id, workspaceId: r.workspace_id, title: r.title, metric: r.metric, target: r.target, current: r.current, deadline: r.deadline, rewardXp: r.reward_xp, completed: r.completed })
const habit = (r: Row): HabitPlan => ({ id: r.id, userId: r.user_id, workspaceId: r.workspace_id ?? undefined, kind: r.kind, mode: r.mode, baseline: r.baseline, target: r.target, unit: r.unit, shareWithWorkspace: r.share_with_workspace, startedAt: r.started_at })

export function useTeamState() {
  const [state, setState] = useState<TeamState>(loadDemoTeamState)
  const [session, setSession] = useState<Session | null>(null)

  const loadCloud = useCallback(async (userId: string, preferredWorkspace?: string | null) => {
    if (!supabase) return
    setState((current) => ({ ...current, mode: 'cloud', configured: true, loading: true, error: '' }))
    try {
      const [{ data: profileRows, error: profileError }, { data: memberRows, error: memberError }] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('workspace_members').select('*'),
      ])
      if (profileError || memberError) throw profileError ?? memberError
      const memberships = (memberRows ?? []).map(member)
      const workspaceIds = [...new Set(memberships.map((item) => item.workspaceId))]
      const { data: workspaceRows, error: workspaceError } = workspaceIds.length ? await supabase.from('workspaces').select('*').in('id', workspaceIds) : { data: [], error: null }
      if (workspaceError) throw workspaceError
      const workspaces = (workspaceRows ?? []).map(workspace)
      const activeWorkspaceId = preferredWorkspace && workspaceIds.includes(preferredWorkspace) ? preferredWorkspace : workspaceIds[0] ?? null
      const empty = Promise.resolve({ data: [], error: null })
      const queries = await Promise.all([
        activeWorkspaceId ? supabase.from('workspace_projects').select('*').eq('workspace_id', activeWorkspaceId) : empty,
        activeWorkspaceId ? supabase.from('workspace_tasks').select('*').eq('workspace_id', activeWorkspaceId) : empty,
        activeWorkspaceId ? supabase.from('workspace_goals').select('*').eq('workspace_id', activeWorkspaceId) : empty,
        activeWorkspaceId ? supabase.from('workspace_activities').select('*').eq('workspace_id', activeWorkspaceId).order('created_at', { ascending: false }).limit(100) : empty,
        supabase.from('habit_plans').select('*'),
        supabase.from('habit_logs').select('*').gte('date', new Date(Date.now() - 31 * 86400000).toISOString().slice(0, 10)),
      ])
      const firstError = queries.find((item) => item.error)?.error
      if (firstError) throw firstError
      const profiles = (profileRows ?? []).map(profile)
      setState({
        mode: 'cloud', configured: true, loading: false, error: '', user: profiles.find((item) => item.id === userId) ?? null,
        profiles, workspaces, activeWorkspaceId, members: memberships,
        projects: (queries[0]?.data ?? []).map(project), tasks: (queries[1]?.data ?? []).map(task),
        goals: (queries[2]?.data ?? []).map(goal),
        activities: (queries[3]?.data ?? []).map((r: Row) => ({ id: r.id, workspaceId: r.workspace_id, userId: r.user_id, title: r.title, points: r.points, date: r.activity_date, type: r.type })),
        habitPlans: (queries[4]?.data ?? []).map(habit),
        habitLogs: (queries[5]?.data ?? []).map((r: Row) => ({ id: r.id, planId: r.plan_id, userId: r.user_id, date: r.date, amount: r.amount, craving: r.craving ?? undefined, note: r.note ?? undefined })),
      })
    } catch (error) {
      setState((current) => ({ ...current, loading: false, error: error instanceof Error ? error.message : 'Não foi possível carregar o workspace.' }))
    }
  }, [])

  useEffect(() => {
    if (!supabaseConfigured || !supabase) return
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); if (data.session) loadCloud(data.session.user.id) })
    const { data } = supabase.auth.onAuthStateChange((_event, next) => { setSession(next); if (next) loadCloud(next.user.id); else setState({ ...createDemoTeamState(), mode: 'cloud', configured: true, user: null, workspaces: [], members: [], projects: [], tasks: [], goals: [], activities: [], habitPlans: [], habitLogs: [] }) })
    return () => data.subscription.unsubscribe()
  }, [loadCloud])

  useEffect(() => {
    if (state.mode === 'demo') saveDemoTeamState(state)
  }, [state])

  useEffect(() => {
    if (!supabase || !session || !state.activeWorkspaceId) return
    const client = supabase
    const channel = client.channel(`workspace:${state.activeWorkspaceId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workspace_tasks', filter: `workspace_id=eq.${state.activeWorkspaceId}` }, () => loadCloud(session.user.id, state.activeWorkspaceId))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workspace_activities', filter: `workspace_id=eq.${state.activeWorkspaceId}` }, () => loadCloud(session.user.id, state.activeWorkspaceId))
      .subscribe()
    return () => { client.removeChannel(channel) }
  }, [session, state.activeWorkspaceId, loadCloud])

  function updateDemo(change: (current: TeamState) => TeamState) { setState((current) => change(current)) }
  async function refresh() { if (session) await loadCloud(session.user.id, state.activeWorkspaceId) }
  async function signUp(email: string, password: string, displayName: string) {
    if (!supabase) return 'Supabase ainda não está configurado.'
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { display_name: displayName.trim() } } })
    return error?.message ?? ''
  }
  async function signIn(email: string, password: string) {
    if (!supabase) return 'Supabase ainda não está configurado.'
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error?.message ?? ''
  }
  async function signOut() { await supabase?.auth.signOut() }
  function switchDemoUser(userId: string) {
    saveDemoUser(userId)
    updateDemo((current) => ({ ...current, user: current.profiles.find((item) => item.id === userId) ?? current.user }))
  }
  async function createWorkspace(name: string) {
    if (!session || !supabase) return
    const { error } = await supabase.from('workspaces').insert({ name: name.trim(), description: 'Operação compartilhada', created_by: session.user.id })
    if (error) setState((current) => ({ ...current, error: error.message })); else await loadCloud(session.user.id)
  }
  async function joinWorkspace(code: string) {
    if (!session || !supabase) return
    const { error } = await supabase.rpc('join_workspace_by_code', { join_code: code.trim().toUpperCase() })
    if (error) setState((current) => ({ ...current, error: error.message })); else await loadCloud(session.user.id)
  }
  async function setWorkspace(id: string) {
    if (session) await loadCloud(session.user.id, id)
    else updateDemo((current) => ({ ...current, activeWorkspaceId: id }))
  }
  async function addProject(input: Pick<TeamProject, 'name' | 'summary' | 'color'>) {
    if (!state.activeWorkspaceId || !state.user) return
    if (state.mode === 'cloud' && supabase) { await supabase.from('workspace_projects').insert({ workspace_id: state.activeWorkspaceId, name: input.name, summary: input.summary, color: input.color }); await refresh(); return }
    updateDemo((current) => ({ ...current, projects: [...current.projects, { ...input, id: uid(), workspaceId: current.activeWorkspaceId!, status: 'ativo' }] }))
  }
  async function addTask(input: Omit<TeamTask, 'id' | 'workspaceId' | 'createdBy' | 'completedAt'>) {
    if (!state.activeWorkspaceId || !state.user) return
    if (state.mode === 'cloud' && supabase) { await supabase.from('workspace_tasks').insert({ workspace_id: state.activeWorkspaceId, project_id: input.projectId || null, title: input.title, description: input.description, area: input.area, assignee_id: input.assigneeId || null, status: input.status, priority: input.priority, points: input.points, due_date: input.dueDate, created_by: state.user.id }); await refresh(); return }
    updateDemo((current) => ({ ...current, tasks: [...current.tasks, { ...input, id: uid(), workspaceId: current.activeWorkspaceId!, createdBy: current.user!.id }] }))
  }
  async function moveTask(taskId: string, status: TeamTask['status']) {
    if (state.mode === 'cloud' && supabase) { await supabase.from('workspace_tasks').update({ status }).eq('id', taskId); await refresh(); return }
    updateDemo((current) => {
      const found = current.tasks.find((item) => item.id === taskId); if (!found) return current
      const completed = status === 'concluida' && found.status !== 'concluida'
      const userId = found.assigneeId ?? current.user!.id
      return { ...current,
        tasks: current.tasks.map((item) => item.id === taskId ? { ...item, status, completedAt: status === 'concluida' ? new Date().toISOString() : undefined } : item),
        activities: completed ? [{ id: uid(), workspaceId: found.workspaceId, userId, title: found.title, points: found.points, date: localDate(), type: 'task' }, ...current.activities] : current.activities,
        profiles: completed ? current.profiles.map((item) => item.id === userId ? { ...item, workspaceXp: item.workspaceXp + found.points, trophies: item.trophies + (found.points >= 30 ? 1 : 0) } : item) : current.profiles,
      }
    })
  }
  async function advanceGoal(goalId: string) {
    if (state.mode === 'cloud' && supabase) { await supabase.rpc('advance_workspace_goal', { goal_id_input: goalId }); await refresh(); return }
    updateDemo((current) => ({ ...current, goals: current.goals.map((item) => item.id === goalId ? { ...item, current: Math.min(item.target, item.current + 1), completed: item.current + 1 >= item.target } : item) }))
  }
  async function addGoal(input: Omit<TeamGoal, 'id' | 'workspaceId' | 'current' | 'completed'>) {
    if (!state.activeWorkspaceId) return
    if (state.mode === 'cloud' && supabase) { await supabase.from('workspace_goals').insert({ workspace_id: state.activeWorkspaceId, title: input.title, metric: input.metric, target: input.target, deadline: input.deadline, reward_xp: input.rewardXp }); await refresh(); return }
    updateDemo((current) => ({ ...current, goals: [...current.goals, { ...input, id: uid(), workspaceId: current.activeWorkspaceId!, current: 0, completed: false }] }))
  }
  async function updateHabitPlan(planId: string, values: Partial<Pick<HabitPlan, 'baseline' | 'target' | 'mode' | 'shareWithWorkspace'>>) {
    if (state.mode === 'cloud' && supabase) { await supabase.from('habit_plans').update({ baseline: values.baseline, target: values.target, mode: values.mode, share_with_workspace: values.shareWithWorkspace }).eq('id', planId); await refresh(); return }
    updateDemo((current) => ({ ...current, habitPlans: current.habitPlans.map((item) => item.id === planId ? { ...item, ...values } : item) }))
  }
  async function logHabit(planId: string, amount: number, craving?: number, note?: string) {
    if (!state.user) return
    if (state.mode === 'cloud' && supabase) { await supabase.from('habit_logs').upsert({ plan_id: planId, user_id: state.user.id, date: localDate(), amount: Math.max(0, amount), craving, note }, { onConflict: 'plan_id,date' }); await refresh(); return }
    updateDemo((current) => {
      const existing = current.habitLogs.find((item) => item.planId === planId && item.date === localDate())
      return { ...current, habitLogs: existing ? current.habitLogs.map((item) => item.id === existing.id ? { ...item, amount: Math.max(0, amount), craving, note } : item) : [...current.habitLogs, { id: uid(), planId, userId: current.user!.id, date: localDate(), amount: Math.max(0, amount), craving, note }] }
    })
  }
  async function createHabit(kind: HabitPlan['kind']) {
    if (!state.user || state.habitPlans.some((item) => item.userId === state.user!.id && item.kind === kind)) return
    const input = { user_id: state.user.id, kind, mode: 'reduzir', baseline: kind === 'tabaco' ? 10 : 3, target: kind === 'tabaco' ? 6 : 2, unit: kind === 'tabaco' ? 'cigarros/dia' : 'sessões/semana', share_with_workspace: false, workspace_id: state.activeWorkspaceId, started_at: localDate() }
    if (state.mode === 'cloud' && supabase) { await supabase.from('habit_plans').insert(input); await refresh(); return }
    updateDemo((current) => ({ ...current, habitPlans: [...current.habitPlans, habit({ id: uid(), ...input })] }))
  }

  return { state, session, actions: { signUp, signIn, signOut, switchDemoUser, createWorkspace, joinWorkspace, setWorkspace, addProject, addTask, moveTask, addGoal, advanceGoal, updateHabitPlan, logHabit, createHabit, refresh } }
}

export type TeamActions = ReturnType<typeof useTeamState>['actions']
