"use client";

import dynamic from "next/dynamic";

import type { PickupMapInnerProps } from "@/components/pickup-map-inner";

const PickupMapInner = dynamic(() => import("@/components/pickup-map-inner"), { ssr: false });

export function PickupMap(props: PickupMapInnerProps) {
  return <PickupMapInner {...props} />;
}
