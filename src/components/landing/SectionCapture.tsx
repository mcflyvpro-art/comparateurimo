"use client";

import { Reveal } from "@/components/ui/Feedback";
import { Panel } from "@/components/ui/Panel";
import { Stat, StatGrid } from "@/components/ui/Stat";
import { VerdictBlock } from "@/components/ui/Verdict";
import { IconAperture, IconNote, IconPhoto } from "@/components/ui/Icon";

/**
 * La capture universelle.
 *
 * À gauche, quatre documents hors focale, de natures incompatibles. À droite,
 * un bien net et structuré. Entre les deux, le diaphragme.
 *
 * Le flou n'est pas décoratif : c'est l'état réel de ces sources pour un
 * agrégateur, qui ne peut pas les voir.
 */

const SOURCES = [
  { label: "Capture d'une annonce", icon: <IconPhoto size={14} />, rot: -2.6, blur: 2 },
  { label: "PDF d'agence", icon: <IconNote size={14} />, rot: 1.8, blur: 3 },
  { label: "Message de mandataire", icon: <IconNote size={14} />, rot: -1.2, blur: 1.5 },
  { label: "Fiche papier photographiée", icon: <IconPhoto size={14} />, rot: 3, blur: 3.5 },
];

export function SectionCapture() {
  return (
    <section
      id="capture"
      data-header-theme="dark"
      className="border-t border-hairline py-28 lg:py-36"
    >
      <div className="mx-auto max-w-[104rem] px-[var(--gutter)]">
        <Reveal cine>
          <h2 className="t-display max-w-3xl text-text">
            On photographie
            <br />
            l&apos;inagrégeable.
          </h2>
          <p className="t-lead mt-8 max-w-xl">
            Un agrégateur ne peut pas indexer ce qui n&apos;est publié nulle part. Estio,
            si : il suffit de le prendre en photo. Sans scraping, donc sans risque
            juridique.
          </p>
        </Reveal>

        <Reveal cine delay={0.1}>
          <div className="mt-14 grid items-center gap-8 lg:grid-cols-[minmax(0,0.85fr)_auto_minmax(0,1.15fr)] lg:gap-12">
            <ul className="flex flex-col gap-3">
              {SOURCES.map((s) => (
                <li
                  key={s.label}
                  className="flex items-center gap-3 rounded-md border border-hairline bg-surface px-4 py-3.5 transition-[filter,transform,border-color] duration-[520ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:!rotate-0 hover:border-hairline-3 hover:!blur-0"
                  style={{ transform: `rotate(${s.rot}deg)`, filter: `blur(${s.blur}px)` }}
                >
                  <span className="text-text-4">{s.icon}</span>
                  <span className="text-[13.5px] text-text-2">{s.label}</span>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-center gap-3 lg:flex-col">
              <span className="h-px w-10 bg-hairline-2 lg:h-14 lg:w-px" aria-hidden />
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-hairline-ember text-brand">
                <IconAperture size={20} />
              </span>
              <span className="h-px w-10 bg-hairline-2 lg:h-14 lg:w-px" aria-hidden />
            </div>

            <Panel>
              <h3 className="text-[14px] font-medium text-text">
                14 rue Sébastien Gryphe, Lyon 7ᵉ
              </h3>

              <StatGrid cols={3} className="mt-6">
                <Stat label="Prix affiché" value="245 000 €" />
                <Stat term="surfaceCarrez" value="68 m²" />
                <Stat term="prixM2Notarie" value="3 480 €" />
              </StatGrid>

              <div className="mt-7 border-t border-hairline pt-6">
                <VerdictBlock score={71} compact />
              </div>
            </Panel>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
