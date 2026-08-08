import { buttonVariants, Typography } from "@heroui/react";
import { IconMapPinOff } from "@tabler/icons-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { EmptyState } from "@/components/empty-state";
import { ItemCard } from "@/components/item-card";
import { ItemFilters, ItemFiltersFallback } from "@/components/item-filters";
import { PageShell } from "@/components/page-shell";
import { findNearbyItems, getMyProfile, getViewerId } from "@/db/dal";
import { parseBrowseParams } from "@/lib/browse-params";

type HomeProps = {
  searchParams: Promise<{ from?: string; radius?: string; category?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const raw = await searchParams;
  const params = parseBrowseParams(raw);

  const [viewerId, nearbyItems] = await Promise.all([
    getViewerId(),
    findNearbyItems({
      lng: params.from.lng,
      lat: params.from.lat,
      radiusM: params.radiusKm * 1000,
      category: params.category,
    }),
  ]);

  if (viewerId && !(await getMyProfile(viewerId))) {
    redirect("/onboarding");
  }

  const query = new URLSearchParams(
    Object.entries(raw).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
  ).toString();

  const widerRadiusQuery = new URLSearchParams({
    ...Object.fromEntries(
      Object.entries(raw).filter(
        (entry): entry is [string, string] => typeof entry[1] === "string",
      ),
    ),
    radius: "5",
  }).toString();

  return (
    <PageShell className="gap-8" width="feed">
      <div>
        <Typography.Heading
          className="font-display max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl"
          level={1}
        >
          Give away the things you don't need to neighbors nearby.
        </Typography.Heading>
      </div>

      <h2 className="sr-only">Filters</h2>
      <Suspense fallback={<ItemFiltersFallback />}>
        <ItemFilters />
      </Suspense>

      <h2 className="sr-only">Nearby items</h2>
      {nearbyItems.length === 0 ? (
        <EmptyState
          action={
            <>
              <Link
                className={buttonVariants({ variant: "outline" })}
                href={`/?${widerRadiusQuery}`}
              >
                Search 5 km
              </Link>
              <Link className={buttonVariants()} href="/items/new">
                Give something away
              </Link>
            </>
          }
          description="Try a wider radius or a different pickup spot."
          icon={IconMapPinOff}
          title="Nothing nearby yet"
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {nearbyItems.map((item, index) => (
            <ItemCard
              distanceKm={item.distanceKm}
              href={query ? `/items/${item.id}?${query}` : `/items/${item.id}`}
              item={item}
              key={item.id}
              priority={index === 0}
            />
          ))}
        </div>
      )}
    </PageShell>
  );
}
