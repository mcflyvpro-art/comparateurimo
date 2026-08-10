"use client";

import { useRef, useState } from "react";
import { IconUpload } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";

/**
 * Zone de dépôt — générique : elle ne connaît ni photos ni documents, juste des
 * `File[]`. La validation réelle vit chez l'appelant et côté serveur.
 *
 * Au survol d'un fichier, le pointillé devient continu et s'allume à la braise :
 * la cible se referme sur ce qu'on tient, plutôt que de clignoter.
 */
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
    <button
      type="button"
      disabled={disabled}
      onClick={() => inputRef.current?.click()}
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
      className={cx(
        "group flex w-full items-center justify-center gap-2.5 rounded-md border px-4 py-5",
        "text-[12px] transition-[border-color,background-color,color] duration-[140ms]",
        disabled
          ? "cursor-not-allowed border-dashed border-line-soft text-text-4"
          : isDraggingOver
            ? "border-solid border-accent-line bg-[var(--accent-soft)] text-accent-hot"
            : "cursor-pointer border-dashed border-line text-text-3 hover:border-line-strong hover:text-text-2",
      )}
    >
      <IconUpload
        size={15}
        className={cx(
          "transition-transform duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
          isDraggingOver && "-translate-y-0.5",
        )}
      />
      <span>{disabled ? disabledMessage : isDraggingOver ? "Relâchez" : label}</span>

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
    </button>
  );
}
