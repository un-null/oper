import { Avatar, Skeleton } from "@heroui/react";

import { PageShell } from "@/components/page-shell";

const SKELETON_KEYS = ["a", "b", "c", "d"];

export default function Loading() {
  return (
    <PageShell className="gap-8" width="focused">
      <div>
        <Skeleton className="h-9 w-32" />
        <Skeleton className="mt-2 h-5 w-64" />
      </div>
      <ul aria-hidden className="flex flex-col gap-2">
        {SKELETON_KEYS.map((key) => (
          <li
            className="border-border flex items-center gap-3 rounded-stub border px-4 py-3"
            key={key}
          >
            <Avatar>
              <Skeleton className="h-full w-full rounded-full" />
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
