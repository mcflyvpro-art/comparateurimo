# MVP.md — Features par phase

> Catalogue détaillé des features, rangé selon la **roadmap 7 phases** (`PROGRESS.md`).
> Cases `- [ ]` : **seul l'utilisateur coche**. Claude ne coche jamais.
> On avance 1 par 1 : chaque feature démarre par un brainstorm de sa phase, puis petite spec + petit plan.

## Objectif MVP

Permettre à un investisseur d'**importer un bien**, de le voir **analysé**, de le **stocker dans son wallet**, d'en **ajouter un 2e** et de les **comparer côte à côte** avec un **score personnalisé** — sous un système de **crédits** (1/analyse, 1/comparaison) et un **floutage freemium** qui pousse à l'achat. Coût d'infra quasi nul.

---

## Phase 1 — Design/UI & arborescence

Landing quasi finie (placeholders tolérés) + **toute** l'arborescence du site.

- [ ] Design system & tokens Estio (couleurs, typo, coins, motion)
- [ ] Landing complète, animée, accessible (AA)
- [ ] Header + footer partagés, responsive, liens vivants
- [ ] Inventaire figé de toutes les pages du site
- [ ] Toutes les pages créées en coquilles stylées
- [ ] Placeholders assumés et listés (contenus/images/chiffres provisoires)

## Phase 2 — Le comparateur (cœur produit)

### E1 — Import d'un bien (rampes → formulaire unique)
Toutes les rampes convergent vers **le même écran de confirmation pré-rempli** (fallback si l'une échoue).

- [ ] Bouton « + Ajouter un bien » → 3 tuiles (capture / copier-coller / manuel)
- [ ] Rampe **capture d'écran / photo** lue par Grok multimodal (rampe universelle)
- [ ] Rampe **copier-coller** de texte d'annonce → extraction Grok
- [ ] Rampe **manuelle** : formulaire + autocomplétion adresse BAN
- [ ] Fallback + pré-remplissage : on extrait ce qu'on peut, l'utilisateur corrige les trous
- [ ] Écran de confirmation : validation/correction des champs N1 + affichage N2 dérivé

### Connexion IA
- [ ] Câblage **API Grok** (multimodal, gratuit) — extraction N1 **uniquement**, jamais de chiffre financier
- [ ] Schéma strict de validation de la sortie Grok

### E2 — Enrichissement marché (N2, dérivé de l'adresse)
- [ ] Géocodage BAN (adresse → coordonnées / code INSEE)
- [ ] Prix/m² secteur via DVF
- [ ] Loyer estimé via Carte des loyers
- [ ] Tension locative / zonage A-B-C (INSEE)
- [ ] Taux de vacance (INSEE)
- [ ] Risques naturels/techno (Géorisques)
- [ ] Contexte socio-démo (INSEE)
- [ ] Cache agressif des données N2 en base (DVF trimestriel, INSEE annuel)

### E3 — Moteur de calcul (déterministe, `calc/`, sans I/O ni LLM)
- [ ] Rendement brut / net / net-net
- [ ] Cash-flow mensuel (avant/après impôt)
- [ ] Fiscalité — location nue (micro-foncier / réel + déficit foncier)
- [ ] Fiscalité — LMNP (micro-BIC / réel avec amortissement)
- [ ] Impact TMI + prélèvements sociaux (17,2 %)
- [ ] TRI sur horizon choisi
- [ ] Plus-value de revente (abattements durée de détention)
- [ ] Effet de levier du crédit

### E4 — Score personnalisé (`scoring/`)
- [ ] Score composite pondéré, normalisé à 100 %
- [ ] Profils préréglés (Rentabilité / Patrimoine / Sécurité / Équilibré)
- [ ] Détail du score critère par critère (transparence, jamais de boîte noire)
- [ ] Mode pro — curseurs de pondération fins

### E5 — Comparateur & wallet visible
- [ ] Analyse d'un bien affichée après formulaire complet
- [ ] Bien stocké dans le **wallet visible**
- [ ] Ajout dynamique d'un 2e bien
- [ ] Vue côte à côte 2 biens
- [ ] Bouton « Comparer » qui **pousse à la comparaison**
- [ ] Code couleur relatif par ligne (le meilleur des biens comparés)
- [ ] Données analytiques **enrichies uniquement en comparaison** (analyse seule = pas de référentiel)
- [ ] Ligne de synthèse « le plus pertinent selon ta stratégie »
- [ ] Mode Simple ↔ Pro + toggles de colonnes
- [ ] Tooltips pédagogiques `?` sur chaque terme technique
- [ ] Comparaison de N biens (>2)

### E6 — Scénarios (post-comparaison, N3)
- [ ] Simulation d'emprunt (apport, taux, durée, assurance → mensualité, coût, CF, TRI)
- [ ] Choix de stratégie (nue / LMNP / revente) → recalcul fiscalité
- [ ] Horizon court / moyen / long
- [ ] Scénarios de marché prudent / central / dynamique
- [ ] Comparaison de configs d'un même bien (apport 10 % vs 20 %)

### Crédits, anti-contournement & floutage (Phase 2)
- [ ] 1 crédit consommé par **analyse** de bien
- [ ] 1 crédit consommé par **comparaison**
- [ ] **Anti-contournement** : impossible d'analyser 2 biens séparément et de les juxtaposer d'une page à l'autre
- [ ] Écrit clair de ce qu'on analyse et de ce que chaque abonnement débloque
- [ ] Le reste **flouté complet** + cadenas + « Débloquer » → pousse à l'achat
- [ ] Même logique de floutage/clarté sur le **wallet**

## Phase 3 — Le wallet
- [ ] Wallet comme feature centrale (solde, historique, biens stockés)
- [ ] Grille tarifaire intégrée (Free / Pro / Expert)
- [ ] Recharge de crédits (réservée aux abonnés payants)

## Phase 4 — Pages header/footer
- [ ] Mentions légales (raison sociale, hébergeur, DPO)
- [ ] CGU
- [ ] Politique de confidentialité
- [ ] À propos + pages de texte
- [ ] FAQ, contact

## Phase 5 — Comptes & sessions
- [ ] Auth Supabase — connexion Google
- [ ] Auth Supabase — email + mot de passe
- [ ] Session utilisateur connectée au wallet
- [ ] RLS : chacun ne lit que ses biens/comparaisons

## Phase 6 — Stripe
- [ ] Intégration paiement Stripe (modèle crédits)
- [ ] Abonnements Pro / Expert (mensuel / annuel remisé)
- [ ] Achat de recharges de crédits

## Phase 7 — Cybersécurité
- [ ] Code review détaillée (tous les petits détails, polish)
- [ ] Durcissement (RLS, validation d'entrées, secrets, rate-limit)
- [ ] Campagne d'attaques via le repo **Strix**
- [ ] Corrections des failles trouvées

---

## Questions ouvertes (à trancher au brainstorm de chaque phase)

1. Cible d'onboarding par défaut : débutant guidé ou investisseur aguerri ?
2. Pondérations de départ exactes des profils de score.
3. Frontière gratuit/payant précise : quoi flouter, quantités de crédits.
4. Périmètre géographique MVP : France entière ou villes tests ?
5. Nombre de biens comparables simultanément (2 ou N).
6. Détails d'intégration Grok (limites gratuites, format multimodal, coût de repli).
