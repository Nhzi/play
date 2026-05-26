# Play

> Bringing users together onchain with Games.

A small onchain arcade on **Arc Testnet** (Circle's L1 — USDC is the gas token). Connect a wallet, register a one-time profile on-chain, and mint your high scores. Tetris and Snake are live; Uno, Bounce, Bubble Blast, and Chat are queued.

## What's in here

```
.
├── app/          Next.js 16 + wagmi + viem frontend
└── contracts/    Foundry — Play.sol (profiles + scores) + tests + deploy script
```

## Run locally

```bash
cd app
cp .env.local.example .env.local      # then paste the deployed PLAY_ADDRESS
npm install
npm run dev                           # http://localhost:3000
```

The app targets Arc Testnet (chain id `5042002`). Any injected wallet that supports custom chains (MetaMask, Rabby, etc.) works. Fund the wallet with USDC from <https://faucet.circle.com>.

## Deploy the Play contract to Arc Testnet

```bash
cd contracts
forge install foundry-rs/forge-std           # one-time, if missing
forge test                                   # 16 tests, all green

export DEPLOYER_PRIVATE_KEY=0x...            # never commit this
forge create ./src/Play.sol:Play \
  --rpc-url https://rpc.testnet.arc.network \
  --private-key "$DEPLOYER_PRIVATE_KEY" \
  --broadcast
unset DEPLOYER_PRIVATE_KEY

# Paste the printed address into app/.env.local:
#   NEXT_PUBLIC_PLAY_ADDRESS=0x...
```

## Verify end-to-end

1. `cd app && npm run dev`
2. Toggle theme — colors flip.
3. Connect an injected wallet on Arc Testnet.
4. Sign-in modal: sign a one-time message (no gas).
5. Profile-registration modal: pick a display name, optional bio, and avatar emoji → 1 tx.
6. Open Tetris or Snake, play a round.
7. On game over, **Mint score onchain** → 1 tx → confirms on <https://testnet.arcscan.app>.
8. `/profile` shows best score per game + list of minted runs.

## Design

- **Chain**: Arc Testnet (5042002). RPC `https://rpc.testnet.arc.network`. Explorer `https://testnet.arcscan.app`. USDC pays gas.
- **Stack**: Next.js 16 (App Router, Turbopack), Tailwind v4, wagmi/viem, `@tanstack/react-query`, `next-themes`.
- **Auth**: wallet connect → SIWE-style message signature → verified via `viem.verifyMessage` (works for EOAs and ERC-1271) → 7-day session in `localStorage`.
- **Profile gate**: sign-in + onchain profile are required before any other UI is usable.
- **Tetris**: pure TS engine (SRS rotation, 7-bag, rAF gravity) in `app/lib/tetris/`.
- **Snake**: pure TS engine + canvas renderer. 3 difficulties (Easy/Med/Hard) × 2 themes (Colorful / Classic black-and-green) × 3 grid sizes (Small/Med/Large). Touch + keyboard.
- **Contract**: `Play.sol` — one combined contract with `register / updateProfile / mintScore` and a per-(player, game) `bestScore` map. Permissionless minting; `mintScore` reverts if the caller has no profile.
- **Theme**: dark purple primary with a red→peach accent gradient. Switchable light/dark via `next-themes`.
- **Mobile / Apple**: canvas-rendered Snake, passive touch listeners, `viewport-fit=cover` + safe-area helpers, no `backdrop-filter` (iOS GPU cost), `prefers-reduced-motion` respected.

## Roadmap

- Global leaderboard page (cross-player rankings).
- Uno, Bounce, Bubble Blast game engines.
- Offchain Chat tied to onchain identity.
- Gas sponsorship via Circle paymaster so the user pays nothing.
