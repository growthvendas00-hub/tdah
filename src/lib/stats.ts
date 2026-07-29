import type { Activity, AppState } from '../types'
import { dayOffset, localDate } from './store'

export function weekDays() {
  return Array.from({ length: 7 }, (_, index) => dayOffset(index - 6))
}

export function activitiesForDate(activities: Activity[], date: string) {
  return activities.filter((item) => item.date === date)
}

export function getWeekStats(state: AppState) {
  return weekDays().map((date) => {
    const activities = activitiesForDate(state.activities, date)
    return {
      date,
      missions: activities.filter((item) => item.type === 'mission').length,
      focus: activities.filter((item) => item.type === 'focus').reduce((sum, item) => sum + (item.minutes ?? 0), 0),
      xp: activities.reduce((sum, item) => sum + item.xp, 0),
      screen: state.screenLogs.find((item) => item.date === date)?.minutes ?? 0,
    }
  })
}

export function todayActivities(state: AppState) {
  return activitiesForDate(state.activities, localDate())
}

export function currentStreak(state: AppState) {
  let streak = 0
  for (let offset = 0; offset > -30; offset -= 1) {
    if (state.activities.some((item) => item.date === dayOffset(offset) && item.type !== 'screen')) streak += 1
    else if (offset !== 0) break
  }
  return streak
}

export function projectProgress(state: AppState, projectId: string) {
  const project = state.projects.find((item) => item.id === projectId)
  if (!project) return 0
  const milestones = project.milestones
  if (milestones.length) return Math.round(milestones.filter((item) => item.completed).length / milestones.length * 100)
  const missions = state.missions.filter((item) => item.projectId === projectId)
  return missions.length ? Math.round(missions.filter((item) => item.completed).length / missions.length * 100) : project.progress
}

export function clampProgress(value: number, target: number) {
  if (target <= 0) return 0
  return Math.min(100, Math.round(value / target * 100))
}
