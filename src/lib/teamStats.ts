import { dayOffset } from './store'
import type { HabitLog, TeamActivity, TeamPriority, TeamProfile } from '../types/team'

export function pointsForPriority(priority: TeamPriority) {
  return priority === 'urgente' ? 30 : priority === 'importante' ? 20 : 10
}

export function workspaceRanking(profiles: TeamProfile[], activities: TeamActivity[], days: 1 | 7) {
  const cutoff = dayOffset(-(days - 1))
  return profiles.map((profile) => ({
    profile,
    points: activities.filter((item) => item.userId === profile.id && item.date >= cutoff).reduce((sum, item) => sum + item.points, 0),
  })).sort((a, b) => b.points - a.points || a.profile.displayName.localeCompare(b.profile.displayName))
}

export function habitAverage(logs: HabitLog[], planId: string, days = 7) {
  const cutoff = dayOffset(-(days - 1))
  const values = logs.filter((item) => item.planId === planId && item.date >= cutoff)
  if (!values.length) return null
  return Math.round(values.reduce((sum, item) => sum + item.amount, 0) / values.length * 10) / 10
}
