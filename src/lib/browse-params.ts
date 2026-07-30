import { z } from "zod";

import { itemCategoryEnum } from "@/db/schema";
import { PICKUP_SPOTS } from "@/lib/pickup-spots";

export const RADIUS_OPTIONS_KM = [1, 2, 5] as const;
const DEFAULT_RADIUS_KM = 2;
const DEFAULT_SPOT_ID = PICKUP_SPOTS[0].id;

const spotIdSchema = z.enum(PICKUP_SPOTS.map((spot) => spot.id) as [string, ...string[]]);
const categorySchema = z.enum(itemCategoryEnum.enumValues).optional();

export type BrowseParams = {
  from: (typeof PICKUP_SPOTS)[number];
  radiusKm: (typeof RADIUS_OPTIONS_KM)[number];
  category?: (typeof itemCategoryEnum.enumValues)[number];
};

export function parseBrowseParams(searchParams: {
  from?: string;
  radius?: string;
  category?: string;
}): BrowseParams {
  const fromResult = spotIdSchema.safeParse(searchParams.from);
  const fromId = fromResult.success ? fromResult.data : DEFAULT_SPOT_ID;
  const from = PICKUP_SPOTS.find((spot) => spot.id === fromId) ?? PICKUP_SPOTS[0];

  const radiusNumber = Number(searchParams.radius);
  const radiusKm = (RADIUS_OPTIONS_KM as readonly number[]).includes(radiusNumber)
    ? (radiusNumber as (typeof RADIUS_OPTIONS_KM)[number])
    : DEFAULT_RADIUS_KM;

  const categoryResult = categorySchema.safeParse(searchParams.category);
  const category = categoryResult.success ? categoryResult.data : undefined;

  return { from, radiusKm, category };
}
