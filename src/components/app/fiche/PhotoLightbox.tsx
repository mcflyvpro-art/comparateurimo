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
