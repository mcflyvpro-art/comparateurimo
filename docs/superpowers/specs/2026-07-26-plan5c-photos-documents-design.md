# Plan 5c — Photos & Documents (design)

> Suite du Plan 5a (fiche complète) et 5b (scénario en direct, validé). Périmètre : rendre les placeholders photos/documents de la section ⑨ Contexte humain réellement fonctionnels — upload, affichage, réorganisation, suppression. Contexte : `PROGRESS.md` §Phase 2, `REORIENTATION-ESTIO.md`.

## 1. Objectif

`SectionHumain` (fiche bien) affiche aujourd'hui deux zones grisées « L'ajout de photos/documents arrive au Plan 5c ». Ce plan les remplace par un vrai upload multi-fichiers (glisser-déposer ou sélecteur), une grille de photos réorganisable avec légende et lightbox plein écran, et une liste de documents typés avec téléchargement — le tout stocké dans les buckets Supabase Storage privés déjà créés au Plan 1 (`property-photos`, `property-documents`).

## 2. Non-objectifs (hors scope)

- **Pas de migration vers un autre stockage (Cloudflare R2 ou autre)** — reste sur Supabase Storage. Le sujet coût/échelle est noté pour la Phase 6, pas ce plan (voir mémoire `infra-stockage-scaling-futur`).
- **Pas d'extraction automatique de champs depuis un document uploadé** (ex: lire un diagnostic PDF) — c'est le rôle de la capture universelle (Grok), un système différent, hors scope ici. Ici on stocke des fichiers tels quels, aucune analyse de contenu.
- **Pas de partage de fichiers entre biens ou entre utilisateurs** — chaque photo/document reste attaché à un seul bien.
- **Pas de recadrage/édition d'image dans l'app** — seule la compression automatique avant upload (redimensionnement + qualité), pas d'éditeur.
- **Pas de vraie authentification** — upload et suppression restent filtrés `user_id = DEMO_USER_ID` comme le reste de l'app (Phase 5).

## 3. Limites retenues

| Limite | Valeur | Pourquoi |
|---|---|---|
| Taille max par fichier (après compression pour les images) | 8 Mo | Le plan gratuit Supabase autorise jusqu'à 50 Mo/fichier en dur, mais le quota total est de **1 Go par projet, partagé entre tous les utilisateurs** (pas par utilisateur) — une limite app plus serrée protège ce quota. |
| Photos par bien | 20 | Couvre largement l'usage réel (visite = quelques dizaines de photos max), plafonne le pire cas. |
| Documents par bien | 10 | Diagnostics + compromis + plans + divers tient largement dans 10. |
| Types acceptés — photos | JPG, PNG, WEBP | Formats image standards de téléphone/appareil photo. |
| Types acceptés — documents | PDF, JPG, PNG | PDF pour les documents officiels, image pour une photo rapide d'un papier. |

Ces limites sont appliquées **côté client** (retour immédiat, désactivation du bouton d'ajout une fois le plafond de nombre atteint) **et côté serveur** (défense en profondeur — jamais confiance au client sur la taille/type réels).

## 4. Compression d'image automatique

Avant l'upload, chaque image passe par la librairie **`browser-image-compression`** (npm, MIT, ~50 Ko, s'exécute entièrement dans le navigateur) : redimensionnement (dimension max 1920px) + compression JPEG (qualité ~0.8), ciblant un résultat **~1-2 Mo** par photo quelle que soit la taille d'origine. Entièrement transparent pour l'utilisateur — pas de bouton, pas de réglage, ça se passe pendant que le fichier est sélectionné, avec un indicateur de progression simple (« Compression… » puis « Envoi… »).

C'est une nouvelle dépendance npm — exception validée au même titre que `@dnd-kit` (Plan 3), qui reste la seule autre lib UI du projet.

## 5. Architecture

### 5.1 Stockage et accès

- Chemin de fichier dans le bucket : `${DEMO_USER_ID}/${propertyId}/${uuid}-${nomFichierOriginal}` — cohérent avec la policy RLS Storage déjà posée au Plan 1 (`(storage.foldername(name))[1] = auth.uid()`, même si le client démo contourne la RLS via service role, la structure de chemin reste correcte pour quand l'auth réelle arrivera en Phase 5).
- Les buckets sont **privés** (`public: false`, posé au Plan 1) : aucune URL publique directe. La page génère une **URL signée temporaire (validité 1h)** pour chaque photo/document existant à chaque chargement de la fiche, via `supabase.storage.from(bucket).createSignedUrl(path, 3600)`, côté serveur (`page.tsx`, Server Component, comme le reste du fetch de données).
- Upload et suppression passent par des **Server Actions** (le client démo utilise la clé service role, jamais exposée au navigateur) — le navigateur envoie le fichier compressé en `FormData` à l'action, qui l'upload dans Storage puis insère/supprime la ligne DB correspondante.

### 5.2 Nouveaux fichiers

| Fichier | Rôle |
|---|---|
| `src/lib/file-limits.ts` | Constantes partagées client/serveur : tailles max, plafonds de nombre, types MIME acceptés par catégorie. |
| `src/app/(app)/app/p/[projectId]/bien/[propertyId]/actions.ts` (déjà existant depuis Plan 5b) | Ajoute `uploadPropertyPhoto`, `deletePropertyPhoto`, `reorderPropertyPhotos`, `uploadPropertyDocument`, `deletePropertyDocument`, `updateDocumentType`. |
| `src/components/app/fiche/PhotoGrid.tsx` | Grille de miniatures + réorganisation `@dnd-kit/sortable` + légende inline + déclenche la lightbox. |
| `src/components/app/fiche/PhotoLightbox.tsx` | Aperçu plein écran fait main (précédent/suivant, Échap pour fermer — même pattern d'accessibilité que `InfoTooltip`). |
| `src/components/app/fiche/DocumentList.tsx` | Liste des documents avec icône par type, menu déroulant type, téléchargement (URL signée), suppression. |
| `src/components/app/fiche/FileDropzone.tsx` | Zone de glisser-déposer + sélecteur de fichiers générique, réutilisée par photos et documents (différencie juste les types/limites acceptés en props). |
| `src/lib/hooks/use-file-upload.ts` | Hook client : compression (si image), appel de la Server Action, état de progression (`idle`/`compressing`/`uploading`/`error`). |

### 5.3 Fichier modifié

- `src/components/app/fiche/SectionHumain.tsx` : passe en `"use client"`, remplace les deux placeholders par `<PhotoGrid>` et `<DocumentList>`, reçoit maintenant les URLs signées en props (calculées par `page.tsx`) en plus des lignes DB déjà fetchées.
- `src/app/(app)/app/p/[projectId]/bien/[propertyId]/page.tsx` : génère les URLs signées pour photos/documents existants avant de les passer à `SectionHumain`.

## 6. Comportement détaillé

### Photos

- Bouton « Ajouter des photos » + zone de glisser-déposer, multi-fichiers, désactivés (avec message explicite) une fois 20 photos atteintes.
- Chaque fichier sélectionné : compression → upload → apparition immédiate en fin de grille (optimistic UI léger : miniature affichée dès que l'upload réussit, pas d'attente d'un rechargement complet de page).
- Légende : champ texte sous chaque miniature, édition inline, sauvegarde au blur (pas de bouton « valider »).
- Réorganisation : glisser-déposer une miniature à une nouvelle position dans la grille, met à jour `sort_order` de toutes les photos affectées via `computeDropPosition` (réutilisé tel quel depuis `board-position.ts`, même logique de fractional indexing que le board Kanban).
- Clic sur une miniature → lightbox plein écran, navigation précédent/suivant (flèches clavier + boutons), légende affichée, bouton supprimer, fermeture par Échap ou clic hors-image.
- Suppression : bouton sur la miniature (grille) et dans la lightbox, confirmation légère (pas de modale bloquante comme le board — un simple double-clic ou un bouton qui se transforme brièvement en "Confirmer ?" suffit, cohérent avec le côté rapide de cette action).

### Documents

- Bouton « Ajouter un document » + zone de glisser-déposer, multi-fichiers, désactivés une fois 10 documents atteints.
- Chaque document : upload direct (pas de compression, PDF non compressible simplement) → apparaît en fin de liste.
- Type de document : menu déroulant (**Diagnostic**, **Compromis**, **Plan**, **Autre** — valeur par défaut `Autre`, correspond à la colonne existante `doc_type: text`), modifiable après upload.
- Icône par type dans la liste (fait main, cohérent avec la convention « pas de lib d'icônes » du projet).
- Bouton télécharger (ouvre l'URL signée dans un nouvel onglet) + bouton supprimer (même pattern de confirmation légère que les photos).

## 7. Sécurité et validation serveur

Chaque Server Action (upload/suppression/réorganisation/changement de type) :
- Vérifie que le `property_id` fourni appartient bien à `DEMO_USER_ID` (même défense en profondeur que les autres actions du projet).
- Revalide taille/type de fichier (le client peut mentir), rejette explicitement si hors limites (message d'erreur affiché, pas de silence).
- Vérifie le plafond de nombre (20/10) côté serveur avant d'insérer, pas seulement côté client.

## 8. Critères de validation (Vercel)

- Ajouter plusieurs photos par glisser-déposer : elles apparaissent compressées (taille réduite visible dans les logs réseau) et dans le bon ordre.
- Réorganiser les photos par glisser-déposer : l'ordre survit à un rechargement de page.
- Ajouter une légende, recharger la page : la légende est toujours là.
- Ouvrir la lightbox, naviguer au clavier, fermer avec Échap.
- Ajouter un document PDF, changer son type, le télécharger, le supprimer.
- Atteindre 20 photos ou 10 documents : le bouton d'ajout se désactive avec un message clair.
- Tenter d'uploader un fichier non supporté (ex: `.docx`) : rejeté avec message clair, pas de crash.
- `npx tsc --noEmit`, `npm run build`, `npm run lint` verts.
