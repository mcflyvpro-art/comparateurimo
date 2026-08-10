import { Panel } from "@/components/ui/Panel";
import { Stat, StatGrid, SourceTag } from "@/components/ui/Stat";
import { Disclosure } from "@/components/ui/Disclosure";
import { PhotoGrid } from "@/components/app/fiche/PhotoGrid";
import { DocumentList } from "@/components/app/fiche/DocumentList";
import { NoteList } from "@/components/app/NoteList";
import { PrixMaximum } from "@/components/app/fiche/PrixMaximum";
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
  projectId,
}: {
  property: PropertyRow;
  contact: ContactRow | null;
  notes: PropertyDetailNote[];
  photos: PropertyDetailPhotoWithUrl[];
  documents: PropertyDetailDocumentWithUrl[];
  propertyId: string;
  projectId: string;
}) {
  return (
    <Panel>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="t-head text-text">Votre suivi</h2>
        <SourceTag kind="vous" />
      </div>

      {/* Le prix maximum s'affichait sans jamais pouvoir être saisi — alors que
          c'est le chiffre qu'on ajuste le plus souvent en avançant. Il est
          désormais toujours visible, même vide : un champ absent ne se remplit
          jamais. */}
      <StatGrid cols={3} className="mb-8">
        <PrixMaximum
          propertyId={propertyId}
          projectId={projectId}
          valeur={property.max_price}
          prixAffiche={property.asking_price}
        />
        {contact && (
          <Stat
            label="Interlocuteur"
            value={contact.name}
            hint={CONTACT_KIND_LABELS[contact.kind]}
          />
        )}
        {contact?.phone && <Stat label="Téléphone" value={contact.phone} />}
      </StatGrid>

      {property.status === "ecarte" && property.discard_reason && (
        <div className="mb-8 rounded-sm bg-surface-hover px-4 py-3.5">
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

      {/* Les notes s'ajoutaient uniquement depuis le panneau du board, et la
          fiche se contentait de les afficher. On écrit surtout ses notes ICI,
          en relisant le dossier : c'est là qu'il faut pouvoir les corriger. */}
      <NoteList propertyId={propertyId} notes={notes} />

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
