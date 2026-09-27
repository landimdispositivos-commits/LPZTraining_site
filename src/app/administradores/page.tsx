import type { Metadata } from "next";
import { AreaEmBreve } from "../_components/area-em-breve";

export const metadata: Metadata = { title: "Administradores — LPZ Training" };

export default function Page() {
  return (
    <AreaEmBreve
      titulo="Administradores"
      descricao="Área da organização: cronograma, professores, ingressos e check-in."
    />
  );
}
