import type { Metadata } from "next";
import { AreaEmBreve } from "../_components/area-em-breve";

export const metadata: Metadata = { title: "Congressistas — LPZ Training" };

export default function Page() {
  return (
    <AreaEmBreve
      titulo="Congressistas"
      descricao="Área do congressista: seus ingressos, QR code de entrada e informações do evento."
    />
  );
}
