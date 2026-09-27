import { asc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { cronogramaItens, professores } from "@/db/schema";
import { auth } from "@/modules/auth/auth";
import { BotaoSair } from "../../_components/botao-sair";
import { SiteHeader } from "../../_components/site-header";

export const metadata: Metadata = { title: "Área do profissional — LPZ Training" };

export default async function Page() {
  const sessao = await auth.api.getSession({ headers: await headers() });
  if (!sessao) redirect("/profissionais");
  // Checagem de papel no servidor — é ela que protege a área.
  if (sessao.user.papel !== "profissional") redirect("/profissionais?erro=restrito");

  const { user } = sessao;
  const professorId = user.professorId;

  const [perfil, aulas] = professorId
    ? await Promise.all([
        db.query.professores.findFirst({ where: eq(professores.id, professorId) }),
        db
          .select()
          .from(cronogramaItens)
          .where(eq(cronogramaItens.professorId, professorId))
          .orderBy(asc(cronogramaItens.dia), asc(cronogramaItens.ordem)),
      ])
    : [undefined, []];

  return (
    <>
      <SiteHeader />
      <main className="bg-city-glow min-h-[80vh] px-4 py-16">
        <div className="mx-auto max-w-lg">
          <h1 className="font-display text-2xl uppercase tracking-[0.2em] text-gold-metal">Área do profissional</h1>
          <p className="mt-4 text-mist/90">Olá, {user.name.split(" ")[0]}!</p>

          <section className="mt-8 rounded-2xl border border-white/10 bg-petrol-900/80 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-teal-300">Meus dados</h2>
            <dl className="mt-4 space-y-3">
              {[
                { rotulo: "Nome", valor: user.name },
                { rotulo: "E-mail", valor: user.email },
                { rotulo: "Perfil no site", valor: perfil?.nome ?? "Ainda não vinculado" },
                ...(perfil?.instagram ? [{ rotulo: "Instagram", valor: perfil.instagram }] : []),
              ].map((d) => (
                <div key={d.rotulo} className="flex justify-between gap-4 border-b border-white/5 pb-2 text-sm">
                  <dt className="text-mist/60">{d.rotulo}</dt>
                  <dd className="text-right text-white">{d.valor}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-6 rounded-2xl border border-white/10 bg-petrol-900/80 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-teal-300">Minhas aulas</h2>
            {!professorId ? (
              <p className="mt-3 text-sm text-mist/70">
                Sua conta ainda não está ligada a um perfil de professor. Fale com a organização.
              </p>
            ) : aulas.length === 0 ? (
              <p className="mt-3 text-sm text-mist/70">Nenhuma aula sua no cronograma por enquanto.</p>
            ) : (
              <ol className="mt-4 space-y-3">
                {aulas.map((aula) => (
                  <li key={aula.id} className="rounded-lg border border-white/10 border-l-2 border-l-gold-400 bg-petrol-950/60 p-3">
                    <p className="text-sm font-medium text-teal-300">
                      {aula.dia} · {aula.horarioInicio}
                      {aula.horarioFim ? ` – ${aula.horarioFim}` : ""}
                    </p>
                    <p className="mt-1 font-semibold text-white">{aula.titulo}</p>
                    {aula.local && <p className="text-sm text-mist/70">{aula.local}</p>}
                  </li>
                ))}
              </ol>
            )}
          </section>

          <div className="mt-8">
            <BotaoSair destino="/profissionais" />
          </div>
        </div>
      </main>
    </>
  );
}
