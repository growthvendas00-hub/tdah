# Guia técnico e funcional — Foco

> Mapa da versão atual do projeto. Este documento permite entender o produto, suas decisões, fluxos, dados, arquivos, limites e direção futura sem conhecer o código previamente.

## 1. O que é o Foco

O Foco é uma aplicação web de organização pessoal com apoio para TDAH. Ela transforma intenção em passos pequenos, registra o que aconteceu e devolve feedback imediato por meio de XP, moedas, níveis, conquistas e recompensas.

O princípio central não é cobrar produtividade perfeita. É reduzir a dificuldade de começar, externalizar o tempo, limitar escolhas simultâneas e facilitar o retorno depois de um dia difícil.

## 2. O que existe nesta versão

- painel diário com energia, metas, próximo passo, rotina, foco e tempo de tela;
- histórico dos últimos sete dias, gráfico, métricas, atividades e conquistas;
- planejamento de rotina, projetos e objetivos dentro da mesma interface;
- missões ligadas opcionalmente a projetos e objetivos;
- XP, nível, moedas e loja de recompensas;
- temas Sereno e Lavanda, redução de movimento e preferências pessoais;
- busca global por metas, projetos e objetivos;
- persistência local e migração automática da primeira versão;
- layout responsivo para computador, tablet e celular;
- testes automatizados das regras de persistência e estatísticas;
- build e configuração prontos para Vercel.

## 3. Arquitetura atual

```text
Usuário
  -> interface React (pages/components)
  -> ações centralizadas em useFocoState
  -> estado AppState em memória
  -> salvamento automático no localStorage
  -> estatísticas derivadas por lib/stats
  -> interface renderizada novamente
```

É uma SPA: não há troca real de página nem React Router. `App.tsx` guarda a visão ativa e mostra o módulo correspondente dentro do mesmo shell. Isso deixa a navegação rápida e preserva o contexto visual.

Não existem backend, banco remoto, autenticação, API ou integrações externas nesta versão. Tudo roda no navegador e os dados pertencem ao dispositivo/perfil do navegador usado.

## 4. Stack e execução

| Tecnologia | Função |
|---|---|
| React 19 | interface e composição das telas |
| TypeScript 5 | tipos e segurança durante desenvolvimento/build |
| Vite 7 | servidor local e geração da versão de produção |
| Lucide React | ícones |
| CSS puro | identidade visual, temas e responsividade |
| Vitest | testes unitários |
| ESLint | qualidade estática do código |
| localStorage | persistência local |
| Vercel | hospedagem prevista |

Comandos:

```bash
npm ci          # instala exatamente o package-lock.json
npm run dev     # desenvolvimento local
npm test        # testes Vitest
npm run lint    # revisão ESLint
npm run build   # typecheck + build em dist/
npm run preview # prévia local do build
```

Node aceito: `>=20 <25`.

## 5. Fluxo de inicialização

1. `index.html` cria o elemento `#root` e carrega `src/main.tsx`.
2. `main.tsx` importa o CSS global e monta `<App />` em `StrictMode`.
3. `App.tsx` chama `useFocoState()`.
4. O hook chama `loadState()` como estado inicial.
5. `loadState()` tenta `foco-app-v2`, depois migra `foco-app-v1`; se falhar, usa dados iniciais válidos.
6. Qualquer alteração no estado dispara `saveState()` por `useEffect`.
7. Tema e redução de movimento viram classes no `.app-shell`.

## 6. Navegação e telas

### Meu dia (`view: hoje`)

É o ponto de partida. Mostra saudação, data, energia atual e metas da data local. O próximo passo é escolhido entre metas incompletas: primeiro combina com a energia selecionada e depois respeita prioridade `essencial`, `importante`, `extra`.

Também apresenta progresso do dia, tempo de tela, registro rápido de 25 minutos de foco, prévia semanal, blocos de rotina de hoje e objetivos ativos.

### Minha semana (`view: semana`)

Agrega os últimos sete dias de calendário. Mostra missões concluídas, minutos de foco, XP, média de tela, sequência de retorno, gráficos, 12 atividades recentes e conquistas.

A sequência conta dias consecutivos com atividade significativa. O dia atual vazio não quebra a sequência anterior; atividades do tipo `screen` não contam como retorno produtivo.

### Planejamento (`view: planejamento`)

Tem três abas internas, sem abrir outra página:

- `rotina`: horários de acordar/dormir, intenção, técnica escolhida e blocos recorrentes;
- `projetos`: motivo, prazo, cor, marcos e progresso observável;
- `objetivos`: área de vida, motivo, unidade, alvo, prazo e recompensa final.

Técnicas disponíveis:

- Sprint gentil: 15 min + 5 min, para pouca energia ou resistência;
- Pomodoro clássico: 25 min + 5 min, para tarefas claras;
- Blocos flexíveis: 45 min + 15 min, para estudo ou criação profunda;
- Regra do primeiro passo: 2 min, para paralisia ou tarefa vaga.

Os fundamentos exibidos ensinam a externalizar o tempo, reduzir a partida, proteger transições e planejar recuperação.

### Recompensas (`view: recompensas`)

Transforma moedas em retorno imediato e reforço positivo:

- Tema Lavanda: compra permanente, ativa/desativa e sincroniza com configurações;
- Pausa sem culpa: consumível; cobra moedas a cada resgate;
- Som de concentração: desbloqueável e ativável;
- Celebração Cósmica: muda a celebração de missão quando equipada.

Se as moedas forem insuficientes, nada é descontado e um aviso informa o valor faltante.

### Configurações (`view: configuracoes`)

Controla nome, limite diário de tela, início do dia, tema, redução de movimento e a preferência de lembretes internos. Também restaura os dados de demonstração após confirmação.

A preferência de lembrete é persistida, mas ainda não existe um motor que dispare avisos. O controle de tela é manual, pois uma página web não pode ler com segurança o uso total do dispositivo.

## 7. Busca e elementos globais

`Navigation.tsx` contém sidebar, cabeçalho, menu mobile, nível, moedas e atalhos. A busca abre por botão ou `Ctrl/Cmd + K`; `Escape` fecha diálogos.

A busca considera título/descrição de metas, nome/motivo de projetos e título/motivo de objetivos. Limita a oito resultados e direciona para a seção interna correta.

`App.tsx` também coordena diálogos, menu mobile, toast de 3,2 segundos e modal de celebração.

## 8. Modelo de dados

Todo o produto é representado por `AppState` versão 2:

| Entidade | Responsabilidade e relações |
|---|---|
| `Mission` | tarefa datada; pode apontar para `Project` e `Goal`; guarda duração, energia, prioridade e recompensa |
| `Project` | projeto com motivo, prazo, status e lista de `Milestone` |
| `Milestone` | entrega concreta que determina o progresso principal do projeto |
| `Goal` | objetivo de vida com área, alvo numérico, unidade, prazo e prêmio |
| `RoutinePlan` | técnica, limites do dia, intenção e blocos |
| `RoutineBlock` | horário, energia, dias da semana e datas concluídas |
| `Activity` | livro-caixa do histórico; registra tipo, data, XP, moedas e minutos opcionais |
| `ScreenLog` | total manual de minutos por data |
| `Reward` | item, custo, tipo, propriedade, estado equipado e resgates |
| `SettingsData` | nome, tema, movimento, tela, início do dia e lembretes |

`Activity.type` aceita `mission`, `goal`, `routine`, `focus`, `reward` e `screen`. Atualmente o ajuste de tela altera `ScreenLog` diretamente e não cria uma `Activity` de tela.

## 9. Regras de negócio e gamificação

### XP e nível

Quando uma ação concede XP, o nível é recalculado como `floor(XP / 100) + 1`. A barra exibe `XP % 100`, portanto cada nível ocupa 100 XP.

### Metas diárias

- moedas na criação: `max(10, round(duração × 1,5))`;
- XP: moedas + 10;
- concluir marca `completedAt`, soma XP/moedas e cria atividade;
- concluir novamente não gera prêmio duplicado;
- se ligada a projeto sem marcos, pode participar do cálculo de progresso do projeto.

### Projetos e marcos

Projeto novo começa ativo, com 0% e sem marcos. Com marcos, progresso é `concluídos / total × 100`. Completar marco dá 20 XP e 10 moedas; desfazer não retira prêmio. Em 100%, o status vira concluído; ao reabrir marco, volta a ativo.

Se não houver marcos, `projectProgress()` usa missões vinculadas. Sem marcos nem missões, preserva o progresso armazenado, o que mantém compatibilidade com dados antigos.

### Objetivos

Cada avanço soma uma unidade por padrão, limitado ao alvo. Avanço intermediário dá 10 XP e 5 moedas. O avanço final dá 80 XP e a recompensa configurada. Objetivo concluído ignora novos avanços.

### Rotina

Um bloco guarda as datas em que foi concluído. Marcar hoje dá 15 XP e 8 moedas e cria atividade; desmarcar remove a data, mas não retira a recompensa. Essa escolha evita punição e saldo negativo por correções.

### Foco e tela

Registrar foco calcula `max(10, round(minutos × 0,8))` XP e `max(5, round(minutos × 0,4))` moedas. O controle de tela soma ou reduz minutos e nunca permite valor abaixo de zero.

### Recompensas

Itens não consumíveis são comprados uma vez e depois alternados sem novo custo. A pausa é consumível e cobra a cada uso. Toda compra/resgate cria uma atividade com moedas negativas. Tema equipado e `settings.activeTheme` permanecem sincronizados.

## 10. Datas, histórico e estatísticas

`localDate()` corrige o deslocamento de fuso antes de gerar `YYYY-MM-DD`, evitando registrar ações no dia errado. `dayOffset()` é usado para datas relativas e dados iniciais.

`getWeekStats()` percorre hoje e os seis dias anteriores, agregando missões, foco, XP e tela. `WeekChart` normaliza cada barra pelo maior valor do período e suporta `missions`, `focus` e `screen`.

`clampProgress()` limita percentuais a 100% e trata alvo inválido como 0%.

## 11. Persistência, privacidade e migração

Chave atual: `foco-app-v2`. Chave antiga: `foco-app-v1`.

A migração preserva nome, saldo, XP, nível, energia, projetos e missões antigos; completa os campos novos com valores seguros e inclui os novos módulos. JSON inválido não derruba a aplicação: o sistema volta ao estado inicial.

Não há envio de dados para terceiros, cookies próprios, telemetria ou credenciais. Limpar o armazenamento do navegador, usar modo privado ou trocar de aparelho pode apagar/isolar os dados.

## 12. Design e acessibilidade

O visual usa fundo creme, verde musgo, superfícies claras e cores suaves para se afastar da linguagem de gateway financeiro. Variáveis CSS permitem trocar Sereno por Lavanda sem duplicar componentes.

Breakpoints principais: 1080 px, 800 px e 520 px. Abaixo de 800 px a sidebar vira gaveta; grades viram uma coluna progressivamente. Diálogos usam `role="dialog"`, busca e gráfico têm rótulos, botões de ícone possuem nomes e há suporte a `prefers-reduced-motion` e preferência interna de movimento reduzido.

## 13. Mapa completo de arquivos

```text
/
├─ index.html                 entrada HTML, metadados e #root
├─ package.json               dependências, scripts e versão do Node
├─ package-lock.json          versões exatas instaláveis
├─ vite.config.ts             plugin React no Vite
├─ vercel.json                install, build, saída e rewrite da SPA
├─ eslint.config.js           regras de lint
├─ tsconfig.json              referências TypeScript
├─ tsconfig.app.json          TypeScript da aplicação
├─ tsconfig.node.json         TypeScript das ferramentas Node/Vite
├─ README.md                  início rápido e publicação
├─ projectguia.md             este mapa funcional e técnico
└─ src/
   ├─ main.tsx                monta App e carrega CSS
   ├─ App.tsx                 orquestra visão, modais, toast e celebração
   ├─ types.ts                contrato integral do estado e entidades
   ├─ styles.css              tokens, componentes, temas e responsividade
   ├─ hooks/
   │  └─ useFocoState.ts      estado e todas as mutações/regras de negócio
   ├─ lib/
   │  ├─ store.ts             estado inicial, datas, storage e migração
   │  ├─ stats.ts             semana, sequência e cálculos de progresso
   │  ├─ store.test.ts        testes de estado, persistência e migração
   │  └─ stats.test.ts        testes de agregações e progresso
   ├─ components/
   │  ├─ Navigation.tsx       sidebar, cabeçalho e navegação mobile
   │  ├─ Dialogs.tsx          criação e busca por modais reutilizáveis
   │  └─ WeekChart.tsx        gráfico semanal reutilizável
   └─ pages/
      ├─ TodayPage.tsx        Meu dia
      ├─ WeekPage.tsx         Minha semana
      ├─ PlanningPage.tsx     Rotina, Projetos e Objetivos
      ├─ RewardsPage.tsx      loja e uso de recompensas
      └─ SettingsPage.tsx     preferências e restauração
```

## 14. Onde alterar cada comportamento

- adicionar entidade/campo: `types.ts`, valor inicial/migração em `store.ts`, ação em `useFocoState.ts` e UI correspondente;
- mudar recompensas, XP ou moedas: `useFocoState.ts`; textos/custos iniciais também em `store.ts`;
- mudar estatísticas: `stats.ts` e seus testes;
- criar tela principal: adicionar `View`, página, item em `Navigation` e condição em `App`;
- criar aba de planejamento: adicionar `PlanningTab` e conteúdo em `PlanningPage`;
- mudar tema/layout: tokens e seletores em `styles.css`;
- mudar formulário ou busca: `Dialogs.tsx`;
- mudar deploy: `vercel.json` e scripts do `package.json`.

## 15. Testes e critérios de segurança

`store.test.ts` verifica estado v2 completo, preferências, migração sem perda e recuperação de JSON inválido. `stats.test.ts` verifica sete dias, agregações, progresso de projetos, limites percentuais e sequência.

Antes de publicar: executar `npm test`, `npm run lint` e `npm run build`; depois testar criação/conclusão de meta, marco, objetivo, rotina, compra/ativação de recompensa, busca, preferências, recarga e menu mobile.

Como não há servidor, as validações atuais protegem experiência e consistência local, não representam segurança multiusuário. Quando existir backend, saldo, recompensas, autorização e validações críticas deverão ser recalculados no servidor.

## 16. Limites atuais

- não há login, sincronização ou backup em nuvem;
- não há motor de lembretes, notificações do sistema nem calendário externo;
- não há captura automática de tela ou cronômetro contínuo;
- projetos, metas e rotinas ainda não possuem edição/exclusão completa;
- som de concentração registra ativação, mas não reproduz áudio;
- histórico semanal é uma janela móvel de sete dias, não um calendário navegável;
- testes cobrem lógica central, mas ainda não são testes E2E automatizados.

## 17. Caminho recomendado do produto

1. Consolidar o uso local: edição/exclusão, timer real, recompensas personalizadas, histórico navegável e mais testes de interface.
2. Adicionar conta e backend: autenticação, banco PostgreSQL, autorização por usuário, migrations, backup e sincronização.
3. Tornar a gamificação configurável: catálogo pessoal, limites antiabuso, regras calculadas no servidor e relatórios de padrões.
4. Integrar quando houver valor claro: notificações opt-in, calendário e captura de uso apenas por meios autorizados.
5. Evoluir para acompanhamento adaptativo: sugestões baseadas no histórico, sempre explicáveis e sem diagnóstico médico.

A direção é manter o Foco simples na superfície e confiável por baixo: primeiro ajudar a pessoa a voltar para o próximo passo; depois sincronizar, aprender padrões e ampliar integrações sem transformar apoio em vigilância ou cobrança.
