"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Feedback";
import { IconArrowRight, IconMail } from "@/components/ui/Icon";

/**
 * Connexion — coquille visuelle.
 *
 * L'authentification réelle (Supabase, Google et e-mail) arrive plus loin dans la
 * feuille de route. Le formulaire est complet et accessible dès maintenant pour
 * que le branchement soit une substitution, pas une refonte.
 */
export function LoginForm() {
  const [info, setInfo] = useState(false);

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
        id="email"
        name="email"
        type="email"
        required
        autoComplete="email"
        label="Adresse e-mail"
        placeholder="vous@exemple.fr"
      />

      <Input
        id="password"
        name="password"
        type="password"
        required
        autoComplete="current-password"
        label="Mot de passe"
        placeholder="••••••••"
      />

      {info && (
        <Notice>
          La connexion n&apos;est pas encore branchée — comptes et sessions arrivent avec
          l&apos;authentification Supabase.
        </Notice>
      )}

      <Button
        type="submit"
        variant="solid"
        size="lg"
        className="mt-1 w-full"
        trailing={<IconArrowRight size={15} />}
      >
        Se connecter
      </Button>
    </form>
  );
}
