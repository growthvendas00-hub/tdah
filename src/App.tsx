import { ArrowRight, Check, Coins, Trophy, X, Zap } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { GoalDialog, MilestoneDialog, MissionDialog, ProjectDialog, RoutineDialog, SearchDialog } from './components/Dialogs'
import { Navigation } from './components/Navigation'
import { useFocoState } from './hooks/useFocoState'
import { useTeamState } from './hooks/useTeamState'
import { AccountPage } from './pages/AccountPage'
import { HabitsPage } from './pages/HabitsPage'
import { PlanningPage } from './pages/PlanningPage'
import { RewardsPage } from './pages/RewardsPage'
import { SettingsPage } from './pages/SettingsPage'
import { TodayPage } from './pages/TodayPage'
import { TeamPage } from './pages/TeamPage'
import { WeekPage } from './pages/WeekPage'
import type { Mission, PlanningTab, View } from './types'

type Dialog = 'mission' | 'project' | 'goal' | 'routine' | 'search' | null

function App() {
  const { state, todayMissions, actions } = useFocoState()
  const team = useTeamState()
  const [view, setView] = useState<View>('hoje')
  const [planningTab, setPlanningTab] = useState<PlanningTab>('rotina')
  const [dialog, setDialog] = useState<Dialog>(null)
  const [missionGoalId, setMissionGoalId] = useState<string | undefined>()
  const [milestoneProjectId, setMilestoneProjectId] = useState<string | null>(null)
  const [celebration, setCelebration] = useState<Mission | null>(null)
  const [toast, setToast] = useState('')
  const [mobileMenu, setMobileMenu] = useState(false)

  const notify = useCallback((message: string) => setToast(message), [])
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(''), 3200); return () => window.clearTimeout(timer) }, [toast])
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setDialog('search') }
      if (event.key === 'Escape') { setDialog(null); setMilestoneProjectId(null) }
    }
    window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key)
  }, [])

  function navigate(next: View) { setView(next); setMobileMenu(false); window.scrollTo({ top: 0, behavior: state.settings.reducedMotion ? 'auto' : 'smooth' }) }
  function openPlanning(tab: PlanningTab) { setPlanningTab(tab); navigate('planejamento') }
  function complete(mission: Mission) { if (mission.completed) return; actions.completeMission(mission.id); setCelebration(mission) }
  const milestoneProject = state.projects.find((item) => item.id === milestoneProjectId)

  return <div className={`app-shell theme-${state.settings.activeTheme} ${state.settings.reducedMotion ? 'reduce-motion' : ''}`}>
    <Navigation state={state} teamState={team.state} view={view} mobileOpen={mobileMenu} navigate={navigate} closeMobile={() => setMobileMenu(false)} openMobile={() => setMobileMenu(true)} openSearch={() => setDialog('search')} />
    <main className="main-content">
      {view === 'hoje' && <TodayPage state={state} missions={todayMissions} actions={actions} complete={complete} openMission={() => { setMissionGoalId(undefined); setDialog('mission') }} navigate={navigate} openPlanning={openPlanning} />}
      {view === 'semana' && <WeekPage state={state} />}
      {view === 'planejamento' && <PlanningPage state={state} actions={actions} tab={planningTab} setTab={setPlanningTab} openRoutine={() => setDialog('routine')} openProject={() => setDialog('project')} openGoal={() => setDialog('goal')} openMission={(goalId) => { setMissionGoalId(goalId); setDialog('mission') }} openMilestone={setMilestoneProjectId} notify={notify} />}
      {view === 'equipe' && <TeamPage state={team.state} actions={team.actions} openAccount={() => navigate('conta')} notify={notify} />}
      {view === 'habitos' && <HabitsPage state={team.state} actions={team.actions} openAccount={() => navigate('conta')} notify={notify} />}
      {view === 'recompensas' && <RewardsPage state={state} actions={actions} notify={notify} />}
      {view === 'conta' && <AccountPage state={team.state} session={team.session} actions={team.actions} notify={notify} />}
      {view === 'configuracoes' && <SettingsPage state={state} actions={actions} teamState={team.state} teamActions={team.actions} notify={notify} />}
    </main>
    {dialog === 'mission' && <MissionDialog state={state} actions={actions} initialGoalId={missionGoalId} close={() => setDialog(null)} notify={notify} />}
    {dialog === 'project' && <ProjectDialog actions={actions} close={() => setDialog(null)} notify={notify} />}
    {dialog === 'goal' && <GoalDialog actions={actions} close={() => setDialog(null)} notify={notify} />}
    {dialog === 'routine' && <RoutineDialog actions={actions} close={() => setDialog(null)} notify={notify} />}
    {dialog === 'search' && <SearchDialog state={state} close={() => setDialog(null)} navigate={navigate} openPlanning={openPlanning} />}
    {milestoneProject && <MilestoneDialog project={milestoneProject} actions={actions} close={() => setMilestoneProjectId(null)} notify={notify} />}
    {celebration && <Celebration mission={celebration} cosmic={Boolean(state.rewards.find((item) => item.kind === 'celebration' && item.equipped))} close={() => setCelebration(null)} />}
    {toast && <div className="toast" role="status"><Check size={17} />{toast}</div>}
  </div>
}

function Celebration({ mission, cosmic, close }: { mission: Mission; cosmic: boolean; close: () => void }) {
  return <div className="dialog-layer celebration-layer"><section className={`celebration ${cosmic ? 'cosmic' : ''}`} role="dialog" aria-modal="true" aria-label="Meta concluída"><button className="icon-button celebration-close" onClick={close} aria-label="Fechar"><X size={19} /></button><div className="celebration-mark"><Trophy size={34} /></div><p className="eyebrow">PASSO CONCLUÍDO</p><h2>Isso contou.</h2><p>{mission.title}</p><div className="celebration-gains"><span><Coins size={16} />+{mission.coins}</span><span><Zap size={16} />+{mission.xp} XP</span></div><button className="primary-button" onClick={close}>Continuar no meu ritmo <ArrowRight size={16} /></button></section></div>
}

export default App
