import { useEffect, useState } from 'react'
import { ArrowDownRight, CalendarDays, Cannabis, Check, ChevronRight, HeartHandshake, Leaf, Lock, Minus, Plus, ShieldCheck, Target, Users } from 'lucide-react'
import type { TeamActions } from '../hooks/useTeamState'
import { localDate } from '../lib/store'
import { habitWeekSeries } from '../lib/teamStats'
import type { HabitKind, HabitPlan, TeamState } from '../types/team'

const copy = {
  tabaco: { title: 'Tabaco', icon: Leaf, color: '#b5825b', defaultUnit: 'cigarros/dia' },
  cannabis: { title: 'Maconha', icon: Cannabis, color: '#73936d', defaultUnit: 'sessões/semana' },
}

export function HabitsPage({ state, actions, openAccount, notify }: { state: TeamState; actions: TeamActions; openAccount: () => void; notify: (text: string) => void }) {
  if (state.configured && !state.user) return <div className="page inner-page"><section className="team-gate"><span><Lock size={28} /></span><p className="eyebrow">ESPAÇO PRIVADO</p><h1>Entre para ver seus hábitos.</h1><p>Esses registros nunca entram no workspace sem sua autorização.</p><button className="primary-button" onClick={openAccount}>Acessar minha conta</button></section></div>
  const mine = state.habitPlans.filter((item) => item.userId === state.user?.id)
  const shared = state.habitPlans.filter((item) => item.userId !== state.user?.id && item.shareWithWorkspace)
  async function create(kind: HabitKind) { try { await actions.createHabit(kind); notify(`${copy[kind].title} adicionado ao acompanhamento.`) } catch { notify('Não foi possível criar o acompanhamento.') } }
  return <div className="page inner-page habits-page">
    <section className="page-heading"><div><p className="eyebrow">REDUZIR SEM SE PUNIR</p><h1>Hábitos e redução</h1><p>Observar, escolher um próximo alvo e recomeçar. Sem ranking sobre saúde.</p></div><div className="privacy-pill"><Lock size={15} />Privado por padrão</div></section>
    <section className="health-boundary"><ShieldCheck size={20} /><div><strong>Este espaço apoia registro, não substitui cuidado profissional.</strong><p>Não altere Venvanse ou outro medicamento por conta própria. Se reduzir estiver difícil, procure seu médico, uma UBS ou a rede de saúde mental.</p></div></section>
    <div className="habit-grid">{mine.map((plan) => <HabitCard key={plan.id} plan={plan} state={state} actions={actions} notify={notify} />)}{(['tabaco', 'cannabis'] as HabitKind[]).filter((kind) => !mine.some((item) => item.kind === kind)).map((kind) => <button className="new-habit-card" key={kind} onClick={() => create(kind)}><Plus size={22} /><strong>Acompanhar {copy[kind].title.toLowerCase()}</strong><span>Começar com uma referência editável</span></button>)}</div>
    <section className="habit-principles"><div className="section-title"><div><p className="eyebrow">GAMIFICAÇÃO SEGURA</p><h2>O que conta como vitória</h2></div></div><div><article><span><CalendarDays /></span><strong>Registrar com honestidade</strong><p>O primeiro prêmio é tornar o padrão visível.</p></article><article><span><ArrowDownRight /></span><strong>Reduzir dentro do possível</strong><p>Compare com sua própria referência, nunca com outra pessoa.</p></article><article><span><HeartHandshake /></span><strong>Pedir apoio</strong><p>Buscar cuidado também é uma ação concreta.</p></article></div></section>
    {shared.length > 0 && <section className="shared-habits"><div className="section-title"><div><p className="eyebrow">APOIO DA DUPLA</p><h2>Metas compartilhadas voluntariamente</h2></div><Users size={20} /></div>{shared.map((plan) => { const owner = state.profiles.find((item) => item.id === plan.userId); const latest = [...state.habitLogs].filter((item) => item.planId === plan.id).sort((a, b) => b.date.localeCompare(a.date))[0]; return <article key={plan.id}><span className="player-avatar" style={{ background: owner?.avatarColor }}>{owner?.displayName.slice(0, 1)}</span><div><strong>{owner?.displayName} · {copy[plan.kind].title}</strong><small>Meta: {plan.target} {plan.unit}{latest ? ` · último registro: ${latest.amount}` : ''}</small></div><HeartHandshake size={18} /></article> })}</section>}
    <section className="support-links"><Target size={21} /><div><h3>Ajuda baseada em cuidado, não em culpa</h3><p>O SUS oferece tratamento gratuito para tabagismo e cuidado para necessidades relacionadas ao uso de álcool e outras drogas.</p><div><a href="https://www.gov.br/inca/pt-br/assuntos/causas-e-prevencao-do-cancer/tabagismo/como-parar-de-fumar" target="_blank" rel="noreferrer">Como parar de fumar — INCA <ChevronRight size={14} /></a><a href="https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-mental/saude-mental" target="_blank" rel="noreferrer">Rede de saúde mental — Ministério da Saúde <ChevronRight size={14} /></a></div></div></section>
  </div>
}

function HabitCard({ plan, state, actions, notify }: { plan: HabitPlan; state: TeamState; actions: TeamActions; notify: (text: string) => void }) {
  const details = copy[plan.kind]; const Icon = details.icon
  const todayLog = state.habitLogs.find((item) => item.planId === plan.id && item.date === localDate())
  const [amount, setAmount] = useState(todayLog?.amount ?? plan.target)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savingPlan, setSavingPlan] = useState(false)
  const [planDraft, setPlanDraft] = useState({ baseline: plan.baseline, target: plan.target, mode: plan.mode })
  const savedAmount = todayLog?.amount
  const dirty = amount !== savedAmount
  useEffect(() => { if (todayLog) setAmount(todayLog.amount) }, [todayLog?.id, todayLog?.amount])
  useEffect(() => { setPlanDraft({ baseline: plan.baseline, target: plan.target, mode: plan.mode }) }, [plan.baseline, plan.target, plan.mode])
  const recent = habitWeekSeries(state.habitLogs, plan.id, dirty ? amount : undefined)
  const max = Math.max(plan.baseline, ...recent.map((item) => item.amount ?? 0), 1)
  async function save() {
    setSaving(true)
    try { await actions.logHabit(plan.id, amount); notify('Registro salvo e gráfico atualizado.') }
    catch { notify('Não foi possível salvar. Seu valor continua na tela para tentar novamente.') }
    finally { setSaving(false) }
  }
  async function toggleShare() { try { await actions.updateHabitPlan(plan.id, { shareWithWorkspace: !plan.shareWithWorkspace }); notify(plan.shareWithWorkspace ? 'Acompanhamento voltou a ser privado.' : 'Acompanhamento compartilhado com a dupla.') } catch { notify('Não foi possível alterar a privacidade.') } }
  async function savePlan() { setSavingPlan(true); try { await actions.updateHabitPlan(plan.id, planDraft); setEditing(false); notify('Referência e meta atualizadas.') } catch { notify('Não foi possível salvar os ajustes.') } finally { setSavingPlan(false) } }
  return <article className="habit-card" style={{ '--habit': details.color } as React.CSSProperties}>
    <header><span><Icon size={21} /></span><div><small>{plan.mode === 'parar' ? 'CAMINHO PARA PARAR' : 'REDUÇÃO GRADUAL'}</small><h2>{details.title}</h2></div><button className={plan.shareWithWorkspace ? 'shared' : ''} onClick={toggleShare}>{plan.shareWithWorkspace ? <Users size={15} /> : <Lock size={15} />}{plan.shareWithWorkspace ? 'Compartilhado' : 'Só eu'}</button></header>
    <div className="habit-target"><div><span>Referência</span><strong>{plan.baseline}</strong></div><ArrowDownRight /><div><span>Alvo atual</span><strong>{plan.target}</strong></div><small>{plan.unit}</small></div>
    <div className="habit-bars">{recent.map((item) => <div className={item.preview ? 'preview' : ''} key={item.date}><span>{item.amount ?? '–'}{item.preview && <em>prévia</em>}</span><i><b style={{ height: `${item.amount === undefined ? 4 : Math.max(8, item.amount / max * 100)}%` }} /></i><small>{new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(new Date(`${item.date}T12:00:00`)).replace('.', '')}</small></div>)}</div>
    <div className="habit-log"><div><button onClick={() => setAmount(Math.max(0, amount - 1))} aria-label="Diminuir"><Minus size={16} /></button><strong>{amount}</strong><button onClick={() => setAmount(amount + 1)} aria-label="Aumentar"><Plus size={16} /></button><span>{plan.unit}</span></div><button className="primary-button" disabled={saving || (!dirty && Boolean(todayLog))} onClick={save}><Check size={15} />{saving ? 'Salvando…' : todayLog ? dirty ? 'Atualizar hoje' : 'Salvo hoje' : 'Registrar hoje'}</button></div>
    <button className="habit-edit-toggle" onClick={() => setEditing(!editing)}>Editar referência e meta <ChevronRight size={14} /></button>
    {editing && <div className="habit-edit"><label>Referência<input type="number" min="0" value={planDraft.baseline} onChange={(event) => setPlanDraft((current) => ({ ...current, baseline: Math.max(0, Number(event.target.value)) }))} /></label><label>Alvo<input type="number" min="0" value={planDraft.target} onChange={(event) => setPlanDraft((current) => ({ ...current, target: Math.max(0, Number(event.target.value)) }))} /></label><label>Estratégia<select value={planDraft.mode} onChange={(event) => setPlanDraft((current) => ({ ...current, mode: event.target.value as HabitPlan['mode'] }))}><option value="reduzir">Reduzir</option><option value="parar">Parar</option></select></label><div className="habit-edit-actions"><button className="secondary-button" type="button" onClick={() => { setPlanDraft({ baseline: plan.baseline, target: plan.target, mode: plan.mode }); setEditing(false) }}>Cancelar</button><button className="primary-button" type="button" disabled={savingPlan} onClick={savePlan}>{savingPlan ? 'Salvando…' : 'Salvar ajustes'}</button></div></div>}
    <p className={`habit-message ${dirty ? 'pending' : ''}`}>{dirty && todayLog ? 'Prévia atualizada. Clique em “Atualizar hoje” para salvar no histórico.' : todayLog ? 'Registro de hoje salvo no histórico.' : amount <= plan.target ? 'Dentro do alvo escolhido. Reconheça esse passo.' : 'Acima do alvo não significa fracasso. Registre e observe o contexto.'}</p>
  </article>
}
