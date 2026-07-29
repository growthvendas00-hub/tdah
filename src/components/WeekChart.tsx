import { getWeekStats } from '../lib/stats'
import type { AppState } from '../types'

const dayFormat = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' })

export function WeekChart({ state, metric = 'missions' }: { state: AppState; metric?: 'missions' | 'focus' | 'screen' }) {
  const data = getWeekStats(state)
  const max = Math.max(1, ...data.map((item) => item[metric]))
  return <div className="week-chart" aria-label={`Gráfico semanal de ${metric}`}>
    {data.map((item) => <div className="chart-column" key={item.date}>
      <span className="chart-value">{metric === 'screen' ? Math.round(item.screen / 60 * 10) / 10 : item[metric]}</span>
      <div className="chart-track"><i style={{ height: `${Math.max(5, item[metric] / max * 100)}%` }} /></div>
      <small>{dayFormat.format(new Date(`${item.date}T12:00:00`)).replace('.', '')}</small>
    </div>)}
  </div>
}
