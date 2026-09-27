import Link from "next/link";
import { SiteHeader } from "./site-header";

// Placeholder das áreas restritas. Quando forem implementadas, cada rota
// precisa exigir autenticação antes de mostrar qualquer dado.
export function AreaEmBreve({ titulo, descricao }: { titulo: string; descricao: string }) {
  return (
    <>
      <SiteHeader />
      <main className="bg-city-glow flex min-h-[70vh] items-center px-4 py-24 text-center">
        <div className="mx-auto max-w-xl">
          <h1 className="font-display text-2xl uppercase tracking-[0.2em] text-gold-metal sm:text-3xl">
            {titulo}
          </h1>
          <p className="mt-6 text-mist/90">{descricao}</p>
          <p className="mt-8 font-script text-4xl text-white">em breve</p>
          <Link
            href="/"
            className="mt-10 inline-block rounded-full border border-gold-500/60 px-6 py-2.5 text-sm font-semibold text-gold-300 hover:bg-gold-500/10"
          >
            Voltar para o início
          </Link>
        </div>
      </main>
    </>
  );
}
