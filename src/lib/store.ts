import type { AppState, Mission, Project } from '../types'

const currentKey = 'foco-app-v3'
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

export function createInitialState(): AppState {
  return {
    version: 2,
    coins: 0,
    xp: 0,
    level: 1,
    energy: 'media',
    settings: {
      displayName: '',
      activeTheme: 'sereno',
      reducedMotion: false,
      dailyScreenLimit: 180,
      dayStart: '08:00',
      notificationsEnabled: true,
    },
    projects: [],
    goals: [],
    missions: [],
    routine: {
      technique: 'sprint-gentil',
      wakeTime: '07:30',
      sleepTime: '23:00',
      intention: 'Terminar o dia com a cabeça mais leve do que comecei.',
      blocks: [],
    },
    morning: [
      { id: 'morning-wake', title: 'Acordar cedo', note: 'Marque quando começar o dia.', kind: 'routine', completedDates: [] },
      { id: 'morning-prescription', title: 'Venvanse conforme prescrição', note: 'Apenas um lembrete pessoal: não altere dose ou horário sem orientação profissional.', kind: 'medication', completedDates: [] },
    ],
    activities: [],
    screenLogs: [],
    rewards: [
      { id: 'r1', name: 'Tema Lavanda', description: 'Uma atmosfera violeta suave para variar o seu espaço.', cost: 120, icon: 'palette', kind: 'theme', owned: false, equipped: false, redemptions: 0 },
      { id: 'r2', name: 'Pausa sem culpa', description: 'Resgate 20 minutos de descanso escolhido por você.', cost: 60, icon: 'coffee', kind: 'break', owned: false, equipped: false, redemptions: 0 },
      { id: 'r3', name: 'Som de concentração', description: 'Ative um som ambiente suave durante o foco.', cost: 180, icon: 'music', kind: 'sound', owned: false, equipped: false, redemptions: 0 },
      { id: 'r4', name: 'Celebração Cósmica', description: 'Uma celebração especial ao concluir missões.', cost: 240, icon: 'sparkles', kind: 'celebration', owned: false, equipped: false, redemptions: 0 },
    ],
  }
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
