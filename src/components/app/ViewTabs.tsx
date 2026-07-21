import Link from "next/link";

const VIEWS = [
  { key: "pipeline", label: "Pipeline" },
  { key: "tableau", label: "Tableau" },
  { key: "carte", label: "Carte" },
] as const;

export type ViewKey = (typeof VIEWS)[number]["key"];

export function ViewTabs({
  projectId,
  active,
}: {
  projectId: string;
  active: ViewKey;
}) {
  return (
    <div className="flex gap-1 border-b border-border px-6">
      {VIEWS.map((v) => {
        const isActive = v.key === active;
        return (
          <Link
            key={v.key}
            href={`/app/p/${projectId}?view=${v.key}`}
            aria-current={isActive ? "page" : undefined}
            className={`border-b-2 px-3 py-3 text-sm transition-colors ${
              isActive
                ? "border-brand font-medium text-text"
                : "border-transparent text-muted hover:text-text"
            }`}
          >
            {v.label}
          </Link>
        );
      })}
    </div>
  );
}
