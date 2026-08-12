import { Skeleton } from "@heroui/react";

import { ItemCardSkeleton } from "@/components/item-card";
import { ItemFiltersFallback } from "@/components/item-filters";
import { PageShell } from "@/components/page-shell";

const SKELETON_KEYS = ["a", "b", "c", "d", "e", "f"];

export default function Loading() {
  return (
    <PageShell className="gap-8" width="feed">
      {/* Tracks HomeHero's min-h floors so the hero does not jump on hydration. */}
      <Skeleton className="rounded-stub h-[420px] w-full sm:h-[480px] md:h-[380px] lg:h-[420px]" />
      <ItemFiltersFallback />
      <div aria-hidden className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SKELETON_KEYS.map((key) => (
          <ItemCardSkeleton key={key} />
        ))}
      </div>
    </PageShell>
  );
}
