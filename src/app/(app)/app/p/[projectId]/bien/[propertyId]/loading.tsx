import { Skeleton } from "@/components/ui/Feedback";
import { Panel } from "@/components/ui/Panel";

/** Attente de la fiche : mêmes colonnes, mêmes hauteurs de panneau. */
export default function LoadingFiche() {
  return (
    <div className="min-h-0 flex-1 overflow-hidden">
      <div className="border-b border-line-soft px-6 py-2.5">
        <Skeleton className="h-3.5 w-64" />
      </div>

      <div className="mx-auto max-w-[104rem] px-6 py-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_23rem]">
          <div className="flex flex-col gap-4">
            <Panel>
              <Skeleton className="h-2.5 w-24" />
              <div className="mt-6 grid gap-8 lg:grid-cols-2">
                <div>
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="mt-4 h-3.5 w-full" />
                  <Skeleton className="mt-5 h-3 w-5/6" />
                  <Skeleton className="mt-2 h-3 w-4/6" />
                </div>
                <div className="flex flex-col gap-4">
                  {[0, 1, 2].map((i) => (
                    <div key={i}>
                      <Skeleton className="h-2.5 w-28" />
                      <Skeleton className="mt-2 h-1.5 w-full" />
                    </div>
                  ))}
                </div>
              </div>
            </Panel>

            {[0, 1, 2].map((i) => (
              <Panel key={i}>
                <Skeleton className="h-2.5 w-28" />
                <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-4">
                  {Array.from({ length: 8 }, (_, j) => (
                    <div key={j}>
                      <Skeleton className="h-2 w-16" />
                      <Skeleton className="mt-2 h-3.5 w-20" />
                    </div>
                  ))}
                </div>
              </Panel>
            ))}
          </div>

          <Panel>
            <Skeleton className="h-2.5 w-20" />
            <div className="mt-6 flex flex-col gap-5">
              {Array.from({ length: 7 }, (_, i) => (
                <div key={i}>
                  <Skeleton className="h-2.5 w-24" />
                  <Skeleton className="mt-2.5 h-[3px] w-full" />
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
