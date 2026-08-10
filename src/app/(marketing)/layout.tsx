import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { MarketingChrome } from "@/components/layout/MarketingChrome";

/**
 * La vitrine reste nocturne pendant que l'outil passe en clair.
 *
 * C'est possible parce que le thème sombre est défini sur un sélecteur
 * d'attribut nu — `[data-theme="dark"]` et non `:root[data-theme="dark"]` :
 * il s'applique donc à n'importe quel conteneur, pendant que <html> reste
 * clair. Le grain de film, retiré de l'outil, redevient ici ce qu'il était :
 * ce qui empêche le noir d'être plat.
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-theme="dark" className="grain min-h-screen bg-canvas text-text">
      <SmoothScroll>
        <MarketingChrome>{children}</MarketingChrome>
      </SmoothScroll>
    </div>
  );
}
