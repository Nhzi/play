"use client";

import { useCallback, useEffect, useState } from "react";
import type { Address, Hex } from "viem";

const KEY_PREFIX = "play:sig:";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export type Session = {
  address: Address;
  signature: Hex;
  issuedAt: number;
  expiresAt: number;
  nonce: string;
};

function key(address: Address) {
  return `${KEY_PREFIX}${address.toLowerCase()}`;
}

export function readSession(address: Address | undefined): Session | null {
  if (!address || typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key(address));
    if (!raw) return null;
    const session = JSON.parse(raw) as Session;
    if (Date.now() > session.expiresAt) {
      window.localStorage.removeItem(key(address));
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function clearSession(address: Address | undefined) {
  if (!address || typeof window === "undefined") return;
  window.localStorage.removeItem(key(address));
}

export function buildSiwbMessage(address: Address, nonce: string, issuedAt: number) {
  return [
    "Sign in to Play",
    "",
    `Address: ${address}`,
    `Nonce: ${nonce}`,
    `Issued At: ${new Date(issuedAt).toISOString()}`,
    `Expires At: ${new Date(issuedAt + SESSION_TTL_MS).toISOString()}`,
  ].join("\n");
}

export function useSiwbSession(address: Address | undefined) {
  const [session, setSession] = useState<Session | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
    setSession(readSession(address));
  }, [address]);

  const save = useCallback((s: Session) => {
    window.localStorage.setItem(key(s.address), JSON.stringify(s));
    setSession(s);
  }, []);

  const clear = useCallback(() => {
    if (address) {
      clearSession(address);
      setSession(null);
    }
  }, [address]);

  return { session, save, clear, hydrated, ttlMs: SESSION_TTL_MS };
}
