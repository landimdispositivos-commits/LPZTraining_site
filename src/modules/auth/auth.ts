import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { twoFactor } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { contas, duasEtapas, sessoes, usuarios, verificacoes } from "@/db/schema";
import { emailComLink, enviarEmailEmSegundoPlano } from "@/modules/email";
import { dadosCongressistaSchema, SENHA_MAX, SENHA_MIN } from "./cadastro";

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET não definida — veja .env.example.");
}

const MSG_CADASTRO_RECUSADO =
  "Não foi possível concluir o cadastro com esses dados. Se você já tem conta, entre ou recupere a senha.";

// Código próprio: o formulário mostra a mensagem (já em português) ao usuário.
export const CODIGO_VALIDACAO = "LPZ_VALIDACAO";

function erroValidacao({ message }: { message: string }) {
  return new APIError("BAD_REQUEST", { message, code: CODIGO_VALIDACAO });
}

export const auth = betterAuth({
  baseURL: process.env.APP_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  database: drizzleAdapter(db, {
    provider: "pg",
    // Modelos do Better Auth → tabelas em português.
    schema: {
      user: usuarios,
      session: sessoes,
      account: contas,
      verification: verificacoes,
      twoFactor: duasEtapas,
    },
  }),

  user: {
    additionalFields: {
      celular: { type: "string", required: true },
      cpf: { type: "string", required: false },
      pais: { type: "string", required: true },
      uf: { type: "string", required: false },
      // Campos abaixo: só o servidor define, nunca o cliente (input: false).
      privacidadeAceitaEm: { type: "date", required: false, input: false },
      papel: { type: "string", required: false, input: false, defaultValue: "congressista" },
      professorId: { type: "string", required: false, input: false },
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: SENHA_MIN,
    maxPasswordLength: SENHA_MAX,
    revokeSessionsOnPasswordReset: true,
    resetPasswordTokenExpiresIn: 60 * 60, // 1 hora
    sendResetPassword: async ({ user, url }) => {
      const { texto, html } = emailComLink({
        nome: user.name,
        intro: "Recebemos um pedido para redefinir a senha da sua conta no LPZ Training. O link vale por 1 hora.",
        textoBotao: "Redefinir senha",
        url,
      });
      enviarEmailEmSegundoPlano({ para: user.email, assunto: "Redefinir senha — LPZ Training", texto, html });
    },
    // Cadastro com e-mail já existente responde "sucesso" (não revela quem
    // tem conta); o dono do e-mail é avisado por aqui.
    onExistingUserSignUp: async ({ user }) => {
      const { texto, html } = emailComLink({
        nome: user.name,
        intro: "Alguém tentou criar uma conta no LPZ Training com este e-mail, mas você já tem cadastro. Se esqueceu a senha, recupere pelo link abaixo.",
        textoBotao: "Entrar ou recuperar senha",
        url: `${process.env.APP_URL}/congressistas`,
      });
      enviarEmailEmSegundoPlano({ para: user.email, assunto: "Você já tem conta — LPZ Training", texto, html });
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true, // login sem e-mail confirmado reenvia o link
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60 * 24, // 24 horas
    sendVerificationEmail: async ({ user, url }) => {
      const { texto, html } = emailComLink({
        nome: user.name,
        intro: "Confirme seu e-mail para ativar sua conta de congressista no LPZ Training. O link vale por 24 horas.",
        textoBotao: "Confirmar e-mail",
        url,
      });
      enviarEmailEmSegundoPlano({ para: user.email, assunto: "Confirme seu e-mail — LPZ Training", texto, html });
    },
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user, ctx) => {
          // Sem contexto de requisição = código do próprio servidor (ex: script
          // de convite de profissional), que já monta os dados certos.
          if (!ctx) return { data: user };

          // Por HTTP, a única criação de usuário permitida é o cadastro público.
          if (ctx.path !== "/sign-up/email") {
            throw erroValidacao({ message: "Operação não permitida." });
          }

          const body = (ctx.body ?? {}) as Record<string, unknown>;
          if (body.aceitePrivacidade !== true) {
            throw erroValidacao({
              message: "É preciso aceitar a Política de Privacidade para criar a conta.",
            });
          }

          const nome = String(user.name ?? "").trim();
          if (nome.length < 2 || nome.length > 100) {
            throw erroValidacao({ message: "Informe seu nome completo." });
          }

          const dados = dadosCongressistaSchema.safeParse(user);
          if (!dados.success) {
            throw erroValidacao({ message: dados.error.issues[0].message });
          }

          if (dados.data.cpf) {
            const existente = await db
              .select({ id: usuarios.id })
              .from(usuarios)
              .where(eq(usuarios.cpf, dados.data.cpf))
              .limit(1);
            if (existente.length > 0) {
              throw erroValidacao({ message: MSG_CADASTRO_RECUSADO });
            }
          }

          return {
            data: {
              ...user,
              name: nome,
              ...dados.data,
              privacidadeAceitaEm: new Date(),
              papel: "congressista",
              professorId: null,
            },
          };
        },
      },
    },
  },

  advanced: {
    // Atrás de Cloudflare + Nginx: o Nginx grava o IP real em X-Real-IP
    // (real_ip com CF-Connecting-IP). Usado no limite de tentativas.
    ipAddress: { ipAddressHeaders: ["x-real-ip"] },
  },

  rateLimit: {
    enabled: true,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 3 },
      "/request-password-reset": { window: 60, max: 3 },
      "/send-verification-email": { window: 60, max: 3 },
      "/two-factor/verify-totp": { window: 60, max: 5 },
      "/two-factor/verify-backup-code": { window: 60, max: 5 },
      "/two-factor/enable": { window: 60, max: 5 },
    },
  },

  plugins: [
    // Duas etapas por app autenticador (TOTP). Obrigatória para administradores
    // — a exigência é aplicada nas páginas/ações de /administradores.
    twoFactor({
      issuer: "LPZ Training",
      accountLockout: { enabled: true, maxFailedAttempts: 5, durationSeconds: 15 * 60 },
    }),
    nextCookies(), // precisa ser o último plugin
  ],
});

export type Sessao = typeof auth.$Infer.Session;
