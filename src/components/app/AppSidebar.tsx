"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PropertyStatus } from "@/lib/pipeline-types";
import { IconArrowLeft, IconLayers, IconPlus } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";

/**
 * Rail latéral.
 *
 * En v1, chaque projet portait une bande de six segments colorés censée montrer
 * la répartition des biens dans le pipeline. Avec une palette d'étapes neutre,
 * cette bande devient six nuances de gris : un ornement illisible.
 *
 * Un chiffre suffit. Le détail de la répartition est sur le board, à un clic.
 */

export type SidebarProject = {
  id: string;
  name: string;
  archived: boolean;
  counts?: Partial<Record<PropertyStatus, number>>;
};

export function AppSidebar({ projects }: { projects: SidebarProject[] }) {
  const pathname = usePathname();
  const activeProjectId = pathname.match(/^\/app\/p\/([^/]+)/)?.[1];

  const active = projects.filter((p) => !p.archived);
  const archived = projects.filter((p) => p.archived);

  return (
    <aside className="hidden h-screen w-[var(--rail)] shrink-0 flex-col border-r border-hairline bg-sunken lg:flex">
      <div className="border-b border-hairline px-4 py-5">
        <Link href="/app" aria-label="Estio — accueil" className="inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/estio-wordmark.svg" alt="Estio" className="h-6 w-auto" />
        </Link>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        <Link
          href="/app/projects"
          className="mb-6 flex h-9 items-center justify-center gap-2 rounded-sm border border-hairline-2 text-[13px] font-medium text-text transition-[border-color,background-color] duration-[140ms] hover:border-hairline-3 hover:bg-surface"
        >
          <IconPlus size={14} />
          Nouveau projet
        </Link>

        <SidebarGroup label="Projets">
          {active.length === 0 ? (
            <li className="px-2 py-2 text-[13px] text-text-4">Aucun projet actif.</li>
          ) : (
            active.map((p) => (
              <ProjectRow key={p.id} project={p} isActive={p.id === activeProjectId} />
            ))
          )}
        </SidebarGroup>

        {archived.length > 0 && (
          <SidebarGroup label="Archivés" className="mt-7">
            {archived.map((p) => (
              <ProjectRow key={p.id} project={p} isActive={p.id === activeProjectId} muted />
            ))}
          </SidebarGroup>
        )}
      </nav>

      <div className="border-t border-hairline px-3 py-3">
        <SidebarLink href="/app/projects" icon={<IconLayers size={14} />}>
          Tous les projets
        </SidebarLink>
        <SidebarLink href="/" icon={<IconArrowLeft size={14} />}>
          Retour au site
        </SidebarLink>
      </div>
    </aside>
  );
}

function SidebarGroup({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="mb-2 px-2 text-[12px] font-medium text-text-4">{label}</p>
      <ul className="space-y-0.5">{children}</ul>
    </div>
  );
}

function ProjectRow({
  project,
  isActive,
  muted = false,
}: {
  project: SidebarProject;
  isActive: boolean;
  muted?: boolean;
}) {
  const total = project.counts
    ? Object.values(project.counts).reduce((a, b) => a + (b ?? 0), 0)
    : 0;

  return (
    <li>
      <Link
        href={`/app/p/${project.id}`}
        aria-current={isActive ? "page" : undefined}
        className={cx(
          "group relative flex items-center justify-between gap-2 rounded-sm px-2 py-2 transition-colors duration-[140ms]",
          isActive ? "bg-raised" : "hover:bg-surface",
        )}
      >
        {isActive && (
          <span
            className="absolute inset-y-1.5 left-0 w-[2px] rounded-full bg-brand"
            aria-hidden
          />
        )}
        <span
          className={cx(
            "truncate text-[13px] leading-snug",
            isActive ? "font-medium text-text" : muted ? "text-text-4" : "text-text-2",
            !isActive && "group-hover:text-text",
          )}
        >
          {project.name}
        </span>
        {total > 0 && (
          <span className="num shrink-0 text-[11px] text-text-4">{total}</span>
        )}
      </Link>
    </li>
  );
}

function SidebarLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-sm px-2 py-1.5 text-[13px] text-text-3 transition-colors hover:bg-surface hover:text-text"
    >
      <span className="text-text-4">{icon}</span>
      {children}
    </Link>
  );
}
