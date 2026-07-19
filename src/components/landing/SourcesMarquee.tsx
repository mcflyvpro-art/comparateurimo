/**
 * Bande défilante des sources de données (marquee CSS, transform-only).
 * Liste dupliquée pour une boucle sans couture (-50%). Bords fondus.
 * L'animation est coupée en reduced-motion (voir globals.css).
 */
const SOURCES = [
  "BAN — adresses",
  "DVF — prix réels notariés",
  "Carte des loyers",
  "INSEE — tension & vacance",
  "Géorisques",
  "ADEME — DPE",
];

function Item({ label }: { label: string }) {
  return (
    <span className="flex items-center gap-3 whitespace-nowrap px-6 text-lg text-muted">
      <span className="size-1.5 rounded-full bg-brand" aria-hidden />
      {label}
    </span>
  );
}

export function SourcesMarquee() {
  const doubled = [...SOURCES, ...SOURCES];
  return (
    <div className="relative overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
      <div className="flex w-max animate-marquee">
        {doubled.map((s, i) => (
          <Item key={`${s}-${i}`} label={s} />
        ))}
      </div>
    </div>
  );
}
