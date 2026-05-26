import {
  PIECES,
  type PieceId,
  type Rotation,
  type Cell,
  kicksFor,
} from "./pieces";

export const COLS = 10;
export const ROWS = 20;
// Hidden rows above visible board where pieces spawn.
export const SPAWN_ROWS = 2;
export const TOTAL_ROWS = ROWS + SPAWN_ROWS;

export type Board = (PieceId | null)[][]; // [y][x], y=0 at top

export type Active = {
  id: PieceId;
  rot: Rotation;
  x: number; // column of bounding box top-left
  y: number; // row of bounding box top-left (can be negative? no — we use SPAWN_ROWS area)
};

export function emptyBoard(): Board {
  return Array.from({ length: TOTAL_ROWS }, () =>
    Array<PieceId | null>(COLS).fill(null),
  );
}

export function spawnPiece(id: PieceId): Active {
  return {
    id,
    rot: 0,
    x: id === "O" ? 3 : 3,
    // I-piece visually sits a row higher; spawn at row 0 inside the hidden buffer.
    y: 0,
  };
}

export function pieceCells(p: Active): Cell[] {
  return PIECES[p.id].cells[p.rot].map(([dx, dy]) => [p.x + dx, p.y + dy]);
}

export function collides(board: Board, p: Active): boolean {
  for (const [x, y] of pieceCells(p)) {
    if (x < 0 || x >= COLS) return true;
    if (y >= TOTAL_ROWS) return true;
    if (y >= 0 && board[y][x] !== null) return true;
  }
  return false;
}

export function lock(board: Board, p: Active): Board {
  const next = board.map((row) => row.slice());
  for (const [x, y] of pieceCells(p)) {
    if (y >= 0 && y < TOTAL_ROWS && x >= 0 && x < COLS) {
      next[y][x] = p.id;
    }
  }
  return next;
}

export function clearLines(board: Board): { board: Board; cleared: number } {
  const remaining = board.filter((row) => row.some((c) => c === null));
  const cleared = board.length - remaining.length;
  const filler = Array.from({ length: cleared }, () =>
    Array<PieceId | null>(COLS).fill(null),
  );
  return { board: [...filler, ...remaining], cleared };
}

// Attempt rotation with SRS kick table. Returns null if no kick succeeds.
export function tryRotate(
  board: Board,
  p: Active,
  dir: -1 | 1,
): Active | null {
  const from = p.rot;
  const to = (((from + dir + 4) % 4) as Rotation);
  for (const [dx, dy] of kicksFor(p.id, from, to)) {
    const candidate: Active = { ...p, rot: to, x: p.x + dx, y: p.y - dy };
    // Note: SRS uses (x, -y) convention vs our (x, y) — invert dy.
    if (!collides(board, candidate)) return candidate;
  }
  return null;
}

export function move(board: Board, p: Active, dx: number, dy: number): Active | null {
  const candidate: Active = { ...p, x: p.x + dx, y: p.y + dy };
  return collides(board, candidate) ? null : candidate;
}

export function hardDropDistance(board: Board, p: Active): number {
  let d = 0;
  let probe = p;
  while (true) {
    const next = move(board, probe, 0, 1);
    if (!next) return d;
    probe = next;
    d++;
  }
}

// Standard guideline scoring (1/2/3/4 lines, level multiplier).
export const LINE_SCORE: Record<number, number> = {
  0: 0,
  1: 100,
  2: 300,
  3: 500,
  4: 800,
};

export function gravityIntervalMs(level: number): number {
  // Frames-per-cell curve approximation, capped 50ms.
  const t = Math.pow(0.8 - (level - 1) * 0.007, level - 1);
  return Math.max(50, Math.round(t * 1000));
}
