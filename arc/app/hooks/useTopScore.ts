"use client";

import { useReadContract } from "wagmi";
import type { Address } from "viem";
import {
  GAME_IDS,
  PLAY_ADDRESS,
  isPlayDeployed,
  playAbi,
  type GameKey,
} from "@/config/contracts";
import { PRIMARY_CHAIN } from "@/config/wagmi";

type Best = { game: GameKey; value: bigint };

/**
 * Reads the user's best onchain score for every live game and returns
 * both the per-game breakdown and the single maximum (used as their
 * headline "top score").
 */
export function useTopScore(address: Address | undefined) {
  const tetris = useReadContract({
    address: PLAY_ADDRESS,
    abi: playAbi,
    functionName: "bestScore",
    args: address ? [address, GAME_IDS.tetris] : undefined,
    chainId: PRIMARY_CHAIN.id,
    query: { enabled: Boolean(address) && isPlayDeployed },
  });

  const snake = useReadContract({
    address: PLAY_ADDRESS,
    abi: playAbi,
    functionName: "bestScore",
    args: address ? [address, GAME_IDS.snake] : undefined,
    chainId: PRIMARY_CHAIN.id,
    query: { enabled: Boolean(address) && isPlayDeployed },
  });

  const tetrisBest = (tetris.data as bigint | undefined) ?? 0n;
  const snakeBest = (snake.data as bigint | undefined) ?? 0n;

  const breakdown: Best[] = [
    { game: "tetris", value: tetrisBest },
    { game: "snake", value: snakeBest },
  ];

  const top = breakdown.reduce<Best | null>((acc, b) => {
    if (b.value === 0n) return acc;
    if (!acc || b.value > acc.value) return b;
    return acc;
  }, null);

  return {
    breakdown,
    top,
    isLoading: tetris.isLoading || snake.isLoading,
    refetch: async () => {
      await Promise.all([tetris.refetch(), snake.refetch()]);
    },
    queryKeys: {
      tetris: tetris.queryKey,
      snake: snake.queryKey,
    },
  };
}
