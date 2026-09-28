import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-zinc-800/60", className)} {...props} />;
}

export function PlaceCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 p-0 shadow-xl">
      <Skeleton className="h-56 w-full rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-6 w-3/4 rounded-lg" />
        <Skeleton className="h-4 w-1/2 rounded-lg" />
        <Skeleton className="h-4 w-full rounded-lg" />
        <Skeleton className="h-4 w-2/3 rounded-lg" />
      </div>
    </div>
  );
}

export function MapSkeleton() {
  return (
    <div className="relative h-[480px] w-full rounded-3xl border border-zinc-800 bg-zinc-950 overflow-hidden flex items-center justify-center">
      <Skeleton className="absolute inset-0 size-full" />
      <div className="relative z-10 flex flex-col items-center gap-3">
        <Skeleton className="size-12 rounded-full" />
        <Skeleton className="h-4 w-40 rounded-lg" />
      </div>
    </div>
  );
}

export function TrailCardSkeleton() {
  return (
    <div className="flex flex-col justify-between rounded-3xl border border-zinc-800 bg-zinc-900 p-6 space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-5 w-28 rounded-full" />
        <Skeleton className="h-6 w-3/4 rounded-lg" />
        <Skeleton className="h-4 w-full rounded-lg" />
      </div>
      <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
        <Skeleton className="h-4 w-32 rounded-lg" />
        <Skeleton className="h-4 w-20 rounded-lg" />
      </div>
    </div>
  );
}

export function PlannerPreviewSkeleton() {
  return (
    <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-5 space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-36 rounded-full" />
        <Skeleton className="h-4 w-12 rounded-full" />
      </div>
      <Skeleton className="h-6 w-2/3 rounded-lg" />
      <div className="space-y-2 py-2">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
      <Skeleton className="h-4 w-full rounded-lg" />
    </div>
  );
}

export { Skeleton };
