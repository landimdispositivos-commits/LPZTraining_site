"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/modules/auth/auth-client";
import { Aviso, Campo, classeBotao, classeInput, traduzirErro } from "./form-ui";

// Login por e-mail/senha, compartilhado pelas áreas de congressistas e
// profissionais. `papelExigido` é só experiência de uso (sai na hora e avisa);
// quem garante o acesso é a checagem de papel no servidor, em cada página.
export function FormEntrar({
  destino,
  onEsqueci,
  papelExigido,
  msgPapelRecusado,
  painelProps,
}: {
  destino: string;
  onEsqueci: () => void;
  papelExigido?: "congressista" | "profissional";
  msgPapelRecusado?: string;
  painelProps?: React.ComponentProps<"form">;
}) {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string>();

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setEnviando(true);
    setErro(undefined);
    const { data, error } = await authClient.signIn.email({
      email: String(form.get("email")),
      password: String(form.get("senha")),
      callbackURL: destino,
    });
    if (error) {
      setErro(traduzirErro(error));
      setEnviando(false);
      return;
    }
    // Conta com duas etapas (administrador): o login é pela área própria.
    if (data && "twoFactorRedirect" in data) {
      setErro("Esta conta usa verificação em duas etapas. Entre pela área de Administradores.");
      setEnviando(false);
      return;
    }
    if (papelExigido && data?.user.papel !== papelExigido) {
      await authClient.signOut();
      setErro(msgPapelRecusado ?? "Acesso restrito.");
      setEnviando(false);
      return;
    }
    router.push(destino);
    router.refresh();
  }

  return (
    <form {...painelProps} onSubmit={enviar} className="space-y-4">
      {erro && <Aviso tipo="erro">{erro}</Aviso>}
      <Campo id="login-email" label="E-mail">
        <input id="login-email" name="email" type="email" autoComplete="email" required className={classeInput} />
      </Campo>
      <Campo id="login-senha" label="Senha">
        <input id="login-senha" name="senha" type="password" autoComplete="current-password" required className={classeInput} />
      </Campo>
      <button type="submit" disabled={enviando} className={classeBotao}>
        {enviando ? "Entrando..." : "Entrar"}
      </button>
      <button type="button" onClick={onEsqueci} className="block w-full text-center text-sm text-teal-300 hover:underline">
        Esqueci minha senha
      </button>
    </form>
  );
}

export function FormEsqueci({ redirectTo, onVoltar }: { redirectTo: string; onVoltar: () => void }) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string>();
  const [enviado, setEnviado] = useState(false);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setEnviando(true);
    setErro(undefined);
    const { error } = await authClient.requestPasswordReset({
      email: String(form.get("email")),
      redirectTo,
    });
    setEnviando(false);
    if (error) {
      setErro(traduzirErro(error));
      return;
    }
    setEnviado(true);
  }

  return (
    <div className="space-y-4">
      {enviado ? (
        // Mesma resposta exista ou não a conta — não revela quem é cadastrado.
        <Aviso tipo="ok">
          Se houver uma conta com esse e-mail, você vai receber um link para redefinir a senha. O link vale por 1 hora.
        </Aviso>
      ) : (
        <form onSubmit={enviar} className="space-y-4">
          <p className="text-sm text-mist/80">Informe o e-mail da sua conta e enviaremos um link para criar uma nova senha.</p>
          {erro && <Aviso tipo="erro">{erro}</Aviso>}
          <Campo id="esqueci-email" label="E-mail">
            <input id="esqueci-email" name="email" type="email" autoComplete="email" required className={classeInput} />
          </Campo>
          <button type="submit" disabled={enviando} className={classeBotao}>
            {enviando ? "Enviando..." : "Enviar link"}
          </button>
        </form>
      )}
      <button type="button" onClick={onVoltar} className="block w-full text-center text-sm text-teal-300 hover:underline">
        Voltar para entrar
      </button>
    </div>
  );
}
