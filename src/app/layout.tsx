import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LPZ Training",
  description:
    "LPZ Training — congresso e treinamento de zouk. Cronograma, professores, ingressos e fotos do evento.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
