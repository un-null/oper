import { Typography } from "@heroui/react";
import { redirect } from "next/navigation";

import { ItemCard } from "@/components/item-card";
import { ItemFilters } from "@/components/item-filters";
import { PageShell } from "@/components/page-shell";
import { findNearbyItems, getMyProfile, getViewerId } from "@/db/dal";
import { parseBrowseParams } from "@/lib/browse-params";

type HomeProps = {
  searchParams: Promise<{ from?: string; radius?: string; category?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const viewerId = await getViewerId();
  if (viewerId && !(await getMyProfile(viewerId))) {
    redirect("/onboarding");
  }

  const raw = await searchParams;
  const params = parseBrowseParams(raw);

  const nearbyItems = await findNearbyItems({
    lng: params.from.lng,
    lat: params.from.lat,
    radiusM: params.radiusKm * 1000,
    category: params.category,
  });

  const query = new URLSearchParams(
    Object.entries(raw).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
  ).toString();

  return (
    <PageShell className="gap-8" width="feed">
      <div>
        <Typography.Heading level={1}>Oper</Typography.Heading>
        <Typography.Paragraph className="mt-1" color="muted">
          Give away the things you don't need to neighbors nearby.
        </Typography.Paragraph>
      </div>

      <ItemFilters />

      {nearbyItems.length === 0 ? (
        <div className="border-border rounded-lg border border-dashed px-6 py-16 text-center">
          <p className="text-muted text-sm">
            Nothing nearby yet. Try a wider radius or a different pickup spot.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {nearbyItems.map((item) => (
            <ItemCard
              distanceKm={item.distanceKm}
              href={query ? `/items/${item.id}?${query}` : `/items/${item.id}`}
              item={item}
              key={item.id}
            />
          ))}
        </div>
      )}
    </PageShell>
  );
}
