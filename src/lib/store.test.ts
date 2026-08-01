import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createInitialState, loadState, saveState } from './store'

describe('local persistence and migration', () => {
  const values = new Map<string, string>()
  beforeEach(() => {
    values.clear()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    })
  })

  it('starts clean and keeps only the requested morning care reminders', () => {
    const state = createInitialState()
    expect(state.version).toBe(2)
    expect(state.projects).toEqual([])
    expect(state.goals).toEqual([])
    expect(state.missions).toEqual([])
    expect(state.activities).toEqual([])
    expect(state.screenLogs).toEqual([])
    expect(state.mindNodes).toEqual([])
    expect(state.dailyNotes).toEqual([])
    expect(state.morning.map((item) => item.kind)).toEqual(['routine', 'medication'])
  })

  it('persists and reloads user preferences', () => {
    const state = createInitialState()
    state.settings.displayName = 'Kondi'
    state.settings.activeTheme = 'lavanda'
    state.settings.colorMode = 'dark'
    saveState(state)
    const loaded = loadState()
    expect(loaded.settings.displayName).toBe('Kondi')
    expect(loaded.settings.activeTheme).toBe('lavanda')
    expect(loaded.settings.colorMode).toBe('dark')
  })

  it('adds new preference defaults to previously saved states', () => {
    const saved = createInitialState()
    const oldSettings = { ...saved.settings } as Partial<typeof saved.settings>
    delete oldSettings.colorMode
    values.set('foco-app-v3', JSON.stringify({ ...saved, settings: oldSettings }))
    expect(loadState().settings.colorMode).toBe('light')
  })

  it('migrates legacy missions and projects without losing progress', () => {
    values.set('foco-app-v1', JSON.stringify({
      name: 'Alex', coins: 310, xp: 250, level: 3, energy: 'alta',
      projects: [{ id: 'old-project', name: 'Projeto antigo', why: 'Importa', color: '#123456', progress: 70 }],
      missions: [{ id: 'old-mission', title: 'Missão antiga', description: 'Passo', duration: 15, energy: 'media', coins: 20, xp: 30, completed: true, createdAt: new Date().toISOString() }],
    }))
    const loaded = loadState()
    expect(loaded.version).toBe(2)
    expect(loaded.coins).toBe(310)
    expect(loaded.settings.displayName).toBe('Alex')
    expect(loaded.projects[0].name).toBe('Projeto antigo')
    expect(loaded.missions[0].completedAt).toBeTruthy()
    expect(loaded.goals).toEqual([])
  })

  it('recovers from malformed storage instead of crashing', () => {
    values.set('foco-app-v3', '{not-json')
    expect(loadState().version).toBe(2)
  })
})
