# Guia do projeto — Foco

> Mapa funcional e técnico da versão atual. A leitura deste arquivo é suficiente para entender o produto, os dados, as regras, a segurança e o deploy.

## 1. O que é

O Foco é um organizador pessoal e colaborativo para pessoas com TDAH. Ele transforma objetivos em próximos passos visíveis e usa XP, moedas, níveis, troféus e recompensas como retorno positivo.

Princípios: pouca fricção; prioridades explícitas; tarefas pequenas; tempo visível; retorno sem punição; privacidade pessoal; competição leve; saúde sem prescrição, diagnóstico ou ranking.

## 2. Os dois espaços

**Meu espaço** é local e privado: hoje, anotações diárias, semana, tela, energia, rotina, projetos pessoais, metas com tarefas/mapa mental, recompensas e configurações.

**Metas Business** é compartilhado: operações, metas, tarefas, espera programada, subtarefas, mapas mentais, histórico, ideias, responsáveis, prazos, perfis, XP, troféus e ranking. Energia, medicação e vida pessoal não aparecem nele.

## 3. Arquitetura

```text
React SPA
├─ useFocoState → estado pessoal → localStorage
├─ backup/showcase → snapshot, JSON validado e cópia local
└─ useTeamState
   ├─ demonstração → localStorage
   └─ nuvem → Supabase Auth + PostgreSQL + RLS + Realtime
```

O sistema não troca de site ao navegar. `App.tsx` alterna módulos dentro do mesmo shell.

Sem Supabase, a demonstração local simula Kondi e Sócio. Com Supabase, cada pessoa usa sua conta e os dados do workspace sincronizam entre aparelhos.

## 4. Stack e comandos

React 19, TypeScript, Vite, CSS, Lucide, Supabase JS, PostgreSQL/RLS, Vitest, ESLint, Vercel. Node `>=20 <25`.

```bash
npm ci
npm run dev
npm test
npm run lint
npm run build
npm audit
```

## 5. Inicialização e armazenamento

1. `main.tsx` monta `App` em `#root`.
2. `useFocoState` carrega `foco-app-v3`; o estado novo não contém histórico falso.
3. `useTeamState` verifica as variáveis Supabase.
4. Sem variáveis, carrega `foco-team-v2` com a demonstração solicitada.
5. Com variáveis, recupera a sessão e consulta somente workspaces permitidos pela RLS.
6. Estado pessoal salva automaticamente no navegador.
7. Estado colaborativo salva no PostgreSQL e atualiza por Realtime.

As chaves antigas não são carregadas, portanto os exemplos fictícios anteriores não reaparecem.

## 6. Navegação principal

- `hoje`: próximos passos, manhã, foco, tela e rotina;
- `semana`: gráfico e histórico dos últimos sete dias;
- `planejamento`: rotina, projetos e objetivos pessoais;
- `equipe`: workspace Metas Business;
- `habitos`: registro privado de redução de tabaco/cannabis;
- `recompensas`: loja pessoal;
- `conta`: cadastro, login, perfil ou troca do jogador demo;
- `configuracoes`: preferências, demonstração, backup, importação e recuperação.

A sidebar e o menu mobile ficam em `Navigation.tsx`. Conta e Configurações ficam juntas no cartão de perfil, no rodapé esquerdo. `Ctrl/Cmd + K` abre busca e `Escape` fecha diálogos pessoais.

## 7. Meu dia

As missões são filtradas pela data e ordenadas por compatibilidade com energia e prioridade. Ao concluir, o sistema registra atividade, XP e moedas uma vez.

O começo da manhã possui dois check-ins sem pontuação:

- Acordar cedo;
- Venvanse conforme prescrição.

O segundo é apenas lembrete privado. O sistema não informa dose, não recomenda horário, não concede moeda e não envia o dado ao workspace.

Tela é registrada manualmente. O limite é referência sem punição. Foco pode ser registrado em blocos de 25 minutos. Anotações do dia salvam automaticamente por data, ficam apenas no dispositivo e aceitam até 4.000 caracteres.

## 8. Planejamento pessoal

**Rotina:** intenção, começo/fim do dia, blocos, dias e técnica de foco.

**Projetos:** motivo, prazo, marcos concretos e progresso calculado pelos marcos.

**Objetivos:** motivo, área, unidade, alvo, prazo, prêmio, tarefas vinculadas, histórico e mapa mental.

Técnicas disponíveis: Sprint gentil 15/5, Pomodoro 25/5, Blocos flexíveis 45/15 e Primeiro passo de dois minutos.

O estado pessoal começa vazio, exceto preferências, catálogo de recompensas e os dois check-ins pedidos. O usuário cria os próprios dados.

## 9. Modelo compartilhado

```text
Workspace
├─ membros e perfis
├─ operações
│  └─ metas priorizadas
│     └─ tarefas ordenadas
│        └─ subtarefas
├─ ideias
└─ atividades → ranking e perfil
```

**Operação** é uma frente de trabalho. Possui nome, descrição, cor, prioridade, estado e ordem.

**Meta** é um resultado. Possui descrição, prioridade, status, operação, dependência, responsável, prazo, bônus e ordem.

**Tarefa** é um passo verificável. Possui meta, operação, dependência, responsável, área, status, prioridade, prazo, espera opcional com data/hora, descrição de pronto e ordem. A ação “Marcar como concluída” é explícita e informa o XP antes do clique.

**Subtarefa** é um checklist interno sem prêmio separado.

**Ideia** começa na caixa de entrada e pode ficar em avaliação, aprovada ou arquivada. Ideia não vira prioridade automaticamente.

**Mapa mental** é uma árvore persistida por meta. Permite criar, renomear e excluir ramificações. Excluir um nó remove sua descendência; são permitidos até quatro níveis e 40 itens para manter legibilidade e evitar ciclos.

## 10. Abas do Metas Business

- **Metas:** lista por prioridade, progresso, XP conquistado/disponível e abas Execução, Mapa mental e Histórico;
- **Quadro:** caixa de entrada, hoje, andamento, revisão e concluídas;
- **Operações:** visão das frentes, metas, tarefas e progresso;
- **Ideias:** captura e triagem;
- **Ranking:** XP diário ou semanal;
- **Equipe:** convite, perfil, nível, troféus e entregas.

Meta, tarefa, operação e ideia podem ser criadas, editadas, renomeadas e excluídas. Exclusões pedem confirmação. Excluir operação mantém metas/tarefas sem vínculo; excluir meta remove suas tarefas e subtarefas.

## 11. Dados iniciais do workspace demo

Somente informações fornecidas pelos usuários:

- Operação X1;
- meta “Conectar a API do WhatsApp da Meta”;
- espera de um dia, conexão do número, conexão da API e operação recebendo leads;
- estudo de X1/API da Meta e networking;
- Mineração de ofertas;
- entender ofertas, separar/organizar criativos e preparar testes;
- objetivo “Aprender inglês”.

A integração é descrita como uso oficial para receber leads. O sistema não executa disparos e não contém fluxo para contornar bloqueios.

Ideias, atividades, hábitos, XP e troféus começam vazios/zerados.

## 12. Gamificação compartilhada

- tarefa normal: 10 XP;
- tarefa alta/importante: 20 XP;
- tarefa de foco principal/urgente: 30 XP e um troféu;
- meta completa: XP configurado e um troféu;
- nível: `floor(XP / 100) + 1`;
- ranking: soma atividades de hoje ou sete dias.

Pontos são calculados no banco, não aceitos do navegador. Cada tarefa usa uma chave única de premiação; reabrir e concluir novamente não duplica XP. A meta também possui uma chave única de bônus. Mudanças de status entram no histórico com zero XP.

O progresso da meta é derivado das tarefas. Mover tarefa entre metas recalcula a meta antiga e a nova. Subtarefas, ideias, saúde e medicação não pontuam.

## 13. Colaboração

1. Cada sócio cria sua conta.
2. Um cria o workspace.
3. Compartilha o código de oito caracteres.
4. O outro entra como `member`.
5. Ambos visualizam e editam o workspace.

No modo demo, a conta permite alternar Kondi/Sócio no mesmo navegador. Isso é simulação, não sincronização real.

## 14. Demonstração, backup e restauração

**Preencher com dados fictícios** cria primeiro um snapshot completo e imutável do individual e do Business carregado; depois troca a interface por um conjunto rico de projetos, metas, tarefas, estados, mapas, histórico, ranking, hábitos, recompensas e anotações. Com Supabase, a demonstração pausa Realtime e trabalha em cópia local, sem escrever no workspace real.

**Voltar à configuração original** restaura o snapshot anterior e só então remove a marca da demonstração. Ativar, restaurar, importar ou recuperar exige digitar `CONFIRMAR` em um diálogo separado; maiúsculas/minúsculas e espaços externos são normalizados.

**Baixar backup** gera `foco-backup-AAAA-MM-DD.json` com versão, data, dados pessoais, estado Business carregado e impressão de integridade. **Importar backup** limita o arquivo a 5 MB, valida formato, versão, integridade, IDs e relacionamentos antes de alterar qualquer estado. A importação guarda antes uma recuperação automática e abre o Business como cópia local segura; nunca apaga o Supabase.

**Desfazer a última troca** usa essa recuperação uma vez. O arquivo JSON deve ser guardado pelo usuário: limpar todo o armazenamento do navegador também remove snapshots automáticos, mas não remove o arquivo baixado.

## 15. Banco de dados

| Tabela | Função |
|---|---|
| `profiles` | nome, cor, XP e troféus |
| `workspaces` | espaço e código de convite |
| `workspace_members` | usuário, tenant e papel |
| `workspace_projects` | operações |
| `workspace_goals` | metas e dependências |
| `workspace_tasks` | tarefas, ordem e dependências |
| `workspace_subtasks` | checklist da tarefa |
| `workspace_ideas` | caixa de ideias |
| `workspace_mind_nodes` | árvore de mapa mental por meta |
| `workspace_activities` | histórico idempotente e ranking |
| `habit_plans` | plano privado de redução |
| `habit_logs` | registros diários privados |

Aplicar as migrations em ordem:

1. `202607290001_collaboration.sql` — base, Auth, RLS e gamificação;
2. `202607310001_goals_first.sql` — metas completas, CRUD, subtarefas, ideias e bônus idempotente.
3. `202607310002_mindmaps_waiting.sql` — espera programada, histórico de status e mapa mental seguro.

## 16. Segurança

RLS está ativa em todas as tabelas colaborativas:

- somente membros leem o workspace;
- relações são validadas no mesmo workspace;
- responsáveis precisam ser membros;
- `workspace_id` e autor não podem ser trocados pela tarefa;
- pontos, XP, troféus e bônus são processados por gatilhos;
- a função interna de recálculo não pode ser chamada por clientes;
- nós do mapa são validados no workspace/meta, sem ciclos, profundidade excessiva ou troca de escopo;
- o antigo avanço manual de meta não pode ser executado;
- hábitos são privados por padrão e compartilhados apenas por opt-in;
- `service_role` nunca vai para o navegador.
- backup inválido ou adulterado é rejeitado antes da substituição;
- apresentação/importação local não envia dados fictícios ao Supabase.

Erros do Supabase interrompem o formulário e aparecem na tela; a UI não confirma sucesso falso.

## 17. Mapa de arquivos

```text
/
├─ .env.example                  variáveis públicas
├─ supabase/migrations/          schema, funções, triggers e RLS
├─ projectguia.md / README.md    documentação
├─ vercel.json / vite.config.ts  deploy e build
└─ src/
   ├─ App.tsx / styles.css       shell e interface
   ├─ types.ts                   contratos pessoais
   ├─ types/team.ts              contratos colaborativos
   ├─ hooks/useFocoState.ts      regras pessoais
   ├─ hooks/useTeamState.ts      auth, CRUD, demo, cloud e realtime
   ├─ lib/store.ts               estado pessoal inicial/persistência
   ├─ lib/teamStore.ts           workspace demo solicitado
   ├─ lib/backup.ts              formato, validação, snapshot e recuperação
   ├─ lib/showcaseData.ts         conteúdo fictício isolado
   ├─ lib/stats.ts               semana, progresso e sequência
   ├─ lib/teamStats.ts           pontos, ranking e hábitos
   ├─ lib/*.test.ts              testes automatizados
   ├─ components/                navegação, diálogos e gráfico
   └─ pages/                     hoje, semana, planejamento, equipe etc.
```

## 18. Supabase e Vercel

1. Criar projeto no Supabase.
2. Rodar as três migrations no SQL Editor, na ordem acima.
3. Na Vercel, cadastrar `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
4. Não cadastrar `service_role`.
5. Fazer deploy e criar as duas contas.
6. Criar/entrar no workspace com o código e testar em dois navegadores.

Modo demonstração, exportação e importação local não exigem Supabase nem variável nova.

## 19. Verificação da versão

Executar:

```bash
npm test
npm run lint
npm run build
npm audit --audit-level=high
```

Fluxos mínimos: abrir meta; conclusão; espera; histórico; XP; CRUD; mapa; anotação; bônus idempotente; ranking; demo → restauração idêntica; exportação → importação; arquivo corrompido/relação quebrada; recuperação; convite cloud; isolamento; recarga; desktop e mobile.

Limites atuais: painel pessoal permanece local; convite é por código; não há anexos, comentários, calendário externo, timer contínuo ou notificações do sistema; teste Supabase exige um projeto externo; a automação visual depende do navegador local conseguir anexar a aba.

## 20. Caminho do produto

1. Aplicar migrations e validar RLS com duas contas reais.
2. Usar o fluxo de metas por alguns dias e observar fricções reais.
3. Só então priorizar calendário, comentários, anexos ou sincronização pessoal.
4. Manter o princípio: meta clara, próximo passo pequeno e recompensa sem cobrança.
