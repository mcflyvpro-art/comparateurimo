"use client";

import { useCallback, useState } from "react";
import imageCompression from "browser-image-compression";
import { MAX_FILE_SIZE_BYTES, PHOTO_COMPRESSION_OPTIONS } from "@/lib/file-limits";

export type FileUploadStatus = "idle" | "compressing" | "uploading" | "error";

/**
 * Compresse (si demandé et si l'image) puis délègue l'upload de chaque
 * fichier à `handler`, un par un, dans l'ordre. Le hook ne connaît ni
 * Supabase ni le type de ressource (photo/document) — `handler` est fourni
 * par l'appelant (une Server Action encapsulée). S'arrête au premier échec :
 * les fichiers déjà envoyés avec succès avant l'échec restent acquis (le
 * composant appelant les a déjà ajoutés à son état local via `handler`).
 */
export function useFileUpload(): {
  status: FileUploadStatus;
  error: string | null;
  uploadFiles: (files: File[], handler: (file: File) => Promise<void>, compress: boolean) => Promise<void>;
} {
  const [status, setStatus] = useState<FileUploadStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const uploadFiles = useCallback(
    async (files: File[], handler: (file: File) => Promise<void>, compress: boolean) => {
      setError(null);
      for (const file of files) {
        // Fast-path : fichier non compressible (ex. document) déjà trop
        // volumineux — inutile de tenter l'upload.
        if (file.size > MAX_FILE_SIZE_BYTES && !compress) {
          setStatus("error");
          setError(`"${file.name}" dépasse la taille maximale autorisée (8 Mo).`);
          return;
        }
        try {
          let toUpload = file;
          if (compress && file.type.startsWith("image/")) {
            setStatus("compressing");
            toUpload = await imageCompression(file, PHOTO_COMPRESSION_OPTIONS);
          }
          if (toUpload.size > MAX_FILE_SIZE_BYTES) {
            setStatus("error");
            setError(`"${file.name}" reste trop volumineux même après compression.`);
            return;
          }
          setStatus("uploading");
          await handler(toUpload);
        } catch (err) {
          setStatus("error");
          setError(err instanceof Error ? err.message : `Échec de l'envoi de "${file.name}".`);
          return;
        }
      }
      setStatus("idle");
    },
    [],
  );

  return { status, error, uploadFiles };
}
