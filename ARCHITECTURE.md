# ARCHITECTURE.md — Stack & technologie

> Contrainte maîtresse : **coût d'infra quasi nul** au MVP. Dérivé de `comparateur-immo-specs.md` §12, optimisé.

## Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────┐
│  CLIENT (Next.js App Router / React) — Vercel                │
│  Import (rampes) · Comparateur · Panneau scénarios · Score   │
└───────────────┬─────────────────────────────┬───────────────┘
                │ Server Actions / Route Handlers
                ▼                             ▼
┌───────────────────────────┐   ┌─────────────────────────────┐
│  MOTEUR DE CALCUL (TS)     │   │  SERVICE EXTRACTION (LLM)   │
│  pur, déterministe,        │   │  multimodal — capture/texte │
│  testé, sans I/O           │   │  → champs N1 uniquement     │
└───────────────────────────┘   └─────────────────────────────┘
                │                             │
                ▼                             ▼
┌─────────────────────────────────────────────────────────────┐
│  COUCHE DONNÉES MARCHÉ (N2) — connecteurs open data          │
│  BAN · DVF · Carte loyers · INSEE · Géorisques · ADEME       │
│  (fetch + normalisation + cache)                             │
└───────────────┬─────────────────────────────────────────────┘
                ▼
┌─────────────────────────────────────────────────────────────┐
│  SUPABASE — Postgres (biens, comparaisons, crédits) + Auth   │
│  + Storage (captures) + cache données marché                 │
└─────────────────────────────────────────────────────────────┘
                                              │
                                              ▼  Stripe (crédits)
```

## Stack retenue

| Brique | Choix | Justification / coût |
|--------|-------|----------------------|
| Frontend + hosting | **Next.js (App Router) sur Vercel** | Gratuit au départ, Fluid Compute (Node.js complet côté serveur), server actions. |
| Backend logique | **Route Handlers / Server Actions Next.js** | Pas de serveur séparé à maintenir pour le MVP. Fluid Compute couvre le compute. |
| BDD + Auth + Storage | **Supabase** (Postgres + Auth + Storage) | Gratuit au départ. Storage pour les captures d'écran importées. RLS pour l'isolation utilisateur. |
| Moteur de calcul | **TypeScript pur** (package/module isolé, sans I/O) | Déterministe, testable en isolation, réutilisable client+serveur. Pas de FastAPI au MVP (évite un 2e déploiement). |
| Extraction texte/image | **API Grok** (multimodal, gratuit) appelée au minimum | Coût nul, multimodal (capture d'écran). N'extrait QUE les champs N1, jamais de calcul. |
| Auth | **Supabase Auth** — Google + email/mot de passe | Gratuit, session SSR déjà câblée. |
| Données marché (N2) | Connecteurs **BAN, DVF, Carte des loyers, INSEE, Géorisques, ADEME** | Open data gratuit. Résultats cachés en base. |
| Paiement | **Stripe** | Aucun coût fixe, commission par transaction, modèle crédits natif. |

> ⚠️ Note plateforme (Vercel 2026) : Edge Functions dépréciées — utiliser **Fluid Compute** (Node.js complet, même prix/régions). Config projet via `vercel.ts` (remplace `vercel.json`). Vercel Postgres/KV n'existent plus → la BDD est **Supabase**, pas un produit Vercel.

## Découpage en modules

| Module | Rôle | Dépendances I/O |
|--------|------|-----------------|
| `calc/` | Moteur déterministe : rendement, cash-flow, TRI, fiscalité (nue/LMNP), plus-value, score. | **Aucune** (fonctions pures). |
| `market/` | Connecteurs open data N2 + normalisation + cache. | Réseau (APIs), Supabase (cache). |
| `extract/` | Appel **Grok** multimodal, prompt d'extraction N1, validation de schéma strict. | Grok API. |
| `import/` | Orchestration des rampes A/B/C → confirmation. | `extract`, `market`. |
| `compare/` | Assemblage biens + calcul relatif + code couleur + synthèse. | `calc`. |
| `scoring/` | Pondérations, profils, normalisation 100 %, détail par critère. | `calc`. |
| `billing/` | Crédits, floutage freemium, Stripe. | Stripe, Supabase. |
| `ui/` | Composants React : comparateur, formulaire, panneau scénarios, tooltips. | — |

## Frontières architecturales à tenir

1. **`calc/` ne fait jamais d'I/O et ne dépend d'aucun LLM.** Toute valeur financière y est produite. Testé unitairement, exhaustivement.
2. **`extract/` (Grok) ne produit que du N1 structuré.** Sortie validée par un schéma strict avant tout usage. Un chiffre financier ne transite jamais par le LLM.
3. **`market/` cache agressivement.** Les données open data changent lentement (DVF trimestriel, INSEE annuel) → cache long en base, économise appels et latence.
4. **Le scraping de liens (`import` rampe A) est isolé et jetable.** Non bloquant : tout échec bascule vers capture/manuel. Aucune brique cœur ne doit en dépendre.

## Données & modèle (Supabase, esquisse)

- `properties` — champs N1 saisis + `address_key` (INSEE/BAN) + snapshot N2 au moment de l'analyse.
- `market_cache` — clé géographique → payload N2 normalisé + TTL par source.
- `comparisons` — set de biens + profil de score + config scénarios.
- `users` / `credits` — solde de crédits, historique d'achats Stripe.
- RLS activé partout : un utilisateur ne lit que ses biens/comparaisons.

## Anti-contournement (Phase 2)

Le produit doit **empêcher** d'analyser un bien, puis un autre lien, et de les juxtaposer d'une page à l'autre sans payer la comparaison. La comparaison est une action facturée (1 crédit) et l'analyse enrichie n'existe **que** dans un contexte de comparaison (une analyse isolée n'a pas de référentiel). Le wallet stocke les biens, mais le comparatif reste l'acte de valeur.

## Sécurité (Phase 7)

Durcissement complet en fin de parcours : RLS Supabase partout, validation stricte des entrées (formulaire + sortie Grok), gestion des secrets, rate-limiting. Campagne d'attaques offensives via le repo **Strix** contre l'app déployée, puis correction des failles.

## Décisions techniques

- Moteur de calcul : **TS pur** (retenu) vs micro-API Python/FastAPI (repoussé — évite un 2e déploiement au MVP).
- LLM d'extraction : **API Grok** multimodal, gratuit (retenu).
- Auth : **Supabase Auth** — Google + email/mot de passe (retenu).
- Paiement : **Stripe**, modèle crédits (retenu).
- Frontend : **Vercel** (retenu) vs Cloudflare Pages (alternative équivalente en coût).
