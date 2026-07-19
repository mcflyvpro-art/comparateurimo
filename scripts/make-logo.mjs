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

// L'icône « e » = les 3 paths dont le d commence par ces coordonnées
const eStarts = ["M460 380", "M410 446", "M457 359"];
const eGlyph = glyphs.filter((p) => eStarts.some((s) => dOf(p).startsWith(s)));

mkdirSync("public", { recursive: true });

// Wordmark complet (fond transparent, cadré serré sur les lettres)
const wordmark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="305 344 968 292" fill="none">
${glyphs.join("\n")}
</svg>
`;
writeFileSync("public/estio-wordmark.svg", wordmark);

// Favicon : carré sombre + icône « e »
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="288 338 300 300" fill="none">
<rect x="288" y="338" width="300" height="300" rx="64" fill="#0a0a0b"/>
${eGlyph.join("\n")}
</svg>
`;
writeFileSync("src/app/icon.svg", favicon);

console.log(`wordmark: ${glyphs.length} paths · favicon(e): ${eGlyph.length} paths`);
