"use client";

import { useActionState } from "react";
import { Aviso, Campo, classeBotao, classeInput } from "../../_components/form-ui";
import { convidarProfissionalAction } from "./actions";

export function FormConvidarProfissional({
  professoresDisponiveis,
}: {
  professoresDisponiveis: { id: string; nome: string }[];
}) {
  const [estado, acao, pendente] = useActionState(convidarProfissionalAction, null);

  return (
    // key: limpa os campos depois de um convite enviado com sucesso.
    <form key={estado?.ok ? estado.envio : "form"} action={acao} className="space-y-4">
      {estado && <Aviso tipo={estado.ok ? "ok" : "erro"}>{estado.mensagem}</Aviso>}
      <Campo id="conv-nome" label="Nome">
        <input id="conv-nome" name="nome" required maxLength={100} className={classeInput} />
      </Campo>
      <Campo id="conv-email" label="E-mail">
        <input id="conv-email" name="email" type="email" required className={classeInput} />
      </Campo>
      <Campo id="conv-professor" label="Perfil no site (opcional)" dica="Liga a conta ao professor que aparece no site (foto, bio e aulas).">
        <select id="conv-professor" name="professorId" defaultValue="" className={classeInput} aria-describedby="conv-professor-dica">
          <option value="">Sem vínculo</option>
          {professoresDisponiveis.map((p) => (
            <option key={p.id} value={p.id}>{p.nome}</option>
          ))}
        </select>
      </Campo>
      <button type="submit" disabled={pendente} className={classeBotao}>
        {pendente ? "Enviando..." : "Enviar convite"}
      </button>
    </form>
  );
}
