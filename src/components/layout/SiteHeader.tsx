"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navLinks } from "./nav-links";
import { MagneticButton } from "@/components/landing/MagneticButton";
import { MobileMenu } from "./MobileMenu";

/** Header translucide. Liens vers les vraies pages, état actif, menu mobile. */
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-bg/72 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-sans text-xl font-semibold tracking-tight text-text"
        >
          estio<span className="text-brand">.</span>
        </Link>

        <div className="hidden items-center gap-8 text-sm sm:flex">
          {navLinks.map((l) => {
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

        <div className="hidden items-center gap-4 sm:flex">
          <Link
            href="/connexion"
            className="text-sm text-muted transition-colors hover:text-text"
          >
            Se connecter
          </Link>
          <MagneticButton href="/connexion" className="px-4 py-2 text-sm">
            Ajouter un bien
          </MagneticButton>
        </div>

        <button
          onClick={() => setOpen(true)}
          aria-label="Ouvrir le menu"
          className="cursor-pointer p-2 sm:hidden"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <line x1="4" y1="8" x2="20" y2="8" />
            <line x1="4" y1="16" x2="20" y2="16" />
          </svg>
        </button>
      </nav>

      <MobileMenu open={open} onClose={() => setOpen(false)} pathname={pathname} />
    </header>
  );
}
