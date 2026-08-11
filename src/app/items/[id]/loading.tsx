import { Skeleton } from "@heroui/react";

import { PageShell } from "@/components/page-shell";

export default function Loading() {
  return (
    <PageShell className="gap-8" stickyCta width="focused">
      <Skeleton className="h-9 w-9 rounded-full" />
      <Skeleton className="rounded-stub aspect-[4/3]" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-40" />
      </div>
      <Skeleton className="rounded-stub h-44" />
    </PageShell>
  );
}
