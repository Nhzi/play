export type Difficulty = "easy" | "medium" | "hard";
export type GridSizeKey = "small" | "medium" | "large";
export type Theme = "colorful" | "classic";

export type Vec = { x: number; y: number };

export type Direction = "up" | "down" | "left" | "right";

export const DIR_VEC: Record<Direction, Vec> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export const OPPOSITE: Record<Direction, Direction> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

export const GRID_SIZES: Record<GridSizeKey, number> = {
  small: 12,
  medium: 16,
  large: 22,
};

export const GRID_LABELS: Record<GridSizeKey, string> = {
  small: "Small (12)",
  medium: "Medium (16)",
  large: "Large (22)",
};

/** Base tick interval (ms) per difficulty before speedup. */
export const TICK_MS: Record<Difficulty, number> = {
  easy: 160,
  medium: 110,
  hard: 70,
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

/**
 * Speed-up curve: each multiple of FOODS_PER_SPEEDUP shaves SPEEDUP_MS off the
 * tick interval, down to MIN_TICK_MS.
 */
export const FOODS_PER_SPEEDUP = 5;
export const SPEEDUP_MS = 6;
export const MIN_TICK_MS = 45;
