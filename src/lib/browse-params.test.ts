import { describe, expect, it } from "vitest";

import { parseBrowseParams, RADIUS_OPTIONS_KM } from "@/lib/browse-params";
import { PICKUP_SPOTS } from "@/lib/pickup-spots";

describe("parseBrowseParams", () => {
  it("falls back to the default spot, radius, and no category when params are empty", () => {
    const result = parseBrowseParams({});
    expect(result.from).toEqual(PICKUP_SPOTS[0]);
    expect(result.radiusKm).toBe(2);
    expect(result.category).toBeUndefined();
  });

  it("never throws on an unknown from id, falling back to the default spot", () => {
    expect(() => parseBrowseParams({ from: "nonsense" })).not.toThrow();
    expect(parseBrowseParams({ from: "nonsense" }).from).toEqual(PICKUP_SPOTS[0]);
    expect(parseBrowseParams({ from: "" }).from).toEqual(PICKUP_SPOTS[0]);
  });

  it("resolves a valid from id to its matching spot", () => {
    expect(parseBrowseParams({ from: "faculty" }).from).toEqual(
      PICKUP_SPOTS.find((spot) => spot.id === "faculty"),
    );
  });

  it("only accepts radius values from RADIUS_OPTIONS_KM, defaulting to 2 otherwise", () => {
    for (const radius of RADIUS_OPTIONS_KM) {
      expect(parseBrowseParams({ radius: String(radius) }).radiusKm).toBe(radius);
    }
    expect(parseBrowseParams({ radius: "3" }).radiusKm).toBe(2);
    expect(parseBrowseParams({ radius: "abc" }).radiusKm).toBe(2);
    expect(parseBrowseParams({ radius: "" }).radiusKm).toBe(2);
    expect(parseBrowseParams({}).radiusKm).toBe(2);
  });

  it("accepts a valid category and drops an invalid or mis-cased one", () => {
    expect(parseBrowseParams({ category: "books" }).category).toBe("books");
    expect(parseBrowseParams({ category: "FURNITURE" }).category).toBeUndefined();
    expect(parseBrowseParams({ category: "not-a-category" }).category).toBeUndefined();
  });
});
