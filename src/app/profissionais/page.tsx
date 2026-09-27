import type { Metadata } from "next";
import { AreaEmBreve } from "../_components/area-em-breve";

export const metadata: Metadata = { title: "Profissionais — LPZ Training" };

export default function Page() {
  return (
    <AreaEmBreve
      titulo="Profissionais"
      descricao="Área de professores e DJs: agenda de aulas, horários e informações da equipe."
    />
  );
}
