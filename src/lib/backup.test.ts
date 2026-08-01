import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearDemoSnapshot, createBackupDocument, loadDemoSnapshot, parseBackupDocument, saveDemoSnapshot, validateBackupDocument } from './backup'
import { createShowcasePersonal, createShowcaseTeam } from './showcaseData'
import { createInitialState } from './store'
import { createDemoTeamState } from './teamStore'

describe('complete backup and demonstration safety', () => {
  const values = new Map<string, string>()
  beforeEach(() => {
    values.clear()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    })
  })

  it('restores the exact state saved before demonstration', () => {
    const personal = createInitialState(); personal.settings.displayName = 'Configuração real'; personal.coins = 73
    const team = createDemoTeamState(); team.tasks[0].status = 'aguardando'; team.tasks[0].waitingUntil = '2026-08-02T12:00:00.000Z'
    const original = createBackupDocument(personal, team, '2026-08-01T12:00:00.000Z')
    saveDemoSnapshot(original)
    expect(createShowcasePersonal(personal.settings)).not.toEqual(personal)
    expect(createShowcaseTeam()).not.toEqual(team)
    const restored = loadDemoSnapshot()
    expect(restored?.personal).toEqual(personal)
    expect(restored?.team).toEqual(team)
    clearDemoSnapshot(); expect(loadDemoSnapshot()).toBeNull()
  })

  it('exports and imports every collection without changing its structure', () => {
    const personal = createShowcasePersonal(createInitialState().settings); const team = createShowcaseTeam()
    const document = createBackupDocument(personal, team, '2026-08-01T12:00:00.000Z')
    const imported = parseBackupDocument(JSON.stringify(document))
    expect(imported).toEqual(document)
    expect(imported.personal.mindNodes.length).toBeGreaterThan(0)
    expect(imported.personal.dailyNotes.length).toBeGreaterThan(0)
    expect(imported.team.subtasks.length).toBeGreaterThan(0)
    expect(imported.team.habitLogs.length).toBeGreaterThan(0)
  })

  it('rejects a changed file before any state can be replaced', () => {
    const document = createBackupDocument(createInitialState(), createDemoTeamState())
    document.personal.coins = 999999
    expect(() => validateBackupDocument(document)).toThrow('alterado ou está corrompido')
  })

  it('rejects broken relationships even when the file has a valid fingerprint', () => {
    const personal = createInitialState(); personal.missions.push({ id: 'task', title: 'Tarefa órfã', description: '', projectId: 'missing', duration: 10, energy: 'baixa', coins: 10, xp: 20, completed: false, createdAt: new Date().toISOString(), dueDate: '2026-08-01', priority: 'extra' })
    const document = createBackupDocument(personal, createDemoTeamState())
    expect(() => validateBackupDocument(document)).toThrow('referência quebrada')
  })
})
