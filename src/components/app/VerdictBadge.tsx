import type { Verdict } from "@/lib/calc/score";
import { verdictLabel } from "@/lib/calc/score";

const VERDICT_CLASSES: Record<Verdict, string> = {
  pepite: "border-score-high/40 bg-score-high/20 text-score-high",
  solide: "border-score-high/25 bg-score-high/10 text-score-high",
  correct: "border-score-mid/30 bg-score-mid/15 text-score-mid",
  a_eviter: "border-score-low/30 bg-score-low/15 text-score-low",
};

export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${VERDICT_CLASSES[verdict]}`}
    >
      {verdictLabel(verdict)}
    </span>
  );
}
