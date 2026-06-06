# Play

> Bringing users together onchain with Games.

A small onchain arcade on **Arc Testnet** (Circle's L1 — USDC is the gas token). Connect a wallet, register a one-time profile on-chain, play classic games, and mint your high scores. Tetris and Snake are live; Uno, Bounce, Bubble Blast, and Chat are queued.

## Repo layout

```
.
├── arc/
│   ├── app/          Next.js 16 + wagmi + viem frontend
│   └── contracts/    Foundry — Play.sol (profiles + scores) + tests + deploy script
├── netlify.toml      Netlify build config (base = arc/app)
└── play.png          Project logo / preview
```

The deeper docs live in [`arc/README.md`](arc/README.md). This file is the top-level entry point; everything app- and contract-specific is one level down.

## Quickstart

```bash
cd arc/app
cp .env.local.example .env.local      # paste the deployed PLAY_ADDRESS
npm install
npm run dev                           # http://localhost:3000
```

The app targets Arc Testnet (chain id `5042002`). Any injected wallet that supports custom chains (MetaMask, Rabby, etc.) works. Fund the wallet with USDC from <https://faucet.circle.com>.

## Stack

- **Chain**: Arc Testnet (5042002). RPC `https://rpc.testnet.arc.network`. Explorer `https://testnet.arcscan.app`. USDC pays gas.
- **Frontend**: Next.js 16 (App Router, Turbopack), Tailwind v4, wagmi/viem, `@tanstack/react-query`, `next-themes`.
- **Contracts**: Foundry. `Play.sol` exposes `register / updateProfile / mintScore` plus a per-(player, game) `bestScore` map. Permissionless minting; `mintScore` reverts if the caller has no profile.
- **Auth**: wallet connect → SIWE-style signed message → verified via `viem.verifyMessage` (EOAs and ERC-1271) → 7-day session in `localStorage`.
- **Theme**: dark purple primary with a red→peach accent gradient. Light/dark via `next-themes`.

## Games

| Game         | Status   | Notes                                                                                 |
| ------------ | -------- | ------------------------------------------------------------------------------------- |
| Tetris       | Live     | Pure TS engine (SRS rotation, 7-bag, rAF gravity) in `arc/app/lib/tetris/`.           |
| Snake        | Live     | Canvas renderer, 3 difficulties × 2 themes × 3 grid sizes. Touch + keyboard.          |
| Uno          | Queued   | —                                                                                     |
| Bounce       | Queued   | —                                                                                     |
| Bubble Blast | Queued   | —                                                                                     |
| Chat         | Queued   | Offchain, tied to onchain identity.                                                   |

## Deploying the contract

```bash
cd arc/contracts
forge install foundry-rs/forge-std           # one-time, if missing
forge test                                   # 16 tests, all green

export DEPLOYER_PRIVATE_KEY=0x...
forge create ./src/Play.sol:Play \
  --rpc-url https://rpc.testnet.arc.network \
  --private-key "$DEPLOYER_PRIVATE_KEY" \
  --broadcast
unset DEPLOYER_PRIVATE_KEY

# Paste the printed address into arc/app/.env.local:
#   NEXT_PUBLIC_PLAY_ADDRESS=0x...
```

## Deploying the app

Netlify is wired up via `netlify.toml`: `base = arc/app`, `command = npm run build`, `publish = .next`, plus `@netlify/plugin-nextjs`. Set `NEXT_PUBLIC_PLAY_ADDRESS` in the Netlify UI per environment.

## Roadmap

- Global leaderboard page (cross-player rankings).
- Uno, Bounce, Bubble Blast game engines.
- Offchain Chat tied to onchain identity.
- Gas sponsorship via Circle paymaster so the user pays nothing.
- **AI integrations** — _to be detailed._ Planned surface area includes AI-assisted opponents, in-app chat assistants, and natural-language onchain actions. Specifics will be filled in as the integration design lands.
