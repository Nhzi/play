"use client";

import { useEffect, useState } from "react";
import { useAccount, useSignMessage, usePublicClient } from "wagmi";
import {
  buildSiwbMessage,
  useSiwbSession,
} from "@/hooks/useSiwbSession";
import { useProfile } from "@/hooks/useProfile";
import { isPlayDeployed } from "@/config/contracts";
import { RegisterProfile } from "@/components/RegisterProfile";

function randomNonce() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Top-level access gate. When the user has a wallet connected we walk them
 * through: 1) sign in with a message signature, then 2) register an onchain
 * profile. Both steps are required before they can use the app — per spec
 * the saved profile + signature are what gate user data and minted scores.
 *
 * When the user is not connected at all, the gate is invisible so the
 * homepage and public pages stay fully browsable.
 */
export function SessionGate() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync, isPending } = useSignMessage();
  const publicClient = usePublicClient();
  const { session, save, ttlMs, hydrated } = useSiwbSession(address);
  const { isRegistered, isLoading: profileLoading } = useProfile(address);
  const [error, setError] = useState<string | null>(null);

  // Auto-clear any error once the user becomes signed-in.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (session) setError(null);
  }, [session]);

  if (!isConnected || !address) return null;
  if (!hydrated) return null;

  // Step 1 — sign-in modal.
  if (!session) {
    return (
      <Modal>
        <div className="text-[11px] uppercase tracking-widest text-[color:var(--fg-muted)]">
          Sign in to Play
        </div>
        <h2 className="text-xl font-bold mt-1 mb-1">
          Welcome — let&apos;s <span className="text-accent-gradient">verify it&apos;s you</span>
        </h2>
        <p className="text-sm text-[color:var(--fg-muted)] mb-4">
          Sign a one-time message in your wallet. No gas, no transaction —
          it just proves the address belongs to you.
        </p>
        <button
          type="button"
          disabled={isPending}
          onClick={async () => {
            setError(null);
            try {
              if (!publicClient) throw new Error("RPC not ready, try again.");
              const nonce = randomNonce();
              const issuedAt = Date.now();
              const message = buildSiwbMessage(address, nonce, issuedAt);
              const signature = await signMessageAsync({ message });
              const ok = await publicClient.verifyMessage({
                address,
                message,
                signature,
              });
              if (!ok) throw new Error("Signature verification failed.");
              save({
                address,
                signature,
                nonce,
                issuedAt,
                expiresAt: issuedAt + ttlMs,
              });
            } catch (err) {
              setError(err instanceof Error ? err.message : "Sign-in failed.");
            }
          }}
          className="bg-accent-gradient text-white font-medium h-11 px-5 rounded-full hover:brightness-110 disabled:opacity-60 transition"
        >
          {isPending ? "Check wallet…" : "Sign in"}
        </button>
        {error && (
          <div className="text-xs text-[color:var(--accent-1)] mt-3">{error}</div>
        )}
      </Modal>
    );
  }

  // Step 2 — profile registration (only if the contract is deployed; otherwise
  // we let the user through so dev work isn't blocked).
  if (isPlayDeployed && !profileLoading && !isRegistered) {
    return <RegisterProfile />;
  }

  return null;
}

function Modal({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 safe-px safe-pb safe-pt">
      <div className="w-full max-w-md bg-[color:var(--bg-elev)] border border-[color:var(--border)] rounded-2xl shadow-[var(--shadow)] p-5">
        {children}
      </div>
    </div>
  );
}
