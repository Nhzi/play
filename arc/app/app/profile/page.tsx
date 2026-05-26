"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAccount, useReadContract, usePublicClient } from "wagmi";
import { Header } from "@/components/Header";
import { ConnectWallet } from "@/components/ConnectWallet";
import { useSiwbSession } from "@/hooks/useSiwbSession";
import { useProfile, seedToEmoji } from "@/hooks/useProfile";
import { RankBadge } from "@/components/RankBadge";
import {
  GAME_IDS,
  GAME_LABELS,
  PLAY_ADDRESS,
  isPlayDeployed,
  playAbi,
  type GameKey,
} from "@/config/contracts";
import { PRIMARY_CHAIN, EXPLORER_TX } from "@/config/wagmi";
import { parseAbiItem, type Hex } from "viem";

type MintedRow = {
  id: bigint;
  score: bigint;
  gameId: Hex;
  timestamp: bigint;
  txHash: Hex;
  blockNumber: bigint;
};

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const { session } = useSiwbSession(address);
  const { profile, isRegistered } = useProfile(address);

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
          <Link
            href="/"
            className="text-xs text-[color:var(--fg-muted)] hover:text-[color:var(--fg)]"
          >
            ← Home
          </Link>
          <h1 className="text-3xl font-bold tracking-tight mt-1 mb-6">
            Your Profile
          </h1>

          {!isPlayDeployed && (
            <Notice>
              The Play contract isn&apos;t deployed yet. Set{" "}
              <code className="font-mono">NEXT_PUBLIC_PLAY_ADDRESS</code> after
              deploying to Arc Testnet.
            </Notice>
          )}

          {!isConnected ? (
            <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-elev)] p-6 flex flex-col items-start gap-3">
              <p className="text-[color:var(--fg-muted)]">
                Connect a wallet to see your profile and minted scores.
              </p>
              <ConnectWallet />
            </div>
          ) : !session || !isRegistered ? (
            <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-elev)] p-6">
              <p className="text-[color:var(--fg-muted)]">
                Finish the sign-in flow to view your profile. (Check for an
                open modal.)
              </p>
            </div>
          ) : (
            <ProfileBody />
          )}

          {isRegistered && profile && (
            <div className="mt-6 rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-elev)] p-5 flex items-center gap-4">
              <div className="text-3xl">{seedToEmoji(profile.avatarSeed)}</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[color:var(--fg)] truncate">
                  {profile.displayName}
                </div>
                {profile.bio && (
                  <div className="text-sm text-[color:var(--fg-muted)] mt-0.5 break-words">
                    {profile.bio}
                  </div>
                )}
                <div className="text-[11px] text-[color:var(--fg-muted)] mt-1">
                  Registered{" "}
                  {new Date(Number(profile.registeredAt) * 1000).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function ProfileBody() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [rows, setRows] = useState<MintedRow[] | null>(null);
  const [logsError, setLogsError] = useState<string | null>(null);

  const tetrisBest = useReadContract({
    address: PLAY_ADDRESS,
    abi: playAbi,
    functionName: "bestScore",
    args: address ? [address, GAME_IDS.tetris] : undefined,
    chainId: PRIMARY_CHAIN.id,
    query: { enabled: Boolean(address) && isPlayDeployed },
  });

  const snakeBest = useReadContract({
    address: PLAY_ADDRESS,
    abi: playAbi,
    functionName: "bestScore",
    args: address ? [address, GAME_IDS.snake] : undefined,
    chainId: PRIMARY_CHAIN.id,
    query: { enabled: Boolean(address) && isPlayDeployed },
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!publicClient || !address || !isPlayDeployed) return;
      try {
        const event = parseAbiItem(
          "event ScoreMinted(uint256 indexed id, address indexed player, bytes32 indexed gameId, uint256 score, uint64 timestamp)",
        );
        const logs = await publicClient.getLogs({
          address: PLAY_ADDRESS,
          event,
          args: { player: address },
          fromBlock: "earliest",
          toBlock: "latest",
        });
        if (cancelled) return;
        setRows(
          logs
            .map((l) => ({
              id: l.args.id!,
              score: l.args.score!,
              gameId: l.args.gameId!,
              timestamp: BigInt(l.args.timestamp ?? 0n),
              txHash: l.transactionHash!,
              blockNumber: l.blockNumber!,
            }))
            .reverse(),
        );
      } catch (err) {
        if (cancelled) return;
        setLogsError(err instanceof Error ? err.message : "Failed to load history.");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [publicClient, address]);

  return (
    <div className="grid gap-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <RankBadge game="tetris" score={tetrisBest.data ?? 0n} />
        <RankBadge game="snake" score={snakeBest.data ?? 0n} />
      </div>

      <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-elev)] p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[11px] uppercase tracking-widest text-[color:var(--fg-muted)]">
            Minted runs
          </div>
          <span className="text-xs text-[color:var(--fg-muted)] font-mono">
            {rows ? rows.length : "…"}
          </span>
        </div>
        {logsError && (
          <p className="text-xs text-[color:var(--accent-1)]">{logsError}</p>
        )}
        {rows && rows.length === 0 && (
          <p className="text-sm text-[color:var(--fg-muted)]">
            Nothing minted yet — play a game and mint your first run.
          </p>
        )}
        {rows && rows.length > 0 && (
          <ul className="divide-y divide-[color:var(--border)]">
            {rows.map((r) => (
              <li
                key={r.id.toString()}
                className="py-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="font-mono text-sm">
                    #{r.id.toString()} ·{" "}
                    <span className="text-accent-gradient font-semibold">
                      {r.score.toString()}
                    </span>
                  </div>
                  <div className="text-[11px] text-[color:var(--fg-muted)]">
                    {gameLabelFor(r.gameId)} ·{" "}
                    {new Date(Number(r.timestamp) * 1000).toLocaleString()}
                  </div>
                </div>
                <a
                  href={EXPLORER_TX(r.txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] underline text-[color:var(--fg-muted)] hover:text-[color:var(--fg)] shrink-0"
                >
                  tx
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function gameLabelFor(gameId: Hex): string {
  for (const [key, id] of Object.entries(GAME_IDS) as [GameKey, Hex][]) {
    if (id === gameId) return GAME_LABELS[key];
  }
  return `0x${gameId.slice(2, 10)}…`;
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 rounded-xl border border-dashed border-[color:var(--border)] bg-[color:var(--bg-muted)] p-3 text-xs text-[color:var(--fg-muted)]">
      {children}
    </div>
  );
}
