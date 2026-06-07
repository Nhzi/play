# Play

> Bringing users together onchain with Games. The front door to **Tangent Wallet**.

A small onchain arcade on **Arc Testnet** (Circle's L1 — USDC is the gas token). Connect a wallet, register a one-time profile on-chain, play classic games, and mint your high scores. Tetris and Snake are live; Uno, Bounce, Bubble Blast, and Chat are queued.

Play is the entry point into a broader ecosystem. The next product down the line is **Tangent Wallet** — a consumer wallet driven by natural language, where the identity you register here travels with you.

## Repo layout

```
.
├── arc/
│   ├── app/          Next.js 16 + wagmi + viem frontend
│   └── contracts/    Foundry — Play.sol (profiles + scores) + tests + deploy script
├── about.txt         Long-form pitch (Play + Tangent Wallet ecosystem context)
├── netlify.toml      Netlify build config (base = arc/app)
└── play.png          Project logo / preview
```

Deeper docs live in [`arc/README.md`](arc/README.md). This file is the top-level entry point; everything app- and contract-specific is one level down.

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

## Landing page

The landing page at `/` is intentionally a long, scrolling pitch, not a single-fold blurb. It walks a first-time visitor from the arcade into the wider ecosystem:

1. **Hero** — floating accent blobs, animated gradient on the headline, a soft dotted grid, a Tangent foreshadow chip, and a scroll hint.
2. **Catalog** — the six-game grid (two live, four queued).
3. **How it feels** — three numbered steps (sign in → register profile → mint a run).
4. **Identity** — wallet card mock with hover-tilt and a stat grid that highlights on hover.
5. **Tangent Wallet teaser** — a self-cycling demo of natural-language transactions (`"Send 10 USDC to alex.eth"` → parsed intent → confirm).
6. **AI roadmap** — six cards covering natural-language transfers, smart swaps/bridges, conversational portfolio, pre-sign safety checks, AI opponents, and personalized recs.
7. **CTA** — final call-to-action with the accent gradient glow.

### Animation primitives

Two small client components power the motion across the page; both respect `prefers-reduced-motion` and skip on touch where relevant:

- `components/CursorDot.tsx` — a dot + ring that follow the mouse with smooth lerping. The ring grows over interactive elements (anything tagged `[data-hover]`, plus links/buttons/inputs) and shrinks on press.
- `components/Reveal.tsx` — an `IntersectionObserver` wrapper that fades and slides children in on first entry. Supports `from="up" | "down" | "left" | "right" | "none"` and a `delayMs` for staggering grids.

Section-level effects live in `app/globals.css` under the `Landing page life` divider: `.float-blob`, `.hero-grid`, `.hero-gradient-anim`, `.pulse-dot`, `.scroll-hint`, `.tilt-card`, `.caret`, and the cursor + reveal classes.

### Adding a hover-tracked element

Any element that isn't already a link/button can opt into the cursor-ring highlight by adding `data-hover`:

```tsx
<span data-hover className="...">Hover me</span>
```

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

### Play
- Global leaderboard page (cross-player rankings).
- Uno, Bounce, Bubble Blast game engines.
- Offchain Chat tied to onchain identity.
- Gas sponsorship via Circle paymaster so the user pays nothing.

### Tangent Wallet (the bigger picture)

The Play profile you register here is meant to travel. **Tangent Wallet** is the consumer wallet coming next — same identity, more surface area. Surfaces in scope:

- **Natural-language onchain actions.** "Send 10 USDC to alex.eth", "Swap 50 USDC for ETH at best rate", "Bridge 25 USDC from Arc to Base." The wallet parses intent, identifies tokens and recipients, and builds a transaction for one-tap confirmation.
- **Conversational wallet.** Balances, transaction history, and portfolio insights asked in plain English.
- **Pre-sign safety.** Anomaly detection, plain-English transaction explanations, and confirmation prompts before any high-risk action.
- **Shared identity with Play.** The wallet that mints your Tetris score is the wallet Tangent uses — one onchain profile, both products.

### AI integrations

AI sits underneath both products and is what makes Tangent feel different from a button-driven wallet:

- **In Tangent:** intent parsing (transfers, swaps, bridges), entity resolution (tokens, recipients), ambiguity handling, transaction parameter generation, conversational balance/portfolio queries, anomaly detection, and natural-language transaction explanations.
- **In Play:** AI-assisted opponents tuned to player skill, personalized game and challenge recommendations from play history, and lightweight moderation tools as Chat scales.

The shared thread: less typing of hex, more telling the app what you want.
