import type { itemCategoryEnum, itemConditionEnum } from "@/db/schema";

export const CATEGORY_LABELS: Record<(typeof itemCategoryEnum.enumValues)[number], string> = {
  furniture: "Furniture",
  electronics: "Electronics",
  books: "Books",
  baby: "Baby items",
  clothing: "Clothing",
};

export const CONDITION_LABELS: Record<(typeof itemConditionEnum.enumValues)[number], string> = {
  new: "New",
  good: "Good",
  fair: "Fair",
};
