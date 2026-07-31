export type TeamArea = 'trafego' | 'sites' | 'campanhas' | 'clientes' | 'vsl' | 'operacao' | 'estudo' | 'geral'
export type TeamTaskStatus = 'backlog' | 'hoje' | 'andamento' | 'aguardando' | 'revisao' | 'concluida'
export type TeamPriority = 'urgente' | 'importante' | 'normal'
export type GoalStatus = 'planejada' | 'andamento' | 'bloqueada' | 'concluida'
export type IdeaStatus = 'inbox' | 'avaliando' | 'aprovada' | 'arquivada'
export type HabitKind = 'tabaco' | 'cannabis'

export interface TeamProfile { id: string; displayName: string; avatarColor: string; workspaceXp: number; trophies: number }
export interface Workspace { id: string; name: string; description: string; inviteCode: string; createdBy: string }
export interface WorkspaceMember { workspaceId: string; userId: string; role: 'owner' | 'member'; joinedAt: string }

export interface TeamProject {
  id: string; workspaceId: string; name: string; summary: string; color: string
  status: 'ativo' | 'pausado' | 'concluido'; priority: TeamPriority; sortOrder: number
}

export interface TeamGoal {
  id: string; workspaceId: string; title: string; description: string; projectId?: string
  dependsOnGoalId?: string; ownerId?: string; metric: string; target: number; current: number
  deadline?: string; rewardXp: number; completed: boolean; status: GoalStatus
  priority: TeamPriority; sortOrder: number
}

export interface TeamTask {
  id: string; workspaceId: string; projectId?: string; goalId?: string; dependsOnTaskId?: string
  title: string; description: string; area: TeamArea; assigneeId?: string; status: TeamTaskStatus
  priority: TeamPriority; points: number; dueDate?: string; waitingUntil?: string; createdBy: string; completedAt?: string; sortOrder: number
}

export interface TeamSubtask {
  id: string; workspaceId: string; taskId: string; title: string; completed: boolean; sortOrder: number; completedAt?: string
}

export interface TeamIdea {
  id: string; workspaceId: string; title: string; notes: string; status: IdeaStatus
  priority: TeamPriority; createdBy: string; createdAt: string
}

export interface TeamMindNode {
  id: string; workspaceId: string; goalId: string; parentId?: string
  title: string; note: string; sortOrder: number; createdBy: string
}

export interface TeamActivity { id: string; workspaceId: string; userId: string; title: string; points: number; date: string; type: 'task' | 'goal' | 'streak' | 'bonus' | 'status' }
export interface HabitPlan { id: string; userId: string; workspaceId?: string; kind: HabitKind; mode: 'reduzir' | 'parar'; baseline: number; target: number; unit: string; shareWithWorkspace: boolean; startedAt: string }
export interface HabitLog { id: string; planId: string; userId: string; date: string; amount: number; craving?: number; note?: string }

export interface TeamState {
  mode: 'demo' | 'cloud'; configured: boolean; loading: boolean; error: string; user: TeamProfile | null
  profiles: TeamProfile[]; workspaces: Workspace[]; activeWorkspaceId: string | null; members: WorkspaceMember[]
  projects: TeamProject[]; tasks: TeamTask[]; subtasks: TeamSubtask[]; goals: TeamGoal[]; ideas: TeamIdea[]; mindNodes: TeamMindNode[]
  activities: TeamActivity[]; habitPlans: HabitPlan[]; habitLogs: HabitLog[]
}
