import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Admin / RBAC
// ---------------------------------------------------------------------------

export const papelAdminEnum = pgEnum("papel_admin", [
  "organizador",
  "professor",
  "portaria",
]);

export const adminUsuarios = pgTable("admin_usuarios", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull(),
  email: text("email").notNull(),
  papel: papelAdminEnum("papel").notNull(),
  criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  emailUnico: uniqueIndex("admin_usuarios_email_unico").on(t.email),
}));

// ---------------------------------------------------------------------------
// Login de congressistas (Better Auth)
//
// As chaves JS seguem os nomes de campo que o Better Auth espera (ex:
// `emailVerified`); só os nomes de tabela/coluna no banco são em português.
// O mapeamento modelo → tabela fica em src/modules/auth/auth.ts.
// ---------------------------------------------------------------------------

// Cadastro público sempre cria "congressista"; "profissional" (professor/DJ)
// só nasce por convite da organização (scripts/convidar-profissional.ts).
export const papelUsuarioEnum = pgEnum("papel_usuario", ["congressista", "profissional"]);

export const usuarios = pgTable("usuarios", {
  id: text("id").primaryKey(),
  name: text("nome").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verificado").notNull().default(false),
  image: text("imagem"),
  papel: papelUsuarioEnum("papel").notNull().default("congressista"),
  // Perfil público do profissional (foto, bio, aulas no cronograma).
  professorId: uuid("professor_id").unique().references(() => professores.id, { onDelete: "set null" }),
  // Dados do cadastro de congressista — obrigatórios para congressistas
  // (validado no hook do Better Auth), vazios para profissionais convidados.
  // CPF é exigido pelo Mercado Pago no pagamento de brasileiros; guardado só
  // com dígitos. O unique permite vários NULL.
  celular: text("celular"),
  cpf: text("cpf").unique(),
  pais: text("pais"),
  uf: text("uf"),
  // Momento em que o titular aceitou a Política de Privacidade (LGPD).
  privacidadeAceitaEm: timestamp("privacidade_aceita_em", { withTimezone: true }),
  createdAt: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("atualizado_em", { withTimezone: true }).notNull().defaultNow(),
});

export const sessoes = pgTable("sessoes", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expira_em", { withTimezone: true }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("atualizado_em", { withTimezone: true }).notNull().defaultNow(),
  ipAddress: text("ip"),
  userAgent: text("user_agent"),
  userId: text("usuario_id").notNull().references(() => usuarios.id, { onDelete: "cascade" }),
});

export const contas = pgTable("contas", {
  id: text("id").primaryKey(),
  accountId: text("conta_id").notNull(),
  providerId: text("provedor_id").notNull(),
  userId: text("usuario_id").notNull().references(() => usuarios.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expira_em", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expira_em", { withTimezone: true }),
  scope: text("scope"),
  // Hash da senha (scrypt, gerado pelo Better Auth) — nunca a senha em si.
  password: text("senha_hash"),
  createdAt: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("atualizado_em", { withTimezone: true }).notNull().defaultNow(),
});

export const verificacoes = pgTable("verificacoes", {
  id: text("id").primaryKey(),
  identifier: text("identificador").notNull(),
  value: text("valor").notNull(),
  expiresAt: timestamp("expira_em", { withTimezone: true }).notNull(),
  createdAt: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("atualizado_em", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Conteúdo público: professores e cronograma
// ---------------------------------------------------------------------------

export const professores = pgTable("professores", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull(),
  bio: text("bio"),
  fotoUrl: text("foto_url"),
  instagram: text("instagram"),
  ordem: integer("ordem").notNull().default(0),
  criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
});

export const cronogramaItens = pgTable("cronograma_itens", {
  id: uuid("id").primaryKey().defaultRandom(),
  dia: text("dia").notNull(), // ex: "2026-11-06"
  horarioInicio: text("horario_inicio").notNull(), // ex: "19:00"
  horarioFim: text("horario_fim"),
  titulo: text("titulo").notNull(),
  descricao: text("descricao"),
  local: text("local"),
  professorId: uuid("professor_id").references(() => professores.id, {
    onDelete: "set null",
  }),
  ordem: integer("ordem").notNull().default(0),
});

// ---------------------------------------------------------------------------
// Ingressos: lotes, pedidos, ingressos emitidos, eventos de pagamento
// ---------------------------------------------------------------------------

export const lotes = pgTable("lotes", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull(), // ex: "1º lote"
  precoCentavos: integer("preco_centavos").notNull(),
  quantidadeTotal: integer("quantidade_total").notNull(),
  quantidadeVendida: integer("quantidade_vendida").notNull().default(0),
  ativo: boolean("ativo").notNull().default(true),
  dataInicio: timestamp("data_inicio", { withTimezone: true }),
  dataFim: timestamp("data_fim", { withTimezone: true }),
  criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
});

export const statusPedidoEnum = pgEnum("status_pedido", [
  "pendente",
  "pago",
  "cancelado",
  "reembolsado",
]);

export const pedidos = pgTable("pedidos", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull(),
  email: text("email").notNull(),
  telefone: text("telefone"),
  cpf: text("cpf"),
  loteId: uuid("lote_id").notNull().references(() => lotes.id, { onDelete: "restrict" }),
  valorCentavos: integer("valor_centavos").notNull(),
  status: statusPedidoEnum("status").notNull().default("pendente"),
  gatewayPreferenceId: text("gateway_preference_id"),
  criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
  atualizadoEm: timestamp("atualizado_em", { withTimezone: true }).notNull().defaultNow(),
});

export const statusIngressoEnum = pgEnum("status_ingresso", [
  "valido",
  "usado",
  "cancelado",
]);

export const ingressos = pgTable("ingressos", {
  id: uuid("id").primaryKey().defaultRandom(),
  pedidoId: uuid("pedido_id").notNull().references(() => pedidos.id, { onDelete: "restrict" }),
  status: statusIngressoEnum("status").notNull().default("valido"),
  checkinEm: timestamp("checkin_em", { withTimezone: true }),
  checkinPor: uuid("checkin_por").references(() => adminUsuarios.id, { onDelete: "set null" }),
  criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
});

// Log de eventos recebidos do gateway de pagamento — fonte de idempotência.
// O webhook nunca é tratado como verdade absoluta: o adapter sempre confirma
// o status consultando a API do gateway antes de atualizar um pedido.
export const eventosPagamento = pgTable("eventos_pagamento", {
  id: uuid("id").primaryKey().defaultRandom(),
  pedidoId: uuid("pedido_id").notNull().references(() => pedidos.id, { onDelete: "restrict" }),
  provedorEventoId: text("provedor_evento_id").notNull(),
  tipo: text("tipo").notNull(),
  statusRecebido: text("status_recebido"),
  criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  eventoUnico: uniqueIndex("eventos_pagamento_provedor_evento_id_unico").on(t.provedorEventoId),
}));

// ---------------------------------------------------------------------------
// Mídia: fotos (armazenamento próprio) e vídeos (embed externo)
// ---------------------------------------------------------------------------

export const tipoMidiaEnum = pgEnum("tipo_midia", ["foto", "video"]);

export const midia = pgTable("midia", {
  id: uuid("id").primaryKey().defaultRandom(),
  tipo: tipoMidiaEnum("tipo").notNull(),
  // foto: caminho relativo no StorageAdapter. video: ID do vídeo no YouTube.
  referencia: text("referencia").notNull(),
  titulo: text("titulo"),
  ordem: integer("ordem").notNull().default(0),
  criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
});
