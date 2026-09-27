import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { contas, professores, usuarios } from "@/db/schema";
import { emailComLink, enviarEmail } from "@/modules/email";
import { auth } from "./auth";

// Convite de conta interna (profissional ou administrador): a organização
// informa nome, e-mail e papel; a pessoa recebe um link para definir a própria
// senha. Reaproveita o fluxo de redefinição de senha do Better Auth (que cria
// a senha no primeiro uso do link), com prazo maior e texto de convite.

const VALIDADE_CONVITE_HORAS = 72;

export const PAPEIS_CONVIDAVEIS = ["profissional", "organizador", "portaria"] as const;
export type PapelConvidavel = (typeof PAPEIS_CONVIDAVEIS)[number];

const DESTINO: Record<PapelConvidavel, { rota: string; area: string }> = {
  profissional: { rota: "/profissionais/definir-senha", area: "área de profissionais" },
  organizador: { rota: "/administradores/definir-senha", area: "área de administradores" },
  portaria: { rota: "/administradores/definir-senha", area: "área de administradores (portaria)" },
};

const entradaSchema = z.object({
  nome: z.string().trim().min(2, "Nome muito curto.").max(100),
  email: z.email("E-mail inválido.").transform((e) => e.trim().toLowerCase()),
  papel: z.enum(PAPEIS_CONVIDAVEIS, "Papel inválido."),
  professorId: z.uuid("ID de professor inválido.").optional(),
});

export type ResultadoConvite = {
  usuarioId: string;
  reenvio: boolean;
  // Preenchido só quando enviarPorEmail = false (uso no terminal, sem SMTP).
  link?: string;
  // Conta criada/renovada, mas o e-mail falhou (ex: SMTP não configurado).
  // Basta convidar de novo com o mesmo e-mail depois de resolver.
  emailFalhou?: boolean;
};

export async function convidar(
  entrada: { nome: string; email: string; papel: string; professorId?: string },
  { enviarPorEmail = true }: { enviarPorEmail?: boolean } = {},
): Promise<ResultadoConvite> {
  const { nome, email, papel, professorId } = entradaSchema.parse(entrada);

  if (professorId && papel !== "profissional") {
    throw new Error("Vínculo com professor só vale para o papel profissional.");
  }
  if (professorId) {
    const [professor] = await db.select({ id: professores.id }).from(professores).where(eq(professores.id, professorId));
    if (!professor) throw new Error("Professor não encontrado com esse ID.");
  }

  const [existente] = await db
    .select({ id: usuarios.id, papel: usuarios.papel })
    .from(usuarios)
    .where(eq(usuarios.email, email));

  let usuarioId: string;
  let reenvio = false;

  if (existente) {
    if (existente.papel !== papel) {
      throw new Error(`Já existe uma conta com esse e-mail com outro papel (${existente.papel}). Nada foi alterado.`);
    }
    const [credencial] = await db.select({ id: contas.id }).from(contas).where(eq(contas.userId, existente.id));
    if (credencial) {
      throw new Error("Essa pessoa já definiu a senha. Se esqueceu, ela pode usar \"Esqueci minha senha\".");
    }
    usuarioId = existente.id;
    reenvio = true;
  } else {
    const ctx = await auth.$context;
    // O próprio convite comprova o e-mail: quem definir a senha recebeu o link.
    const usuario = await ctx.internalAdapter.createUser(
      { name: nome, email, emailVerified: true, papel, professorId: professorId ?? null },
      { method: "admin" },
    );
    usuarioId = usuario.id;
  }

  const ctx = await auth.$context;
  const token = randomBytes(18).toString("base64url");
  await ctx.internalAdapter.createVerificationValue({
    value: usuarioId,
    identifier: `reset-password:${token}`,
    expiresAt: new Date(Date.now() + VALIDADE_CONVITE_HORAS * 60 * 60 * 1000),
  });

  const { rota, area } = DESTINO[papel];
  const url = `${ctx.baseURL}/reset-password/${token}?callbackURL=${encodeURIComponent(rota)}`;

  if (!enviarPorEmail) return { usuarioId, reenvio, link: url };

  const { texto, html } = emailComLink({
    nome,
    intro: `Você foi convidado(a) para a ${area} do LPZ Training. Clique abaixo para definir sua senha. O link vale por ${VALIDADE_CONVITE_HORAS} horas.`,
    textoBotao: "Definir minha senha",
    url,
  });
  try {
    await enviarEmail({ para: email, assunto: "Convite — LPZ Training", texto, html });
  } catch (erro) {
    console.error("[convite] Falha ao enviar e-mail:", erro instanceof Error ? erro.message : erro);
    return { usuarioId, reenvio, emailFalhou: true };
  }

  return { usuarioId, reenvio };
}
