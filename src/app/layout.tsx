import type { Metadata, Viewport } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

/**
 * Deux caractères, deux rôles, jamais interchangeables.
 *
 * Space Grotesk porte la voix : une grotesque avec du tempérament (le « o » à
 * flancs plats, le « g » singulier) qui sonne instrument plutôt que SaaS
 * générique. JetBrains Mono porte les chiffres, tous les chiffres, en chasses
 * fixes — les colonnes s'alignent au pixel, ce qui est la moitié de la
 * crédibilité d'un outil financier.
 */
const grotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-grotesk",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-mono-jb",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Estio — le pipeline de décision de l'investisseur immobilier",
    template: "%s — Estio",
  },
  description:
    "Deux cents annonces, une décision. Estio pilote votre recherche d'achat du repérage à l'offre : capture universelle, données de marché officielles, moteur de calcul déterministe, arbitrage entre finalistes.",
  metadataBase: new URL("https://estio.immo"),
};

export const viewport: Viewport = {
  themeColor: "#0b0a09",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`h-full antialiased ${grotesk.variable} ${mono.variable}`}
    >
      <body className="min-h-full flex flex-col bg-bg text-text">{children}</body>
    </html>
  );
}
