import type { Metadata } from "next";
import { AreaEmBreve } from "../_components/area-em-breve";

export const metadata: Metadata = { title: "Financeiro — LPZ Training" };

export default function Page() {
  return (
    <AreaEmBreve
      titulo="Financeiro"
      descricao="Área financeira da organização: vendas, lotes e pagamentos."
    />
  );
}
