"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { IconEmber, IconRefresh } from "@/components/ui/Icon";

/**
 * Erreur applicative.
 *
 * Un écran d'erreur est un moment de confiance perdue : le ton y compte plus
 * qu'ailleurs. On dit ce qui s'est passé, on ne culpabilise pas l'utilisateur,
 * et on propose deux gestes concrets — réessayer, ou revenir en terrain connu.
 * L'identifiant technique est affiché en chasses fixes pour être copiable tel quel.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center px-[var(--gutter)] text-center">
      <span className="mb-8 inline-flex h-11 w-11 items-center justify-center rounded-full border border-hairline-2 text-ember-600">
        <IconEmber size={20} />
      </span>

      <h1 className="t-title text-text">Quelque chose a chauffé.</h1>

      <p className="mx-auto mt-5 max-w-md text-[14px] leading-relaxed text-text-3">
        Une erreur inattendue s&apos;est produite. Vos données sont intactes — rien
        n&apos;a été enregistré à moitié.
      </p>

      {error.digest && (
        <p className="num mt-6 rounded-sm border border-hairline px-3 py-1.5 text-[11px] text-text-4">
          {error.digest}
        </p>
      )}

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="solid"
          size="md"
          onClick={reset}
          icon={<IconRefresh size={14} />}
        >
          Réessayer
        </Button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-sm border border-hairline-2 px-4 py-2.5 text-[13px] font-medium text-text transition-colors hover:border-hairline-3 hover:bg-raised"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  );
}
