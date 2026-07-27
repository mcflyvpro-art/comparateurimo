import type { Metadata } from "next";
import Link from "next/link";
import { IconArrowLeft, IconFocus } from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "Page introuvable",
};

/**
 * 404 — hors du plan de netteté.
 *
 * Le nombre est composé en très grand et détouré, puis flouté : littéralement
 * quelque chose qui n'est pas dans la focale. Le vocabulaire du système sert
 * l'erreur au lieu de la subir.
 */
export default function NotFound() {
  return (
    <main className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-[var(--gutter)] text-center">
      <span
        aria-hidden
        className="pointer-events-none absolute select-none text-[clamp(14rem,42vw,34rem)] font-medium leading-none tracking-[-0.06em] text-text opacity-[0.055]"
        style={{ filter: "blur(14px)" }}
      >
        404
      </span>

      <div className="relative">
        <span className="mb-8 inline-flex h-11 w-11 items-center justify-center rounded-full border border-hairline-2 text-text-3">
          <IconFocus size={20} />
        </span>

        <h1 className="t-title text-text">Rien dans ce plan.</h1>

        <p className="mx-auto mt-5 max-w-md text-[14px] leading-relaxed text-text-3">
          Cette adresse ne correspond à aucune page. Le lien est peut-être cassé, ou la
          page a bougé depuis que vous l&apos;avez notée.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-sm bg-brand px-5 py-2.5 text-[13px] font-medium text-inverse shadow-[inset_0_1px_0_rgb(255_255_255/0.2)] transition-colors hover:bg-brand-hot"
          >
            <IconArrowLeft size={14} />
            Retour à l&apos;accueil
          </Link>
          <Link
            href="/app"
            className="inline-flex items-center gap-2 rounded-sm border border-hairline-2 px-5 py-2.5 text-[13px] font-medium text-text transition-colors hover:border-hairline-3 hover:bg-raised"
          >
            Ouvrir mon pipeline
          </Link>
        </div>
      </div>
    </main>
  );
}
