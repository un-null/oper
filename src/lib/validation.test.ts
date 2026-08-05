import { describe, expect, it } from "vitest";

import {
  checkItemPhotos,
  displayNameSchema,
  MAX_PHOTO_BYTES,
  MAX_PHOTOS,
  messageBodySchema,
  parsePickupTime,
  pickupProposalSchema,
  postItemSchema,
  ratingSchema,
} from "@/lib/validation";

function makeFile(bytes: number, type: string): File {
  return new File([new Uint8Array(bytes)], "photo", { type });
}

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

describe("pickupProposalSchema", () => {
  const validInput = { date: "2099-01-01", time: "14:30", spot: "Dorm lobby" };

  it("accepts a minimal valid proposal", () => {
    expect(pickupProposalSchema.safeParse(validInput).success).toBe(true);
  });

  it("rejects malformed date or time strings", () => {
    expect(pickupProposalSchema.safeParse({ ...validInput, date: "01/01/2099" }).success).toBe(
      false,
    );
    expect(pickupProposalSchema.safeParse({ ...validInput, time: "2:30pm" }).success).toBe(false);
  });

  it("accepts exactly 120 characters for spot and rejects 121", () => {
    expect(pickupProposalSchema.safeParse({ ...validInput, spot: "a".repeat(120) }).success).toBe(
      true,
    );
    expect(pickupProposalSchema.safeParse({ ...validInput, spot: "a".repeat(121) }).success).toBe(
      false,
    );
  });

  it("rejects an empty or whitespace-only spot", () => {
    expect(pickupProposalSchema.safeParse({ ...validInput, spot: "" }).success).toBe(false);
    expect(pickupProposalSchema.safeParse({ ...validInput, spot: "   " }).success).toBe(false);
  });
});

describe("parsePickupTime", () => {
  it("accepts a time in the future", () => {
    const future = new Date(Date.now() + 86_400_000);
    const date = future.toISOString().slice(0, 10);
    const time = "12:00";
    expect(parsePickupTime(date, time)).toBeInstanceOf(Date);
  });

  it("rejects a time in the past", () => {
    expect(parsePickupTime("2020-01-01", "12:00")).toBeNull();
  });

  it("rejects malformed input", () => {
    expect(parsePickupTime("not-a-date", "12:00")).toBeNull();
  });
});

describe("ratingSchema", () => {
  const validInput = { stars: "5", comment: "Great exchange!" };

  it("accepts a minimal valid rating and coerces stars to a number", () => {
    const result = ratingSchema.safeParse(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(typeof result.data.stars).toBe("number");
      expect(result.data.stars).toBe(5);
    }
  });

  it("accepts the 1 and 5 boundaries and rejects 0 and 6", () => {
    expect(ratingSchema.safeParse({ ...validInput, stars: "1" }).success).toBe(true);
    expect(ratingSchema.safeParse({ ...validInput, stars: "5" }).success).toBe(true);
    expect(ratingSchema.safeParse({ ...validInput, stars: "0" }).success).toBe(false);
    expect(ratingSchema.safeParse({ ...validInput, stars: "6" }).success).toBe(false);
  });

  it("rejects a negative or non-integer or non-numeric stars value", () => {
    expect(ratingSchema.safeParse({ ...validInput, stars: "-1" }).success).toBe(false);
    expect(ratingSchema.safeParse({ ...validInput, stars: "3.5" }).success).toBe(false);
    expect(ratingSchema.safeParse({ ...validInput, stars: "abc" }).success).toBe(false);
    expect(ratingSchema.safeParse({ ...validInput, stars: null }).success).toBe(false);
  });

  it("accepts exactly 500 characters for comment and rejects 501", () => {
    expect(ratingSchema.safeParse({ ...validInput, comment: "a".repeat(500) }).success).toBe(true);
    expect(ratingSchema.safeParse({ ...validInput, comment: "a".repeat(501) }).success).toBe(false);
  });

  it("treats an absent or whitespace-only comment as undefined", () => {
    const withoutComment = ratingSchema.safeParse({ stars: "5" });
    expect(withoutComment.success).toBe(true);
    if (withoutComment.success) {
      expect(withoutComment.data.comment).toBeUndefined();
    }

    const whitespaceComment = ratingSchema.safeParse({ ...validInput, comment: "   " });
    expect(whitespaceComment.success).toBe(true);
    if (whitespaceComment.success) {
      expect(whitespaceComment.data.comment).toBeUndefined();
    }
  });
});

describe("checkItemPhotos", () => {
  it("treats an absent input as no photo", () => {
    expect(checkItemPhotos([])).toEqual({ kind: "none" });
    expect(checkItemPhotos([""])).toEqual({ kind: "none" });
  });

  it("treats an empty (untouched) file input as no photo", () => {
    expect(checkItemPhotos([makeFile(0, "application/octet-stream")])).toEqual({ kind: "none" });
  });

  it("accepts jpeg, png, and webp", () => {
    for (const type of ["image/jpeg", "image/png", "image/webp"]) {
      const result = checkItemPhotos([makeFile(100, type)]);
      expect(result.kind).toBe("ok");
    }
  });

  it("rejects an unsupported type, including svg", () => {
    expect(checkItemPhotos([makeFile(100, "image/gif")]).kind).toBe("error");
    expect(checkItemPhotos([makeFile(100, "image/svg+xml")]).kind).toBe("error");
  });

  it("accepts exactly MAX_PHOTO_BYTES and rejects one byte over", () => {
    expect(checkItemPhotos([makeFile(MAX_PHOTO_BYTES, "image/jpeg")]).kind).toBe("ok");
    expect(checkItemPhotos([makeFile(MAX_PHOTO_BYTES + 1, "image/jpeg")]).kind).toBe("error");
  });

  it("accepts exactly MAX_PHOTOS files and rejects one more", () => {
    const files = Array.from({ length: MAX_PHOTOS }, () => makeFile(100, "image/jpeg"));
    expect(checkItemPhotos(files).kind).toBe("ok");
    expect(checkItemPhotos([...files, makeFile(100, "image/jpeg")]).kind).toBe("error");
  });
});

describe("postItemSchema", () => {
  const validInput = {
    title: "Sofa",
    description: undefined,
    category: "furniture" as const,
    condition: "good" as const,
    pickupSpotId: "library",
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
