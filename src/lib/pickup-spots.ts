export const PICKUP_SPOTS = [
  { id: "library", label: "UGM Central Library", lng: 110.37816970738615, lat: -7.769180807643926 },
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
  { id: "mmugm-hotel", label: "MM UGM Hotel", lng: 110.38177109347782, lat: -7.775914213905992 },
] as const;

export type PickupSpot = (typeof PICKUP_SPOTS)[number];
export type PickupSpotId = PickupSpot["id"];

export function findPickupSpot(id: string): PickupSpot | undefined {
  return PICKUP_SPOTS.find((spot) => spot.id === id);
}

export function findPickupSpotByLabel(label: string): PickupSpot | undefined {
  return PICKUP_SPOTS.find((spot) => spot.label === label);
}
