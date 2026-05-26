"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="h-10 w-10 rounded-full border border-[color:var(--border)] bg-[color:var(--bg-elev)] text-[color:var(--fg)] hover:bg-[color:var(--bg-muted)] transition-colors flex items-center justify-center"
    >
      {/* Render an empty span until mounted to avoid hydration mismatch */}
      <span aria-hidden="true" className="text-base leading-none">
        {!mounted ? "" : isDark ? "☀" : "☾"}
      </span>
    </button>
  );
}
