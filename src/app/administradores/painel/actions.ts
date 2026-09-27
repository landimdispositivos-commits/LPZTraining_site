"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { convidar } from "@/modules/auth/convite";
import { exigirAdmin } from "@/modules/auth/sessao";

// envio: marca única por resposta, usada pelo formulário para se limpar.
export type EstadoConvite = { ok: boolean; mensagem: string; envio: number } | null;

// Server actions são endpoints públicos (POST direto): a autorização é
// refeita aqui, independente de quem renderizou o formulário.
export async function convidarProfissionalAction(_anterior: EstadoConvite, form: FormData): Promise<EstadoConvite> {
  await exigirAdmin(["organizador"]);

  const professorId = String(form.get("professorId") ?? "");
  try {
    const resultado = await convidar({
      nome: String(form.get("nome") ?? ""),
      email: String(form.get("email") ?? ""),
      papel: "profissional",
      professorId: professorId || undefined,
    });
    revalidatePath("/administradores/painel");

    if (resultado.emailFalhou) {
      return {
        envio: Date.now(),
        ok: false,
        mensagem:
          "Conta criada, mas o e-mail de convite não pôde ser enviado (o envio de e-mails do site ainda não está configurado). Convide de novo com o mesmo e-mail quando estiver.",
      };
    }
    return {
      envio: Date.now(),
      ok: true,
      mensagem: resultado.reenvio ? "Convite reenviado." : "Convite enviado! A pessoa tem 72 horas para definir a senha.",
    };
  } catch (erro) {
    const mensagem =
      erro instanceof z.ZodError
        ? erro.issues.map((i) => i.message).join(" ")
        : erro instanceof Error
          ? erro.message
          : "Não foi possível enviar o convite.";
    return { ok: false, mensagem, envio: Date.now() };
  }
}
