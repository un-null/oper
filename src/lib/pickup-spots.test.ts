import { describe, expect, it } from "vitest";

import { findPickupSpot, findPickupSpotByLabel, PICKUP_SPOTS } from "@/lib/pickup-spots";

describe("PICKUP_SPOTS", () => {
  it("has unique ids", () => {
    const ids = PICKUP_SPOTS.map((spot) => spot.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps library as the first entry, the implicit default for browse-params and ItemFilters", () => {
    expect(PICKUP_SPOTS[0].id).toBe("library");
  });

  it("keeps the known coordinates stable, since they feed directly into PostGIS point construction", () => {
    expect(PICKUP_SPOTS).toEqual([
      {
        id: "library",
        label: "UGM Central Library",
        lng: 110.37816970738615,
        lat: -7.769180807643926,
      },
      {
        id: "ft-tower",
        label: "Fakultas Teknik UGM",
        lng: 110.37399949660241,
        lat: -7.765892105804602,
      },
      { id: "wisdom-park", label: "Wisdom Park", lng: 110.38196305808827, lat: -7.770382956638036 },
      {
        id: "karanggayam",
        label: "Karanggayam Residence",
        lng: 110.38663483794512,
        lat: -7.760075885896325,
      },
      {
        id: "ratnaningsih",
        label: "Ratnaningsih Kinanti Residence",
        lng: 110.37802220423234,
        lat: -7.763376699956898,
      },
      {
        id: "mmugm-hotel",
        label: "MM UGM Hotel",
        lng: 110.38177109347782,
        lat: -7.775914213905992,
      },
    ]);
  });

  it("keeps coordinates within the Yogyakarta / UGM area, not the earlier Berlin placeholder", () => {
    for (const spot of PICKUP_SPOTS) {
      expect(spot.lat).toBeLessThan(0);
      expect(spot.lng).toBeGreaterThan(100);
    }
  });
});

describe("findPickupSpot", () => {
  it("finds a spot by exact id", () => {
    expect(findPickupSpot("library")?.label).toBe("UGM Central Library");
    expect(findPickupSpot("ft-tower")?.label).toBe("Fakultas Teknik UGM");
    expect(findPickupSpot("wisdom-park")?.label).toBe("Wisdom Park");
  });

  it("is case-sensitive", () => {
    expect(findPickupSpot("Library")).toBeUndefined();
  });

  it("returns undefined for an unknown or empty id", () => {
    expect(findPickupSpot("")).toBeUndefined();
    expect(findPickupSpot("nonexistent")).toBeUndefined();
  });
});

describe("findPickupSpotByLabel", () => {
  it("finds a spot by exact label", () => {
    expect(findPickupSpotByLabel("UGM Central Library")?.id).toBe("library");
    expect(findPickupSpotByLabel("Fakultas Teknik UGM")?.id).toBe("ft-tower");
    expect(findPickupSpotByLabel("Wisdom Park")?.id).toBe("wisdom-park");
  });

  it("returns undefined for a label that does not match any known spot", () => {
    expect(findPickupSpotByLabel("")).toBeUndefined();
    expect(findPickupSpotByLabel("Somewhere off campus")).toBeUndefined();
  });

  it("is case-sensitive", () => {
    expect(findPickupSpotByLabel("ugm central library")).toBeUndefined();
  });
});
