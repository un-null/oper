import { buttonVariants } from "@heroui/react";
import type { Metadata } from "next";
import Link from "next/link";

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
          <h1 className="text-2xl font-semibold">My items</h1>
          <p className="text-muted mt-1 text-sm">
            {myItems.length === 1 ? "1 item posted" : `${myItems.length} items posted`}
          </p>
        </div>
        <Link className={buttonVariants()} href="/items/new">
          Give something away
        </Link>
      </div>

      {myItems.length === 0 ? (
        <div className="border-border rounded-lg border border-dashed px-6 py-16 text-center">
          <p className="text-muted text-sm">
            You haven't posted anything yet. Someone nearby probably needs what you're not using.
          </p>
        </div>
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
