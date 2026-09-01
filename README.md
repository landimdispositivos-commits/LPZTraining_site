# LPZ Training

Site do LPZ Training — congresso/treinamento de zouk. Divulgação do evento
(cronograma, professores, agenda), galeria de fotos e vídeos, e venda de
ingressos com pagamento online.

Ver `CLAUDE.md` para as diretrizes de segurança, escopo, LGPD e custo que
regem este projeto.

## Stack

- **Next.js (App Router) + TypeScript** — front-end e back-end no mesmo
  projeto (monólito modular).
- **PostgreSQL + Drizzle ORM** — banco relacional, migrations versionadas em
  `src/db/migrations/`.
- **Tailwind CSS v4** — estilos, tokens de marca (laranja/verde) em
  `src/app/globals.css`.
- **Mercado Pago (Checkout Pro)** — pagamento (ainda não implementado; ver
  `src/modules/pagamentos`, hoje só com o `FakePaymentProvider` de dev).
- **Fotos**: disco local via `StorageAdapter` (`src/modules/midia`).
  **Vídeos**: embed do YouTube (a implementar).
- Hospedagem alvo: VPS própria (Docker Compose), com Cloudflare na frente.

## Pré-requisitos

- Node.js 24+ e npm
- Docker Desktop (para Postgres e Mailpit local) — **ainda não instalado
  nesta máquina**; instale antes do primeiro `docker compose up`

## Como rodar localmente

1. Copie o arquivo de variáveis de ambiente:

   ```
   cp .env.example .env
   ```

2. Suba o banco de dados e o capturador de e-mail (Mailpit):

   ```
   docker compose up db mailpit
   ```

3. Em outro terminal, instale as dependências e rode as migrations:

   ```
   npm install
   npm run db:migrate
   npm run db:seed   # dados fictícios para desenvolvimento
   ```

4. Rode o site:

   ```
   npm run dev
   ```

   Acesse http://localhost:3000. E-mails capturados aparecem em
   http://localhost:8025 (Mailpit).

Alternativa: `docker compose up` (sem especificar serviços) sobe app + banco
+ mailpit inteiramente em containers — reproduz a topologia da VPS, mas o
hot reload tende a ser mais lento no Windows do que rodar `npm run dev` no
host.

`TEST_MODE=true` no `.env` (padrão) faz o checkout usar um provedor de
pagamento simulado (`FakePaymentProvider`), sem chamar o Mercado Pago.
**Nunca** desabilitar isso fora de um ambiente com o adapter real e
credenciais de sandbox/produção configuradas corretamente.

## Estrutura

- `src/app/` — rotas (App Router: páginas e API)
- `src/modules/` — regras de negócio por domínio (`pagamentos`, `midia`,
  e futuramente `eventos`, `pedidos`, `ingressos`, `admin`), cada um com
  interfaces (porta) e implementações (adapter) quando aplicável
- `src/db/` — schema Drizzle, migrations e seed
- `docs/` — documentação, incluindo ADRs de decisões arquiteturais
- `tests/` — testes automatizados
- `scripts/` — scripts utilitários e de automação

## Notas

- `npm audit` reporta uma vulnerabilidade moderada em uma dependência
  transitiva do `drizzle-kit` (esbuild da ferramenta de dev). Afeta apenas o
  servidor de desenvolvimento local dessa CLI, não o código que roda em
  produção — corrigir exigiria downgrade do `drizzle-kit`, o que não vale a
  pena no momento.
