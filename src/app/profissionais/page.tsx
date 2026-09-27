import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/modules/auth/auth";
import { SiteHeader } from "../_components/site-header";
import { AcessoProfissional } from "./_components/acesso-profissional";

export const metadata: Metadata = { title: "Profissionais — LPZ Training" };

const AVISOS: Record<string, string> = {
  restrito: "Esta área é exclusiva para professores e DJs convidados pela organização.",
};

export default async function Page(props: PageProps<"/profissionais">) {
  const sessao = await auth.api.getSession({ headers: await headers() });
  if (sessao?.user.papel === "profissional") redirect("/profissionais/minha-area");

  const { erro } = await props.searchParams;
  const avisoInicial = typeof erro === "string" ? AVISOS[erro] : undefined;

  return (
    <>
      <SiteHeader />
      <main className="bg-city-glow min-h-[80vh] px-4 py-16">
        <div className="mx-auto max-w-md text-center">
          <h1 className="font-display text-2xl uppercase tracking-[0.2em] text-gold-metal sm:text-3xl">
            Profissionais
          </h1>
          <p className="mt-4 text-mist/90">Área de professores e DJs do LPZ Training.</p>
        </div>
        <div className="mt-10">
          <AcessoProfissional avisoInicial={avisoInicial} />
        </div>
      </main>
    </>
  );
}
