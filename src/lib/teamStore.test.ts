import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createDemoTeamState } from './teamStore'

describe('goals-first demo workspace', () => {
  beforeEach(() => vi.stubGlobal('localStorage', { getItem: () => null, setItem: () => undefined }))

  it('contains only the operations and goals requested by the users', () => {
    const state = createDemoTeamState()
    expect(state.projects.map((item) => item.name)).toEqual(['Operação X1', 'Mineração de ofertas'])
    expect(state.goals.map((item) => item.title)).toEqual([
      'Conectar a API do WhatsApp da Meta',
      'Minerar e preparar novas ofertas para X1',
      'Aprender inglês',
    ])
    expect(state.ideas).toEqual([])
    expect(state.activities).toEqual([])
    expect(state.habitPlans).toEqual([])
  })

  it('keeps the Meta API execution steps in a verifiable order', () => {
    const state = createDemoTeamState()
    const tasks = state.tasks.filter((item) => item.goalId === 'goal-whatsapp').sort((a, b) => a.sortOrder - b.sortOrder)
    expect(tasks.slice(0, 4).map((item) => item.title)).toEqual([
      'Deixar a BM parada em um perfil por 1 dia',
      'Conectar o número',
      'Conectar a API do WhatsApp da Meta',
      'Rodar a operação X1 recebendo leads',
    ])
    expect(tasks[1].dependsOnTaskId).toBe(tasks[0].id)
    expect(tasks[2].dependsOnTaskId).toBe(tasks[1].id)
  })
})
