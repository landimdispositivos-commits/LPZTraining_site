"use client";

import Link from "next/link";
import { useState } from "react";
import { authClient } from "@/modules/auth/auth-client";
import { SENHA_MAX, SENHA_MIN } from "@/modules/auth/cadastro";
import { Aviso, Campo, classeBotao, classeInput, traduzirErro } from "../_components/ui";

export function FormRedefinirSenha({ token }: { token?: string }) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string>();
  const [pronto, setPronto] = useState(false);

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <Aviso tipo="erro">Link inválido ou expirado. Peça um novo em &quot;Esqueci minha senha&quot;.</Aviso>
        <Link href="/congressistas" className="text-sm text-teal-300 hover:underline">Voltar para entrar</Link>
      </div>
    );
  }

  if (pronto) {
    return (
      <div className="space-y-4 text-center">
        <Aviso tipo="ok">Senha alterada. Por segurança, você foi desconectado de todos os aparelhos.</Aviso>
        <Link href="/congressistas" className={`${classeBotao} inline-block`}>Entrar</Link>
      </div>
    );
  }

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const senha = String(form.get("senha") ?? "");
    if (senha.length < SENHA_MIN) return setErro(`A senha precisa ter pelo menos ${SENHA_MIN} caracteres.`);
    if (senha !== form.get("confirmacao")) return setErro("As senhas não conferem.");

    setEnviando(true);
    setErro(undefined);
    const { error } = await authClient.resetPassword({ newPassword: senha, token });
    setEnviando(false);
    if (error) return setErro(traduzirErro(error));
    setPronto(true);
  }

  return (
    <form onSubmit={enviar} className="space-y-4">
      {erro && <Aviso tipo="erro">{erro}</Aviso>}
      <Campo id="nova-senha" label="Nova senha" dica={`Mínimo de ${SENHA_MIN} caracteres.`}>
        <input id="nova-senha" name="senha" type="password" autoComplete="new-password" maxLength={SENHA_MAX} required className={classeInput} />
      </Campo>
      <Campo id="nova-confirmacao" label="Confirme a nova senha">
        <input id="nova-confirmacao" name="confirmacao" type="password" autoComplete="new-password" maxLength={SENHA_MAX} required className={classeInput} />
      </Campo>
      <button type="submit" disabled={enviando} className={classeBotao}>
        {enviando ? "Salvando..." : "Salvar nova senha"}
      </button>
    </form>
  );
}
