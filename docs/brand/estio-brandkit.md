# Estio — Système FOCALE v2

> Charte de marque et de conception d'interface.
> Les **valeurs** font foi dans `src/design/tokens.css`.
> Le **langage de verdict** vit dans `src/lib/verdict.ts`.
> Le **vocabulaire** vit dans `src/lib/glossary.ts`.
>
> v2 corrige la faute centrale de la v1 : un système cohérent pour son auteur, mais
> illisible pour un primo-investisseur. Le concept n'a pas changé ; sa mise en œuvre,
> entièrement.

---

## 1. Le concept

**Estio est un instrument optique.** Un investisseur voit cent à deux cents annonces en
quatre mois. Presque toutes sont du bruit. Une seule recevra une offre. Le produit ne
fait rien d'autre que **faire la mise au point**.

## 2. Le public

**Le primo-investisseur particulier.** Il ne connaît ni le TRI, ni le net-net, ni le
point mort. Il achète son premier appartement et il a peur de se tromper.

C'est lui qui arbitre chaque décision d'interface. **Un chiffre qu'il ne peut pas
interpréter ne sert à rien** — il fait même du mal, parce qu'il ajoute du bruit à un
moment où il cherche du signal.

---

## 3. Les six règles de conception

### 3.1 La couleur ne fait jamais deux métiers

Faute de la v1 : l'orange était à la fois la couleur de marque (boutons) et l'échelle
de score. Un bouton et un mauvais score avaient la même teinte, et il fallait apprendre
qu'orange vif signifiait « bon ».

| Rôle | Couleur | Usage exclusif |
|---|---|---|
| **Marque** | braise `#ff6a1a` | bouton d'action, focus, lien, onglet actif, sélection |
| **Bon dossier** | vert `#84b394` | verdict ≥ 60 |
| **À creuser** | sable `#d9b678` | verdict 40-59 |
| **Peu favorable** | brique `#c4706a` | verdict < 40 |
| **Données incomplètes** | gris `#8a8078` | score indisponible |
| **Donnée publique** | givre `#8fb4ca` | marqueur de section, jamais de chiffre |

Les feux sont désaturés pour tenir sur l'encre sans crier. La brique tire vers le rouge
franc (teinte ~4°) pour ne pas se confondre avec la braise de marque (teinte ~20°).

**Les étapes du pipeline ne sont pas un jugement.** Un bien « à analyser » n'est pas
moins bon qu'un bien « en négo ». Dégradé neutre d'os ; seule l'étape « Offre » est
colorée.

### 3.2 Un mot en français avant un chiffre

« 54 » ne veut rien dire à qui n'a pas de référentiel. On affiche donc **« À creuser »**,
puis « 54 / 100 », puis **une phrase qui dit quoi faire**.

Trois niveaux, pas quatre : distinguer « solide » de « correct » n'est à la portée de
personne.

### 3.3 Aucun terme technique sans définition

Tout terme passe par `lib/glossary.ts`. `<Stat term="tri" />` produit le libellé **et**
l'infobulle. Aucune définition n'est jamais rédigée sur place — c'est la seule garantie
qu'aucune ne soit oubliée.

### 3.4 Le français clair prime sur le jargon

| Jargon | Affiché |
|---|---|
| Rendement net-net | Rendement après impôt |
| Cash-flow | Trésorerie mensuelle |
| Point mort | Seuil de rentabilité |
| Cash-on-cash | Rendement de l'apport |
| TRI | Rentabilité totale |
| Surface Carrez | Surface habitable |
| PNO | Assurance propriétaire |
| DPE | Diagnostic énergétique |

### 3.5 Divulgation progressive — rien n'est supprimé, tout est rangé

La fiche a deux modes (`?vue=complet`). Les blocs lourds vivent dans des
`<Disclosure>`, **toujours accompagnés d'un résumé visible sans ouvrir** : la
mensualité, le rendement, le régime retenu, le total des charges.

Un repli sans résumé est une information cachée. Avec résumé, c'est une information
rangée — on n'ouvre que si on en a besoin.

### 3.6 Les indicateurs avancés sont repliés par défaut

TRI, rendement de l'apport, seuil de rentabilité, capital remboursé, plus-value : champ
`expert: true` dans le glossaire. Présents, définis, jamais imposés.

---

## 4. Lumière & matière

Un seul univers : **la nuit**. Jamais `#000` (mort, plat), jamais bleuté (tech
générique). Une **encre chaude** sur cinq niveaux.

| Rôle | Token | Valeur |
|---|---|---|
| Fond de scène | `--bg` | `#0b0a09` |
| Fond enfoncé | `--bg-sunken` | `#080706` |
| Surface | `--surface` | `#15120f` |
| Surface remontée | `--surface-raised` | `#221d19` |
| Surface haute | `--surface-high` | `#2c2620` |

**Le grain est structurel.** Bruit fractal à 2,6 % en `body::after`. Ne jamais le
retirer : c'est lui qui empêche les aplats noirs de paraître morts.

Texte : os chaud, `#f0eae3` → `#6b625a`. Les niveaux ont gagné en luminance par rapport
à la v1, où quatre gris trop proches empêchaient toute hiérarchie.

---

## 5. Typographie

**Space Grotesk** porte la voix. **JetBrains Mono** porte tous les chiffres, sans
exception, via `.num` (chasses fixes, `tabular-nums`). Les colonnes s'alignent au
pixel : c'est la moitié de la crédibilité d'un outil financier.

| Classe | Usage |
|---|---|
| `.t-hero` | titre d'ouverture de la vitrine |
| `.t-display` | titre de section vitrine |
| `.t-title` | titre de page secondaire |
| `.t-head` | titre de panneau |
| `.t-lead` | chapô |
| `.t-label` | étiquette — **casse de phrase, 12 px** |
| `.t-caps` | petite capitale — surtitres de vitrine uniquement |
| `.num` / `.num-hero` | chiffres |

⚠ En v1, `.t-label` était une capitale de 11 px interlettrée à 0,13em, répétée des
dizaines de fois par écran. C'était illisible et ça criait. Ne pas y revenir.

---

## 6. Forme & mouvement

Rayons 2 / 4 / 6 / 10 / 14 / 20 px. Filets 1 px. **Quasi aucune ombre dans l'outil** :
on est déjà dans le noir, la profondeur se lit par le contraste de fond.

Un seul bouton en braise par écran : celui qui engage.

**Le calage focal** est le geste signature : ce qui apparaît arrive flou et décalé, puis
se cale net. 220 ms dans l'outil, 1200 ms sur la vitrine. Même geste, deux tempos —
c'est ce qui coud la vitrine et l'outil en une seule marque.

`prefers-reduced-motion` neutralise tout mouvement sans dégrader la lisibilité.

---

## 7. Le verrou freemium

La donnée réservée n'est pas cachée : elle est hors du plan de netteté (`.defocused`,
`<Locked>`). Le paywall devient une démonstration de la promesse du produit.

**Ne jamais verrouiller la donnée publique brute** — uniquement l'insight.

---

## 8. Voix

**Vouvoiement**, sobre. Phrases courtes. Le produit dit ce qu'il sait et ce qu'il
ignore : granularité imparfaite, extraction faillible, absence de garantie — écrits
dans l'interface, à l'endroit où le chiffre est lu.

Aucun émoji, nulle part.

---

## 9. Do / Don't

| ✅ | ❌ |
|---|---|
| Braise pour les actions, feux pour les verdicts | Une couleur qui fait les deux |
| Un mot en français avant le chiffre | Un score nu, ou un nom de température |
| Chaque terme défini via le glossaire | Une définition rédigée à la main |
| Blocs repliés **avec résumé** | Blocs repliés muets |
| Étiquettes en casse de phrase | Petites capitales interlettrées |
| Quatre chiffres en tête d'écran | Cinquante chiffres à plat |
| Encre chaude + grain | Noir pur, fond bleuté |
| Chasses fixes tabulaires partout | Chiffres en grotesque dans un tableau |
