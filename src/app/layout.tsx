import type { Metadata, Viewport } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { ThemeScript } from "@/components/providers/ThemeScript";
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f6f4" },
    { media: "(prefers-color-scheme: dark)", color: "#121110" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // `suppressHydrationWarning` : le script inline modifie `data-theme` sur
    // <html> avant l'hydratation, donc le serveur et le client diffèrent
    // nécessairement sur cet attribut. C'est le cas d'usage exact prévu par
    // React pour cette échappatoire.
    <html
      lang="fr"
      data-theme="light"
      data-density="confortable"
      suppressHydrationWarning
      className={`h-full antialiased ${grotesk.variable} ${mono.variable}`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-full flex-col bg-canvas text-text">{children}</body>
    </html>
  );
}
