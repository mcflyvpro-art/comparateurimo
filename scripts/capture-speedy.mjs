// Agent « utilisateur » Playwright : ouvre speedy.io en vrai (fenêtre visible =
// live view), scrolle à la molette (Locomotive Scroll détourne le scroll natif,
// donc on émet de vrais events wheel), et screenshote chaque état d'animation.
// Sorties : inspi/auto/NN.png + inspi/auto/_report.json (structure + libs).
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const OUT = "inspi/auto";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: false, slowMo: 120 });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto("https://speedy.io/", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(5000); // laisse charger le rendu + passer le loader splash

// Mesures structurelles + détection des libs d'animation
const report = await page.evaluate(() => {
  const pick = (s) => ({
    tag: s.tagName.toLowerCase(),
    cls: (s.className || "").toString().slice(0, 46),
    top: Math.round(s.offsetTop),
    h: Math.round(s.offsetHeight),
    vhs: +(s.offsetHeight / window.innerHeight).toFixed(2),
  });
  return {
    docHeight: document.documentElement.scrollHeight,
    vh: window.innerHeight,
    libs: {
      gsap: typeof window.gsap !== "undefined",
      ScrollTrigger: !!(window.ScrollTrigger || (window.gsap && window.gsap.core)),
      locomotive: !!(document.querySelector(".js-locomotive") || document.querySelector("[data-scroll-container]")),
      pinSpacers: document.querySelectorAll(".pin-spacer").length,
    },
    sections: [...document.querySelectorAll("header, section, footer")].map(pick),
  };
});
const { writeFileSync } = await import("node:fs");
writeFileSync(`${OUT}/_report.json`, JSON.stringify(report, null, 2));
console.log("REPORT:", JSON.stringify(report.libs), "docHeight", report.docHeight);
console.log("SECTIONS:", report.sections.length);

// Parcours : ~44 crans de molette, screenshot à chaque état
const STEPS = 44;
const DELTA = 620; // px par cran
let idx = 0;
const shot = async () => {
  const n = String(idx).padStart(2, "0");
  await page.screenshot({ path: `${OUT}/${n}.png` });
  idx++;
};

await shot(); // état initial (hero)
for (let i = 0; i < STEPS; i++) {
  await page.mouse.wheel(0, DELTA);
  await page.waitForTimeout(420); // laisse le scrub/anim se poser
  await shot();
}

console.log(`DONE: ${idx} screenshots -> ${OUT}/`);
await browser.close();
