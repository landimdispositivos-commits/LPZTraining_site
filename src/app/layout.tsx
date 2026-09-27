import type { Metadata } from "next";
import { Michroma, Mrs_Saint_Delafield, Poppins } from "next/font/google";
import "./globals.css";

// Fontes Google (licença OFL), servidas pelo próprio site via next/font.
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

const michroma = Michroma({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-michroma",
});

const scriptAccent = Mrs_Saint_Delafield({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script-accent",
});

export const metadata: Metadata = {
  title: "LPZ Training",
  description:
    "LPZ Training — congresso e treinamento de zouk. Cronograma, professores, ingressos e fotos do evento.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${poppins.variable} ${michroma.variable} ${scriptAccent.variable}`}
    >
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
