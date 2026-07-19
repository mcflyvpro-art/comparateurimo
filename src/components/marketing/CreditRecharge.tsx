/** Section recharge de crédits, affichée sous les cartes tarifs.
 *  Grisée en Phase 1 : réservée aux abonnés Pro & Expert, pas de paiement câblé. */
export function CreditRecharge() {
  const packs = [{ credits: 5 }, { credits: 15 }, { credits: 40 }];

  return (
    <section
      aria-labelledby="recharge-title"
      className="mx-auto mt-16 max-w-6xl px-6"
    >
      <div className="rounded-2xl border border-border bg-bg-alt p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2
            id="recharge-title"
            className="font-sans text-xl font-semibold text-text"
          >
            Recharge de crédits
          </h2>
          <span className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted">
            Réservé aux abonnés Pro &amp; Expert
          </span>
        </div>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Besoin de plus d’analyses ? Rechargez ponctuellement des crédits. La
          recharge n’est pas disponible en offre Free.
        </p>

        <div
          aria-disabled="true"
          className="mt-6 grid gap-4 opacity-60 sm:grid-cols-3"
        >
          {packs.map((p) => (
            <div
              key={p.credits}
              className="cursor-not-allowed rounded-xl border border-border bg-bg p-5 text-center"
            >
              <p className="font-sans text-2xl font-semibold text-text">
                {p.credits}
              </p>
              <p className="text-sm text-muted">crédits</p>
              <p className="mt-3 text-sm text-muted">— · bientôt</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
