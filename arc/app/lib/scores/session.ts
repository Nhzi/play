import type { Address } from "viem";
import type { GameKey } from "@/config/contracts";

const PREFIX = "play:best:";

function key(address: Address, game: GameKey) {
  return `${PREFIX}${address.toLowerCase()}:${game}`;
}

/** Record a finished-game score; keeps the per-game max for this address. */
export function recordSessionScore(
  address: Address | undefined,
  game: GameKey,
  score: number,
) {
  if (!address || typeof window === "undefined") return;
  if (!Number.isFinite(score) || score <= 0) return;
  try {
    const prev = Number(window.localStorage.getItem(key(address, game)) ?? "0");
    if (score > prev) {
      window.localStorage.setItem(key(address, game), String(score));
    }
  } catch {
    /* ignore quota / privacy errors */
  }
}

export function readSessionBest(
  address: Address | undefined,
  game: GameKey,
): number {
  if (!address || typeof window === "undefined") return 0;
  try {
    return Number(window.localStorage.getItem(key(address, game)) ?? "0") || 0;
  } catch {
    return 0;
  }
}

export function clearSessionBests(address: Address | undefined) {
  if (!address || typeof window === "undefined") return;
  try {
    const prefix = `${PREFIX}${address.toLowerCase()}:`;
    const toRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(prefix)) toRemove.push(k);
    }
    toRemove.forEach((k) => window.localStorage.removeItem(k));
  } catch {
    /* noop */
  }
}
