import type { ReactNode } from "react";

/** Carte de section standard de la fiche : numéro ①→⑨, titre, contenu.
 *  Purement présentationnel — aucune section ne gère son propre style. */
export function SectionCard({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-bg-alt p-6">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-faint">
        <span className="text-brand">{number}</span> {title}
      </h2>
      {children}
    </section>
  );
}
