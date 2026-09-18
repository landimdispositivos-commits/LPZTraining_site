# AGENTS.md — Diretrizes do Projeto LPZ

> Este arquivo é carregado automaticamente pelo Codex (e por qualquer
> subagente do projeto) sempre que uma sessão roda dentro desta pasta.
> Ele define os limites de comportamento para qualquer agente que trabalhe
> neste repositório.

## Sobre o projeto

Site para os eventos **LPZ Baile** (festa mensal de zouk/lambada) e
**LPZ Training** (congresso/treinamento de zouk). O site inclui: cronograma,
professores/DJs, agenda de aulas, venda e pagamento de ingressos, área
administrativa (login para organizadores/professores) e check-in de
participantes na entrada do evento (validação de ingresso). Volume esperado:
~200 congressistas, ~500 visitantes/compradores no site.

Por lidar com **pagamentos** e **dados pessoais de participantes**, as
diretrizes de segurança e conformidade abaixo não são opcionais.

---

## 1. Segurança

- **Nunca** exponha, logue ou salve em texto plano: chaves de API, senhas,
  tokens, segredos de webhook ou dados de cartão/pagamento. Use variáveis de
  ambiente (`.env`) e garanta que `.env` está no `.gitignore`.
- **Nunca** faça commit de credenciais, mesmo temporariamente "pra testar".
- **Nunca** desabilite validação, autenticação ou checks de segurança para
  acelerar um teste — implemente o modo de teste correto (ex: variável de
  ambiente `TEST_MODE`, sandbox do gateway de pagamento).
- Sempre valide e sanitize qualquer entrada vinda do usuário (formulário de
  compra, login administrativo, upload de imagem) — proteja contra SQL
  injection, XSS e CSRF.
- Toda rota administrativa (login de organizadores/professores) deve exigir
  autenticação; toda rota de check-in deve validar o ingresso contra o banco
  antes de confirmar entrada (nunca confiar só no QR code decodificado).
- Ações irreversíveis ou de alto impacto — deletar dados de participante,
  emitir reembolso, publicar alterações em produção — exigem confirmação
  explícita do responsável humano, nunca automação silenciosa.

## 2. Limites de escopo (o que o agente pode e não pode fazer)

- Cada subagente deve ter uma tarefa clara e ferramentas restritas ao
  necessário (ex: um agente de revisão de código não precisa de acesso a
  Bash com permissão de deploy).
- Não usar `permissionMode: bypassPermissions` em nada que toque pagamento,
  dados de participante ou banco de produção.
- Definir `maxTurns` em agentes automatizados para evitar loops e gasto de
  contexto/custo sem necessidade.
- Mudanças em schema de banco de dados, integração de pagamento ou
  infraestrutura de hospedagem devem ser propostas e explicadas antes de
  implementadas — não aplicar silenciosamente.

## 3. Conformidade legal

- **LGPD**: coletar apenas os dados de participante estritamente necessários
  (nome, e-mail, ingresso comprado). Nunca solicitar ou armazenar dados
  sensíveis sem necessidade clara. Ter um caminho para o participante
  solicitar exclusão dos seus dados.
- Não usar imagens, textos, logos ou músicas de terceiros sem licença —
  inclusive em landing pages e materiais promocionais.
- Não implementar dark patterns: cobrança escondida, checkbox pré-marcado
  para opt-in de marketing, dificultar cancelamento/reembolso.
- Qualquer integração com gateway de pagamento (Mercado Pago, Stripe etc.)
  deve seguir os termos de uso do provedor — sinalizar ao responsável humano
  antes de aceitar automaticamente termos de serviço de terceiros.

## 4. Tecnologia e boas práticas de mercado

- Antes de adicionar uma dependência nova, verificar se ela é mantida
  ativamente, tem boa documentação e adoção — evitar pacotes sem atualização
  há mais de 2 anos.
- Justificar a escolha de stack/biblioteca comparando pelo menos uma
  alternativa antes de implementar (breve, mas explícito).
- Priorizar soluções simples e testadas em produção por outras empresas em
  vez de tecnologia experimental, a menos que haja um motivo concreto.
- Manter o código responsivo e acessível (o site já usa paleta laranja/verde
  suave e deve funcionar bem em mobile, já que boa parte da venda de
  ingresso tende a vir do celular).

## 5. Custo baixo

- Escolher o modelo certo por tarefa: tarefas simples (busca, formatação,
  leitura) → modelo mais barato (ex: Haiku); tarefas complexas (arquitetura,
  debug difícil) → modelo mais capaz.
- Delegar tarefas de alto volume de saída (rodar testes, ler logs grandes)
  para subagentes, para não inflar o contexto principal.
- Preferir edições incrementais a reescritas completas de arquivos grandes.
- Ao propor hospedagem, banco de dados ou gateway de pagamento, comparar
  custo estimado para o volume esperado (~500 acessos/compras) antes de
  decidir — não escolher só pela funcionalidade.

---

## Resumo rápido para qualquer agente

1. Nunca exponha segredos nem desative segurança "pra testar".
2. Fique dentro do escopo da tarefa; peça confirmação antes de ações
   irreversíveis.
3. Respeite LGPD e direitos autorais; nada de dark patterns.
4. Use tecnologia atual e bem mantida — mas justifique a escolha.
5. Escolha a opção mais barata que atenda o volume esperado do evento.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
