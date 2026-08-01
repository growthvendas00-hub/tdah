import { BarChart3, Bell, BriefcaseBusiness, CalendarRange, Coins, Gift, HeartPulse, Home, Menu, Search, Settings, UserCircle, X, Zap } from 'lucide-react'
import type { AppState, View } from '../types'
import type { TeamState } from '../types/team'
import { localDate } from '../lib/store'

function Logo() { return <div className="logo-symbol"><span /><span /></div> }

export function Navigation({ state, teamState, view, mobileOpen, navigate, closeMobile, openMobile, openSearch }: {
  state: AppState; teamState: TeamState; view: View; mobileOpen: boolean; navigate: (view: View) => void; closeMobile: () => void; openMobile: () => void; openSearch: () => void
}) {
  const nav = [
    { id: 'hoje' as View, label: 'Meu dia', icon: Home },
    { id: 'semana' as View, label: 'Minha semana', icon: BarChart3 },
    { id: 'planejamento' as View, label: 'Planejamento', icon: CalendarRange },
    { id: 'equipe' as View, label: 'Metas Business', icon: BriefcaseBusiness },
    { id: 'habitos' as View, label: 'Hábitos', icon: HeartPulse },
    { id: 'recompensas' as View, label: 'Recompensas', icon: Gift },
  ]
  const todayCount = state.activities.filter((item) => item.date === localDate()).length
  return <>
    {mobileOpen && <button className="nav-backdrop" onClick={closeMobile} aria-label="Fechar menu" />}
    <aside className={`side-nav ${mobileOpen ? 'open' : ''}`}>
      <div className="side-brand"><Logo /><span>Foco</span><small>beta</small><button className="icon-button mobile-close" onClick={closeMobile} aria-label="Fechar menu"><X size={19} /></button></div>
      <button className="search-trigger" onClick={openSearch}><Search size={16} /><span>Buscar...</span><kbd>⌘ K</kbd></button>
      <nav aria-label="Navegação principal">
        <p className="nav-heading">ORGANIZAR</p>
        {nav.map(({ id, label, icon: Icon }) => <button key={id} className={view === id ? 'active' : ''} onClick={() => navigate(id)}><Icon size={18} /><span>{label}</span>{id === 'semana' && todayCount > 0 && <i>{todayCount}</i>}</button>)}
      </nav>
      <div className="side-spacer" />
      <div className="level-card">
        <div className="level-card-head"><span><Zap size={15} /> Nível {state.level}</span><small>{state.xp % 100}/100 XP</small></div>
        <div className="soft-progress"><i style={{ width: `${state.xp % 100}%` }} /></div>
        <p>Mais um pouco e você evolui.</p>
      </div>
      <div className="side-account"><span className="player-avatar small" style={{ background: teamState.user?.avatarColor }}>{teamState.user?.displayName.slice(0, 1) ?? '?'}</span><div><strong>{teamState.user?.displayName ?? 'Sem conta'}</strong><small>{teamState.mode === 'cloud' ? 'conta sincronizada' : 'modo demonstração'}</small></div><div className="side-account-actions"><button onClick={() => navigate('conta')} aria-label="Abrir conta" title="Conta"><UserCircle size={18} /></button><button className={view === 'configuracoes' ? 'active' : ''} onClick={() => navigate('configuracoes')} aria-label="Abrir configurações" title="Configurações"><Settings size={18} /></button></div></div>
    </aside>
    <header className="app-header">
      <button className="icon-button mobile-menu" onClick={openMobile} aria-label="Abrir menu"><Menu size={20} /></button>
      <div className="mobile-logo"><Logo /><strong>Foco</strong></div>
      <div className="header-spacer" />
      <button className="header-progress" onClick={() => navigate('semana')}><span>Nível {state.level}</span><div className="soft-progress"><i style={{ width: `${state.xp % 100}%` }} /></div><small>{100 - state.xp % 100} XP</small></button>
      <button className="header-coins" onClick={() => navigate('recompensas')}><Coins size={16} /><strong>{state.coins}</strong><span>moedas</span></button>
      <button className="icon-button" onClick={() => navigate('semana')} aria-label="Ver atividades"><Bell size={18} />{todayCount > 0 && <b />}</button>
      <button className="profile-button" onClick={() => navigate('conta')}>{teamState.user?.displayName.slice(0, 1).toUpperCase() || state.settings.displayName?.slice(0, 1).toUpperCase() || 'F'}</button>
    </header>
  </>
}
