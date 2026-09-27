import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ehAdmin } from "@/modules/auth/papeis";
import { obterSessao } from "@/modules/auth/sessao";
import { SiteHeader } from "../../_components/site-header";
import { AtivarDuasEtapas } from "./ativar-duas-etapas";

export const metadata: Metadata = { title: "Ativar duas etapas — LPZ Training" };

export default async function Page() {
  const sessao = await obterSessao();
  if (!sessao) redirect("/administradores");
  if (!ehAdmin(sessao.user.papel)) redirect("/administradores?erro=restrito");
  if (sessao.user.twoFactorEnabled) redirect("/administradores/painel");

  return (
    <>
      <SiteHeader />
      <main className="bg-city-glow min-h-[80vh] px-4 py-16">
        <div className="mx-auto max-w-lg">
          <h1 className="text-center font-display text-xl uppercase tracking-[0.2em] text-gold-metal sm:text-2xl">
            Ativar duas etapas
          </h1>
          <p className="mt-4 text-center text-mist/90">
            Para proteger os dados dos participantes, todo administrador precisa confirmar o login com um
            código do celular. Leva 2 minutos e é feito uma única vez.
          </p>
          <div className="mt-8 rounded-2xl border border-white/10 bg-petrol-900/80 p-6">
            <AtivarDuasEtapas />
          </div>
        </div>
      </main>
    </>
  );
}
