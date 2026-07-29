import { useEffect, useMemo, useState } from 'react'
import { clearState, createInitialState, loadState, localDate, saveState } from '../lib/store'
import { projectProgress } from '../lib/stats'
import type { AppState, Energy, Goal, Mission, Project, RoutineBlock, SettingsData, TechniqueId } from '../types'

function id() { return crypto.randomUUID() }
function withLevel(xp: number) { return { xp, level: Math.floor(xp / 100) + 1 } }

export function useFocoState() {
  const [state, setState] = useState<AppState>(loadState)
  useEffect(() => saveState(state), [state])
  const today = localDate()
  const todayMissions = useMemo(() => state.missions.filter((item) => item.dueDate === today), [state.missions, today])

  function completeMission(missionId: string) {
    let result: Mission | undefined
    setState((current) => {
      result = current.missions.find((item) => item.id === missionId)
      if (!result || result.completed) return current
      const mission = result
      const missions = current.missions.map((item) => item.id === missionId ? { ...item, completed: true, completedAt: new Date().toISOString() } : item)
      let projects = current.projects
      if (mission.projectId) {
        const temporary = { ...current, missions } as AppState
        projects = current.projects.map((project) => project.id === mission.projectId ? { ...project, progress: projectProgress(temporary, project.id) } : project)
      }
      return { ...current, ...withLevel(current.xp + mission.xp), missions, projects, coins: current.coins + mission.coins, activities: [...current.activities, { id: id(), type: 'mission', title: mission.title, date: today, xp: mission.xp, coins: mission.coins }] }
    })
    return result
  }

  function addMission(input: Omit<Mission, 'id' | 'createdAt' | 'completed' | 'coins' | 'xp'>) {
    const coins = Math.max(10, Math.round(input.duration * 1.5))
    setState((current) => ({ ...current, missions: [{ ...input, id: id(), createdAt: new Date().toISOString(), completed: false, coins, xp: coins + 10 }, ...current.missions] }))
  }

  function addProject(project: Omit<Project, 'id' | 'progress' | 'status' | 'milestones'>) {
    setState((current) => ({ ...current, projects: [...current.projects, { ...project, id: id(), progress: 0, status: 'ativo', milestones: [] }] }))
  }

  function addMilestone(projectId: string, title: string) {
    if (!title.trim()) return
    setState((current) => ({ ...current, projects: current.projects.map((project) => project.id === projectId ? { ...project, milestones: [...project.milestones, { id: id(), title: title.trim(), completed: false }] } : project) }))
  }

  function toggleMilestone(projectId: string, milestoneId: string) {
    setState((current) => {
      let completedTitle = ''
      let justCompleted = false
      const projects = current.projects.map((project) => {
        if (project.id !== projectId) return project
        const milestones = project.milestones.map((milestone) => {
          if (milestone.id !== milestoneId) return milestone
          justCompleted = !milestone.completed
          completedTitle = milestone.title
          return { ...milestone, completed: justCompleted, completedAt: justCompleted ? new Date().toISOString() : undefined }
        })
        const progress = milestones.length ? Math.round(milestones.filter((item) => item.completed).length / milestones.length * 100) : project.progress
        return { ...project, milestones, progress, status: progress === 100 ? 'concluido' as const : project.status === 'concluido' ? 'ativo' as const : project.status }
      })
      return { ...current, ...withLevel(current.xp + (justCompleted ? 20 : 0)), projects, coins: current.coins + (justCompleted ? 10 : 0), activities: justCompleted ? [...current.activities, { id: id(), type: 'mission', title: `Marco: ${completedTitle}`, date: today, xp: 20, coins: 10 }] : current.activities }
    })
  }

  function addGoal(goal: Omit<Goal, 'id' | 'current' | 'completed'>) {
    setState((current) => ({ ...current, goals: [...current.goals, { ...goal, id: id(), current: 0, completed: false }] }))
  }

  function advanceGoal(goalId: string, amount = 1) {
    setState((current) => {
      const goal = current.goals.find((item) => item.id === goalId)
      if (!goal || goal.completed) return current
      const next = Math.min(goal.target, goal.current + amount)
      const completed = next >= goal.target
      const xpGain = completed ? 80 : 10
      const coinGain = completed ? goal.rewardCoins : 5
      return { ...current, ...withLevel(current.xp + xpGain), coins: current.coins + coinGain, goals: current.goals.map((item) => item.id === goalId ? { ...item, current: next, completed } : item), activities: [...current.activities, { id: id(), type: 'goal', title: completed ? `Objetivo alcançado: ${goal.title}` : `Avancei em ${goal.title}`, date: today, xp: xpGain, coins: coinGain }] }
    })
  }

  function addRoutineBlock(block: Omit<RoutineBlock, 'id' | 'completedDates'>) {
    setState((current) => ({ ...current, routine: { ...current.routine, blocks: [...current.routine.blocks, { ...block, id: id(), completedDates: [] }] } }))
  }

  function toggleRoutineBlock(blockId: string) {
    setState((current) => {
      const block = current.routine.blocks.find((item) => item.id === blockId)
      if (!block) return current
      const completed = !block.completedDates.includes(today)
      const blocks = current.routine.blocks.map((item) => item.id === blockId ? { ...item, completedDates: completed ? [...item.completedDates, today] : item.completedDates.filter((date) => date !== today) } : item)
      return { ...current, ...withLevel(current.xp + (completed ? 15 : 0)), coins: current.coins + (completed ? 8 : 0), routine: { ...current.routine, blocks }, activities: completed ? [...current.activities, { id: id(), type: 'routine', title: block.title, date: today, xp: 15, coins: 8 }] : current.activities }
    })
  }

  function setTechnique(technique: TechniqueId) { setState((current) => ({ ...current, routine: { ...current.routine, technique } })) }
  function updateRoutine(values: Partial<Pick<AppState['routine'], 'wakeTime' | 'sleepTime' | 'intention'>>) { setState((current) => ({ ...current, routine: { ...current.routine, ...values } })) }

  function recordFocus(minutes: number) {
    const xpGain = Math.max(10, Math.round(minutes * .8)); const coinGain = Math.max(5, Math.round(minutes * .4))
    setState((current) => ({ ...current, ...withLevel(current.xp + xpGain), coins: current.coins + coinGain, activities: [...current.activities, { id: id(), type: 'focus', title: `${minutes} minutos de foco`, date: today, xp: xpGain, coins: coinGain, minutes }] }))
  }

  function addScreenMinutes(minutes: number) {
    setState((current) => ({ ...current, screenLogs: current.screenLogs.some((item) => item.date === today) ? current.screenLogs.map((item) => item.date === today ? { ...item, minutes: Math.max(0, item.minutes + minutes) } : item) : [...current.screenLogs, { date: today, minutes: Math.max(0, minutes) }] }))
  }

  function useReward(rewardId: string) {
    setState((current) => {
      const reward = current.rewards.find((item) => item.id === rewardId)
      if (!reward) return current
      if (reward.kind === 'theme' && reward.owned) {
        const activating = !reward.equipped
        return { ...current, settings: { ...current.settings, activeTheme: activating ? 'lavanda' : 'sereno' }, rewards: current.rewards.map((item) => item.kind === 'theme' ? { ...item, equipped: activating && item.id === rewardId } : item) }
      }
      if (reward.kind !== 'break' && reward.owned) return { ...current, rewards: current.rewards.map((item) => item.id === rewardId ? { ...item, equipped: !item.equipped } : item) }
      if (current.coins < reward.cost) return current
      const consumable = reward.kind === 'break'
      return { ...current, coins: current.coins - reward.cost, rewards: current.rewards.map((item) => item.id === rewardId ? { ...item, owned: consumable ? item.owned : true, equipped: reward.kind === 'theme', redemptions: item.redemptions + 1 } : reward.kind === 'theme' ? { ...item, equipped: false } : item), settings: reward.kind === 'theme' ? { ...current.settings, activeTheme: 'lavanda' } : current.settings, activities: [...current.activities, { id: id(), type: 'reward', title: `${consumable ? 'Resgatei' : 'Desbloqueei'} ${reward.name}`, date: today, xp: 0, coins: -reward.cost }] }
    })
  }

  function updateSettings(values: Partial<SettingsData>) {
    setState((current) => ({ ...current, settings: { ...current.settings, ...values }, rewards: values.activeTheme ? current.rewards.map((item) => item.kind === 'theme' ? { ...item, equipped: values.activeTheme === 'lavanda' && item.owned } : item) : current.rewards }))
  }
  function setEnergy(energy: Energy) { setState((current) => ({ ...current, energy })) }
  function resetAll() { clearState(); setState(createInitialState()) }

  return { state, todayMissions, actions: { completeMission, addMission, addProject, addMilestone, toggleMilestone, addGoal, advanceGoal, addRoutineBlock, toggleRoutineBlock, setTechnique, updateRoutine, recordFocus, addScreenMinutes, useReward, updateSettings, setEnergy, resetAll } }
}

export type FocoActions = ReturnType<typeof useFocoState>['actions']
