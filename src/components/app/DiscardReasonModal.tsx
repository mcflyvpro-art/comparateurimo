"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Overlay";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Field";
import { cx } from "@/lib/cx";

/**
 * Raison de l'écart — le seul passage obligé de l'outil.
 *
 * C'est la mémoire du pipeline : dans deux mois, quand la même annonce
 * réapparaît en baisse de prix, cette phrase évite de refaire l'analyse. On ne
 * peut donc pas écarter sans dire pourquoi.
 *
 * Les motifs fréquents sont proposés en un clic — écarter doit coûter deux
 * secondes, pas une rédaction.
 */

const COMMON_REASONS = [
  "Travaux trop lourds",
  "Budget dépassé",
  "Quartier écarté",
  "Rendement insuffisant",
  "Vendu / plus disponible",
  "Copropriété fragile",
];

export function DiscardReasonModal({
  open,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState("");

  // Remise à zéro à chaque ouverture, ajustée pendant le rendu plutôt que dans
  // un effet : pas de rendu en cascade, et le champ n'apparaît jamais avec le
  // texte de l'écart précédent, même une image.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setReason("");
  }

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title="Pourquoi écarter ce bien ?"
      description="La raison reste attachée au bien. Elle vous évitera de le réanalyser dans deux mois."
      width="26rem"
      footer={
        <>
          <Button variant="quiet" size="sm" onClick={onCancel}>
            Annuler
          </Button>
          <Button
            variant="solid"
            size="sm"
            disabled={!reason.trim()}
            onClick={() => onConfirm(reason.trim())}
          >
            Écarter le bien
          </Button>
        </>
      }
    >
      <div className="flex flex-wrap gap-1.5">
        {COMMON_REASONS.map((r) => {
          const active = reason === r;
          return (
            <button
              key={r}
              type="button"
              onClick={() => setReason(active ? "" : r)}
              className={cx(
                "rounded-sm border px-2 py-1 text-[11px] transition-colors duration-[140ms]",
                active
                  ? "border-hairline-ember bg-[var(--brand-wash)] text-brand-hot"
                  : "border-hairline-2 text-text-3 hover:border-hairline-3 hover:text-text",
              )}
            >
              {r}
            </button>
          );
        })}
      </div>

      <Textarea
        autoFocus
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="…ou écrivez la vôtre."
        rows={3}
        className="mt-3"
      />
    </Modal>
  );
}
