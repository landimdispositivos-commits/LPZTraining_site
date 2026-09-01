import type {
  CriarPreferenciaInput,
  CriarPreferenciaResultado,
  PaymentProvider,
  StatusPagamento,
} from "./payment-provider";

// Implementação usada quando TEST_MODE=true. Simula o fluxo do gateway sem
// nenhuma chamada de rede, para desenvolvimento e testes automatizados.
// Nunca usar em produção — ver seleção do provider em `./index.ts`.
export class FakePaymentProvider implements PaymentProvider {
  private readonly status = new Map<string, StatusPagamento>();

  async criarPreferencia(input: CriarPreferenciaInput): Promise<CriarPreferenciaResultado> {
    const preferenceId = `fake-${input.pedidoId}`;
    this.status.set(preferenceId, "pendente");
    return {
      preferenceId,
      checkoutUrl: `/pagamento/simulado?preference=${preferenceId}`,
    };
  }

  async consultarStatus(preferenceId: string): Promise<StatusPagamento> {
    return this.status.get(preferenceId) ?? "pendente";
  }

  // Auxiliar exclusivo de teste/dev: aprova manualmente um pagamento simulado.
  aprovarManualmente(preferenceId: string) {
    this.status.set(preferenceId, "pago");
  }
}
