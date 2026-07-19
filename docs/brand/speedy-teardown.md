# DESIGN.md — Refonte style « Speedy » (réf. speedy.io, par Büro/Burocratik)

## Source
- URL : https://speedy.io/ (+ /enterprise, /eden-project)
- Capture : 2026-07-19 · Firecrawl (branding, images, screenshot) + HTML/CSS complet
- Stack d'origine : **Nuxt/Vue + Locomotive Scroll + GSAP ScrollTrigger** · custom, pas de lib UI
- Portage Estio : **Next.js + Motion (framer)** ; smooth-scroll futur = **Lenis** (successeur Locomotive)

## Design Summary
Fond **noir profond**, typographie **grotesque géante** (Helvetica), titres plein écran alignés en bas, énormes espaces, boutons **pill blancs**, animations « expo-out » signature, texte **détouré**, marquees, sections **pin** au scroll (600vh), globe vidéo. Sobre, cher, éditorial — jamais Bloomberg.

## Design Tokens (adaptés Estio)
### Couleurs (palette utilisateur noir + violet nuit)
| Rôle | Hex |
|------|-----|
| bg | `#0A0A0B` |
| bg-elevated | `#221F30` |
| bg-alt | `#262432` |
| bordure forte | `#353536` |
| accent sourd | `#545164` |
| text | `#F4F4F4` |
| muted | `#C1C1C1` |
| faint | `#79797A` / `#525252` |
| brand (accent) | `#A79FE0` lilas *(inféré, harmonise le violet)* |
| bouton primaire | fond `#F4F4F4` / texte `#0A0A0B` (pill) |

### Typo
- Modèle : Helvetica `regular/bold/hairline` (propriétaire MyFonts).
- Substitut Estio : **Inter** (variable 100→900, self-hosté `next/font`), tracking serré.
- Échelle fluide `clamp()` : `.h-display` →134px · `.h-1` →76px · `.h-2` →64px · `.h-3` →36px · `.p-lead` →24px. line-height ~1.

### Mouvement
- Easing signature : `cubic-bezier(0.19, 1, 0.22, 1)` (`--ease-expo`).
- Reveal « anime-in » : montée `translateY 110%→0` + fondu, staggeré.

## Effets signature (à reproduire au fil des itérations)
1. Loader splash · 2. Nav transparente sur hero · 3. **Titre géant plein écran + fond glossy** ✅ (hero fait) · 4. Texte **détouré** (`.text-stroke`) · 5. **Marquee** horizontal · 6. Section **pin 600vh** (titres qui se remplacent) · 7. Globe vidéo · 8. Cards décalées · 9. Toggle dark/light + tabs · 10. Noms hairline défilants · 11. Boutons pill.

## État d'implémentation
- [x] Design tokens dark (`src/design/tokens.css`)
- [x] Échelle typo + classes utilitaires (`globals.css`)
- [x] Font Inter (`layout.tsx`)
- [x] Bouton pill blanc (`MagneticButton.tsx`)
- [x] **Hero** plein écran + blob + reveal (`components/landing/Hero.tsx`)
- [ ] Sections landing en style géant (principe / score / données / CTA)
- [ ] Nav transparente sur hero · marquee · pin scroll · outline text · cards décalées
- [ ] Smooth scroll Lenis
- [ ] Header/footer & 10 pages internes reconverties

## Notes légales
- Fonts Helvetica, logos, vidéos et images Speedy = **propriété de tiers**, non réutilisables. On reproduit la *grammaire visuelle*, pas les assets.

## Rerun
workflow: firecrawl-website-design-clone · source: speedy.io · stack: next.js · artefacts: `.firecrawl/`
