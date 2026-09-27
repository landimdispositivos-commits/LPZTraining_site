import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ehAdmin } from "@/modules/auth/papeis";
import { obterSessao } from "@/modules/auth/sessao";
import { SiteHeader } from "../_components/site-header";
import { AcessoAdmin } from "./_components/acesso-admin";

export const metadata: Metadata = { title: "Administradores — LPZ Training" };

const AVISOS: Record<string, string> = {
  restrito: "Esta área é exclusiva para a organização do evento.",
};

export default async function Page(props: PageProps<"/administradores">) {
  const sessao = await obterSessao();
  if (sessao && ehAdmin(sessao.user.papel)) {
    redirect(sessao.user.twoFactorEnabled ? "/administradores/painel" : "/administradores/ativar-duas-etapas");
  }

  const { erro } = await props.searchParams;
  const avisoInicial = typeof erro === "string" ? AVISOS[erro] : undefined;

  return (
    <>
      <SiteHeader />
      <main className="bg-city-glow min-h-[80vh] px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-display text-xl uppercase tracking-[0.12em] text-gold-metal sm:text-3xl sm:tracking-[0.2em]">
            Administradores
          </h1>
          <p className="mt-4 text-mist/90">Área da organização do LPZ Training. Acesso com verificação em duas etapas.</p>
        </div>
        <div className="mt-10">
          <AcessoAdmin avisoInicial={avisoInicial} />
        </div>
      </main>
    </>
  );
}
