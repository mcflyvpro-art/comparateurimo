"use client";

import { Editable } from "@/components/ui/Editable";
import { formatEUR } from "@/lib/format";
import { updatePropertyField } from "@/app/(app)/app/p/[projectId]/bien/[propertyId]/property-actions";

/**
 * Votre prix maximum.
 *
 * Le chiffre le plus utile du dossier au moment de négocier, et le seul qui
 * n'appartient qu'à vous : ce n'est ni une donnée du bien, ni un calcul, c'est
 * une décision. Il s'affichait sans qu'aucun écran ne permette de le saisir.
 *
 * L'indice sous la valeur dit la marge à négocier, en euros — pas en
 * pourcentage : on négocie avec un vendeur en euros.
 */
export function PrixMaximum({
  propertyId,
  projectId,
  valeur,
  prixAffiche,
}: {
  propertyId: string;
  projectId: string;
  valeur: number | null;
  prixAffiche: number | null;
}) {
  const marge = valeur !== null && prixAffiche !== null ? prixAffiche - valeur : null;

  return (
    <Editable
      label="Votre prix maximum"
      value={valeur}
      display={valeur !== null ? formatEUR(valeur) : undefined}
      kind="nombre"
      unit="€"
      hint={
        marge === null
          ? "Ce que vous refusez de dépasser"
          : marge > 0
            ? `${formatEUR(marge)} à négocier`
            : marge === 0
              ? "Au prix affiché"
              : `${formatEUR(-marge)} au-dessus du prix affiché`
      }
      onSave={(v) => updatePropertyField(propertyId, projectId, "max_price", v)}
    />
  );
}
