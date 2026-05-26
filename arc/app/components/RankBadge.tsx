import { rankFor } from "@/lib/scores/ranks";
import { GAME_LABELS, type GameKey } from "@/config/contracts";

type Props = {
  game: GameKey;
  score: number | bigint;
  /** "compact" for the header chip, "full" for the profile page. */
  variant?: "compact" | "full";
};

export function RankBadge({ game, score, variant = "full" }: Props) {
  const { tier, next, progress } = rankFor(game, score);
  const s = typeof score === "bigint" ? score.toString() : String(score);

  if (variant === "compact") {
    return (
      <span className="inline-flex items-center gap-1.5">
        <span>{tier.emoji}</span>
        <span className="font-mono text-accent-gradient font-semibold">{s}</span>
        <span className="text-[10px] uppercase tracking-wider text-[color:var(--fg-muted)]">
          {tier.name}
        </span>
      </span>
    );
  }

  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-elev)] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-[color:var(--fg-muted)]">
            {GAME_LABELS[game]} · Rank
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl">{tier.emoji}</span>
            <span className="text-2xl sm:text-3xl font-bold text-accent-gradient">
              {tier.name}
            </span>
          </div>
          <div className="text-[11px] text-[color:var(--fg-muted)] italic mt-1 max-w-xs">
            “{tier.taunt}”
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px] uppercase tracking-widest text-[color:var(--fg-muted)]">
            Best
          </div>
          <div className="font-mono font-bold text-xl sm:text-2xl text-[color:var(--fg)]">
            {s}
          </div>
        </div>
      </div>
      {next ? (
        <div className="mt-4">
          <div className="h-2 rounded-full bg-[color:var(--bg-muted)] overflow-hidden">
            <div
              className="h-full bg-accent-gradient transition-[width]"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          <div className="mt-1.5 text-[11px] text-[color:var(--fg-muted)] flex justify-between">
            <span>{tier.name}</span>
            <span>
              {next.min - (typeof score === "bigint" ? Number(score) : score)} to{" "}
              <span className="font-semibold">{next.emoji} {next.name}</span>
            </span>
          </div>
        </div>
      ) : (
        <div className="mt-4 text-[11px] text-accent-gradient font-semibold">
          Max tier. There&apos;s nowhere to climb. Maintain the throne.
        </div>
      )}
    </div>
  );
}
