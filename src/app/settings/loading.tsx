import { Card, Skeleton } from "@heroui/react";

import { PageShell } from "@/components/page-shell";

export default function Loading() {
  return (
    <PageShell className="gap-8" width="focused">
      <div aria-hidden className="flex flex-col gap-8">
        <Skeleton className="h-9 w-32" />

        <Card>
          <Card.Header>
            <div className="flex items-center gap-3">
              <Skeleton className="size-9 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
          </Card.Header>
          <Card.Content className="gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-9 w-20" />
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <Skeleton className="h-4 w-24" />
          </Card.Header>
          <Card.Content>
            <Skeleton className="h-10 w-full max-w-64" />
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <Skeleton className="h-4 w-20" />
          </Card.Header>
          <Card.Content>
            <Skeleton className="h-4 w-40" />
          </Card.Content>
        </Card>

        <Skeleton className="h-9 w-24" />
      </div>
    </PageShell>
  );
}
