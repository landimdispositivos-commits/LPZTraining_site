"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import QRCode from "react-qr-code";
import { authClient } from "@/modules/auth/auth-client";
import { Aviso, Campo, classeBotao, classeInput, traduzirErro } from "../../_components/form-ui";

type Configuracao = { totpURI: string; backupCodes: string[] };

export function AtivarDuasEtapas() {
  const router = useRouter();
  const [config, setConfig] = useState<Configuracao>();
  const [guardou, setGuardou] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string>();

  async function confirmarSenha(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnviando(true);
    setErro(undefined);
    const { data, error } = await authClient.twoFactor.enable({
      password: String(new FormData(e.currentTarget).get("senha")),
    });
    setEnviando(false);
    if (error) return setErro(error.code === "INVALID_PASSWORD" ? "Senha incorreta." : traduzirErro(error));
    if (!data || !("totpURI" in data) || !data.totpURI) return setErro("Não foi possível iniciar a ativação.");
    setConfig({ totpURI: data.totpURI, backupCodes: data.backupCodes ?? [] });
  }

  async function confirmarCodigo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const codigo = String(new FormData(e.currentTarget).get("codigo") ?? "").replace(/\s/g, "");
    setEnviando(true);
    setErro(undefined);
    const { error } = await authClient.twoFactor.verifyTotp({ code: codigo });
    setEnviando(false);
    if (error) {
      return setErro(error.code === "INVALID_CODE" ? "Código inválido. Confira se o horário do celular está automático." : traduzirErro(error));
    }
    router.push("/administradores/painel");
    router.refresh();
  }

  if (!config) {
    return (
      <form onSubmit={confirmarSenha} className="space-y-4">
        {erro && <Aviso tipo="erro">{erro}</Aviso>}
        <p className="text-sm text-mist/90">
          Você vai precisar de um app autenticador no celular, como <strong className="text-white">Google Authenticator</strong> ou{" "}
          <strong className="text-white">Microsoft Authenticator</strong> (gratuitos). Para começar, confirme sua senha.
        </p>
        <Campo id="ativar-senha" label="Sua senha">
          <input id="ativar-senha" name="senha" type="password" autoComplete="current-password" required className={classeInput} />
        </Campo>
        <button type="submit" disabled={enviando} className={classeBotao}>
          {enviando ? "Preparando..." : "Começar"}
        </button>
      </form>
    );
  }

  const segredo = new URL(config.totpURI).searchParams.get("secret") ?? "";

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-teal-300">1. Leia o QR code</h2>
        <p className="mt-2 text-sm text-mist/90">No app autenticador, toque em &quot;+&quot; e aponte a câmera para o código.</p>
        <div className="mx-auto mt-4 w-fit rounded-xl bg-white p-4">
          <QRCode value={config.totpURI} size={180} title="QR code para o app autenticador" />
        </div>
        <details className="mt-3 text-sm text-mist/80">
          <summary className="cursor-pointer text-teal-300">Não consigo ler o QR code</summary>
          <p className="mt-2">Digite esta chave no app (tipo: baseada em tempo):</p>
          <code className="mt-1 block break-all rounded bg-petrol-950 px-3 py-2 font-mono text-white">{segredo}</code>
        </details>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-teal-300">2. Guarde os códigos de recuperação</h2>
        <p className="mt-2 text-sm text-mist/90">
          Se perder o celular, cada código abaixo permite entrar <strong className="text-white">uma vez</strong>. Guarde num
          lugar seguro (ex: gerenciador de senhas). Eles não serão mostrados de novo.
        </p>
        <ul className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-petrol-950 p-3 font-mono text-sm text-white">
          {config.backupCodes.map((c) => <li key={c}>{c}</li>)}
        </ul>
        <label className="mt-3 flex items-center gap-2 text-sm text-mist">
          <input type="checkbox" checked={guardou} onChange={(e) => setGuardou(e.target.checked)} className="h-4 w-4 accent-gold-400" />
          Guardei os códigos de recuperação.
        </label>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-teal-300">3. Confirme com o código do app</h2>
        <form onSubmit={confirmarCodigo} className="mt-3 space-y-4">
          {erro && <Aviso tipo="erro">{erro}</Aviso>}
          <Campo id="ativar-codigo" label="Código de 6 dígitos">
            <input
              id="ativar-codigo"
              name="codigo"
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={7}
              className={`${classeInput} text-center text-lg tracking-[0.3em]`}
            />
          </Campo>
          <button type="submit" disabled={enviando || !guardou} className={classeBotao}>
            {enviando ? "Verificando..." : "Ativar e entrar no painel"}
          </button>
        </form>
      </section>
    </div>
  );
}
