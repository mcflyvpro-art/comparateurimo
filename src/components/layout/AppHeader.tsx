"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { appNavLinks } from "./app-nav-links";

/** Header applicatif (groupe (app)), distinct du header marketing.
 *  Solde de crédits factice cliquable → /tarifs. Pas d'auth en Phase 1. */
export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-bg/72 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <Link
            href="/app"
            className="font-sans text-xl font-semibold tracking-tight text-text"
          >
            estio<span className="text-brand">.</span>
          </Link>
          <div className="hidden items-center gap-6 text-sm sm:flex">
            {appNavLinks.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={`transition-colors ${
                    active
                      ? "font-medium text-text underline decoration-brand underline-offset-8"
                      : "text-muted hover:text-text"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/tarifs"
            title="Gérer l'abonnement et recharger des crédits"
            className="rounded-full border border-border bg-bg-alt px-3 py-1.5 text-sm font-medium text-text transition-colors hover:border-brand"
          >
            3 crédits
          </Link>
          <Link
            href="/"
            className="hidden text-sm text-muted transition-colors hover:text-text sm:block"
          >
            ← Retour au site
          </Link>
        </div>
      </nav>
    </header>
  );
}
