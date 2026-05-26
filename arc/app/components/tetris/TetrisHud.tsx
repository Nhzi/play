"use client";

import type { PieceId } from "@/lib/tetris/pieces";
import { PiecePreview } from "./TetrisBoard";

type Props = {
  score: number;
  lines: number;
  level: number;
  next: PieceId[];
  hold: PieceId | null;
};

export function TetrisHud({ score, lines, level, next, hold }: Props) {
  return (
    <div className="flex flex-col gap-3 w-full sm:w-[180px]">
      <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--bg-elev)] p-3 font-mono">
        <Stat label="Score" value={score.toLocaleString()} />
        <Stat label="Lines" value={lines.toString()} />
        <Stat label="Level" value={level.toString()} />
      </div>
      <PiecePreview id={hold} label="Hold" />
      <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--bg-elev)] p-3">
        <div className="text-[10px] uppercase tracking-widest text-[color:var(--fg-muted)] mb-2">
          Next
        </div>
        <div className="flex flex-col gap-2">
          {next.slice(0, 3).map((id, i) => (
            <NextRow key={i} id={id} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between py-1">
      <span className="text-[10px] uppercase tracking-widest text-[color:var(--fg-muted)]">
        {label}
      </span>
      <span className="text-lg font-semibold text-[color:var(--fg)] tabular-nums">
        {value}
      </span>
    </div>
  );
}

function NextRow({ id }: { id: PieceId }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={
          "h-4 w-4 rounded-sm " + colorClass(id)
        }
      />
      <span className="text-xs font-mono text-[color:var(--fg-muted)]">{id}</span>
    </div>
  );
}

function colorClass(id: PieceId) {
  return (
    {
      I: "bg-[#69d6ff]",
      O: "bg-[#ffd066]",
      T: "bg-[#b56cf2]",
      S: "bg-[#7ad97a]",
      Z: "bg-[#ff6b6b]",
      J: "bg-[#5a8cff]",
      L: "bg-[#ff8a75]",
    } as const
  )[id];
}
