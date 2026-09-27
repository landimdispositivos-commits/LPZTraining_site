import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "../_components/site-header";

export const metadata: Metadata = {
  title: "Quem somos — LPZ Training",
  description: "Conheça a organização do LPZ Training, congresso de zouk focado em treinamento e prática continuada.",
};

// Estrutura pronta para os dados da organização. Trechos entre [colchetes]
// são conteúdo a preencher.
const SECOES = [
  {
    titulo: "Nossa história",
    texto: "[Como e quando o LPZ começou, quem idealizou e o que motivou a criação do evento.]",
  },
  {
    titulo: "Nossa proposta",
    texto:
      "O LPZ Training é um congresso de zouk que tem como foco uma linha de treinamento e prática continuada. [Detalhar a metodologia, o público e o que diferencia o evento.]",
  },
  {
    titulo: "Organização",
    texto: "[Nomes e papéis das pessoas da organização. Fotos só com autorização de cada pessoa.]",
  },
  {
    titulo: "Contato",
    texto: "[E-mail, Instagram e WhatsApp oficiais do evento.]",
  },
];

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-city-glow px-4 py-20 text-center">
          <h1 className="font-display text-2xl uppercase tracking-[0.2em] text-gold-metal sm:text-3xl">
            Quem somos
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-mist/90">
            Conheça quem faz o LPZ Training acontecer.
          </p>
        </section>

        <div className="mx-auto max-w-3xl space-y-6 px-4 py-16">
          {SECOES.map((secao) => (
            <section key={secao.titulo} className="rounded-2xl border border-white/10 bg-petrol-900/80 p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-teal-300">{secao.titulo}</h2>
              <p className="mt-3 text-mist/90">{secao.texto}</p>
            </section>
          ))}

          <div className="pt-4 text-center">
            <Link
              href="/"
              className="inline-block rounded-full border border-gold-500/60 px-6 py-2.5 text-sm font-semibold text-gold-300 hover:bg-gold-500/10"
            >
              Voltar para o início
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
