"use client";

import { Button, ToggleButton, ToggleButtonGroup } from "@heroui/react";
import { IconDeviceLaptop, IconMoon, IconSun } from "@tabler/icons-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const THEME_OPTIONS = [
  { icon: IconSun, id: "light", label: "Light" },
  { icon: IconMoon, id: "dark", label: "Dark" },
  { icon: IconDeviceLaptop, id: "system", label: "System" },
] as const;

export function ThemeToggleButton() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div aria-hidden className="size-9" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      isIconOnly
      onPress={() => setTheme(isDark ? "light" : "dark")}
      variant="ghost"
    >
      {isDark ? <IconSun size={18} /> : <IconMoon size={18} />}
    </Button>
  );
}

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div aria-hidden className="h-10 w-full" />;
  }

  return (
    <ToggleButtonGroup
      aria-label="Theme"
      onSelectionChange={(keys) => {
        const [next] = keys;
        if (typeof next === "string") setTheme(next);
      }}
      selectedKeys={[theme ?? "system"]}
      selectionMode="single"
    >
      {THEME_OPTIONS.map(({ icon: Icon, id, label }) => (
        <ToggleButton id={id} key={id}>
          <Icon className="h-4 w-4" />
          {label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
