import { Check, Coffee, Coins, Music2, Palette, Sparkles, Zap } from 'lucide-react'
import type { FocoActions } from '../hooks/useFocoState'
import type { AppState } from '../types'

const icons = { palette: Palette, music: Music2, coffee: Coffee, sparkles: Sparkles }

export function RewardsPage({ state, actions, notify }: { state: AppState; actions: FocoActions; notify: (text: string) => void }) {
  function use(id: string) {
    const reward = state.rewards.find((item) => item.id === id)
    if (!reward) return
    if (!reward.owned && state.coins < reward.cost) { notify(`Ainda faltam ${reward.cost - state.coins} moedas. Sem pressa.`); return }
    actions.useReward(id)
    if (reward.kind === 'break') notify('Pausa resgatada. Coloque um alarme e aproveite sem culpa.')
    else if (reward.owned) notify(reward.equipped ? `${reward.name} foi desativado.` : `${reward.name} está ativo.`)
    else notify(`${reward.name} desbloqueado e aplicado.`)
  }
  return <div className="page inner-page rewards-page"><section className="page-heading"><div><p className="eyebrow">CELEBRAR TAMBÉM FAZ PARTE</p><h1>Recompensas</h1><p>Troque esforço por experiências que realmente deixam o caminho mais leve.</p></div><div className="coin-wallet"><Coins size={21} /><div><strong>{state.coins}</strong><span>moedas disponíveis</span></div></div></section><section className="reward-philosophy"><Sparkles size={20} /><div><strong>Recompensa não é suborno.</strong><p>Ela ajuda o cérebro a perceber valor agora em tarefas cujo benefício costuma parecer distante.</p></div></section><div className="reward-grid-new">{state.rewards.map((reward) => { const Icon = icons[reward.icon]; const label = buttonLabel(reward); return <article className={`${reward.owned ? 'owned' : ''} ${reward.equipped ? 'equipped' : ''}`} key={reward.id}><div className={`reward-visual ${reward.kind}`}><Icon size={32} />{reward.equipped && <span><Check size={13} />Ativo</span>}</div><div className="reward-content"><div><small>{kindLabel(reward.kind)}</small><h2>{reward.name}</h2><p>{reward.description}</p></div>{reward.redemptions > 0 && <span className="redemption-count">Usado {reward.redemptions} {reward.redemptions === 1 ? 'vez' : 'vezes'}</span>}<button className={reward.owned || state.coins >= reward.cost ? 'available' : ''} onClick={() => use(reward.id)}>{!reward.owned || reward.kind === 'break' ? <Coins size={15} /> : reward.equipped ? <Check size={15} /> : <Zap size={15} />}{label}</button></div></article> })}</div><section className="real-reward"><Coffee size={22} /><div><h3>Uma recompensa pode existir fora da tela</h3><p>Uma caminhada, um episódio, seu lanche favorito ou vinte minutos de jogo. O aplicativo só registra; a experiência é sua.</p></div></section></div>
}

function buttonLabel(reward: AppState['rewards'][number]) {
  if (reward.kind === 'break') return `${reward.cost} · Resgatar`
  if (!reward.owned) return `${reward.cost} · Desbloquear`
  return reward.equipped ? 'Desativar' : 'Ativar'
}
function kindLabel(kind: AppState['rewards'][number]['kind']) { return ({ theme: 'PERSONALIZAÇÃO', sound: 'AMBIENTE DE FOCO', break: 'EXPERIÊNCIA REAL', celebration: 'EFEITO DE CONQUISTA' } as const)[kind] }
