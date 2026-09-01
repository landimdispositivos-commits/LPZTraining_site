CREATE TYPE "public"."papel_admin" AS ENUM('organizador', 'professor', 'portaria');--> statement-breakpoint
CREATE TYPE "public"."status_ingresso" AS ENUM('valido', 'usado', 'cancelado');--> statement-breakpoint
CREATE TYPE "public"."status_pedido" AS ENUM('pendente', 'pago', 'cancelado', 'reembolsado');--> statement-breakpoint
CREATE TYPE "public"."tipo_midia" AS ENUM('foto', 'video');--> statement-breakpoint
CREATE TABLE "admin_usuarios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"email" text NOT NULL,
	"papel" "papel_admin" NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cronograma_itens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dia" text NOT NULL,
	"horario_inicio" text NOT NULL,
	"horario_fim" text,
	"titulo" text NOT NULL,
	"descricao" text,
	"local" text,
	"professor_id" uuid,
	"ordem" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "eventos_pagamento" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pedido_id" uuid NOT NULL,
	"provedor_evento_id" text NOT NULL,
	"tipo" text NOT NULL,
	"status_recebido" text,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ingressos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pedido_id" uuid NOT NULL,
	"status" "status_ingresso" DEFAULT 'valido' NOT NULL,
	"checkin_em" timestamp with time zone,
	"checkin_por" uuid,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lotes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"preco_centavos" integer NOT NULL,
	"quantidade_total" integer NOT NULL,
	"quantidade_vendida" integer DEFAULT 0 NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"data_inicio" timestamp with time zone,
	"data_fim" timestamp with time zone,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "midia" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tipo" "tipo_midia" NOT NULL,
	"referencia" text NOT NULL,
	"titulo" text,
	"ordem" integer DEFAULT 0 NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pedidos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"email" text NOT NULL,
	"telefone" text,
	"cpf" text,
	"lote_id" uuid NOT NULL,
	"valor_centavos" integer NOT NULL,
	"status" "status_pedido" DEFAULT 'pendente' NOT NULL,
	"gateway_preference_id" text,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "professores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"bio" text,
	"foto_url" text,
	"instagram" text,
	"ordem" integer DEFAULT 0 NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cronograma_itens" ADD CONSTRAINT "cronograma_itens_professor_id_professores_id_fk" FOREIGN KEY ("professor_id") REFERENCES "public"."professores"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eventos_pagamento" ADD CONSTRAINT "eventos_pagamento_pedido_id_pedidos_id_fk" FOREIGN KEY ("pedido_id") REFERENCES "public"."pedidos"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingressos" ADD CONSTRAINT "ingressos_pedido_id_pedidos_id_fk" FOREIGN KEY ("pedido_id") REFERENCES "public"."pedidos"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingressos" ADD CONSTRAINT "ingressos_checkin_por_admin_usuarios_id_fk" FOREIGN KEY ("checkin_por") REFERENCES "public"."admin_usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_lote_id_lotes_id_fk" FOREIGN KEY ("lote_id") REFERENCES "public"."lotes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "admin_usuarios_email_unico" ON "admin_usuarios" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "eventos_pagamento_provedor_evento_id_unico" ON "eventos_pagamento" USING btree ("provedor_evento_id");