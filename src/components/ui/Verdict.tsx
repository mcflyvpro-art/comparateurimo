import { verdictFromScore } from "@/lib/verdict";
import { cx } from "@/lib/cx";

/**
 * LE VERDICT — ce qu'on lit en premier, partout.
 *
 * En v1, le score était une jauge de vingt-huit segments incandescents avec un
 * nom de température. Impossible à lire sans apprendre le système. Ici, un mot
 * en français arrive avant le chiffre, une barre simple donne l'ordre de
 * grandeur, et une phrase dit quoi faire.
 *
 * Le chiffre n'est jamais seul : un « 54 » ne veut rien dire à quelqu'un qui
 * n'a pas de référentiel.
 */

/* -------------------------------------------------------------------------- */

/**
 * Bloc complet — un seul par écran, en tête de fiche.
 */
export function VerdictBlock({
  score,
  className,
  compact = false,
}: {
  score: number | null;
  className?: string;
  /** Sans la phrase de conseil — pour un panneau latéral étroit. */
  compact?: boolean;
}) {
  const v = verdictFromScore(score);

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-4">
        <span
          className="text-[1.375rem] font-medium leading-tight tracking-[-0.02em]"
          style={{ color: v.color }}
        >
          {v.label}
        </span>
        {score !== null && (
          <span className="num shrink-0 text-[13px] text-text-3">
            <span className="text-text-2">{score}</span>
            <span className="text-text-4"> / 100</span>
          </span>
        )}
      </div>

      <VerdictBar score={score} className="mt-3" height={5} />

      {!compact && (
        <p className="mt-4 max-w-lg text-[13.5px] leading-relaxed text-text-2">
          {v.advice}
        </p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Barre simple. Une piste, un remplissage, aucune graduation à déchiffrer.
 */
export function VerdictBar({
  score,
  height = 4,
  className,
}: {
  score: number | null;
  height?: number;
  className?: string;
}) {
  const v = verdictFromScore(score);
  const pct = score === null ? 0 : Math.min(100, Math.max(0, score));

  return (
    <div
      className={cx("w-full overflow-hidden rounded-full bg-surface-active", className)}
      style={{ height }}
      role="meter"
      aria-valuenow={score ?? undefined}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${v.label}${score !== null ? ` — ${score} sur 100` : ""}`}
    >
      <div
        className="h-full rounded-full transition-[width,background-color] duration-[420ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ width: `${pct.toFixed(1)}%`, background: v.color }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Étiquette compacte — carte de bien, ligne de tableau.
 * Le point coloré porte le niveau, le mot le confirme.
 */
export function VerdictPill({
  score,
  showScore = false,
  className,
}: {
  score: number | null;
  showScore?: boolean;
  className?: string;
}) {
  const v = verdictFromScore(score);

  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-sm border px-2 py-[3px] text-[11.5px] font-medium",
        className,
      )}
      style={{
        background: `color-mix(in srgb, ${v.color} 16%, transparent)`,
        borderColor: `color-mix(in srgb, ${v.color} 38%, transparent)`,
        color: v.color,
      }}
    >
      <span
        aria-hidden
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ background: v.color }}
      />
      {v.label}
      {showScore && score !== null && <span className="num opacity-75">{score}</span>}
    </span>
  );
}

/* -------------------------------------------------------------------------- */

/** Pastille seule — épingle de carte, cellule très dense. */
export function VerdictDot({
  score,
  size = 8,
  className,
}: {
  score: number | null;
  size?: number;
  className?: string;
}) {
  const v = verdictFromScore(score);
  return (
    <span
      className={cx("inline-block shrink-0 rounded-full", className)}
      style={{ width: size, height: size, background: v.color }}
      title={v.label}
    />
  );
}
