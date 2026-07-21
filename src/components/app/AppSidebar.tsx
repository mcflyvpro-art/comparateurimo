"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type SidebarProject = {
  id: string;
  name: string;
  archived: boolean;
};

/** Sidebar de l'app (groupe (app)) : logo, création de projet, switcher de projets.
 *  Remplace l'ancien AppHeader (crédits/wallet) du modèle pré-pivot. */
export function AppSidebar({ projects }: { projects: SidebarProject[] }) {
  const pathname = usePathname();
  const activeProjectId = pathname.match(/^\/app\/p\/([^/]+)/)?.[1];

  const active = projects.filter((p) => !p.archived);
  const archived = projects.filter((p) => p.archived);

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-border bg-bg-alt">
      <div className="px-5 py-6">
        <Link
          href="/app"
          className="font-sans text-xl font-semibold tracking-tight text-text"
        >
          estio<span className="text-brand">.</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3">
        <Link
          href="/app/projects"
          className="mb-4 flex items-center justify-center gap-2 rounded-full border border-border-strong bg-bg px-3 py-2 text-sm font-medium text-text transition-colors hover:border-brand"
        >
          <span aria-hidden>+</span> Nouveau projet
        </Link>

        <p className="mb-2 px-2 text-xs uppercase tracking-wide text-faint">
          Projets actifs
        </p>
        <ul className="space-y-1">
          {active.map((p) => (
            <SidebarProjectLink key={p.id} project={p} isActive={p.id === activeProjectId} />
          ))}
          {active.length === 0 && (
            <li className="px-3 py-2 text-sm text-faint">Aucun projet actif.</li>
          )}
        </ul>

        {archived.length > 0 && (
          <>
            <p className="mb-2 mt-6 px-2 text-xs uppercase tracking-wide text-faint">
              Archivés
            </p>
            <ul className="space-y-1">
              {archived.map((p) => (
                <SidebarProjectLink key={p.id} project={p} isActive={p.id === activeProjectId} />
              ))}
            </ul>
          </>
        )}
      </nav>

      <div className="border-t border-border px-5 py-4">
        <Link
          href="/app/projects"
          className="block text-sm text-muted transition-colors hover:text-text"
        >
          Tous les projets
        </Link>
        <Link
          href="/"
          className="mt-2 block text-sm text-muted transition-colors hover:text-text"
        >
          ← Retour au site
        </Link>
      </div>
    </aside>
  );
}

function SidebarProjectLink({
  project,
  isActive,
}: {
  project: SidebarProject;
  isActive: boolean;
}) {
  return (
    <li>
      <Link
        href={`/app/p/${project.id}`}
        aria-current={isActive ? "page" : undefined}
        className={`block truncate rounded-xl px-3 py-2 text-sm transition-colors ${
          isActive
            ? "bg-bg font-medium text-text"
            : "text-muted hover:bg-bg hover:text-text"
        }`}
      >
        {project.name}
      </Link>
    </li>
  );
}
