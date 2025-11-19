# Painel de Agendamentos

Aplicação Next.js (App Router) para leitura e gestão de agendas Google via webhooks n8n. O painel permite consultar eventos por calendário/período, editar e excluir compromissos e administrar calendários disponíveis.

## Requisitos

- Node.js >= 18.18
- npm (padrão do projeto)

## Configuração

1. Instale as dependências:

```bash
npm install
```

2. Copie o arquivo de exemplo e informe as URLs reais (podem ser as fornecidas pelo n8n):

```bash
cp .env.example .env.local
```

3. Execute o projeto em modo desenvolvimento:

```bash
npm run dev
```

O painel ficará acessível em [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` – servidor Next.js em modo desenvolvimento
- `npm run build` – build de produção
- `npm run start` – executa o build
- `npm run lint` – validações ESLint
- `npm run test` – testes unitários com Vitest

## Estrutura inicial

- `src/app` – rotas e layouts App Router
- `src/components` – componentes reutilizáveis (UI/modais/formulários)
- `src/lib` – integrações com webhooks e utilitários
- `src/providers` – provedores globais (React Query, toasts)
- `tests` – testes unitários

## Variáveis de ambiente

| Nome | Descrição |
| --- | --- |
| `VER_AGENDA_WEBHOOK` | Webhook n8n para listar eventos |
| `EDITAR_EVENTO_WEBHOOK` | Webhook para criar/editar evento |
| `DELETAR_EVENTO_WEBHOOK` | Webhook para excluir evento |
| `ID_AGENDAS_WEBHOOK` | Webhook para listar/gerenciar calendários |
| `DEFAULT_TIMEZONE` | Fuso horário padrão (ex.: `America/Sao_Paulo`) |

## Próximos passos

- Implementar cliente HTTP tipado `lib/api.ts`
- Construir UI (filtros, lista de eventos, modais)
- Cobrir integrações principais com testes unitários
