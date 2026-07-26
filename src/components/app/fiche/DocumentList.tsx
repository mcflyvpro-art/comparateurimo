"use client";

import { useState } from "react";
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
import type { PropertyDetailDocumentWithUrl } from "@/lib/property-detail-types";

/** Icône par type — fait main (pas de lib d'icônes), un simple glyphe/emoji
 *  reconnaissable. `doc_type` étant du texte libre en base (pas un enum
 *  Supabase), une valeur inconnue retombe sur l'icône générique. */
const DOC_TYPE_ICON: Record<string, string> = {
  diagnostic: "🩺",
  compromis: "📝",
  plan: "📐",
  autre: "📄",
};

export function DocumentList({
  propertyId,
  initialDocuments,
}: {
  propertyId: string;
  initialDocuments: PropertyDetailDocumentWithUrl[];
}) {
  const [documents, setDocuments] = useState<PropertyDetailDocumentWithUrl[]>(initialDocuments);
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
    setDocuments((current) => current.map((d) => (d.id === documentId ? { ...d, doc_type: docType } : d)));
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
        disabledMessage={`Limite de ${MAX_DOCUMENTS_PER_PROPERTY} documents atteinte.`}
        label="Glisse des documents ici ou clique pour en choisir."
        onFilesSelected={handleFilesSelected}
      />
      {status === "uploading" && <p className="mt-2 text-xs text-faint">Envoi…</p>}
      {validationError && <p className="mt-2 text-xs text-score-mid">{validationError}</p>}
      {error && <p className="mt-2 text-xs text-score-low">{error}</p>}

      {documents.length > 0 && (
        <ul className="mt-3 space-y-2">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-bg p-3 text-sm text-text"
            >
              <span className="text-lg">{DOC_TYPE_ICON[doc.doc_type] ?? "📄"}</span>
              <span className="min-w-0 flex-1 truncate">{doc.filename}</span>
              <select
                value={doc.doc_type}
                onChange={(e) => handleTypeChange(doc.id, e.target.value as DocType)}
                className="rounded-lg border border-border bg-bg px-2 py-1 text-xs text-text"
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
                className="rounded-full border border-border-strong px-2.5 py-1 text-xs text-text transition-colors hover:border-brand"
              >
                Télécharger
              </a>
              <button
                type="button"
                onClick={() => handleDeleteClick(doc.id, doc.storage_path)}
                className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                  pendingDeleteId === doc.id
                    ? "border-score-low bg-score-low/10 text-score-low"
                    : "border-border-strong text-faint hover:border-score-low hover:text-score-low"
                }`}
              >
                {pendingDeleteId === doc.id ? "Confirmer ?" : "Supprimer"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
