import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields, twoFactorClient } from "better-auth/client/plugins";
import type { auth } from "./auth";

// Cliente do navegador — mesma origem, então baseURL não é necessário.
// O redirecionamento para a tela do código de duas etapas é feito pelo
// próprio formulário de login (resposta com twoFactorRedirect).
export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>(), twoFactorClient()],
});
