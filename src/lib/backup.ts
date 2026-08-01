import type { AppState } from '../types'
import type { TeamState } from '../types/team'

export const BACKUP_FORMAT = 'foco-complete-backup'
export const BACKUP_VERSION = 1
const demoSnapshotKey = 'foco-demo-original-v1'
const recoverySnapshotKey = 'foco-import-recovery-v1'

export interface BackupDocument {
  format: typeof BACKUP_FORMAT
  version: typeof BACKUP_VERSION
  createdAt: string
  personal: AppState
  team: TeamState
  fingerprint: string
}

type BackupPayload = Omit<BackupDocument, 'fingerprint'>

function clone<T>(value: T): T { return JSON.parse(JSON.stringify(value)) as T }
function normalizedTeam(team: TeamState): TeamState { return { ...clone(team), loading: false, error: '' } }
function payloadOf(personal: AppState, team: TeamState, createdAt = new Date().toISOString()): BackupPayload {
  return { format: BACKUP_FORMAT, version: BACKUP_VERSION, createdAt, personal: clone(personal), team: normalizedTeam(team) }
}

export function fingerprint(value: unknown) {
  const text = JSON.stringify(value); let hash = 2166136261
  for (let index = 0; index < text.length; index += 1) { hash ^= text.charCodeAt(index); hash = Math.imul(hash, 16777619) }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

export function createBackupDocument(personal: AppState, team: TeamState, createdAt?: string): BackupDocument {
  const payload = payloadOf(personal, team, createdAt)
  return { ...payload, fingerprint: fingerprint(payload) }
}

function object(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === 'object' && !Array.isArray(value) }
function arrays(value: Record<string, unknown>, names: string[]) { if (names.some((name) => !Array.isArray(value[name]))) throw new Error('O backup está incompleto ou corrompido.') }
function uniqueIds(items: unknown[], label: string) {
  const ids = items.map((item) => object(item) ? item.id : undefined)
  if (ids.some((id) => typeof id !== 'string' || !id) || new Set(ids).size !== ids.length) throw new Error(`Existem identificadores inválidos em ${label}.`)
}
function references(items: unknown[], key: string, valid: Set<string>, label: string) {
  if (items.some((item) => object(item) && item[key] != null && !valid.has(String(item[key])))) throw new Error(`O backup contém uma referência quebrada em ${label}.`)
}

export function validateBackupDocument(value: unknown): BackupDocument {
  if (!object(value) || value.format !== BACKUP_FORMAT || value.version !== BACKUP_VERSION) throw new Error('Este arquivo não é um backup compatível do Foco.')
  if (typeof value.createdAt !== 'string' || typeof value.fingerprint !== 'string' || !object(value.personal) || !object(value.team)) throw new Error('O backup está incompleto ou corrompido.')
  const personal = value.personal; const team = value.team
  arrays(personal, ['missions', 'projects', 'goals', 'morning', 'mindNodes', 'dailyNotes', 'activities', 'screenLogs', 'rewards'])
  if (!object(personal.settings) || !object(personal.routine) || !Array.isArray(personal.routine.blocks) || personal.version !== 2) throw new Error('Os dados pessoais do backup não são compatíveis.')
  arrays(team, ['profiles', 'workspaces', 'members', 'projects', 'tasks', 'subtasks', 'goals', 'ideas', 'mindNodes', 'activities', 'habitPlans', 'habitLogs'])
  const checkedPersonal = personal as unknown as AppState; const checkedTeam = team as unknown as TeamState
  const payload: BackupPayload = { format: BACKUP_FORMAT, version: BACKUP_VERSION, createdAt: value.createdAt, personal: checkedPersonal, team: checkedTeam }
  if (fingerprint(payload) !== value.fingerprint) throw new Error('O arquivo foi alterado ou está corrompido.')

  uniqueIds(checkedPersonal.projects, 'projetos pessoais'); uniqueIds(checkedPersonal.goals, 'metas pessoais'); uniqueIds(checkedPersonal.missions, 'tarefas pessoais'); uniqueIds(checkedPersonal.mindNodes, 'mapa pessoal')
  const personalProjects = new Set(checkedPersonal.projects.map((item) => item.id)); const personalGoals = new Set(checkedPersonal.goals.map((item) => item.id))
  const personalNodes = new Set(checkedPersonal.mindNodes.map((item) => item.id))
  references(checkedPersonal.missions, 'projectId', personalProjects, 'tarefas pessoais'); references(checkedPersonal.missions, 'goalId', personalGoals, 'tarefas pessoais'); references(checkedPersonal.mindNodes, 'goalId', personalGoals, 'mapa pessoal'); references(checkedPersonal.mindNodes, 'parentId', personalNodes, 'mapa pessoal')

  uniqueIds(checkedTeam.workspaces, 'workspaces'); uniqueIds(checkedTeam.projects, 'operações'); uniqueIds(checkedTeam.goals, 'metas Business'); uniqueIds(checkedTeam.tasks, 'tarefas Business'); uniqueIds(checkedTeam.subtasks, 'subtarefas'); uniqueIds(checkedTeam.mindNodes, 'mapa Business')
  const workspaces = new Set(checkedTeam.workspaces.map((item) => item.id)); const profiles = new Set(checkedTeam.profiles.map((item) => item.id)); const projects = new Set(checkedTeam.projects.map((item) => item.id)); const goals = new Set(checkedTeam.goals.map((item) => item.id)); const tasks = new Set(checkedTeam.tasks.map((item) => item.id)); const mindNodes = new Set(checkedTeam.mindNodes.map((item) => item.id)); const habitPlans = new Set(checkedTeam.habitPlans.map((item) => item.id))
  if (checkedTeam.activeWorkspaceId && !workspaces.has(checkedTeam.activeWorkspaceId)) throw new Error('O workspace ativo do backup não existe.'); if (checkedTeam.user && !profiles.has(checkedTeam.user.id)) throw new Error('O jogador ativo do backup não existe.')
  references(checkedTeam.members, 'workspaceId', workspaces, 'membros'); references(checkedTeam.members, 'userId', profiles, 'membros'); references(checkedTeam.projects, 'workspaceId', workspaces, 'operações'); references(checkedTeam.goals, 'workspaceId', workspaces, 'metas Business'); references(checkedTeam.goals, 'projectId', projects, 'metas Business'); references(checkedTeam.goals, 'dependsOnGoalId', goals, 'dependências de metas'); references(checkedTeam.goals, 'ownerId', profiles, 'responsáveis de metas'); references(checkedTeam.tasks, 'workspaceId', workspaces, 'tarefas Business'); references(checkedTeam.tasks, 'projectId', projects, 'tarefas Business'); references(checkedTeam.tasks, 'goalId', goals, 'tarefas Business'); references(checkedTeam.tasks, 'dependsOnTaskId', tasks, 'dependências Business'); references(checkedTeam.tasks, 'assigneeId', profiles, 'responsáveis Business'); references(checkedTeam.tasks, 'createdBy', profiles, 'autores Business'); references(checkedTeam.subtasks, 'taskId', tasks, 'subtarefas'); references(checkedTeam.ideas, 'workspaceId', workspaces, 'ideias'); references(checkedTeam.mindNodes, 'goalId', goals, 'mapa Business'); references(checkedTeam.mindNodes, 'parentId', mindNodes, 'mapa Business'); references(checkedTeam.habitPlans, 'userId', profiles, 'hábitos'); references(checkedTeam.habitPlans, 'workspaceId', workspaces, 'hábitos'); references(checkedTeam.habitLogs, 'planId', habitPlans, 'histórico de hábitos'); references(checkedTeam.habitLogs, 'userId', profiles, 'histórico de hábitos')
  return clone(value) as unknown as BackupDocument
}

export function parseBackupDocument(text: string) {
  if (text.length > 5_000_000) throw new Error('O backup ultrapassa o limite de 5 MB.')
  try { return validateBackupDocument(JSON.parse(text)) } catch (error) { if (error instanceof SyntaxError) throw new Error('O arquivo não contém um JSON válido.', { cause: error }); throw error }
}

function save(key: string, document: BackupDocument) { localStorage.setItem(key, JSON.stringify(document)) }
function load(key: string) { const value = localStorage.getItem(key); return value ? parseBackupDocument(value) : null }
export function saveDemoSnapshot(document: BackupDocument) { const existing = localStorage.getItem(demoSnapshotKey); if (existing) { parseBackupDocument(existing); return } save(demoSnapshotKey, document) }
export function loadDemoSnapshot() { return load(demoSnapshotKey) }
export function clearDemoSnapshot() { localStorage.removeItem(demoSnapshotKey) }
export function hasDemoSnapshot() { return Boolean(localStorage.getItem(demoSnapshotKey)) }
export function saveRecoverySnapshot(document: BackupDocument) { save(recoverySnapshotKey, document) }
export function loadRecoverySnapshot() { return load(recoverySnapshotKey) }
export function clearRecoverySnapshot() { localStorage.removeItem(recoverySnapshotKey) }
export function hasRecoverySnapshot() { return Boolean(localStorage.getItem(recoverySnapshotKey)) }

export function downloadBackup(backup: BackupDocument) {
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a')
  link.href = url; link.download = `foco-backup-${backup.createdAt.slice(0, 10)}.json`; document.body.appendChild(link); link.click(); link.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 0)
}
