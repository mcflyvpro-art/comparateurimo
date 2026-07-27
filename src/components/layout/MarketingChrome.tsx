"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PageLoader } from "@/components/layout/PageLoader";

/** Routes qui portent leur propre mise en page plein écran. */
const BARE_ROUTES = new Set(["/connexion", "/inscription"]);

/**
 * Habillage du site public.
 *
 * Les écrans d'accès sont volontairement nus : ils ont leur propre logotype et
 * leur propre composition en deux volets. Y superposer l'en-tête du site
 * donnerait deux marques à l'écran — la faute la plus courante des pages de
 * connexion.
 */
export function MarketingChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const bare = BARE_ROUTES.has(pathname);

  if (bare) return <>{children}</>;

  return (
    <>
      {/* Le voile d'ouverture n'appartient qu'à la page d'accueil : imposer une
          seconde et demie d'attente à quelqu'un qui vient lire les tarifs, ce
          n'est plus une signature, c'est un péage. */}
      {pathname === "/" && <PageLoader />}
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}
