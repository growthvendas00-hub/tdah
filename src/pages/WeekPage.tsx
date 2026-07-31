import { Award, CalendarDays, CheckCircle2, Clock3, Coins, Flame, MonitorSmartphone, Sparkles, Zap } from 'lucide-react'
import { currentStreak, getWeekStats } from '../lib/stats'
import type { AppState } from '../types'
import { WeekChart } from '../components/WeekChart'

export function WeekPage({ state }: { state: AppState }) {
  const stats = getWeekStats(state)
  const totalMissions = stats.reduce((sum, item) => sum + item.missions, 0)
  const totalFocus = stats.reduce((sum, item) => sum + item.focus, 0)
  const totalXp = stats.reduce((sum, item) => sum + item.xp, 0)
  const averageScreen = Math.round(stats.reduce((sum, item) => sum + item.screen, 0) / 7)
  const activities = [...state.activities].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 12)
  const dateFormat = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
  return <div className="page inner-page">
    <section className="page-heading"><div><p className="eyebrow">SEM JULGAMENTO, SÓ SINAIS</p><h1>Minha semana</h1><p>Veja o que ajudou, o que pesou e onde vale ajustar.</p></div><div className="streak-pill"><Flame size={18} /><span><strong>{currentStreak(state)} dias</strong> voltando para você</span></div></section>
    <div className="metric-grid"><article><span><CheckCircle2 size={18} /></span><div><strong>{totalMissions}</strong><small>missões concluídas</small></div></article><article><span><Clock3 size={18} /></span><div><strong>{totalFocus} min</strong><small>de foco registrado</small></div></article><article><span><Zap size={18} /></span><div><strong>{totalXp} XP</strong><small>ganhos na semana</small></div></article><article><span><MonitorSmartphone size={18} /></span><div><strong>{Math.floor(averageScreen / 60)}h {averageScreen % 60}m</strong><small>média diária de tela</small></div></article></div>
    <div className="week-layout"><section className="surface large-chart"><div className="section-title"><div><p className="eyebrow">CONSISTÊNCIA</p><h2>Passos concluídos</h2></div><span>últimos 7 dias</span></div><WeekChart state={state} metric="missions" /><p className="chart-note">Dias pequenos também contam. O objetivo não é preencher todas as barras.</p></section><section className="surface screen-chart"><div className="section-title compact"><div><p className="eyebrow">TEMPO DE TELA</p><h2>Horas por dia</h2></div><MonitorSmartphone size={20} /></div><WeekChart state={state} metric="screen" /><p className="chart-note">Registro manual · limite de {Math.round(state.settings.dailyScreenLimit / 60 * 10) / 10}h</p></section></div>
    <div className="week-layout history-layout"><section className="surface activity-history"><div className="section-title"><div><p className="eyebrow">HISTÓRICO</p><h2>O que aconteceu</h2></div><CalendarDays size={20} /></div><div className="timeline">{activities.map((item) => <article key={item.id}><span className={`activity-dot ${item.type}`} /> <div><strong>{item.title}</strong><small>{dateFormat.format(new Date(`${item.date}T12:00:00`))} · {labelFor(item.type)}</small></div><div className="activity-gain">{item.xp > 0 && <span><Zap size={13} />+{item.xp}</span>}{item.coins > 0 && <span><Coins size={13} />+{item.coins}</span>}</div></article>)}</div></section><section className="surface achievement-panel"><div className="section-title compact"><div><p className="eyebrow">CONQUISTAS</p><h2>O que você alcançou</h2></div><Award size={21} /></div><Achievement icon={<Flame />} title="Voltei de novo" text={`${currentStreak(state)} dias com alguma ação registrada`} active={currentStreak(state) >= 2} /><Achievement icon={<Sparkles />} title="Primeiro objetivo" text="Conclua um objetivo de vida" active={state.goals.some((item) => item.completed)} /><Achievement icon={<Clock3 />} title="Tempo protegido" text="Registre 100 minutos de foco" active={totalFocus >= 100} /></section></div>
  </div>
}

function labelFor(type: AppState['activities'][number]['type']) { return ({ mission: 'missão', goal: 'objetivo', routine: 'rotina', focus: 'foco', reward: 'recompensa', screen: 'tela', status: 'mudança de status' } as const)[type] }
function Achievement({ icon, title, text, active }: { icon: React.ReactNode; title: string; text: string; active: boolean }) { return <article className={`achievement ${active ? 'unlocked' : ''}`}><span>{icon}</span><div><strong>{title}</strong><small>{text}</small></div>{active && <CheckCircle2 size={17} />}</article> }
