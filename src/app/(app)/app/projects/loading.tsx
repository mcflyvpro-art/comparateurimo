import { Skeleton } from "@/components/ui/Feedback";
import { Panel } from "@/components/ui/Panel";

/** Attente de la liste des projets. */
export default function LoadingProjects() {
  return (
    <div className="min-h-0 flex-1 overflow-hidden">
      <div className="mx-auto max-w-6xl px-8 py-12">
        <Skeleton className="h-2.5 w-32" />
        <Skeleton className="mt-4 h-9 w-48" />
        <Skeleton className="mt-4 h-3.5 w-96" />

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div>
            <Skeleton className="h-2.5 w-16" />
            <div className="mt-4 flex flex-col gap-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-6 rounded-lg border border-line-soft bg-surface px-5 py-4"
                >
                  <div className="flex-1">
                    <Skeleton className="h-4 w-44" />
                    <Skeleton className="mt-2 h-2.5 w-64" />
                    <Skeleton className="mt-3 h-[3px] w-48" />
                  </div>
                  <Skeleton className="h-6 w-8" />
                </div>
              ))}
            </div>
          </div>

          <Panel>
            <Skeleton className="h-2.5 w-28" />
            <div className="mt-6 flex flex-col gap-5">
              {[0, 1, 2].map((i) => (
                <div key={i}>
                  <Skeleton className="h-2.5 w-24" />
                  <Skeleton className="mt-2 h-9 w-full" />
                </div>
              ))}
              <Skeleton className="h-9 w-full" />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
