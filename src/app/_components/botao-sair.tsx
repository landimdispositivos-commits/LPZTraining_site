"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/modules/auth/auth-client";

export function BotaoSair({ destino }: { destino: string }) {
  const router = useRouter();
  const [saindo, setSaindo] = useState(false);

  async function sair() {
    setSaindo(true);
    await authClient.signOut();
    router.push(destino);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={sair}
      disabled={saindo}
      className="rounded-full border border-gold-500/60 px-6 py-2.5 text-sm font-semibold text-gold-300 hover:bg-gold-500/10 disabled:opacity-60"
    >
      {saindo ? "Saindo..." : "Sair"}
    </button>
  );
}
