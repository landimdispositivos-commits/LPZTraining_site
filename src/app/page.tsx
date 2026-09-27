import { asc, eq } from "drizzle-orm";
import Link from "next/link";
import { db } from "@/db";
import { cronogramaItens, lotes, professores } from "@/db/schema";
import { SiteHeader } from "./_components/site-header";

// Conteúdo vem do admin e o volume de acesso é baixo — renderizar por
// requisição evita ter que acessar o banco durante `next build`.
export const dynamic = "force-dynamic";

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

// Linhas finas em curva, como no material de divulgação. Só decoração.
function LinhasDecorativas() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-20 sm:opacity-40"
      viewBox="0 0 400 800"
      preserveAspectRatio="none"
      fill="none"
      stroke="white"
      strokeWidth="1"
    >
      <path d="M-20 520 L120 120 Q140 60 200 60 L420 60" vectorEffect="non-scaling-stroke" />
      <path d="M420 180 L330 180 Q280 180 260 240 L150 560" vectorEffect="non-scaling-stroke" />
      <path d="M420 420 L300 800" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function TituloSecao({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-xl uppercase tracking-[0.2em] text-gold-metal sm:text-2xl">
      {children}
    </h2>
  );
}

export default async function Home() {
  const { cronograma, listaProfessores, loteAtivo } = await getDadosLanding();

  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-gold-300 focus:px-4 focus:py-2 focus:text-gold-ink focus:shadow"
      >
        Pular para o conteúdo
      </a>

      <SiteHeader />

      <main id="conteudo">
        <section className="bg-city-glow relative overflow-hidden px-4 py-24 text-center sm:py-32">
          <LinhasDecorativas />
          <div className="relative mx-auto max-w-3xl">
            <h1 className="flex flex-col items-center">
              <span className="text-gold-metal text-7xl font-extrabold italic leading-none drop-shadow-[0_4px_24px_rgb(230_181_74/0.35)] sm:text-9xl">
                LPZ
              </span>
              <span className="mt-4 font-display text-lg uppercase tracking-[0.6em] text-white sm:text-2xl">
                Training
              </span>
            </h1>
            <p className="mx-auto mt-10 max-w-xl text-base text-mist/90 sm:text-lg">
              É um <strong className="font-semibold text-white">congresso de zouk</strong> que
              tem como foco uma linha de{" "}
              <strong className="font-semibold text-white">treinamento e prática continuada</strong>.
            </p>
            <a
              href="#ingressos"
              className="bg-gold-metal mt-10 inline-block rounded-full px-8 py-3 font-semibold text-gold-ink shadow-[0_0_30px_rgb(230_181_74/0.35)] transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-300"
            >
              Ver ingressos
            </a>
          </div>
        </section>

        <section id="cronograma" className="bg-petrol-900 px-4 py-16">
          <div className="mx-auto max-w-3xl">
            <TituloSecao>Cronograma</TituloSecao>
            {cronograma.length === 0 ? (
              <p className="mt-4 text-mist/70">Cronograma em breve.</p>
            ) : (
              <ol className="mt-6 space-y-4">
                {cronograma.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-lg border border-white/10 border-l-gold-400 border-l-2 bg-petrol-950/60 p-4"
                  >
                    <p className="text-sm font-medium text-teal-300">
                      {item.dia} · {item.horarioInicio}
                      {item.horarioFim ? ` – ${item.horarioFim}` : ""}
                    </p>
                    <p className="mt-1 font-semibold text-white">{item.titulo}</p>
                    <p className="text-sm text-mist/70">
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
            <TituloSecao>Professores</TituloSecao>
            {listaProfessores.length === 0 ? (
              <p className="mt-4 text-mist/70">Professores em breve.</p>
            ) : (
              <ul className="mt-6 grid gap-6 sm:grid-cols-2">
                {listaProfessores.map((professor) => (
                  <li
                    key={professor.id}
                    className="rounded-lg border border-white/10 bg-petrol-900 p-4"
                  >
                    <p className="font-semibold text-white">{professor.nome}</p>
                    {professor.bio && (
                      <p className="mt-1 text-sm text-mist/70">{professor.bio}</p>
                    )}
                    {professor.instagram && (
                      <p className="mt-2 text-sm text-teal-300">{professor.instagram}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section
          id="ingressos"
          className="bg-[radial-gradient(ellipse_70%_60%_at_50%_100%,rgb(242_107_29/0.25),transparent_70%)] bg-petrol-900 px-4 py-16"
        >
          <div className="mx-auto max-w-md text-center">
            <TituloSecao>Ingressos</TituloSecao>
            {loteAtivo ? (
              <div className="mt-6 rounded-lg border border-gold-500/40 bg-petrol-950/70 p-6">
                <p className="text-sm font-medium text-teal-300">{loteAtivo.nome}</p>
                <p className="text-gold-metal mt-1 text-4xl font-extrabold">
                  {formatarPreco(loteAtivo.precoCentavos)}
                </p>
                <p className="mt-4 text-sm text-mist/60">
                  Checkout de pagamento ainda não disponível nesta versão do site.
                </p>
              </div>
            ) : (
              <p className="mt-4 text-mist/70">Vendas ainda não abertas. Volte em breve.</p>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 px-4 py-8 text-center text-sm text-mist/60">
        <span className="font-display tracking-[0.25em]">LPZ TRAINING</span>
        <p className="mt-3">
          <Link href="/privacidade" className="hover:text-gold-300 hover:underline">Política de Privacidade</Link>
        </p>
      </footer>
    </>
  );
}
