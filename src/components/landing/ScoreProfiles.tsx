"use client";

import { motion } from "motion/react";
import { useState } from "react";

/**
 * Démo interactive du score : changer de profil recalcule les pondérations,
 * les barres se réajustent sur ressort (scaleX, transform-only).
 * Rend le principe "c'est ton score" tangible.
 */
const PROFILS: Record<string, { rendement: number; securite: number; potentiel: number }> = {
  "Rentabilité immédiate": { rendement: 55, securite: 20, potentiel: 25 },
  "Patrimoine long terme": { rendement: 25, securite: 25, potentiel: 50 },
  Sécurité: { rendement: 20, securite: 55, potentiel: 25 },
  Équilibré: { rendement: 34, securite: 33, potentiel: 33 },
};

const CRITERES = [
  { key: "rendement", label: "Rendement" },
  { key: "securite", label: "Sécurité" },
  { key: "potentiel", label: "Potentiel" },
] as const;

export function ScoreProfiles() {
  const [actif, setActif] = useState("Équilibré");
  const poids = PROFILS[actif];

  return (
    <div className="rounded-xl border border-border bg-bg-elevated p-6 shadow-[0_20px_40px_-24px_rgba(70,50,30,0.25)]">
      <div className="text-sm text-faint">Profil</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {Object.keys(PROFILS).map((p) => (
          <button
            key={p}
            onClick={() => setActif(p)}
            aria-pressed={p === actif}
            className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-colors active:scale-[0.97] ${
              p === actif ? "bg-brand text-white" : "bg-bg-alt text-text hover:text-brand"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {CRITERES.map((c) => {
          const val = poids[c.key];
          return (
            <div key={c.key}>
              <div className="flex justify-between text-sm text-muted">
                <span>{c.label}</span>
                <span className="font-sans font-semibold text-text">{val} %</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-bg-alt">
                <motion.div
                  className="h-full origin-left rounded-full bg-gradient-to-r from-accent to-brand"
                  style={{ width: "100%" }}
                  animate={{ scaleX: val / 100 }}
                  transition={{ type: "spring", stiffness: 120, damping: 20 }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-5 text-xs text-faint">
        Les pondérations se normalisent à 100 %. Le détail du calcul reste
        visible, critère par critère.
      </p>
    </div>
  );
}
