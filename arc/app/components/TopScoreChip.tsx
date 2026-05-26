"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { useSiwbSession } from "@/hooks/useSiwbSession";
import { useTopScore } from "@/hooks/useTopScore";
import { RankBadge } from "@/components/RankBadge";

/**
 * Compact chip showing the user's onchain top score and rank.
 * Renders only when a wallet is connected AND a signed-in session exists.
 */
export function TopScoreChip() {
  const { address, isConnected } = useAccount();
  const { session } = useSiwbSession(address);
  const { top, isLoading } = useTopScore(address);

  if (!isConnected || !session) return null;
  if (isLoading) return null;
  if (!top) {
    return (
      <Link
        href="/profile"
        className="hidden md:inline-flex items-center gap-1.5 h-10 px-3 rounded-full border border-dashed border-[color:var(--border)] text-[11px] text-[color:var(--fg-muted)] hover:bg-[color:var(--bg-muted)] transition"
        title="No top score yet — play a game!"
      >
        <span>😴</span>
        <span className="font-mono">—</span>
        <span className="text-[10px] uppercase tracking-wider">Noob</span>
      </Link>
    );
  }
  return (
    <Link
      href="/profile"
      className="hidden md:inline-flex items-center h-10 px-3 rounded-full bg-[color:var(--bg-muted)] border border-[color:var(--border)] text-xs hover:bg-[color:var(--border)] transition"
      title={`Best score, onchain`}
    >
      <RankBadge game={top.game} score={top.value} variant="compact" />
    </Link>
  );
}
