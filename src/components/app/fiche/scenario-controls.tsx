"use client";

/** Contrôles génériques et purement présentationnels pour le panneau de
 *  curseurs du scénario (⑦, Plan 5b) — un composant par type de champ,
 *  réutilisés pour chacun des ~19 réglages. Aucun état interne : tout est
 *  contrôlé par le parent (`SectionScenario`), qui porte la valeur et
 *  appelle `onChange` à chaque interaction. */

export function SliderControl({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-center justify-between text-xs text-faint">
        <span>{label}</span>
        <span className="font-medium text-text">
          {value}
          {unit}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border accent-brand"
      />
    </label>
  );
}

export function SelectControl<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs text-faint">{label}</span>
      <select
        value={String(value)}
        onChange={(e) => {
          const match = options.find((opt) => String(opt.value) === e.target.value);
          if (match) onChange(match.value);
        }}
        className="rounded-lg border border-border bg-bg px-2.5 py-1.5 text-sm text-text"
      >
        {options.map((opt) => (
          <option key={String(opt.value)} value={String(opt.value)}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function CheckboxControl({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-text">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-border-strong accent-brand"
      />
      {label}
    </label>
  );
}

export function NumberControl({
  label,
  value,
  min,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs text-faint">{label}</span>
      <input
        type="number"
        min={min}
        value={value}
        onChange={(e) => onChange(Math.max(min, Number(e.target.value) || 0))}
        className="rounded-lg border border-border bg-bg px-2.5 py-1.5 text-sm text-text"
      />
    </label>
  );
}
