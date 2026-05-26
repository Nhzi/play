"use client";

import { useState } from "react";
import { useAccount, useSignMessage, usePublicClient } from "wagmi";
import { buildSiwbMessage, useSiwbSession } from "@/hooks/useSiwbSession";

function randomNonce() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function SignInWithBase({ onSignedIn }: { onSignedIn?: () => void }) {
  const { address, isConnected } = useAccount();
  const { signMessageAsync, isPending } = useSignMessage();
  const publicClient = usePublicClient();
  const { session, save, clear, ttlMs, hydrated } = useSiwbSession(address);
  const [error, setError] = useState<string | null>(null);

  if (!isConnected || !address) return null;
  if (!hydrated) return null;

  async function signIn() {
    setError(null);
    try {
      if (!address || !publicClient) return;
      const nonce = randomNonce();
      const issuedAt = Date.now();
      const message = buildSiwbMessage(address, nonce, issuedAt);
      const signature = await signMessageAsync({ message });

      // Verify (works for EOAs and ERC-1271 smart-wallets).
      const ok = await publicClient.verifyMessage({
        address,
        message,
        signature,
      });
      if (!ok) throw new Error("Signature could not be verified.");

      save({
        address,
        signature,
        nonce,
        issuedAt,
        expiresAt: issuedAt + ttlMs,
      });
      onSignedIn?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign-in failed.";
      setError(msg);
    }
  }

  if (session) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs px-2.5 py-1 rounded-full bg-[color:var(--bg-muted)] border border-[color:var(--border)] text-[color:var(--fg-muted)]">
          Signed in
        </span>
        <button
          type="button"
          onClick={clear}
          className="text-xs underline text-[color:var(--fg-muted)] hover:text-[color:var(--fg)]"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={signIn}
        disabled={isPending}
        className="bg-accent-gradient text-white text-sm font-medium px-3 h-9 rounded-full hover:brightness-110 disabled:opacity-60 transition"
      >
        {isPending ? "Check wallet…" : "Sign in"}
      </button>
      {error && (
        <span className="text-xs text-[color:var(--accent-1)]">{error}</span>
      )}
    </div>
  );
}
