import { IconStar, IconStarFilled } from "@tabler/icons-react";

type RatingStarsProps = {
  avgRating: number | null;
  ratingCount: number;
};

export function RatingStars({ avgRating, ratingCount }: RatingStarsProps) {
  if (avgRating === null || ratingCount === 0) {
    return <span className="text-muted text-xs">No ratings yet</span>;
  }

  const filled = Math.round(avgRating);

  return (
    <span
      aria-label={`${avgRating.toFixed(1)} out of 5`}
      className="flex items-center gap-1.5 text-xs"
      role="img"
    >
      <span aria-hidden="true" className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, index) =>
          index < filled ? (
            <IconStarFilled className="text-warning h-3.5 w-3.5" key={index} />
          ) : (
            <IconStar className="text-muted h-3.5 w-3.5" key={index} />
          ),
        )}
      </span>
      <span className="text-muted">
        {avgRating.toFixed(1)} · {ratingCount} {ratingCount === 1 ? "rating" : "ratings"}
      </span>
    </span>
  );
}
