import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";
import { ehAdmin, PAPEIS_ADMIN, type PapelAdmin } from "./papeis";

export async function obterSessao() {
  return auth.api.getSession({ headers: await headers() });
}

// Porta de entrada de toda página e server action de /administradores.
// Exige: sessão válida + papel de administrador + duas etapas já ativada
// (+ papel específico, quando informado). Consulta o banco a cada chamada
// (sem cache de sessão em cookie), então remover um papel vale na hora.
export async function exigirAdmin(papeisPermitidos: readonly PapelAdmin[] = PAPEIS_ADMIN) {
  const sessao = await obterSessao();
  if (!sessao) redirect("/administradores");
  const { papel, twoFactorEnabled } = sessao.user;
  if (!ehAdmin(papel)) redirect("/administradores?erro=restrito");
  if (!twoFactorEnabled) redirect("/administradores/ativar-duas-etapas");
  if (!papeisPermitidos.includes(papel)) redirect("/administradores/painel?erro=sem-permissao");
  return { ...sessao, user: { ...sessao.user, papel } };
}
