# Guia técnico e funcional — Foco

> Mapa completo da versão atual. Explica produto, regras, dados, segurança, arquivos, deploy e direção sem exigir leitura prévia do código.

## 1. Produto

O Foco é um organizador pessoal e colaborativo para pessoas com TDAH. Ele reduz a fricção de começar, torna o trabalho visível e devolve feedback com XP, moedas, níveis, troféus e recompensas.

Princípios: poucos próximos passos; tempo externalizado; definição clara de pronto; retorno sem punição; vida pessoal separada do negócio; competição leve; saúde sem diagnóstico ou vigilância.

## 2. Dois espaços

**Meu espaço** é individual: dia, semana, energia, tela, rotina, projetos, objetivos, recompensas, configurações e hábitos privados.

**Metas Business** é compartilhado: quadro, projetos, objetivos, responsáveis, prazos, perfis, troféus e ranking. Não usa energia pessoal. Áreas: tráfego, sites, campanhas, clientes, VSL, operação e geral.

## 3. Arquitetura

```text
React UI
  -> useFocoState -> AppState pessoal -> localStorage
  -> useTeamState
       -> modo demo -> localStorage
       -> modo cloud -> Supabase Auth + PostgreSQL + RLS + Realtime
```

É uma SPA sem React Router. `App.tsx` troca módulos dentro do mesmo shell.

Sem variáveis Supabase, dois jogadores simulados permitem testar tudo localmente. Com Supabase, cada pessoa possui conta e workspaces sincronizam entre aparelhos.

## 4. Stack e comandos

React 19, TypeScript, Vite, CSS puro, Lucide, Supabase JS, PostgreSQL/RLS, Vitest, ESLint, Vercel. Node: `>=20 <25`.

```bash
npm ci
npm run dev
npm test
npm run lint
npm run build
npm run preview
```

## 5. Inicialização

1. `index.html` cria `#root`; `main.tsx` monta `<App />`.
2. `useFocoState()` carrega `foco-app-v2` ou migra `foco-app-v1`.
3. `useTeamState()` detecta as variáveis Supabase.
4. Sem configuração, carrega `foco-team-demo-v1`.
5. Com configuração, recupera sessão e consulta somente dados liberados por RLS.
6. Mudanças pessoais salvam automaticamente; mudanças cloud vão ao PostgreSQL.
7. Tarefas e atividades do workspace atualizam por Realtime.

## 6. Navegação

- `hoje`: painel diário pessoal;
- `semana`: métricas e histórico pessoal;
- `planejamento`: rotina, projetos e objetivos pessoais;
- `equipe`: Metas Business;
- `habitos`: redução de tabaco/cannabis;
- `recompensas`: loja pessoal;
- `conta`: login, cadastro, perfil ou simulação;
- `configuracoes`: preferências pessoais.

`Navigation.tsx` contém sidebar, cabeçalho, nível, moedas, conta e menu mobile. Busca abre por botão ou `Ctrl/Cmd + K`; `Escape` fecha diálogos.

## 7. Fluxos pessoais

Meu dia filtra missões pela data. O próximo passo combina energia atual e depois prioridade `essencial`, `importante`, `extra`. Mostra progresso, foco, tela manual, rotina e objetivos.

Minha semana agrega hoje e seis dias anteriores: missões, foco, XP, tela, sequência, atividades e conquistas. Tela não conta para sequência.

Planejamento:

- Rotina: intenção, horários, blocos e técnica;
- Projetos: motivo, prazo, marcos e progresso;
- Objetivos: área, unidade, alvo, prazo e prêmio.

Técnicas: Sprint gentil 15/5, Pomodoro 25/5, Blocos flexíveis 45/15 e Primeiro passo 2 min.

## 8. Metas Business

Abas:

- Visão geral: entregas, urgências, jogadores e objetivos;
- Quadro: backlog, hoje, andamento, revisão e concluídas;
- Projetos: frentes e objetivos do negócio;
- Ranking: XP de hoje ou sete dias;
- Equipe: perfil, nível, troféus, entregas e convite.

Conexão:

1. Cada sócio cria conta.
2. Um cria o workspace.
3. Compartilha o código de oito caracteres.
4. O outro entra como `member`.
5. Ambos criam/editam projetos, tarefas e objetivos.

Tarefa possui área, responsável, projeto, prioridade, prazo e definição de pronto. Responsável e projeto devem pertencer ao workspace.

XP é calculado no banco: normal 10, importante 20, urgente 30. Urgente também concede um troféu. Concluir credita o responsável e cria atividade atomicamente. Reabrir não remove prêmio; uma conclusão já registrada não duplica.

Objetivo avança por unidade. O avanço final credita o jogador com o XP configurado e um troféu.

Ranking celebra entregas do período e não mede valor pessoal.

## 9. Hábitos e redução

Cada usuário acompanha tabaco e cannabis com referência, alvo, unidade, estratégia `reduzir/parar` e registros por data.

- privado por padrão;
- só o dono altera plano/logs;
- compartilhamento é opt-in;
- o sócio vê somente o plano compartilhado;
- ranking nunca usa saúde;
- aumento não gera punição;
- o sistema não orienta dose ou mudança de Venvanse.

A tela aponta para materiais do INCA e rede de saúde mental do SUS. O recurso é registro e incentivo, não tratamento médico.

## 10. Estado pessoal

| Entidade | Função |
|---|---|
| `Mission` | tarefa datada, energia, prioridade e prêmio |
| `Project` / `Milestone` | projeto e entregas |
| `Goal` | objetivo mensurável |
| `RoutinePlan` / `RoutineBlock` | técnica, horários e conclusão |
| `Activity` | histórico de XP/moedas/minutos |
| `ScreenLog` | tela manual por data |
| `Reward` | compra, propriedade e equipamento |
| `SettingsData` | nome, tema, movimento e preferências |

## 11. Banco colaborativo

| Tabela | Função |
|---|---|
| `profiles` | nome, cor, XP e troféus |
| `workspaces` | espaço e código |
| `workspace_members` | tenant, usuário e papel |
| `workspace_projects` | frentes do negócio |
| `workspace_tasks` | quadro operacional |
| `workspace_goals` | objetivos comuns |
| `workspace_activities` | histórico/ranking |
| `habit_plans` | estratégia individual |
| `habit_logs` | registros diários |

Índices cobrem membros, quadro, responsáveis, ranking, projetos, objetivos e hábitos.

## 12. Segurança

RLS está ativa em todas as tabelas:

- perfil visível ao dono ou membro do mesmo workspace;
- workspace somente para membros; estrutura somente owner;
- projetos, tarefas e objetivos limitados ao tenant;
- `workspace_id` e `created_by` de tarefa não mudam;
- pontos, XP e troféus não são editáveis pelo cliente;
- código de convite concede somente `member`;
- hábitos são do dono ou compartilhados voluntariamente;
- `service_role` nunca vai ao navegador.

Funções: `is_workspace_member`, `is_workspace_owner`, `shares_workspace`, `join_workspace_by_code`, `advance_workspace_goal`.

Triggers criam perfil, adicionam owner, validam escopo e creditam tarefas.

## 13. Gamificação pessoal

- missão: moedas `max(10, round(min × 1,5))`; XP = moedas + 10;
- marco: 20 XP + 10 moedas;
- objetivo: 10 XP + 5 moedas; final 80 XP + prêmio;
- rotina: 15 XP + 8 moedas;
- foco: XP `max(10, round(min × 0,8))`; moedas `max(5, round(min × 0,4))`;
- nível: `floor(XP / 100) + 1`;
- compras consumíveis cobram por uso; permanentes uma vez.

## 14. Datas e estatísticas

`localDate()` ajusta fuso antes de `YYYY-MM-DD`. `getWeekStats()` agrega sete dias. `WeekChart` suporta missões, foco e tela.

`workspaceRanking()` soma atividades de 1/7 dias. `pointsForPriority()` centraliza pontos. `habitAverage()` ignora dias sem registro.

## 15. Mapa de arquivos

```text
/
├─ .env.example                       variáveis públicas
├─ supabase/migrations/...sql         schema, funções, triggers e RLS
├─ index.html / vite.config.ts         entrada e build
├─ vercel.json / package*.json         deploy e dependências
├─ projectguia.md / README.md          documentação
└─ src/
   ├─ main.tsx / App.tsx / styles.css  shell, rotas internas e UI
   ├─ types.ts / types/team.ts          contratos pessoal/equipe
   ├─ hooks/
   │  ├─ useFocoState.ts               regras pessoais
   │  └─ useTeamState.ts               auth, demo, cloud e colaboração
   ├─ lib/
   │  ├─ store.ts / stats.ts           storage/estatísticas pessoais
   │  ├─ supabase.ts / teamStore.ts    cliente e demo
   │  ├─ teamStats.ts                  ranking, pontos e hábitos
   │  └─ *.test.ts                     testes
   ├─ components/                      navegação, diálogos e gráfico
   └─ pages/
      ├─ Today/Week/Planning           pessoal
      ├─ TeamPage.tsx                  workspace
      ├─ HabitsPage.tsx                redução e privacidade
      ├─ AccountPage.tsx               conta/configuração
      └─ Rewards/Settings              loja/preferências
```

## 16. Supabase e Vercel

1. Criar projeto Supabase.
2. Executar a migration no SQL Editor.
3. Cadastrar na Vercel:
   - `VITE_SUPABASE_URL`;
   - `VITE_SUPABASE_ANON_KEY`.
4. Fazer deploy.
5. Criar duas contas, workspace e testar convite.

Nunca cadastrar `service_role` no frontend.

## 17. Testes e limites

Executar `npm test`, `npm run lint`, `npm run build` e `npm audit`.

Testar conta, convite, tarefa/responsável, conclusão, ranking, projeto, objetivo, troca de jogador, hábito privado/compartilhado, recarga e mobile.

Limites:

- cloud depende de projeto Supabase externo;
- painel pessoal ainda fica local;
- convite é por código, não e-mail;
- edição/exclusão completa não existe em todos os módulos;
- Realtime cobre tarefas/atividades; demais dados recarregam após ação;
- não há timer, calendário ou notificações do sistema;
- não há E2E automatizado nem Supabase de teste no repositório.

## 18. Próximo caminho

1. Configurar Supabase real e validar isolamento com duas contas.
2. Sincronizar opcionalmente o painel pessoal.
3. Adicionar edição/exclusão, comentários, anexos e auditoria.
4. Criar timer, notificações opt-in e calendário.
5. Evoluir relatórios e sugestões explicáveis.

A superfície deve continuar simples: o painel individual ajuda cada pessoa; o workspace torna o negócio palpável; a gamificação incentiva ação sem virar cobrança ou vigilância.
