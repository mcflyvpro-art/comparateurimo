"use client";

import { Reveal } from "@/components/ui/Feedback";
import { MagneticButton } from "@/components/landing/MagneticButton";
import { SourcesMarquee } from "@/components/landing/SourcesMarquee";
import { IconArrowRight } from "@/components/ui/Icon";

/**
 * Clôture.
 *
 * Une phrase, un bouton, les sources. En v1 il y avait en plus une rampe
 * incandescente pleine largeur et un paragraphe sur le moteur déterministe :
 * de l'ornement et de la documentation à l'endroit où l'on veut seulement
 * décider de cliquer.
 */
export function FinalCta() {
  return (
    <section data-header-theme="dark" className="border-t border-hairline">
      <div className="mx-auto max-w-[104rem] px-[var(--gutter)] py-28 lg:py-36">
        <Reveal cine>
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <h2 className="t-display max-w-2xl text-text">
              Votre prochaine recherche
              <br />
              commence par un bien.
            </h2>

            <div className="lg:pb-3">
              <MagneticButton href="/inscription" trailing={<IconArrowRight size={15} />}>
                Ouvrir un pipeline
              </MagneticButton>
              <p className="mt-4 text-[13px] text-text-3">
                Gratuit, sans carte bancaire.
              </p>
            </div>
          </div>
        </Reveal>

        <div className="mt-24 border-t border-hairline pt-10">
          <p className="mb-6 text-[13px] text-text-3">
            Toutes les données viennent de sources publiques officielles.
          </p>
          <SourcesMarquee />
        </div>
      </div>
    </section>
  );
}
