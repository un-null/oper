"use client";

import "leaflet/dist/leaflet.css";

import { divIcon } from "leaflet";
import { useTheme } from "next-themes";
import { MapContainer, Marker, TileLayer, Tooltip } from "react-leaflet";

const TILE_URL_LIGHT =
  process.env.NEXT_PUBLIC_TILE_URL_LIGHT ??
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const TILE_URL_DARK =
  process.env.NEXT_PUBLIC_TILE_URL_DARK ??
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

const pinIcon = divIcon({
  className: "",
  html: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C7.58 2 4 5.58 4 10c0 5.25 6.9 11.24 7.19 11.49a1.2 1.2 0 0 0 1.62 0C13.1 21.24 20 15.25 20 10c0-4.42-3.58-8-8-8z" fill="var(--accent)" stroke="var(--accent-foreground)" stroke-width="1"/>
    <circle cx="12" cy="10" r="3" fill="var(--accent-foreground)"/>
  </svg>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

export type PickupMapInnerProps = {
  lng: number;
  lat: number;
  label: string;
};

export default function PickupMapInner({ lng, lat, label }: PickupMapInnerProps) {
  const { resolvedTheme } = useTheme();
  const tileUrl = resolvedTheme === "dark" ? TILE_URL_DARK : TILE_URL_LIGHT;

  return (
    <MapContainer
      center={[lat, lng]}
      className="h-full w-full"
      scrollWheelZoom={false}
      zoom={16}
    >
      <TileLayer attribution={ATTRIBUTION} url={tileUrl} />
      <Marker icon={pinIcon} position={[lat, lng]}>
        <Tooltip direction="top" offset={[0, -28]} permanent>
          {label}
        </Tooltip>
      </Marker>
    </MapContainer>
  );
}
