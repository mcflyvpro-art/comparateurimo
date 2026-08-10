"use client";

import { useState, type ReactNode } from "react";
import { FileDropzone } from "@/components/app/fiche/FileDropzone";
import { useConfirmDelete } from "@/lib/hooks/use-confirm-delete";
import { useFileUpload } from "@/lib/hooks/use-file-upload";
import {
  ACCEPTED_DOCUMENT_MIME_TYPES,
  DOC_TYPE_OPTIONS,
  MAX_DOCUMENTS_PER_PROPERTY,
  isAcceptedDocumentType,
  type DocType,
} from "@/lib/file-limits";
import {
  deletePropertyDocument,
  updateDocumentType,
  uploadPropertyDocument,
} from "@/app/(app)/app/p/[projectId]/bien/[propertyId]/actions";
import { IconDownload, IconGauge, IconLayers, IconNote, IconTrash } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";
import type { PropertyDetailDocumentWithUrl } from "@/lib/property-detail-types";

/**
 * Pièces du dossier. Aucun émoji : chaque type porte un pictogramme du jeu
 * maison, tracé au même trait que le reste de l'interface. `doc_type` étant du
 * texte libre en base, une valeur inconnue retombe sur l'icône générique.
 */
const DOC_TYPE_ICON: Record<string, ReactNode> = {
  diagnostic: <IconGauge size={15} />,
  compromis: <IconNote size={15} />,
  plan: <IconLayers size={15} />,
  autre: <IconNote size={15} />,
};

export function DocumentList({
  propertyId,
  initialDocuments,
}: {
  propertyId: string;
  initialDocuments: PropertyDetailDocumentWithUrl[];
}) {
  const [documents, setDocuments] =
    useState<PropertyDetailDocumentWithUrl[]>(initialDocuments);
  const { pendingId: pendingDeleteId, requestConfirm } = useConfirmDelete();
  const [validationError, setValidationError] = useState<string | null>(null);
  const { status, error, uploadFiles } = useFileUpload();

  const atLimit = documents.length >= MAX_DOCUMENTS_PER_PROPERTY;

  async function handleFilesSelected(files: File[]) {
    const validFiles = files.filter((f) => isAcceptedDocumentType(f.type));
    setValidationError(
      validFiles.length < files.length
        ? "Certains fichiers ont été ignorés (formats acceptés : PDF, JPG, PNG)."
        : null,
    );
    const remainingSlots = MAX_DOCUMENTS_PER_PROPERTY - documents.length;
    const filesToUpload = validFiles.slice(0, Math.max(0, remainingSlots));
    if (filesToUpload.length === 0) return;

    await uploadFiles(
      filesToUpload,
      async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("docType", "autre");
        const uploaded = await uploadPropertyDocument(propertyId, formData);
        const previewUrl = URL.createObjectURL(file);
        setDocuments((current) => [...current, { ...uploaded, signedUrl: previewUrl }]);
      },
      false,
    );
  }

  function handleTypeChange(documentId: string, docType: DocType) {
    setDocuments((current) =>
      current.map((d) => (d.id === documentId ? { ...d, doc_type: docType } : d)),
    );
    updateDocumentType(documentId, propertyId, docType).catch(() => {});
  }

  function handleDeleteClick(documentId: string, storagePath: string) {
    if (!requestConfirm(documentId)) return;
    setDocuments((current) => current.filter((d) => d.id !== documentId));
    deletePropertyDocument(propertyId, documentId, storagePath).catch(() => {});
  }

  return (
    <div>
      <FileDropzone
        accept={ACCEPTED_DOCUMENT_MIME_TYPES.join(",")}
        disabled={atLimit}
        disabledMessage={`Limite de ${MAX_DOCUMENTS_PER_PROPERTY} documents atteinte`}
        label="Déposez des documents, ou cliquez pour les choisir"
        onFilesSelected={handleFilesSelected}
      />

      {(status === "uploading" || validationError || error) && (
        <div className="mt-2 flex flex-col gap-1">
          {status === "uploading" && <p className="text-[11px] text-text-4">Envoi…</p>}
          {validationError && <p className="text-[11px] text-danger">{validationError}</p>}
          {error && <p className="text-[11px] text-danger">{error}</p>}
        </div>
      )}

      {documents.length > 0 && (
        <ul className="mt-3 overflow-hidden rounded-md border border-line-soft">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="group flex items-center gap-3 border-b border-line-soft px-3 py-2.5 transition-colors last:border-0 hover:bg-surface-hover"
            >
              <span className="shrink-0 text-text-3">
                {DOC_TYPE_ICON[doc.doc_type] ?? DOC_TYPE_ICON.autre}
              </span>

              <span className="min-w-0 flex-1 truncate text-[13px] text-text">
                {doc.filename}
              </span>

              <select
                value={doc.doc_type}
                onChange={(e) => handleTypeChange(doc.id, e.target.value as DocType)}
                aria-label="Type de document"
                className="shrink-0 cursor-pointer rounded-sm border border-line bg-sunken px-2 py-1 text-[11px] text-text-2 outline-none transition-colors hover:border-line-strong focus:border-accent"
              >
                {DOC_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <a
                href={doc.signedUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Télécharger ${doc.filename}`}
                className="shrink-0 rounded-sm p-1.5 text-text-4 opacity-0 transition-all duration-[140ms] hover:text-text group-hover:opacity-100 focus-visible:opacity-100"
              >
                <IconDownload size={14} />
              </a>

              <button
                type="button"
                onClick={() => handleDeleteClick(doc.id, doc.storage_path)}
                aria-label={
                  pendingDeleteId === doc.id
                    ? "Confirmer la suppression"
                    : `Supprimer ${doc.filename}`
                }
                className={cx(
                  "flex shrink-0 items-center gap-1 rounded-sm px-1.5 py-1 text-[10px] transition-all duration-[140ms]",
                  pendingDeleteId === doc.id
                    ? "bg-[var(--danger-soft)] text-danger opacity-100"
                    : "text-text-4 opacity-0 hover:text-danger group-hover:opacity-100 focus-visible:opacity-100",
                )}
              >
                <IconTrash size={14} />
                {pendingDeleteId === doc.id && "Confirmer"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
