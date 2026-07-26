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
