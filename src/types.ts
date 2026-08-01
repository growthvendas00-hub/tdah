export type Energy = 'baixa' | 'media' | 'alta'
export type View = 'hoje' | 'semana' | 'planejamento' | 'equipe' | 'habitos' | 'recompensas' | 'conta' | 'configuracoes'
export type PlanningTab = 'rotina' | 'projetos' | 'objetivos'
export type Theme = 'sereno' | 'lavanda'
export type ColorMode = 'light' | 'dark'
export type TechniqueId = 'pomodoro' | 'sprint-gentil' | 'timeboxing' | 'primeiro-passo'

export interface Mission {
  id: string
  title: string
  description: string
  projectId?: string
  goalId?: string
  duration: number
  energy: Energy
  coins: number
  xp: number
  completed: boolean
  createdAt: string
  dueDate: string
  completedAt?: string
  status?: 'pendente' | 'andamento' | 'aguardando' | 'concluida'
  waitingUntil?: string
  priority: 'essencial' | 'importante' | 'extra'
}

export interface Milestone {
  id: string
  title: string
  completed: boolean
  completedAt?: string
}

export interface Project {
  id: string
  name: string
  color: string
  why: string
  progress: number
  deadline?: string
  status: 'ativo' | 'pausado' | 'concluido'
  milestones: Milestone[]
}

export interface Goal {
  id: string
  title: string
  why: string
  area: 'saude' | 'carreira' | 'relacoes' | 'pessoal'
  target: number
  current: number
  unit: string
  deadline: string
  rewardCoins: number
  completed: boolean
}

export interface RoutineBlock {
  id: string
  title: string
  start: string
  end: string
  energy: Energy
  days: number[]
  completedDates: string[]
}

export interface Activity {
  id: string
  type: 'mission' | 'goal' | 'routine' | 'focus' | 'reward' | 'screen' | 'status'
  title: string
  date: string
  xp: number
  coins: number
  minutes?: number
}

export interface ScreenLog {
  date: string
  minutes: number
}

export interface Reward {
  id: string
  name: string
  description: string
  cost: number
  icon: 'palette' | 'music' | 'coffee' | 'sparkles'
  kind: 'theme' | 'sound' | 'break' | 'celebration'
  owned: boolean
  equipped: boolean
  redemptions: number
}

export interface SettingsData {
  displayName: string
  activeTheme: Theme
  colorMode: ColorMode
  reducedMotion: boolean
  dailyScreenLimit: number
  dayStart: string
  notificationsEnabled: boolean
}

export interface RoutinePlan {
  technique: TechniqueId
  wakeTime: string
  sleepTime: string
  intention: string
  blocks: RoutineBlock[]
}

export interface MorningItem {
  id: string
  title: string
  note: string
  kind: 'routine' | 'medication'
  completedDates: string[]
}

export interface MindNode {
  id: string
  goalId: string
  parentId?: string
  title: string
  note: string
  sortOrder: number
}

export interface DailyNote {
  date: string
  content: string
  updatedAt: string
}

export interface AppState {
  version: 2
  coins: number
  xp: number
  level: number
  energy: Energy
  missions: Mission[]
  projects: Project[]
  goals: Goal[]
  routine: RoutinePlan
  morning: MorningItem[]
  mindNodes: MindNode[]
  dailyNotes: DailyNote[]
  activities: Activity[]
  screenLogs: ScreenLog[]
  rewards: Reward[]
  settings: SettingsData
}

export interface Technique {
  id: TechniqueId
  name: string
  rhythm: string
  bestFor: string
  description: string
  benefit: string
}
