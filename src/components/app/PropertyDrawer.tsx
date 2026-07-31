"use client";

import { computeRendementBrutPct } from "@/lib/calc/score";
import { scoreFromRendement } from "@/lib/verdict";
import { formatEUR, formatM2, formatPercent, formatPricePerM2 } from "@/lib/format";
import { Sheet } from "@/components/ui/Overlay";
import { VerdictBlock } from "@/components/ui/Verdict";
import { Stat, StatGrid } from "@/components/ui/Stat";
import { StageRail } from "@/components/app/StageRail";
import { NoteList } from "@/components/app/NoteList";
import { ButtonLink } from "@/components/ui/Button";
import { Rule } from "@/components/ui/Panel";
import { IconArrowRight } from "@/components/ui/Icon";
import type { PipelineProperty, PropertyStatus } from "@/lib/pipeline-types";

/**
 * Panneau d'aperçu — le coup d'œil, pas l'analyse.
 *
 * Quatre blocs, dans l'ordre où l'on se pose les questions : est-ce que ça vaut
 * le coup, combien ça coûte, où en est le dossier, qu'est-ce que j'avais noté.
 * L'analyse complète reste à un clic, jamais imposée.
 */
export function PropertyDrawer({
  property,
  projectId,
  onClose,
  onStatusChange,
  onAddNote,
}: {
  property: PipelineProperty | null;
  projectId: string;
  onClose: () => void;
  onStatusChange: (status: PropertyStatus) => void;
  onAddNote: (body: string) => Promise<void>;
}) {
  const rendement = property ? computeRendementBrutPct(property) : null;
  const score = scoreFromRendement(rendement);

  return (
    <Sheet
      open={Boolean(property)}
      onClose={onClose}
      title={property?.address ?? "Adresse non renseignée"}
      subtitle={
        property
          ? [property.city, property.property_type].filter(Boolean).join(" · ") || "—"
          : undefined
      }
      footer={
        property && (
          <ButtonLink
            href={`/app/p/${projectId}/bien/${property.id}`}
            variant="outline"
            size="md"
            className="w-full"
            trailing={<IconArrowRight size={14} />}
          >
            Analyse complète
          </ButtonLink>
        )
      }
    >
      {property && (
        <div className="flex flex-col gap-7">
          <VerdictBlock score={score} />

          <Rule />

          <StatGrid cols={2}>
            <Stat label="Prix affiché" value={formatEUR(property.asking_price)} />
            <Stat term="surfaceCarrez" value={formatM2(property.surface_carrez)} />
            <Stat
              term="prixM2"
              value={formatPricePerM2(property.asking_price, property.surface_carrez)}
            />
            <Stat term="rendementBrut" value={formatPercent(rendement)} />
          </StatGrid>

          {property.max_price !== null && (
            <Stat
              label="Votre prix maximum"
              value={formatEUR(property.max_price)}
              hint={
                property.asking_price
                  ? `${formatEUR(property.asking_price - property.max_price)} à négocier`
                  : undefined
              }
            />
          )}

          <Rule />

          <div>
            <h3 className="mb-4 text-[13px] font-medium text-text-2">Avancement</h3>
            <StageRail status={property.status} onChange={onStatusChange} />
            {property.status === "ecarte" && property.discard_reason && (
              <p className="mt-3 text-[12.5px] leading-relaxed text-text-3">
                <span className="text-text-4">Raison : </span>
                {property.discard_reason}
              </p>
            )}
          </div>

          <Rule />

          <div>
            <div className="mb-3 flex items-baseline justify-between">
              <h3 className="text-[13px] font-medium text-text-2">Notes</h3>
              {property.notes.length > 0 && (
                <span className="num text-[11px] text-text-4">
                  {property.notes.length}
                </span>
              )}
            </div>

            <NoteList
              propertyId={property.id}
              notes={property.notes}
              onOptimisticAdd={(body) => onAddNote(body)}
            />
          </div>
        </div>
      )}
    </Sheet>
  );
}
