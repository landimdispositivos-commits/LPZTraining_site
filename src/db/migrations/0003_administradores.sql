ALTER TYPE "public"."papel_usuario" ADD VALUE 'organizador';--> statement-breakpoint
ALTER TYPE "public"."papel_usuario" ADD VALUE 'portaria';--> statement-breakpoint
ALTER TABLE "admin_usuarios" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "admin_usuarios" CASCADE;--> statement-breakpoint
ALTER TABLE "ingressos" DROP CONSTRAINT IF EXISTS "ingressos_checkin_por_admin_usuarios_id_fk";
--> statement-breakpoint
ALTER TABLE "ingressos" ALTER COLUMN "checkin_por" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "ingressos" ADD CONSTRAINT "ingressos_checkin_por_usuarios_id_fk" FOREIGN KEY ("checkin_por") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
DROP TYPE "public"."papel_admin";