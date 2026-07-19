/**
 * Barre de navigation translucide (apple-design §12) : le contenu défile
 * dessous, matériau flou plutôt qu'un bandeau opaque. Bord supérieur clair
 * pour capter la lumière.
 */
export function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-bg/72 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#" className="font-sans text-xl font-semibold tracking-tight text-text">
          estio<span className="text-brand">.</span>
        </a>

        <div className="hidden items-center gap-8 text-sm text-muted sm:flex">
          <a href="#principe" className="transition-colors hover:text-text">
            Comment ça marche
          </a>
          <a href="#score" className="transition-colors hover:text-text">
            Le score
          </a>
          <a href="#donnees" className="transition-colors hover:text-text">
            Données
          </a>
        </div>

        <a
          href="#"
          className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white transition-[transform,background-color] duration-100 hover:bg-brand-hover active:scale-[0.97]"
        >
          Ajouter un bien
        </a>
      </nav>
    </header>
  );
}
