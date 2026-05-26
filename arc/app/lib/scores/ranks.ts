import type { GameKey } from "@/config/contracts";

export type Tier = {
  /** Lower bound (inclusive) of the score range. */
  min: number;
  name: string;
  emoji: string;
  taunt: string;
};

/** Tetris and Snake have very different score scales, so tiers are per-game. */
const TIERS: Record<GameKey, Tier[]> = {
  snake: [
    { min: 0,    name: "Noob",    emoji: "😴", taunt: "Everyone starts here. No shame in being food." },
    { min: 50,   name: "Rookie",  emoji: "🐣", taunt: "You found the apple. Now don't eat yourself." },
    { min: 150,  name: "Sprout",  emoji: "🌱", taunt: "Hatched. Barely." },
    { min: 300,  name: "Player",  emoji: "🎮", taunt: "Acceptable. Coach says \"more.\"" },
    { min: 500,  name: "Pro",     emoji: "🔥", taunt: "Snake fears you now." },
    { min: 800,  name: "Master",  emoji: "👑", taunt: "The grid is yours." },
    { min: 1200, name: "Legend",  emoji: "🚀", taunt: "Your snake has a fan club." },
    { min: 2000, name: "God-Tier", emoji: "⚡", taunt: "Touched by the silicon. Bow." },
  ],
  tetris: [
    { min: 0,      name: "Noob",    emoji: "😴", taunt: "Bricks are not your friends. Yet." },
    { min: 500,    name: "Rookie",  emoji: "🐣", taunt: "You cleared a line. Cool." },
    { min: 2500,   name: "Sprout",  emoji: "🌱", taunt: "Stacking like you mean it. Almost." },
    { min: 7500,   name: "Player",  emoji: "🎮", taunt: "Respectable. Now go for the T-spin." },
    { min: 20000,  name: "Pro",     emoji: "🔥", taunt: "Your I-pieces have arrived on time." },
    { min: 50000,  name: "Master",  emoji: "👑", taunt: "Tetrises for breakfast." },
    { min: 100000, name: "Legend",  emoji: "🚀", taunt: "The well, the legend." },
    { min: 250000, name: "God-Tier", emoji: "⚡", taunt: "Stacker of dimensions. We're not worthy." },
  ],
};

export type RankInfo = {
  tier: Tier;
  next: Tier | null;
  /** 0..1 progress through current tier toward the next. */
  progress: number;
  score: number;
  game: GameKey;
};

export function rankFor(game: GameKey, score: number | bigint): RankInfo {
  const s = typeof score === "bigint" ? Number(score) : score;
  const tiers = TIERS[game];
  let i = 0;
  for (let j = 0; j < tiers.length; j++) {
    if (s >= tiers[j].min) i = j;
    else break;
  }
  const tier = tiers[i];
  const next = i + 1 < tiers.length ? tiers[i + 1] : null;
  const progress = next
    ? Math.max(0, Math.min(1, (s - tier.min) / (next.min - tier.min)))
    : 1;
  return { tier, next, progress, score: s, game };
}
