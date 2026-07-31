import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Le dossier de build est paramétrable.
   *
   * `next dev` et `next build` écrivent tous les deux dans `.next`. Lancer une
   * vérification de production pendant que le serveur de développement tourne
   * corrompt les deux : la page s'affiche, les chunks se chargent en 200, et
   * l'hydratation ne se termine jamais — exactement les symptômes muets des
   * pièges déjà documentés dans CLAUDE.md, mais pour une tout autre raison.
   *
   * Pour vérifier sur un build de production sans toucher au serveur de dev :
   *   NEXT_DIST_DIR=.next-verif npx next build
   *   NEXT_DIST_DIR=.next-verif npx next start -p 3100
   */
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
