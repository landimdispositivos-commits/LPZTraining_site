// Convida um professor/DJ para a área de profissionais.
//
// Uso:
//   npm run profissional:convidar -- --nome "Ana Silva" --email ana@exemplo.com
//   npm run profissional:convidar -- --nome "Ana Silva" --email ana@exemplo.com --professor-id <uuid>
//   npm run profissional:convidar -- --listar-professores
//
// --professor-id liga a conta ao cadastro público do professor (foto, bio e
// aulas do cronograma). Se o convite não for usado a tempo, rode de novo com
// o mesmo e-mail para reenviar.

import { parseArgs } from "node:util";
import { asc } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { professores } from "@/db/schema";
import { convidarProfissional } from "@/modules/auth/convite";

async function main() {
  const { values } = parseArgs({
    options: {
      nome: { type: "string" },
      email: { type: "string" },
      "professor-id": { type: "string" },
      "listar-professores": { type: "boolean" },
    },
  });

  if (values["listar-professores"]) {
    const lista = await db.select({ id: professores.id, nome: professores.nome }).from(professores).orderBy(asc(professores.nome));
    if (lista.length === 0) console.log("Nenhum professor cadastrado.");
    for (const p of lista) console.log(`${p.id}  ${p.nome}`);
    return;
  }

  if (!values.nome || !values.email) {
    console.error('Informe --nome e --email. Ex: npm run profissional:convidar -- --nome "Ana Silva" --email ana@exemplo.com');
    process.exitCode = 1;
    return;
  }

  const resultado = await convidarProfissional({
    nome: values.nome,
    email: values.email,
    professorId: values["professor-id"],
  });
  console.log(resultado.reenvio ? "Convite reenviado." : "Profissional criado e convite enviado.");
}

main()
  .catch((erro) => {
    const mensagem =
      erro instanceof z.ZodError
        ? erro.issues.map((i) => i.message).join(" ")
        : erro instanceof Error
          ? erro.message
          : String(erro);
    console.error("Falha:", mensagem);
    process.exitCode = 1;
  })
  .finally(() => process.exit());
