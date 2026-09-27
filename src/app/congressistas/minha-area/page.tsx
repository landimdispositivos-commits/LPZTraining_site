import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/modules/auth/auth";
import { SiteHeader } from "../../_components/site-header";
import { BotaoSair } from "../../_components/botao-sair";

export const metadata: Metadata = { title: "Minha área — LPZ Training" };

// Mostra só os 3 primeiros dígitos: a tela pode estar à vista de outras pessoas.
function mascararCpf(cpf: string) {
  return `${cpf.slice(0, 3)}.***.***-**`;
}

export default async function Page(props: PageProps<"/congressistas/minha-area">) {
  const sessao = await auth.api.getSession({ headers: await headers() });
  const { bemvindo, error } = await props.searchParams;

  // Link de confirmação inválido/expirado chega aqui com ?error=...
  if (!sessao) redirect(error ? "/congressistas?erro=link" : "/congressistas");

  const { user } = sessao;
  if (user.papel === "profissional") redirect("/profissionais/minha-area");

  const dados = [
    { rotulo: "Nome", valor: user.name },
    { rotulo: "E-mail", valor: user.email },
    { rotulo: "Celular", valor: user.celular ?? "—" },
    { rotulo: "País", valor: user.uf ? `${user.pais} — ${user.uf}` : (user.pais ?? "—") },
    ...(user.cpf ? [{ rotulo: "CPF", valor: mascararCpf(user.cpf) }] : []),
  ];

  return (
    <>
      <SiteHeader />
      <main className="bg-city-glow min-h-[80vh] px-4 py-16">
        <div className="mx-auto max-w-lg">
          <h1 className="font-display text-2xl uppercase tracking-[0.2em] text-gold-metal">Minha área</h1>
          {bemvindo && (
            <p role="status" className="mt-4 rounded-lg border border-teal-400/50 bg-teal-400/10 px-4 py-3 text-sm">
              E-mail confirmado. Bem-vindo(a) ao LPZ Training!
            </p>
          )}
          <p className="mt-4 text-mist/90">Olá, {user.name.split(" ")[0]}!</p>

          <section className="mt-8 rounded-2xl border border-white/10 bg-petrol-900/80 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-teal-300">Meus dados</h2>
            <dl className="mt-4 space-y-3">
              {dados.map((d) => (
                <div key={d.rotulo} className="flex justify-between gap-4 border-b border-white/5 pb-2 text-sm">
                  <dt className="text-mist/60">{d.rotulo}</dt>
                  <dd className="text-right text-white">{d.valor}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-6 rounded-2xl border border-white/10 bg-petrol-900/80 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-teal-300">Meus ingressos</h2>
            <p className="mt-3 text-sm text-mist/70">
              Em breve você poderá comprar e acompanhar seus ingressos por aqui.
            </p>
          </section>

          <div className="mt-8">
            <BotaoSair destino="/congressistas" />
          </div>
        </div>
      </main>
    </>
  );
}
