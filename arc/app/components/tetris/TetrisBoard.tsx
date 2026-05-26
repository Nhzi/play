"use client";

import { useMemo } from "react";
import {
  COLS,
  ROWS,
  SPAWN_ROWS,
  pieceCells,
  hardDropDistance,
  type Active,
  type Board as BoardModel,
} from "@/lib/tetris/board";
import type { PieceId } from "@/lib/tetris/pieces";

const COLOR_CLASS: Record<PieceId, string> = {
  I: "bg-[#69d6ff]",        // cyan
  O: "bg-[#ffd066]",        // yellow
  T: "bg-[#b56cf2]",        // purple — primary family
  S: "bg-[#7ad97a]",        // green
  Z: "bg-[#ff6b6b]",        // accent-1 red
  J: "bg-[#5a8cff]",        // blue
  L: "bg-[#ff8a75]",        // accent-2 peach
};

type Props = {
  board: BoardModel;
  active: Active | null;
  cellPx?: number;
};

export function TetrisBoard({ board, active, cellPx = 28 }: Props) {
  const ghost = useMemo(() => {
    if (!active) return null;
    const d = hardDropDistance(board, active);
    const dropped: Active = { ...active, y: active.y + d };
    return dropped;
  }, [board, active]);

  // We render only the visible ROWS (skip the SPAWN_ROWS at the top).
  const overlay = new Map<string, { id: PieceId; ghost?: boolean }>();
  if (ghost) {
    for (const [x, y] of pieceCells(ghost)) {
      if (y >= SPAWN_ROWS) overlay.set(`${x},${y}`, { id: ghost.id, ghost: true });
    }
  }
  if (active) {
    for (const [x, y] of pieceCells(active)) {
      if (y >= SPAWN_ROWS) overlay.set(`${x},${y}`, { id: active.id });
    }
  }

  return (
    <div
      className="relative rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-elev)] shadow-[var(--shadow)] no-overscroll touch-none select-none"
      style={{
        width: COLS * cellPx + 8,
        padding: 4,
      }}
      role="grid"
      aria-label="Tetris board"
    >
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${COLS}, ${cellPx}px)`,
          gridTemplateRows: `repeat(${ROWS}, ${cellPx}px)`,
          gap: 1,
        }}
      >
        {Array.from({ length: ROWS }).flatMap((_, vy) => {
          const y = vy + SPAWN_ROWS;
          return Array.from({ length: COLS }).map((__, x) => {
            const settled = board[y]?.[x];
            const layer = overlay.get(`${x},${y}`);
            const id = layer?.id ?? settled ?? null;
            const isGhost = layer?.ghost && !settled;
            return (
              <div
                key={`${x}-${vy}`}
                className={
                  "rounded-[3px] " +
                  (id
                    ? isGhost
                      ? `${COLOR_CLASS[id]} opacity-25`
                      : `${COLOR_CLASS[id]} shadow-inner`
                    : "bg-[color:var(--bg-muted)]")
                }
              />
            );
          });
        })}
      </div>
    </div>
  );
}

export function PiecePreview({
  id,
  size = 18,
  label,
}: {
  id: PieceId | null;
  size?: number;
  label: string;
}) {
  return (
    <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--bg-elev)] p-3">
      <div className="text-[10px] uppercase tracking-widest text-[color:var(--fg-muted)] mb-2">
        {label}
      </div>
      <div
        className="grid mx-auto"
        style={{
          gridTemplateColumns: `repeat(4, ${size}px)`,
          gridTemplateRows: `repeat(2, ${size}px)`,
          gap: 1,
          width: 4 * size + 3,
        }}
      >
        {Array.from({ length: 8 }).map((_, i) => {
          const x = i % 4;
          const y = Math.floor(i / 4);
          const filled =
            id != null &&
            (PREVIEW_CELLS[id] ?? []).some(([px, py]) => px === x && py === y);
          return (
            <div
              key={i}
              className={
                "rounded-[2px] " +
                (filled ? COLOR_CLASS[id as PieceId] : "bg-transparent")
              }
            />
          );
        })}
      </div>
    </div>
  );
}

// Compact 2-row preview shapes per piece (top-aligned).
const PREVIEW_CELLS: Record<PieceId, [number, number][]> = {
  I: [[0, 1], [1, 1], [2, 1], [3, 1]],
  O: [[1, 0], [2, 0], [1, 1], [2, 1]],
  T: [[1, 0], [0, 1], [1, 1], [2, 1]],
  S: [[1, 0], [2, 0], [0, 1], [1, 1]],
  Z: [[0, 0], [1, 0], [1, 1], [2, 1]],
  J: [[0, 0], [0, 1], [1, 1], [2, 1]],
  L: [[2, 0], [0, 1], [1, 1], [2, 1]],
};
