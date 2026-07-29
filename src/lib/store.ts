import type { AppState, Energy, Mission, Project } from '../types'

const currentKey = 'foco-app-v2'
const legacyKey = 'foco-app-v1'

export function localDate(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

export function dayOffset(offset: number) {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  return localDate(date)
}

function activity(offset: number, type: AppState['activities'][number]['type'], title: string, xp: number, coins: number, minutes?: number) {
  return { id: crypto.randomUUID(), type, title, date: dayOffset(offset), xp, coins, minutes }
}

export function createInitialState(): AppState {
  const today = localDate()
  return {
    version: 2,
    coins: 80,
    xp: 140,
    level: 2,
    energy: 'media',
    settings: {
      displayName: '',
      activeTheme: 'sereno',
      reducedMotion: false,
      dailyScreenLimit: 180,
      dayStart: '08:00',
      notificationsEnabled: true,
    },
    projects: [
      { id: 'p1', name: 'TDAH Flow', color: '#86a873', why: 'Criar um sistema que deixe meus dias mais leves.', progress: 33, status: 'ativo', deadline: dayOffset(30), milestones: [
        { id: 'pm1', title: 'Definir a experiência principal', completed: true, completedAt: dayOffset(-2) },
        { id: 'pm2', title: 'Testar a rotina por uma semana', completed: false },
        { id: 'pm3', title: 'Publicar a primeira versão', completed: false },
      ] },
      { id: 'p2', name: 'Casa em ordem', color: '#d9a76c', why: 'Ter um espaço que me ajude a pensar com clareza.', progress: 50, status: 'ativo', deadline: dayOffset(14), milestones: [
        { id: 'pm4', title: 'Organizar a mesa', completed: true, completedAt: dayOffset(-1) },
        { id: 'pm5', title: 'Revisar o armário', completed: false },
      ] },
    ],
    goals: [
      { id: 'g1', title: 'Ler com constância', why: 'Quero voltar a aprender sem transformar leitura em cobrança.', area: 'pessoal', target: 12, current: 4, unit: 'sessões', deadline: dayOffset(45), rewardCoins: 120, completed: false },
      { id: 'g2', title: 'Movimentar o corpo', why: 'Minha energia melhora quando cuido do corpo.', area: 'saude', target: 8, current: 3, unit: 'dias', deadline: dayOffset(21), rewardCoins: 90, completed: false },
    ],
    missions: [
      mission('m1', 'Planejar a próxima tela do TDAH Flow', 'Escreva em uma frase o que a tela precisa resolver.', 'p1', 10, 'baixa', 20, 35, today, 'essencial'),
      mission('m2', 'Arrumar apenas a mesa', 'Só a superfície da mesa. Quando terminar, pare.', 'p2', 15, 'media', 25, 40, today, 'importante'),
      mission('m3', 'Beber água e respirar', 'Pegue um copo de água e faça três respirações lentas.', undefined, 3, 'baixa', 10, 15, today, 'extra'),
      mission('m4', 'Organizar as ideias do projeto', 'Liste sem editar tudo que está na sua cabeça.', 'p1', 20, 'alta', 35, 55, dayOffset(1), 'importante'),
    ],
    routine: {
      technique: 'sprint-gentil',
      wakeTime: '07:30',
      sleepTime: '23:00',
      intention: 'Terminar o dia com a cabeça mais leve do que comecei.',
      blocks: [
        { id: 'rb1', title: 'Começo sem pressa', start: '08:00', end: '08:30', energy: 'baixa', days: [1,2,3,4,5], completedDates: [dayOffset(-2), dayOffset(-1)] },
        { id: 'rb2', title: 'Bloco de foco principal', start: '09:00', end: '10:30', energy: 'alta', days: [1,2,3,4,5], completedDates: [dayOffset(-3), dayOffset(-1)] },
        { id: 'rb3', title: 'Fechamento do dia', start: '18:00', end: '18:15', energy: 'baixa', days: [1,2,3,4,5], completedDates: [dayOffset(-1)] },
      ],
    },
    activities: [
      activity(-6, 'mission', 'Organizei a caixa de entrada', 25, 15),
      activity(-5, 'focus', 'Sessão de foco', 20, 10, 25),
      activity(-4, 'mission', 'Revisei o planejamento', 30, 20),
      activity(-3, 'routine', 'Bloco de foco principal', 15, 10),
      activity(-3, 'focus', 'Sessão de foco', 20, 10, 25),
      activity(-2, 'mission', 'Defini a experiência principal', 35, 20),
      activity(-1, 'mission', 'Organizei a mesa', 30, 20),
      activity(-1, 'routine', 'Fechamento do dia', 15, 10),
    ],
    screenLogs: [
      { date: dayOffset(-6), minutes: 245 }, { date: dayOffset(-5), minutes: 205 },
      { date: dayOffset(-4), minutes: 230 }, { date: dayOffset(-3), minutes: 175 },
      { date: dayOffset(-2), minutes: 160 }, { date: dayOffset(-1), minutes: 190 },
      { date: today, minutes: 65 },
    ],
    rewards: [
      { id: 'r1', name: 'Tema Lavanda', description: 'Uma atmosfera violeta suave para variar o seu espaço.', cost: 120, icon: 'palette', kind: 'theme', owned: false, equipped: false, redemptions: 0 },
      { id: 'r2', name: 'Pausa sem culpa', description: 'Resgate 20 minutos de descanso escolhido por você.', cost: 60, icon: 'coffee', kind: 'break', owned: false, equipped: false, redemptions: 0 },
      { id: 'r3', name: 'Som de concentração', description: 'Ative um som ambiente suave durante o foco.', cost: 180, icon: 'music', kind: 'sound', owned: false, equipped: false, redemptions: 0 },
      { id: 'r4', name: 'Celebração Cósmica', description: 'Uma celebração especial ao concluir missões.', cost: 240, icon: 'sparkles', kind: 'celebration', owned: false, equipped: false, redemptions: 0 },
    ],
  }
}

function mission(id: string, title: string, description: string, projectId: string | undefined, duration: number, energy: Energy, coins: number, xp: number, dueDate: string, priority: Mission['priority']): Mission {
  return { id, title, description, projectId, duration, energy, coins, xp, completed: false, createdAt: new Date().toISOString(), dueDate, priority }
}

function migrateLegacy(legacy: Partial<AppState> & { name?: string; projects?: Partial<Project>[]; missions?: Partial<Mission>[] }): AppState {
  const fresh = createInitialState()
  return {
    ...fresh,
    coins: legacy.coins ?? fresh.coins,
    xp: legacy.xp ?? fresh.xp,
    level: legacy.level ?? fresh.level,
    energy: legacy.energy ?? fresh.energy,
    settings: { ...fresh.settings, displayName: legacy.name ?? fresh.settings.displayName },
    projects: legacy.projects?.map((project, index) => ({
      id: project.id ?? crypto.randomUUID(), name: project.name ?? `Projeto ${index + 1}`,
      color: project.color ?? '#86a873', why: project.why ?? '', progress: project.progress ?? 0,
      status: 'ativo', milestones: [],
    })) ?? fresh.projects,
    missions: legacy.missions?.map((item) => ({
      id: item.id ?? crypto.randomUUID(), title: item.title ?? 'Missão', description: item.description ?? '',
      projectId: item.projectId, duration: item.duration ?? 10, energy: item.energy ?? 'baixa',
      coins: item.coins ?? 10, xp: item.xp ?? 15, completed: item.completed ?? false,
      createdAt: item.createdAt ?? new Date().toISOString(), dueDate: localDate(), priority: 'importante',
      completedAt: item.completed ? new Date().toISOString() : undefined,
    })) ?? fresh.missions,
  }
}

export function loadState(): AppState {
  try {
    const current = localStorage.getItem(currentKey)
    if (current) return { ...createInitialState(), ...JSON.parse(current), version: 2 }
    const legacy = localStorage.getItem(legacyKey)
    if (legacy) return migrateLegacy(JSON.parse(legacy))
  } catch { /* use a fresh, valid state */ }
  return createInitialState()
}

export function saveState(state: AppState) {
  localStorage.setItem(currentKey, JSON.stringify(state))
}

export function clearState() {
  localStorage.removeItem(currentKey)
  localStorage.removeItem(legacyKey)
}
