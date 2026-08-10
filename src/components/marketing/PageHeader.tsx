import { Reveal } from "@/components/ui/Feedback";

/**
 * En-tête des pages secondaires.
 *
 * Toujours la même composition : surtitre en braise, titre géant, chapô à
 * mesure de lecture confortable. Un filet incandescent court sous le surtitre —
 * assez pour signer la page, assez peu pour ne pas concurrencer le titre.
 */
export function PageHeader({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
}) {
  return (
    <div className="mx-auto max-w-[104rem] px-[var(--gutter)] pb-16 pt-40 lg:pt-48">
      <Reveal cine>
        <div className="flex items-center gap-4">
          <span className="t-label text-accent">{eyebrow}</span>
          <span className="h-px w-16 bg-accent/40" aria-hidden />
        </div>
        <h1 className="t-display mt-7 max-w-4xl text-text">{title}</h1>
        {intro && <p className="t-lead mt-8 max-w-2xl">{intro}</p>}
      </Reveal>
    </div>
  );
}
