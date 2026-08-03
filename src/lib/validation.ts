import { z } from "zod";

import { itemCategoryEnum, itemConditionEnum } from "@/db/schema";
import { PICKUP_SPOTS } from "@/lib/pickup-spots";

export const displayNameSchema = z
  .string()
  .trim()
  .min(1, "Enter a display name.")
  .max(50, "Keep it to 50 characters or fewer.");

export const messageBodySchema = z
  .string()
  .trim()
  .min(1, "Write a message.")
  .max(2000, "Keep it to 2000 characters or fewer.");

export const pickupProposalSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date."),
  time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Choose a time."),
  spot: z
    .string()
    .trim()
    .min(1, "Enter a pickup spot.")
    .max(120, "Keep it to 120 characters or fewer."),
});

export function parsePickupTime(date: string, time: string): Date | null {
  const isoCandidate = `${date}T${time.length === 5 ? `${time}:00` : time}`;
  const parsed = new Date(isoCandidate);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  if (parsed.getTime() <= Date.now()) {
    return null;
  }
  return parsed;
}

export const postItemSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Enter a title.")
    .max(80, "Keep the title to 80 characters or fewer."),
  description: z
    .string()
    .trim()
    .max(1000, "Keep the description to 1000 characters or fewer.")
    .optional(),
  category: z.enum(itemCategoryEnum.enumValues, { message: "Choose a category." }),
  condition: z.enum(itemConditionEnum.enumValues, { message: "Choose a condition." }),
  pickupSpotId: z.enum(PICKUP_SPOTS.map((spot) => spot.id) as [string, ...string[]], {
    message: "Choose a pickup spot.",
  }),
});

export const ratingSchema = z.object({
  stars: z.coerce.number().int().min(1, "Choose a rating.").max(5, "Choose a rating."),
  comment: z
    .string()
    .trim()
    .max(500, "Keep it to 500 characters or fewer.")
    .optional()
    .transform((value) => (value ? value : undefined)),
});
