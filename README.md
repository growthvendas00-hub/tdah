# Foco — organização no seu ritmo

Um organizador pessoal acolhedor e gamificado, pensado para reduzir a fricção de começar e apoiar pessoas com TDAH sem transformar produtividade em cobrança.

## O que já funciona

- painel **Meu dia** com nível de energia, próximo passo e metas diárias;
- conclusão de missões com XP, moedas, celebração e histórico por data;
- **Minha semana** com gráfico, resumo de foco, tela, metas e conquistas;
- controle manual de tempo de tela, sem permissões invasivas;
- planejamento interno de rotina, projetos e objetivos de vida;
- técnicas explicadas de forma curta: Pomodoro, Timeboxing e Sprint gentil;
- projetos com marcos reais e progresso calculado pelas entregas;
- objetivos com prazo, unidade, progresso e recompensas;
- loja com temas, experiências e itens desbloqueáveis de verdade;
- busca global, configurações, tema Lavanda e redução de movimento;
- migração automática dos dados da primeira versão;
- dados salvos localmente no navegador;
- interface responsiva para celular, tablet e computador.
- workspace **Metas Business** com quadro, projetos, responsáveis, objetivos, perfis e ranking;
- contas e sincronização entre sócios quando conectado ao Supabase;
- modo demonstração local para testar a colaboração sem configuração;
- acompanhamento privado e opcionalmente compartilhável de redução de hábitos.

## Desenvolvimento

Requer Node.js 20 ou superior.

```bash
npm ci
npm run dev
```

O endereço local normalmente será `http://localhost:5173`.

### Validação

```bash
npm test
npm run lint
npm run build
```

## Publicar na Vercel

O projeto inclui `vercel.json` e está pronto para deploy como aplicação Vite.

1. Na Vercel, escolha **Add New > Project**.
2. Importe o repositório `growthvendas00-hub/tdah`.
3. Confirme o framework **Vite**.
4. Para contas reais, configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
5. Execute a migration em `supabase/migrations` no SQL Editor do Supabase.
6. Clique em **Deploy**.

Configuração esperada:

- instalação: `npm ci`;
- build: `npm run build`;
- saída: `dist`.

## Privacidade e limites atuais

O painel pessoal continua no navegador. O controle de tela é manual e o aplicativo não acessa outros programas. Quando o Supabase está configurado, contas, workspaces e hábitos autorizados sincronizam entre aparelhos; sem ele, esses módulos usam a demonstração local.

## Princípios do produto

- mostrar poucas escolhas por vez;
- tornar o primeiro passo pequeno e claro;
- celebrar retorno, não perfeição;
- nunca retirar pontos por um dia difícil;
- usar gamificação para apoiar a vida real, não para competir com ela.
