# Foco — organização no seu ritmo

Um organizador pessoal pensado para reduzir a fricção de começar. Projetos viram missões pequenas, missões rendem XP e moedas, e o progresso pode ser trocado por recompensas.

## O que já funciona

- painel diário que se adapta ao nível de energia;
- sugestão automática do próximo passo;
- criação e conclusão de missões;
- criação e progresso de projetos;
- moedas, XP, níveis e recompensas;
- feedback positivo sem punição por quebrar sequências;
- dados salvos automaticamente no navegador;
- interface responsiva para celular, tablet e computador.

## Como abrir

Abra um terminal nesta pasta e execute:

```bash
npm run dev
```

Depois acesse o endereço exibido no terminal, normalmente `http://localhost:5173`.

Para gerar a versão final:

```bash
npm run build
```

## Publicar na Vercel

O projeto já inclui `vercel.json` e está pronto para deploy como aplicação Vite.

1. Na Vercel, escolha **Add New > Project**.
2. Importe o repositório `growthvendas00-hub/tdah`.
3. A Vercel identificará o framework Vite automaticamente.
4. Não é necessário configurar variáveis de ambiente nesta versão.
5. Confirme em **Deploy**.

Configurações utilizadas:

- instalação: `npm ci`;
- build: `npm run build`;
- pasta de saída: `dist`;
- Node.js: versão 22 recomendada.

Os dados pessoais do aplicativo são armazenados apenas no navegador usado. Por enquanto, dispositivos diferentes não compartilham projetos e missões.

## Próximos capítulos possíveis

1. Rotinas recorrentes e planejamento semanal.
2. Cronômetro de foco com pausas adaptativas.
3. Recompensas personalizadas e inventário visual.
4. Missões sugeridas por contexto e energia.
5. Conta e sincronização entre dispositivos.
6. Histórico gentil para identificar padrões sem culpa.

## Princípios do produto

- mostrar poucas escolhas por vez;
- tornar o primeiro passo pequeno e claro;
- celebrar retorno, não perfeição;
- nunca retirar pontos por um dia difícil;
- usar gamificação para apoiar a vida real, não para competir com ela.
