import { Bell, DatabaseBackup, Download, MonitorSmartphone, Moon, Palette, PlayCircle, RefreshCcw, RotateCcw, Save, ShieldCheck, Upload, UserRound, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { FocoActions } from '../hooks/useFocoState'
import type { TeamActions } from '../hooks/useTeamState'
import { clearDemoSnapshot, clearRecoverySnapshot, createBackupDocument, downloadBackup, hasDemoSnapshot, hasRecoverySnapshot, isConfirmationValid, loadDemoSnapshot, loadRecoverySnapshot, parseBackupDocument, saveDemoSnapshot, saveRecoverySnapshot, type BackupDocument } from '../lib/backup'
import { createShowcasePersonal, createShowcaseTeam } from '../lib/showcaseData'
import type { AppState, Theme } from '../types'
import type { TeamState } from '../types/team'

type ConfirmKind = 'showcase' | 'restore' | 'import' | 'recovery'

export function SettingsPage({ state, actions, teamState, teamActions, notify }: { state: AppState; actions: FocoActions; teamState: TeamState; teamActions: TeamActions; notify: (text: string) => void }) {
  const [name, setName] = useState(state.settings.displayName); const [limit, setLimit] = useState(state.settings.dailyScreenLimit)
  const [demoActive, setDemoActive] = useState(hasDemoSnapshot); const [recoveryAvailable, setRecoveryAvailable] = useState(hasRecoverySnapshot)
  const [confirming, setConfirming] = useState<ConfirmKind | null>(null); const [confirmation, setConfirmation] = useState(''); const [pendingImport, setPendingImport] = useState<BackupDocument | null>(null); const [busy, setBusy] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)
  useEffect(() => { setName(state.settings.displayName); setLimit(state.settings.dailyScreenLimit) }, [state.settings.displayName, state.settings.dailyScreenLimit])
  function save() { actions.updateSettings({ displayName: name.trim(), dailyScreenLimit: Math.max(30, limit) }); notify('Preferências salvas.') }
  function openConfirmation(kind: ConfirmKind) { setConfirmation(''); setConfirming(kind) }
  function closeConfirmation() { if (busy) return; setConfirming(null); setConfirmation(''); if (confirming === 'import') setPendingImport(null) }
  function exportAll() { downloadBackup(createBackupDocument(state, teamState)); notify('Backup completo baixado.') }
  async function selectBackup(file?: File) {
    if (!file) return
    try { const parsed = parseBackupDocument(await file.text()); setPendingImport(parsed); openConfirmation('import') }
    catch (error) { notify(error instanceof Error ? error.message : 'Não foi possível ler o backup.') }
    finally { if (fileInput.current) fileInput.current.value = '' }
  }
  async function confirmAction() {
    if (!isConfirmationValid(confirmation) || !confirming) return
    setBusy(true)
    try {
      if (confirming === 'showcase') {
        const original = createBackupDocument(state, teamState); saveDemoSnapshot(original)
        actions.replaceState(createShowcasePersonal(state.settings)); teamActions.useLocalState(createShowcaseTeam()); setDemoActive(true); notify('Demonstração preenchida. Seus dados anteriores estão protegidos.')
      }
      if (confirming === 'restore') {
        const original = loadDemoSnapshot(); if (!original) throw new Error('A cópia original não foi encontrada. Nada foi alterado.')
        actions.replaceState(original.personal); await teamActions.restoreState(original.team); clearDemoSnapshot(); setDemoActive(false); notify('Configuração anterior restaurada exatamente como estava.')
      }
      if (confirming === 'import') {
        if (!pendingImport) throw new Error('Escolha novamente o arquivo de backup.')
        saveRecoverySnapshot(createBackupDocument(state, teamState)); actions.replaceState(pendingImport.personal); teamActions.useLocalState(pendingImport.team); clearDemoSnapshot(); setDemoActive(false); setRecoveryAvailable(true); notify('Backup importado por completo em uma cópia local segura.')
      }
      if (confirming === 'recovery') {
        const recovery = loadRecoverySnapshot(); if (!recovery) throw new Error('A cópia de recuperação não foi encontrada.')
        actions.replaceState(recovery.personal); teamActions.useLocalState(recovery.team); clearRecoverySnapshot(); clearDemoSnapshot(); setRecoveryAvailable(false); setDemoActive(false); notify('A configuração anterior à última troca foi recuperada.')
      }
      setConfirming(null); setConfirmation(''); setPendingImport(null)
    } catch (error) { notify(error instanceof Error ? error.message : 'Não foi possível concluir a operação.') }
    finally { setBusy(false) }
  }
  const summary = pendingImport ? `${pendingImport.personal.projects.length} projetos pessoais, ${pendingImport.personal.goals.length} metas pessoais, ${pendingImport.team.projects.length} operações e ${pendingImport.team.tasks.length} tarefas Business.` : ''
  return <div className="page inner-page settings-page"><section className="page-heading"><div><p className="eyebrow">DO SEU JEITO</p><h1>Configurações</h1><p>Ajuste o espaço para reduzir atrito, estímulos e decisões desnecessárias.</p></div>{demoActive && <span className="demo-mode-badge"><PlayCircle size={15} />Demonstração ativa</span>}</section><div className="settings-layout">
    <section className="surface settings-section"><div className="settings-title"><span><UserRound size={19} /></span><div><h2>Você e seu dia</h2><p>Informações usadas apenas neste navegador.</p></div></div><label>Como prefere ser chamado?<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Seu nome ou apelido" /></label><label>Limite diário de tela <span>{Math.floor(limit / 60)}h {limit % 60}min</span><input type="range" min="30" max="480" step="15" value={limit} onChange={(event) => setLimit(Number(event.target.value))} /></label><label>Horário em que seu dia começa<input type="time" value={state.settings.dayStart} onChange={(event) => actions.updateSettings({ dayStart: event.target.value })} /></label><button className="primary-button" onClick={save}><Save size={16} />Salvar preferências</button></section>
    <section className="surface settings-section"><div className="settings-title"><span><Palette size={19} /></span><div><h2>Aparência</h2><p>Temas suaves, sem aparência de painel financeiro.</p></div></div><div className="theme-options"><ThemeButton theme="sereno" active={state.settings.activeTheme === 'sereno'} onClick={() => actions.updateSettings({ activeTheme: 'sereno' })} /><ThemeButton theme="lavanda" active={state.settings.activeTheme === 'lavanda'} locked={!state.rewards.find((item) => item.kind === 'theme')?.owned} onClick={() => state.rewards.find((item) => item.kind === 'theme')?.owned ? actions.updateSettings({ activeTheme: 'lavanda' }) : notify('Desbloqueie o Tema Lavanda em Recompensas.')} /></div><Toggle icon={<Moon />} label="Reduzir movimentos" description="Diminui transições e celebrações visuais." checked={state.settings.reducedMotion} onChange={(value) => actions.updateSettings({ reducedMotion: value })} /></section>
    <section className="surface settings-section"><div className="settings-title"><span><Bell size={19} /></span><div><h2>Lembretes</h2><p>O navegador não enviará notificações externas nesta versão.</p></div></div><Toggle icon={<Bell />} label="Lembretes dentro do aplicativo" description="Mostra sinais gentis de planejamento e progresso." checked={state.settings.notificationsEnabled} onChange={(value) => actions.updateSettings({ notificationsEnabled: value })} /><div className="info-row"><MonitorSmartphone size={18} /><p>O tempo de tela é registrado manualmente. Sites não conseguem ler o uso total do celular ou computador com segurança.</p></div></section>
    <section className="surface settings-section data-vault-section"><div className="settings-title"><span><DatabaseBackup size={19} /></span><div><h2>Backup completo</h2><p>Uma cópia portátil de tudo o que está visível no individual e no Business.</p></div></div><div className="data-safety-note"><ShieldCheck size={19} /><div><strong>Importar nunca começa apagando.</strong><p>Antes da troca, o sistema guarda uma recuperação automática e valida referências, versão e integridade. O arquivo pode conter anotações e hábitos privados: guarde-o em local seguro.</p></div></div><div className="settings-action-grid"><button className="primary-button" onClick={exportAll}><Download size={16} /><span><strong>Baixar backup</strong><small>Gera um arquivo JSON completo.</small></span></button><button className="secondary-button" disabled={demoActive} onClick={() => fileInput.current?.click()}><Upload size={16} /><span><strong>Importar backup</strong><small>{demoActive ? 'Volte aos dados anteriores primeiro.' : 'Valida antes de substituir.'}</small></span></button></div><input ref={fileInput} className="hidden-file-input" type="file" accept="application/json,.json" onChange={(event) => selectBackup(event.target.files?.[0])} />{recoveryAvailable && <button className="text-recovery-button" onClick={() => openConfirmation('recovery')}><RotateCcw size={15} />Desfazer a última troca de dados</button>}</section>
    <section className={`surface settings-section showcase-section ${demoActive ? 'active' : ''}`}><div className="settings-title"><span><PlayCircle size={19} /></span><div><h2>Modo demonstração</h2><p>Preenche todas as áreas para você apresentar o produto.</p></div></div>{demoActive ? <><div className="showcase-status"><span><ShieldCheck size={18} /></span><div><strong>Seus dados anteriores estão guardados.</strong><p>O individual e o Business exibidos agora são fictícios e locais.</p></div></div><button className="danger-button restore-original-button" onClick={() => openConfirmation('restore')}><RefreshCcw size={16} />Voltar à configuração original</button></> : <><p className="showcase-description">Adiciona projetos, metas, tarefas em vários estados, mapas mentais, histórico semanal, ranking, hábitos, recompensas e anotações. O sistema tira uma fotografia exata antes de trocar.</p><button className="primary-button" onClick={() => openConfirmation('showcase')}><PlayCircle size={16} />Preencher com dados fictícios</button></>}</section>
  </div>{confirming && <ConfirmationDialog kind={confirming} value={confirmation} setValue={setConfirmation} summary={summary} busy={busy} close={closeConfirmation} confirm={confirmAction} />}</div>
}

function ConfirmationDialog({ kind, value, setValue, summary, busy, close, confirm }: { kind: ConfirmKind; value: string; setValue: (value: string) => void; summary: string; busy: boolean; close: () => void; confirm: () => void }) {
  const copy = {
    showcase: { title: 'Ativar dados fictícios?', text: 'Uma cópia exata do estado atual será criada antes da demonstração. Você poderá voltar por este mesmo menu.', action: 'Ativar demonstração' },
    restore: { title: 'Voltar à configuração original?', text: 'Todos os dados fictícios serão removidos e a fotografia criada antes da demonstração será restaurada.', action: 'Restaurar meus dados' },
    import: { title: 'Importar este backup?', text: `O estado atual será guardado para recuperação antes da troca. ${summary}`, action: 'Importar tudo' },
    recovery: { title: 'Desfazer a última troca?', text: 'A cópia automática anterior será aplicada no individual e no Business.', action: 'Recuperar dados' },
  }[kind]
  const recognized = isConfirmationValid(value)
  return <div className="dialog-layer" onMouseDown={(event) => { if (event.target === event.currentTarget) close() }}><section className="dialog confirmation-dialog" role="dialog" aria-modal="true" aria-labelledby="data-confirm-title"><header><div><p className="eyebrow">CONFIRMAÇÃO DE SEGURANÇA</p><h2 id="data-confirm-title">{copy.title}</h2></div><button type="button" className="icon-button" onClick={close} disabled={busy} aria-label="Fechar"><X size={18} /></button></header><div className="confirmation-warning"><ShieldCheck size={22} /><p>{copy.text}</p></div><form onSubmit={(event) => { event.preventDefault(); if (recognized && !busy) confirm() }}><label>Digite <strong>CONFIRMAR</strong> para continuar<input autoFocus value={value} onChange={(event) => setValue(event.target.value)} placeholder="CONFIRMAR" autoComplete="off" aria-describedby="confirmation-help" /></label><small id="confirmation-help" className={recognized ? 'confirmation-recognized' : 'confirmation-help'}>{recognized ? 'Confirmação reconhecida. Você já pode continuar.' : 'Pode escrever em letras maiúsculas ou minúsculas.'}</small><footer className="dialog-actions"><span /><button type="button" className="secondary-button" onClick={close} disabled={busy}>Cancelar</button><button type="submit" className="primary-button" disabled={busy || !recognized}>{busy ? 'Processando…' : copy.action}</button></footer></form></section></div>
}

function ThemeButton({ theme, active, locked, onClick }: { theme: Theme; active: boolean; locked?: boolean; onClick: () => void }) { return <button className={`${theme} ${active ? 'active' : ''}`} onClick={onClick}><span><i /><i /><i /></span><strong>{theme === 'sereno' ? 'Bosque sereno' : 'Lavanda calma'}</strong><small>{locked ? 'Bloqueado na loja' : active ? 'Em uso' : 'Usar tema'}</small></button> }
function Toggle({ icon, label, description, checked, onChange }: { icon: React.ReactNode; label: string; description: string; checked: boolean; onChange: (value: boolean) => void }) { return <button className="toggle-row" onClick={() => onChange(!checked)}><span>{icon}</span><div><strong>{label}</strong><small>{description}</small></div><i className={checked ? 'on' : ''}><b /></i></button> }
