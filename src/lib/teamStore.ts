import { dayOffset, localDate } from './store'
import type { HabitLog, HabitPlan, TeamActivity, TeamGoal, TeamProfile, TeamProject, TeamState, TeamTask, Workspace, WorkspaceMember } from '../types/team'

const key = 'foco-team-demo-v1'
const userKey = 'foco-team-demo-user'

const profiles: TeamProfile[] = [
  { id: 'demo-kondi', displayName: 'Kondi', avatarColor: '#6e9174', workspaceXp: 420, trophies: 7 },
  { id: 'demo-socio', displayName: 'Sócio', avatarColor: '#8a79a8', workspaceXp: 390, trophies: 6 },
]

const workspace: Workspace = { id: 'workspace-demo', name: 'Metas Business', description: 'Operação compartilhada de tráfego, ofertas e agência.', inviteCode: 'FOCO-DUPLA', createdBy: 'demo-kondi' }
const members: WorkspaceMember[] = profiles.map((profile, index) => ({ workspaceId: workspace.id, userId: profile.id, role: index ? 'member' : 'owner', joinedAt: dayOffset(-30) }))
const projects: TeamProject[] = [
  { id: 'tp1', workspaceId: workspace.id, name: 'Operação VSL', summary: 'Proteger e escalar a oferta principal.', color: '#d4837d', status: 'ativo' },
  { id: 'tp2', workspaceId: workspace.id, name: 'Agência', summary: 'Atendimento, aquisição e retenção de clientes.', color: '#77a7a4', status: 'ativo' },
]
const tasks: TeamTask[] = [
  { id: 'tt1', workspaceId: workspace.id, projectId: 'tp1', title: 'Subir contingência da página', description: 'Duplicar a página aprovada no domínio reserva e validar checkout.', area: 'sites', assigneeId: 'demo-kondi', status: 'hoje', priority: 'urgente', points: 30, dueDate: localDate(), createdBy: 'demo-socio' },
  { id: 'tt2', workspaceId: workspace.id, projectId: 'tp1', title: 'Revisar retenção da VSL', description: 'Olhar quedas dos primeiros 8 minutos e anotar três hipóteses.', area: 'vsl', assigneeId: 'demo-socio', status: 'andamento', priority: 'importante', points: 20, dueDate: localDate(), createdBy: 'demo-kondi' },
  { id: 'tt3', workspaceId: workspace.id, projectId: 'tp2', title: 'Enviar relatório semanal', description: 'Consolidar mídia, criativos e próximos testes do cliente.', area: 'clientes', assigneeId: 'demo-kondi', status: 'revisao', priority: 'importante', points: 20, dueDate: localDate(), createdBy: 'demo-kondi' },
  { id: 'tt4', workspaceId: workspace.id, projectId: 'tp2', title: 'Confirmar reunião de onboarding', description: 'Enviar pauta e confirmar participantes.', area: 'clientes', assigneeId: 'demo-socio', status: 'concluida', priority: 'normal', points: 10, dueDate: dayOffset(-1), createdBy: 'demo-kondi', completedAt: new Date().toISOString() },
]
const goals: TeamGoal[] = [
  { id: 'tg1', workspaceId: workspace.id, title: 'Estabilizar a operação principal', metric: 'dias sem interrupção', target: 14, current: 6, deadline: dayOffset(20), rewardXp: 120, completed: false },
  { id: 'tg2', workspaceId: workspace.id, title: 'Entregar relatórios no prazo', metric: 'relatórios', target: 8, current: 5, deadline: dayOffset(14), rewardXp: 80, completed: false },
]
const activities: TeamActivity[] = [
  { id: 'ta1', workspaceId: workspace.id, userId: 'demo-kondi', title: 'Publicou página de contingência', points: 30, date: dayOffset(-2), type: 'task' },
  { id: 'ta2', workspaceId: workspace.id, userId: 'demo-socio', title: 'Fechou reunião de onboarding', points: 10, date: dayOffset(-1), type: 'task' },
  { id: 'ta3', workspaceId: workspace.id, userId: 'demo-kondi', title: 'Entregou relatório de mídia', points: 20, date: localDate(), type: 'task' },
  { id: 'ta4', workspaceId: workspace.id, userId: 'demo-socio', title: 'Criou novos ângulos de campanha', points: 20, date: localDate(), type: 'task' },
]
const habitPlans: HabitPlan[] = profiles.flatMap((profile) => [
  { id: `hp-${profile.id}-tabaco`, userId: profile.id, kind: 'tabaco', mode: 'reduzir', baseline: 10, target: 6, unit: 'cigarros/dia', shareWithWorkspace: profile.id === 'demo-kondi', workspaceId: workspace.id, startedAt: dayOffset(-7) },
  { id: `hp-${profile.id}-cannabis`, userId: profile.id, kind: 'cannabis', mode: 'reduzir', baseline: 3, target: 2, unit: 'sessões/semana', shareWithWorkspace: false, startedAt: dayOffset(-7) },
])
const habitLogs: HabitLog[] = [
  { id: 'hl1', planId: 'hp-demo-kondi-tabaco', userId: 'demo-kondi', date: dayOffset(-2), amount: 9 },
  { id: 'hl2', planId: 'hp-demo-kondi-tabaco', userId: 'demo-kondi', date: dayOffset(-1), amount: 8 },
  { id: 'hl3', planId: 'hp-demo-kondi-tabaco', userId: 'demo-kondi', date: localDate(), amount: 6 },
]

export function createDemoTeamState(): TeamState {
  const selected = localStorage.getItem(userKey) ?? profiles[0].id
  return { mode: 'demo', configured: false, loading: false, error: '', user: profiles.find((item) => item.id === selected) ?? profiles[0], profiles, workspaces: [workspace], activeWorkspaceId: workspace.id, members, projects, tasks, goals, activities, habitPlans, habitLogs }
}

export function loadDemoTeamState() {
  try { const value = localStorage.getItem(key); if (value) return { ...createDemoTeamState(), ...JSON.parse(value) } as TeamState } catch { /* fresh demo */ }
  return createDemoTeamState()
}

export function saveDemoTeamState(state: TeamState) {
  localStorage.setItem(key, JSON.stringify({ ...state, loading: false, error: '' }))
}

export function saveDemoUser(userId: string) { localStorage.setItem(userKey, userId) }
