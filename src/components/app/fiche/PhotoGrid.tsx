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
