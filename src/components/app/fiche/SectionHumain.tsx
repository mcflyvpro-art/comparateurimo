"use client";

import { formatEUR } from "@/lib/format";
import { SectionCard } from "@/components/app/fiche/SectionCard";
import { PhotoGrid } from "@/components/app/fiche/PhotoGrid";
import { DocumentList } from "@/components/app/fiche/DocumentList";
import type {
  ContactRow,
  PropertyDetailDocumentWithUrl,
  PropertyDetailNote,
  PropertyDetailPhotoWithUrl,
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
  propertyId,
}: {
  property: PropertyRow;
  contact: ContactRow | null;
  notes: PropertyDetailNote[];
  photos: PropertyDetailPhotoWithUrl[];
  documents: PropertyDetailDocumentWithUrl[];
  propertyId: string;
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

      <div className="mt-5">
        <h3 className="mb-2 text-xs uppercase tracking-wide text-faint">Photos</h3>
        <PhotoGrid propertyId={propertyId} initialPhotos={photos} />
      </div>

      <div className="mt-5">
        <h3 className="mb-2 text-xs uppercase tracking-wide text-faint">Documents</h3>
        <DocumentList propertyId={propertyId} initialDocuments={documents} />
      </div>
    </SectionCard>
  );
}
