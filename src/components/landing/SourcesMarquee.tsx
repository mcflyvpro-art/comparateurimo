/**
 * Bande des sources — la caution.
 *
 * Six jeux de données publics, défilant sans fin. La typographie est en chasses
 * fixes et en petites capitales : ce ne sont pas des logos de partenaires, ce
 * sont des références. Le ruban est masqué en dégradé aux deux bords pour qu'il
 * n'ait ni début ni fin — l'idée étant qu'il y en a toujours plus.
 *
 * Défilement en `transform` uniquement, coupé en mouvement réduit.
 */

const SOURCES = [
  { code: "BAN", label: "Base adresse nationale" },
  { code: "DVF", label: "Valeurs foncières notariées" },
  { code: "LOYERS", label: "Carte des loyers" },
  { code: "INSEE", label: "Tension & vacance" },
  { code: "GÉORISQUES", label: "Risques naturels" },
  { code: "ADEME", label: "Diagnostics DPE" },
];

function Item({ code, label }: { code: string; label: string }) {
  return (
    <span className="flex shrink-0 items-baseline gap-3 whitespace-nowrap px-8">
      <span className="num text-[15px] tracking-[0.06em] text-text-2">{code}</span>
      <span className="text-[12px] text-text-4">{label}</span>
      <span className="ml-5 h-1 w-1 rounded-full bg-accent" aria-hidden />
    </span>
  );
}

export function SourcesMarquee() {
  const doubled = [...SOURCES, ...SOURCES];
  return (
    <div className="fade-x relative overflow-hidden py-3">
      <div className="flex w-max animate-marquee">
        {doubled.map((s, i) => (
          <Item key={`${s.code}-${i}`} {...s} />
        ))}
      </div>
    </div>
  );
}
