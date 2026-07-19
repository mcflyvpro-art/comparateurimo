"use client";

import { useState, type FormEvent } from "react";

/** Formulaire de contact — coquille : validation visuelle, aucun envoi réel. */
export function ContactForm() {
  const [envoye, setEnvoye] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnvoye(true);
  }

  if (envoye) {
    return (
      <div
        role="status"
        className="rounded-xl border border-border bg-bg-elevated p-8 text-center"
      >
        <p className="font-sans text-lg font-semibold text-text">
          Message bien reçu.
        </p>
        <p className="mt-2 text-muted">
          Démo : l’envoi n’est pas encore connecté. On te répondra dès que le
          service sera en ligne.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="nom" className="text-sm font-medium text-text">
          Nom
        </label>
        <input
          id="nom"
          name="nom"
          required
          autoComplete="name"
          className="rounded-lg border border-border bg-bg-elevated px-4 py-3 text-text outline-none focus:border-brand"
        />
      </div>
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
        <label htmlFor="message" className="text-sm font-medium text-text">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="rounded-lg border border-border bg-bg-elevated px-4 py-3 text-text outline-none focus:border-brand"
        />
      </div>
      <button
        type="submit"
        className="cursor-pointer self-start rounded-full bg-brand px-6 py-3 font-medium text-white transition-[transform,background-color] duration-100 hover:bg-brand-hover active:scale-[0.97]"
      >
        Envoyer
      </button>
    </form>
  );
}
