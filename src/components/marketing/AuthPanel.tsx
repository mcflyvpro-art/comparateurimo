import Link from "next/link";
import type { ReactNode } from "react";
import { FocalField } from "@/components/landing/FocalField";

/**
 * Écran d'accès — le seuil.
 *
 * Composition en deux volets : à gauche le formulaire, dense et net ; à droite
 * le champ focal du hero, poursuivi ici en sourdine. Franchir le seuil, c'est
 * passer du champ flou à l'instrument — et l'écran le raconte pendant qu'on
 * tape son mot de passe.
 */
export function AuthPanel({
  eyebrow,
  title,
  intro,
  children,
  footer,
  claim,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
  footer: ReactNode;
  claim: { quote: string; source: string };
}) {
  return (
    <section className="grid min-h-[100svh] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      {/* Le formulaire */}
      <div className="flex items-center justify-center px-[var(--gutter)] py-28 lg:py-32">
        <div className="w-full max-w-sm">
          <Link href="/" aria-label="Estio — accueil" className="inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/estio-wordmark.svg" alt="Estio" className="h-6 w-auto" />
          </Link>

          <div className="mt-12 flex items-center gap-4">
            <span className="t-label text-brand">{eyebrow}</span>
            <span className="h-px w-12 bg-brand/40" aria-hidden />
          </div>

          <h1 className="t-title mt-5 text-text">{title}</h1>
          <p className="mt-4 text-[14px] leading-relaxed text-text-3">{intro}</p>

          <div className="mt-10">{children}</div>

          <div className="mt-8 border-t border-hairline pt-6 text-[13px] text-text-3">
            {footer}
          </div>
        </div>
      </div>

      {/* Le champ focal, en sourdine */}
      <div className="relative hidden overflow-hidden border-l border-hairline bg-sunken lg:block">
        <div className="absolute inset-0 opacity-70">
          <FocalField count={280} />
        </div>
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(110% 80% at 60% 45%, transparent 25%, rgb(8 7 6 / 0.7) 75%, rgb(8 7 6 / 0.95) 100%)",
          }}
        />

        <div className="absolute inset-x-0 bottom-0 p-12">
          <span className="block h-px w-16 bg-brand" aria-hidden />
          <blockquote className="mt-7 max-w-md">
            <p className="text-[20px] leading-snug tracking-[-0.02em] text-text">
              {claim.quote}
            </p>
            <footer className="t-label mt-5 !text-[10px]">{claim.source}</footer>
          </blockquote>
        </div>
      </div>
    </section>
  );
}
