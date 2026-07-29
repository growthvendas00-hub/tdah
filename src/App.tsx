import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight, BatteryLow, BatteryMedium, BatteryFull, Check, ChevronRight,
  Clock3, Coffee, Coins, FolderKanban, Gift, Home, Menu, Music2, Palette,
  Plus, Settings, Sparkles, Target, Trophy, X, Zap, Search, Bell,
} from 'lucide-react'
import { loadState, saveState } from './lib/store'
import type { AppState, Energy, Mission, Project, View } from './types'

const energyInfo = {
  baixa: { label: 'Pouca', icon: BatteryLow, help: 'Vamos no modo leve' },
  media: { label: 'Média', icon: BatteryMedium, help: 'Um passo de cada vez' },
  alta: { label: 'Alta', icon: BatteryFull, help: 'Hora de aproveitar o embalo' },
}

function App() {
  const [state, setState] = useState<AppState>(loadState)
  const [view, setView] = useState<View>('hoje')
  const [missionModal, setMissionModal] = useState(false)
  const [projectModal, setProjectModal] = useState(false)
  const [celebration, setCelebration] = useState<Mission | null>(null)
  const [toast, setToast] = useState('')
  const [mobileMenu, setMobileMenu] = useState(false)

  useEffect(() => saveState(state), [state])
  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2800)
    return () => window.clearTimeout(timer)
  }, [toast])

  const activeMissions = useMemo(
    () => state.missions.filter((m) => !m.completed).sort((a, b) => {
      const energyMatch = Number(b.energy === state.energy) - Number(a.energy === state.energy)
      return energyMatch || a.duration - b.duration
    }),
    [state.missions, state.energy],
  )
  const nextMission = activeMissions[0]
  const levelProgress = Math.min(100, state.xp % 100)

  function completeMission(id: string) {
    const mission = state.missions.find((item) => item.id === id)
    if (!mission || mission.completed) return
    const nextXp = state.xp + mission.xp
    const leveledUp = Math.floor(nextXp / 100) + 1 > state.level
    setState((current) => ({
      ...current,
      coins: current.coins + mission.coins,
      xp: nextXp,
      level: Math.floor(nextXp / 100) + 1,
      completedToday: current.completedToday + 1,
      missions: current.missions.map((item) => item.id === id ? { ...item, completed: true } : item),
      projects: current.projects.map((project) => project.id === mission.projectId
        ? { ...project, progress: Math.min(100, project.progress + 8) }
        : project),
    }))
    setCelebration(mission)
    if (leveledUp) setToast('Novo nível desbloqueado!')
  }

  function buyReward(id: string) {
    const reward = state.rewards.find((item) => item.id === id)
    if (!reward || reward.owned) return
    if (state.coins < reward.cost) {
      setToast(`Faltam ${reward.cost - state.coins} moedas. Mais uma missão chega lá.`)
      return
    }
    setState((current) => ({
      ...current,
      coins: current.coins - reward.cost,
      rewards: current.rewards.map((item) => item.id === id ? { ...item, owned: true } : item),
    }))
    setToast(`${reward.name} desbloqueado!`)
  }

  function navigate(next: View) {
    setView(next)
    setMobileMenu(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="app-shell">
      <Sidebar view={view} navigate={navigate} state={state} mobileMenu={mobileMenu} close={() => setMobileMenu(false)} />
      <main className="main-content">
        <header className="topbar">
          <button className="icon-button mobile-only" onClick={() => setMobileMenu(true)} aria-label="Abrir menu"><Menu size={21} /></button>
          <div className="mobile-brand"><LogoMark /><span>Foco</span></div>
          <div className="topbar-level">
            <span><Zap size={13} /> NÍVEL {state.level}</span>
            <div className="topbar-progress"><i style={{ width: `${state.xp % 100}%` }} /></div>
            <strong>{state.xp % 100}</strong><small>/ 100 XP</small>
          </div>
          <div className="topbar-actions">
            <div className="coin-pill"><Coins size={17} /><strong>{state.coins}</strong><span>moedas</span></div>
            <button className="icon-button notification-button" aria-label="Notificações"><Bell size={18} /></button>
            <button className="avatar" aria-label="Perfil">F</button>
          </div>
        </header>

        {view === 'hoje' && (
          <TodayView
            state={state}
            setEnergy={(energy) => setState((current) => ({ ...current, energy }))}
            missions={activeMissions}
            nextMission={nextMission}
            completeMission={completeMission}
            openMission={() => setMissionModal(true)}
            openProjects={() => navigate('projetos')}
            levelProgress={levelProgress}
          />
        )}
        {view === 'projetos' && <ProjectsView state={state} openProject={() => setProjectModal(true)} openMission={() => setMissionModal(true)} />}
        {view === 'recompensas' && <RewardsView state={state} buy={buyReward} />}
      </main>

      {missionModal && <MissionModal projects={state.projects} close={() => setMissionModal(false)} add={(mission) => {
        setState((current) => ({ ...current, missions: [mission, ...current.missions] }))
        setMissionModal(false)
        setToast('Missão pronta. Um passo pequeno já conta.')
      }} />}
      {projectModal && <ProjectModal close={() => setProjectModal(false)} add={(project) => {
        setState((current) => ({ ...current, projects: [...current.projects, project] }))
        setProjectModal(false)
        setToast('Projeto criado. Agora vamos por partes.')
      }} />}
      {celebration && <Celebration mission={celebration} close={() => setCelebration(null)} />}
      {toast && <div className="toast" role="status"><Check size={18} />{toast}</div>}
    </div>
  )
}

function LogoMark() {
  return <div className="logo-mark"><span /><span /><span /></div>
}

function Sidebar({ view, navigate, state, mobileMenu, close }: { view: View; navigate: (view: View) => void; state: AppState; mobileMenu: boolean; close: () => void }) {
  const nav = [
    { id: 'hoje' as View, label: 'Meu dia', icon: Home },
    { id: 'projetos' as View, label: 'Projetos', icon: FolderKanban },
    { id: 'recompensas' as View, label: 'Recompensas', icon: Gift },
  ]
  return <>
    {mobileMenu && <button className="sidebar-backdrop" onClick={close} aria-label="Fechar menu" />}
    <aside className={`sidebar ${mobileMenu ? 'open' : ''}`}>
      <div className="brand"><LogoMark /><span>Foco</span><button className="icon-button mobile-only" onClick={close}><X size={20} /></button></div>
      <div className="sidebar-balance"><span><Coins size={13} /> SALDO DE FOCO</span><strong>{state.coins} moedas</strong></div>
      <div className="sidebar-search"><Search size={15} /><span>Buscar no seu espaço...</span></div>
      <nav aria-label="Principal">
        <p className="nav-label">SEU ESPAÇO</p>
        {nav.map((item) => <button key={item.id} className={view === item.id ? 'active' : ''} onClick={() => navigate(item.id)}><item.icon size={19} /><span>{item.label}</span>{item.id === 'recompensas' && <span className="nav-badge">{state.rewards.filter(r => !r.owned).length}</span>}</button>)}
      </nav>
      <div className="sidebar-spacer" />
      <div className="level-mini">
        <div className="level-icon"><Zap size={17} /></div>
        <div><span>Nível {state.level}</span><small>{100 - state.xp % 100} XP para subir</small></div>
        <div className="mini-progress"><span style={{ width: `${state.xp % 100}%` }} /></div>
      </div>
      <button className="settings-button"><Settings size={18} />Configurações</button>
    </aside>
  </>
}

function TodayView({ state, setEnergy, missions, nextMission, completeMission, openMission, openProjects, levelProgress }: {
  state: AppState; setEnergy: (energy: Energy) => void; missions: Mission[]; nextMission?: Mission; completeMission: (id: string) => void; openMission: () => void; openProjects: () => void; levelProgress: number
}) {
  const date = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())
  return <div className="page today-page">
    <section className="welcome-row">
      <div><p className="eyebrow">{date}</p><h1>{state.name ? `Bom dia, ${state.name}.` : 'Bom dia.'}</h1><p>Sem pressa. Qual é o tamanho da sua energia agora?</p></div>
      <div className="energy-picker" aria-label="Nível de energia">
        {(Object.keys(energyInfo) as Energy[]).map((energy) => {
          const Icon = energyInfo[energy].icon
          return <button key={energy} className={state.energy === energy ? 'selected' : ''} onClick={() => setEnergy(energy)} title={energyInfo[energy].help}><Icon size={19} /><span>{energyInfo[energy].label}</span></button>
        })}
      </div>
    </section>

    <section className="focus-card">
      <div className="focus-copy">
        <div className="section-kicker"><Target size={16} />PRÓXIMO PASSO</div>
        {nextMission ? <>
          <h2>{nextMission.title}</h2>
          <p>{nextMission.description}</p>
          <div className="mission-meta"><span><Clock3 size={16} />{nextMission.duration} min</span><span><Zap size={16} />{nextMission.xp} XP</span><span><Coins size={16} />{nextMission.coins}</span></div>
          <button className="primary-button" onClick={() => completeMission(nextMission.id)}><span className="play-dot"><Check size={17} /></span>Concluir missão</button>
        </> : <div className="empty-focus"><h2>Você zerou as missões de hoje.</h2><p>Isso já é suficiente. Se quiser, crie só mais um passo pequeno.</p><button className="primary-button" onClick={openMission}><Plus size={18} />Nova missão</button></div>}
      </div>
      <div className="focus-visual" aria-hidden="true"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="planet"><Sparkles size={30} /></div><span className="star s1" /><span className="star s2" /><span className="star s3" /></div>
    </section>

    <div className="content-grid">
      <section className="missions-section">
        <div className="section-header"><div><p className="eyebrow">NO SEU RITMO</p><h2>Missões de agora</h2></div><button className="text-button" onClick={openMission}><Plus size={17} />Criar missão</button></div>
        <div className="mission-list">
          {missions.slice(0, 3).map((mission) => {
            const project = state.projects.find((item) => item.id === mission.projectId)
            return <article className="mission-row" key={mission.id}>
              <button className="mission-check" onClick={() => completeMission(mission.id)} aria-label={`Concluir ${mission.title}`}><Check size={17} /></button>
              <div className="mission-main"><h3>{mission.title}</h3><div className="mission-details">{project && <span><i style={{ background: project.color }} />{project.name}</span>}<span><Clock3 size={14} />{mission.duration} min</span></div></div>
              <div className="mission-reward"><Coins size={15} />+{mission.coins}</div>
            </article>
          })}
        </div>
      </section>

      <aside className="day-summary">
        <div className="summary-head"><div><p className="eyebrow">SEU PROGRESSO</p><h2>Hoje já contou</h2></div><Trophy size={22} /></div>
        <div className="completion-number"><strong>{state.completedToday}</strong><span>missões<br />concluídas</span></div>
        <div className="level-line"><span>Nível {state.level}</span><span>{state.xp % 100}/100 XP</span></div>
        <div className="progress-track"><span style={{ width: `${levelProgress}%` }} /></div>
        <p className="kind-note">Constância não é fazer tudo. É voltar quando der.</p>
      </aside>
    </div>

    <section className="projects-preview">
      <div className="section-header"><div><p className="eyebrow">VISÃO GERAL</p><h2>Projetos em movimento</h2></div><button className="text-button" onClick={openProjects}>Ver todos<ArrowRight size={17} /></button></div>
      <div className="project-strip">{state.projects.slice(0, 3).map((project) => <ProjectCard project={project} key={project.id} />)}</div>
    </section>
  </div>
}

function ProjectCard({ project }: { project: Project }) {
  return <article className="project-card"><div className="project-color" style={{ background: project.color }}><FolderKanban size={20} /></div><div className="project-copy"><h3>{project.name}</h3><p>{project.why}</p><div className="project-progress"><span style={{ width: `${project.progress}%`, background: project.color }} /></div><small>{project.progress}% avançado</small></div><ChevronRight size={19} className="card-arrow" /></article>
}

function ProjectsView({ state, openProject, openMission }: { state: AppState; openProject: () => void; openMission: () => void }) {
  return <div className="page inner-page"><section className="page-title"><div><p className="eyebrow">SEU MAPA</p><h1>Projetos</h1><p>Grandes ideias ficam mais leves quando viram passos pequenos.</p></div><button className="primary-button compact" onClick={openProject}><Plus size={18} />Novo projeto</button></section>
    <div className="project-grid">{state.projects.map((project) => {
      const total = state.missions.filter(m => m.projectId === project.id).length
      const done = state.missions.filter(m => m.projectId === project.id && m.completed).length
      return <article className="project-full-card" key={project.id} style={{ '--project-color': project.color } as React.CSSProperties}>
        <div className="project-full-top"><div className="project-color big" style={{ background: project.color }}><FolderKanban size={23} /></div><span>{done}/{total} missões</span></div>
        <h2>{project.name}</h2><p>{project.why}</p><div className="project-progress large"><span style={{ width: `${project.progress}%`, background: project.color }} /></div>
        <div className="project-full-bottom"><strong>{project.progress}%</strong><button onClick={openMission}>Adicionar passo<Plus size={16} /></button></div>
      </article>
    })}<button className="new-project-card" onClick={openProject}><span><Plus size={22} /></span><strong>Criar outro projeto</strong><small>Comece com o porquê, não com a lista.</small></button></div>
  </div>
}

function RewardsView({ state, buy }: { state: AppState; buy: (id: string) => void }) {
  const iconMap = { palette: Palette, music: Music2, coffee: Coffee, sparkles: Sparkles }
  return <div className="page inner-page"><section className="page-title rewards-title"><div><p className="eyebrow">SUAS CONQUISTAS</p><h1>Loja de recompensas</h1><p>Seu esforço vira pequenas coisas que deixam o caminho mais gostoso.</p></div><div className="wallet"><Coins size={22} /><div><strong>{state.coins}</strong><span>moedas disponíveis</span></div></div></section>
    <div className="reward-grid">{state.rewards.map((reward) => { const Icon = iconMap[reward.icon]; const canBuy = state.coins >= reward.cost
      return <article className={`reward-card ${reward.owned ? 'owned' : ''}`} key={reward.id}><div className="reward-art"><Icon size={36} /></div><div className="reward-body"><div className="reward-title-row"><h2>{reward.name}</h2>{reward.owned && <span className="owned-label"><Check size={13} />Seu</span>}</div><p>{reward.description}</p><button disabled={reward.owned} className={canBuy ? 'can-buy' : ''} onClick={() => buy(reward.id)}>{reward.owned ? 'Desbloqueado' : <><Coins size={16} />{reward.cost}</>}</button></div></article>
    })}</div><div className="reward-note"><Sparkles size={20} /><div><strong>Recompensas reais também valem</strong><p>Em breve você poderá criar recompensas como “pedir meu lanche favorito” ou “uma hora de jogo sem culpa”.</p></div></div>
  </div>
}

function MissionModal({ projects, close, add }: { projects: Project[]; close: () => void; add: (mission: Mission) => void }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState(10)
  const [energy, setEnergy] = useState<Energy>('baixa')
  const [projectId, setProjectId] = useState(projects[0]?.id || '')
  const valid = title.trim().length >= 3
  function submit(event: React.FormEvent) { event.preventDefault(); if (!valid) return; const coins = Math.max(10, Math.round(duration * 1.5)); add({ id: crypto.randomUUID(), title: title.trim(), description: description.trim() || 'Só comece. O próximo passo aparece depois.', duration, energy, projectId: projectId || undefined, coins, xp: coins + 10, completed: false, createdAt: new Date().toISOString() }) }
  return <div className="modal-layer" role="presentation"><div className="modal" role="dialog" aria-modal="true" aria-labelledby="mission-title"><div className="modal-head"><div><p className="eyebrow">UM PASSO DE CADA VEZ</p><h2 id="mission-title">Nova missão</h2></div><button className="icon-button" onClick={close} aria-label="Fechar"><X size={20} /></button></div><form onSubmit={submit}>
    <label>O que você quer tirar da cabeça?<input autoFocus value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex.: responder a mensagem da Ana" /></label>
    <label>Primeiro passo <span>opcional</span><textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Deixe tão pequeno que fique fácil começar" rows={3} /></label>
    <div className="form-row"><label>Tempo<select value={duration} onChange={e => setDuration(Number(e.target.value))}><option value={3}>3 minutos</option><option value={5}>5 minutos</option><option value={10}>10 minutos</option><option value={15}>15 minutos</option><option value={25}>25 minutos</option><option value={45}>45 minutos</option></select></label><label>Projeto<select value={projectId} onChange={e => setProjectId(e.target.value)}><option value="">Sem projeto</option>{projects.map(p => <option value={p.id} key={p.id}>{p.name}</option>)}</select></label></div>
    <fieldset><legend>Energia necessária</legend><div className="energy-options">{(Object.keys(energyInfo) as Energy[]).map(item => { const Icon = energyInfo[item].icon; return <button type="button" className={energy === item ? 'selected' : ''} onClick={() => setEnergy(item)} key={item}><Icon size={18} />{energyInfo[item].label}</button> })}</div></fieldset>
    <div className="reward-preview"><Coins size={18} /><span>Vale <strong>{Math.max(10, Math.round(duration * 1.5))} moedas</strong> ao concluir</span></div>
    <div className="modal-actions"><button type="button" className="secondary-button" onClick={close}>Cancelar</button><button className="primary-button compact" disabled={!valid}>Criar missão<ArrowRight size={17} /></button></div>
  </form></div></div>
}

function ProjectModal({ close, add }: { close: () => void; add: (project: Project) => void }) {
  const [name, setName] = useState('')
  const [why, setWhy] = useState('')
  const [color, setColor] = useState('#a7f000')
  const colors = ['#a7f000', '#ffbd2e', '#00d99b', '#42c7f5', '#b38cff']
  function submit(e: React.FormEvent) { e.preventDefault(); if (name.trim().length < 2) return; add({ id: crypto.randomUUID(), name: name.trim(), why: why.trim() || 'Um projeto importante para mim.', color, progress: 0 }) }
  return <div className="modal-layer"><div className="modal small" role="dialog" aria-modal="true"><div className="modal-head"><div><p className="eyebrow">NOVA JORNADA</p><h2>Novo projeto</h2></div><button className="icon-button" onClick={close}><X size={20} /></button></div><form onSubmit={submit}><label>Nome do projeto<input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Ex.: organizar minha mudança" /></label><label>Por que isso importa?<textarea value={why} onChange={e => setWhy(e.target.value)} placeholder="Essa frase vai te lembrar do motivo nos dias difíceis" rows={3} /></label><fieldset><legend>Cor do projeto</legend><div className="color-options">{colors.map(item => <button type="button" key={item} onClick={() => setColor(item)} className={color === item ? 'selected' : ''} style={{ background: item }} aria-label={`Escolher cor ${item}`}>{color === item && <Check size={16} />}</button>)}</div></fieldset><div className="modal-actions"><button type="button" className="secondary-button" onClick={close}>Cancelar</button><button className="primary-button compact" disabled={name.trim().length < 2}>Criar projeto</button></div></form></div></div>
}

function Celebration({ mission, close }: { mission: Mission; close: () => void }) {
  return <div className="modal-layer celebration-layer"><div className="celebration"><button className="icon-button celebration-close" onClick={close}><X size={20} /></button><div className="celebration-icon"><Trophy size={40} /><span className="burst b1" /><span className="burst b2" /><span className="burst b3" /></div><p className="eyebrow">MISSÃO CONCLUÍDA</p><h2>Você fez acontecer.</h2><p>{mission.title}</p><div className="celebration-rewards"><span><Coins size={18} />+{mission.coins}</span><span><Zap size={18} />+{mission.xp} XP</span></div><button className="primary-button" onClick={close}>Continuar no meu ritmo<ArrowRight size={17} /></button></div></div>
}

export default App
