# CLAUDE.md

Guide pour Claude Code (claude.ai/code) sur ce dépôt.

## Projet

**Estio** — **le pipeline de décision de l'investisseur immobilier**. Pas un énième comparateur/analyseur d'annonces (marché saturé : LyBox, Horiz, Moteurimmo…). Estio pilote une **recherche d'achat** du repérage à l'offre : il avale *n'importe quel* bien (y compris hors-portail) par **capture**, l'analyse instantanément, et aide à **trancher** entre les candidats.

Formule courte : **« le CRM de ta recherche immobilière »**.

Source de vérité de la réorientation : `REORIENTATION-ESTIO.md`. Specs historiques : `comparateur-immo-specs.md` (à lire au prisme de la nouvelle direction). Features : `MVP.md`. Avancement : `PROGRESS.md`. Stack : `ARCHITECTURE.md`.

## Les deux piliers

1. **Le pipeline de décision (le cœur, la douve).** Un investisseur voit 100-200 annonces sur 2-4 mois, en retient 15-20, jongle, et fait **une** offre. Personne ne possède ce milieu. Estio le possède via un **board à statuts** (Kanban immo-natif) :
   `À analyser → Analysé → Visite → En négo → Écarté (+ raison) → Offre`.
   Chaque bien porte ses chiffres **+** le contexte humain (notes, prix max, agent/mandataire, pourquoi j'hésite, dernière relance). Point culminant : **l'arbitrage en langage naturel** entre 2-3 finalistes.

2. **La capture universelle (le carburant).** Screenshot LeBonCoin, PDF d'agence, photo de fiche papier, message WhatsApp de mandataire, off-market → **LLM multimodal** extrait les champs → l'adresse géocode → déverrouille le marché. Les agrégateurs sont **structurellement aveugles au hors-portail** ; on photographie l'inagrégeable. La capture n'est pas un fallback : c'est **l'arme d'ingestion**.

**Estio = le pipeline (1) alimenté par la capture universelle (2).**

## Principe fondateur — 3 niveaux de données

Toute la logique découle de cette séparation. Ne jamais la mélanger.

| Niveau | Nature | Source | Traitement |
|--------|--------|--------|-----------|
| **N1 — Le bien** | Irréductible, propre à l'annonce (~8-10 champs) | Saisi / **extrait par capture** | **Ce qu'on STOCKE** (durable) |
| **N2 — Le marché** | Dérivé de l'adresse (DVF, loyers, tension, risques, INSEE) | Auto via open data | **Recalculé à la volée**, jamais figé |
| **N3 — Les scénarios** | Config d'investissement (apport, taux, durée, stratégie) | Réglé par l'utilisateur | **Recalculé en direct** (curseurs) |

- **L'adresse est le champ le plus important de l'app.** Géocodée (BAN) → déverrouille ~80 % de la donnée (N2). Le formulaire est court parce que l'essentiel apparaît en résultat, pas en saisie.
- **On ne stocke JAMAIS l'analyse, seulement le bien (N1).** Rouvrir un bien = re-render contre les données du jour = **gratuit**. Le « wallet obsolète » disparaît : la mémoire du pipeline *est* la solution. Au plus, un cache N2 daté et réputé périssable.

## Règles d'architecture non négociables

1. **Le moteur de calcul est déterministe, jamais un LLM.** Rendement, cash-flow, TRI, fiscalité, plus-value = maths fiscales exactes, transparentes, auditables. Un LLM ne produit JAMAIS un chiffre financier. Le LLM sert uniquement à : (a) **extraire les champs N1** depuis texte/image, (b) **rédiger les arbitrages/rapports** en langage naturel.

2. **Pas de scraping.** LeBonCoin/SeLoger = DataDome + CGU interdisant l'extraction + jurisprudence (CA Paris 18/02/2021, entreparticuliers.com condamné 50 000 €). **La rampe universelle = la capture d'écran par l'utilisateur** (il capture ce qu'il regarde déjà, zéro risque juridique).

3. **Pas de crédits sur la boucle cœur.** Mettre un crédit sur le verdict taxe le haut de l'entonnoir, là où on veut du volume (un investisseur regarde 50-200 biens). Modèle = **freemium mené par l'abonnement** (Free / Pro / Expert). Le levier de conversion = **flouter l'insight** (loyer estimé précis, projection, score détaillé, scénario en direct), jamais la donnée brute (DVF/INSEE sont open data). Crédits réservés — si un jour — au *compute réellement coûteux* (extraction multimodale, génération de rapport IA), jamais au verdict de base.

4. **Ne jamais vendre la donnée brute.** Vendre la **synthèse, le calcul, la comparaison, l'arbitrage**.

5. **Honnêteté sur la granularité.** Tension/vacance à la maille commune/IRIS, pas par immeuble. Les projections de revente sont des **scénarios explicites extrapolés**, jamais des prédictions « garanties ». Crucial pour la confiance d'un public numérique et sceptique.

6. **Les rampes d'import pré-remplissent toujours le même formulaire de confirmation.** On extrait ce qu'on peut, l'utilisateur corrige les trous. L'extraction multimodale peut halluciner → **validation utilisateur obligatoire** + garde-fous.

## Le score personnalisé

- Pondérations pilotées par l'utilisateur via **profils préréglés** (Rentabilité immédiate / Patrimoine long terme / Sécurité / Équilibré), mode pro = curseurs fins.
- Les pondérations **se normalisent à 100 %**.
- **Toujours afficher le détail** du score (pourquoi ce bien l'emporte, critère par critère). Jamais de boîte noire.
- Argument : « c'est *ton* score, pas le nôtre » → défendable, non contestable. Le profil de priorité peut **faire basculer le gagnant** d'un arbitrage.

## Distribution

La vraie douve, ce n'est pas la feature (copiable) mais la distribution : un **verdict gratuit, instantané et partageable** (« regarde ce qu'Estio dit de cette annonce ») comme haut d'entonnoir viral. Attaquer une communauté / un segment plutôt que « tous les investisseurs de France » d'un coup.

## Modèle économique — freemium par abonnement (Stripe)

Trois paliers (placeholders, à affiner) : **Free** (créer l'habitude + viralité) · **Pro ~24 €/mois** (investisseur en recherche active) · **Expert ~59 €/mois** (CGP & chasseurs, rapport marque blanche). On borne un **projet d'achat** : l'utilisateur paie le temps de sa recherche, obtient son deal, revient au prochain achat. Détail des paliers/gating : `REORIENTATION-ESTIO.md` §5.

## Le fork produit (ouvert)

- **B2C prosumer (pilier 1+2)** = **direction par défaut du MVP** : le pipeline du particulier alimenté par capture.
- **B2B (Expert / marque blanche)** = porte ouverte plus tard. Bon client = l'**achat-side** (CGP surtout, chasseurs), pas les agences de vente (elles veulent closer). Le rapport en langage naturel *devient* le produit.

## Périmètre & hors-scope MVP

- **Périmètre géographique : France entière** (décision utilisateur — on ne restreint pas à 1-2 villes). ⚠ Corollaire : la **fiabilité de N2** (DVF crade, granularité imparfaite) est le vrai risque produit à surveiller — voir `ARCHITECTURE.md` risques.
- **Hors-scope :** scraping automatique à grande échelle · extension navigateur · agrégation multi-portails · prédictions de marché « garanties » · conseil en investissement réglementé (on est un **outil d'aide à la décision** → disclaimers).

## Identité & UX — système « FOCALE » v2 (en place)

> Source de vérité : `src/design/tokens.css` (valeurs) · `docs/brand/estio-brandkit.md`
> (le pourquoi) · `src/lib/glossary.ts` (tous les termes) · `src/lib/verdict.ts` (le
> langage de verdict).

**Concept directeur : la mise au point optique.** Deux cents annonces dérivent dans le
noir, floues ; une seule entre dans le plan de netteté.

**Public cible : le primo-investisseur particulier.** C'est ce qui arbitre chaque
décision d'interface. Un chiffre qu'il ne peut pas interpréter ne sert à rien.

### Règles non négociables

1. **La couleur ne fait jamais deux métiers.**
   - La **braise** `#ff6a1a` = la marque, et uniquement les actions (bouton, focus,
     lien, onglet actif). Elle ne dit **jamais** si un bien est bon.
   - Le **verdict** = feux adoucis, désaturés : vert `#84b394` (bon dossier),
     sable `#d9b678` (à creuser), brique `#c4706a` (peu favorable), gris `#8a8078`
     (données incomplètes). Trois niveaux, pas quatre.
   - Les **étapes du pipeline** ne sont pas un jugement : dégradé neutre d'os,
     seule l'étape « Offre » est colorée.

2. **Un mot en français avant un chiffre.** « Bon dossier », puis « 72/100 ». Et
   toujours une phrase qui dit quoi faire. Voir `verdictFromScore()`.

3. **Aucun terme technique sans définition.** Tout passe par `lib/glossary.ts` :
   `<Stat term="tri" />` produit le libellé ET l'infobulle. Jamais de définition
   rédigée au cas par cas — c'est ce qui garantit qu'aucune n'est oubliée.

4. **Le français clair prime sur le jargon.** « Rendement après impôt » et non
   « net-net ». « Seuil de rentabilité » et non « point mort ».

5. **Divulgation progressive.** Rien n'est supprimé, tout est rangé. La fiche a deux
   modes (`?vue=complet`) ; les blocs lourds sont dans des `<Disclosure>` **avec un
   résumé visible** — un repli sans résumé est une information cachée.

6. **Les indicateurs avancés sont repliés par défaut** (TRI, rendement de l'apport,
   seuil de rentabilité, capital remboursé, plus-value) — présents, définis, jamais
   imposés. Champ `expert: true` dans le glossaire.

### Deux pièges techniques à ne jamais réintroduire

**1. `useSearchParams()` est interdit dans les composants clients de l'app.**
Sans limite `<Suspense>` au-dessus, ce hook fait basculer la page en rendu client et
l'hydratation ne se termine jamais : la fiche et le board restaient **entièrement
inertes** — rien ne cliquait, aucune erreur en console. Les paramètres d'URL se lisent
**côté serveur** (`page.tsx` reçoit `searchParams`) et descendent en prop ; `useRouter`
suffit pour écrire. Voir `usePropertyDrawer` et `FicheShell`.

**2. Une infobulle ne peut pas être `position: absolute`.**
Presque tous les conteneurs découpent leur contenu — `.disclosure-body` est en
`overflow: hidden`, les cellules de tableau sont en `max-w-0`, la fiche et le panneau
latéral sont des zones de défilement. Aucun `z-index` n'y change rien : le découpage
précède l'empilement. `InfoTip` passe donc par un **portail vers `document.body`** en
`position: fixed`, positionné depuis le rectangle du déclencheur.

> Le serveur de développement Turbopack sert parfois des chunks périmés au navigateur,
> ce qui produit exactement les mêmes symptômes qu'un défaut d'hydratation. En cas de
> doute, vérifier sur `npm run build && npx next start` avant de chercher un bug.

### Le reste du système

- **Un seul univers, la nuit.** Encre chaude `#0b0a09` → `#2c2620`, jamais `#000`.
  Grain de film 2,6 % : le noir n'est jamais plat.
- **Typo : Space Grotesk + JetBrains Mono.** Tout chiffre en chasses fixes tabulaires
  (`.num`), sans exception.
- **Étiquettes en casse de phrase, 12 px.** Les petites capitales interlettrées de la
  v1 étaient illisibles. `.t-caps` reste pour les rares surtitres de la vitrine.
- **Arêtes tendues.** Rayons 2/4/6/10/14 px, filets 1 px, quasi aucune ombre dans
  l'outil.
- **Deux tempos, un geste.** Le *calage focal* joue à 220 ms dans l'outil, 1200 ms sur
  la vitrine.
- **Verrou freemium = flou optique réel** (`.defocused`, `<Locked>`). Ne jamais
  verrouiller la donnée publique brute — uniquement l'insight.
- **Voix : vouvoiement** sobre, partout.
- Nom **« Estio »** (`estio.immo`). Vérif INPI classes 36/42 non faite. **Le logotype
  est conservé** (clair et foncé) — seul élément visuel repris de la v0.1.

## Méthodologie de travail — NON NÉGOCIABLE

Détaillées dans `PROGRESS.md`. Elles priment sur tout.

1. **Chaque grosse feature (= chaque phase) débute par un gros brainstorm** (`superpowers:brainstorming`). Pas de code avant brainstorm.
2. **Le brainstorm produit une immense spec, puis on la DÉCOUPE** en petits plans : petite feature, petite spec, petit plan. Petit à petit.
3. **L'UTILISATEUR EST LA SOURCE DE VÉRITÉ.** Il coche les cases `- [ ]` (Claude ne coche qu'après un « c'est bon » explicite sur Vercel — voir workflow de validation).
4. **La mémoire retient chaque session.** Nouvelle session → reprendre au **dernier point non coché**.
5. **On avance 1 par 1.** Séparer strictement les features. Validation utilisateur **avant** d'avancer.

### STOP — demander avant de :
- passer à la feature/phase suivante sans validation explicite ;
- cocher une case sans le « c'est bon » de l'utilisateur.

### Flow d'une phase
`brainstorm (superpowers) → immense spec → découpage en petits plans → implémentation TDD 1 par 1 → validation utilisateur (Vercel) → coche`

## Roadmap — 7 phases

Détail et cases dans `PROGRESS.md`. Grandes lignes :

1. **Design/UI & arborescence** — landing + toutes les pages du site. *Largement fait (S3-S7). On ne s'y attarde plus : direction pointée sur le dev de l'outil.*
2. **L'OUTIL — le pipeline de décision** *(phase en cours)* : modèle de données Projet → Biens (N1) · capture universelle (extraction Grok multimodal, N1 seul) · géocodage BAN + N2 recalculé à la volée · moteur de calcul déterministe · **board à statuts** · fiche bien + **scénario en direct** · score perso + profils · **arbitrage en langage naturel** · floutage freemium (gating par abonnement, **pas de crédits**).
3. **Surveillance & rétention** — alertes prix/taux tant qu'un projet est actif ; notifications vivantes.
4. **Pages header/footer** — légales, À propos, textes obligatoires, disclaimers.
5. **Comptes & sessions** — Google + email/mot de passe, connectés au projet/pipeline.
6. **Stripe** — abonnements Free / Pro / Expert + gating.
7. **Cybersécurité** — code review détaillée, polish, attaques via le repo **Strix**.

> Le LLM d'extraction = **API Grok** multimodal (clé déjà configurée). Il n'extrait que du N1, jamais un chiffre financier.
