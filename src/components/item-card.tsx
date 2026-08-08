import { Skeleton } from "@heroui/react";
import { IconCalendar, IconMapPin, IconPhoto } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";

import type { ItemCard as ItemCardData } from "@/db/dal";
import { dateFormatter } from "@/lib/date-format";
import { CATEGORY_LABELS, CONDITION_LABELS } from "@/lib/item-labels";

type ItemCardProps = {
  item: ItemCardData;
  distanceKm?: number;
  href?: string;
  priority?: boolean;
};

const shell = "group border-border bg-surface relative flex flex-col rounded-stub border";
const interactive =
  "transition-all hover:border-foreground/30 hover:-translate-y-1 hover:shadow-card-hover";

export function ItemCard({ distanceKm, href, item, priority }: ItemCardProps) {
  const body = (
    <>
      <div className="bg-accent-soft text-accent-soft-foreground rounded-t-stub relative flex aspect-[4/3] items-center justify-center overflow-hidden">
        {item.photoUrl ? (
          <Image
            alt=""
            className="object-cover object-top"
            fill
            priority={priority}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            src={item.photoUrl}
          />
        ) : (
          <IconPhoto className="h-12 w-12" />
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <span className="font-display text-accent text-xs font-semibold tracking-[0.18em] uppercase">
          {CATEGORY_LABELS[item.category]}
        </span>
        <h3 className="font-display mt-2 text-xl leading-tight font-bold tracking-tight">
          {item.title}
        </h3>
        <div className="text-muted mt-3 flex flex-col gap-1.5 text-sm">
          {distanceKm !== undefined ? (
            <span className="flex items-center gap-1.5">
              <IconMapPin className="h-4 w-4 shrink-0" />
              {distanceKm === 0 ? "At this spot" : `${distanceKm} km away`}
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <IconMapPin className="h-4 w-4 shrink-0" />
              {item.pickupSpot}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <IconCalendar className="h-4 w-4 shrink-0" />
            {CONDITION_LABELS[item.condition]} · Posted {dateFormatter.format(item.createdAt)}
          </span>
        </div>
      </div>

      <div className="stub-perf mx-4" />

      <div className="flex items-center justify-between gap-3 p-5 pt-4">
        <span className="text-muted text-sm">
          Pickup only ·{" "}
          <span className="font-display text-warning-soft-foreground text-lg font-bold">FREE</span>
        </span>
        {href ? (
          <span className="text-accent shrink-0 text-sm font-semibold transition-transform group-hover:translate-x-0.5">
            Message giver →
          </span>
        ) : (
          <span className="text-muted shrink-0 text-sm">{item.status}</span>
        )}
      </div>
    </>
  );

  if (!href) {
    return <article className={shell}>{body}</article>;
  }

  return (
    <Link className={`${shell} ${interactive}`} href={href}>
      {body}
    </Link>
  );
}

export function ItemCardSkeleton() {
  return (
    <div aria-hidden className={shell}>
      <Skeleton className="rounded-t-stub aspect-[4/3]" />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <div className="stub-perf mx-4" />
      <div className="flex items-center justify-between gap-3 p-5 pt-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-16" />
      </div>
    </div>
  );
}
