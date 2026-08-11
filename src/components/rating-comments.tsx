import { Avatar, Card } from "@heroui/react";
import { IconStar, IconStarFilled } from "@tabler/icons-react";

import type { RecentRating } from "@/db/dal";
import { dateFormatter } from "@/lib/date-format";
import { initialsFor } from "@/lib/initials";

type RatingCommentsProps = {
  ratings: RecentRating[];
};

const STAR_POSITIONS = [1, 2, 3, 4, 5] as const;

export function RatingComments({ ratings }: RatingCommentsProps) {
  if (ratings.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      {ratings.map((rating) => (
        <Card key={rating.id}>
          <Card.Header>
            <div className="flex items-start gap-3">
              <Avatar size="sm">
                <Avatar.Fallback>{initialsFor(rating.raterDisplayName)}</Avatar.Fallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">{rating.raterDisplayName}</span>
                  <span
                    aria-label={`${rating.stars} out of 5`}
                    className="flex items-center gap-0.5"
                    role="img"
                  >
                    {STAR_POSITIONS.map((position) =>
                      position <= rating.stars ? (
                        <IconStarFilled className="text-warning h-3 w-3" key={position} />
                      ) : (
                        <IconStar className="text-muted h-3 w-3" key={position} />
                      ),
                    )}
                  </span>
                  <span className="text-muted text-xs">
                    {dateFormatter.format(rating.createdAt)}
                  </span>
                </div>
                <p className="text-sm">{rating.comment}</p>
              </div>
            </div>
          </Card.Header>
        </Card>
      ))}
    </div>
  );
}
