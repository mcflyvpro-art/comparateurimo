import { formatEUR } from "@/lib/format";
import { Panel } from "@/components/ui/Panel";
import { Stat, StatGrid, SourceTag } from "@/components/ui/Stat";
import { Disclosure } from "@/components/ui/Disclosure";
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

/**
 * Votre suivi — la moitié du dossier qui ne se calcule pas.
 *
 * Les chiffres se recalculent à chaque ouverture ; ce bloc, non. C'est votre
 * mémoire : le prix plancher lâché au téléphone, la raison de l'hésitation, la
 * photo de la fissure. C'est ce qui fait qu'on ne réanalyse jamais deux fois le
 * même bien — et ce qu'aucun agrégateur ne détient.
 *
 * Les photos restent visibles, les documents se déplient : on regarde des
 * photos, on consulte des documents.
 */
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
  const hasContext = property.max_price !== null || contact !== null;

  return (
    <Panel>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="t-head text-text">Votre suivi</h2>
        <SourceTag kind="vous" />
      </div>

      {hasContext && (
        <StatGrid cols={3} className="mb-8">
          {property.max_price !== null && (
            <Stat label="Votre prix maximum" value={formatEUR(property.max_price)} />
          )}
          {contact && (
            <Stat
              label="Interlocuteur"
              value={contact.name}
              hint={CONTACT_KIND_LABELS[contact.kind]}
            />
          )}
          {contact?.phone && <Stat label="Téléphone" value={contact.phone} />}
        </StatGrid>
      )}

      {property.status === "ecarte" && property.discard_reason && (
        <div className="mb-8 rounded-sm bg-raised px-4 py-3.5">
          <p className="mb-1.5 text-[12px] text-text-4">Raison de l&apos;écart</p>
          <p className="text-[13.5px] leading-relaxed text-text-2">
            {property.discard_reason}
          </p>
        </div>
      )}

      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-[13px] font-medium text-text-2">Notes</h3>
        {notes.length > 0 && (
          <span className="num text-[11px] text-text-4">{notes.length}</span>
        )}
      </div>

      {notes.length === 0 ? (
        <p className="text-[12.5px] leading-relaxed text-text-4">
          Aucune note. Elles s&apos;ajoutent depuis le panneau du pipeline, en un clic
          sur la carte du bien.
        </p>
      ) : (
        <ol className="flex flex-col gap-4">
          {notes.map((note) => (
            <li key={note.id}>
              <p className="text-[13.5px] leading-relaxed text-text-2">{note.body}</p>
              <span className="num mt-1 block text-[11px] text-text-4">
                {new Date(note.created_at).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </li>
          ))}
        </ol>
      )}

      <div className="mt-8">
        <div className="mb-3 flex items-baseline justify-between">
          <h3 className="text-[13px] font-medium text-text-2">Photos</h3>
          {photos.length > 0 && (
            <span className="num text-[11px] text-text-4">{photos.length}</span>
          )}
        </div>
        <PhotoGrid propertyId={propertyId} initialPhotos={photos} />
      </div>

      <div className="mt-8">
        <Disclosure
          title="Documents"
          summary={
            documents.length > 0
              ? `${documents.length} pièce${documents.length > 1 ? "s" : ""}`
              : "aucun"
          }
        >
          <DocumentList propertyId={propertyId} initialDocuments={documents} />
        </Disclosure>
      </div>
    </Panel>
  );
}
