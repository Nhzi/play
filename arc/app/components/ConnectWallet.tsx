"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";

export function ConnectWallet() {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  if (isReconnecting) {
    return (
      <div className="px-3 py-2 text-sm text-[color:var(--fg-muted)]">
        Reconnecting…
      </div>
    );
  }

  if (!isConnected) {
    const injected = connectors.find((c) => c.type === "injected") ?? connectors[0];
    return (
      <button
        type="button"
        onClick={() => injected && connect({ connector: injected })}
        disabled={isConnecting || isPending}
        className="bg-accent-gradient text-white font-medium px-4 h-10 rounded-full shadow-sm hover:brightness-110 active:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed transition"
      >
        {isConnecting || isPending ? "Connecting…" : "Connect wallet"}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-xs sm:text-sm px-3 h-10 rounded-full bg-[color:var(--bg-muted)] border border-[color:var(--border)] flex items-center text-[color:var(--fg)]">
        {address?.slice(0, 6)}…{address?.slice(-4)}
      </span>
      <button
        type="button"
        onClick={() => disconnect()}
        className="h-10 px-3 rounded-full border border-[color:var(--border)] text-sm text-[color:var(--fg-muted)] hover:bg-[color:var(--bg-muted)] transition"
      >
        Disconnect
      </button>
    </div>
  );
}
