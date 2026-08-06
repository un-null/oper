import { buttonVariants, Chip, Typography } from "@heroui/react";
import {
  IconArrowLeft,
  IconCalendar,
  IconInfoCircle,
  IconMapPin,
  IconPhoto,
} from "@tabler/icons-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { GiverProfileCard } from "@/components/giver-profile-card";
import { MessageGiverButton } from "@/components/message-giver-button";
import { PageShell } from "@/components/page-shell";
import { PickupMap } from "@/components/pickup-map";
import { countGivenItems, findItemDetail, getViewerId } from "@/db/dal";
import { parseBrowseParams } from "@/lib/browse-params";
import { CATEGORY_LABELS, CONDITION_LABELS } from "@/lib/item-labels";
import { findPickupSpot, findPickupSpotByLabel } from "@/lib/pickup-spots";

export const metadata: Metadata = {
  title: "Item — Oper",
  description: "Item details, pickup spot, and giver profile.",
};

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

type ItemDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string; radius?: string; category?: string }>;
};

export default async function ItemDetailPage({ params, searchParams }: ItemDetailPageProps) {
  const { id } = await params;
  const idResult = z.uuid().safeParse(id);
  if (!idResult.success) {
    notFound();
  }

  const raw = await searchParams;
  const browseParams = parseBrowseParams(raw);
  const hasExplicitFrom = raw.from !== undefined && findPickupSpot(raw.from) !== undefined;

  const viewerId = await getViewerId();
  const item = await findItemDetail(viewerId, idResult.data, {
    lng: browseParams.from.lng,
    lat: browseParams.from.lat,
  });
  if (!item) {
    notFound();
  }

  const givenCount = await countGivenItems(item.giverId);
  const isOwner = viewerId === item.giverId;
  const mapSpot = findPickupSpotByLabel(item.pickupSpot);

  const backQuery = new URLSearchParams(
    Object.entries(raw).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
  ).toString();
  const backHref = backQuery ? `/?${backQuery}` : "/";

  return (
    <PageShell className="gap-8" stickyCta width="focused">
      <Link
        aria-label="Back to nearby items"
        className={buttonVariants({ isIconOnly: true, variant: "outline" })}
        href={backHref}
      >
        <IconArrowLeft className="h-4 w-4" />
      </Link>

      <div className="border-border bg-accent-soft text-accent-soft-foreground rounded-stub relative flex h-72 items-center justify-center overflow-hidden border sm:h-96">
        {item.photoUrls[0] ? (
          <Image
            alt={item.title}
            className="object-cover"
            fill
            priority
            sizes="(min-width: 640px) 672px, 100vw"
            src={item.photoUrls[0]}
          />
        ) : (
          <IconPhoto className="h-20 w-20" />
        )}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <Chip color="warning">FREE</Chip>
          <Chip color="default" variant="soft">
            {CONDITION_LABELS[item.condition]}
          </Chip>
        </div>
      </div>

      {item.photoUrls.length > 1 ? (
        <div className="flex gap-3 overflow-x-auto">
          {item.photoUrls.slice(1).map((url) => (
            <div
              className="border-border rounded-stub relative h-20 w-20 shrink-0 overflow-hidden border"
              key={url}
            >
              <Image alt="" className="object-cover" fill sizes="80px" src={url} />
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <p className="font-display text-accent text-xs font-semibold tracking-[0.18em] uppercase">
          {CATEGORY_LABELS[item.category]}
        </p>
        <Typography.Heading level={1}>{item.title}</Typography.Heading>
        <div className="text-muted flex flex-wrap items-center gap-4 text-sm">
          {hasExplicitFrom ? (
            <span className="flex items-center gap-1.5">
              <IconMapPin className="h-4 w-4" />
              {item.distanceKm === 0 ? "At this spot" : `${item.distanceKm} km away`}
            </span>
          ) : null}
          <span className="flex items-center gap-1.5">
            <IconCalendar className="h-4 w-4" />
            Posted {dateFormatter.format(item.createdAt)}
          </span>
        </div>
        {item.description ? (
          <Typography.Paragraph className="mt-2" color="muted">
            {item.description}
          </Typography.Paragraph>
        ) : null}
      </div>

      {mapSpot ? (
        <div className="flex flex-col gap-2">
          <div className="border-border bg-accent-soft text-accent-soft-foreground rounded-stub h-44 overflow-hidden border">
            <PickupMap label={mapSpot.label} lat={mapSpot.lat} lng={mapSpot.lng} />
          </div>
          <a
            className="text-accent self-start text-sm font-semibold hover:underline"
            href={`https://www.google.com/maps/search/?api=1&query=${mapSpot.lat},${mapSpot.lng}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            Open in Google Maps →
          </a>
        </div>
      ) : (
        <div className="border-border bg-accent-soft text-accent-soft-foreground rounded-stub flex h-44 flex-col items-center justify-center gap-2 border">
          <IconMapPin className="h-8 w-8" />
          <p className="text-sm font-medium">{item.pickupSpot}</p>
        </div>
      )}

      {!hasExplicitFrom ? (
        <p className="text-muted text-xs">
          Distances are shown relative to a pickup spot — browse from the home page to see how far
          this is.
        </p>
      ) : null}

      <GiverProfileCard givenCount={givenCount} giver={item.giver} />

      <p className="text-muted flex items-start gap-1.5 text-xs">
        <IconInfoCircle className="mt-0.5 h-4 w-4 shrink-0" />
        Exact addresses are never shown — pickup happens at a shared public spot.
      </p>

      <div className="border-border bg-surface/95 fixed inset-x-0 bottom-0 z-10 border-t px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          {isOwner ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">This is your item</span>
              <Chip color={item.status === "active" ? "success" : "default"}>{item.status}</Chip>
            </div>
          ) : viewerId === null ? (
            <Link className={buttonVariants()} href="/sign-in">
              Sign in to message
            </Link>
          ) : (
            <MessageGiverButton itemId={item.id} />
          )}
        </div>
      </div>
    </PageShell>
  );
}
