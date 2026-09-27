import { z } from "zod";

// Regras do cadastro de congressista — usadas no formulário (feedback
// imediato) e no servidor (hook do Better Auth), que é quem de fato decide.

export const PAIS_BRASIL = "Brasil";

export const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;

export const SENHA_MIN = 8;
export const SENHA_MAX = 128;

export function somenteDigitos(valor: string) {
  return valor.replace(/\D/g, "");
}

export function cpfValido(valor: string) {
  const cpf = somenteDigitos(valor);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  const digito = (base: string) => {
    let soma = 0;
    for (let i = 0; i < base.length; i++) soma += Number(base[i]) * (base.length + 1 - i);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  const d1 = digito(cpf.slice(0, 9));
  const d2 = digito(cpf.slice(0, 10));
  return d1 === Number(cpf[9]) && d2 === Number(cpf[10]);
}

// Normaliza para formato internacional (+55...) — o que o gateway e
// ferramentas de mensagem esperam.
export function normalizarCelular(valor: string, pais: string) {
  const digitos = somenteDigitos(valor);
  if (pais === PAIS_BRASIL) {
    const nacional = digitos.startsWith("55") && digitos.length === 13 ? digitos.slice(2) : digitos;
    // DDD (2) + 9 + 8 dígitos
    return /^[1-9]{2}9\d{8}$/.test(nacional) ? `+55${nacional}` : null;
  }
  return digitos.length >= 8 && digitos.length <= 15 ? `+${digitos}` : null;
}

export const dadosCongressistaSchema = z
  .object({
    celular: z.string().trim().min(1, "Informe o celular."),
    pais: z.string().trim().min(2, "Informe o país.").max(60),
    uf: z.string().trim().optional().nullable(),
    cpf: z.string().trim().optional().nullable(),
  })
  .superRefine((dados, ctx) => {
    const brasil = dados.pais === PAIS_BRASIL;
    if (!normalizarCelular(dados.celular, dados.pais)) {
      ctx.addIssue({
        code: "custom",
        path: ["celular"],
        message: brasil
          ? "Celular inválido. Use DDD + número, ex: (11) 91234-5678."
          : "Celular inválido. Inclua o código do país, ex: +351 912 345 678.",
      });
    }
    if (brasil) {
      if (!dados.uf || !(UFS as readonly string[]).includes(dados.uf)) {
        ctx.addIssue({ code: "custom", path: ["uf"], message: "Selecione o estado." });
      }
      if (!dados.cpf || !cpfValido(dados.cpf)) {
        ctx.addIssue({ code: "custom", path: ["cpf"], message: "CPF inválido." });
      }
    }
  })
  .transform((dados) => {
    const brasil = dados.pais === PAIS_BRASIL;
    return {
      celular: normalizarCelular(dados.celular, dados.pais)!,
      pais: dados.pais,
      uf: brasil ? dados.uf! : null,
      cpf: brasil ? somenteDigitos(dados.cpf!) : null,
    };
  });

export type DadosCongressista = z.output<typeof dadosCongressistaSchema>;
