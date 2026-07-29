export type Energy = 'baixa' | 'media' | 'alta'
export type View = 'hoje' | 'projetos' | 'recompensas'

export interface Mission {
  id: string
  title: string
  description: string
  projectId?: string
  duration: number
  energy: Energy
  coins: number
  xp: number
  completed: boolean
  createdAt: string
}

export interface Project {
  id: string
  name: string
  color: string
  why: string
  progress: number
}

export interface Reward {
  id: string
  name: string
  description: string
  cost: number
  icon: 'palette' | 'music' | 'coffee' | 'sparkles'
  owned: boolean
}

export interface AppState {
  name: string
  coins: number
  xp: number
  level: number
  energy: Energy
  completedToday: number
  missions: Mission[]
  projects: Project[]
  rewards: Reward[]
}
