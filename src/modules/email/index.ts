import nodemailer from "nodemailer";

// SMTP genérico: em dev aponta para o Mailpit (captura tudo em
// http://localhost:8025, nada sai para a internet); em produção, para o
// provedor de e-mail transacional escolhido.
const transporte = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 1025),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: process.env.SMTP_USER
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    : undefined,
});

export async function enviarEmail(msg: { para: string; assunto: string; texto: string; html: string }) {
  await transporte.sendMail({
    from: process.env.EMAIL_FROM,
    to: msg.para,
    subject: msg.assunto,
    text: msg.texto,
    html: msg.html,
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
