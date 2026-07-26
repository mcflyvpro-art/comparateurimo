/** Limites d'upload photos/documents (Plan 5c), calculées contre le quota
 *  gratuit Supabase Storage : 1 Go PAR PROJET, partagé entre tous les
 *  utilisateurs confondus (pas 1 Go par utilisateur). Vérifiées côté client
 *  (retour immédiat) ET côté serveur (défense en profondeur, jamais
 *  confiance au client). */
export const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;
export const MAX_PHOTOS_PER_PROPERTY = 20;
export const MAX_DOCUMENTS_PER_PROPERTY = 10;

export const ACCEPTED_PHOTO_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const ACCEPTED_DOCUMENT_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"] as const;

/** Options de compression transparente (avant upload, côté navigateur) —
 *  voir `use-file-upload.ts`. Cible ~1-2 Mo par photo quelle que soit la
 *  taille d'origine, aucune action de l'utilisateur. */
export const PHOTO_COMPRESSION_OPTIONS = {
  maxSizeMB: 1.5,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
} as const;

export type DocType = "diagnostic" | "compromis" | "plan" | "autre";

export const DOC_TYPE_OPTIONS: { value: DocType; label: string }[] = [
  { value: "diagnostic", label: "Diagnostic" },
  { value: "compromis", label: "Compromis" },
  { value: "plan", label: "Plan" },
  { value: "autre", label: "Autre" },
];

export function isAcceptedPhotoType(mimeType: string): boolean {
  return (ACCEPTED_PHOTO_MIME_TYPES as readonly string[]).includes(mimeType);
}

export function isAcceptedDocumentType(mimeType: string): boolean {
  return (ACCEPTED_DOCUMENT_MIME_TYPES as readonly string[]).includes(mimeType);
}
