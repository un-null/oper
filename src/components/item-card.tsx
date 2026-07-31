import { Card, Chip } from "@heroui/react";
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

export function ItemCard({ item, distanceKm, href }: ItemCardProps) {
  const card = (
    <Card className={href ? "hover:border-accent transition-colors" : undefined}>
      <Card.Header>
        <div className="flex flex-wrap items-center gap-2">
          <Chip color="accent">{CATEGORY_LABELS[item.category]}</Chip>
          <Chip color={item.status === "active" ? "success" : "default"}>{item.status}</Chip>
          {distanceKm !== undefined ? <Chip>{distanceKm} km away</Chip> : null}
        </div>
        <Card.Title>{item.title}</Card.Title>
        {item.description ? <Card.Description>{item.description}</Card.Description> : null}
      </Card.Header>
      <Card.Footer>
        <div className="text-muted flex flex-col gap-1 text-sm">
          <span>{item.pickupSpot}</span>
          <span>
            {CONDITION_LABELS[item.condition]} · Posted {dateFormatter.format(item.createdAt)}
          </span>
        </div>
      </Card.Footer>
    </Card>
  );

  if (!href) {
    return card;
  }

  return (
    <Link className="block" href={href}>
      {card}
    </Link>
  );
}
