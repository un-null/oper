export const PICKUP_SPOTS = [
  { id: "dorm-c", label: "Dorm lobby — Block C", lng: 13.4105, lat: 52.5225 },
  { id: "faculty", label: "Faculty building entrance", lng: 13.4142, lat: 52.5198 },
  { id: "main-gate", label: "Campus main gate", lng: 13.4079, lat: 52.5173 },
] as const;

export type PickupSpot = (typeof PICKUP_SPOTS)[number];
export type PickupSpotId = PickupSpot["id"];

export function findPickupSpot(id: string): PickupSpot | undefined {
  return PICKUP_SPOTS.find((spot) => spot.id === id);
}

export function findPickupSpotByLabel(label: string): PickupSpot | undefined {
  return PICKUP_SPOTS.find((spot) => spot.label === label);
}
