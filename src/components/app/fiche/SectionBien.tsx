"use client";

import { formatEUR, formatM2 } from "@/lib/format";
import { Panel } from "@/components/ui/Panel";
import { StatGrid, SourceTag } from "@/components/ui/Stat";
import { Editable } from "@/components/ui/Editable";
import { Disclosure } from "@/components/ui/Disclosure";
import { toneDpe } from "@/lib/tone";
import { updatePropertyField, type ChampModifiable } from "@/app/(app)/app/p/[projectId]/bien/[propertyId]/property-actions";
import type { PropertyRow } from "@/lib/property-detail-types";
import type { FicheMode } from "@/components/app/fiche/FicheShell";

/** Un booléen se saisit par un choix explicite, jamais par une case à cocher
 *  à trois états : « Oui / Non / on ne sait pas » doit se lire, pas se deviner. */
const OUI_NON = [
  { valeur: "true", libelle: "Oui" },
  { valeur: "false", libelle: "Non" },
];

const DPE = ["A", "B", "C", "D", "E", "F", "G"].map((l) => ({ valeur: l, libelle: l }));

const ETATS = ["Refait à neuf", "Bon état", "À rafraîchir", "À rénover"].map((l) => ({
  valeur: l,
  libelle: l,
}));

function libelleBool(v: boolean | null): string {
  if (v === null) return "—";
  return v ? "Oui" : "Non";
}

/**
 * LE BIEN.
 *
 * Chaque valeur est modifiable là où elle se lit. Il n'y a pas de mode
 * « édition » à activer : le champ au repos ressemble à une statistique, et
 * s'ouvre au clic ou au clavier. `Entrée` valide, `Échap` annule, et chaque
 * enregistrement propose une annulation qui porte l'ancienne valeur.
 *
 * En mode Simple : six caractéristiques, celles qui décident d'une visite.
 * En mode Complet : tous les champs, rangés en replis nommés à résumé visible.
 */
export function SectionBien({
  property,
  projectId,
  mode,
}: {
  property: PropertyRow;
  projectId: string;
  mode: FicheMode;
}) {
  /** Un seul point d'écriture pour toute la section. */
  function enregistrer(champ: ChampModifiable) {
    return (v: string | number | null) =>
      updatePropertyField(property.id, projectId, champ, v);
  }

  /** Les booléens transitent en texte dans le `<select>` ; on les reconvertit ici. */
  function enregistrerBool(champ: ChampModifiable) {
    return (v: string | number | null) =>
      updatePropertyField(property.id, projectId, champ, v === null ? null : v === "true");
  }

  return (
    <Panel>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="t-head text-text">Le bien</h2>
        <SourceTag kind="vous" />
      </div>

      <StatGrid cols={3}>
        <Editable
          term="surfaceCarrez"
          value={property.surface_carrez}
          display={formatM2(property.surface_carrez)}
          kind="nombre"
          unit="m²"
          onSave={enregistrer("surface_carrez")}
        />
        <Editable
          label="Pièces"
          value={property.rooms}
          display={
            property.rooms
              ? `${property.rooms}${property.bedrooms ? ` · ${property.bedrooms} ch.` : ""}`
              : undefined
          }
          kind="nombre"
          onSave={enregistrer("rooms")}
        />
        <Editable
          label="Étage"
          value={property.floor}
          display={
            property.floor !== null
              ? `${property.floor} / ${property.floors_total ?? "?"}`
              : undefined
          }
          kind="nombre"
          hint={
            property.has_elevator === null
              ? undefined
              : property.has_elevator
                ? "ascenseur"
                : "sans ascenseur"
          }
          onSave={enregistrer("floor")}
        />
        <Editable
          term="dpe"
          value={property.dpe_letter}
          kind="choix"
          options={DPE}
          tone={toneDpe(property.dpe_letter)}
          onSave={enregistrer("dpe_letter")}
        />
        <Editable
          label="Charges de copropriété"
          value={property.monthly_copro_charges}
          display={formatEUR(property.monthly_copro_charges)}
          kind="nombre"
          unit="€"
          hint="par mois"
          onSave={enregistrer("monthly_copro_charges")}
        />
        <Editable
          label="Travaux estimés"
          value={property.works_estimate}
          display={formatEUR(property.works_estimate)}
          kind="nombre"
          unit="€"
          onSave={enregistrer("works_estimate")}
        />
      </StatGrid>

      {mode === "complet" && (
        <div className="mt-8">
          <Disclosure
            title="Localisation et type"
            summary={[property.city, property.property_type].filter(Boolean).join(" · ")}
          >
            <dl>
              <Editable layout="row" label="Adresse" value={property.address} onSave={enregistrer("address")} />
              <Editable layout="row" label="Complément d'adresse" value={property.address_extra} onSave={enregistrer("address_extra")} />
              <Editable layout="row" label="Ville" value={property.city} onSave={enregistrer("city")} />
              <Editable layout="row" label="Code postal" value={property.postal_code} onSave={enregistrer("postal_code")} />
              <Editable layout="row" label="Type de bien" value={property.property_type} onSave={enregistrer("property_type")} />
              <Editable layout="row" label="Année de construction" value={property.year_built} kind="nombre" onSave={enregistrer("year_built")} />
              <Editable layout="row" label="État général" value={property.condition} kind="choix" options={ETATS} onSave={enregistrer("condition")} />
              <Editable layout="row" label="Exposition" value={property.exposure} onSave={enregistrer("exposure")} />
              <Editable
                layout="row"
                label="Meublé"
                value={property.furnished === null ? null : String(property.furnished)}
                display={libelleBool(property.furnished)}
                kind="choix"
                options={OUI_NON}
                onSave={enregistrerBool("furnished")}
              />
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
              {(
                [
                  ["Balcon", "has_balcony", property.has_balcony],
                  ["Terrasse", "has_terrace", property.has_terrace],
                  ["Parking", "has_parking", property.has_parking],
                  ["Cave", "has_cave", property.has_cave],
                  ["Ascenseur", "has_elevator", property.has_elevator],
                ] as const
              ).map(([libelle, champ, valeur]) => (
                <Editable
                  key={champ}
                  layout="row"
                  label={libelle}
                  value={valeur === null ? null : String(valeur)}
                  display={libelleBool(valeur)}
                  kind="choix"
                  options={OUI_NON}
                  onSave={enregistrerBool(champ)}
                />
              ))}
              <Editable
                layout="row"
                label="Surface extérieure"
                value={property.outdoor_area}
                display={property.outdoor_area ? formatM2(property.outdoor_area) : undefined}
                kind="nombre"
                unit="m²"
                onSave={enregistrer("outdoor_area")}
              />
            </dl>
          </Disclosure>

          <Disclosure
            title="Énergie et coûts de portage"
            summary={`${property.dpe_letter ?? "—"} · ${formatEUR(property.property_tax)} / an`}
          >
            <dl>
              <Editable
                layout="row"
                term="dpe"
                value={property.dpe_letter}
                kind="choix"
                options={DPE}
                tone={toneDpe(property.dpe_letter)}
                onSave={enregistrer("dpe_letter")}
              />
              <Editable
                layout="row"
                label="Émissions (GES)"
                value={property.ges_letter}
                kind="choix"
                options={DPE}
                onSave={enregistrer("ges_letter")}
              />
              <Editable
                layout="row"
                label="Charges de copropriété"
                value={property.monthly_copro_charges}
                display={`${formatEUR(property.monthly_copro_charges)} / mois`}
                kind="nombre"
                unit="€"
                onSave={enregistrer("monthly_copro_charges")}
              />
              <Editable
                layout="row"
                label="Taxe foncière"
                value={property.property_tax}
                display={`${formatEUR(property.property_tax)} / an`}
                kind="nombre"
                unit="€"
                onSave={enregistrer("property_tax")}
              />
              <Editable
                layout="row"
                label="Travaux estimés"
                value={property.works_estimate}
                display={formatEUR(property.works_estimate)}
                kind="nombre"
                unit="€"
                onSave={enregistrer("works_estimate")}
              />
            </dl>
          </Disclosure>
        </div>
      )}
    </Panel>
  );
}
