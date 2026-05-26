"use client";

import {
  type Difficulty,
  type GridSizeKey,
  type Theme,
  DIFFICULTY_LABELS,
  GRID_LABELS,
} from "@/lib/snake/types";

type Props = {
  score: number;
  best?: bigint;
  difficulty: Difficulty;
  gridKey: GridSizeKey;
  theme: Theme;
  disabled: boolean;
  onDifficulty: (d: Difficulty) => void;
  onGrid: (g: GridSizeKey) => void;
  onTheme: (t: Theme) => void;
};

export function SnakeHud({
  score,
  best,
  difficulty,
  gridKey,
  theme,
  disabled,
  onDifficulty,
  onGrid,
  onTheme,
}: Props) {
  return (
    <div className="w-full sm:w-60 flex flex-col gap-4">
      <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-elev)] p-4">
        <Stat label="Score" value={score.toString()} accent />
        {typeof best === "bigint" && best > 0n && (
          <Stat label="Best (onchain)" value={best.toString()} />
        )}
      </div>

      <Section title="Theme">
        <Toggle
          options={[
            { v: "colorful", label: "Colorful" },
            { v: "classic", label: "Classic" },
          ]}
          value={theme}
          onChange={onTheme}
        />
      </Section>

      <Section title="Difficulty">
        <Toggle
          options={(["easy", "medium", "hard"] as Difficulty[]).map((d) => ({
            v: d,
            label: DIFFICULTY_LABELS[d],
          }))}
          value={difficulty}
          onChange={onDifficulty}
          disabled={disabled}
        />
      </Section>

      <Section title="Grid">
        <Toggle
          options={(["small", "medium", "large"] as GridSizeKey[]).map((g) => ({
            v: g,
            label: GRID_LABELS[g],
          }))}
          value={gridKey}
          onChange={onGrid}
          disabled={disabled}
        />
      </Section>
    </div>
  );
}

function Stat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="mb-2 last:mb-0">
      <div className="text-[11px] uppercase tracking-widest text-[color:var(--fg-muted)]">
        {label}
      </div>
      <div
        className={
          "font-mono font-bold " +
          (accent
            ? "text-2xl sm:text-3xl text-accent-gradient"
            : "text-base text-[color:var(--fg)]")
        }
      >
        {value}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-widest text-[color:var(--fg-muted)] mb-2">
        {title}
      </div>
      {children}
    </div>
  );
}

function Toggle<T extends string>({
  options,
  value,
  onChange,
  disabled = false,
}: {
  options: { v: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          disabled={disabled}
          onClick={() => onChange(o.v)}
          className={
            "text-xs px-3 h-9 rounded-full transition " +
            (value === o.v
              ? "bg-accent-gradient text-white"
              : "border border-[color:var(--border)] bg-[color:var(--bg-elev)] text-[color:var(--fg-muted)] hover:bg-[color:var(--bg-muted)]") +
            (disabled ? " opacity-50 cursor-not-allowed" : "")
          }
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
