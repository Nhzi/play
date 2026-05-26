"use client";

import { useReadContract } from "wagmi";
import type { Address, Hex } from "viem";
import { PLAY_ADDRESS, isPlayDeployed, playAbi } from "@/config/contracts";
import { PRIMARY_CHAIN } from "@/config/wagmi";

export type OnchainProfile = {
  displayName: string;
  bio: string;
  avatarSeed: Hex;
  registeredAt: bigint;
  exists: boolean;
};

export function useProfile(address: Address | undefined) {
  const query = useReadContract({
    address: PLAY_ADDRESS,
    abi: playAbi,
    functionName: "profiles",
    args: address ? [address] : undefined,
    chainId: PRIMARY_CHAIN.id,
    query: { enabled: Boolean(address) && isPlayDeployed },
  });

  const tuple = query.data as
    | readonly [string, string, Hex, bigint, boolean]
    | undefined;

  const profile: OnchainProfile | null = tuple
    ? {
        displayName: tuple[0],
        bio: tuple[1],
        avatarSeed: tuple[2],
        registeredAt: tuple[3],
        exists: tuple[4],
      }
    : null;

  return {
    profile,
    isRegistered: Boolean(profile?.exists),
    isLoading: query.isLoading,
    refetch: query.refetch,
    queryKey: query.queryKey,
  };
}

const EMOJI_PALETTE = [
  "🎮", "👾", "🕹️", "🍄", "⚡", "🔥",
  "🌈", "🪐", "🌌", "🚀", "🎯", "🏆",
  "🐍", "🦊", "🐙", "🦄", "🐲", "🦅",
];

export function emojiToSeed(emoji: string): Hex {
  // Pack codepoints into a bytes32 — leftmost bytes hold the codepoint big-endian.
  const cp = emoji.codePointAt(0) ?? 0x1f3ae;
  const hex = cp.toString(16).padStart(8, "0");
  return `0x${hex.padEnd(64, "0")}` as Hex;
}

export function seedToEmoji(seed: Hex): string {
  if (!seed || seed.length < 10) return "🎮";
  const cp = parseInt(seed.slice(2, 10), 16);
  if (!cp) return "🎮";
  try {
    return String.fromCodePoint(cp);
  } catch {
    return "🎮";
  }
}

export const AVATAR_PALETTE = EMOJI_PALETTE;
