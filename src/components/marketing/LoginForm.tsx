"use client";

import { useState, type FormEvent } from "react";

/** Connexion — coquille : aucune auth réelle (viendra avec Supabase, E7). */
export function LoginForm() {
  const [info, setInfo] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setInfo(true);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium text-text">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-lg border border-border bg-bg-elevated px-4 py-3 text-text outline-none focus:border-brand"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-medium text-text">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="rounded-lg border border-border bg-bg-elevated px-4 py-3 text-text outline-none focus:border-brand"
        />
      </div>

      {info ? (
        <p
          role="status"
          className="rounded-lg border border-border bg-bg-alt px-4 py-3 text-sm text-muted"
        >
          La connexion n'est pas encore disponible — elle arrive bientôt.
        </p>
      ) : null}

      <button
        type="submit"
        className="cursor-pointer rounded-full bg-brand px-6 py-3 font-medium text-white transition-[transform,background-color] duration-100 hover:bg-brand-hover active:scale-[0.97]"
      >
        Se connecter
      </button>
    </form>
  );
}
