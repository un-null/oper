import { IconCalendar, IconMapPin, IconPhoto } from "@tabler/icons-react";
import Link from "next/link";

import type { items } from "@/db/schema";
import { CATEGORY_LABELS, CONDITION_LABELS } from "@/lib/item-labels";

type ItemCardProps = {
  item: Omit<typeof items.$inferSelect, "location">;
  distanceKm?: number;
  href?: string;
};

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const shell = "group border-border bg-surface relative flex flex-col rounded-stub border";
const interactive =
  "transition-all hover:border-foreground/30 hover:-translate-y-1 hover:shadow-card-hover";

export function ItemCard({ distanceKm, href, item }: ItemCardProps) {
  const body = (
    <>
      <div className="bg-accent-soft text-accent-soft-foreground rounded-t-stub flex h-36 items-center justify-center">
        <IconPhoto className="h-12 w-12" />
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
          Pickup only · <span className="font-display text-warning text-lg font-bold">FREE</span>
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
