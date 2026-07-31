import { useState } from 'react'
import { BrainCircuit, Pencil, Plus, Trash2, X } from 'lucide-react'
import { canAddMindNode } from '../lib/mindMap'

export interface MindMapNode { id: string; parentId?: string; title: string; note: string; sortOrder: number }

export function MindMap({ goalTitle, nodes, save, remove, notify }: { goalTitle: string; nodes: MindMapNode[]; save: (input: { parentId?: string; title: string; note: string }, id?: string) => Promise<void> | void; remove: (id: string) => Promise<void> | void; notify: (text: string) => void }) {
  const [editor, setEditor] = useState<{ node?: MindMapNode; parentId?: string } | null>(null)
  const roots = nodes.filter((node) => !node.parentId).sort((a, b) => a.sortOrder - b.sortOrder)
  function openChild(parentId?: string) { if (!canAddMindNode(nodes, parentId)) { notify(nodes.length >= 40 ? 'O mapa chegou ao limite de 40 itens.' : 'Use no máximo quatro níveis para manter o mapa legível.'); return } setEditor({ parentId }) }
  return <section className="mind-map-shell">
    <header><div><p className="eyebrow">VISÃO EM ÁRVORE</p><h3>Mapa mental</h3><p>Organize frentes e ideias sem perder o próximo passo.</p></div><button className="quiet-button" onClick={() => openChild()}><Plus size={15} />Nova ramificação</button></header>
    <div className="mind-map-scroll"><div className="mind-map-root"><BrainCircuit size={20} /><strong>{goalTitle}</strong></div>{roots.length ? <div className="mind-branches">{roots.map((node) => <MindBranch key={node.id} node={node} nodes={nodes} add={openChild} edit={(item) => setEditor({ node: item, parentId: item.parentId })} remove={async (id) => { if (!window.confirm('Excluir este item e todas as ramificações abaixo dele?')) return; await remove(id); notify('Ramificação excluída.') }} />)}</div> : <div className="mind-empty"><p>O mapa ainda está vazio.</p><button onClick={() => openChild()}><Plus size={14} />Criar primeira ramificação</button></div>}</div>
    {editor && <MindEditor current={editor.node} close={() => setEditor(null)} submit={async (title, note) => { await save({ parentId: editor.parentId, title, note }, editor.node?.id); setEditor(null); notify(editor.node ? 'Item atualizado.' : 'Ramificação adicionada.') }} />}
  </section>
}

function MindBranch({ node, nodes, add, edit, remove }: { node: MindMapNode; nodes: MindMapNode[]; add: (id: string) => void; edit: (node: MindMapNode) => void; remove: (id: string) => void }) {
  const children = nodes.filter((item) => item.parentId === node.id).sort((a, b) => a.sortOrder - b.sortOrder)
  return <div className="mind-branch"><article><div><strong>{node.title}</strong><span><button aria-label={`Adicionar abaixo de ${node.title}`} onClick={() => add(node.id)}><Plus size={13} /></button><button aria-label={`Editar ${node.title}`} onClick={() => edit(node)}><Pencil size={13} /></button><button aria-label={`Excluir ${node.title}`} onClick={() => remove(node.id)}><Trash2 size={13} /></button></span></div>{node.note && <p>{node.note}</p>}</article>{children.length > 0 && <div className="mind-children">{children.map((child) => <MindBranch key={child.id} node={child} nodes={nodes} add={add} edit={edit} remove={remove} />)}</div>}</div>
}

function MindEditor({ current, close, submit }: { current?: MindMapNode; close: () => void; submit: (title: string, note: string) => void }) {
  const [title, setTitle] = useState(current?.title ?? ''); const [note, setNote] = useState(current?.note ?? '')
  return <div className="mind-editor"><div><header><strong>{current ? 'Editar item' : 'Nova ramificação'}</strong><button onClick={close} aria-label="Fechar"><X size={16} /></button></header><label>Título<input autoFocus value={title} maxLength={120} onChange={(event) => setTitle(event.target.value)} /></label><label>Observação <span>opcional</span><textarea rows={3} value={note} maxLength={500} onChange={(event) => setNote(event.target.value)} /></label><footer><button className="secondary-button" onClick={close}>Cancelar</button><button className="primary-button" disabled={title.trim().length < 2} onClick={() => submit(title.trim(), note.trim())}>Salvar</button></footer></div></div>
}
