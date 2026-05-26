"use client";

import { useEffect, useRef, useState } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { PRIMARY_CHAIN } from "@/config/wagmi";

/**
 * When the connected wallet is on a different chain than PRIMARY_CHAIN,
 * automatically request a switch (which falls back to wallet_addEthereumChain
 * for unknown chains using the viem chain definition's rpcUrls / explorers /
 * nativeCurrency). Each render-burst will only fire one switch request so the
 * user isn't spammed if they reject.
 *
 * Returns ready=true once the wallet is on the right chain, and a manual
 * trigger for fallback UI.
 */
export function useAutoSwitchChain(opts: { enabled?: boolean } = {}) {
  const enabled = opts.enabled ?? true;
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const {
    switchChain,
    isPending: isSwitching,
    error,
    reset,
  } = useSwitchChain();

  const onRightChain = chainId === PRIMARY_CHAIN.id;
  const triedRef = useRef(false);
  const [needsManual, setNeedsManual] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    if (!isConnected) return;
    if (onRightChain) {
      triedRef.current = false;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNeedsManual(false);
      reset();
      return;
    }
    if (triedRef.current) return;
    triedRef.current = true;
    switchChain(
      { chainId: PRIMARY_CHAIN.id },
      {
        onError: () => {
          // If the wallet rejected or can't add the chain, fall back to a
          // manual button click.
          setNeedsManual(true);
        },
      },
    );
  }, [enabled, isConnected, onRightChain, switchChain, reset]);

  const trigger = () => {
    setNeedsManual(false);
    triedRef.current = true;
    switchChain({ chainId: PRIMARY_CHAIN.id });
  };

  return {
    ready: onRightChain,
    isSwitching,
    needsManual,
    error,
    trigger,
  };
}
