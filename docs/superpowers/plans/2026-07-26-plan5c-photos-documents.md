# Plan 5c — Photos & Documents (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer les deux placeholders grisés de la section ⑨ Contexte humain (« l'ajout de photos/documents arrive au Plan 5c ») par un vrai upload multi-fichiers (glisser-déposer ou sélecteur), avec compression automatique des images, grille de photos réorganisable + légende + lightbox plein écran, et liste de documents typés avec téléchargement.

**Architecture:** Deux Server Actions par ressource (upload/suppression, + réorganisation et légende pour les photos, + changement de type pour les documents) ajoutées au fichier `actions.ts` existant de la route (créé au Plan 5b). Les fichiers sont stockés dans les buckets privés Supabase Storage déjà créés au Plan 1 (`property-photos`/`property-documents`) sous `${DEMO_USER_ID}/${propertyId}/${uuid}-${nom}`. `page.tsx` (Server Component) génère des URLs signées (1h) pour tout fichier déjà en base à chaque chargement ; un fichier tout juste uploadé s'affiche immédiatement via une URL locale (`URL.createObjectURL`) sans attendre de round-trip. Compression d'image côté navigateur via `browser-image-compression` (nouvelle dépendance, exception validée comme `@dnd-kit`), réorganisation des photos via `@dnd-kit/sortable` (déjà utilisé au Plan 3) + `computeDropPosition` (`board-position.ts`, réutilisé tel quel).

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Supabase Storage. Nouvelle dépendance npm : `browser-image-compression` (MIT, ~50 Ko).

## Global Constraints

- **Spec de référence :** `docs/superpowers/specs/2026-07-26-plan5c-photos-documents-design.md`, validée par l'utilisateur. En cas de doute sur une valeur, cette spec fait foi.
- **Aucun framework de test dans ce repo.** Vérification de chaque tâche = `npx tsc --noEmit`, puis `npm run build` + `npm run lint` en fin de plan (doivent rester verts) + vérification manuelle via `npm run dev`. **Ne jamais écrire de test unitaire.**
- **Limites (calculées contre le quota gratuit Supabase : 1 Go de stockage PAR PROJET, partagé entre tous les utilisateurs, pas par utilisateur) :** 8 Mo par fichier (après compression pour les images), 20 photos par bien, 10 documents par bien. Types acceptés — photos : JPG/PNG/WEBP. Types acceptés — documents : PDF/JPG/PNG. Ces limites sont vérifiées **côté client** (retour immédiat) **et côté serveur** (défense en profondeur, jamais confiance au client).
- **Compression d'image transparente** : chaque image passe par `browser-image-compression` avant l'upload (`maxSizeMB: 1.5`, `maxWidthOrHeight: 1920`, `useWebWorker: true`) — aucune action de l'utilisateur, juste un indicateur textuel « Compression… » / « Envoi… ».
- **Accès données** : `getDemoClient()` (`@/lib/supabase/demo`) + filtre explicite `user_id = DEMO_USER_ID`, `property_id` sur toutes les lectures/écritures ciblées. Pas d'auth réelle (Phase 5).
- **Buckets Storage privés** (posés au Plan 1, `property-photos`/`property-documents`, `public: false`) : aucune URL publique directe, toujours passer par une URL signée (`createSignedUrl`, validité 1h) générée côté serveur.
- **Chemin de stockage** : `${DEMO_USER_ID}/${propertyId}/${uuid}-${nomFichierOriginal}` — cohérent avec la policy RLS Storage déjà posée (`(storage.foldername(name))[1] = auth.uid()`), même si le client démo (service role) la contourne aujourd'hui.
- **Identité = dark grotesk** des tokens existants : `bg-bg`, `bg-bg-alt`, `text-text`, `text-muted`, `text-faint`, `text-brand`/`accent-brand`, `border-border`/`border-border-strong`, `text-score-{high,mid,low}`. Aucune couleur hors tokens.
- **Pas de lib d'icônes** : icônes par type de document faites main (emoji ou glyphe simple, pas de lib externe). `@dnd-kit` (déjà installé) et `browser-image-compression` (ajoutée par ce plan) restent les deux seules exceptions lib UI/upload validées.
- **`<img>` natif accepté avec `eslint-disable-next-line @next/next/no-img-element`** (pas `next/image`) : les URLs signées expirent et changent de query string à chaque chargement, `next/image` ajouterait une complexité de configuration (`remotePatterns`) sans bénéfice réel ici.
- **Suppression = confirmation légère** (pas de modale bloquante comme le board) : un premier clic sur « Supprimer » transforme le bouton en « Confirmer ? » pendant 3 secondes, un second clic dans cette fenêtre supprime réellement.
- **Réorganisation des photos** : réutilise `computeDropPosition` (`src/lib/board-position.ts`) tel quel, même pattern de fractional indexing que `use-property-drawer.ts:86-109` (Plan 3) — un seul élément déplacé, sa nouvelle `sort_order` recalculée, les autres jamais touchés.
- **Hors-scope de ce plan** : migration vers un autre stockage (Cloudflare R2 ou autre — noté pour la Phase 6), extraction automatique de champs depuis un document (capture universelle Grok, système différent), édition/recadrage d'image dans l'app, partage de fichiers entre biens.

---

### Task 1: `src/lib/file-limits.ts` — constantes et helpers partagés

**Files:**
- Create: `src/lib/file-limits.ts`

**Interfaces:**
- Consumes: rien (module autonome, importable côté client et serveur).
- Produces: `MAX_FILE_SIZE_BYTES: number` · `MAX_PHOTOS_PER_PROPERTY: number` · `MAX_DOCUMENTS_PER_PROPERTY: number` · `ACCEPTED_PHOTO_MIME_TYPES: readonly string[]` · `ACCEPTED_DOCUMENT_MIME_TYPES: readonly string[]` · `PHOTO_COMPRESSION_OPTIONS: { maxSizeMB: number; maxWidthOrHeight: number; useWebWorker: boolean }` · `export type DocType = "diagnostic" | "compromis" | "plan" | "autre"` · `DOC_TYPE_OPTIONS: { value: DocType; label: string }[]` · `isAcceptedPhotoType(mimeType: string): boolean` · `isAcceptedDocumentType(mimeType: string): boolean`. Consommé par Tasks 3, 4, 5, 8, 9.

- [ ] **Step 1: Écrire le module**

Fichier `src/lib/file-limits.ts` :

```ts
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
```

- [ ] **Step 2: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur sur `src/lib/file-limits.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/file-limits.ts
git commit -m "feat(fiche): file-limits.ts — constantes et helpers upload photos/documents"
```

---

### Task 2: `property-detail-types.ts` — types avec URL signée

**Files:**
- Modify: `src/lib/property-detail-types.ts`

**Interfaces:**
- Consumes: `PropertyDetailPhoto`, `PropertyDetailDocument` (déjà dans ce fichier, inchangés).
- Produces (ajout) : `export type PropertyDetailPhotoWithUrl = PropertyDetailPhoto & { signedUrl: string }` · `export type PropertyDetailDocumentWithUrl = PropertyDetailDocument & { signedUrl: string }`. Consommé par Tasks 7, 8, 9, 10, 11.

- [ ] **Step 1: Ajouter les deux types**

Dans `src/lib/property-detail-types.ts`, à la fin du fichier (après le type `PropertyDetail` existant), ajouter :

```ts

/**
 * Photo/document avec son URL signée (générée côté serveur, validité 1h,
 * bucket privé — Plan 5c). Un fichier tout juste uploadé reçoit une URL
 * locale temporaire (`URL.createObjectURL`) à la place le temps de la
 * session, voir `PhotoGrid`/`DocumentList`.
 */
export type PropertyDetailPhotoWithUrl = PropertyDetailPhoto & { signedUrl: string };
export type PropertyDetailDocumentWithUrl = PropertyDetailDocument & { signedUrl: string };
```

- [ ] **Step 2: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur sur `src/lib/property-detail-types.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/property-detail-types.ts
git commit -m "feat(fiche): types PropertyDetailPhotoWithUrl/DocumentWithUrl (Plan 5c)"
```

---

### Task 3: Hook `useFileUpload` (compression + état d'upload)

**Files:**
- Create: `src/lib/hooks/use-file-upload.ts`
- Modify: `package.json` (nouvelle dépendance)

**Interfaces:**
- Consumes: `MAX_FILE_SIZE_BYTES`, `PHOTO_COMPRESSION_OPTIONS` (`@/lib/file-limits`, Task 1).
- Produces: `export type FileUploadStatus = "idle" | "compressing" | "uploading" | "error"` et `useFileUpload(): { status: FileUploadStatus; error: string | null; uploadFiles: (files: File[], handler: (file: File) => Promise<void>, compress: boolean) => Promise<void> }`. Consommé par Tasks 8, 9.

- [ ] **Step 1: Installer la dépendance**

Run: `npm install browser-image-compression@2.0.2`
Expected: `package.json`/`package-lock.json` mis à jour, installation réussie.

- [ ] **Step 2: Écrire le hook**

Fichier `src/lib/hooks/use-file-upload.ts` :

```ts
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
```

- [ ] **Step 3: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur sur `src/lib/hooks/use-file-upload.ts`. Si TypeScript ne trouve pas de types pour `browser-image-compression`, vérifier que le module les fournit lui-même (`node_modules/browser-image-compression/dist/*.d.ts`) — c'est le cas pour la version installée, aucune dépendance `@types/*` supplémentaire n'est nécessaire.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/lib/hooks/use-file-upload.ts
git commit -m "feat(fiche): hook useFileUpload — compression transparente + état idle/compressing/uploading/error"
```

---

### Task 4: Server Actions — Photos (upload, suppression, réorganisation, légende)

**Files:**
- Modify: `src/app/(app)/app/p/[projectId]/bien/[propertyId]/actions.ts`

**Interfaces:**
- Consumes: `getDemoClient`, `DEMO_USER_ID` (`@/lib/supabase/demo`), `MAX_PHOTOS_PER_PROPERTY`, `MAX_FILE_SIZE_BYTES`, `isAcceptedPhotoType` (`@/lib/file-limits`, Task 1), `computeDropPosition` n'est PAS utilisé ici (il vit côté client dans Task 8, cette Server Action reçoit directement la `newSortOrder` déjà calculée).
- Produces (ajout, en plus de `ScenarioPatch`/`updatePropertyScenario` déjà présents) : `export type UploadedPhoto = { id: string; storage_path: string; caption: string | null; sort_order: number }` · `uploadPropertyPhoto(propertyId: string, formData: FormData): Promise<UploadedPhoto>` · `deletePropertyPhoto(propertyId: string, photoId: string, storagePath: string): Promise<void>` · `updatePhotoCaption(photoId: string, propertyId: string, caption: string): Promise<void>` · `reorderPropertyPhoto(propertyId: string, photoId: string, newSortOrder: number): Promise<void>`. Consommé par Task 8 (`PhotoGrid`).

- [ ] **Step 1: Ajouter l'import**

Dans `src/app/(app)/app/p/[projectId]/bien/[propertyId]/actions.ts`, remplacer la ligne d'import existante :

```ts
import { DEMO_USER_ID, getDemoClient } from "@/lib/supabase/demo";
import type { PropertyScenarioRow } from "@/lib/property-detail-types";
```

par :

```ts
import { DEMO_USER_ID, getDemoClient } from "@/lib/supabase/demo";
import type { PropertyScenarioRow } from "@/lib/property-detail-types";
import { MAX_FILE_SIZE_BYTES, MAX_PHOTOS_PER_PROPERTY, isAcceptedPhotoType } from "@/lib/file-limits";
```

- [ ] **Step 2: Ajouter les Server Actions photos**

À la fin du fichier (après la fonction `updatePropertyScenario` existante), ajouter :

```ts

export type UploadedPhoto = {
  id: string;
  storage_path: string;
  caption: string | null;
  sort_order: number;
};

/** Upload une photo dans le bucket `property-photos` puis crée la ligne
 *  `property_photos` correspondante. Revalide taille/type côté serveur —
 *  jamais confiance au client, même si le fichier est déjà compressé par
 *  `useFileUpload` — et le plafond de `MAX_PHOTOS_PER_PROPERTY`. */
export async function uploadPropertyPhoto(propertyId: string, formData: FormData): Promise<UploadedPhoto> {
  const supabase = getDemoClient();

  const { data: property } = await supabase
    .from("properties")
    .select("id")
    .eq("id", propertyId)
    .eq("user_id", DEMO_USER_ID)
    .maybeSingle();
  if (!property) throw new Error("Bien introuvable.");

  const { count } = await supabase
    .from("property_photos")
    .select("id", { count: "exact", head: true })
    .eq("property_id", propertyId)
    .eq("user_id", DEMO_USER_ID);
  if ((count ?? 0) >= MAX_PHOTOS_PER_PROPERTY) {
    throw new Error(`Limite de ${MAX_PHOTOS_PER_PROPERTY} photos atteinte pour ce bien.`);
  }

  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("Fichier manquant.");
  if (!isAcceptedPhotoType(file.type)) {
    throw new Error("Format de photo non supporté (JPG, PNG ou WEBP uniquement).");
  }
  if (file.size > MAX_FILE_SIZE_BYTES) throw new Error("Photo trop volumineuse (8 Mo maximum).");

  const { data: maxRow } = await supabase
    .from("property_photos")
    .select("sort_order")
    .eq("property_id", propertyId)
    .eq("user_id", DEMO_USER_ID)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextSortOrder = (maxRow?.sort_order ?? 0) + 1;

  const storagePath = `${DEMO_USER_ID}/${propertyId}/${crypto.randomUUID()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("property-photos")
    .upload(storagePath, file, { contentType: file.type });
  if (uploadError) throw new Error(uploadError.message);

  const { data: inserted, error: insertError } = await supabase
    .from("property_photos")
    .insert({
      property_id: propertyId,
      user_id: DEMO_USER_ID,
      storage_path: storagePath,
      sort_order: nextSortOrder,
    })
    .select("id, storage_path, caption, sort_order")
    .single();
  if (insertError || !inserted) throw new Error(insertError?.message ?? "Échec de l'enregistrement de la photo.");

  return inserted;
}

/** Supprime le fichier du bucket PUIS la ligne DB (dans cet ordre : si la
 *  ligne DB était supprimée en premier et la suppression du fichier
 *  échouait, on se retrouverait avec un fichier orphelin invisible et
 *  jamais nettoyé). */
export async function deletePropertyPhoto(propertyId: string, photoId: string, storagePath: string): Promise<void> {
  const supabase = getDemoClient();

  const { error: storageError } = await supabase.storage.from("property-photos").remove([storagePath]);
  if (storageError) throw new Error(storageError.message);

  const { error: deleteError } = await supabase
    .from("property_photos")
    .delete()
    .eq("id", photoId)
    .eq("property_id", propertyId)
    .eq("user_id", DEMO_USER_ID);
  if (deleteError) throw new Error(deleteError.message);
}

export async function updatePhotoCaption(photoId: string, propertyId: string, caption: string): Promise<void> {
  const supabase = getDemoClient();
  const trimmed = caption.trim();
  const { error } = await supabase
    .from("property_photos")
    .update({ caption: trimmed.length > 0 ? trimmed : null })
    .eq("id", photoId)
    .eq("property_id", propertyId)
    .eq("user_id", DEMO_USER_ID);
  if (error) throw new Error(error.message);
}

/** Met à jour la `sort_order` d'UNE SEULE photo (fractional indexing déjà
 *  calculé côté client via `computeDropPosition` — voir `PhotoGrid`, même
 *  principe que `moveProperty`/le board Kanban : un seul élément déplacé,
 *  les autres jamais touchés). */
export async function reorderPropertyPhoto(propertyId: string, photoId: string, newSortOrder: number): Promise<void> {
  const supabase = getDemoClient();
  const { error } = await supabase
    .from("property_photos")
    .update({ sort_order: newSortOrder })
    .eq("id", photoId)
    .eq("property_id", propertyId)
    .eq("user_id", DEMO_USER_ID);
  if (error) throw new Error(error.message);
}
```

- [ ] **Step 3: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur sur `src/app/(app)/app/p/[projectId]/bien/[propertyId]/actions.ts`.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(app)/app/p/[projectId]/bien/[propertyId]/actions.ts"
git commit -m "feat(fiche): Server Actions photos (upload/suppression/réorganisation/légende)"
```

---

### Task 5: Server Actions — Documents (upload, suppression, type)

**Files:**
- Modify: `src/app/(app)/app/p/[projectId]/bien/[propertyId]/actions.ts`

**Interfaces:**
- Consumes: `MAX_DOCUMENTS_PER_PROPERTY`, `isAcceptedDocumentType`, `type DocType` (`@/lib/file-limits`, Task 1, ajoutés à l'import de Task 4).
- Produces (ajout) : `export type UploadedDocument = { id: string; storage_path: string; filename: string; doc_type: string }` · `uploadPropertyDocument(propertyId: string, formData: FormData): Promise<UploadedDocument>` · `deletePropertyDocument(propertyId: string, documentId: string, storagePath: string): Promise<void>` · `updateDocumentType(documentId: string, propertyId: string, docType: DocType): Promise<void>`. Consommé par Task 9 (`DocumentList`).

- [ ] **Step 1: Étendre l'import**

Dans le même fichier, remplacer la ligne d'import ajoutée à la Task 4 :

```ts
import { MAX_FILE_SIZE_BYTES, MAX_PHOTOS_PER_PROPERTY, isAcceptedPhotoType } from "@/lib/file-limits";
```

par :

```ts
import {
  MAX_DOCUMENTS_PER_PROPERTY,
  MAX_FILE_SIZE_BYTES,
  MAX_PHOTOS_PER_PROPERTY,
  isAcceptedDocumentType,
  isAcceptedPhotoType,
  type DocType,
} from "@/lib/file-limits";
```

- [ ] **Step 2: Ajouter les Server Actions documents**

À la fin du fichier (après `reorderPropertyPhoto` de la Task 4), ajouter :

```ts

export type UploadedDocument = {
  id: string;
  storage_path: string;
  filename: string;
  doc_type: string;
};

/** Même logique que `uploadPropertyPhoto` (Task 4) côté documents — pas de
 *  compression (un PDF ne se compresse pas simplement), type par défaut
 *  "autre" si non fourni. */
export async function uploadPropertyDocument(propertyId: string, formData: FormData): Promise<UploadedDocument> {
  const supabase = getDemoClient();

  const { data: property } = await supabase
    .from("properties")
    .select("id")
    .eq("id", propertyId)
    .eq("user_id", DEMO_USER_ID)
    .maybeSingle();
  if (!property) throw new Error("Bien introuvable.");

  const { count } = await supabase
    .from("property_documents")
    .select("id", { count: "exact", head: true })
    .eq("property_id", propertyId)
    .eq("user_id", DEMO_USER_ID);
  if ((count ?? 0) >= MAX_DOCUMENTS_PER_PROPERTY) {
    throw new Error(`Limite de ${MAX_DOCUMENTS_PER_PROPERTY} documents atteinte pour ce bien.`);
  }

  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("Fichier manquant.");
  if (!isAcceptedDocumentType(file.type)) {
    throw new Error("Format de document non supporté (PDF, JPG ou PNG uniquement).");
  }
  if (file.size > MAX_FILE_SIZE_BYTES) throw new Error("Document trop volumineux (8 Mo maximum).");

  const docTypeValue = formData.get("docType");
  const resolvedDocType = typeof docTypeValue === "string" && docTypeValue.length > 0 ? docTypeValue : "autre";

  const storagePath = `${DEMO_USER_ID}/${propertyId}/${crypto.randomUUID()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("property-documents")
    .upload(storagePath, file, { contentType: file.type });
  if (uploadError) throw new Error(uploadError.message);

  const { data: inserted, error: insertError } = await supabase
    .from("property_documents")
    .insert({
      property_id: propertyId,
      user_id: DEMO_USER_ID,
      storage_path: storagePath,
      filename: file.name,
      doc_type: resolvedDocType,
    })
    .select("id, storage_path, filename, doc_type")
    .single();
  if (insertError || !inserted) throw new Error(insertError?.message ?? "Échec de l'enregistrement du document.");

  return inserted;
}

export async function deletePropertyDocument(
  propertyId: string,
  documentId: string,
  storagePath: string,
): Promise<void> {
  const supabase = getDemoClient();

  const { error: storageError } = await supabase.storage.from("property-documents").remove([storagePath]);
  if (storageError) throw new Error(storageError.message);

  const { error: deleteError } = await supabase
    .from("property_documents")
    .delete()
    .eq("id", documentId)
    .eq("property_id", propertyId)
    .eq("user_id", DEMO_USER_ID);
  if (deleteError) throw new Error(deleteError.message);
}

export async function updateDocumentType(documentId: string, propertyId: string, docType: DocType): Promise<void> {
  const supabase = getDemoClient();
  const { error } = await supabase
    .from("property_documents")
    .update({ doc_type: docType })
    .eq("id", documentId)
    .eq("property_id", propertyId)
    .eq("user_id", DEMO_USER_ID);
  if (error) throw new Error(error.message);
}
```

- [ ] **Step 3: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur sur `src/app/(app)/app/p/[projectId]/bien/[propertyId]/actions.ts`.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(app)/app/p/[projectId]/bien/[propertyId]/actions.ts"
git commit -m "feat(fiche): Server Actions documents (upload/suppression/type)"
```

---

### Task 6: `FileDropzone` — zone de glisser-déposer générique

**Files:**
- Create: `src/components/app/fiche/FileDropzone.tsx`

**Interfaces:**
- Consumes: rien de nouveau.
- Produces: `FileDropzone({ accept: string; multiple?: boolean; disabled: boolean; disabledMessage: string; label: string; onFilesSelected: (files: File[]) => void })`. Consommé par Tasks 8 (`PhotoGrid`) et 9 (`DocumentList`).

- [ ] **Step 1: Écrire le composant**

Fichier `src/components/app/fiche/FileDropzone.tsx` :

```tsx
"use client";

import { useRef, useState } from "react";

/** Zone de glisser-déposer + sélecteur de fichiers, générique (ne connaît
 *  ni photos ni documents — juste des `File[]` bruts). `accept`/`multiple`
 *  filtrent le sélecteur natif, mais le glisser-déposer peut contourner ce
 *  filtre : la validation réelle des types/tailles vit chez l'appelant
 *  (`PhotoGrid`/`DocumentList`) et côté serveur (défense en profondeur). */
export function FileDropzone({
  accept,
  multiple = true,
  disabled,
  disabledMessage,
  label,
  onFilesSelected,
}: {
  accept: string;
  multiple?: boolean;
  disabled: boolean;
  disabledMessage: string;
  label: string;
  onFilesSelected: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    onFilesSelected(Array.from(fileList));
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setIsDraggingOver(true);
      }}
      onDragLeave={() => setIsDraggingOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDraggingOver(false);
        if (disabled) return;
        handleFiles(e.dataTransfer.files);
      }}
      className={`flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-4 text-center text-xs transition-colors ${
        disabled
          ? "cursor-not-allowed border-border text-faint"
          : isDraggingOver
            ? "border-brand bg-brand/5 text-text"
            : "border-border-strong text-faint hover:border-brand/50"
      }`}
    >
      <p>{disabled ? disabledMessage : label}</p>
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="rounded-full border border-border-strong px-3 py-1 text-xs font-medium text-text transition-colors hover:border-brand disabled:cursor-not-allowed disabled:opacity-50"
      >
        Parcourir
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
        className="hidden"
      />
    </div>
  );
}
```

- [ ] **Step 2: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur sur `src/components/app/fiche/FileDropzone.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/app/fiche/FileDropzone.tsx
git commit -m "feat(fiche): FileDropzone — zone de glisser-déposer générique"
```

---

### Task 7: `PhotoLightbox` — aperçu plein écran

**Files:**
- Create: `src/components/app/fiche/PhotoLightbox.tsx`

**Interfaces:**
- Consumes: `PropertyDetailPhotoWithUrl` (`@/lib/property-detail-types`, Task 2).
- Produces: `PhotoLightbox({ photos: PropertyDetailPhotoWithUrl[]; index: number; onClose: () => void; onNavigate: (nextIndex: number) => void; onDelete: (photoId: string) => void })`. Consommé par Task 8 (`PhotoGrid`).

- [ ] **Step 1: Écrire le composant**

Fichier `src/components/app/fiche/PhotoLightbox.tsx` :

```tsx
"use client";

import { useEffect } from "react";
import type { PropertyDetailPhotoWithUrl } from "@/lib/property-detail-types";

/** Aperçu plein écran fait main (pas de lib) — même pattern d'accessibilité
 *  que `InfoTooltip` (Échap pour fermer), + navigation clavier gauche/droite.
 *  Le clic sur le fond ferme la lightbox ; le clic sur le contenu (image,
 *  légende, boutons) ne propage pas au fond (`stopPropagation`). */
export function PhotoLightbox({
  photos,
  index,
  onClose,
  onNavigate,
  onDelete,
}: {
  photos: PropertyDetailPhotoWithUrl[];
  index: number;
  onClose: () => void;
  onNavigate: (nextIndex: number) => void;
  onDelete: (photoId: string) => void;
}) {
  const photo = photos[index];

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight" && index < photos.length - 1) onNavigate(index + 1);
      if (event.key === "ArrowLeft" && index > 0) onNavigate(index - 1);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [index, photos.length, onClose, onNavigate]);

  if (!photo) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-bg/95 p-6"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.signedUrl}
        alt={photo.caption ?? "Photo du bien"}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[75vh] max-w-full rounded-2xl object-contain"
      />
      {photo.caption && (
        <p onClick={(e) => e.stopPropagation()} className="text-sm text-text">
          {photo.caption}
        </p>
      )}
      <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-3">
        <button
          type="button"
          disabled={index === 0}
          onClick={() => onNavigate(index - 1)}
          className="rounded-full border border-border-strong px-3 py-1 text-xs text-text disabled:opacity-30"
        >
          ← Précédente
        </button>
        <span className="text-xs text-faint">
          {index + 1} / {photos.length}
        </span>
        <button
          type="button"
          disabled={index === photos.length - 1}
          onClick={() => onNavigate(index + 1)}
          className="rounded-full border border-border-strong px-3 py-1 text-xs text-text disabled:opacity-30"
        >
          Suivante →
        </button>
        <button
          type="button"
          onClick={() => onDelete(photo.id)}
          className="rounded-full border border-score-low/40 px-3 py-1 text-xs text-score-low"
        >
          Supprimer
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-border-strong px-3 py-1 text-xs text-text"
        >
          Fermer (Échap)
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur sur `src/components/app/fiche/PhotoLightbox.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/app/fiche/PhotoLightbox.tsx
git commit -m "feat(fiche): PhotoLightbox — aperçu plein écran (clavier + clic-hors-zone)"
```

---

### Task 8: `PhotoGrid` — grille réorganisable + upload + légende

**Files:**
- Create: `src/components/app/fiche/PhotoGrid.tsx`

**Interfaces:**
- Consumes: `FileDropzone` (Task 6), `PhotoLightbox` (Task 7), `useFileUpload` (`@/lib/hooks/use-file-upload`, Task 3), `ACCEPTED_PHOTO_MIME_TYPES`, `MAX_PHOTOS_PER_PROPERTY`, `isAcceptedPhotoType` (`@/lib/file-limits`, Task 1), `uploadPropertyPhoto`, `deletePropertyPhoto`, `updatePhotoCaption`, `reorderPropertyPhoto` (`@/app/(app)/app/p/[projectId]/bien/[propertyId]/actions`, Task 4), `computeDropPosition` (`@/lib/board-position`), `PropertyDetailPhotoWithUrl` (`@/lib/property-detail-types`, Task 2).
- Produces: `PhotoGrid({ propertyId: string; initialPhotos: PropertyDetailPhotoWithUrl[] })`. Consommé par Task 10 (`SectionHumain`).

- [ ] **Step 1: Écrire le composant**

Fichier `src/components/app/fiche/PhotoGrid.tsx` :

```tsx
"use client";

import { useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { computeDropPosition } from "@/lib/board-position";
import { FileDropzone } from "@/components/app/fiche/FileDropzone";
import { PhotoLightbox } from "@/components/app/fiche/PhotoLightbox";
import { useFileUpload } from "@/lib/hooks/use-file-upload";
import { ACCEPTED_PHOTO_MIME_TYPES, MAX_PHOTOS_PER_PROPERTY, isAcceptedPhotoType } from "@/lib/file-limits";
import {
  deletePropertyPhoto,
  reorderPropertyPhoto,
  updatePhotoCaption,
  uploadPropertyPhoto,
} from "@/app/(app)/app/p/[projectId]/bien/[propertyId]/actions";
import type { PropertyDetailPhotoWithUrl } from "@/lib/property-detail-types";

export function PhotoGrid({
  propertyId,
  initialPhotos,
}: {
  propertyId: string;
  initialPhotos: PropertyDetailPhotoWithUrl[];
}) {
  const [photos, setPhotos] = useState<PropertyDetailPhotoWithUrl[]>(initialPhotos);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { status, error, uploadFiles } = useFileUpload();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const atLimit = photos.length >= MAX_PHOTOS_PER_PROPERTY;

  async function handleFilesSelected(files: File[]) {
    const validFiles = files.filter((f) => isAcceptedPhotoType(f.type));
    setValidationError(
      validFiles.length < files.length
        ? "Certains fichiers ont été ignorés (formats acceptés : JPG, PNG, WEBP)."
        : null,
    );
    const remainingSlots = MAX_PHOTOS_PER_PROPERTY - photos.length;
    const filesToUpload = validFiles.slice(0, Math.max(0, remainingSlots));
    if (filesToUpload.length === 0) return;

    await uploadFiles(
      filesToUpload,
      async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        const uploaded = await uploadPropertyPhoto(propertyId, formData);
        const previewUrl = URL.createObjectURL(file);
        setPhotos((current) => [...current, { ...uploaded, signedUrl: previewUrl }]);
      },
      true,
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const photoId = String(active.id);
    const overId = String(over.id);
    const destIndex = photos.findIndex((p) => p.id === overId);
    if (destIndex === -1) return;

    const others = photos.filter((p) => p.id !== photoId);
    const clampedIndex = Math.min(Math.max(destIndex, 0), others.length);
    const newSortOrder = computeDropPosition(
      others.map((p) => p.sort_order),
      clampedIndex,
    );

    setPhotos((current) =>
      current
        .map((p) => (p.id === photoId ? { ...p, sort_order: newSortOrder } : p))
        .sort((a, b) => a.sort_order - b.sort_order),
    );
    reorderPropertyPhoto(propertyId, photoId, newSortOrder).catch(() => {
      // Échec réseau isolé — l'ordre local reste tel quel, l'utilisateur
      // peut simplement recommencer le glisser-déposer.
    });
  }

  function handleCaptionBlur(photoId: string, value: string) {
    setPhotos((current) => current.map((p) => (p.id === photoId ? { ...p, caption: value || null } : p)));
    updatePhotoCaption(photoId, propertyId, value).catch(() => {});
  }

  function handleDeleteClick(photoId: string, storagePath: string) {
    if (pendingDeleteId !== photoId) {
      setPendingDeleteId(photoId);
      setTimeout(() => setPendingDeleteId((current) => (current === photoId ? null : current)), 3000);
      return;
    }
    setPendingDeleteId(null);
    setPhotos((current) => current.filter((p) => p.id !== photoId));
    if (lightboxIndex !== null && photos[lightboxIndex]?.id === photoId) setLightboxIndex(null);
    deletePropertyPhoto(propertyId, photoId, storagePath).catch(() => {});
  }

  return (
    <div>
      <FileDropzone
        accept={ACCEPTED_PHOTO_MIME_TYPES.join(",")}
        disabled={atLimit}
        disabledMessage={`Limite de ${MAX_PHOTOS_PER_PROPERTY} photos atteinte.`}
        label="Glisse des photos ici ou clique pour en choisir."
        onFilesSelected={handleFilesSelected}
      />
      {status === "compressing" && <p className="mt-2 text-xs text-faint">Compression…</p>}
      {status === "uploading" && <p className="mt-2 text-xs text-faint">Envoi…</p>}
      {validationError && <p className="mt-2 text-xs text-score-mid">{validationError}</p>}
      {error && <p className="mt-2 text-xs text-score-low">{error}</p>}

      {photos.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={photos.map((p) => p.id)} strategy={rectSortingStrategy}>
            <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {photos.map((photo, i) => (
                <PhotoThumbnail
                  key={photo.id}
                  photo={photo}
                  isPendingDelete={pendingDeleteId === photo.id}
                  onOpen={() => setLightboxIndex(i)}
                  onCaptionBlur={(value) => handleCaptionBlur(photo.id, value)}
                  onDelete={() => handleDeleteClick(photo.id, photo.storage_path)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={photos}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
          onDelete={(photoId) => {
            const photo = photos.find((p) => p.id === photoId);
            if (photo) handleDeleteClick(photo.id, photo.storage_path);
          }}
        />
      )}
    </div>
  );
}

function PhotoThumbnail({
  photo,
  isPendingDelete,
  onOpen,
  onCaptionBlur,
  onDelete,
}: {
  photo: PropertyDetailPhotoWithUrl;
  isPendingDelete: boolean;
  onOpen: () => void;
  onCaptionBlur: (value: string) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: photo.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex flex-col gap-1.5">
      <div
        {...attributes}
        {...listeners}
        onClick={onOpen}
        className="aspect-square cursor-grab overflow-hidden rounded-xl border border-border bg-bg active:cursor-grabbing"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.signedUrl} alt={photo.caption ?? "Photo du bien"} className="h-full w-full object-cover" />
      </div>
      <input
        defaultValue={photo.caption ?? ""}
        onBlur={(e) => onCaptionBlur(e.target.value)}
        placeholder="Légende…"
        className="rounded-lg border border-border bg-bg px-2 py-1 text-xs text-text"
      />
      <button
        type="button"
        onClick={onDelete}
        className={`rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors ${
          isPendingDelete
            ? "border-score-low bg-score-low/10 text-score-low"
            : "border-border-strong text-faint hover:border-score-low hover:text-score-low"
        }`}
      >
        {isPendingDelete ? "Confirmer ?" : "Supprimer"}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur sur `src/components/app/fiche/PhotoGrid.tsx`. Des erreurs sont attendues à ce stade sur `SectionHumain.tsx` (pas encore mis à jour, Task 10) — normal, pas votre tâche.

- [ ] **Step 3: Commit**

```bash
git add src/components/app/fiche/PhotoGrid.tsx
git commit -m "feat(fiche): PhotoGrid — grille réorganisable + upload + légende + lightbox"
```

---

### Task 9: `DocumentList` — liste de documents typés

**Files:**
- Create: `src/components/app/fiche/DocumentList.tsx`

**Interfaces:**
- Consumes: `FileDropzone` (Task 6), `useFileUpload` (Task 3), `ACCEPTED_DOCUMENT_MIME_TYPES`, `DOC_TYPE_OPTIONS`, `MAX_DOCUMENTS_PER_PROPERTY`, `isAcceptedDocumentType`, `type DocType` (`@/lib/file-limits`, Task 1), `uploadPropertyDocument`, `deletePropertyDocument`, `updateDocumentType` (`@/app/(app)/app/p/[projectId]/bien/[propertyId]/actions`, Task 5), `PropertyDetailDocumentWithUrl` (`@/lib/property-detail-types`, Task 2).
- Produces: `DocumentList({ propertyId: string; initialDocuments: PropertyDetailDocumentWithUrl[] })`. Consommé par Task 10 (`SectionHumain`).

- [ ] **Step 1: Écrire le composant**

Fichier `src/components/app/fiche/DocumentList.tsx` :

```tsx
"use client";

import { useState } from "react";
import { FileDropzone } from "@/components/app/fiche/FileDropzone";
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
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
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
    if (pendingDeleteId !== documentId) {
      setPendingDeleteId(documentId);
      setTimeout(() => setPendingDeleteId((current) => (current === documentId ? null : current)), 3000);
      return;
    }
    setPendingDeleteId(null);
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
```

- [ ] **Step 2: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur sur `src/components/app/fiche/DocumentList.tsx`. Des erreurs sont attendues à ce stade sur `SectionHumain.tsx` — normal, pas votre tâche (Task 10).

- [ ] **Step 3: Commit**

```bash
git add src/components/app/fiche/DocumentList.tsx
git commit -m "feat(fiche): DocumentList — liste typée + téléchargement + suppression"
```

---

### Task 10: `SectionHumain` — intègre PhotoGrid et DocumentList

**Files:**
- Modify: `src/components/app/fiche/SectionHumain.tsx` (réécriture complète du fichier)

**Interfaces:**
- Consumes: `PhotoGrid` (Task 8), `DocumentList` (Task 9), `PropertyDetailPhotoWithUrl`, `PropertyDetailDocumentWithUrl` (`@/lib/property-detail-types`, Task 2).
- Produces: `SectionHumain({ property, contact, notes, photos, documents, propertyId })` — **signature changée** (types `photos`/`documents` passent de `PropertyDetailPhoto[]`/`PropertyDetailDocument[]` à `...WithUrl[]`, ajout de `propertyId: string`). Consommé par Task 11 (`page.tsx`).

- [ ] **Step 1: Remplacer tout le contenu du fichier**

Fichier `src/components/app/fiche/SectionHumain.tsx` (remplace entièrement le fichier existant) :

```tsx
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
```

- [ ] **Step 2: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: erreurs attendues sur `page.tsx` (n'a pas encore les URLs signées ni `propertyId` en prop — normal, corrigé à la Task 11). Aucune erreur ne doit provenir de `SectionHumain.tsx` lui-même.

- [ ] **Step 3: Commit**

```bash
git add src/components/app/fiche/SectionHumain.tsx
git commit -m "feat(fiche): SectionHumain intègre PhotoGrid et DocumentList (Plan 5c)"
```

---

### Task 11: `page.tsx` — génère les URLs signées

**Files:**
- Modify: `src/app/(app)/app/p/[projectId]/bien/[propertyId]/page.tsx`

**Interfaces:**
- Consumes: `SectionHumain` (signature mise à jour, Task 10).
- Produces: aucun changement de signature de route.

- [ ] **Step 1: Générer les URLs signées après le fetch existant**

Dans `src/app/(app)/app/p/[projectId]/bien/[propertyId]/page.tsx`, remplacer :

```tsx
  const contact = contactRes.data ?? null;
  const notes = notesRes.data ?? [];
  const photos = photosRes.data ?? [];
  const documents = documentsRes.data ?? [];
```

par :

```tsx
  const contact = contactRes.data ?? null;
  const notes = notesRes.data ?? [];
  const photos = photosRes.data ?? [];
  const documents = documentsRes.data ?? [];

  const [photosWithUrls, documentsWithUrls] = await Promise.all([
    Promise.all(
      photos.map(async (photo) => {
        const { data } = await supabase.storage.from("property-photos").createSignedUrl(photo.storage_path, 3600);
        return { ...photo, signedUrl: data?.signedUrl ?? "" };
      }),
    ),
    Promise.all(
      documents.map(async (doc) => {
        const { data } = await supabase.storage.from("property-documents").createSignedUrl(doc.storage_path, 3600);
        return { ...doc, signedUrl: data?.signedUrl ?? "" };
      }),
    ),
  ]);
```

- [ ] **Step 2: Passer les nouvelles props à `SectionHumain`**

Dans le même fichier, remplacer :

```tsx
        <SectionHumain property={property} contact={contact} notes={notes} photos={photos} documents={documents} />
```

par :

```tsx
        <SectionHumain
          property={property}
          contact={contact}
          notes={notes}
          photos={photosWithUrls}
          documents={documentsWithUrls}
          propertyId={propertyId}
        />
```

- [ ] **Step 3: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: **zéro erreur** sur l'ensemble du projet (les erreurs attendues aux Tasks 8, 9, 10 doivent avoir disparu).

- [ ] **Step 4: Commit**

```bash
git add "src/app/(app)/app/p/[projectId]/bien/[propertyId]/page.tsx"
git commit -m "feat(fiche): page.tsx génère les URLs signées photos/documents"
```

---

### Task 12: Vérification finale (build, lint, QA manuelle)

**Files:** aucun fichier créé — tâche de vérification uniquement.

**Interfaces:** N/A.

- [ ] **Step 1: Build complet**

Run: `npm run build`
Expected: build réussi, aucune erreur TypeScript ni erreur de build.

- [ ] **Step 2: Lint complet**

Run: `npm run lint`
Expected: 0 erreur. Des warnings sont attendus sur les deux `eslint-disable-next-line @next/next/no-img-element` (désactivés explicitement, pas des warnings actifs) + les 5 warnings préexistants hors périmètre (fichier `animation-estio/scrub-engine.js`, déjà notés aux Plans 5a/5b).

- [ ] **Step 3: QA manuelle**

Run: `npm run dev`, ouvrir dans le navigateur la fiche d'un bien seedé (`/app/p/<projectId>/bien/<propertyId>`).

Vérifier :
- Glisser-déposer plusieurs photos JPG/PNG : elles apparaissent dans la grille après un court indicateur « Compression… » puis « Envoi… ».
- Ajouter une légende à une photo, cliquer ailleurs (blur) : la légende reste affichée.
- Réorganiser deux photos par glisser-déposer.
- Cliquer sur une photo : la lightbox s'ouvre, navigation flèches clavier fonctionne, Échap ferme.
- Recharger la page (F5) : photos, légendes, ordre et documents sont toujours là (URLs signées fonctionnelles).
- Ajouter un document PDF, changer son type via le menu déroulant, cliquer « Télécharger » (ouvre un nouvel onglet), le supprimer (bouton devient « Confirmer ? » puis suppression au second clic).
- Tenter d'ajouter un fichier non supporté (ex. `.docx` renommé en `.pdf` ne compte pas — tester un vrai type non accepté comme une vidéo `.mp4`) : message d'erreur clair, pas de crash.
- Atteindre artificiellement une limite basse n'est pas nécessaire à vérifier manuellement (déjà couvert par le code défensif serveur) — vérifier au moins que le bouton de la dropzone est cliquable en usage normal.

- [ ] **Step 4: Commit final (si des ajustements ont été faits pendant la QA)**

```bash
git add -A
git commit -m "fix(fiche): ajustements post-QA manuelle Plan 5c"
```

(Ne committer que si la QA a nécessité une correction — sinon cette étape est un no-op.)

---

## Self-Review (fait par l'auteur du plan avant remise)

- **Couverture de la spec** : §3 limites → Task 1 · §4 compression → Tasks 1, 3 · §5 architecture (stockage/accès, nouveaux fichiers) → Tasks 1-11 · §6 comportement détaillé (photos : upload/légende/réorganisation/lightbox/suppression ; documents : upload/type/icône/téléchargement/suppression) → Tasks 8, 9 · §7 sécurité/validation serveur → Tasks 4, 5 · Fichier modifié `SectionHumain`/`page.tsx` (§5.3) → Tasks 10, 11.
- **Cohérence des types** : `UploadedPhoto`/`UploadedDocument` (Tasks 4, 5) exposent exactement les champs consommés par `PhotoGrid`/`DocumentList` (Tasks 8, 9) pour construire `PropertyDetailPhotoWithUrl`/`PropertyDetailDocumentWithUrl` (`{ ...uploaded, signedUrl }`) ; `DocType` (Task 1) utilisé identiquement dans `updateDocumentType` (Task 5) et le `<select>` de `DocumentList` (Task 9) ; signature de `SectionHumain` (Task 10) et son appel dans `page.tsx` (Task 11) vérifiés champ par champ.
- **Aucun placeholder** : chaque étape contient le code complet, aucun "TODO"/"à compléter".
