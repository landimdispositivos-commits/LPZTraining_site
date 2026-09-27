import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/modules/auth/auth";
import { SiteHeader } from "../_components/site-header";
import { AcessoCongressista } from "./_components/acesso-congressista";

export const metadata: Metadata = { title: "Congressistas — LPZ Training" };

const AVISOS: Record<string, string> = {
  link: "O link de confirmação é inválido ou expirou. Entre com seu e-mail e senha para receber um novo.",
};

export default async function Page(props: PageProps<"/congressistas">) {
  const sessao = await auth.api.getSession({ headers: await headers() });
  if (sessao) {
    redirect(sessao.user.papel === "profissional" ? "/profissionais/minha-area" : "/congressistas/minha-area");
  }

  const { erro } = await props.searchParams;
  const avisoInicial = typeof erro === "string" ? AVISOS[erro] : undefined;

  return (
    <>
      <SiteHeader />
      <main className="bg-city-glow min-h-[80vh] px-4 py-16">
        <div className="mx-auto max-w-md text-center">
          <h1 className="font-display text-2xl uppercase tracking-[0.2em] text-gold-metal sm:text-3xl">
            Congressistas
          </h1>
          <p className="mt-4 text-mist/90">
            Entre na sua conta ou faça um cadastro rápido para comprar ingressos e acompanhar o evento.
          </p>
        </div>
        <div className="mt-10">
          <AcessoCongressista avisoInicial={avisoInicial} />
        </div>
      </main>
    </>
  );
}
