# MVP.md — Features

> Périmètre de la première version livrable d'**Arpent**. Dérivé de `comparateur-immo-specs.md`.
> Statut de chaque feature : ⬜ à faire · 🟨 en cours · ✅ fait.

## Objectif MVP

Permettre à un investisseur d'**ajouter ≥2 biens**, de les voir **enrichis automatiquement** par les données de marché, **comparés côte à côte** avec un **score personnalisé**, puis de **simuler un emprunt**. Coût d'infra quasi nul.

---

## Épiques & features

### E1 — Import d'un bien (les rampes → formulaire)
Toutes les rampes convergent vers le **même écran de confirmation pré-rempli**.

| # | Feature | Priorité | Statut |
|---|---------|----------|--------|
| E1.1 | Bouton « + Ajouter un bien » → 3 tuiles (lien / capture / manuel) | P0 | ⬜ |
| E1.2 | **Rampe B — capture d'écran / photo** lue par LLM multimodal (rampe universelle) | P0 | ⬜ |
| E1.3 | Rampe C — saisie manuelle + autocomplétion adresse BAN | P0 | ⬜ |
| E1.4 | Écran de confirmation : validation/correction des champs N1 + affichage N2 dérivé | P0 | ⬜ |
| E1.5 | Rampe A — coller un lien (LLM tente, non bloquant, bascule silencieuse vers B/C si échec) | P2 | ⬜ |

### E2 — Enrichissement marché (N2, automatique)
Déclenché par le géocodage de l'adresse.

| # | Feature | Priorité | Statut |
|---|---------|----------|--------|
| E2.1 | Géocodage BAN (adresse → coordonnées / code INSEE) | P0 | ⬜ |
| E2.2 | Prix/m² secteur via DVF | P0 | ⬜ |
| E2.3 | Loyer estimé via Carte des loyers | P0 | ⬜ |
| E2.4 | Tension locative / zonage A-B-C (INSEE) | P1 | ⬜ |
| E2.5 | Taux de vacance (INSEE) | P1 | ⬜ |
| E2.6 | Risques naturels/techno (Géorisques) | P1 | ⬜ |
| E2.7 | Contexte socio-démo (INSEE) | P2 | ⬜ |
| E2.8 | Aménités (écoles, transports, commerces) | P2 | ⬜ |
| E2.9 | Historique/évolution prix (DVF historique) | P2 | ⬜ |

### E3 — Moteur de calcul (déterministe)

| # | Feature | Priorité | Statut |
|---|---------|----------|--------|
| E3.1 | Rendement brut / net / net-net | P0 | ⬜ |
| E3.2 | Cash-flow mensuel (avant/après impôt) | P0 | ⬜ |
| E3.3 | Fiscalité — location nue (micro-foncier / réel + déficit foncier) | P1 | ⬜ |
| E3.4 | Fiscalité — LMNP (micro-BIC / réel avec amortissement) | P1 | ⬜ |
| E3.5 | Impact TMI + prélèvements sociaux (17,2 %) | P1 | ⬜ |
| E3.6 | TRI sur horizon choisi | P1 | ⬜ |
| E3.7 | Plus-value de revente (abattements durée de détention) | P2 | ⬜ |
| E3.8 | Effet de levier du crédit | P2 | ⬜ |

### E4 — Score personnalisé

| # | Feature | Priorité | Statut |
|---|---------|----------|--------|
| E4.1 | Score composite pondéré, normalisé à 100 % | P0 | ⬜ |
| E4.2 | Profils préréglés (Rentabilité / Patrimoine / Sécurité / Équilibré) | P0 | ⬜ |
| E4.3 | Détail du score critère par critère (transparence) | P0 | ⬜ |
| E4.4 | Mode pro — curseurs de pondération fins | P2 | ⬜ |

### E5 — Comparateur (affichage)

| # | Feature | Priorité | Statut |
|---|---------|----------|--------|
| E5.1 | Vue côte à côte 2 biens, ajout dynamique | P0 | ⬜ |
| E5.2 | Code couleur relatif par ligne (vert = meilleur des biens comparés) | P0 | ⬜ |
| E5.3 | Ligne de synthèse « le plus pertinent selon ta stratégie » | P1 | ⬜ |
| E5.4 | Mode Simple ↔ Pro (master switch) + toggles de colonnes | P1 | ⬜ |
| E5.5 | Tooltips pédagogiques `?` sur chaque terme technique | P1 | ⬜ |
| E5.6 | Comparaison de N biens (>2) | P2 | ⬜ |

### E6 — Scénarios (post-comparaison)

| # | Feature | Priorité | Statut |
|---|---------|----------|--------|
| E6.1 | Simulation d'emprunt (apport, montant, taux, durée, assurance → mensualité, coût, impact CF/TRI) | P1 | ⬜ |
| E6.2 | Choix de stratégie (nue / LMNP / revente) → recalcul fiscalité | P1 | ⬜ |
| E6.3 | Horizon court / moyen / long | P2 | ⬜ |
| E6.4 | Scénarios de marché prudent / central / dynamique | P2 | ⬜ |
| E6.5 | Comparaison de configs d'un même bien (ex. 10 % vs 20 % apport) | P2 | ⬜ |

### E7 — Compte, crédits & paiement

| # | Feature | Priorité | Statut |
|---|---------|----------|--------|
| E7.1 | Auth (Supabase) | P1 | ⬜ |
| E7.2 | Système de crédits (N analyses gratuites puis achat) | P1 | ⬜ |
| E7.3 | Floutage freemium de l'insight + cadenas + « Débloquer » | P1 | ⬜ |
| E7.4 | Paiement Stripe (crédits) | P2 | ⬜ |

---

## Légende priorités

- **P0** — cœur du MVP, sans quoi le produit n'existe pas (import capture → enrichissement → comparaison → score).
- **P1** — complète l'expérience MVP (fiscalité, scénarios d'emprunt, freemium).
- **P2** — enrichissement / v1.1, non bloquant pour le premier lancement.

## Questions ouvertes (specs §14 — à trancher avant de figer)

1. Cible d'onboarding par défaut : débutant guidé ou investisseur aguerri ?
2. Pondérations de départ exactes des profils de score.
3. Frontière gratuit/payant : quoi flouter, combien de crédits offerts.
4. Périmètre géographique MVP : France entière ou villes tests ?
5. Nombre de biens comparables simultanément (2 ou N).
6. Modèle LLM multimodal retenu (coût/qualité).
