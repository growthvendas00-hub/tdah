import { createInitialState, dayOffset, localDate } from './store'
import type { AppState } from '../types'
import type { TeamState } from '../types/team'

const now = () => new Date().toISOString()

export function createShowcasePersonal(settings: AppState['settings']): AppState {
  const base = createInitialState(); const today = localDate()
  return { ...base, coins: 420, xp: 760, level: 8, energy: 'alta', settings: { ...settings, displayName: settings.displayName || 'Kondi' },
    projects: [
      { id: 'demo-personal-launch', name: 'Lançar nova operação', color: '#6f9478', why: 'Criar uma operação previsível sem depender da memória.', progress: 67, deadline: dayOffset(18), status: 'ativo', milestones: [{ id: 'demo-m1', title: 'Oferta validada', completed: true, completedAt: now() }, { id: 'demo-m2', title: 'Página publicada', completed: true, completedAt: now() }, { id: 'demo-m3', title: 'Primeira campanha analisada', completed: false }] },
      { id: 'demo-personal-health', name: 'Energia sustentável', color: '#9b87b3', why: 'Trabalhar bem sem entrar no ciclo de exaustão.', progress: 40, status: 'ativo', milestones: [{ id: 'demo-m4', title: 'Rotina de sono definida', completed: true, completedAt: now() }, { id: 'demo-m5', title: 'Cinco pausas conscientes', completed: false }] },
    ],
    goals: [
      { id: 'demo-goal-revenue', title: 'Validar uma operação rentável', why: 'Transformar testes em uma rotina mensurável.', area: 'carreira', target: 10, current: 6, unit: 'etapas', deadline: dayOffset(18), rewardCoins: 180, completed: false },
      { id: 'demo-goal-reading', title: 'Estudar inglês sem sobrecarga', why: 'Acessar materiais e networking internacional.', area: 'pessoal', target: 12, current: 7, unit: 'sessões', deadline: dayOffset(30), rewardCoins: 120, completed: false },
      { id: 'demo-goal-sleep', title: 'Regular o horário de sono', why: 'Começar o dia com menos atrito.', area: 'saude', target: 7, current: 4, unit: 'dias', deadline: dayOffset(7), rewardCoins: 90, completed: false },
    ],
    missions: [
      { id: 'demo-task-1', title: 'Revisar métricas da campanha principal', description: 'Anotar três decisões, não apenas olhar os números.', projectId: 'demo-personal-launch', goalId: 'demo-goal-revenue', duration: 25, energy: 'alta', coins: 38, xp: 48, completed: true, createdAt: now(), dueDate: today, completedAt: now(), status: 'concluida', priority: 'essencial' },
      { id: 'demo-task-2', title: 'Separar 5 criativos para o próximo teste', description: 'Escolher por hipótese e ângulo.', projectId: 'demo-personal-launch', goalId: 'demo-goal-revenue', duration: 35, energy: 'media', coins: 53, xp: 63, completed: false, createdAt: now(), dueDate: today, status: 'andamento', priority: 'essencial' },
      { id: 'demo-task-3', title: 'Esperar retorno da aprovação da página', description: 'Retomar quando a janela terminar.', projectId: 'demo-personal-launch', goalId: 'demo-goal-revenue', duration: 10, energy: 'baixa', coins: 15, xp: 25, completed: false, createdAt: now(), dueDate: today, status: 'aguardando', waitingUntil: new Date(Date.now() + 5 * 3600_000).toISOString(), priority: 'importante' },
      { id: 'demo-task-4', title: 'Inglês: assistir uma aula curta', description: '15 minutos e três palavras úteis.', goalId: 'demo-goal-reading', duration: 15, energy: 'baixa', coins: 23, xp: 33, completed: false, createdAt: now(), dueDate: today, status: 'pendente', priority: 'extra' },
    ],
    routine: { technique: 'sprint-gentil', wakeTime: '07:15', sleepTime: '23:15', intention: 'Avançar no essencial e terminar com energia.', blocks: [
      { id: 'demo-block-1', title: 'Planejar as 3 entregas do dia', start: '08:00', end: '08:15', energy: 'baixa', days: [1,2,3,4,5], completedDates: [today] },
      { id: 'demo-block-2', title: 'Bloco de operação sem notificações', start: '09:00', end: '10:30', energy: 'alta', days: [1,2,3,4,5], completedDates: [today] },
      { id: 'demo-block-3', title: 'Revisão e encerramento', start: '18:00', end: '18:20', energy: 'media', days: [1,2,3,4,5], completedDates: [] },
    ] },
    morning: base.morning.map((item) => ({ ...item, completedDates: [today] })),
    mindNodes: [
      { id: 'demo-node-1', goalId: 'demo-goal-revenue', title: 'Aquisição', note: 'Gerar leads qualificados.', sortOrder: 0 },
      { id: 'demo-node-2', goalId: 'demo-goal-revenue', parentId: 'demo-node-1', title: 'Criativos', note: 'Separar por ângulo.', sortOrder: 0 },
      { id: 'demo-node-3', goalId: 'demo-goal-revenue', parentId: 'demo-node-1', title: 'Campanhas', note: 'Uma hipótese por conjunto.', sortOrder: 1 },
      { id: 'demo-node-4', goalId: 'demo-goal-revenue', title: 'Conversão', note: 'Página, atendimento e follow-up.', sortOrder: 1 },
    ],
    dailyNotes: [{ date: today, content: 'O que precisa acontecer hoje: revisar a campanha, organizar os criativos e encerrar sem abrir novas frentes.', updatedAt: now() }],
    activities: [
      { id: 'demo-a1', type: 'mission', title: 'Revisar métricas da campanha principal', date: today, xp: 48, coins: 38 },
      { id: 'demo-a2', type: 'focus', title: '50 minutos de foco', date: dayOffset(-1), xp: 40, coins: 20, minutes: 50 },
      { id: 'demo-a3', type: 'goal', title: 'Avancei em Estudar inglês', date: dayOffset(-2), xp: 10, coins: 5 },
      { id: 'demo-a4', type: 'routine', title: 'Planejar as 3 entregas do dia', date: dayOffset(-3), xp: 15, coins: 8 },
      { id: 'demo-a5', type: 'reward', title: 'Desbloqueei Tema Lavanda', date: dayOffset(-5), xp: 0, coins: -120 },
    ],
    screenLogs: Array.from({ length: 7 }, (_, index) => ({ date: dayOffset(index - 6), minutes: [210, 175, 145, 190, 130, 155, 95][index] })),
    rewards: base.rewards.map((reward) => reward.id === 'r1' ? { ...reward, owned: true, redemptions: 1 } : reward.id === 'r2' ? { ...reward, owned: true, redemptions: 2 } : reward),
  }
}

export function createShowcaseTeam(): TeamState {
  const workspaceId = 'showcase-workspace'; const playerA = 'showcase-kondi'; const playerB = 'showcase-rafa'; const today = localDate()
  const projects = [
    { id: 'showcase-project-x1', workspaceId, name: 'Operação Atlas', summary: 'Receber e qualificar leads com um atendimento rápido e organizado.', color: '#70977a', status: 'ativo' as const, priority: 'urgente' as const, sortOrder: 0 },
    { id: 'showcase-project-agency', workspaceId, name: 'Agência Aurora', summary: 'Entregar resultados e comunicação clara para a carteira de clientes.', color: '#9983af', status: 'ativo' as const, priority: 'importante' as const, sortOrder: 1 },
    { id: 'showcase-project-lab', workspaceId, name: 'Laboratório de ofertas', summary: 'Minerar e organizar hipóteses para os próximos testes.', color: '#c08e62', status: 'ativo' as const, priority: 'normal' as const, sortOrder: 2 },
  ]
  const goals = [
    { id: 'showcase-goal-api', workspaceId, projectId: projects[0].id, ownerId: playerA, title: 'Colocar a operação pronta para receber leads', description: 'Integração, roteiro e acompanhamento funcionando.', metric: 'etapas', target: 4, current: 2, rewardXp: 120, completed: false, status: 'andamento' as const, priority: 'urgente' as const, sortOrder: 0, deadline: dayOffset(5) },
    { id: 'showcase-goal-client', workspaceId, projectId: projects[1].id, ownerId: playerB, title: 'Fechar a semana com todos os clientes atualizados', description: 'Relatórios enviados e próximos passos combinados.', metric: 'entregas', target: 3, current: 1, rewardXp: 90, completed: false, status: 'andamento' as const, priority: 'importante' as const, sortOrder: 1, deadline: dayOffset(3) },
    { id: 'showcase-goal-offers', workspaceId, projectId: projects[2].id, title: 'Preparar três ofertas para teste', description: 'Oferta, ângulo, criativos e checklist de lançamento.', metric: 'ofertas', target: 3, current: 1, rewardXp: 90, completed: false, status: 'planejada' as const, priority: 'importante' as const, sortOrder: 2, deadline: dayOffset(12) },
  ]
  const base = { workspaceId, description: '', area: 'operacao' as const, status: 'backlog' as const, priority: 'importante' as const, points: 20, createdBy: playerA }
  const tasks = [
    { ...base, id: 'showcase-t1', projectId: projects[0].id, goalId: goals[0].id, assigneeId: playerA, title: 'Validar o número e as permissões', status: 'concluida' as const, priority: 'urgente' as const, points: 30, completedAt: now(), sortOrder: 0 },
    { ...base, id: 'showcase-t2', projectId: projects[0].id, goalId: goals[0].id, assigneeId: playerB, title: 'Revisar o roteiro de atendimento', status: 'concluida' as const, points: 20, completedAt: now(), sortOrder: 1 },
    { ...base, id: 'showcase-t3', projectId: projects[0].id, goalId: goals[0].id, assigneeId: playerA, title: 'Aguardar a revisão da integração', status: 'aguardando' as const, waitingUntil: new Date(Date.now() + 8 * 3600_000).toISOString(), sortOrder: 2 },
    { ...base, id: 'showcase-t4', projectId: projects[0].id, goalId: goals[0].id, assigneeId: playerA, dependsOnTaskId: 'showcase-t3', title: 'Fazer teste ponta a ponta com um lead', status: 'backlog' as const, priority: 'urgente' as const, points: 30, sortOrder: 3 },
    { ...base, id: 'showcase-t5', projectId: projects[1].id, goalId: goals[1].id, assigneeId: playerB, title: 'Enviar relatório do Cliente Horizonte', area: 'clientes' as const, status: 'concluida' as const, completedAt: now(), sortOrder: 0 },
    { ...base, id: 'showcase-t6', projectId: projects[1].id, goalId: goals[1].id, assigneeId: playerA, title: 'Preparar pauta da reunião semanal', area: 'clientes' as const, status: 'hoje' as const, sortOrder: 1 },
    { ...base, id: 'showcase-t7', projectId: projects[1].id, goalId: goals[1].id, assigneeId: playerB, title: 'Atualizar próximos passos no painel', area: 'clientes' as const, status: 'revisao' as const, sortOrder: 2 },
    { ...base, id: 'showcase-t8', projectId: projects[2].id, goalId: goals[2].id, assigneeId: playerA, title: 'Minerar dez anúncios do nicho', area: 'trafego' as const, status: 'andamento' as const, sortOrder: 0 },
    { ...base, id: 'showcase-t9', projectId: projects[2].id, goalId: goals[2].id, assigneeId: playerB, title: 'Agrupar criativos por ângulo', area: 'campanhas' as const, status: 'hoje' as const, sortOrder: 1 },
    { ...base, id: 'showcase-t10', projectId: projects[2].id, goalId: goals[2].id, title: 'Documentar hipótese da primeira oferta', area: 'estudo' as const, status: 'backlog' as const, priority: 'normal' as const, points: 10, sortOrder: 2 },
  ]
  return { mode: 'demo', configured: false, loading: false, error: '', user: { id: playerA, displayName: 'Kondi', avatarColor: '#72957a', workspaceXp: 540, trophies: 6 },
    profiles: [{ id: playerA, displayName: 'Kondi', avatarColor: '#72957a', workspaceXp: 540, trophies: 6 }, { id: playerB, displayName: 'Rafa', avatarColor: '#8b7faf', workspaceXp: 490, trophies: 5 }],
    workspaces: [{ id: workspaceId, name: 'Studio Norte · Demonstração', description: 'Operações e metas da dupla.', inviteCode: 'MODO-DEMO', createdBy: playerA }], activeWorkspaceId: workspaceId,
    members: [{ workspaceId, userId: playerA, role: 'owner', joinedAt: dayOffset(-60) }, { workspaceId, userId: playerB, role: 'member', joinedAt: dayOffset(-52) }], projects, goals, tasks,
    subtasks: [
      { id: 'showcase-s1', workspaceId, taskId: 'showcase-t6', title: 'Separar métricas principais', completed: true, completedAt: now(), sortOrder: 0 },
      { id: 'showcase-s2', workspaceId, taskId: 'showcase-t6', title: 'Anotar decisões pendentes', completed: false, sortOrder: 1 },
      { id: 'showcase-s3', workspaceId, taskId: 'showcase-t8', title: 'Salvar links e capturas', completed: true, completedAt: now(), sortOrder: 0 },
      { id: 'showcase-s4', workspaceId, taskId: 'showcase-t8', title: 'Classificar promessas e mecanismos', completed: false, sortOrder: 1 },
    ],
    ideas: [
      { id: 'showcase-i1', workspaceId, title: 'Biblioteca de respostas para objeções', notes: 'Transformar as melhores respostas em exemplos treináveis.', status: 'aprovada', priority: 'importante', createdBy: playerB, createdAt: now() },
      { id: 'showcase-i2', workspaceId, title: 'Revisão de criativos toda terça', notes: 'Ritual de 30 minutos com decisões registradas.', status: 'avaliando', priority: 'normal', createdBy: playerA, createdAt: now() },
    ],
    mindNodes: [
      { id: 'showcase-n1', workspaceId, goalId: goals[0].id, title: 'Integração', note: 'Conexão estável.', sortOrder: 0, createdBy: playerA },
      { id: 'showcase-n2', workspaceId, goalId: goals[0].id, parentId: 'showcase-n1', title: 'Permissões', note: 'Acessos revisados.', sortOrder: 0, createdBy: playerA },
      { id: 'showcase-n3', workspaceId, goalId: goals[0].id, title: 'Atendimento', note: 'Roteiro e velocidade.', sortOrder: 1, createdBy: playerA },
      { id: 'showcase-n4', workspaceId, goalId: goals[0].id, parentId: 'showcase-n3', title: 'Primeira resposta', note: 'Menos de cinco minutos.', sortOrder: 0, createdBy: playerB },
    ],
    activities: [
      { id: 'showcase-act1', workspaceId, userId: playerA, title: 'Validar o número e as permissões', points: 30, date: today, type: 'task' },
      { id: 'showcase-act2', workspaceId, userId: playerB, title: 'Enviar relatório do Cliente Horizonte', points: 20, date: today, type: 'task' },
      { id: 'showcase-act3', workspaceId, userId: playerA, title: 'Revisar o roteiro de atendimento', points: 20, date: dayOffset(-1), type: 'task' },
      { id: 'showcase-act4', workspaceId, userId: playerB, title: 'Sequência de 5 dias', points: 25, date: dayOffset(-2), type: 'streak' },
    ],
    habitPlans: [
      { id: 'showcase-h1', userId: playerA, workspaceId, kind: 'tabaco', mode: 'reduzir', baseline: 10, target: 6, unit: 'cigarros/dia', shareWithWorkspace: false, startedAt: dayOffset(-14) },
      { id: 'showcase-h2', userId: playerB, workspaceId, kind: 'cannabis', mode: 'reduzir', baseline: 5, target: 2, unit: 'sessões/semana', shareWithWorkspace: true, startedAt: dayOffset(-14) },
    ],
    habitLogs: [0,1,2,3,4,5,6].flatMap((offset) => [
      { id: `showcase-hl-a-${offset}`, planId: 'showcase-h1', userId: playerA, date: dayOffset(-offset), amount: [6,7,6,8,7,8,9][offset], craving: 3 },
      { id: `showcase-hl-b-${offset}`, planId: 'showcase-h2', userId: playerB, date: dayOffset(-offset), amount: offset % 3 === 0 ? 1 : 0, craving: 2 },
    ]),
  }
}
