import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL não definida — copie .env.example para .env e ajuste os valores.");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  console.log("Aplicando migrations...");
  await migrate(db, { migrationsFolder: "./src/db/migrations" });
  console.log("Migrations aplicadas com sucesso.");

  await pool.end();
}

main().catch((err) => {
  console.error("Falha ao aplicar migrations:", err);
  process.exit(1);
});
