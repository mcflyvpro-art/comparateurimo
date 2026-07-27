import { formatEUR, formatM2 } from "@/lib/format";
import { Panel } from "@/components/ui/Panel";
import { Stat, StatGrid, Field, SourceTag } from "@/components/ui/Stat";
import { Disclosure } from "@/components/ui/Disclosure";
import { toneDpe } from "@/lib/tone";
import type { PropertyRow } from "@/lib/property-detail-types";
import type { FicheMode } from "@/components/app/fiche/FicheShell";

function yesNo(value: boolean | null): string {
  if (value === null) return "—";
  return value ? "Oui" : "Non";
}

/**
 * Le bien.
 *
 * En mode Simple : six caractéristiques. Celles qui changent une décision de
 * visite — la taille, le nombre de pièces, l'étage, la note énergétique, les
 * charges, les travaux.
 *
 * En mode Complet : les vingt-trois champs, rangés en quatre replis nommés,
 * avec un résumé visible sans ouvrir. Une liste de vingt-trois lignes se lit ;
 * une grille de vingt-trois cases, non.
 */
export function SectionBien({
  property,
  mode,
}: {
  property: PropertyRow;
  mode: FicheMode;
}) {
  const essentiels = (
    <StatGrid cols={3}>
      <Stat term="surfaceCarrez" value={formatM2(property.surface_carrez)} />
      <Stat
        label="Pièces"
        value={
          property.rooms
            ? `${property.rooms}${property.bedrooms ? ` · ${property.bedrooms} ch.` : ""}`
            : "—"
        }
      />
      <Stat
        label="Étage"
        value={
          property.floor !== null
            ? `${property.floor} / ${property.floors_total ?? "?"}`
            : "—"
        }
        hint={property.has_elevator === null ? undefined : property.has_elevator ? "ascenseur" : "sans ascenseur"}
      />
      <Stat
        term="dpe"
        value={property.dpe_letter ?? "—"}
        tone={toneDpe(property.dpe_letter)}
      />
      <Stat
        label="Charges de copropriété"
        value={formatEUR(property.monthly_copro_charges)}
        hint="par mois"
      />
      <Stat label="Travaux estimés" value={formatEUR(property.works_estimate)} />
    </StatGrid>
  );

  return (
    <Panel>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="t-head text-text">Le bien</h2>
        <SourceTag kind="vous" />
      </div>

      {essentiels}

      {mode === "complet" && (
        <div className="mt-8">
          <Disclosure
            title="Localisation et type"
            summary={[property.city, property.property_type].filter(Boolean).join(" · ")}
          >
            <dl>
              <Field label="Adresse" value={property.address ?? "—"} />
              <Field label="Ville" value={property.city ?? "—"} />
              <Field label="Code postal" value={property.postal_code ?? "—"} />
              <Field label="Type de bien" value={property.property_type ?? "—"} />
              <Field label="Année de construction" value={property.year_built ?? "—"} />
              <Field label="État général" value={property.condition ?? "—"} />
              <Field label="Exposition" value={property.exposure ?? "—"} />
              <Field label="Meublé" value={yesNo(property.furnished)} />
            </dl>
          </Disclosure>

          <Disclosure
            title="Annexes et extérieurs"
            summary={
              [
                property.has_balcony && "balcon",
                property.has_terrace && "terrasse",
                property.has_parking && "parking",
                property.has_cave && "cave",
              ]
                .filter(Boolean)
                .join(", ") || "aucune"
            }
          >
            <dl>
              <Field label="Balcon" value={yesNo(property.has_balcony)} />
              <Field label="Terrasse" value={yesNo(property.has_terrace)} />
              <Field
                label="Surface extérieure"
                value={property.outdoor_area ? formatM2(property.outdoor_area) : "—"}
              />
              <Field label="Parking" value={yesNo(property.has_parking)} />
              <Field label="Cave" value={yesNo(property.has_cave)} />
              <Field label="Ascenseur" value={yesNo(property.has_elevator)} />
            </dl>
          </Disclosure>

          <Disclosure
            title="Énergie et coûts de portage"
            summary={`${property.dpe_letter ?? "—"} · ${formatEUR(property.property_tax)} / an`}
          >
            <dl>
              <Field
                term="dpe"
                value={
                  <span style={{ color: toneDpe(property.dpe_letter) }}>
                    {property.dpe_letter ?? "—"}
                  </span>
                }
              />
              <Field label="Émissions (GES)" value={property.ges_letter ?? "—"} />
              <Field
                label="Charges de copropriété"
                value={`${formatEUR(property.monthly_copro_charges)} / mois`}
              />
              <Field
                label="Taxe foncière"
                value={`${formatEUR(property.property_tax)} / an`}
              />
              <Field label="Travaux estimés" value={formatEUR(property.works_estimate)} />
            </dl>
          </Disclosure>
        </div>
      )}
    </Panel>
  );
}
