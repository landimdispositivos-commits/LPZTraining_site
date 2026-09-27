import type { Metadata } from "next";
import { SiteHeader } from "../_components/site-header";

export const metadata: Metadata = { title: "Política de Privacidade — LPZ Training" };

// RASCUNHO — texto precisa de revisão da organização (idealmente com
// orientação jurídica) antes do lançamento. Trechos entre [colchetes] são
// dados a preencher.
export default function Page() {
  return (
    <>
      <SiteHeader />
      <main className="px-4 py-16">
        <article className="mx-auto max-w-2xl space-y-6 text-mist/90 [&_h2]:mt-10 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-gold-300 [&_li]:ml-5 [&_li]:list-disc">
          <h1 className="font-display text-2xl uppercase tracking-[0.2em] text-gold-metal">
            Política de Privacidade
          </h1>
          <p className="rounded-lg border border-ember-500/50 bg-ember-500/10 px-4 py-3 text-sm">
            Rascunho em revisão. Última atualização: [data].
          </p>

          <p>
            Esta política explica como o LPZ Training ([nome/razão social do responsável], [CNPJ ou
            CPF]) trata os dados pessoais de quem se cadastra no site, conforme a Lei Geral de
            Proteção de Dados (Lei 13.709/2018 — LGPD).
          </p>

          <h2>Quais dados coletamos e por quê</h2>
          <ul className="space-y-2">
            <li><strong className="text-white">Nome e e-mail</strong> — identificar você, dar acesso à sua conta e enviar comunicações sobre o seu ingresso e o evento.</li>
            <li><strong className="text-white">Celular</strong> — contato sobre o evento (ex: mudanças de horário) e suporte.</li>
            <li><strong className="text-white">CPF</strong> (só para quem mora no Brasil) — exigido pelo Mercado Pago para processar o pagamento do ingresso.</li>
            <li><strong className="text-white">Estado ou país</strong> — organização do evento (ex: saber de onde vêm os participantes).</li>
            <li><strong className="text-white">Dados técnicos de acesso</strong> (endereço IP e navegador) — segurança da conta e prevenção de fraudes.</li>
          </ul>
          <p>
            Não pedimos dados sensíveis e não usamos seus dados para marketing sem o seu
            consentimento específico. Sua senha é armazenada de forma criptografada (hash) e ninguém
            da organização tem acesso a ela.
          </p>

          <h2>Base legal</h2>
          <p>
            Tratamos esses dados para executar o contrato de compra do ingresso e os procedimentos
            que o antecedem (art. 7º, V, da LGPD), para cumprir obrigações legais (art. 7º, II) e,
            no caso dos dados técnicos de acesso, por legítimo interesse na segurança do site
            (art. 7º, IX).
          </p>

          <h2>Com quem compartilhamos</h2>
          <ul className="space-y-2">
            <li><strong className="text-white">Mercado Pago</strong> — processamento do pagamento. Os dados do seu cartão são informados diretamente ao Mercado Pago; o LPZ Training não os recebe nem armazena.</li>
            <li><strong className="text-white">Provedores de infraestrutura</strong> — hospedagem do site e envio de e-mails, apenas para operar o serviço.</li>
          </ul>
          <p>Não vendemos seus dados.</p>

          <h2>Por quanto tempo guardamos</h2>
          <p>
            Enquanto sua conta estiver ativa. Dados ligados a pagamentos podem ser mantidos pelo
            prazo exigido pela legislação fiscal, mesmo após a exclusão da conta. [Definir prazo.]
          </p>

          <h2>Seus direitos</h2>
          <p>
            Você pode, a qualquer momento, pedir: confirmação e acesso aos seus dados, correção,
            exclusão, informação sobre compartilhamento e revogação de consentimento (art. 18 da
            LGPD). Para isso, escreva para <strong className="text-white">[e-mail de contato de
            privacidade]</strong>. Respondemos em até 15 dias.
          </p>

          <h2>Contato</h2>
          <p>Dúvidas sobre esta política: [e-mail de contato de privacidade].</p>
        </article>
      </main>
    </>
  );
}
