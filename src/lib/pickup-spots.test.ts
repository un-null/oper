import { describe, expect, it } from "vitest";

import { findPickupSpot, PICKUP_SPOTS } from "@/lib/pickup-spots";

describe("PICKUP_SPOTS", () => {
  it("has unique ids", () => {
    const ids = PICKUP_SPOTS.map((spot) => spot.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps dorm-c as the first entry, the implicit default for browse-params and ItemFilters", () => {
    expect(PICKUP_SPOTS[0].id).toBe("dorm-c");
  });

  it("keeps the known coordinates stable, since they feed directly into PostGIS point construction", () => {
    expect(PICKUP_SPOTS).toEqual([
      { id: "dorm-c", label: "Dorm lobby — Block C", lng: 13.4105, lat: 52.5225 },
      { id: "faculty", label: "Faculty building entrance", lng: 13.4142, lat: 52.5198 },
      { id: "main-gate", label: "Campus main gate", lng: 13.4079, lat: 52.5173 },
    ]);
  });
});

describe("findPickupSpot", () => {
  it("finds a spot by exact id", () => {
    expect(findPickupSpot("dorm-c")?.label).toBe("Dorm lobby — Block C");
    expect(findPickupSpot("faculty")?.label).toBe("Faculty building entrance");
    expect(findPickupSpot("main-gate")?.label).toBe("Campus main gate");
  });

  it("is case-sensitive", () => {
    expect(findPickupSpot("Dorm-C")).toBeUndefined();
  });

  it("returns undefined for an unknown or empty id", () => {
    expect(findPickupSpot("")).toBeUndefined();
    expect(findPickupSpot("nonexistent")).toBeUndefined();
  });
});