// Génère les logos Estio depuis les SVG source, en gardant les COULEURS D'ORIGINE
// (les immeubles restent bi-ton, comme le design de base).
//  - public/estio-wordmark.svg      : wordmark clair (foncer) — fond retiré
//  - public/estio-wordmark-dark.svg : wordmark sombre (clair) — fond retiré
//  - src/app/icon.svg               : favicon = icône (svg de base, couleurs)
//  - src/components/layout/EstioLoaderMark.tsx : logo du loader, tours animables
//    (plein ↔ contour), lettres en evenodd (trous nets, invisible sur fond noir).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const VIEWBOX = "305 344 968 292";
const dOf = (p) => (p.match(/\bd="([^"]+)"/) || [])[1] || "";
const firstX = (p) => {
  const m = dOf(p).match(/M\s*(-?\d+)/);
  return m ? +m[1] : 9999;
};
const extract = (file) =>
  [...readFileSync(file, "utf8").matchAll(/<path\b[^>]*\/>/g)]
    .map((m) => m[0])
    .filter((p) => !dOf(p).startsWith("M0 0")); // retire le fond

const foncer = extract("estiologofoncer.svg"); // glyphes clairs
const clair = extract("estiologoclair.svg"); //  glyphes sombres

mkdirSync("public", { recursive: true });
const svg = (paths, vb = VIEWBOX) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" fill="none">\n${paths.join("\n")}\n</svg>\n`;

// Wordmarks : couleurs d'origine conservées (bi-ton)
writeFileSync("public/estio-wordmark.svg", svg(foncer));
writeFileSync("public/estio-wordmark-dark.svg", svg(clair));

// Favicon : icône seule (svg de base « clair » = immeubles sombres, couleurs d'origine)
const iconClair = clair.filter((p) => firstX(p) < 600);
writeFileSync("src/app/icon.svg", svg(iconClair, "300 344 290 300"));

// Loader : lettres (evenodd, blanches) + tours animables (foncer)
const INK = "#f4f4f4";
const lettersD = foncer.filter((p) => firstX(p) >= 600).map(dOf).join(" ");
const dT1 = dOf(foncer.find((p) => dOf(p).startsWith("M410 446"))); // tour gauche pleine
const dT2frame = dOf(foncer.find((p) => dOf(p).startsWith("M457 359"))); // tour droite cadre
const dT2fill = dOf(foncer.find((p) => dOf(p).startsWith("M460 380"))); // remplissage tour droite

writeFileSync(
  "src/components/layout/EstioLoaderMark.tsx",
  `// Généré par scripts/make-logo.mjs — ne pas éditer à la main.
import type { SVGProps } from "react";

const INK = "${INK}";

// État A (grpA) : tour1 pleine · tour2 contour ; État B (grpB) : l'inverse.
export function EstioLoaderMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="${VIEWBOX}" fill="none" {...props}>
      <path fillRule="evenodd" fill={INK} d="${lettersD}" />
      <path fill={INK} d="${dT2frame}" />
      <g className="grpA">
        <path fill={INK} d="${dT1}" />
      </g>
      <g className="grpB">
        <path fill="none" stroke={INK} strokeWidth={12} d="${dT1}" />
        <path fill={INK} d="${dT2fill}" />
      </g>
    </svg>
  );
}
`,
);

console.log(`wordmark base (couleurs d'origine) · favicon icône clair · loader animé OK`);
