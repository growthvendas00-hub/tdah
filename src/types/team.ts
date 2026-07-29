export type TeamArea = 'trafego' | 'sites' | 'campanhas' | 'clientes' | 'vsl' | 'operacao' | 'geral'
export type TeamTaskStatus = 'backlog' | 'hoje' | 'andamento' | 'revisao' | 'concluida'
export type TeamPriority = 'urgente' | 'importante' | 'normal'
export type HabitKind = 'tabaco' | 'cannabis'

export interface TeamProfile {
  id: string
  displayName: string
  avatarColor: string
  workspaceXp: number
  trophies: number
}

export interface Workspace {
  id: string
  name: string
  description: string
  inviteCode: string
  createdBy: string
}

export interface WorkspaceMember {
  workspaceId: string
  userId: string
  role: 'owner' | 'member'
  joinedAt: string
}

export interface TeamProject {
  id: string
  workspaceId: string
  name: string
  summary: string
  color: string
  status: 'ativo' | 'pausado' | 'concluido'
}

export interface TeamTask {
  id: string
  workspaceId: string
  projectId?: string
  title: string
  description: string
  area: TeamArea
  assigneeId?: string
  status: TeamTaskStatus
  priority: TeamPriority
  points: number
  dueDate: string
  createdBy: string
  completedAt?: string
}

export interface TeamGoal {
  id: string
  workspaceId: string
  title: string
  metric: string
  target: number
  current: number
  deadline: string
  rewardXp: number
  completed: boolean
}

export interface TeamActivity {
  id: string
  workspaceId: string
  userId: string
  title: string
  points: number
  date: string
  type: 'task' | 'goal' | 'streak'
}

export interface HabitPlan {
  id: string
  userId: string
  workspaceId?: string
  kind: HabitKind
  mode: 'reduzir' | 'parar'
  baseline: number
  target: number
  unit: string
  shareWithWorkspace: boolean
  startedAt: string
}

export interface HabitLog {
  id: string
  planId: string
  userId: string
  date: string
  amount: number
  craving?: number
  note?: string
}

export interface TeamState {
  mode: 'demo' | 'cloud'
  configured: boolean
  loading: boolean
  error: string
  user: TeamProfile | null
  profiles: TeamProfile[]
  workspaces: Workspace[]
  activeWorkspaceId: string | null
  members: WorkspaceMember[]
  projects: TeamProject[]
  tasks: TeamTask[]
  goals: TeamGoal[]
  activities: TeamActivity[]
  habitPlans: HabitPlan[]
  habitLogs: HabitLog[]
}
