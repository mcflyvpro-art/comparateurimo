import Link from "next/link";
import { footerGroups } from "./nav-links";

/** Pied de page enrichi : marque + 3 colonnes de liens + barre légale. */
export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link
            href="/"
            className="font-sans text-lg font-semibold tracking-tight text-text"
          >
            estio<span className="text-brand">.</span>
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
            Le bon bien, chiffres à l’appui. Données de marché officielles,
            calcul transparent.
          </p>
          <p className="mt-3 text-sm text-faint">estio.immo</p>
        </div>

        {footerGroups.map((g) => (
          <nav key={g.title} aria-label={g.title}>
            <h2 className="text-sm font-semibold text-text">{g.title}</h2>
            <ul className="mt-4 space-y-2.5">
              {g.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-muted transition-colors hover:text-text"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-6 text-sm text-faint">
          © 2026 Estio
        </div>
      </div>
    </footer>
  );
}
