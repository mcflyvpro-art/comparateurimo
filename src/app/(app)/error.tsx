"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { IconEmber, IconRefresh } from "@/components/ui/Icon";

/**
 * Erreur dans l'outil.
 *
 * Distincte de l'erreur du site public : ici l'utilisateur travaille, et sa
 * première question est « est-ce que j'ai perdu quelque chose ? ». On y répond
 * en premier, avant même de proposer une action.
 */
export default function AppError({
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
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 text-center">
      <span className="mb-7 inline-flex h-10 w-10 items-center justify-center rounded-full border border-hairline-2 text-ember-600">
        <IconEmber size={18} />
      </span>

      <h1 className="text-[17px] font-medium tracking-[-0.015em] text-text">
        Cet écran n&apos;a pas pu se charger.
      </h1>

      <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-text-3">
        Vos projets, vos biens et vos notes sont intacts — l&apos;erreur est survenue à
        l&apos;affichage, pas à l&apos;enregistrement.
      </p>

      {error.digest && (
        <p className="num mt-5 rounded-sm border border-hairline px-2.5 py-1 text-[10px] text-text-4">
          {error.digest}
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        <Button variant="solid" size="sm" onClick={reset} icon={<IconRefresh size={14} />}>
          Recharger
        </Button>
        <Link
          href="/app/projects"
          className="inline-flex items-center rounded-sm border border-hairline-2 px-4 py-2 text-[13px] font-medium text-text transition-colors hover:border-hairline-3 hover:bg-raised"
        >
          Tous les projets
        </Link>
      </div>
    </div>
  );
}
