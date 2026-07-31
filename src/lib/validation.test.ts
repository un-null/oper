import { describe, expect, it } from "vitest";

import { displayNameSchema, messageBodySchema, postItemSchema } from "@/lib/validation";

describe("displayNameSchema", () => {
  it("rejects an empty or whitespace-only value after trimming", () => {
    expect(displayNameSchema.safeParse("").success).toBe(false);
    expect(displayNameSchema.safeParse("   ").success).toBe(false);
  });

  it("trims the stored value", () => {
    const result = displayNameSchema.safeParse("  Ann  ");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("Ann");
    }
  });

  it("accepts exactly 50 characters and rejects 51", () => {
    expect(displayNameSchema.safeParse("a".repeat(50)).success).toBe(true);
    expect(displayNameSchema.safeParse("a".repeat(51)).success).toBe(false);
  });

  it("rejects a non-string value (e.g. formData.get returning null)", () => {
    expect(displayNameSchema.safeParse(null).success).toBe(false);
  });
});

describe("messageBodySchema", () => {
  it("rejects an empty or whitespace-only value after trimming", () => {
    expect(messageBodySchema.safeParse("").success).toBe(false);
    expect(messageBodySchema.safeParse("   ").success).toBe(false);
  });

  it("accepts exactly 2000 characters and rejects 2001", () => {
    expect(messageBodySchema.safeParse("a".repeat(2000)).success).toBe(true);
    expect(messageBodySchema.safeParse("a".repeat(2001)).success).toBe(false);
  });
});

describe("postItemSchema", () => {
  const validInput = {
    title: "Sofa",
    description: undefined,
    category: "furniture" as const,
    condition: "good" as const,
    pickupSpotId: "dorm-c",
  };

  it("accepts a minimal valid item", () => {
    expect(postItemSchema.safeParse(validInput).success).toBe(true);
  });

  it("rejects an empty title and accepts/rejects the 80-char boundary", () => {
    expect(postItemSchema.safeParse({ ...validInput, title: "" }).success).toBe(false);
    expect(postItemSchema.safeParse({ ...validInput, title: "a".repeat(80) }).success).toBe(true);
    expect(postItemSchema.safeParse({ ...validInput, title: "a".repeat(81) }).success).toBe(false);
  });

  it("treats an absent description as valid (optional)", () => {
    const result = postItemSchema.safeParse(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBeUndefined();
    }
  });

  it("rejects an invalid category, condition, or pickup spot", () => {
    expect(postItemSchema.safeParse({ ...validInput, category: "vehicles" }).success).toBe(false);
    expect(postItemSchema.safeParse({ ...validInput, condition: "mint" }).success).toBe(false);
    expect(postItemSchema.safeParse({ ...validInput, pickupSpotId: "nowhere" }).success).toBe(
      false,
    );
  });
});
