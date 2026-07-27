import { PageHeader } from "./PageHeader";
import { Notice } from "@/components/ui/Feedback";

export type LegalSection = { heading: string; body: string };

/**
 * Gabarit des pages légales.
 *
 * Les mentions obligatoires méritent le même soin que le reste : sections
 * numérotées en chasses fixes, sommaire collant, mesure de lecture confortable.
 * Un texte juridique lisible est un signal de sérieux — un pavé illisible en est
 * un aussi, dans l'autre sens.
 */
export function LegalPage({
  eyebrow = "Légal",
  title,
  intro,
  sections,
  draft = true,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  sections: LegalSection[];
  /** Affiche le bandeau « gabarit à compléter » tant que le texte n'est pas définitif. */
  draft?: boolean;
}) {
  const slug = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} intro={intro} />

      <section className="mx-auto max-w-[104rem] px-[var(--gutter)] pb-28">
        {draft && (
          <Notice tone="warn" className="mb-12 max-w-3xl">
            Gabarit à compléter avant mise en ligne : informations d&apos;éditeur,
            hébergeur et responsable de traitement restent à renseigner.
          </Notice>
        )}

        <div className="grid gap-12 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-20">
          <nav aria-label="Sommaire" className="hidden lg:block">
            <div className="sticky top-28">
              <span className="t-label mb-4 block !text-[10px]">Sommaire</span>
              <ul className="flex flex-col gap-2.5">
                {sections.map((s, i) => (
                  <li key={s.heading}>
                    <a
                      href={`#${slug(s.heading)}`}
                      className="flex items-baseline gap-2.5 text-[12px] text-text-3 transition-colors hover:text-text"
                    >
                      <span className="num text-[10px] text-text-4">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {s.heading}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          <div className="flex max-w-3xl flex-col">
            {sections.map((s, i) => (
              <article
                key={s.heading}
                id={slug(s.heading)}
                className="scroll-mt-28 border-t border-hairline py-9 first:border-t-0 first:pt-0"
              >
                <div className="flex items-baseline gap-3">
                  <span className="num text-[11px] text-brand">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 className="t-head text-text">{s.heading}</h2>
                </div>
                <p className="mt-4 whitespace-pre-line text-[14px] leading-relaxed text-text-3">
                  {s.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
