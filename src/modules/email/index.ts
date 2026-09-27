import nodemailer from "nodemailer";

// SMTP genérico: em dev aponta para o Mailpit (captura tudo em
// http://localhost:8025, nada sai para a internet); em produção, para o
// provedor de e-mail transacional escolhido.
const porta = Number(process.env.SMTP_PORT || 1025);

const transporte = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: porta,
  secure: porta === 465,
  // 587 (Brevo e similares): exige STARTTLS — nunca manda credencial em texto puro.
  requireTLS: porta === 587,
  auth: process.env.SMTP_USER
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    : undefined,
});

type Mensagem = { para: string; assunto: string; texto: string; html: string };

// Lança erro se o envio falhar — use quando quem chama precisa saber (ex:
// script de convite). Em callbacks de requisição, use enviarEmailEmSegundoPlano.
export async function enviarEmail(msg: Mensagem) {
  if (!process.env.SMTP_HOST) {
    throw new Error("SMTP_HOST não configurado — e-mail não enviado.");
  }
  await transporte.sendMail({
    from: process.env.EMAIL_FROM,
    to: msg.para,
    subject: msg.assunto,
    text: msg.texto,
    html: msg.html,
  });
}

// Não bloqueia a resposta nem derruba o processo se o SMTP falhar: só
// registra. O log não inclui o destinatário (dado pessoal).
export function enviarEmailEmSegundoPlano(msg: Mensagem) {
  enviarEmail(msg).catch((erro: unknown) => {
    console.error(`[email] Falha ao enviar "${msg.assunto}":`, erro instanceof Error ? erro.message : erro);
  });
}

function escaparHtml(texto: string) {
  return texto.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

// E-mail simples com um botão de ação. `nome` vem do usuário: sempre escapado.
export function emailComLink({ nome, intro, textoBotao, url }: {
  nome: string;
  intro: string;
  textoBotao: string;
  url: string;
}) {
  const texto = `Olá, ${nome}!\n\n${intro}\n\n${url}\n\nSe não foi você, ignore este e-mail.\n\nLPZ Training`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;color:#04161b">
      <p>Olá, ${escaparHtml(nome)}!</p>
      <p>${escaparHtml(intro)}</p>
      <p style="margin:28px 0">
        <a href="${escaparHtml(url)}" style="background:#e6b54a;color:#1a1204;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:bold">${escaparHtml(textoBotao)}</a>
      </p>
      <p style="font-size:13px;color:#555">Se o botão não funcionar, copie este link no navegador:<br>${escaparHtml(url)}</p>
      <p style="font-size:13px;color:#555">Se não foi você, ignore este e-mail.</p>
      <p>LPZ Training</p>
    </div>`;
  return { texto, html };
}
