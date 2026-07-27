"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SectionVerdict } from "@/components/app/fiche/SectionVerdict";
import { SectionBien } from "@/components/app/fiche/SectionBien";
import { SectionMarche } from "@/components/app/fiche/SectionMarche";
import { SectionArgent } from "@/components/app/fiche/SectionArgent";
import { SectionScenario } from "@/components/app/fiche/SectionScenario";
import { computeInvestmentMetrics } from "@/lib/calc/metrics";
import { computeScoreSur100 } from "@/lib/calc/scoring";
import { useDebouncedScenarioSave } from "@/lib/hooks/use-debounced-scenario-save";
import { VerdictPill } from "@/components/ui/Verdict";
import { Toggle } from "@/components/ui/Controls";
import { IconArrowLeft } from "@/components/ui/Icon";
import type { PropertyRow, PropertyScenarioRow } from "@/lib/property-detail-types";

export type FicheMode = "simple" | "complet";

/**
 * FICHE D'ANALYSE — l'écran le plus dense du produit, donc celui qui exigeait
 * le plus de discipline.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * CE QUI A CHANGÉ
 * ─────────────────────────────────────────────────────────────────────────
 *
 * v1 : huit panneaux à plat, une cinquantaine de chiffres, deux cent quarante
 * lignes d'amortissement et dix-neuf curseurs, tout ouvert d'un seul coup. On
 * ne savait pas par où commencer — donc on ne commençait pas.
 *
 * v2 : deux modes, et une hiérarchie dans les deux.
 *
 *   SIMPLE  — ce qu'il faut pour décider si l'on visite. Un verdict en
 *             français, quatre chiffres, le bien, le marché, vos notes.
 *             Trois curseurs. Rien d'autre.
 *
 *   COMPLET — tout, mais RANGÉ. Le bien, le marché, puis un seul panneau
 *             « L'argent » qui regroupe financement, calculs, fiscalité et
 *             charges en quatre replis. Chaque repli affiche son résumé, pour
 *             qu'on n'ait jamais à l'ouvrir « au cas où ».
 *
 * Le mode vit dans l'URL plutôt qu'en mémoire locale : le bouton retour
 * fonctionne, le lien est partageable, et le rendu serveur reste cohérent.
 *
 * ⚠ Le mode est LU CÔTÉ SERVEUR (`page.tsx` reçoit `searchParams`) et descendu
 * en prop. Ne jamais le relire ici avec `useSearchParams()` : ce hook, appelé
 * dans un composant client sans limite `<Suspense>` au-dessus, fait basculer la
 * page en rendu client — et comme cette coque reçoit une section rendue côté
 * serveur (`humanSection`), l'hydratation ne se terminait tout simplement
 * jamais. Toute la fiche restait inerte. Le routeur seul suffit pour écrire.
 */
export function FicheShell({
  property,
  scenario: initialScenario,
  propertyId,
  projectId,
  mode,
  humanSection,
}: {
  property: PropertyRow;
  scenario: PropertyScenarioRow;
  propertyId: string;
  projectId: string;
  mode: FicheMode;
  humanSection: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [scenario, setScenario] = useState(initialScenario);
  const { status, scheduleSave } = useDebouncedScenarioSave(propertyId);

  const handleScenarioChange = (patch: Partial<PropertyScenarioRow>) => {
    setScenario((current) => ({ ...current, ...patch }));
    scheduleSave(patch);
  };

  function setMode(next: string) {
    router.replace(next === "complet" ? `${pathname}?vue=complet` : pathname, {
      scroll: false,
    });
  }

  const metrics = computeInvestmentMetrics(property, scenario);
  const { scoreSur100 } = computeScoreSur100({
    rendementNetNetPct: metrics.rendementNetNetPct,
    cashOnCashPct: metrics.cashOnCashPct,
    triPct: metrics.tri,
  });

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      {/* Rail de repérage */}
      <div className="sticky top-0 z-20 border-b border-hairline bg-bg/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[92rem] items-center gap-4 px-6 py-3">
          <Link
            href={`/app/p/${projectId}`}
            className="flex shrink-0 items-center gap-1.5 text-[13px] text-text-3 transition-colors hover:text-text"
          >
            <IconArrowLeft size={14} />
            <span className="hidden sm:inline">Pipeline</span>
          </Link>

          <span className="h-3.5 w-px shrink-0 bg-hairline-2" aria-hidden />

          <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium text-text">
            {property.address ?? "Adresse non renseignée"}
          </span>

          <VerdictPill score={scoreSur100} className="hidden shrink-0 sm:inline-flex" />

          <Toggle
            layoutKey="fiche-mode"
            active={mode}
            onSelect={setMode}
            className="shrink-0"
            items={[
              { key: "simple", label: "Simple" },
              { key: "complet", label: "Complet" },
            ]}
          />
        </div>
      </div>

      <div className="mx-auto max-w-[92rem] px-6 py-8">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_21rem]">
          <div className="focal-stagger flex min-w-0 flex-col gap-5">
            <SectionVerdict property={property} scenario={scenario} />
            <SectionBien property={property} mode={mode} />
            <SectionMarche property={property} />
            {mode === "complet" && (
              <SectionArgent property={property} scenario={scenario} />
            )}
            {humanSection}
          </div>

          <aside className="min-w-0">
            <div className="xl:sticky xl:top-[4.5rem]">
              <SectionScenario
                scenario={scenario}
                onChange={handleScenarioChange}
                saveStatus={status}
                mode={mode}
              />
            </div>
          </aside>
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-[12px] leading-relaxed text-text-4">
          Estio est un outil d&apos;aide à la décision, pas un conseil en investissement
          réglementé. Vérifiez les chiffres déterminants auprès d&apos;un professionnel
          avant de vous engager.
        </p>
      </div>
    </div>
  );
}
