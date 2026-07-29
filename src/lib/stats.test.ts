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
    const stats = getWeekStats(state)
    expect(stats.reduce((sum, day) => sum + day.focus, 0)).toBe(50)
    expect(stats.reduce((sum, day) => sum + day.missions, 0)).toBe(4)
  })

  it('calculates project progress from concrete milestones', () => {
    const state = createInitialState()
    expect(projectProgress(state, 'p1')).toBe(33)
    expect(projectProgress(state, 'p2')).toBe(50)
  })

  it('clamps goal progress and treats invalid targets safely', () => {
    expect(clampProgress(5, 10)).toBe(50)
    expect(clampProgress(20, 10)).toBe(100)
    expect(clampProgress(1, 0)).toBe(0)
  })

  it('counts consecutive days with meaningful activity', () => {
    const state = createInitialState()
    state.activities.push({ id: 'today', type: 'focus', title: 'Hoje', date: dayOffset(0), xp: 10, coins: 5, minutes: 10 })
    expect(currentStreak(state)).toBeGreaterThanOrEqual(4)
  })
})
