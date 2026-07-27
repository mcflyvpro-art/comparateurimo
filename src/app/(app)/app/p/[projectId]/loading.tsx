import { Skeleton } from "@/components/ui/Feedback";
import { STATUS_COLUMNS } from "@/lib/pipeline-types";

/**
 * Attente du board.
 *
 * L'ossature reproduit exactement la géométrie finale — six colonnes, mêmes
 * largeurs, mêmes filets colorés. Quand les données arrivent, rien ne saute :
 * la matière se substitue au vide sans déplacer un pixel.
 */
export default function LoadingBoard() {
  const rows = [4, 3, 2, 2, 3, 1];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-6 border-b border-hairline px-5 py-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
      </div>

      <div className="flex min-h-0 flex-1 gap-3 overflow-hidden px-5 py-4">
        {STATUS_COLUMNS.map((col, ci) => (
          <div key={col.key} className="flex w-[17.5rem] shrink-0 flex-col">
            <div className="flex items-center gap-2 px-0.5 pb-3">
              <span className="text-[13px] font-medium text-text-4">{col.label}</span>
              <span className="ml-auto h-px w-full max-w-8 bg-hairline" aria-hidden />
            </div>

            <div className="flex flex-col gap-2 p-1.5">
              {Array.from({ length: rows[ci] }, (_, i) => (
                <div
                  key={i}
                  className="rounded-md border border-hairline bg-surface p-3"
                  style={{ animationDelay: `${(ci * 3 + i) * 60}ms` }}
                >
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="mt-2 h-2.5 w-1/2" />
                  <Skeleton className="mt-4 h-4 w-2/5" />
                  <Skeleton className="mt-3 h-[5px] w-full" />
                  <Skeleton className="mt-4 h-2.5 w-1/4" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
