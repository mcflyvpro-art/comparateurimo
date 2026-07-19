export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-[#FBF7F0] px-6 text-center">
      <span className="rounded-full border border-[#C86B4A]/30 bg-white px-4 py-1 text-sm font-medium text-[#C86B4A]">
        MVP en construction
      </span>

      <h1 className="max-w-2xl text-5xl font-semibold tracking-tight text-[#2B2320] sm:text-6xl">
        Estio
      </h1>

      <p className="max-w-xl text-lg leading-8 text-[#6B615A]">
        Compare tes biens immobiliers côte à côte, du point de vue de
        l&apos;investissement. Chaque adresse déverrouille les données de marché,
        et le score reflète <em>tes</em> priorités.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <a
          href="#"
          className="rounded-full bg-[#C86B4A] px-6 py-3 font-medium text-white transition-colors hover:bg-[#b45c3d]"
        >
          + Ajouter un bien
        </a>
        <a
          href="/api/health"
          className="rounded-full border border-[#2B2320]/15 bg-white px-6 py-3 font-medium text-[#2B2320] transition-colors hover:border-[#2B2320]/30"
        >
          Vérifier la connexion
        </a>
      </div>
    </main>
  );
}
