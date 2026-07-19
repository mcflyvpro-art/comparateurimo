// Génère les logos Estio à partir des SVG source (fond retiré) :
//  - public/estio-wordmark.svg       : wordmark blanc (fond sombre)
//  - public/estio-wordmark-dark.svg  : wordmark sombre (fond clair)
//  - src/app/icon.svg                : favicon (2 tours, couleur adaptative)
//  - src/components/layout/EstioWordmarkInline.tsx : wordmark inline (loader),
//    avec les 2 tours ciblables pour l'animation de couleur.
//
// Astuce clé : les SVG source « découpent » les contre-formes (le trou du 'e',
// du 'o'…) avec des patchs de la couleur du fond d'origine. Sur un autre fond
// ça fait des taches. On RECOLORE donc ces découpes à la couleur exacte du fond
// cible → les trous se fondent = effet transparent, comme le 'o'.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const DARK_BG = "#0a0a0b"; // fond sombre du site / header / loader
const LIGHT_BG = "#f5f4f1"; // fond clair des sections (.section-light)

const dOf = (p) => (p.match(/\bd="([^"]+)"/) || [])[1] || "";
const fillOf = (p) => (p.match(/\bfill="([^"]+)"/) || [])[1] || "";
const lum = (hex) => {
  const m = hex.replace("#", "");
  if (m.length < 6) return 128;
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b;
};

const extractGlyphs = (file) => {
  const s = readFileSync(file, "utf8");
  return [...s.matchAll(/<path\b[^>]*\/>/g)]
    .map((m) => m[0])
    .filter((p) => !dOf(p).startsWith("M0 0")); // retire le fond
};

// Recolore les « découpes » (patchs couleur-du-fond d'origine) vers le fond cible.
// cutsAreDark=true  → les découpes sont sombres (cas wordmark blanc)
// cutsAreDark=false → les découpes sont claires (cas wordmark sombre)
const recolor = (paths, cutsAreDark, bg) =>
  paths.map((p) => {
    const f = fillOf(p);
    if (!f.startsWith("#")) return p;
    const isDark = lum(f) < 128;
    const isCut = cutsAreDark ? isDark : !isDark;
    return isCut ? p.replace(/fill="[^"]*"/, `fill="${bg}"`) : p;
  });

const whiteGlyphs = recolor(extractGlyphs("estiologofoncer.svg"), true, DARK_BG);
const darkGlyphs = recolor(extractGlyphs("estiologoclair.svg"), false, LIGHT_BG);

mkdirSync("public", { recursive: true });
const VIEWBOX = "305 344 968 292";

writeFileSync(
  "public/estio-wordmark.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX}" fill="none">\n${whiteGlyphs.join("\n")}\n</svg>\n`,
);
writeFileSync(
  "public/estio-wordmark-dark.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX}" fill="none">\n${darkGlyphs.join("\n")}\n</svg>\n`,
);

// Favicon : deux tours seules (corps), transparent, couleur adaptative
const bodyStarts = ["M410 446", "M457 359"];
const eGlyph = extractGlyphs("estiologofoncer.svg")
  .filter((p) => bodyStarts.some((s) => dOf(p).startsWith(s)))
  .map((p) => p.replace(/fill="[^"]*"/, 'fill="currentColor"'));
writeFileSync(
  "src/app/icon.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="308 350 250 278" fill="none">\n<style>svg{color:#0a0a0b}@media (prefers-color-scheme:dark){svg{color:#f4f4f4}}</style>\n${eGlyph.join("\n")}\n</svg>\n`,
);

// Wordmark inline (loader) : les 2 tours reçoivent une classe pour l'animation
const inlinePaths = whiteGlyphs
  .map((p) => {
    if (dOf(p).startsWith("M410 446")) return p.replace("<path ", '<path className="loader-tower-a" ');
    if (dOf(p).startsWith("M457 359")) return p.replace("<path ", '<path className="loader-tower-b" ');
    return p;
  })
  .join("\n      ");
writeFileSync(
  "src/components/layout/EstioWordmarkInline.tsx",
  `// Généré par scripts/make-logo.mjs — ne pas éditer à la main.
import type { SVGProps } from "react";

export function EstioWordmarkInline(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="${VIEWBOX}" fill="none" {...props}>
      ${inlinePaths}
    </svg>
  );
}
`,
);

console.log(`wordmark ${whiteGlyphs.length} · dark ${darkGlyphs.length} · favicon ${eGlyph.length} · inline OK`);
