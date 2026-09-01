import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { cronogramaItens, lotes, professores } from "@/db/schema";

export const revalidate = 60;

async function getDadosLanding() {
  const [cronograma, listaProfessores, loteAtivo] = await Promise.all([
    db
      .select({
        id: cronogramaItens.id,
        dia: cronogramaItens.dia,
        horarioInicio: cronogramaItens.horarioInicio,
        horarioFim: cronogramaItens.horarioFim,
        titulo: cronogramaItens.titulo,
        local: cronogramaItens.local,
        professorNome: professores.nome,
      })
      .from(cronogramaItens)
      .leftJoin(professores, eq(cronogramaItens.professorId, professores.id))
      .orderBy(asc(cronogramaItens.dia), asc(cronogramaItens.ordem)),
    db.select().from(professores).orderBy(asc(professores.ordem)),
    db.query.lotes.findFirst({ where: eq(lotes.ativo, true) }),
  ]);

  return { cronograma, listaProfessores, loteAtivo };
}

function formatarPreco(centavos: number) {
  return (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function Home() {
  const { cronograma, listaProfessores, loteAtivo } = await getDadosLanding();

  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:shadow"
      >
        Pular para o conteúdo
      </a>

      <header className="sticky top-0 z-40 border-b border-brand-orange-100 bg-brand-orange-50/95 backdrop-blur">
        <nav
          aria-label="Navegação principal"
          className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4"
        >
          <span className="text-lg font-bold text-brand-orange-700">LPZ Training</span>
          <ul className="hidden gap-6 text-sm font-medium sm:flex">
            <li><a href="#cronograma" className="hover:text-brand-orange-700">Cronograma</a></li>
            <li><a href="#professores" className="hover:text-brand-orange-700">Professores</a></li>
            <li><a href="#ingressos" className="hover:text-brand-orange-700">Ingressos</a></li>
          </ul>
        </nav>
      </header>

      <main id="conteudo">
        <section className="mx-auto max-w-5xl px-4 py-16 text-center sm:py-24">
          <h1 className="text-3xl font-extrabold tracking-tight text-brand-orange-700 sm:text-5xl">
            LPZ Training
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-brand-ink/80 sm:text-lg">
            Congresso de zouk com aulas, professores convidados e muito baile.
            Cronograma, professores e ingressos aqui embaixo.
          </p>
          <a
            href="#ingressos"
            className="mt-8 inline-block rounded-full bg-brand-green-600 px-8 py-3 font-semibold text-white shadow-sm transition hover:bg-brand-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green-700"
          >
            Ver ingressos
          </a>
        </section>

        <section id="cronograma" className="bg-white px-4 py-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold text-brand-orange-700">Cronograma</h2>
            {cronograma.length === 0 ? (
              <p className="mt-4 text-brand-ink/70">
                Cronograma em breve.
              </p>
            ) : (
              <ol className="mt-6 space-y-4">
                {cronograma.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-lg border border-brand-orange-100 p-4"
                  >
                    <p className="text-sm font-medium text-brand-green-700">
                      {item.dia} · {item.horarioInicio}
                      {item.horarioFim ? ` – ${item.horarioFim}` : ""}
                    </p>
                    <p className="mt-1 font-semibold">{item.titulo}</p>
                    <p className="text-sm text-brand-ink/70">
                      {[item.professorNome, item.local].filter(Boolean).join(" · ")}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>

        <section id="professores" className="px-4 py-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold text-brand-orange-700">Professores</h2>
            {listaProfessores.length === 0 ? (
              <p className="mt-4 text-brand-ink/70">Professores em breve.</p>
            ) : (
              <ul className="mt-6 grid gap-6 sm:grid-cols-2">
                {listaProfessores.map((professor) => (
                  <li
                    key={professor.id}
                    className="rounded-lg border border-brand-green-100 bg-white p-4"
                  >
                    <p className="font-semibold">{professor.nome}</p>
                    {professor.bio && (
                      <p className="mt-1 text-sm text-brand-ink/70">{professor.bio}</p>
                    )}
                    {professor.instagram && (
                      <p className="mt-2 text-sm text-brand-green-700">{professor.instagram}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section id="ingressos" className="bg-white px-4 py-16">
          <div className="mx-auto max-w-md text-center">
            <h2 className="text-2xl font-bold text-brand-orange-700">Ingressos</h2>
            {loteAtivo ? (
              <div className="mt-6 rounded-lg border border-brand-orange-100 p-6">
                <p className="text-sm font-medium text-brand-green-700">{loteAtivo.nome}</p>
                <p className="mt-1 text-3xl font-extrabold">
                  {formatarPreco(loteAtivo.precoCentavos)}
                </p>
                <p className="mt-4 text-sm text-brand-ink/60">
                  Checkout de pagamento ainda não disponível nesta versão do site.
                </p>
              </div>
            ) : (
              <p className="mt-4 text-brand-ink/70">
                Vendas ainda não abertas. Volte em breve.
              </p>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-brand-orange-100 px-4 py-8 text-center text-sm text-brand-ink/60">
        LPZ Training
      </footer>
    </>
  );
}
