import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page introuvable — Estio",
};

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
      <span className="font-sans text-6xl font-semibold tracking-tight text-brand">
        404
      </span>
      <h1 className="mt-6 font-sans text-2xl font-semibold text-text">
        Cette page n&apos;existe pas.
      </h1>
      <p className="mt-3 text-muted">
        Le lien est peut-être cassé, ou la page a été déplacée.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        Retour à l&apos;accueil
      </Link>
    </main>
  );
}
