import { formatEUR } from "@/lib/format";
import { SectionCard } from "@/components/app/fiche/SectionCard";
import type {
  ContactRow,
  PropertyDetailDocument,
  PropertyDetailNote,
  PropertyDetailPhoto,
  PropertyRow,
} from "@/lib/property-detail-types";

const CONTACT_KIND_LABELS: Record<ContactRow["kind"], string> = {
  agent: "Agent immobilier",
  mandataire: "Mandataire",
  particulier: "Particulier",
  notaire: "Notaire",
  autre: "Autre",
};

export function SectionHumain({
  property,
  contact,
  notes,
  photos,
  documents,
}: {
  property: PropertyRow;
  contact: ContactRow | null;
  notes: PropertyDetailNote[];
  photos: PropertyDetailPhoto[];
  documents: PropertyDetailDocument[];
}) {
  return (
    <SectionCard number="⑨" title="Contexte humain">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
        <div>
          <dt className="text-xs text-faint">Prix max</dt>
          <dd className="mt-0.5 text-sm font-medium text-text">{formatEUR(property.max_price)}</dd>
        </div>
        {contact && (
          <>
            <div>
              <dt className="text-xs text-faint">Contact</dt>
              <dd className="mt-0.5 text-sm font-medium text-text">
                {contact.name} · {CONTACT_KIND_LABELS[contact.kind]}
              </dd>
            </div>
            {contact.phone && (
              <div>
                <dt className="text-xs text-faint">Téléphone</dt>
                <dd className="mt-0.5 text-sm font-medium text-text">{contact.phone}</dd>
              </div>
            )}
          </>
        )}
        {property.status === "ecarte" && property.discard_reason && (
          <div className="col-span-full">
            <dt className="text-xs text-faint">Raison de l&apos;écart</dt>
            <dd className="mt-0.5 text-sm font-medium text-text">{property.discard_reason}</dd>
          </div>
        )}
      </dl>

      <div className="mt-5">
        <h3 className="mb-2 text-xs uppercase tracking-wide text-faint">Notes</h3>
        {notes.length === 0 ? (
          <p className="text-sm text-faint">Aucune note pour l&apos;instant.</p>
        ) : (
          <ul className="space-y-2">
            {notes.map((note) => (
              <li key={note.id} className="rounded-xl border border-border bg-bg p-3 text-sm text-text">
                {note.body}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div
          title="Ajout de photos — arrive au Plan 5c"
          className="flex min-h-24 cursor-not-allowed items-center justify-center rounded-xl border border-dashed border-border-strong text-center text-xs text-faint"
        >
          {photos.length === 0
            ? "Aucune photo — l'ajout de photos arrive au Plan 5c."
            : `${photos.length} photo(s)`}
        </div>
        <div
          title="Ajout de documents — arrive au Plan 5c"
          className="flex min-h-24 cursor-not-allowed items-center justify-center rounded-xl border border-dashed border-border-strong text-center text-xs text-faint"
        >
          {documents.length === 0
            ? "Aucun document — l'ajout de documents arrive au Plan 5c."
            : `${documents.length} document(s)`}
        </div>
      </div>
    </SectionCard>
  );
}
