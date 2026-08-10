"use client";

import { useState, type FormEvent } from "react";
import { Checkbox, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Feedback";
import { IconArrowRight, IconMail } from "@/components/ui/Icon";
import Link from "next/link";

/**
 * Création de compte — coquille visuelle.
 *
 * Trois champs, pas dix : on ne demande ni téléphone, ni société, ni budget. Le
 * profil d'investisseur se déduira de l'usage, pas d'un questionnaire d'entrée
 * qui fait fuir la moitié des inscrits.
 */
export function SignupForm() {
  const [info, setInfo] = useState(false);
  const [cgu, setCgu] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setInfo(true);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        icon={<IconMail size={15} />}
        onClick={() => setInfo(true)}
      >
        Continuer avec Google
      </Button>

      <div className="flex items-center gap-4">
        <span className="h-px flex-1 bg-line-soft" aria-hidden />
        <span className="t-caps">ou</span>
        <span className="h-px flex-1 bg-line-soft" aria-hidden />
      </div>

      <Input
        id="signup-email"
        name="email"
        type="email"
        required
        autoComplete="email"
        label="Adresse e-mail"
        placeholder="vous@exemple.fr"
      />

      <Input
        id="signup-password"
        name="password"
        type="password"
        required
        autoComplete="new-password"
        label="Mot de passe"
        placeholder="Douze caractères minimum"
        hint="Douze caractères au moins. Aucune règle absurde de majuscule et de symbole."
      />

      <Checkbox
        checked={cgu}
        onChange={setCgu}
        label={
          <span className="text-[12px] leading-snug">
            J&apos;accepte les{" "}
            <Link href="/cgu" className="text-accent underline-offset-2 hover:underline">
              conditions d&apos;utilisation
            </Link>{" "}
            et la{" "}
            <Link
              href="/confidentialite"
              className="text-accent underline-offset-2 hover:underline"
            >
              politique de confidentialité
            </Link>
            .
          </span>
        }
      />

      {info && (
        <Notice>
          La création de compte n&apos;est pas encore branchée — elle arrive avec
          l&apos;authentification Supabase.
        </Notice>
      )}

      <Button
        type="submit"
        variant="solid"
        size="lg"
        disabled={!cgu}
        className="mt-1 w-full"
        trailing={<IconArrowRight size={15} />}
      >
        Créer mon compte
      </Button>

      <p className="text-[11px] leading-relaxed text-text-4">
        Le plan Free est gratuit et sans carte bancaire : un projet, trois biens, le
        pré-verdict en illimité.
      </p>
    </form>
  );
}
