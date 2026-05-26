"use client";

import { useEffect, useState } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import {
  PLAY_ADDRESS,
  isPlayDeployed,
  playAbi,
} from "@/config/contracts";
import { PRIMARY_CHAIN, EXPLORER_TX } from "@/config/wagmi";
import {
  AVATAR_PALETTE,
  emojiToSeed,
  useProfile,
} from "@/hooks/useProfile";
import { useAutoSwitchChain } from "@/hooks/useAutoSwitchChain";

type Props = {
  onClose?: () => void;
  onRegistered?: () => void;
  dismissable?: boolean;
};

const MAX_NAME = 32;
const MAX_BIO = 140;

export function RegisterProfile({ onClose, onRegistered, dismissable = false }: Props) {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const { queryKey, refetch } = useProfile(address);
  const {
    ready: chainReady,
    isSwitching,
    needsManual,
    error: switchError,
    trigger: triggerSwitch,
  } = useAutoSwitchChain({ enabled: isPlayDeployed });

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState<string>(AVATAR_PALETTE[0]);

  const { data: hash, isPending, writeContract, error: writeError } =
    useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (!isSuccess) return;
    queryClient.invalidateQueries({ queryKey });
    refetch();
    onRegistered?.();
  }, [isSuccess, queryClient, queryKey, refetch, onRegistered]);

  if (!isPlayDeployed) {
    return (
      <ModalShell dismissable={dismissable} onClose={onClose}>
        <h2 className="text-lg font-semibold mb-2">Contract not deployed</h2>
        <p className="text-sm text-[color:var(--fg-muted)]">
          Set <code className="font-mono">NEXT_PUBLIC_PLAY_ADDRESS</code> in{" "}
          <code className="font-mono">app/.env.local</code> after deploying the
          Play contract to Arc Testnet.
        </p>
      </ModalShell>
    );
  }

  if (!chainReady) {
    return (
      <ModalShell dismissable={dismissable} onClose={onClose}>
        <h2 className="text-lg font-semibold mb-2">
          {needsManual ? "Switch to Arc Testnet" : "Switching to Arc Testnet…"}
        </h2>
        <p className="text-sm text-[color:var(--fg-muted)] mb-4">
          {needsManual
            ? "Your wallet didn't switch automatically. Click to approve the network change — your wallet may also prompt you to add Arc Testnet first."
            : `Asking your wallet to switch to Arc Testnet (chain ${PRIMARY_CHAIN.id}). If it's not added yet, your wallet should prompt you to add it.`}
        </p>
        <button
          type="button"
          onClick={triggerSwitch}
          className="bg-accent-gradient text-white font-medium h-10 px-4 rounded-full hover:brightness-110 disabled:opacity-60"
          disabled={isSwitching}
        >
          {isSwitching ? "Switching…" : "Switch / add Arc Testnet"}
        </button>
        {switchError && (
          <div className="text-[11px] text-[color:var(--accent-1)] mt-2">
            {switchError.message.split("\n")[0]}
          </div>
        )}
      </ModalShell>
    );
  }

  const nameOk = displayName.trim().length > 0 && displayName.length <= MAX_NAME;
  const bioOk = bio.length <= MAX_BIO;

  function submit() {
    if (!nameOk || !bioOk) return;
    writeContract({
      address: PLAY_ADDRESS,
      abi: playAbi,
      functionName: "register",
      args: [displayName.trim(), bio.trim(), emojiToSeed(avatar)],
      chainId: PRIMARY_CHAIN.id,
    });
  }

  return (
    <ModalShell dismissable={dismissable} onClose={onClose}>
      <div className="text-[11px] uppercase tracking-widest text-[color:var(--fg-muted)]">
        Create your Play profile
      </div>
      <h2 className="text-xl font-bold mt-1 mb-1">
        One quick <span className="text-accent-gradient">onchain step</span>
      </h2>
      <p className="text-xs text-[color:var(--fg-muted)] mb-4">
        Saved to Arc Testnet. Required to mint scores and access your profile.
      </p>

      <label className="block text-xs text-[color:var(--fg-muted)] mb-1">
        Display name
      </label>
      <input
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value.slice(0, MAX_NAME))}
        maxLength={MAX_NAME}
        placeholder="e.g. arcade-cat"
        className="w-full bg-[color:var(--bg-muted)] border border-[color:var(--border)] rounded-lg px-3 h-10 text-sm outline-none focus:border-[color:var(--accent-2)]"
      />
      <div className="text-[10px] text-[color:var(--fg-muted)] mt-1 text-right">
        {displayName.length}/{MAX_NAME}
      </div>

      <label className="block text-xs text-[color:var(--fg-muted)] mb-1 mt-3">
        Short bio (optional)
      </label>
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value.slice(0, MAX_BIO))}
        maxLength={MAX_BIO}
        rows={2}
        placeholder="One line about you."
        className="w-full bg-[color:var(--bg-muted)] border border-[color:var(--border)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[color:var(--accent-2)] resize-none"
      />
      <div className="text-[10px] text-[color:var(--fg-muted)] mt-1 text-right">
        {bio.length}/{MAX_BIO}
      </div>

      <label className="block text-xs text-[color:var(--fg-muted)] mb-2 mt-3">
        Avatar
      </label>
      <div className="grid grid-cols-9 gap-1.5">
        {AVATAR_PALETTE.map((e) => (
          <button
            type="button"
            key={e}
            onClick={() => setAvatar(e)}
            className={
              "h-9 w-9 rounded-md text-xl flex items-center justify-center transition " +
              (avatar === e
                ? "bg-accent-gradient ring-2 ring-[color:var(--accent-2)]"
                : "bg-[color:var(--bg-muted)] hover:bg-[color:var(--border)]")
            }
            aria-label={`avatar ${e}`}
          >
            {e}
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-2">
        <button
          type="button"
          disabled={!nameOk || !bioOk || isPending || isConfirming || isSuccess}
          onClick={submit}
          className="bg-accent-gradient text-white font-medium h-10 rounded-full hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {isPending
            ? "Confirm in wallet…"
            : isConfirming
              ? "Registering…"
              : isSuccess
                ? "Registered ✓"
                : "Register onchain"}
        </button>
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
    </ModalShell>
  );
}

function ModalShell({
  children,
  onClose,
  dismissable,
}: {
  children: React.ReactNode;
  onClose?: () => void;
  dismissable?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 safe-px safe-pb safe-pt">
      <div className="w-full max-w-md bg-[color:var(--bg-elev)] border border-[color:var(--border)] rounded-2xl shadow-[var(--shadow)] p-5">
        {dismissable && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="float-right text-[color:var(--fg-muted)] hover:text-[color:var(--fg)] text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
