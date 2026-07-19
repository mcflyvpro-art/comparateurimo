// Génère les logos Estio depuis les SVG source.
//  - Wordmark = TOURS en couleurs d'origine (bi-ton) + LETTRES fusionnées en un
//    seul path fill-rule=evenodd → contre-formes (e, o…) = VRAIS trous transparents.
//  - Favicon = petit immeuble blanc + grand immeuble noir.
//  - EstioLoaderMark = logo du loader, tours animables (plein ↔ contour).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const INK_LIGHT = "#f4f4f4";
const INK_DARK = "#0a0a0b";
const VIEWBOX = "305 344 968 292";

const dOf = (p) => (p.match(/\bd="([^"]+)"/) || [])[1] || "";
const firstX = (p) => {
  const m = dOf(p).match(/M\s*(-?\d+)/);
  return m ? +m[1] : 9999;
};
const extract = (file) =>
  [...readFileSync(file, "utf8").matchAll(/<path\b[^>]*\/>/g)]
    .map((m) => m[0])
    .filter((p) => !dOf(p).startsWith("M0 0"));

const foncer = extract("estiologofoncer.svg");
const clair = extract("estiologoclair.svg");

const towersOf = (g) => g.filter((p) => firstX(p) < 600); // couleurs d'origine
const lettersD = foncer.filter((p) => firstX(p) >= 600).map(dOf).join(" "); // géométrie

mkdirSync("public", { recursive: true });
const svg = (inner, vb = VIEWBOX) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" fill="none">\n${inner}\n</svg>\n`;

// Wordmark : tours (base) + lettres en un seul path evenodd (vrais trous)
const wordmark = (towers, ink) =>
  svg(`${towers.join("\n")}\n<path fill-rule="evenodd" fill="${ink}" d="${lettersD}"/>`);
writeFileSync("public/estio-wordmark.svg", wordmark(towersOf(foncer), INK_LIGHT));
writeFileSync("public/estio-wordmark-dark.svg", wordmark(towersOf(clair), INK_DARK));

// Favicon : petit immeuble (M410) blanc, grand immeuble (M457 + M460) noir
const dSmall = dOf(foncer.find((p) => dOf(p).startsWith("M410 446")));
const dBigFrame = dOf(foncer.find((p) => dOf(p).startsWith("M457 359")));
const dBigFill = dOf(foncer.find((p) => dOf(p).startsWith("M460 380")));
writeFileSync(
  "src/app/icon.svg",
  svg(
    `<path fill="#ffffff" d="${dSmall}"/>\n<path fill="#0a0a0b" d="${dBigFrame}"/>\n<path fill="#0a0a0b" d="${dBigFill}"/>`,
    "300 344 290 300",
  ),
);

// Loader : lettres evenodd + tours animables
writeFileSync(
  "src/components/layout/EstioLoaderMark.tsx",
  `// Généré par scripts/make-logo.mjs — ne pas éditer à la main.
import type { SVGProps } from "react";

const INK = "${INK_LIGHT}";

// État A (grpA) : tour1 pleine · tour2 contour ; État B (grpB) : l'inverse.
export function EstioLoaderMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="${VIEWBOX}" fill="none" {...props}>
      <path fillRule="evenodd" fill={INK} d="${lettersD}" />
      <path fill={INK} d="${dBigFrame}" />
      <g className="grpA">
        <path fill={INK} d="${dSmall}" />
      </g>
      <g className="grpB">
        <path fill="none" stroke={INK} strokeWidth={12} d="${dSmall}" />
        <path fill={INK} d="${dBigFill}" />
      </g>
    </svg>
  );
}
`,
);

console.log("wordmark: tours base + lettres evenodd · favicon bi-ton · loader OK");
