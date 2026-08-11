import { buttonVariants, Typography } from "@heroui/react";
import { IconPackageOff } from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { ItemCard } from "@/components/item-card";
import { PageShell } from "@/components/page-shell";
import { getMyItems, requireProfile } from "@/db/dal";

export const metadata: Metadata = {
  title: "My items — Oper",
  description: "The items you have posted for neighbors to pick up.",
};

export default async function MyItemsPage() {
  const profile = await requireProfile();
  const myItems = await getMyItems(profile.id);

  return (
    <PageShell className="gap-8" width="feed">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Typography.Heading className="text-2xl font-semibold" level={1}>
            My items
          </Typography.Heading>
          <p className="text-muted mt-1 text-sm">
            {myItems.length === 1 ? "1 item posted" : `${myItems.length} items posted`}
          </p>
        </div>
        <Link className={buttonVariants()} href="/items/new">
          Give something away
        </Link>
      </div>

      <h2 className="sr-only">Posted items</h2>
      {myItems.length === 0 ? (
        <EmptyState
          action={
            <Link className={buttonVariants()} href="/items/new">
              Give something away
            </Link>
          }
          description="Someone nearby probably needs what you're not using."
          icon={IconPackageOff}
          title="You haven't posted anything yet"
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {myItems.map((item) => (
            <ItemCard href={`/items/${item.id}`} item={item} key={item.id} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
