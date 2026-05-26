import { http, createConfig, createStorage, cookieStorage } from "wagmi";
import { arcTestnet } from "viem/chains";
import { injected } from "wagmi/connectors";

const useLocal = process.env.NEXT_PUBLIC_USE_LOCAL === "1";

const chains = [arcTestnet] as const;

export const config = createConfig({
  chains,
  connectors: [injected({ shimDisconnect: true })],
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  multiInjectedProviderDiscovery: true,
  transports: {
    [arcTestnet.id]: http(
      useLocal
        ? process.env.NEXT_PUBLIC_RPC_URL ?? "http://127.0.0.1:8545"
        : process.env.NEXT_PUBLIC_RPC_URL ?? "https://rpc.testnet.arc.network",
    ),
  },
});

export const PRIMARY_CHAIN = arcTestnet;
export const EXPLORER_TX = (hash: string) =>
  `https://testnet.arcscan.app/tx/${hash}`;
export const EXPLORER_ADDR = (addr: string) =>
  `https://testnet.arcscan.app/address/${addr}`;

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
