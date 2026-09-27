import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Dados 100% fictícios para desenvolvimento local. Nunca usar dados reais de
// participantes aqui — ver seção LGPD do CLAUDE.md do projeto.
async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL não definida — copie .env.example para .env e ajuste os valores.");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  console.log("Semeando dados fictícios...");

  const [professor1, professor2] = await db
    .insert(schema.professores)
    .values([
      {
        nome: "Ana Fictícia",
        bio: "Professora de zouk há 10 anos (dado de exemplo).",
        instagram: "@ana.exemplo",
        ordem: 1,
      },
      {
        nome: "Bruno Exemplo",
        bio: "DJ e professor convidado (dado de exemplo).",
        instagram: "@bruno.exemplo",
        ordem: 2,
      },
    ])
    .returning();

  await db.insert(schema.cronogramaItens).values([
    {
      dia: "2026-11-06",
      horarioInicio: "19:00",
      horarioFim: "20:30",
      titulo: "Aula de abertura",
      professorId: professor1.id,
      local: "Salão Principal",
      ordem: 1,
    },
    {
      dia: "2026-11-06",
      horarioInicio: "21:00",
      titulo: "Baile de abertura",
      professorId: professor2.id,
      local: "Salão Principal",
      ordem: 2,
    },
  ]);

  await db.insert(schema.lotes).values([
    {
      nome: "1º lote",
      precoCentavos: 35000,
      quantidadeTotal: 100,
      ativo: true,
    },
    {
      nome: "2º lote",
      precoCentavos: 45000,
      quantidadeTotal: 100,
      ativo: false,
    },
  ]);

  // Administradores não entram no seed: precisam de senha e duas etapas.
  // Crie com: npm run admin:convidar -- --nome "..." --email ... --papel organizador

  console.log("Seed concluído.");
  await pool.end();
}

main().catch((err) => {
  console.error("Falha ao semear dados:", err);
  process.exit(1);
});
