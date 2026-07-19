# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projet

**Estio** — comparateur d'annonces immobilières orienté investissement. Compare plusieurs biens côte à côte, enrichit chaque bien avec des données de marché (open data), calcule un score personnalisé selon les priorités de l'utilisateur, puis simule des scénarios d'emprunt/rendement.

Source de vérité produit : `comparateur-immo-specs.md`. Features priorisées : `MVP.md`. Avancement : `PROGRESS.md`. Stack : `ARCHITECTURE.md`.

## Principe fondateur — 3 niveaux de données

Toute la logique de l'app découle de cette séparation. Ne jamais la mélanger.

| Niveau | Nature | Source | Exemple |
|--------|--------|--------|---------|
| **N1 — Le bien** | Saisi par l'utilisateur (~8-10 champs) | Formulaire / extraction | Adresse, prix, surface, DPE |
| **N2 — Le marché** | Dérivé automatiquement de l'adresse | API open data | Prix/m² DVF, loyer estimé, risques |
| **N3 — Les scénarios** | Réglé après comparaison | Panneau scénarios | Apport, emprunt, stratégie, horizon |

**L'adresse est le champ le plus important de l'app.** Une fois géocodée (BAN), elle déverrouille ~80 % de la donnée (N2). Le formulaire est court parce que l'essentiel apparaît en résultat, pas en saisie.

## Règles d'architecture non négociables

1. **Le moteur de calcul est déterministe, jamais un LLM.** Rendement, cash-flow, TRI, fiscalité, plus-value = maths fiscales exactes, transparentes, auditables. Un LLM ne doit JAMAIS produire un chiffre financier. Le LLM sert uniquement à : (a) extraire les champs depuis texte/image d'annonce, (b) générer des rapports en langage naturel.

2. **Le lien (scraping) est un accélérateur optionnel, jamais une dépendance.** Leboncoin/SeLoger = DataDome + CGU interdisant l'extraction + jurisprudence (CA Paris 18/02/2021, 50 000 €). **La rampe universelle d'import est la capture d'écran lue par LLM multimodal** (rampe B). Voir specs §3 et §11.

3. **Ne jamais vendre la donnée brute** (DVF/INSEE sont open data redistribuable). Vendre la **synthèse, le calcul, la comparaison**. Le floutage freemium porte sur l'insight (loyer estimé précis, projection revente, score détaillé), pas sur l'existence du prix/m².

4. **Honnêteté sur la granularité.** Vacance/tension existent à la maille commune/IRIS, pas par immeuble. Les projections de revente sont des hypothèses extrapolées, à afficher explicitement comme scénarios — jamais comme prédictions.

5. **Les rampes d'import pré-remplissent toujours le même formulaire de confirmation.** On extrait ce qu'on peut, l'utilisateur corrige les trous. Jamais de copier-coller de page entière demandé.

## Le score personnalisé

- Pondérations pilotées par l'utilisateur via **profils préréglés** (Rentabilité immédiate / Patrimoine long terme / Sécurité / Équilibré), mode pro = curseurs fins.
- Les pondérations **se normalisent à 100 %**.
- **Toujours afficher le détail** du score (pourquoi ce bien l'emporte, critère par critère). Jamais de boîte noire.
- Argument produit : « c'est *ton* score, pas le nôtre » → défendable, non contestable.

## Sources de données (N2, toutes open data gratuites)

| Donnée | Source |
|--------|--------|
| Géocodage adresse | Base Adresse Nationale (BAN) |
| Prix/m² réel | DVF (transactions notariées) |
| Loyer estimé | Carte des loyers (data.gouv) |
| Tension / zonage A/B/C | INSEE + zonage |
| Vacance locative | INSEE |
| Risques naturels/techno | Géorisques (API) |
| Socio-démo | INSEE |
| DPE | ADEME |

## Identité de marque (v0.1 — à ne pas figer sans validation)

- **Ton visuel** : « premium accessible » façon Monday.com / Linear — PAS Bloomberg Terminal.
- Fond crème chaud (jamais blanc pur clinique), couleur de marque **terre cuite / argile**, pastels doux (sauge/sable/rose poudré/bleu poudré). Scoring en pastels, jamais rouge/vert saturés feu de circulation.
- Typo : une seule grotesque humaniste ronde (pistes : General Sans, Cabinet Grotesk / Fontshare). Poids affirmé pour titres et gros chiffres.
- Coins arrondis généreux, bordures fines > ombres lourdes, icônes à trait rond.
- Nom **« Estio »** (`estio.immo`). Vérif INPI classes 36/42 non faite : ne pas engager juridiquement/financièrement le nom sans cette vérification. Charte complète : `docs/brand/estio-brandkit.md`.

## Hors-scope MVP

Fetch automatique des liens à grande échelle · extension navigateur · couverture exhaustive des plateformes · prédictions de marché « garanties ».

## Méthodologie de travail — NON NÉGOCIABLE

Ces 5 règles priment sur tout. Elles sont détaillées dans `PROGRESS.md`.

1. **Chaque grosse feature (= chaque phase) débute TOUJOURS par un gros brainstorm** avec le skill `superpowers:brainstorming`. Pas de code avant brainstorm.
2. **Le brainstorm produit une immense spec, puis on la DÉCOUPE** en plein de petits plans : petite feature par petite feature, petite spec, petit plan. Petit à petit.
3. **L'UTILISATEUR EST LA SOURCE DE VÉRITÉ.** Il est le **SEUL** à cocher les cases `- [ ]` du `PROGRESS.md` et du `MVP.md`. Claude ne coche **JAMAIS** lui-même.
4. **La mémoire retient chaque session.** À chaque nouvelle session, Claude reprend au **dernier point non coché**.
5. **On avance 1 par 1.** Séparer strictement les features. L'utilisateur valide petit à petit **avant** d'avancer à la suivante.

### STOP — demander avant de :
- passer à la feature/phase suivante sans validation explicite de l'utilisateur ;
- cocher une case (jamais — c'est l'utilisateur).

### Flow d'une phase
`brainstorm (superpowers) → immense spec → découpage en petits plans → implémentation TDD 1 par 1 → validation utilisateur → coche (par l'utilisateur)`

Chaque phase et chaque session sont journalisées dans `PROGRESS.md`. Le brainstorm de la **phase actuelle** alimente en détail la section « Phase actuelle » du `PROGRESS.md`.

## Roadmap — 7 phases

Détail et cases à cocher dans `PROGRESS.md`. Grandes lignes :

1. **Design/UI** — landing propre (quelques placeholders OK) + **toute l'arborescence** du site (toutes les pages créées).
2. **Le produit — le comparateur** : import annonce (capture / copier-coller / formulaire, avec fallback + pré-remplissage) → extraction via **API Grok** (multimodal, gratuit) → affichage analytique du bien → stockage dans le wallet visible → ajout d'un 2e bien → comparaison. Crédits (1/analyse, 1/comparaison), anti-contournement, floutage freemium.
3. **Le wallet** comme feature à part entière + tarifs.
4. **Pages header/footer** : légales, À propos, pages de texte obligatoires.
5. **Comptes & sessions** utilisateur, connecté au wallet — connexion Google + email/mot de passe.
6. **Stripe** : tarifs et abonnements.
7. **Cybersécurité** : code review détaillée, polish, attaques via le repo **Strix**.

> Le LLM d'extraction (règle d'archi n°1) = **API Grok** multimodal (gratuit). Il n'extrait que du N1, jamais un chiffre financier.
