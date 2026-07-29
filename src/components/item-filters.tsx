"use client";

import { Label, ToggleButton, ToggleButtonGroup } from "@heroui/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { itemCategoryEnum } from "@/db/schema";
import { CATEGORY_LABELS } from "@/lib/item-labels";
import { PICKUP_SPOTS } from "@/lib/pickup-spots";
import { RADIUS_OPTIONS_KM } from "@/lib/browse-params";

export function ItemFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    next.set(key, value);
    router.push(`${pathname}?${next.toString()}`);
  }

  function clearParam(key: string) {
    const next = new URLSearchParams(searchParams.toString());
    next.delete(key);
    router.push(`${pathname}?${next.toString()}`);
  }

  const currentFrom = searchParams.get("from") ?? PICKUP_SPOTS[0].id;
  const currentRadius = searchParams.get("radius") ?? String(RADIUS_OPTIONS_KM[1]);
  const currentCategory = searchParams.get("category");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label>Near</Label>
        <ToggleButtonGroup
          onSelectionChange={(keys) => {
            const [id] = keys;
            if (typeof id === "string") setParam("from", id);
          }}
          selectedKeys={[currentFrom]}
          selectionMode="single"
        >
          {PICKUP_SPOTS.map((spot) => (
            <ToggleButton id={spot.id} key={spot.id}>
              {spot.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Radius</Label>
        <ToggleButtonGroup
          onSelectionChange={(keys) => {
            const [radius] = keys;
            if (typeof radius === "string") setParam("radius", radius);
          }}
          selectedKeys={[currentRadius]}
          selectionMode="single"
        >
          {RADIUS_OPTIONS_KM.map((km) => (
            <ToggleButton id={String(km)} key={km}>
              {km} km
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Category</Label>
        <ToggleButtonGroup
          onSelectionChange={(keys) => {
            const [category] = keys;
            if (typeof category === "string") {
              setParam("category", category);
            } else {
              clearParam("category");
            }
          }}
          selectedKeys={currentCategory ? [currentCategory] : []}
          selectionMode="single"
        >
          {itemCategoryEnum.enumValues.map((value) => (
            <ToggleButton id={value} key={value}>
              {CATEGORY_LABELS[value]}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </div>
    </div>
  );
}
