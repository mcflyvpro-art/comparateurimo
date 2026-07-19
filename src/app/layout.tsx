import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Grotesque neutre (substitut libre proche d'Helvetica) — poids 100→900 pour
// couvrir le « hairline » et le « bold » du modèle. Self-hosté par next/font.
const grotesk = Inter({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Estio — comparateur immobilier d'investissement",
  description:
    "Compare tes biens immobiliers côte à côte, du point de vue de l'investissement. Chaque adresse déverrouille les données de marché, et le score reflète tes priorités.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`h-full antialiased ${grotesk.variable}`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
