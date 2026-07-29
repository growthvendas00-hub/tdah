import { ArrowRight, BatteryFull, BatteryLow, BatteryMedium, Check, Clock3, Coins, Crosshair, MonitorSmartphone, Plus, Sparkles, Target, TimerReset, Zap } from 'lucide-react'
import { localDate } from '../lib/store'
import { clampProgress, currentStreak, todayActivities } from '../lib/stats'
import type { FocoActions } from '../hooks/useFocoState'
import type { AppState, Energy, Mission, PlanningTab, View } from '../types'
import { WeekChart } from '../components/WeekChart'

const energy = {
  baixa: { label: 'Leve', icon: BatteryLow }, media: { label: 'Estável', icon: BatteryMedium }, alta: { label: 'Com gás', icon: BatteryFull },
}

export function TodayPage({ state, missions, actions, complete, openMission, navigate, openPlanning }: {
  state: AppState; missions: Mission[]; actions: FocoActions; complete: (mission: Mission) => void; openMission: () => void; navigate: (view: View) => void; openPlanning: (tab: PlanningTab) => void
}) {
  const date = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())
  const active = missions.filter((item) => !item.completed).sort((a, b) => {
    const priority = { essencial: 0, importante: 1, extra: 2 }
    return Number(a.energy !== state.energy) - Number(b.energy !== state.energy) || priority[a.priority] - priority[b.priority]
  })
  const next = active[0]
  const activities = todayActivities(state)
  const completed = missions.filter((item) => item.completed).length
  const screen = state.screenLogs.find((item) => item.date === localDate())?.minutes ?? 0
  const screenProgress = clampProgress(screen, state.settings.dailyScreenLimit)
  const todayRoutine = state.routine.blocks.filter((item) => item.days.includes(new Date().getDay()))
  return <div className="page today-page">
    <section className="day-intro">
      <div><p className="eyebrow">{date}</p><h1>{state.settings.displayName ? `Oi, ${state.settings.displayName}.` : 'Oi, vamos com calma.'}</h1><p>Escolha um passo possível. O resto pode esperar um pouco.</p></div>
      <div className="energy-choice" aria-label="Como está sua energia?">
        <span>Energia agora</span>
        <div>{(Object.keys(energy) as Energy[]).map((value) => { const Icon = energy[value].icon; return <button key={value} className={state.energy === value ? 'selected' : ''} onClick={() => actions.setEnergy(value)}><Icon size={17} />{energy[value].label}</button> })}</div>
      </div>
    </section>

    <section className="next-step-card">
      <div className="next-step-main">
        <p className="card-label"><Crosshair size={15} /> PRÓXIMO PASSO SUGERIDO</p>
        {next ? <><h2>{next.title}</h2><p>{next.description}</p><div className="meta-pills"><span><Clock3 size={15} />{next.duration} min</span><span><Zap size={15} />+{next.xp} XP</span><span><Coins size={15} />+{next.coins}</span></div><button className="primary-button" onClick={() => complete(next)}><Check size={18} />Concluir passo</button></> : <><h2>Seu dia já está completo.</h2><p>Não precisa preencher o espaço só porque ele ficou livre.</p><button className="primary-button" onClick={openMission}><Plus size={18} />Adicionar se fizer sentido</button></>}
      </div>
      <div className="day-score">
        <div className="score-ring" style={{ '--score': `${missions.length ? completed / missions.length * 360 : 0}deg` } as React.CSSProperties}><strong>{completed}/{missions.length}</strong><span>passos</span></div>
        <p>{completed ? 'Você já colocou o dia em movimento.' : 'Começar pequeno ainda é começar.'}</p>
      </div>
    </section>

    <div className="dashboard-grid">
      <section className="surface daily-missions">
        <div className="section-title"><div><p className="eyebrow">TRÊS COISAS BASTAM</p><h2>Metas de hoje</h2></div><button className="quiet-button" onClick={openMission}><Plus size={16} />Nova meta</button></div>
        <div className="task-stack">{missions.length ? missions.map((mission) => <article className={`daily-task ${mission.completed ? 'done' : ''}`} key={mission.id}><button onClick={() => !mission.completed && complete(mission)} aria-label={`Concluir ${mission.title}`}><Check size={16} /></button><div><h3>{mission.title}</h3><p><span className={`priority ${mission.priority}`}>{mission.priority}</span>{mission.duration} min · {mission.energy === 'baixa' ? 'energia leve' : mission.energy === 'media' ? 'energia média' : 'energia alta'}</p></div><span className="task-coins">+{mission.coins}</span></article>) : <div className="empty-state"><Target size={28} /><h3>Nenhuma meta para hoje</h3><p>Escolha até três coisas que fariam o dia valer.</p><button onClick={openMission}>Criar primeira meta</button></div>}</div>
      </section>

      <aside className="insight-stack">
        <section className="surface screen-card"><div className="section-title compact"><div><p className="eyebrow">TELA HOJE</p><h2>{Math.floor(screen / 60)}h {screen % 60}min</h2></div><MonitorSmartphone size={21} /></div><div className="soft-progress"><i className={screenProgress > 100 ? 'over' : ''} style={{ width: `${Math.min(100, screenProgress)}%` }} /></div><p>{screenProgress <= 70 ? 'Dentro do limite que você escolheu.' : screenProgress <= 100 ? 'Chegando perto do limite. Uma pausa pode ajudar.' : 'O limite foi ultrapassado. Sem culpa: apenas observe.'}</p><div className="inline-actions"><button onClick={() => actions.addScreenMinutes(15)}>+15 min</button><button onClick={() => actions.addScreenMinutes(-15)}>-15 min</button></div></section>
        <section className="surface focus-quick"><div><TimerReset size={20} /><h3>Registrar foco</h3><p>Fez um bloco sem abrir o sistema?</p></div><button onClick={() => actions.recordFocus(25)}>+ 25 min <span>+20 XP</span></button></section>
      </aside>
    </div>

    <div className="dashboard-grid lower-grid">
      <section className="surface week-preview"><div className="section-title"><div><p className="eyebrow">ÚLTIMOS 7 DIAS</p><h2>Seu ritmo da semana</h2></div><button className="text-link" onClick={() => navigate('semana')}>Ver histórico <ArrowRight size={15} /></button></div><WeekChart state={state} /><div className="week-mini-stats"><span><strong>{activities.length}</strong> ações hoje</span><span><strong>{currentStreak(state)}</strong> dias voltando</span><span><strong>{state.goals.filter((item) => item.completed).length}</strong> objetivos alcançados</span></div></section>
      <section className="surface routine-preview"><div className="section-title compact"><div><p className="eyebrow">ROTINA DE HOJE</p><h2>Próximos blocos</h2></div><button className="icon-soft" onClick={() => openPlanning('rotina')}><ArrowRight size={16} /></button></div>{todayRoutine.length ? <div className="routine-mini-list">{todayRoutine.map((block) => { const done = block.completedDates.includes(localDate()); return <button className={done ? 'done' : ''} key={block.id} onClick={() => actions.toggleRoutineBlock(block.id)}><span>{block.start}</span><div><strong>{block.title}</strong><small>{block.end} · energia {block.energy}</small></div><Check size={16} /></button> })}</div> : <div className="empty-compact"><p>Nenhum bloco planejado para hoje.</p><button onClick={() => openPlanning('rotina')}>Planejar rotina</button></div>}</section>
    </div>

    <section className="goals-row"><div className="section-title"><div><p className="eyebrow">O QUE IMPORTA</p><h2>Objetivos em movimento</h2></div><button className="text-link" onClick={() => openPlanning('objetivos')}>Planejar objetivos <ArrowRight size={15} /></button></div><div className="goal-preview-grid">{state.goals.slice(0, 3).map((goal) => <article key={goal.id}><div><Sparkles size={16} /><span>{goal.area}</span></div><h3>{goal.title}</h3><div className="soft-progress"><i style={{ width: `${clampProgress(goal.current, goal.target)}%` }} /></div><p><strong>{goal.current}</strong> de {goal.target} {goal.unit}</p></article>)}</div></section>
  </div>
}
