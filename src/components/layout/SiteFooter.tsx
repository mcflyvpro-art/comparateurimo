import Link from "next/link";
import { footerGroups } from "./nav-links";

/**
 * Pied de page. Sobre, filaire, sans ornement : à cet endroit de la page,
 * l'utilisateur cherche un lien, pas une signature graphique.
 */
export function SiteFooter() {
  return (
    <footer data-header-theme="dark" className="border-t border-line-soft bg-sunken">
      <div className="mx-auto max-w-[104rem] px-[var(--gutter)]">
        <div className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,minmax(0,1fr))]">
          <div>
            <Link href="/" aria-label="Estio — accueil" className="inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/estio-wordmark.svg" alt="Estio" className="h-6 w-auto" />
            </Link>
            <p className="mt-4 max-w-[26ch] text-[13px] leading-relaxed text-text-3">
              Le pipeline de décision de l&apos;investisseur immobilier. Deux cents
              annonces, une décision.
            </p>
            <p className="num mt-5 text-[12px] text-text-4">estio.immo</p>
          </div>

          {footerGroups.map((g) => (
            <nav key={g.title} aria-label={g.title}>
              <h2 className="t-label">{g.title}</h2>
              <ul className="mt-4 flex flex-col gap-2.5">
                {g.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-[13px] text-text-3 transition-colors hover:text-text"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line-soft py-6">
          <p className="num text-[11px] text-text-4">© 2026 Estio</p>
          <p className="max-w-xl text-[11px] leading-relaxed text-text-4">
            Outil d&apos;aide à la décision — pas un conseil en investissement réglementé.
            Les projections sont des scénarios explicites, jamais des garanties.
          </p>
        </div>
      </div>
    </footer>
  );
}
