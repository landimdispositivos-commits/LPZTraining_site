"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/modules/auth/auth-client";
import { ehAdmin } from "@/modules/auth/papeis";
import { FormEsqueci } from "../../_components/form-entrar";
import { Aviso, Campo, classeBotao, classeInput, traduzirErro } from "../../_components/form-ui";

type Etapa = "senha" | "codigo" | "recuperacao" | "esqueci";

const MSG_RESTRITO = "Esta área é exclusiva para a organização do evento.";

// Login de administrador em duas fases: senha → código do app autenticador.
// As checagens aqui são só experiência de uso; quem protege o painel é
// exigirAdmin() no servidor.
export function AcessoAdmin({ avisoInicial }: { avisoInicial?: string }) {
  const router = useRouter();
  const [etapa, setEtapa] = useState<Etapa>("senha");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | undefined>(avisoInicial);

  function irPara(nova: Etapa) {
    setErro(undefined);
    setEtapa(nova);
  }

  async function recusar() {
    await authClient.signOut();
    setErro(MSG_RESTRITO);
    setEtapa("senha");
  }

  async function enviarSenha(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setEnviando(true);
    setErro(undefined);
    const { data, error } = await authClient.signIn.email({
      email: String(form.get("email")),
      password: String(form.get("senha")),
    });
    setEnviando(false);
    if (error) return setErro(traduzirErro(error));

    // Duas etapas já ativa: a sessão só nasce depois do código.
    if (data && "twoFactorRedirect" in data && data.twoFactorRedirect) return irPara("codigo");

    // Sem duas etapas ainda: só administrador segue, e direto para ativar.
    if (!data || !("user" in data) || !ehAdmin(data.user.papel)) return recusar();
    router.push("/administradores/ativar-duas-etapas");
    router.refresh();
  }

  async function enviarCodigo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const codigo = String(new FormData(e.currentTarget).get("codigo") ?? "").trim();
    setEnviando(true);
    setErro(undefined);
    const { data, error } =
      etapa === "codigo"
        ? await authClient.twoFactor.verifyTotp({ code: codigo.replace(/\s/g, "") })
        : await authClient.twoFactor.verifyBackupCode({ code: codigo });
    setEnviando(false);
    if (error) {
      return setErro(
        error.code === "INVALID_CODE" || error.code === "INVALID_BACKUP_CODE"
          ? "Código inválido."
          : error.status === 401
            ? "Tempo esgotado. Entre com e-mail e senha de novo."
            : traduzirErro(error),
      );
    }
    if (!ehAdmin(data?.user.papel)) return recusar();
    router.push("/administradores/painel");
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-petrol-900/80 p-6 shadow-xl backdrop-blur">
      {etapa === "esqueci" ? (
        <FormEsqueci redirectTo="/administradores/redefinir-senha" onVoltar={() => irPara("senha")} />
      ) : etapa === "senha" ? (
        <form onSubmit={enviarSenha} className="space-y-4">
          {erro && <Aviso tipo="erro">{erro}</Aviso>}
          <Campo id="admin-email" label="E-mail">
            <input id="admin-email" name="email" type="email" autoComplete="email" required className={classeInput} />
          </Campo>
          <Campo id="admin-senha" label="Senha">
            <input id="admin-senha" name="senha" type="password" autoComplete="current-password" required className={classeInput} />
          </Campo>
          <button type="submit" disabled={enviando} className={classeBotao}>
            {enviando ? "Entrando..." : "Continuar"}
          </button>
          <button type="button" onClick={() => irPara("esqueci")} className="block w-full text-center text-sm text-teal-300 hover:underline">
            Esqueci minha senha
          </button>
        </form>
      ) : (
        <form key={etapa} onSubmit={enviarCodigo} className="space-y-4">
          {erro && <Aviso tipo="erro">{erro}</Aviso>}
          <p className="text-sm text-mist/90">
            {etapa === "codigo"
              ? "Abra o app autenticador no celular e digite o código de 6 dígitos do LPZ Training."
              : "Digite um dos códigos de recuperação que você guardou ao ativar as duas etapas. Cada código funciona uma vez."}
          </p>
          <Campo id="admin-codigo" label={etapa === "codigo" ? "Código de 6 dígitos" : "Código de recuperação"}>
            <input
              id="admin-codigo"
              name="codigo"
              required
              autoFocus
              autoComplete="one-time-code"
              inputMode={etapa === "codigo" ? "numeric" : "text"}
              maxLength={etapa === "codigo" ? 7 : 32}
              className={`${classeInput} text-center text-lg tracking-[0.3em]`}
            />
          </Campo>
          <button type="submit" disabled={enviando} className={classeBotao}>
            {enviando ? "Verificando..." : "Entrar"}
          </button>
          <button
            type="button"
            onClick={() => irPara(etapa === "codigo" ? "recuperacao" : "codigo")}
            className="block w-full text-center text-sm text-teal-300 hover:underline"
          >
            {etapa === "codigo" ? "Perdi o acesso ao app — usar código de recuperação" : "Usar o código do app"}
          </button>
        </form>
      )}
    </div>
  );
}
