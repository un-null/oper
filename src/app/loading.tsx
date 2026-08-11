import { Skeleton } from "@heroui/react";

import { ItemCardSkeleton } from "@/components/item-card";
import { ItemFiltersFallback } from "@/components/item-filters";
import { PageShell } from "@/components/page-shell";

const SKELETON_KEYS = ["a", "b", "c", "d", "e", "f"];

export default function Loading() {
  return (
    <PageShell className="gap-8" width="feed">
      <div>
        <Skeleton className="h-9 w-32" />
        <Skeleton className="mt-2 h-5 w-64" />
      </div>
      <ItemFiltersFallback />
      <div aria-hidden className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SKELETON_KEYS.map((key) => (
          <ItemCardSkeleton key={key} />
        ))}
      </div>
    </PageShell>
  );
}
