CREATE TABLE "duas_etapas" (
	"id" text PRIMARY KEY NOT NULL,
	"segredo" text NOT NULL,
	"codigos_recuperacao" text NOT NULL,
	"usuario_id" text NOT NULL,
	"verificado" boolean DEFAULT true NOT NULL,
	"tentativas_falhas" integer DEFAULT 0 NOT NULL,
	"bloqueado_ate" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "usuarios" ADD COLUMN "duas_etapas_ativa" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "duas_etapas" ADD CONSTRAINT "duas_etapas_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "duas_etapas_usuario_unico" ON "duas_etapas" USING btree ("usuario_id");