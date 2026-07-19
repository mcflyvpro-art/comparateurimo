import { Reveal } from "@/components/landing/Reveal";

/** En-tête réutilisable des pages secondaires : eyebrow + titre + intro. */
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
    <div className="mx-auto max-w-6xl px-6 pt-16 pb-10 lg:pt-24">
      <Reveal>
        <span className="text-sm font-medium uppercase tracking-wide text-brand">
          {eyebrow}
        </span>
        <h1 className="mt-4 max-w-3xl font-sans text-4xl font-semibold tracking-[-0.03em] text-text md:text-5xl">
          {title}
        </h1>
        {intro ? (
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
            {intro}
          </p>
        ) : null}
      </Reveal>
    </div>
  );
}
