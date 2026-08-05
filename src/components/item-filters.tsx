"use client";

import { Label, ListBox, Select, ToggleButton, ToggleButtonGroup } from "@heroui/react";
import { IconMapPin } from "@tabler/icons-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { itemCategoryEnum } from "@/db/schema";
import { RADIUS_OPTIONS_KM } from "@/lib/browse-params";
import { CATEGORY_LABELS } from "@/lib/item-labels";
import { PICKUP_SPOTS } from "@/lib/pickup-spots";

const ALL_CATEGORIES = "all";

export function ItemFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    next.set(key, value);
    startTransition(() => router.push(`${pathname}?${next.toString()}`));
  }

  function clearParam(key: string) {
    const next = new URLSearchParams(searchParams.toString());
    next.delete(key);
    startTransition(() => router.push(`${pathname}?${next.toString()}`));
  }

  const currentFrom = searchParams.get("from") ?? PICKUP_SPOTS[0].id;
  const currentRadius = searchParams.get("radius") ?? String(RADIUS_OPTIONS_KM[1]);
  const currentCategory = searchParams.get("category") ?? ALL_CATEGORIES;

  return (
    <div
      className={`flex flex-col gap-3 transition-opacity ${isPending ? "opacity-60" : "opacity-100"}`}
    >
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <Select
          className="w-full sm:max-w-xs"
          isDisabled={isPending}
          onChange={(value) => {
            if (typeof value === "string") setParam("from", value);
          }}
          value={currentFrom}
        >
          <Label className="font-display text-muted text-xs font-semibold tracking-[0.18em] uppercase">
            Near
          </Label>
          <Select.Trigger className="items-center gap-2">
            <IconMapPin className="text-muted h-4 w-4 shrink-0" />
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {PICKUP_SPOTS.map((spot) => (
                <ListBox.Item id={spot.id} key={spot.id} textValue={spot.label}>
                  {spot.label}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>

        <div className="flex flex-col gap-1.5">
          <Label className="font-display text-muted text-xs font-semibold tracking-[0.18em] uppercase sm:text-right">
            Radius
          </Label>
          <ToggleButtonGroup
            isDisabled={isPending}
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
      </div>

      <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
        <div
          className="mask-[linear-gradient(to_right,black_calc(100%-24px),transparent)] flex gap-5 overflow-x-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
          style={{ scrollSnapType: "x proximity" }}
        >
          <CategoryTab
            isActive={currentCategory === ALL_CATEGORIES}
            isDisabled={isPending}
            label="All"
            onPress={() => clearParam("category")}
          />
          {itemCategoryEnum.enumValues.map((value) => (
            <CategoryTab
              isActive={currentCategory === value}
              isDisabled={isPending}
              key={value}
              label={CATEGORY_LABELS[value]}
              onPress={() => setParam("category", value)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

type CategoryTabProps = {
  label: string;
  isActive: boolean;
  isDisabled: boolean;
  onPress: () => void;
};

function CategoryTab({ label, isActive, isDisabled, onPress }: CategoryTabProps) {
  return (
    <button
      className={`shrink-0 border-b-2 pb-2 text-sm font-medium whitespace-nowrap transition-colors ${
        isActive
          ? "border-accent text-accent"
          : "text-muted hover:text-foreground border-transparent"
      }`}
      disabled={isDisabled}
      onClick={onPress}
      style={{ scrollSnapAlign: "start" }}
      type="button"
    >
      {label}
    </button>
  );
}
