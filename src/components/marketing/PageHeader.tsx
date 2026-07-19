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
    <div className="mx-auto max-w-[106rem] px-[6vw] pb-14 pt-36 lg:pt-44">
      <Reveal>
        <span className="text-sm font-medium uppercase tracking-[0.2em] text-brand">
          {eyebrow}
        </span>
        <h1 className="h-lg mt-6 max-w-4xl text-text">{title}</h1>
        {intro ? (
          <p className="p-lead mt-8 max-w-2xl text-muted">{intro}</p>
        ) : null}
      </Reveal>
    </div>
  );
}
