import { Avatar, Card, Chip } from "@heroui/react";
import { IconShieldCheck } from "@tabler/icons-react";

import { RatingStars } from "@/components/rating-stars";
import type { ItemDetail } from "@/db/dal";
import { initialsFor } from "@/lib/initials";

type GiverProfileCardProps = {
  giver: ItemDetail["giver"];
  givenCount: number;
};

export function GiverProfileCard({ giver, givenCount }: GiverProfileCardProps) {
  return (
    <Card>
      <Card.Header>
        <div className="flex items-center gap-3">
          <Avatar>
            <Avatar.Fallback>{initialsFor(giver.displayName)}</Avatar.Fallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <Card.Title>{giver.displayName}</Card.Title>
              {giver.studentVerified ? (
                <Chip color="accent">
                  <IconShieldCheck className="h-3.5 w-3.5" />
                  Verified Student
                </Chip>
              ) : null}
            </div>
            <div className="text-muted flex items-center gap-1.5 text-xs">
              <RatingStars avgRating={giver.avgRating} ratingCount={giver.ratingCount} />
              <span>· {givenCount === 1 ? "1 item given" : `${givenCount} items given`}</span>
            </div>
          </div>
        </div>
      </Card.Header>
    </Card>
  );
}
