import { keccak256, toBytes, type Address, type Hex } from "viem";

/**
 * Set this to the deployed Play contract address on Arc Testnet via
 * NEXT_PUBLIC_PLAY_ADDRESS. Until then, frontend features that need the
 * contract show a "not deployed yet" notice.
 *
 *   cd contracts && forge create ./src/Play.sol:Play \
 *     --rpc-url https://rpc.testnet.arc.network \
 *     --private-key "$DEPLOYER_PRIVATE_KEY" \
 *     --broadcast
 */
export const PLAY_ADDRESS = (process.env.NEXT_PUBLIC_PLAY_ADDRESS ??
  "0x0000000000000000000000000000000000000000") as Address;

export const isPlayDeployed =
  PLAY_ADDRESS.toLowerCase() !==
  "0x0000000000000000000000000000000000000000";

export const playAbi = [
  // ---- Profile ----
  {
    type: "function",
    name: "register",
    inputs: [
      { name: "displayName", type: "string" },
      { name: "bio", type: "string" },
      { name: "avatarSeed", type: "bytes32" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "updateProfile",
    inputs: [
      { name: "displayName", type: "string" },
      { name: "bio", type: "string" },
      { name: "avatarSeed", type: "bytes32" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "profiles",
    inputs: [{ name: "player", type: "address" }],
    outputs: [
      { name: "displayName", type: "string" },
      { name: "bio", type: "string" },
      { name: "avatarSeed", type: "bytes32" },
      { name: "registeredAt", type: "uint64" },
      { name: "exists", type: "bool" },
    ],
    stateMutability: "view",
  },
  // ---- Scores ----
  {
    type: "function",
    name: "mintScore",
    inputs: [
      { name: "gameId", type: "bytes32" },
      { name: "score", type: "uint256" },
    ],
    outputs: [{ name: "id", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "bestScore",
    inputs: [
      { name: "player", type: "address" },
      { name: "gameId", type: "bytes32" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "scores",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [
      { name: "player", type: "address" },
      { name: "gameId", type: "bytes32" },
      { name: "score", type: "uint256" },
      { name: "timestamp", type: "uint64" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalMinted",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  // ---- Events ----
  {
    type: "event",
    name: "ProfileRegistered",
    inputs: [
      { name: "player", type: "address", indexed: true },
      { name: "displayName", type: "string", indexed: false },
      { name: "avatarSeed", type: "bytes32", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ProfileUpdated",
    inputs: [
      { name: "player", type: "address", indexed: true },
      { name: "displayName", type: "string", indexed: false },
      { name: "avatarSeed", type: "bytes32", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ScoreMinted",
    inputs: [
      { name: "id", type: "uint256", indexed: true },
      { name: "player", type: "address", indexed: true },
      { name: "gameId", type: "bytes32", indexed: true },
      { name: "score", type: "uint256", indexed: false },
      { name: "timestamp", type: "uint64", indexed: false },
    ],
    anonymous: false,
  },
] as const;

export const GAME_IDS = {
  tetris: keccak256(toBytes("tetris")) as Hex,
  snake: keccak256(toBytes("snake")) as Hex,
} as const;

export type GameKey = keyof typeof GAME_IDS;

export const GAME_LABELS: Record<GameKey, string> = {
  tetris: "Tetris",
  snake: "Snake",
};
