import { describe, expect, it } from 'vitest'
import { createInitialState, dayOffset } from './store'
import { clampProgress, currentStreak, getWeekStats, projectProgress } from './stats'

describe('weekly statistics', () => {
  it('always returns the last seven calendar days in order', () => {
    const stats = getWeekStats(createInitialState())
    expect(stats).toHaveLength(7)
    expect(stats[0].date).toBe(dayOffset(-6))
    expect(stats[6].date).toBe(dayOffset(0))
  })

  it('aggregates focus minutes and missions from dated activities', () => {
    const state = createInitialState()
    state.activities.push(
      { id: 'focus', type: 'focus', title: 'Foco', date: dayOffset(0), xp: 10, coins: 5, minutes: 50 },
      { id: 'mission-1', type: 'mission', title: 'Entrega 1', date: dayOffset(0), xp: 10, coins: 5 },
      { id: 'mission-2', type: 'mission', title: 'Entrega 2', date: dayOffset(-1), xp: 10, coins: 5 },
    )
    const stats = getWeekStats(state)
    expect(stats.reduce((sum, day) => sum + day.focus, 0)).toBe(50)
    expect(stats.reduce((sum, day) => sum + day.missions, 0)).toBe(2)
  })

  it('calculates project progress from concrete milestones', () => {
    const state = createInitialState()
    state.projects.push({ id: 'p1', name: 'Projeto', color: '#000', why: '', progress: 0, status: 'ativo', milestones: [
      { id: 'm1', title: 'Um', completed: true }, { id: 'm2', title: 'Dois', completed: false },
    ] })
    expect(projectProgress(state, 'p1')).toBe(50)
    expect(projectProgress(state, 'missing')).toBe(0)
  })

  it('clamps goal progress and treats invalid targets safely', () => {
    expect(clampProgress(5, 10)).toBe(50)
    expect(clampProgress(20, 10)).toBe(100)
    expect(clampProgress(1, 0)).toBe(0)
  })

  it('counts consecutive days with meaningful activity', () => {
    const state = createInitialState()
    state.activities.push(
      { id: 'today', type: 'focus', title: 'Hoje', date: dayOffset(0), xp: 10, coins: 5, minutes: 10 },
      { id: 'yesterday', type: 'mission', title: 'Ontem', date: dayOffset(-1), xp: 10, coins: 5 },
    )
    expect(currentStreak(state)).toBe(2)
  })
})
