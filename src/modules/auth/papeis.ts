// Papéis de acesso. A checagem de verdade é sempre no servidor, a partir da
// sessão — nunca confiar em papel vindo do cliente.

export const PAPEIS_ADMIN = ["organizador", "portaria"] as const;
export type PapelAdmin = (typeof PAPEIS_ADMIN)[number];

export function ehAdmin(papel: string | null | undefined): papel is PapelAdmin {
  return (PAPEIS_ADMIN as readonly string[]).includes(papel ?? "");
}

// Área inicial de cada papel depois do login.
export function areaDoPapel(papel: string | null | undefined) {
  if (ehAdmin(papel)) return "/administradores/painel";
  if (papel === "profissional") return "/profissionais/minha-area";
  return "/congressistas/minha-area";
}
