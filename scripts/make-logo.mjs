// Génère les logos Estio depuis les SVG source.
//  - public/estio-wordmark.svg / -dark.svg : wordmark en UN path fill-rule=evenodd
//    → toutes les contre-formes (e, o…) sont de VRAIS trous transparents.
//  - src/app/icon.svg : favicon (2 tours, couleur adaptative).
//  - src/components/layout/EstioLoaderMark.tsx : logo du loader, avec les 2 tours
//    séparées et animables (plein ↔ contour) pour l'alternance clair/foncé.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const INK_LIGHT = "#f4f4f4"; // encre claire (fond sombre)
const INK_DARK = "#0a0a0b"; //  encre sombre (fond clair)
const VIEWBOX = "305 344 968 292";

const dOf = (p) => (p.match(/\bd="([^"]+)"/) || [])[1] || "";
const firstX = (p) => {
  const m = dOf(p).match(/M\s*(-?\d+)/);
  return m ? +m[1] : 9999;
};

const glyphs = [...readFileSync("estiologofoncer.svg", "utf8").matchAll(/<path\b[^>]*\/>/g)]
  .map((m) => m[0])
  .filter((p) => !dOf(p).startsWith("M0 0"));

const allD = glyphs.map(dOf).join(" ");
// Tours (x < 600) vs lettres (x >= 600)
const lettersD = glyphs.filter((p) => firstX(p) >= 600).map(dOf).join(" ");
const t1 = glyphs.find((p) => dOf(p).startsWith("M410 446")); // tour gauche (pleine)
const t2frame = glyphs.find((p) => dOf(p).startsWith("M457 359")); // tour droite (cadre)
const t2fill = glyphs.find((p) => dOf(p).startsWith("M460 380")); // remplissage tour droite
const dT1 = dOf(t1);
const dT2frame = dOf(t2frame);
const dT2fill = dOf(t2fill);

mkdirSync("public", { recursive: true });

const wordmark = (ink) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX}" fill="none"><path fill-rule="evenodd" fill="${ink}" d="${allD}"/></svg>\n`;
writeFileSync("public/estio-wordmark.svg", wordmark(INK_LIGHT));
writeFileSync("public/estio-wordmark-dark.svg", wordmark(INK_DARK));

// Favicon : les deux tours pleines, transparent, couleur adaptative
writeFileSync(
  "src/app/icon.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="308 350 250 278" fill="none">\n` +
    `<style>svg{color:#0a0a0b}@media (prefers-color-scheme:dark){svg{color:#f4f4f4}}</style>\n` +
    `<path fill="currentColor" d="${dT1}"/>\n<path fill="currentColor" d="${dT2frame}"/>\n<path fill="currentColor" d="${dT2fill}"/>\n</svg>\n`,
);

// Loader : lettres statiques + tours qui alternent plein/contour.
// État A (grpA visible) : tour1 pleine · tour2 cadre seul (contour).
// État B (grpB visible) : tour1 contour · tour2 pleine (cadre + remplissage).
writeFileSync(
  "src/components/layout/EstioLoaderMark.tsx",
  `// Généré par scripts/make-logo.mjs — ne pas éditer à la main.
import type { SVGProps } from "react";

const INK = "${INK_LIGHT}";

export function EstioLoaderMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="${VIEWBOX}" fill="none" {...props}>
      <path fillRule="evenodd" fill={INK} d="${lettersD}" />
      {/* tour droite : cadre toujours visible */}
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

console.log(`wordmark evenodd OK · lettres ${glyphs.filter((p) => firstX(p) >= 600).length} · tours 3`);
