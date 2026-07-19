"use client";

import { useState } from "react";
import { MagneticButton } from "@/components/landing/MagneticButton";

type Offre = {
  nom: string;
  prix: { mois: number; an: number };
  credits: string;
  wallet: string;
  features: string[];
  populaire: boolean;
};

const OFFRES: Offre[] = [
  {
    nom: "Free",
    prix: { mois: 0, an: 0 },
    credits: "3 crédits à vie",
    wallet: "Wallet 1 bien",
    features: ["Score personnalisé", "Comparaison de base", "Données de marché"],
    populaire: false,
  },
  {
    nom: "Pro",
    prix: { mois: 9, an: 90 },
    credits: "X crédits / mois",
    wallet: "Wallet capacité moyenne",
    features: [
      "Tout le plan Free",
      "Plus de stats & de précision",
      "Infos marché détaillées",
      "Recharge de crédits à la demande",
    ],
    populaire: true,
  },
  {
    nom: "Expert",
    prix: { mois: 19, an: 190 },
    credits: "XX crédits / mois",
    wallet: "Wallet grande capacité",
    features: [
      "Tout le plan Pro",
      "Fiscalité poussée (LMNP, TRI, plus-value)",
      "Scénarios avancés",
      "Wallet étendu",
    ],
    populaire: false,
  },
];

export function PricingTable() {
  const [annuel, setAnnuel] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-center gap-3">
        <span className={annuel ? "text-muted" : "font-medium text-text"}>
          Mensuel
        </span>
        <button
          onClick={() => setAnnuel((v) => !v)}
          role="switch"
          aria-checked={annuel}
          aria-label="Basculer mensuel / annuel"
          className="relative h-7 w-12 cursor-pointer rounded-full bg-bg-alt transition-colors"
        >
          <span
            className={`absolute top-1 size-5 rounded-full bg-brand transition-all ${
              annuel ? "left-6" : "left-1"
            }`}
          />
        </button>
        <span className={annuel ? "font-medium text-text" : "text-muted"}>
          Annuel <span className="text-score-high">−2 mois</span>
        </span>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {OFFRES.map((o) => (
          <div
            key={o.nom}
            className={`flex flex-col rounded-xl border bg-bg-elevated p-8 ${
              o.populaire
                ? "border-brand shadow-[0_20px_40px_-24px_rgba(70,50,30,0.35)]"
                : "border-border"
            }`}
          >
            {o.populaire ? (
              <span className="mb-3 self-start rounded-full bg-brand px-3 py-1 text-xs font-medium text-white">
                Le plus choisi
              </span>
            ) : null}
            <h3 className="font-sans text-xl font-semibold tracking-tight text-text">
              {o.nom}
            </h3>
            <div className="mt-4 font-sans text-4xl font-semibold tracking-tight text-text">
              {o.prix.mois === 0
                ? "0 €"
                : `${annuel ? o.prix.an : o.prix.mois} €`}
              <span className="text-base font-medium text-faint">
                {o.prix.mois === 0 ? "" : annuel ? " / an" : " / mois"}
              </span>
            </div>
            <p className="mt-4 text-sm font-medium text-brand">{o.credits}</p>
            <p className="mt-1 text-sm text-muted">{o.wallet}</p>

            <ul className="mt-6 flex-1 space-y-3">
              {o.features.map((f) => (
                <li key={f} className="flex gap-2.5 text-sm text-muted">
                  <svg className="mt-0.5 size-4 shrink-0 text-score-high" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 10l4 4 8-8" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <MagneticButton
                href="/connexion"
                variant={o.populaire ? "primary" : "ghost"}
                className="w-full"
              >
                {o.nom === "Free" ? "Commencer" : `Choisir ${o.nom}`}
              </MagneticButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
