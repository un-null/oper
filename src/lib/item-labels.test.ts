import { describe, expect, it } from "vitest";

import { itemCategoryEnum, itemConditionEnum } from "@/db/schema";
import { CATEGORY_LABELS, CONDITION_LABELS } from "@/lib/item-labels";

describe("CATEGORY_LABELS", () => {
  it("has a label for every category enum value", () => {
    for (const value of itemCategoryEnum.enumValues) {
      expect(CATEGORY_LABELS[value]).toBeTypeOf("string");
      expect(CATEGORY_LABELS[value].length).toBeGreaterThan(0);
    }
  });
});

describe("CONDITION_LABELS", () => {
  it("has a label for every condition enum value", () => {
    for (const value of itemConditionEnum.enumValues) {
      expect(CONDITION_LABELS[value]).toBeTypeOf("string");
      expect(CONDITION_LABELS[value].length).toBeGreaterThan(0);
    }
  });
});
