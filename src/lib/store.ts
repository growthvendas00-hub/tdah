import type { AppState } from '../types'

const key = 'foco-app-v1'

export const initialState: AppState = {
  name: '',
  coins: 80,
  xp: 140,
  level: 2,
  energy: 'media',
  completedToday: 1,
  projects: [
    { id: 'p1', name: 'Tdah Flow', color: '#a7f000', why: 'Criar um sistema que deixe meus dias mais leves.', progress: 24 },
    { id: 'p2', name: 'Casa em ordem', color: '#ffbd2e', why: 'Ter um espaço que me ajude a pensar com clareza.', progress: 45 },
    { id: 'p3', name: 'Cuidar de mim', color: '#00d99b', why: 'Proteger minha energia e construir constância.', progress: 62 },
  ],
  missions: [
    { id: 'm1', title: 'Definir a próxima tela do Tdah Flow', description: 'Escreva em uma frase o que a tela precisa resolver.', projectId: 'p1', duration: 10, energy: 'baixa', coins: 20, xp: 35, completed: false, createdAt: new Date().toISOString() },
    { id: 'm2', title: 'Arrumar apenas a mesa', description: 'Só a superfície da mesa. Quando terminar, pare.', projectId: 'p2', duration: 15, energy: 'media', coins: 25, xp: 40, completed: false, createdAt: new Date().toISOString() },
    { id: 'm3', title: 'Beber água e respirar', description: 'Pegue um copo de água e faça três respirações lentas.', projectId: 'p3', duration: 3, energy: 'baixa', coins: 10, xp: 15, completed: false, createdAt: new Date().toISOString() },
    { id: 'm4', title: 'Organizar as ideias do projeto', description: 'Liste sem editar tudo que está na sua cabeça.', projectId: 'p1', duration: 20, energy: 'alta', coins: 35, xp: 55, completed: false, createdAt: new Date().toISOString() },
  ],
  rewards: [
    { id: 'r1', name: 'Tema Lavanda', description: 'Uma nova atmosfera para o seu espaço.', cost: 120, icon: 'palette', owned: false },
    { id: 'r2', name: 'Pausa sem culpa', description: 'Resgate 20 minutos para fazer o que quiser.', cost: 60, icon: 'coffee', owned: false },
    { id: 'r3', name: 'Som de concentração', description: 'Desbloqueie uma paisagem sonora especial.', cost: 180, icon: 'music', owned: false },
    { id: 'r4', name: 'Celebração Cósmica', description: 'Um novo efeito ao concluir uma missão.', cost: 240, icon: 'sparkles', owned: false },
  ],
}

export function loadState(): AppState {
  try {
    const value = localStorage.getItem(key)
    return value ? { ...initialState, ...JSON.parse(value) } : initialState
  } catch {
    return initialState
  }
}

export function saveState(state: AppState) {
  localStorage.setItem(key, JSON.stringify(state))
}
