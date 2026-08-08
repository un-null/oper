import { Skeleton } from "@heroui/react";

import { ItemCardSkeleton } from "@/components/item-card";
import { PageShell } from "@/components/page-shell";

const SKELETON_KEYS = ["a", "b", "c", "d"];

export default function Loading() {
  return (
    <PageShell className="gap-8" width="feed">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Skeleton className="h-9 w-32" />
          <Skeleton className="mt-2 h-5 w-28" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>
      <div aria-hidden className="grid gap-5 sm:grid-cols-2">
        {SKELETON_KEYS.map((key) => (
          <ItemCardSkeleton key={key} />
        ))}
      </div>
    </PageShell>
  );
}
