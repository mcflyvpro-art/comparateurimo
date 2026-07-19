import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="fr" className="h-full antialiased">
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
