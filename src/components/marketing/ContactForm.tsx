"use client";

import { useState, type FormEvent } from "react";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { IconArrowRight, IconCheck } from "@/components/ui/Icon";

const SUJETS = [
  "Une question sur le produit",
  "Un bug ou un chiffre qui cloche",
  "Usage professionnel (CGP, chasseur)",
  "Presse",
  "Autre",
];

/**
 * Formulaire de contact — coquille : validation visuelle, aucun envoi réel.
 *
 * L'accusé de réception occupe exactement la même surface que le formulaire :
 * la page ne saute pas, le regard reste au même endroit. Détail invisible,
 * différence sensible.
 */
export function ContactForm() {
  const [envoye, setEnvoye] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnvoye(true);
  }

  if (envoye) {
    return (
      <Panel className="flex min-h-[26rem] flex-col items-center justify-center text-center">
        <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-full border border-accent-line text-accent">
          <IconCheck size={20} />
        </span>
        <p className="text-[15px] font-medium text-text">Message bien reçu.</p>
        <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-text-3">
          Démonstration : l&apos;envoi n&apos;est pas encore branché. Nous répondrons dès
          que le service sera en ligne.
        </p>
        <Button
          variant="quiet"
          size="sm"
          className="mt-6"
          onClick={() => setEnvoye(false)}
        >
          Écrire un autre message
        </Button>
      </Panel>
    );
  }

  return (
    <Panel>
      <form onSubmit={onSubmit} className="flex min-h-[26rem] flex-col gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Input id="nom" name="nom" required autoComplete="name" label="Nom" />
          <Input
            id="contact-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            label="Adresse e-mail"
          />
        </div>

        <Select id="sujet" name="sujet" label="Sujet" defaultValue={SUJETS[0]}>
          {SUJETS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>

        <Textarea
          id="message"
          name="message"
          required
          rows={6}
          label="Message"
          placeholder="Dites-nous tout — y compris ce qui ne va pas."
          className="flex-1"
        />

        <Button
          type="submit"
          variant="solid"
          size="md"
          className="self-start"
          trailing={<IconArrowRight size={15} />}
        >
          Envoyer
        </Button>
      </form>
    </Panel>
  );
}
