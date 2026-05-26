"use client";

import { useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { readContractQueryOptions } from "wagmi/query";
import { useQueryClient } from "@tanstack/react-query";
import {
  GAME_IDS,
  PLAY_ADDRESS,
  isPlayDeployed,
  playAbi,
  type GameKey,
} from "@/config/contracts";
import { config, PRIMARY_CHAIN, EXPLORER_TX } from "@/config/wagmi";
import { useSiwbSession } from "@/hooks/useSiwbSession";
import { useProfile } from "@/hooks/useProfile";
import { useAutoSwitchChain } from "@/hooks/useAutoSwitchChain";
import { SignInWithBase } from "@/components/SignInWithBase";

type Props = {
  score: number;
  game: GameKey;
};

export function MintScoreButton({ score, game }: Props) {
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();
  const { session } = useSiwbSession(address);
  const { isRegistered, isLoading: profileLoading } = useProfile(address);
  const {
    ready: chainReady,
    isSwitching,
    needsManual,
    trigger: triggerSwitch,
  } = useAutoSwitchChain({
    enabled: isPlayDeployed && Boolean(session) && isRegistered,
  });

  const { data: hash, isPending, writeContract, error: writeError } =
    useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const bestScoreQuery = useReadContract({
    address: PLAY_ADDRESS,
    abi: playAbi,
    functionName: "bestScore",
    args: address ? [address, GAME_IDS[game]] : undefined,
    chainId: PRIMARY_CHAIN.id,
    query: { enabled: Boolean(address) && isPlayDeployed },
  });

  useEffect(() => {
    if (!isSuccess || !address) return;
    queryClient.invalidateQueries({
      queryKey: readContractQueryOptions(config, {
        address: PLAY_ADDRESS,
        abi: playAbi,
        functionName: "bestScore",
        args: [address, GAME_IDS[game]],
        chainId: PRIMARY_CHAIN.id,
      }).queryKey,
    });
  }, [isSuccess, address, game, queryClient]);

  if (!isPlayDeployed) {
    return (
      <div className="rounded-lg border border-dashed border-[color:var(--border)] bg-[color:var(--bg-muted)] p-3 text-xs text-[color:var(--fg-muted)]">
        Play contract not yet deployed. Set{" "}
        <code className="font-mono">NEXT_PUBLIC_PLAY_ADDRESS</code> to enable
        onchain minting.
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--bg-muted)] p-3 text-xs text-[color:var(--fg-muted)]">
        Connect a wallet to mint your score onchain.
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col gap-2 items-stretch">
        <div className="text-xs text-[color:var(--fg-muted)]">
          Sign in to mint your score.
        </div>
        <SignInWithBase />
      </div>
    );
  }

  if (!profileLoading && !isRegistered) {
    return (
      <div className="rounded-lg border border-dashed border-[color:var(--border)] bg-[color:var(--bg-muted)] p-3 text-xs text-[color:var(--fg-muted)]">
        Register your Play profile to mint. Open your profile page to finish.
      </div>
    );
  }

  if (!chainReady) {
    return (
      <button
        type="button"
        onClick={triggerSwitch}
        disabled={isSwitching && !needsManual}
        className="border border-[color:var(--border)] bg-[color:var(--bg-muted)] text-[color:var(--fg)] font-medium h-10 rounded-full hover:bg-[color:var(--border)] disabled:opacity-60"
      >
        {isSwitching ? "Switching…" : "Switch to Arc Testnet"}
      </button>
    );
  }

  const previousBest = bestScoreQuery.data ?? 0n;
  const isNewBest = BigInt(score) > previousBest;

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={isPending || isConfirming}
        onClick={() =>
          writeContract({
            address: PLAY_ADDRESS,
            abi: playAbi,
            functionName: "mintScore",
            args: [GAME_IDS[game], BigInt(score)],
            chainId: PRIMARY_CHAIN.id,
          })
        }
        className="bg-accent-gradient text-white font-medium h-10 rounded-full hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition"
      >
        {isPending
          ? "Confirm in wallet…"
          : isConfirming
            ? "Minting…"
            : isSuccess
              ? "Minted ✓"
              : isNewBest
                ? "Mint new best onchain"
                : "Mint score onchain"}
      </button>
      {previousBest > 0n && (
        <div className="text-[11px] text-[color:var(--fg-muted)] text-center">
          Best: {previousBest.toString()}
        </div>
      )}
      {hash && (
        <a
          href={EXPLORER_TX(hash)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-center underline text-[color:var(--fg-muted)] hover:text-[color:var(--fg)]"
        >
          View on Arcscan
        </a>
      )}
      {writeError && (
        <div className="text-[11px] text-[color:var(--accent-1)] text-center">
          {writeError.message.split("\n")[0]}
        </div>
      )}
    </div>
  );
}
