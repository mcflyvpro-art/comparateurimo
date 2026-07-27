"use client";

import { Fragment, useState } from "react";
import { MagneticButton } from "@/components/landing/MagneticButton";
import { Toggle } from "@/components/ui/Controls";
import { Reveal } from "@/components/ui/Feedback";
import { IconArrowRight, IconCheck, IconLock, IconMinus } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";

/**
 * Formules — abonnement, jamais de crédits sur la boucle cœur.
 *
 * Décision produit structurante rendue lisible : mettre un compteur sur le
 * verdict taxerait le haut de l'entonnoir, là où l'on veut du volume. Le
 * pré-verdict est donc gratuit et illimité ; ce qui se paie, c'est l'INSIGHT —
 * le loyer précis, le détail du score, le net-net, le scénario en direct.
 *
 * Et on ne floute jamais la donnée publique brute : DVF et INSEE sont ouverts,
 * les revendre serait malhonnête. On vend la synthèse, le calcul, l'arbitrage.
 */

type Plan = {
  key: string;
  nom: string;
  prix: { mois: number; an: number };
  cible: string;
  pitch: string;
  points: { label: string; inclus: boolean }[];
  populaire: boolean;
};

const PLANS: Plan[] = [
  {
    key: "free",
    nom: "Free",
    prix: { mois: 0, an: 0 },
    cible: "Prendre l'habitude",
    pitch: "Un projet, trois biens, le pré-verdict en illimité. De quoi juger l'outil sur pièces.",
    points: [
      { label: "1 projet · 3 biens", inclus: true },
      { label: "Pré-verdict illimité", inclus: true },
      { label: "5 captures par mois", inclus: true },
      { label: "Comparaison de 2 biens", inclus: true },
      { label: "Données de marché précises", inclus: false },
      { label: "Scénario en direct", inclus: false },
    ],
    populaire: false,
  },
  {
    key: "pro",
    nom: "Pro",
    prix: { mois: 24, an: 240 },
    cible: "Recherche active",
    pitch: "L'outil complet pendant les quatre mois où vous cherchez vraiment. Vous payez le temps de votre recherche.",
    points: [
      { label: "5 projets · 25 biens chacun", inclus: true },
      { label: "Marché précis, détail du score", inclus: true },
      { label: "Net-net, TRI, scénario en direct", inclus: true },
      { label: "100 captures par mois", inclus: true },
      { label: "Alertes prix & taux hebdomadaires", inclus: true },
      { label: "Export PDF & dossier bancaire", inclus: true },
    ],
    populaire: true,
  },
  {
    key: "expert",
    nom: "Expert",
    prix: { mois: 59, an: 590 },
    cible: "CGP & chasseurs",
    pitch: "Pour ceux dont le métier est de produire une recommandation. Le rapport devient le livrable.",
    points: [
      { label: "Projets et biens illimités", inclus: true },
      { label: "Tout le plan Pro", inclus: true },
      { label: "Captures illimitées", inclus: true },
      { label: "Alertes en temps réel", inclus: true },
      { label: "Comparaison illimitée", inclus: true },
      { label: "Rapport en marque blanche", inclus: true },
    ],
    populaire: false,
  },
];

type Cell = string | boolean;

const MATRIX: { section: string; rows: { label: string; values: [Cell, Cell, Cell] }[] }[] = [
  {
    section: "Périmètre",
    rows: [
      { label: "Projets simultanés", values: ["1", "5", "Illimité"] },
      { label: "Biens par projet", values: ["3", "25", "Illimité"] },
      { label: "Captures par mois", values: ["5", "100", "Illimité"] },
    ],
  },
  {
    section: "Analyse",
    rows: [
      { label: "Pré-verdict (score + drapeaux)", values: [true, true, true] },
      { label: "Données de marché précises", values: [false, true, true] },
      { label: "Détail du score critère par critère", values: [false, true, true] },
      { label: "Rendement net-net & TRI", values: [false, true, true] },
      { label: "Scénario en direct (curseurs)", values: [false, true, true] },
      { label: "Comparateur des six régimes fiscaux", values: [false, true, true] },
    ],
  },
  {
    section: "Décision",
    rows: [
      { label: "Comparaison côte à côte", values: ["2 biens", "3 biens", "Illimité"] },
      { label: "Profils d'arbitrage", values: ["Équilibré seul", "Tous", "Tous"] },
      { label: "Verdict en langage naturel", values: [false, true, true] },
    ],
  },
  {
    section: "Suivi & sortie",
    rows: [
      { label: "Alertes prix & taux", values: [false, "Hebdomadaires", "Temps réel"] },
      { label: "Export PDF & dossier bancaire", values: [false, true, true] },
      { label: "Rapport en marque blanche", values: [false, false, true] },
    ],
  },
];

export function PricingTable() {
  const [periode, setPeriode] = useState<"mois" | "an">("mois");
  const annuel = periode === "an";

  return (
    <div>
      <div className="flex items-center justify-center gap-4">
        <Toggle
          layoutKey="pricing-period"
          active={periode}
          onSelect={(k) => setPeriode(k as "mois" | "an")}
          items={[
            { key: "mois", label: "Mensuel" },
            { key: "an", label: "Annuel" },
          ]}
        />
        <span className="text-[12px] text-text-3">
          Annuel :{" "}
          <span className="text-brand">deux mois offerts</span>
        </span>
      </div>

      {/* Les trois cartes */}
      <div className="mt-12 grid gap-4 lg:grid-cols-3">
        {PLANS.map((p, i) => (
          <Reveal key={p.key} cine delay={i * 0.06}>
            <article
              className={cx(
                "relative flex h-full flex-col rounded-lg border bg-surface p-7",
                p.populaire ? "border-hairline-ember" : "border-hairline",
              )}
              style={
                p.populaire
                  ? { boxShadow: "0 0 70px -28px var(--brand-glow)" }
                  : undefined
              }
            >
              {p.populaire && (
                <span className="absolute -top-2.5 left-7 rounded-[2px] bg-brand px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.14em] text-inverse">
                  Le plus choisi
                </span>
              )}

              <div className="flex items-baseline justify-between gap-3">
                <h3 className="t-head text-text">{p.nom}</h3>
                <span className="t-caps">{p.cible}</span>
              </div>

              <div className="mt-6 flex items-baseline gap-1.5">
                <span className="num-hero text-text">
                  {p.prix.mois === 0 ? "0" : annuel ? p.prix.an : p.prix.mois}
                </span>
                <span className="num text-[13px] text-text-3">
                  € {p.prix.mois === 0 ? "" : annuel ? "/ an" : "/ mois"}
                </span>
              </div>
              {p.prix.mois > 0 && annuel && (
                <p className="num mt-1.5 text-[11px] text-text-4">
                  soit {Math.round(p.prix.an / 12)} € par mois
                </p>
              )}

              <p className="mt-5 text-[13px] leading-relaxed text-text-3">{p.pitch}</p>

              <ul className="mt-7 flex flex-1 flex-col gap-3 border-t border-hairline pt-6">
                {p.points.map((pt) => (
                  <li key={pt.label} className="flex items-start gap-2.5">
                    <span
                      className={cx(
                        "mt-px shrink-0",
                        pt.inclus ? "text-brand" : "text-text-4",
                      )}
                    >
                      {pt.inclus ? <IconCheck size={14} /> : <IconLock size={13} />}
                    </span>
                    <span
                      className={cx(
                        "text-[13px] leading-snug",
                        pt.inclus ? "text-text-2" : "text-text-4",
                      )}
                    >
                      {pt.label}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <MagneticButton
                  href="/connexion"
                  variant={p.populaire ? "solid" : "outline"}
                  className="w-full"
                  trailing={p.populaire ? <IconArrowRight size={15} /> : undefined}
                >
                  {p.nom === "Free" ? "Commencer gratuitement" : `Choisir ${p.nom}`}
                </MagneticButton>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      {/* Le tableau comparatif */}
      <Reveal cine delay={0.1}>
        <div className="mt-20">
          <h2 className="t-head text-text">Le détail, ligne par ligne</h2>
          <div className="mt-6 overflow-x-auto rounded-lg border border-hairline">
            <table className="w-full min-w-[42rem] border-collapse">
              <thead>
                <tr className="border-b border-hairline-2 bg-sunken">
                  <th className="px-4 py-3 text-left">
                    <span className="t-label">Fonctionnalité</span>
                  </th>
                  {PLANS.map((p) => (
                    <th key={p.key} className="w-40 px-4 py-3 text-center">
                      <span
                        className={cx(
                          "t-label",
                          p.populaire && "!text-brand",
                        )}
                      >
                        {p.nom}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MATRIX.map((group) => (
                  <Fragment key={group.section}>
                    <tr>
                      <td colSpan={4} className="bg-sunken/60 px-4 py-2">
                        <span className="t-caps !text-text-4">
                          {group.section}
                        </span>
                      </td>
                    </tr>
                    {group.rows.map((row) => (
                      <tr
                        key={row.label}
                        className="border-b border-hairline transition-colors last:border-0 hover:bg-raised"
                      >
                        <td className="px-4 py-2.5 text-[13px] text-text-2">
                          {row.label}
                        </td>
                        {row.values.map((v, i) => (
                          <td key={i} className="px-4 py-2.5 text-center">
                            <MatrixCell value={v} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

function MatrixCell({ value }: { value: Cell }) {
  if (value === true) {
    return (
      <span className="inline-flex text-brand" title="Inclus">
        <IconCheck size={15} />
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex text-text-4" title="Non inclus">
        <IconMinus size={15} />
      </span>
    );
  }
  return <span className="num text-[12px] text-text">{value}</span>;
}
