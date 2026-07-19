// Génère, à partir de estiologofoncer.svg (glyphes blancs sur fond noir) :
//  - public/estio-wordmark.svg : le wordmark « estio » seul (fond retiré, viewBox serré)
//  - src/app/icon.svg          : la favicon = l'icône « e » découpée, sur carré sombre
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const src = readFileSync("estiologofoncer.svg", "utf8");

// Récupère tous les <path .../>
const paths = [...src.matchAll(/<path\b[^>]*\/>/g)].map((m) => m[0]);
const dOf = (p) => (p.match(/\bd="([^"]+)"/) || [])[1] || "";

// Le fond = le path qui démarre en "M0 0"
const glyphs = paths.filter((p) => !dOf(p).startsWith("M0 0"));

// L'icône = les deux tours (corps pleins). On retire la diagonale d'ombrage
// (M460) pour garder un gap transparent entre les tours, et on recolore en
// currentColor pour une favicon adaptative (claire/sombre selon l'onglet).
const bodyStarts = ["M410 446", "M457 359"];
const eGlyph = glyphs
  .filter((p) => bodyStarts.some((s) => dOf(p).startsWith(s)))
  .map((p) => p.replace(/fill="[^"]*"/, 'fill="currentColor"'));

mkdirSync("public", { recursive: true });

// Wordmark complet (fond transparent, cadré serré sur les lettres)
const wordmark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="305 344 968 292" fill="none">
${glyphs.join("\n")}
</svg>
`;
writeFileSync("public/estio-wordmark.svg", wordmark);

// Favicon : fond transparent, les deux tours seules, couleur adaptative
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="308 350 250 278" fill="none">
<style>svg{color:#0a0a0b}@media (prefers-color-scheme:dark){svg{color:#f4f4f4}}</style>
${eGlyph.join("\n")}
</svg>
`;
writeFileSync("src/app/icon.svg", favicon);

console.log(`wordmark: ${glyphs.length} paths · favicon(e): ${eGlyph.length} paths`);
