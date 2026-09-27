// Convida um profissional (professor/DJ) ou administrador.
//
// Uso:
//   npm run profissional:convidar -- --nome "Ana Silva" --email ana@exemplo.com [--professor-id <uuid>]
//   npm run profissional:convidar -- --listar-professores
//   npm run admin:convidar -- --nome "Maria" --email maria@exemplo.com --papel organizador
//   npm run admin:convidar -- --nome "João" --email joao@exemplo.com --papel portaria
//
// --sem-email: mostra o link de definir senha no terminal em vez de enviar
//   por e-mail (ex: produção ainda sem SMTP). O link equivale a uma senha
//   provisória — entregue só à própria pessoa, por canal seguro.
//
// Se o convite não for usado em 72h, rode de novo com o mesmo e-mail.

import { parseArgs } from "node:util";
import { asc } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { professores } from "@/db/schema";
import { convidar } from "@/modules/auth/convite";

async function main() {
  const { values } = parseArgs({
    options: {
      nome: { type: "string" },
      email: { type: "string" },
      papel: { type: "string" },
      "professor-id": { type: "string" },
      "listar-professores": { type: "boolean" },
      "sem-email": { type: "boolean" },
    },
  });

  if (values["listar-professores"]) {
    const lista = await db.select({ id: professores.id, nome: professores.nome }).from(professores).orderBy(asc(professores.nome));
    if (lista.length === 0) console.log("Nenhum professor cadastrado.");
    for (const p of lista) console.log(`${p.id}  ${p.nome}`);
    return;
  }

  if (!values.nome || !values.email || !values.papel) {
    console.error('Informe --nome, --email e --papel. Ex: npm run admin:convidar -- --nome "Maria" --email maria@exemplo.com --papel organizador');
    process.exitCode = 1;
    return;
  }

  const semEmail = values["sem-email"] === true;
  const resultado = await convidar(
    { nome: values.nome, email: values.email, papel: values.papel, professorId: values["professor-id"] },
    { enviarPorEmail: !semEmail },
  );

  console.log(resultado.reenvio ? "Convite renovado." : "Conta criada e convite gerado.");
  if (resultado.link) {
    console.log("\nLink para definir a senha (válido por 72h, uso único):\n");
    console.log(resultado.link);
    console.log("\nEntregue só à própria pessoa, por canal seguro.");
  } else if (resultado.emailFalhou) {
    console.log("ATENÇÃO: o e-mail não pôde ser enviado (veja o erro acima). Rode de novo depois de configurar o SMTP, ou use --sem-email.");
    process.exitCode = 1;
  } else {
    console.log("Convite enviado por e-mail.");
  }
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
