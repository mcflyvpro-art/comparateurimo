"use client";

import { Segmented } from "@/components/ui/Controls";
import { IconBoard, IconMap, IconTable } from "@/components/ui/Icon";

const VIEWS = [
  { key: "pipeline", label: "Pipeline", icon: <IconBoard size={14} /> },
  { key: "tableau", label: "Tableau", icon: <IconTable size={14} /> },
  { key: "carte", label: "Carte", icon: <IconMap size={14} /> },
] as const;

export type ViewKey = (typeof VIEWS)[number]["key"];

/**
 * Bascule de vue.
 *
 * La légende des trois niveaux de données a disparu d'ici : elle expliquait un
 * code couleur qui n'existe plus. Une barre d'onglets ne doit rien contenir
 * d'autre que des onglets.
 */
export function ViewTabs({
  projectId,
  active,
}: {
  projectId: string;
  active: ViewKey;
}) {
  return (
    <div className="border-b border-hairline px-5">
      <Segmented
        layoutKey="project-views"
        active={active}
        items={VIEWS.map((v) => ({
          key: v.key,
          label: v.label,
          icon: v.icon,
          href: `/app/p/${projectId}?view=${v.key}`,
        }))}
      />
    </div>
  );
}
