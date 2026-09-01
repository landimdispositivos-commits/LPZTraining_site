// Porta (interface) do provedor de pagamento. Nenhum código de negócio deve
// depender diretamente do SDK do Mercado Pago — sempre desta interface, para
// que o gateway possa ser trocado sem tocar em `pedidos`/`ingressos`.
//
// Importante: o adapter real (Mercado Pago) usa Checkout Pro (redirect
// hospedado) — dados de cartão nunca devem passar pelo nosso servidor.

export type StatusPagamento = "pendente" | "pago" | "cancelado" | "reembolsado";

export interface CriarPreferenciaInput {
  pedidoId: string;
  descricao: string;
  valorCentavos: number;
  compradorEmail: string;
}

export interface CriarPreferenciaResultado {
  preferenceId: string;
  checkoutUrl: string;
}

export interface PaymentProvider {
  criarPreferencia(input: CriarPreferenciaInput): Promise<CriarPreferenciaResultado>;

  // Sempre consulta a API do gateway — nunca confia apenas no payload do
  // webhook, que pode chegar duplicado, fora de ordem ou ser forjado.
  consultarStatus(preferenceId: string): Promise<StatusPagamento>;
}
