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
import { useConfirmDelete } from "@/lib/hooks/use-confirm-delete";
import { useFileUpload } from "@/lib/hooks/use-file-upload";
import {
  ACCEPTED_PHOTO_MIME_TYPES,
  MAX_PHOTOS_PER_PROPERTY,
  isAcceptedPhotoType,
} from "@/lib/file-limits";
import {
  deletePropertyPhoto,
  reorderPropertyPhoto,
  updatePhotoCaption,
  uploadPropertyPhoto,
} from "@/app/(app)/app/p/[projectId]/bien/[propertyId]/actions";
import { IconTrash } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";
import type { PropertyDetailPhotoWithUrl } from "@/lib/property-detail-types";

/**
 * Photos du bien — les seules images en couleur pleine de toute l'application.
 *
 * Tout le système est monochrome ; les photos, elles, restent fidèles. C'est
 * voulu : dans un environnement d'encre et de braise, une photo de cuisine
 * devient un événement visuel, et c'est exactement ce qu'on veut regarder.
 */
export function PhotoGrid({
  propertyId,
  initialPhotos,
}: {
  propertyId: string;
  initialPhotos: PropertyDetailPhotoWithUrl[];
}) {
  const [photos, setPhotos] = useState<PropertyDetailPhotoWithUrl[]>(initialPhotos);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const { pendingId: pendingDeleteId, requestConfirm } = useConfirmDelete();
  const [validationError, setValidationError] = useState<string | null>(null);
  const { status, error, uploadFiles } = useFileUpload();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

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
      // Échec réseau isolé : l'ordre local reste tel quel, l'utilisateur peut
      // simplement recommencer le glisser-déposer.
    });
  }

  function handleCaptionBlur(photoId: string, value: string) {
    const trimmed = value.trim();
    setPhotos((current) =>
      current.map((p) =>
        p.id === photoId ? { ...p, caption: trimmed.length > 0 ? trimmed : null } : p,
      ),
    );
    updatePhotoCaption(photoId, propertyId, value).catch(() => {});
  }

  function handleDeleteClick(photoId: string, storagePath: string) {
    if (!requestConfirm(photoId)) return;
    setPhotos((current) => current.filter((p) => p.id !== photoId));
    if (lightboxIndex !== null && photos[lightboxIndex]?.id === photoId) {
      setLightboxIndex(null);
    }
    deletePropertyPhoto(propertyId, photoId, storagePath).catch(() => {});
  }

  return (
    <div>
      <FileDropzone
        accept={ACCEPTED_PHOTO_MIME_TYPES.join(",")}
        disabled={atLimit}
        disabledMessage={`Limite de ${MAX_PHOTOS_PER_PROPERTY} photos atteinte`}
        label="Déposez des photos, ou cliquez pour les choisir"
        onFilesSelected={handleFilesSelected}
      />

      <Status
        status={status === "compressing" ? "Compression…" : status === "uploading" ? "Envoi…" : null}
        warning={validationError}
        error={error}
      />

      {photos.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={photos.map((p) => p.id)} strategy={rectSortingStrategy}>
            <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
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
    </div>
  );
}

function Status({
  status,
  warning,
  error,
}: {
  status: string | null;
  warning: string | null;
  error: string | null;
}) {
  if (!status && !warning && !error) return null;
  return (
    <div className="mt-2 flex flex-col gap-1">
      {status && <p className="text-[11px] text-text-4">{status}</p>}
      {warning && <p className="text-[11px] text-mid">{warning}</p>}
      {error && <p className="text-[11px] text-danger">{error}</p>}
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
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: photo.id });

  return (
    <figure
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      className="group relative"
    >
      <div
        {...attributes}
        {...listeners}
        onClick={onOpen}
        className="relative aspect-[4/3] cursor-grab overflow-hidden rounded-md border border-line-soft bg-sunken active:cursor-grabbing"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.signedUrl}
          alt={photo.caption ?? "Photo du bien"}
          className="h-full w-full object-cover transition-transform duration-[420ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
        />
        <span
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(to_top,rgb(6_5_5/0.55),transparent_45%)] opacity-0 transition-opacity duration-[220ms] group-hover:opacity-100"
        />

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label={isPendingDelete ? "Confirmer la suppression" : "Supprimer la photo"}
          className={cx(
            "absolute right-1.5 top-1.5 flex h-6 items-center gap-1 rounded-sm border px-1.5",
            "text-[10px] backdrop-blur-sm transition-all duration-[140ms]",
            isPendingDelete
              ? "border-danger bg-[var(--danger-soft)] text-danger opacity-100"
              : "border-line bg-[rgb(6_5_5/0.6)] text-text-2 opacity-0 group-hover:opacity-100 hover:border-danger hover:text-danger",
          )}
        >
          <IconTrash size={11} />
          {isPendingDelete && "Confirmer"}
        </button>
      </div>

      <figcaption>
        <input
          defaultValue={photo.caption ?? ""}
          onBlur={(e) => onCaptionBlur(e.target.value)}
          placeholder="Légende…"
          aria-label="Légende de la photo"
          className="mt-1.5 w-full rounded-none border-0 border-b border-transparent bg-transparent px-0 pb-0.5 text-[11px] text-text-3 outline-none transition-colors placeholder:text-text-4 hover:border-line focus:border-accent focus:text-text"
        />
      </figcaption>
    </figure>
  );
}
