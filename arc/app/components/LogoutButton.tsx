"use client";

import { useEffect, useState } from "react";
import {
  useAccount,
  useDisconnect,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import {
  GAME_IDS,
  GAME_LABELS,
  PLAY_ADDRESS,
  isPlayDeployed,
  playAbi,
  type GameKey,
} from "@/config/contracts";
import { PRIMARY_CHAIN } from "@/config/wagmi";
import { useSiwbSession } from "@/hooks/useSiwbSession";
import { useTopScore } from "@/hooks/useTopScore";
import { useAutoSwitchChain } from "@/hooks/useAutoSwitchChain";
import {
  clearSessionBests,
  readSessionBest,
} from "@/lib/scores/session";

const LIVE_GAMES: GameKey[] = ["tetris", "snake"];

type Pending = { game: GameKey; score: number; onchain: bigint };

export function LogoutButton() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { session, clear: clearSession } = useSiwbSession(address);
  const [open, setOpen] = useState(false);

  // Only show when there is something to log out from.
  if (!isConnected && !session) return null;

  function quickLogout() {
    clearSessionBests(address);
    clearSession();
    disconnect();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (!session) return quickLogout();
          setOpen(true);
        }}
        className="h-11 px-5 rounded-full border border-[color:var(--border)] bg-[color:var(--bg-elev)] text-[color:var(--fg)] text-sm font-medium hover:bg-[color:var(--bg-muted)] transition"
      >
        Log out
      </button>
      {open && (
        <LogoutFlow onClose={() => setOpen(false)} onDone={quickLogout} />
      )}
    </>
  );
}

function LogoutFlow({
  onClose,
  onDone,
}: {
  onClose: () => void;
  onDone: () => void;
}) {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const { breakdown, queryKeys, refetch } = useTopScore(address);
  const [pending, setPending] = useState<Pending[]>([]);
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<"review" | "minting" | "done">("review");
  const {
    ready: chainReady,
    isSwitching,
    needsManual,
    trigger: triggerSwitch,
  } = useAutoSwitchChain({ enabled: isPlayDeployed && pending.length > 0 });

  // Build the list of session scores that beat onchain best.
  useEffect(() => {
    if (!address) return;
    const list: Pending[] = [];
    for (const g of LIVE_GAMES) {
      const session = readSessionBest(address, g);
      const onchain = breakdown.find((b) => b.game === g)?.value ?? 0n;
      if (session > 0 && BigInt(session) > onchain) {
        list.push({ game: g, score: session, onchain });
      }
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPending(list);
  }, [address, breakdown]);

  const current = pending[idx];

  const {
    data: hash,
    isPending: isWriting,
    writeContract,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // After a successful mint, invalidate the query and advance.
  useEffect(() => {
    if (!isSuccess || !current) return;
    queryClient.invalidateQueries({ queryKey: queryKeys[current.game] });
    refetch();
    if (idx + 1 < pending.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIdx(idx + 1);
      resetWrite();
    } else {
      setPhase("done");
    }
  }, [isSuccess, current, idx, pending.length, queryClient, queryKeys, refetch, resetWrite]);

  if (!isPlayDeployed) {
    return (
      <Modal title="Log out">
        <p className="text-sm text-[color:var(--fg-muted)] mb-4">
          The Play contract isn&apos;t deployed yet. Logging out clears your
          local session only.
        </p>
        <FooterActions
          onPrimary={() => {
            onDone();
            onClose();
          }}
          primaryLabel="Log out now"
          onCancel={onClose}
        />
      </Modal>
    );
  }

  if (!chainReady && pending.length > 0) {
    return (
      <Modal title={needsManual ? "Switch to Arc Testnet" : "Switching to Arc Testnet…"}>
        <p className="text-sm text-[color:var(--fg-muted)] mb-4">
          {needsManual
            ? `Your wallet didn't switch automatically. Click to approve the change to Arc Testnet (chain ${PRIMARY_CHAIN.id}) — it may also prompt you to add the network first.`
            : `Asking your wallet to switch to Arc Testnet (chain ${PRIMARY_CHAIN.id}) so we can mint your unsaved top score${pending.length > 1 ? "s" : ""}.`}
        </p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={isSwitching && !needsManual}
            onClick={triggerSwitch}
            className="bg-accent-gradient text-white font-medium h-10 px-4 rounded-full hover:brightness-110 disabled:opacity-60"
          >
            {isSwitching ? "Switching…" : "Switch / add Arc Testnet"}
          </button>
          <button
            type="button"
            onClick={() => {
              onDone();
              onClose();
            }}
            className="text-xs text-[color:var(--fg-muted)] underline hover:text-[color:var(--fg)]"
          >
            Skip and log out anyway
          </button>
        </div>
      </Modal>
    );
  }

  if (phase === "done" || (pending.length === 0 && phase === "review")) {
    return (
      <Modal title={phase === "done" ? "Top scores saved" : "Log out"}>
        <p className="text-sm text-[color:var(--fg-muted)] mb-4">
          {phase === "done"
            ? "Your best runs are onchain. See you next time."
            : "Nothing new to save — your onchain best is already up to date."}
        </p>
        <FooterActions
          onPrimary={() => {
            onDone();
            onClose();
          }}
          primaryLabel="Log out"
          onCancel={onClose}
        />
      </Modal>
    );
  }

  // phase === "review" with pending mints
  return (
    <Modal title="Save your top score onchain">
      <p className="text-sm text-[color:var(--fg-muted)] mb-3">
        Beating your onchain best{pending.length > 1 ? "s" : ""}. One tx per
        game ({idx + 1}/{pending.length}).
      </p>
      <ul className="space-y-2 mb-4">
        {pending.map((p, i) => (
          <li
            key={p.game}
            className={
              "flex items-center justify-between text-sm rounded-lg px-3 py-2 " +
              (i === idx
                ? "border border-[color:var(--accent-2)] bg-[color:var(--bg-muted)]"
                : i < idx
                  ? "border border-[color:var(--border)] opacity-60"
                  : "border border-dashed border-[color:var(--border)]")
            }
          >
            <span className="text-[color:var(--fg)]">
              {GAME_LABELS[p.game]}
            </span>
            <span className="font-mono text-[color:var(--fg-muted)]">
              {p.onchain.toString()} → <span className="text-accent-gradient font-semibold">{p.score}</span>
            </span>
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          disabled={isWriting || isConfirming}
          onClick={() => {
            if (!current) return;
            writeContract({
              address: PLAY_ADDRESS,
              abi: playAbi,
              functionName: "mintScore",
              args: [GAME_IDS[current.game], BigInt(current.score)],
              chainId: PRIMARY_CHAIN.id,
            });
          }}
          className="bg-accent-gradient text-white font-medium h-10 rounded-full hover:brightness-110 disabled:opacity-60 transition"
        >
          {isWriting
            ? "Confirm in wallet…"
            : isConfirming
              ? "Minting…"
              : `Mint ${GAME_LABELS[current?.game ?? "tetris"]} score`}
        </button>
        {writeError && (
          <div className="text-[11px] text-[color:var(--accent-1)]">
            {writeError.message.split("\n")[0]}
          </div>
        )}
        <button
          type="button"
          onClick={() => {
            onDone();
            onClose();
          }}
          className="text-xs text-[color:var(--fg-muted)] underline hover:text-[color:var(--fg)]"
        >
          Skip and log out anyway
        </button>
      </div>
    </Modal>
  );
}

function Modal({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4 safe-px safe-pb safe-pt">
      <div className="w-full max-w-sm bg-[color:var(--bg-elev)] border border-[color:var(--border)] rounded-2xl shadow-[var(--shadow)] p-5">
        <h2 className="text-lg font-semibold mb-1">{title}</h2>
        {children}
      </div>
    </div>
  );
}

function FooterActions({
  onPrimary,
  primaryLabel,
  onCancel,
}: {
  onPrimary: () => void;
  primaryLabel: string;
  onCancel: () => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={onPrimary}
        className="bg-accent-gradient text-white font-medium h-10 rounded-full hover:brightness-110"
      >
        {primaryLabel}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="text-xs text-[color:var(--fg-muted)] underline hover:text-[color:var(--fg)]"
      >
        Cancel
      </button>
    </div>
  );
}
