import { describe, expect, it } from 'vitest'
import { dayOffset } from './store'
import { habitAverage, pointsForPriority, workspaceRanking } from './teamStats'
import type { TeamActivity, TeamProfile } from '../types/team'

const players: TeamProfile[] = [
  { id: 'a', displayName: 'Ana', avatarColor: '#000', workspaceXp: 0, trophies: 0 },
  { id: 'b', displayName: 'Beto', avatarColor: '#111', workspaceXp: 0, trophies: 0 },
]

describe('team gamification', () => {
  it('maps priority to predictable XP', () => {
    expect(pointsForPriority('normal')).toBe(10)
    expect(pointsForPriority('importante')).toBe(20)
    expect(pointsForPriority('urgente')).toBe(30)
  })

  it('ranks only activities inside the selected period', () => {
    const activities: TeamActivity[] = [
      { id: '1', workspaceId: 'w', userId: 'a', title: 'Hoje', points: 10, date: dayOffset(0), type: 'task' },
      { id: '2', workspaceId: 'w', userId: 'b', title: 'Semana', points: 30, date: dayOffset(-3), type: 'task' },
      { id: '3', workspaceId: 'w', userId: 'a', title: 'Antiga', points: 100, date: dayOffset(-8), type: 'task' },
    ]
    expect(workspaceRanking(players, activities, 1)[0].profile.id).toBe('a')
    expect(workspaceRanking(players, activities, 7)[0].profile.id).toBe('b')
  })

  it('calculates habit trend without treating missing days as zero', () => {
    const logs = [
      { id: '1', planId: 'p', userId: 'a', date: dayOffset(0), amount: 6 },
      { id: '2', planId: 'p', userId: 'a', date: dayOffset(-1), amount: 8 },
    ]
    expect(habitAverage(logs, 'p')).toBe(7)
    expect(habitAverage(logs, 'missing')).toBeNull()
  })
})
