import type { PaymentProvider } from "./payment-provider";
import { FakePaymentProvider } from "./fake-payment-provider";

// Seleção do adapter em um único lugar. O adapter real do Mercado Pago
// (Checkout Pro) é adicionado aqui quando a integração for implementada;
// até lá, TEST_MODE=true é obrigatório e usa o fake.
function criarPaymentProvider(): PaymentProvider {
  if (process.env.TEST_MODE === "true") {
    return new FakePaymentProvider();
  }

  throw new Error(
    "Nenhum PaymentProvider real configurado ainda. Defina TEST_MODE=true para desenvolvimento, " +
      "ou implemente o adapter do Mercado Pago antes de rodar fora de TEST_MODE."
  );
}

export const paymentProvider = criarPaymentProvider();
export type { PaymentProvider, StatusPagamento, CriarPreferenciaInput, CriarPreferenciaResultado } from "./payment-provider";
