// src/components/custom/theme-toggle.tsx
"use client";
import { MoonIcon, SunIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/providers/theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <div
      className="group inline-flex items-center gap-2"
      data-state={isDark ? "checked" : "unchecked"}
    >
      <span
        className="group-data-[state=checked]:text-muted-foreground/70 flex-1 cursor-pointer text-right"
        onClick={() => setTheme("light")}
      >
        <MoonIcon className="h-4 w-4" aria-hidden="true" />
      </span>
      <Switch
        checked={isDark}
        onCheckedChange={toggleTheme}
        aria-label="Toggle between dark and light mode"
      />
      <span
        className="group-data-[state=unchecked]:text-muted-foreground/70 flex-1 cursor-pointer text-left"
        onClick={() => setTheme("dark")}
      >
        <SunIcon className="h-4 w-4" aria-hidden="true" />
      </span>
    </div>
  );
}
