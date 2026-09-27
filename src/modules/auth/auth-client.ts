import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "./auth";

// Cliente do navegador — mesma origem, então baseURL não é necessário.
export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>()],
});
