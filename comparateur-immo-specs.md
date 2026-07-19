# Comparateur d'annonces immobilières — Document de conception

> Document de travail (brainstorm produit). Vocation : servir de source unique de vérité, être enrichi au fil des idées, puis converti en `CLAUDE.md` pour le développement via Claude Code.
> Statut : brouillon v0.1 — à valider et compléter.

---

## 1. Vision en une phrase

Un outil qui compare plusieurs biens immobiliers **côte à côte, du point de vue de l'investissement**, en enrichissant automatiquement chaque bien avec des données de marché (prix au m² réel, loyer estimé, tension locative, risques…) et en produisant un **score personnalisé selon les priorités de l'utilisateur**, puis en permettant de simuler des scénarios d'emprunt et de rendement.

### Positionnement différenciant
Le marché des simulateurs de rentabilité d'un bien isolé est **saturé** (Rendify, PAP Financement, Cleerly, Horiz…), et plusieurs proposent déjà un score composite. La valeur ajoutée n'est donc **pas** de calculer la rentabilité d'un bien, mais :
1. **La comparaison dynamique multi-biens** (ajout de biens à la volée, face-à-face visuel).
2. **Le score personnalisé** (l'utilisateur définit ce qui compte pour lui → « ton score, pas le nôtre »).
3. **La simulation de scénarios** post-comparaison (emprunt, stratégie, horizon).

---

## 2. Principe fondateur : 3 niveaux de données

La clé qui rend l'outil simple à utiliser : **séparer ce que l'utilisateur saisit de ce qu'on dérive automatiquement.**

| Niveau | Nature | Qui le fournit | Exemple |
|--------|--------|----------------|---------|
| **N1 — Le bien** | Irréductible, propre à l'annonce | Saisi par l'utilisateur (~8-10 champs) | Adresse, prix, surface, DPE, charges |
| **N2 — Le marché** | Dérivé de l'adresse | **Automatique** via API open data | Prix/m² DVF, loyer estimé, tension, risques |
| **N3 — Les scénarios** | Configuration d'investissement | Réglé par l'utilisateur **après** la comparaison | Apport, emprunt, stratégie, horizon |

**Conséquence UX majeure : l'adresse est le champ le plus important de toute l'application.** Une fois géocodée (Base Adresse Nationale), elle déverrouille automatiquement ~80 % de la donnée. Le formulaire paraît court parce que l'essentiel apparaît en **résultat**, pas en **saisie**.

---

## 3. Téléversement des données : les rampes d'accès

**Règle d'or : le formulaire est toujours la destination ; le lien, la capture et la saisie ne sont que des rampes qui le pré-remplissent.** On ne demande JAMAIS à l'utilisateur de formater ou de copier-coller une page entière. On extrait ce qu'on peut, il corrige les trous.

### Parcours unifié
Bouton **« + Ajouter un bien »** → 3 tuiles au choix → **même écran de confirmation pré-rempli** (validation/correction + affichage des données dérivées).

### Rampe A — Coller un lien *(accélérateur, jamais une dépendance)*
- Un LLM tente de lire le contenu et de pré-remplir.
- **Non bloquant** : si l'extraction échoue (protection anti-bot type DataDome, annonce via agence…), on bascule silencieusement vers B ou C.
- ⚠️ Ne jamais construire le cœur du produit là-dessus (voir §11 Risques).

### Rampe B — Importer une capture d'écran / photo *(RECOMMANDATION N°1 : la rampe universelle)*
- L'utilisateur fait un screenshot de l'annonce, photographie une fiche papier d'agence, ou capture un message d'un agent.
- Un **LLM multimodal** lit l'image et extrait les champs.
- **Marche littéralement partout** : Leboncoin, SeLoger, PDF d'agence, fiche imprimée, capture mobile, WhatsApp.
- Zéro copier-coller, zéro formatage, aucun scraping, aucun risque juridique (c'est l'utilisateur qui capture ce qu'il regarde déjà).

### Rampe C — Saisie manuelle *(fallback propre)*
- Autocomplétion d'adresse (BAN) qui fait le gros du travail.
- Reste court car le N2 n'est jamais demandé.

### Rampe D — Extension navigateur « capturer ce bien » *(v2+)*
- Un clic depuis la page de l'annonce ; lit le DOM dans la session authentifiée de l'utilisateur (pas de scraping serveur).
- Puissant mais lourd à construire → repoussé après le MVP.

---

## 4. Dictionnaire de données

### N1 — Saisi par l'utilisateur (le bien)
- Adresse (→ clé de géocodage)
- Prix affiché
- Surface (m²)
- Type (appartement / maison)
- Nombre de pièces / chambres
- Étage & ascenseur
- État (à rénover / correct / refait à neuf)
- Budget travaux estimé
- DPE (classe énergétique)
- Charges de copropriété (annuelles)
- Taxe foncière
- *(Optionnel)* Loyer déjà pratiqué si le bien est loué

### N2 — Dérivé automatiquement (le marché) — LA valeur ajoutée
| Donnée | Source (open data gratuite) | Usage |
|--------|------------------------------|-------|
| Prix au m² réel du secteur | **DVF** (transactions notariées) | Juger si le prix affiché est cher / correct / opportunité |
| Loyer estimé au m² | **Carte des loyers** (data.gouv) | Estimer le loyer atteignable |
| Tension locative / zonage | **INSEE** + zonage A/B/C | Zones tendues, risque de vacance |
| Taux de vacance locative | **INSEE** (logements vacants) | Risque locatif du secteur |
| Évolution des prix (historique) | **DVF historique** | Base des projections de revente |
| Risques naturels/techno | **Géorisques** (API) | Inondation, argile, radon… |
| Contexte socio-démo | **INSEE** (revenu médian, % locataires, démographie) | Qualité et dynamique du secteur |
| Aménités | Annuaire éducation, GTFS transports, OpenStreetMap | Écoles, transports, commerces |
| Géocodage | **Base Adresse Nationale (BAN)** | Transforme l'adresse en clé pour tout le reste |

> ⚠️ **Honnêteté sur la granularité** : la vacance et la tension existent à la maille commune/IRIS, **pas par immeuble**. La projection de revente est une **hypothèse extrapolée**, pas une prédiction. À afficher explicitement comme scénarios, sous peine de perdre la confiance des investisseurs.

### N3 — Configuré par l'utilisateur (les scénarios) — voir §7

---

## 5. Moteur de calcul (déterministe, PAS « IA »)

Le cœur du produit repose sur des **maths fiscales exactes**, transparentes et auditables — jamais sur un chiffre « halluciné » par un LLM. L'IA ne sert qu'à : structurer le texte/l'image d'annonce, et générer les rapports en langage naturel.

Indicateurs calculés :
- Rendement **brut / net / net-net**
- **Cash-flow** mensuel (avant et après impôt)
- **TRI** sur l'horizon choisi
- Fiscalité selon régime :
  - **Location nue** : micro-foncier / réel foncier (déficit foncier)
  - **LMNP** : micro-BIC / réel avec amortissement
  - Impact TMI + prélèvements sociaux (17,2 %)
- **Plus-value de revente** (avec abattements pour durée de détention)
- **Effet de levier** du crédit
- **Score composite personnalisé** (voir §6)

---

## 6. Le score personnalisé (piloté par l'utilisateur)

**Principe :** l'utilisateur définit ce qui compte pour lui → le score reflète *ses* priorités. Cela évite le piège du score « boîte noire » et constitue un différenciateur clair.

### Fonctionnement
1. **Profils préréglés** (pour ne pas effrayer avec des curseurs bruts) :
   - *Rentabilité immédiate* (pondère cash-flow / rendement net)
   - *Patrimoine long terme* (pondère plus-value / dynamique de zone)
   - *Sécurité* (pondère faible vacance / faible risque / tension saine)
   - *Équilibré*
2. **Mode pro** : ajustement fin des pondérations au curseur derrière les profils.
3. La **stratégie choisie** (nue / LMNP / revente) pré-remplit logiquement les poids.

### Contraintes techniques
- Les pondérations se **normalisent à 100 %**.
- Toujours **afficher le détail** du score (pourquoi ce bien l'emporte), critère par critère.
- Le score est **relatif aux priorités déclarées** → il est défendable et non contestable (« c'est *ton* score »).

---

## 7. Les scénarios (couche post-comparaison)

Une fois les biens en face-à-face, un panneau de scénarios (sobre, options progressives) permet de :
- **Simulation d'emprunt** : apport disponible, montant emprunté, taux, durée, assurance → mensualité, coût total du crédit, impact sur cash-flow et TRI.
- **Choix de stratégie** : nue / LMNP / revente plus-value → recalcul fiscalité + projections.
- **Horizon** : court / moyen / long terme.
- **Scénarios de marché** : prudent / central / dynamique (évolution prix et loyers).
- **Comparaison de configs d'un même bien** (ex. 10 % vs 20 % d'apport).

---

## 8. Le comparateur (affichage)

Vue **côte à côte** (2 biens ou plus, ajout dynamique), avec code couleur relatif (vert = meilleur des biens comparés) sur chaque ligne :
- Prix affiché vs prix marché DVF
- Loyer estimé
- Rendement net / net-net
- Cash-flow
- TRI
- Note globale personnalisée
- Risques (Géorisques)
- DPE
- Tension / vacance

+ Une ligne de **synthèse** : « le plus pertinent selon ta stratégie ».

---

## 9. Modes d'affichage & UX (inspiration Kraken)

### Mode Simple / Mode Pro
- **Master switch** unique Simple ↔ Pro.
- En Pro : **toggles granulaires** pour afficher/masquer chaque colonne ou indicateur.
- L'utilisateur compose son propre tableau de bord.

### Tooltips pédagogiques
- Chaque terme technique porte un `?` qui explique le concept en une phrase.
- Double bénéfice : accessibilité débutant + ce glossaire devient du **contenu SEO** réutilisable.

### Floutage selon l'abonnement (levier freemium) — voir §10
- **Règle critique** : ne jamais vendre la donnée brute (DVF/INSEE sont de l'open data gratuit et redistribuable, mais un utilisateur averti le sait). **Vendre la synthèse, le calcul et la comparaison.**
- Ce qu'on floute = **l'insight** (loyer estimé précis, projection de revente, score détaillé), pas le fait que « le prix/m² existe ».
- **Pattern de conversion** : montrer la métrique **floutée + cadenas + bouton « Débloquer »** → crée le désir sans frustrer.
- Doser avec le système de crédits pour que le gratuit reste assez utile pour **créer l'habitude**.

---

## 10. Modèle économique

### Système de crédits (piste principale)
- N analyses/comparaisons gratuites, puis achat de crédits.
- Cible à fort willingness-to-pay (tickets immobiliers à 6 chiffres) → quelques euros pour sécuriser une décision sont acceptables.
- **Générosité initiale** nécessaire pour créer l'habitude.

### Freemium par floutage (complémentaire)
- Gratuit : calcul de base sur les saisies de l'utilisateur, comparaison limitée.
- Payant : données dérivées précises, projections, score détaillé, scénarios avancés.

### Paiement
- **Stripe** : pas de coût fixe, commission par transaction uniquement. Le modèle « crédits » s'y implémente nativement.

---

## 11. Contraintes & risques

### Risque n°1 — Récupération automatique via lien (scraping)
- Leboncoin et SeLoger utilisent **DataDome** (anti-bot très agressif : empreintes TLS, télémétrie navigateur, réputation IP).
- Leurs **CGU interdisent explicitement** l'extraction automatisée.
- **Jurisprudence** : Cour d'appel de Paris, 18 février 2021 — condamnation d'entreparticuliers.com à 50 000 € pour collecte systématique des annonces immobilières de Leboncoin.
- Scraping durable = navigateur headless furtif + proxies résidentiels français + maintenance permanente = **coût récurrent élevé**, à l'opposé de la contrainte « MVP le moins cher possible ».
- **Décision : le lien reste un accélérateur optionnel, jamais une dépendance. La rampe universelle est la capture d'écran (§3-B).**

### Risque n°2 — Fiabilité / granularité des données
- Données de marché à la maille commune/IRIS, pas par bien.
- Projections = hypothèses, à présenter comme des scénarios explicites.

### Risque n°3 — Marché concurrentiel
- Simulateurs de rentabilité déjà nombreux et gratuits.
- La différenciation doit rester concentrée sur : comparaison multi-biens + score personnalisé + scénarios.

---

## 12. Stack technique MVP (coût quasi nul)

| Brique | Choix | Coût |
|--------|-------|------|
| Frontend | Next.js sur Vercel (ou Cloudflare Pages) | Gratuit |
| Backend + BDD + Auth | Supabase (Postgres + auth + storage) | Gratuit (offre de départ) |
| Moteur de calcul | TypeScript (ou petite API Python/FastAPI) | Gratuit |
| Extraction texte/image | LLM multimodal, appelé au minimum | Coût/appel maîtrisé |
| Paiement / crédits | Stripe | Commission uniquement |
| Données de marché | DVF, BAN, Géorisques, Carte des loyers, INSEE, ADEME | Gratuit (open data) |

---

## 13. Hors-scope MVP (repoussé)

- Fetch automatique des liens à grande échelle (risque juridique + coût).
- Extension navigateur.
- Couverture exhaustive de toutes les plateformes.
- Prédictions de marché « garanties » (rester sur des scénarios).

---

## 14. Questions ouvertes à trancher

- [ ] Cible prioritaire du MVP : débutant (mode guidé) ou investisseur aguerri (tous leviers) ? *(Le mode Simple/Pro permet de servir les deux, mais l'onboarding par défaut doit choisir.)*
- [ ] Liste exacte des **profils de score** préréglés et leurs pondérations de départ.
- [ ] Frontière précise **gratuit / payant** (quoi flouter, combien de crédits offerts).
- [ ] Périmètre géographique du MVP (France entière ? quelques villes tests pour fiabiliser les données ?).
- [ ] Nombre de biens comparables simultanément (2 seulement au départ, ou N ?).
- [ ] Modèle LLM retenu pour l'extraction (arbitrage coût/qualité multimodale).

---

## 15. Identité de marque (Brand Kit v0.1)

### 15.1 Nom : "Estio"

**Positionnement** : nom inventé, court, dérivé d'« estimation » — le cœur du produit (estimer objectivement la valeur d'un bien). Sonorité fluide type Twilio/Vantio, crédible et mémorable, unique (SEO de marque).

**Domaine** : `estio.immo` (libre, ~15 €/an). Le TLD `.immo` fait partie de la lecture (`estio.immo` se lit d'un bloc) et signale le secteur.

- **À faire avant tout dépôt de marque** : **recherche d'antériorité INPI** (classes 36 — affaires immobilières, et 42 — logiciels/SaaS). Non fait à ce stade — action à mener avant tout engagement financier ou juridique sur le nom.

### 15.2 Nom de domaine & SEO

- **Retenu** : `estio.immo`.
- **À sécuriser en complément** (redirections/marque) : `estio.app`, éventuellement un `.com` si un jour disponible.
- **SEO** : « estio » étant un nom inventé, la marque rank #1 sur son propre nom sans concurrence ; la visibilité générique (« comparateur immo ») se construira sur le contenu (glossaire des tooltips, guides), pas sur le nom.

### 15.3 Direction visuelle : "premium accessible", pas "terminal Bloomberg"

Correction par rapport à la première hypothèse (banque privée / sobriété stricte) : la cible réelle est **rigoureux mais chaleureux** — l'esprit Monday.com/Linear plutôt que Bloomberg Terminal. Le sérieux passe par la clarté des données et la pédagogie, pas par une esthétique austère ou une typographie financière calligraphique.

**Palette de couleurs**
- Fond : blanc cassé / crème chaud (pas de blanc pur clinique, pas de fond sombre façon terminal).
- Couleur de marque : **terre cuite / argile chaude** — chaleureuse et ancrée (la terre, le terrain), distinctive par rapport aux codes bleu/vert habituels de la fintech et de la proptech.
- Palette pastel secondaire (badges, scoring, catégories) : sauge doux (positif), sable/beige (neutre), rose poudré (attention), bleu poudré (informatif) — tons doux et désaturés, jamais criards, cohérents avec l'esprit "friendly" demandé.
- Échelle du scoring : mêmes tons pastel, jamais les rouge/vert saturés façon feu de circulation.

**Typographie**
- Une seule famille grotesque humaniste, ronde et chaleureuse, pour tout le produit (UI, corps de texte, données) — écarter tout serif financier ou toute calligraphie.
- Un poids plus affirmé pour les titres et les gros chiffres (scores, montants), un poids régulier pour le reste.
- Pistes concrètes (libres, disponibles) : familles type *General Sans* ou *Cabinet Grotesk* (Fontshare) — mêmes codes que les interfaces "Monday-like" actuelles.

**Langage visuel (UI)**
- Coins arrondis généreux sur les cartes et boutons (esprit accueillant plutôt que anguleux).
- Bordures fines plutôt qu'ombres marquées ; profondeur suggérée par des aplats de couleur pastel plutôt que par des ombres portées lourdes.
- Icônes à trait rond, jamais anguleuses/techniques.
- Le sérieux se lit dans la hiérarchie de l'information (données bien organisées, tooltips pédagogiques `?`, transparence du scoring) — pas dans la lourdeur visuelle.

**Ton de voix**
- Chaleureux et direct, jamais condescendant ni corporate.
- Vulgarise les termes techniques (via les tooltips) sans infantiliser.
- Question ouverte : tutoiement ou vouvoiement ? Le "vouvoiement chaleureux" est probablement le bon compromis pour une cible premium tout en restant accessible — à valider.

### 15.4 Prochaines étapes de la marque
- [ ] Lancer la recherche d'antériorité INPI sur "Estio" (classes 36 et 42).
- [x] Nom retenu et domaine vérifié : Estio / `estio.immo`.
- [ ] Choisir tutoiement vs vouvoiement.
- [ ] Produire un premier mockup visuel (maquette HTML/React) pour valider la direction avant de la figer dans le `CLAUDE.md`.

---

*Prochaine étape prévue : enrichissement de ce document au fil du brainstorm, puis conversion en `CLAUDE.md` pour le développement via Claude Code.*
