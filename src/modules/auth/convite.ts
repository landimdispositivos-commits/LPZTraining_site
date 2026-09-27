import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { contas, professores, usuarios } from "@/db/schema";
import { emailComLink, enviarEmail } from "@/modules/email";
import { auth } from "./auth";

// Convite de profissional (professor/DJ): a organização informa nome e
// e-mail; a pessoa recebe um link para definir a própria senha. Reaproveita o
// fluxo de redefinição de senha do Better Auth (que cria a senha no primeiro
// uso do link), com prazo maior e texto de convite.

const VALIDADE_CONVITE_HORAS = 72;

const entradaSchema = z.object({
  nome: z.string().trim().min(2, "Nome muito curto.").max(100),
  email: z.email("E-mail inválido.").transform((e) => e.trim().toLowerCase()),
  professorId: z.uuid("ID de professor inválido.").optional(),
});

export type ResultadoConvite = { usuarioId: string; reenvio: boolean };

export async function convidarProfissional(entrada: {
  nome: string;
  email: string;
  professorId?: string;
}): Promise<ResultadoConvite> {
  const { nome, email, professorId } = entradaSchema.parse(entrada);

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
    if (existente.papel !== "profissional") {
      throw new Error("Já existe uma conta de congressista com esse e-mail. Nada foi alterado.");
    }
    const [credencial] = await db
      .select({ id: contas.id })
      .from(contas)
      .where(eq(contas.userId, existente.id));
    if (credencial) {
      throw new Error("Esse profissional já definiu a senha. Se esqueceu, ele pode usar \"Esqueci minha senha\".");
    }
    usuarioId = existente.id;
    reenvio = true;
  } else {
    const ctx = await auth.$context;
    // O próprio convite comprova o e-mail: quem definir a senha recebeu o link.
    const usuario = await ctx.internalAdapter.createUser({
      name: nome,
      email,
      emailVerified: true,
      papel: "profissional",
      professorId: professorId ?? null,
    }, { method: "admin" });
    usuarioId = usuario.id;
  }

  const ctx = await auth.$context;
  const token = randomBytes(18).toString("base64url");
  await ctx.internalAdapter.createVerificationValue({
    value: usuarioId,
    identifier: `reset-password:${token}`,
    expiresAt: new Date(Date.now() + VALIDADE_CONVITE_HORAS * 60 * 60 * 1000),
  });

  const url = `${ctx.baseURL}/reset-password/${token}?callbackURL=${encodeURIComponent("/profissionais/definir-senha")}`;
  const { texto, html } = emailComLink({
    nome,
    intro: `Você foi convidado(a) para a área de profissionais do LPZ Training. Clique abaixo para definir sua senha. O link vale por ${VALIDADE_CONVITE_HORAS} horas.`,
    textoBotao: "Definir minha senha",
    url,
  });
  await enviarEmail({ para: email, assunto: "Convite — área de profissionais LPZ Training", texto, html });

  return { usuarioId, reenvio };
}
