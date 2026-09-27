CREATE TYPE "public"."papel_usuario" AS ENUM('congressista', 'profissional');--> statement-breakpoint
ALTER TABLE "usuarios" ALTER COLUMN "celular" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "usuarios" ALTER COLUMN "pais" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "usuarios" ALTER COLUMN "privacidade_aceita_em" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "usuarios" ADD COLUMN "papel" "papel_usuario" DEFAULT 'congressista' NOT NULL;--> statement-breakpoint
ALTER TABLE "usuarios" ADD COLUMN "professor_id" uuid;--> statement-breakpoint
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_professor_id_professores_id_fk" FOREIGN KEY ("professor_id") REFERENCES "public"."professores"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_professor_id_unique" UNIQUE("professor_id");