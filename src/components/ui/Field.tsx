"use client";

import { useId } from "react";
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/cx";
import { IconCheck, IconChevronDown } from "@/components/ui/Icon";
import { InfoTip } from "@/components/ui/Feedback";

/**
 * Champs de saisie — réglages d'instrument.
 *
 * Rectangles tendus, filet unique, fond enfoncé d'un cran. Au focus, le filet
 * passe à la braise : un seul champ actif à la fois, on voit où l'on est sans
 * chercher. Aucun ombrage, aucune rondeur.
 */

const CONTROL =
  "w-full rounded-sm border border-line bg-sunken px-3 text-sm text-text " +
  "placeholder:text-text-4 outline-none " +
  "transition-[border-color,background-color] duration-[140ms] ease-[cubic-bezier(0.2,0,0,1)] " +
  "hover:border-line-strong focus:border-accent focus:bg-canvas " +
  "disabled:cursor-not-allowed disabled:opacity-45";

export function FieldLabel({
  htmlFor,
  children,
  aside,
  info,
  infoTitle,
}: {
  htmlFor?: string;
  children: ReactNode;
  aside?: ReactNode;
  info?: string;
  infoTitle?: string;
}) {
  return (
    <div className="mb-2 flex items-baseline justify-between gap-3">
      <span className="flex items-center gap-1.5">
        <label htmlFor={htmlFor} className="text-[12.5px] text-text-2">
          {children}
        </label>
        {info && <InfoTip text={info} title={infoTitle} />}
      </span>
      {aside}
    </div>
  );
}

export function Input({
  label,
  hint,
  className,
  id,
  ...rest
}: { label?: string; hint?: string } & InputHTMLAttributes<HTMLInputElement>) {
  const auto = useId();
  const fieldId = id ?? auto;
  return (
    <div className="min-w-0">
      {label && <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>}
      <input id={fieldId} className={cx(CONTROL, "h-9.5", className)} {...rest} />
      {hint && <p className="mt-1.5 text-xs text-text-3">{hint}</p>}
    </div>
  );
}

export function Textarea({
  label,
  hint,
  className,
  id,
  ...rest
}: { label?: string; hint?: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const auto = useId();
  const fieldId = id ?? auto;
  return (
    <div className="min-w-0">
      {label && <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>}
      <textarea
        id={fieldId}
        className={cx(CONTROL, "resize-y py-2.5 leading-relaxed", className)}
        {...rest}
      />
      {hint && <p className="mt-1.5 text-xs text-text-3">{hint}</p>}
    </div>
  );
}

export function Select({
  label,
  className,
  id,
  children,
  ...rest
}: { label?: string } & SelectHTMLAttributes<HTMLSelectElement>) {
  const auto = useId();
  const fieldId = id ?? auto;
  return (
    <div className="min-w-0">
      {label && <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>}
      <div className="relative">
        <select
          id={fieldId}
          className={cx(CONTROL, "h-9.5 cursor-pointer appearance-none pr-9", className)}
          {...rest}
        >
          {children}
        </select>
        <IconChevronDown
          size={14}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-3"
        />
      </div>
    </div>
  );
}

/**
 * Case à cocher dessinée à la main : le natif est masqué, la marque est une
 * plaque carrée qui s'allume à la braise. Le glyphe reste un vrai SVG, pas un
 * caractère typographique.
 */
export function Checkbox({
  label,
  checked,
  onChange,
  disabled,
  className,
}: {
  label: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <label
      className={cx(
        "group flex cursor-pointer items-start gap-2.5 text-sm text-text-2 transition-colors",
        "hover:text-text",
        disabled && "cursor-not-allowed opacity-45",
        className,
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className={cx(
          "mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border",
          "transition-[background-color,border-color] duration-[140ms]",
          "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent",
          checked
            ? "border-accent bg-accent text-ink-fg"
            : "border-line-strong bg-sunken group-hover:border-text-3",
        )}
      >
        {checked && <IconCheck size={11} strokeWidth={2.4} />}
      </span>
      <span className="leading-snug">{label}</span>
    </label>
  );
}

/**
 * Curseur d'instrument.
 *
 * Le rail est gravé de graduations, la partie parcourue s'allume à la braise, et
 * le curseur lui-même est une aiguille — un filet vertical, pas une bille. La
 * valeur est en chasses fixes, alignée à droite : quand on balaye la plage, le
 * nombre ne tremble pas.
 */
export function Slider({
  label,
  info,
  value,
  min,
  max,
  step,
  unit = "",
  onChange,
  disabled,
}: {
  label: string;
  /** Définition du réglage — tirée du glossaire, jamais rédigée sur place. */
  info?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  const id = useId();
  // Arrondi obligatoire : un flottant brut se sérialise différemment côté
  // serveur et côté client, ce qui casse l'hydratation React.
  const pct = (((value - min) / (max - min)) * 100).toFixed(2);

  return (
    <div className={cx("min-w-0", disabled && "opacity-45")}>
      <FieldLabel
        htmlFor={id}
        info={info}
        infoTitle={label}
        aside={
          <span className="num text-[13.5px] font-medium text-text">
            {Number.isInteger(step) ? value : value.toFixed(2).replace(/0$/, "")}
            {unit}
          </span>
        }
      >
        {label}
      </FieldLabel>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="estio-range"
        style={{ ["--fill" as string]: `${pct}%` }}
      />
    </div>
  );
}

/** Saisie numérique libre, alignée en chasses fixes. */
export function NumberField({
  label,
  value,
  min = 0,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  const id = useId();
  return (
    <div className="min-w-0">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="relative">
        <input
          id={id}
          type="number"
          min={min}
          value={value}
          onChange={(e) => onChange(Math.max(min, Number(e.target.value) || 0))}
          className={cx(CONTROL, "num h-9.5", suffix && "pr-9")}
        />
        {suffix && (
          <span className="num pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-3">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

/** Regroupement de réglages, avec sa légende sérigraphiée. */
export function FieldSet({
  legend,
  children,
  className,
}: {
  legend: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <fieldset className={cx("min-w-0", className)}>
      <legend className="t-label mb-4 flex w-full items-center gap-3">
        <span className="shrink-0">{legend}</span>
        <span className="h-px flex-1 bg-line-soft" aria-hidden />
      </legend>
      <div className="flex flex-col gap-4">{children}</div>
    </fieldset>
  );
}
