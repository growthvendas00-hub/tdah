import { dayOffset } from './store'
import type { TeamGoal, TeamProfile, TeamProject, TeamState, TeamTask, Workspace, WorkspaceMember } from '../types/team'

const key = 'foco-team-v2'
const userKey = 'foco-team-demo-user'

const profiles: TeamProfile[] = [
  { id: 'demo-kondi', displayName: 'Kondi', avatarColor: '#72957a', workspaceXp: 0, trophies: 0 },
  { id: 'demo-socio', displayName: 'Sócio', avatarColor: '#8b7faf', workspaceXp: 0, trophies: 0 },
]
const workspace: Workspace = { id: 'workspace-demo', name: 'Metas Business', description: 'Metas, operações e execução da dupla.', inviteCode: 'FOCO-DUPLA', createdBy: 'demo-kondi' }
const members: WorkspaceMember[] = profiles.map((item, index) => ({ workspaceId: workspace.id, userId: item.id, role: index ? 'member' : 'owner', joinedAt: dayOffset(0) }))
const projects: TeamProject[] = [
  { id: 'project-x1', workspaceId: workspace.id, name: 'Operação X1', summary: 'Preparar a operação para receber leads pelo WhatsApp com a integração oficial da Meta.', color: '#7da889', status: 'ativo', priority: 'urgente', sortOrder: 0 },
  { id: 'project-offers', workspaceId: workspace.id, name: 'Mineração de ofertas', summary: 'Organizar ofertas e criativos para futuros testes no X1.', color: '#c49a6c', status: 'ativo', priority: 'importante', sortOrder: 1 },
]
const goals: TeamGoal[] = [
  { id: 'goal-whatsapp', workspaceId: workspace.id, projectId: 'project-x1', title: 'Conectar a API do WhatsApp da Meta', description: 'Deixar o número pronto para receber leads na operação X1 usando a integração oficial.', metric: 'etapas', target: 4, current: 0, rewardXp: 120, completed: false, status: 'andamento', priority: 'urgente', sortOrder: 0 },
  { id: 'goal-offers', workspaceId: workspace.id, projectId: 'project-offers', title: 'Minerar e preparar novas ofertas para X1', description: 'Entender ofertas, separar criativos e organizar o que será testado.', metric: 'etapas', target: 5, current: 0, rewardXp: 90, completed: false, status: 'planejada', priority: 'importante', sortOrder: 1 },
  { id: 'goal-english', workspaceId: workspace.id, title: 'Aprender inglês', description: '', metric: 'etapas', target: 1, current: 0, rewardXp: 60, completed: false, status: 'planejada', priority: 'normal', sortOrder: 2 },
]
const baseTask = { workspaceId: workspace.id, description: '', area: 'operacao' as const, assigneeId: undefined, status: 'backlog' as const, priority: 'importante' as const, points: 20, dueDate: undefined, createdBy: 'demo-kondi', completedAt: undefined }
const tasks: TeamTask[] = [
  { ...baseTask, id: 'task-bm-wait', projectId: 'project-x1', goalId: 'goal-whatsapp', title: 'Deixar a BM parada em um perfil por 1 dia', priority: 'urgente', points: 30, status: 'hoje', sortOrder: 0 },
  { ...baseTask, id: 'task-number', projectId: 'project-x1', goalId: 'goal-whatsapp', dependsOnTaskId: 'task-bm-wait', title: 'Conectar o número', sortOrder: 1 },
  { ...baseTask, id: 'task-api', projectId: 'project-x1', goalId: 'goal-whatsapp', dependsOnTaskId: 'task-number', title: 'Conectar a API do WhatsApp da Meta', sortOrder: 2 },
  { ...baseTask, id: 'task-run-x1', projectId: 'project-x1', goalId: 'goal-whatsapp', dependsOnTaskId: 'task-api', title: 'Rodar a operação X1 recebendo leads', sortOrder: 3 },
  { ...baseTask, id: 'task-study-x1', projectId: 'project-x1', goalId: 'goal-whatsapp', title: 'Estudar X1 no WhatsApp com a API da Meta', area: 'estudo', priority: 'normal', points: 10, sortOrder: 4 },
  { ...baseTask, id: 'task-networking', projectId: 'project-x1', goalId: 'goal-whatsapp', title: 'Trocar networking sobre X1 e WhatsApp', area: 'estudo', priority: 'normal', points: 10, sortOrder: 5 },
  { ...baseTask, id: 'task-mine', projectId: 'project-offers', goalId: 'goal-offers', title: 'Minerar outras ofertas', sortOrder: 0 },
  { ...baseTask, id: 'task-understand', projectId: 'project-offers', goalId: 'goal-offers', dependsOnTaskId: 'task-mine', title: 'Entender as ofertas selecionadas', sortOrder: 1 },
  { ...baseTask, id: 'task-creatives-get', projectId: 'project-offers', goalId: 'goal-offers', dependsOnTaskId: 'task-understand', title: 'Separar os criativos', sortOrder: 2 },
  { ...baseTask, id: 'task-creatives-organize', projectId: 'project-offers', goalId: 'goal-offers', dependsOnTaskId: 'task-creatives-get', title: 'Organizar os criativos', sortOrder: 3 },
  { ...baseTask, id: 'task-tests', projectId: 'project-offers', goalId: 'goal-offers', dependsOnTaskId: 'task-creatives-organize', title: 'Preparar ofertas para subir e testar no X1', sortOrder: 4 },
]

export function createDemoTeamState(): TeamState {
  const selected = localStorage.getItem(userKey) ?? profiles[0].id
  return { mode: 'demo', configured: false, loading: false, error: '', user: profiles.find((item) => item.id === selected) ?? profiles[0], profiles, workspaces: [workspace], activeWorkspaceId: workspace.id, members, projects, tasks, subtasks: [], goals, ideas: [], activities: [], habitPlans: [], habitLogs: [] }
}
export function loadDemoTeamState() { try { const value = localStorage.getItem(key); if (value) return { ...createDemoTeamState(), ...JSON.parse(value) } as TeamState } catch { /* fresh state */ } return createDemoTeamState() }
export function saveDemoTeamState(state: TeamState) { localStorage.setItem(key, JSON.stringify({ ...state, loading: false, error: '' })) }
export function saveDemoUser(userId: string) { localStorage.setItem(userKey, userId) }
