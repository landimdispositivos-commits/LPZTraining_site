"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/modules/auth/auth-client";
import {
  dadosCongressistaSchema,
  PAIS_BRASIL,
  SENHA_MAX,
  SENHA_MIN,
  somenteDigitos,
  UFS,
} from "@/modules/auth/cadastro";
import { Aviso, Campo, classeBotao, classeInput, traduzirErro } from "./ui";

type Aba = "entrar" | "criar" | "esqueci";

const AREA = "/congressistas/minha-area";

function mascararCpf(valor: string) {
  const d = somenteDigitos(valor).slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

export function AcessoCongressista({ avisoInicial }: { avisoInicial?: string }) {
  const [aba, setAba] = useState<Aba>("entrar");

  const abas: { id: Aba; label: string }[] = [
    { id: "entrar", label: "Entrar" },
    { id: "criar", label: "Criar conta" },
  ];

  return (
    <div className="mx-auto w-full max-w-md">
      <div role="tablist" aria-label="Acesso do congressista" className="grid grid-cols-2 rounded-full border border-white/15 p-1">
        {abas.map((a) => (
          <button
            key={a.id}
            role="tab"
            type="button"
            id={`aba-${a.id}`}
            aria-selected={aba === a.id}
            aria-controls={`painel-${a.id}`}
            onClick={() => setAba(a.id)}
            className={
              aba === a.id
                ? "bg-gold-metal rounded-full py-2 text-sm font-semibold text-gold-ink"
                : "rounded-full py-2 text-sm font-medium text-mist/80 hover:text-gold-300"
            }
          >
            {a.label}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-petrol-900/80 p-6 shadow-xl backdrop-blur">
        {avisoInicial && <div className="mb-4"><Aviso tipo="erro">{avisoInicial}</Aviso></div>}
        {aba === "entrar" && <FormEntrar onEsqueci={() => setAba("esqueci")} />}
        {aba === "criar" && <FormCriarConta />}
        {aba === "esqueci" && <FormEsqueci onVoltar={() => setAba("entrar")} />}
      </div>
    </div>
  );
}

function FormEntrar({ onEsqueci }: { onEsqueci: () => void }) {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string>();

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setEnviando(true);
    setErro(undefined);
    const { error } = await authClient.signIn.email({
      email: String(form.get("email")),
      password: String(form.get("senha")),
      callbackURL: AREA,
    });
    if (error) {
      setErro(traduzirErro(error));
      setEnviando(false);
      return;
    }
    router.push(AREA);
    router.refresh();
  }

  return (
    <form id="painel-entrar" role="tabpanel" aria-labelledby="aba-entrar" onSubmit={enviar} className="space-y-4">
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

type ErrosCadastro = Partial<Record<"nome" | "email" | "celular" | "cpf" | "pais" | "uf" | "senha" | "confirmacao" | "aceite", string>>;

function FormCriarConta() {
  const [enviando, setEnviando] = useState(false);
  const [erroGeral, setErroGeral] = useState<string>();
  const [erros, setErros] = useState<ErrosCadastro>({});
  const [emailEnviado, setEmailEnviado] = useState<string>();
  const [origem, setOrigem] = useState<"brasil" | "outro">("brasil");
  const [cpf, setCpf] = useState("");

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const nome = String(form.get("nome") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const senha = String(form.get("senha") ?? "");
    const confirmacao = String(form.get("confirmacao") ?? "");
    const aceite = form.get("aceite") === "on";
    const pais = origem === "brasil" ? PAIS_BRASIL : String(form.get("pais") ?? "").trim();

    const novosErros: ErrosCadastro = {};
    if (nome.length < 2) novosErros.nome = "Informe seu nome completo.";
    if (!email) novosErros.email = "Informe seu e-mail.";
    if (senha.length < SENHA_MIN) novosErros.senha = `A senha precisa ter pelo menos ${SENHA_MIN} caracteres.`;
    if (senha !== confirmacao) novosErros.confirmacao = "As senhas não conferem.";
    if (!aceite) novosErros.aceite = "É preciso aceitar a Política de Privacidade.";

    const dados = dadosCongressistaSchema.safeParse({
      celular: String(form.get("celular") ?? ""),
      pais,
      uf: origem === "brasil" ? String(form.get("uf") ?? "") : null,
      cpf: origem === "brasil" ? cpf : null,
    });
    if (!dados.success) {
      for (const issue of dados.error.issues) {
        const campo = issue.path[0] as keyof ErrosCadastro;
        novosErros[campo] ??= issue.message;
      }
    }

    setErros(novosErros);
    setErroGeral(undefined);
    if (Object.keys(novosErros).length > 0 || !dados.success) return;

    setEnviando(true);
    const { error } = await authClient.signUp.email({
      name: nome,
      email,
      password: senha,
      ...dados.data,
      cpf: dados.data.cpf ?? undefined,
      uf: dados.data.uf ?? undefined,
      // Campo lido só pelo hook do servidor (registro do consentimento).
      aceitePrivacidade: true,
      callbackURL: `${AREA}?bemvindo=1`,
    } as Parameters<typeof authClient.signUp.email>[0]);
    setEnviando(false);

    if (error) {
      setErroGeral(traduzirErro(error));
      return;
    }
    setEmailEnviado(email);
  }

  if (emailEnviado) {
    return (
      <div id="painel-criar" role="tabpanel" aria-labelledby="aba-criar" className="space-y-4 text-center">
        <p className="font-display text-sm uppercase tracking-[0.2em] text-gold-metal">Quase lá!</p>
        <p className="text-mist">
          Enviamos um link de confirmação para <strong className="text-white">{emailEnviado}</strong>.
          Abra o e-mail e clique em <strong className="text-white">Confirmar e-mail</strong> para ativar sua conta.
        </p>
        <p className="text-sm text-mist/60">Não chegou? Confira o spam. O link vale por 24 horas.</p>
      </div>
    );
  }

  const aria = (campo: keyof ErrosCadastro, id: string) => ({
    "aria-invalid": erros[campo] ? true : undefined,
    "aria-describedby": erros[campo] ? `${id}-erro` : undefined,
  });

  return (
    <form id="painel-criar" role="tabpanel" aria-labelledby="aba-criar" onSubmit={enviar} noValidate className="space-y-4">
      {erroGeral && <Aviso tipo="erro">{erroGeral}</Aviso>}

      <Campo id="cad-nome" label="Nome completo" erro={erros.nome}>
        <input id="cad-nome" name="nome" autoComplete="name" maxLength={100} className={classeInput} {...aria("nome", "cad-nome")} />
      </Campo>

      <Campo id="cad-email" label="E-mail" erro={erros.email}>
        <input id="cad-email" name="email" type="email" autoComplete="email" className={classeInput} {...aria("email", "cad-email")} />
      </Campo>

      <fieldset>
        <legend className="mb-1.5 block text-sm font-medium text-mist">Onde você mora?</legend>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {(["brasil", "outro"] as const).map((opcao) => (
            <label
              key={opcao}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/15 px-3 py-2.5 has-[:checked]:border-gold-400 has-[:checked]:bg-gold-400/10"
            >
              <input
                type="radio"
                name="origem"
                value={opcao}
                checked={origem === opcao}
                onChange={() => setOrigem(opcao)}
                className="accent-gold-400"
              />
              {opcao === "brasil" ? "No Brasil" : "Em outro país"}
            </label>
          ))}
        </div>
      </fieldset>

      {origem === "brasil" ? (
        <>
          <Campo id="cad-uf" label="Estado" erro={erros.uf}>
            <select id="cad-uf" name="uf" defaultValue="" className={classeInput} {...aria("uf", "cad-uf")}>
              <option value="" disabled>Selecione</option>
              {UFS.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
            </select>
          </Campo>
          <Campo
            id="cad-cpf"
            label="CPF"
            erro={erros.cpf}
            dica="Necessário para o pagamento do ingresso via Mercado Pago."
          >
            <input
              id="cad-cpf"
              name="cpf"
              inputMode="numeric"
              autoComplete="off"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => setCpf(mascararCpf(e.target.value))}
              className={classeInput}
              aria-invalid={erros.cpf ? true : undefined}
              aria-describedby={erros.cpf ? "cad-cpf-erro" : "cad-cpf-dica"}
            />
          </Campo>
        </>
      ) : (
        <Campo id="cad-pais" label="País" erro={erros.pais}>
          <input id="cad-pais" name="pais" autoComplete="country-name" maxLength={60} className={classeInput} {...aria("pais", "cad-pais")} />
        </Campo>
      )}

      <Campo
        id="cad-celular"
        label="Celular (WhatsApp)"
        erro={erros.celular}
        dica={origem === "brasil" ? "Com DDD, ex: (11) 91234-5678." : "Com código do país, ex: +351 912 345 678."}
      >
        <input
          id="cad-celular"
          name="celular"
          type="tel"
          autoComplete="tel"
          className={classeInput}
          aria-invalid={erros.celular ? true : undefined}
          aria-describedby={erros.celular ? "cad-celular-erro" : "cad-celular-dica"}
        />
      </Campo>

      <Campo id="cad-senha" label="Senha" erro={erros.senha} dica={`Mínimo de ${SENHA_MIN} caracteres.`}>
        <input
          id="cad-senha"
          name="senha"
          type="password"
          autoComplete="new-password"
          maxLength={SENHA_MAX}
          className={classeInput}
          aria-invalid={erros.senha ? true : undefined}
          aria-describedby={erros.senha ? "cad-senha-erro" : "cad-senha-dica"}
        />
      </Campo>

      <Campo id="cad-confirmacao" label="Confirme a senha" erro={erros.confirmacao}>
        <input id="cad-confirmacao" name="confirmacao" type="password" autoComplete="new-password" maxLength={SENHA_MAX} className={classeInput} {...aria("confirmacao", "cad-confirmacao")} />
      </Campo>

      <div>
        <label className="flex items-start gap-3 text-sm text-mist">
          {/* LGPD: nunca pré-marcado. */}
          <input
            type="checkbox"
            name="aceite"
            className="mt-0.5 h-4 w-4 accent-gold-400"
            aria-invalid={erros.aceite ? true : undefined}
            aria-describedby={erros.aceite ? "cad-aceite-erro" : undefined}
          />
          <span>
            Li e aceito a{" "}
            <Link href="/privacidade" target="_blank" className="text-teal-300 underline">
              Política de Privacidade
            </Link>
            .
          </span>
        </label>
        {erros.aceite && <p id="cad-aceite-erro" className="mt-1 text-sm text-ember-400">{erros.aceite}</p>}
      </div>

      <button type="submit" disabled={enviando} className={classeBotao}>
        {enviando ? "Criando conta..." : "Criar conta"}
      </button>
    </form>
  );
}

function FormEsqueci({ onVoltar }: { onVoltar: () => void }) {
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
      redirectTo: "/congressistas/redefinir-senha",
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
