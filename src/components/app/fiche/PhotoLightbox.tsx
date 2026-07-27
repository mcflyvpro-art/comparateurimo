"use client";

import { useEffect } from "react";
import { Lightbox } from "@/components/ui/Overlay";
import { Button, IconButton } from "@/components/ui/Button";
import { IconArrowLeft, IconArrowRight, IconTrash } from "@/components/ui/Icon";
import type { PropertyDetailPhotoWithUrl } from "@/lib/property-detail-types";

/**
 * Aperçu plein cadre. Le fond ne fait pas que s'assombrir : il est flouté, donc
 * la fiche reste perceptible derrière sans jamais concurrencer l'image.
 * Navigation au clavier (flèches) et fermeture à Échap.
 */
export function PhotoLightbox({
  photos,
  index,
  onClose,
  onNavigate,
  onDelete,
}: {
  photos: PropertyDetailPhotoWithUrl[];
  index: number | null;
  onClose: () => void;
  onNavigate: (nextIndex: number) => void;
  onDelete: (photoId: string) => void;
}) {
  useEffect(() => {
    if (index === null) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (index === null) return;
      if (event.key === "ArrowRight" && index < photos.length - 1) onNavigate(index + 1);
      if (event.key === "ArrowLeft" && index > 0) onNavigate(index - 1);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [index, photos.length, onNavigate]);

  const photo = index !== null ? photos[index] : null;

  return (
    <Lightbox
      open={Boolean(photo)}
      onClose={onClose}
      toolbar={
        photo && index !== null ? (
          <>
            <IconButton
              aria-label="Photo précédente"
              variant="outline"
              size="sm"
              disabled={index === 0}
              onClick={() => onNavigate(index - 1)}
            >
              <IconArrowLeft size={15} />
            </IconButton>
            <span className="num min-w-16 text-center text-[11px] text-text-3">
              {index + 1} / {photos.length}
            </span>
            <IconButton
              aria-label="Photo suivante"
              variant="outline"
              size="sm"
              disabled={index === photos.length - 1}
              onClick={() => onNavigate(index + 1)}
            >
              <IconArrowRight size={15} />
            </IconButton>
            <span className="mx-1 h-5 w-px bg-hairline-2" aria-hidden />
            <Button
              variant="danger"
              size="sm"
              icon={<IconTrash size={13} />}
              onClick={() => onDelete(photo.id)}
            >
              Supprimer
            </Button>
            <Button variant="quiet" size="sm" onClick={onClose}>
              Fermer
            </Button>
          </>
        ) : null
      }
    >
      {photo && (
        <figure onClick={(e) => e.stopPropagation()} className="flex flex-col items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.signedUrl}
            alt={photo.caption ?? "Photo du bien"}
            className="max-h-[72vh] max-w-full rounded-md border border-hairline-2 object-contain"
          />
          {photo.caption && (
            <figcaption className="text-[12px] text-text-2">{photo.caption}</figcaption>
          )}
        </figure>
      )}
    </Lightbox>
  );
}
