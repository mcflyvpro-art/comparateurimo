import { formatEUR, formatM2 } from "@/lib/format";
import { SectionCard } from "@/components/app/fiche/SectionCard";
import type { PropertyRow } from "@/lib/property-detail-types";

function yesNo(value: boolean | null): string {
  if (value === null) return "—";
  return value ? "Oui" : "Non";
}

export function SectionBien({ property }: { property: PropertyRow }) {
  return (
    <SectionCard number="②" title="Le bien">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
        <Field label="Adresse" value={property.address ?? "—"} />
        <Field label="Ville" value={property.city ?? "—"} />
        <Field label="Code postal" value={property.postal_code ?? "—"} />
        <Field label="Type de bien" value={property.property_type ?? "—"} />
        <Field label="Surface" value={formatM2(property.surface_carrez)} />
        <Field label="Pièces" value={property.rooms?.toString() ?? "—"} />
        <Field label="Chambres" value={property.bedrooms?.toString() ?? "—"} />
        <Field label="Étage" value={property.floor !== null ? `${property.floor} / ${property.floors_total ?? "?"}` : "—"} />
        <Field label="Ascenseur" value={yesNo(property.has_elevator)} />
        <Field label="Année construction" value={property.year_built?.toString() ?? "—"} />
        <Field label="État" value={property.condition ?? "—"} />
        <Field label="DPE" value={property.dpe_letter ?? "—"} />
        <Field label="GES" value={property.ges_letter ?? "—"} />
        <Field label="Exposition" value={property.exposure ?? "—"} />
        <Field label="Balcon" value={yesNo(property.has_balcony)} />
        <Field label="Terrasse" value={yesNo(property.has_terrace)} />
        <Field label="Extérieur" value={property.outdoor_area ? formatM2(property.outdoor_area) : "—"} />
        <Field label="Parking" value={yesNo(property.has_parking)} />
        <Field label="Cave" value={yesNo(property.has_cave)} />
        <Field label="Meublé" value={yesNo(property.furnished)} />
        <Field label="Charges copro / mois" value={formatEUR(property.monthly_copro_charges)} />
        <Field label="Taxe foncière / an" value={formatEUR(property.property_tax)} />
        <Field label="Travaux estimés" value={formatEUR(property.works_estimate)} />
      </dl>
    </SectionCard>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-faint">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-text">{value}</dd>
    </div>
  );
}
