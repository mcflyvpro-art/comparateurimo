import { PageHeader } from "./PageHeader";

export type LegalSection = { heading: string; body: string };

/** Gabarit des pages légales : en-tête + bandeau « à compléter » + sections. */
export function LegalPage({
  title,
  sections,
}: {
  title: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <PageHeader eyebrow="Mentions légales" title={title} />
      <section className="mx-auto max-w-3xl px-6 pb-20">
        <p className="mb-10 rounded-lg border border-border bg-bg-alt px-4 py-3 text-sm text-muted">
          Gabarit à compléter avant mise en ligne (informations éditeur,
          hébergeur, responsable de traitement…).
        </p>
        <div className="flex flex-col gap-8">
          {sections.map((s) => (
            <div key={s.heading}>
              <h2 className="font-sans text-xl font-semibold tracking-tight text-text">
                {s.heading}
              </h2>
              <p className="mt-2 leading-relaxed text-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
