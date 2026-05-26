import Link from "next/link";
import type { ReactNode } from "react";

type GameCardProps = {
  title: string;
  blurb: string;
  href?: string;
  comingSoon?: boolean;
  art: ReactNode;
};

export function GameCard({ title, blurb, href, comingSoon, art }: GameCardProps) {
  const inner = (
    <div
      className={
        "group relative h-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-elev)] p-5 shadow-[var(--shadow)] overflow-hidden transition " +
        (comingSoon
          ? "opacity-70 cursor-not-allowed"
          : "hover:-translate-y-0.5 hover:border-[color:var(--accent-2)] cursor-pointer")
      }
    >
      <div className="aspect-[4/3] rounded-xl bg-[color:var(--bg-muted)] flex items-center justify-center mb-4 overflow-hidden">
        {art}
      </div>
      <div className="flex items-center justify-between gap-2 mb-1">
        <h3 className="font-semibold text-lg text-[color:var(--fg)]">{title}</h3>
        {comingSoon ? (
          <span className="text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full bg-[color:var(--bg-muted)] text-[color:var(--fg-muted)] border border-[color:var(--border)]">
            Coming Soon
          </span>
        ) : (
          <span className="text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full bg-accent-gradient text-white">
            Play
          </span>
        )}
      </div>
      <p className="text-sm text-[color:var(--fg-muted)] leading-relaxed">{blurb}</p>
    </div>
  );

  if (comingSoon || !href) return <div className="h-full">{inner}</div>;
  return (
    <Link href={href} className="block h-full">
      {inner}
    </Link>
  );
}

/* Art glyphs — pure CSS, theme-aware. */
export function TetrisArt() {
  return (
    <div className="grid grid-cols-4 grid-rows-3 gap-1 p-3">
      {[
        "a1", "a1", "a2", "  ",
        "  ", "  ", "a2", "a3",
        "a3", "a1", "a2", "a3",
      ].map((c, i) => (
        <div
          key={i}
          className={
            "h-5 w-5 rounded-[3px] " +
            (c === "a1"
              ? "bg-[color:var(--accent-1)]"
              : c === "a2"
              ? "bg-[color:var(--accent-2)]"
              : c === "a3"
              ? "bg-[color:var(--accent-3)]"
              : "bg-transparent")
          }
        />
      ))}
    </div>
  );
}

export function SnakeArt() {
  // A short coil of segments + a peach apple.
  return (
    <div className="grid grid-cols-6 grid-rows-4 gap-1 p-3">
      {Array.from({ length: 24 }, (_, i) => {
        const path = new Set([7, 8, 9, 10, 16, 22, 21, 20]);
        const head = 7;
        const apple = 11;
        if (i === head) return <Cell key={i} cls="bg-[color:var(--accent-1)]" />;
        if (path.has(i)) return <Cell key={i} cls="bg-[color:var(--accent-2)]" />;
        if (i === apple) return <Cell key={i} cls="bg-[color:var(--accent-3)] rounded-full" />;
        return <Cell key={i} cls="bg-transparent" />;
      })}
    </div>
  );
}

function Cell({ cls }: { cls: string }) {
  return <div className={"h-3.5 w-3.5 rounded-[3px] " + cls} />;
}

export function UnoArt() {
  return (
    <div className="flex items-center justify-center gap-1.5 -rotate-6">
      <span className="h-12 w-8 rounded-md bg-[color:var(--accent-1)] -rotate-12 shadow" />
      <span className="h-12 w-8 rounded-md bg-[color:var(--accent-2)] shadow" />
      <span className="h-12 w-8 rounded-md bg-[color:var(--accent-3)] rotate-12 shadow" />
    </div>
  );
}

export function BounceArt() {
  return (
    <div className="relative h-full w-full">
      <span className="absolute left-3 bottom-3 h-3 w-12 rounded-full bg-[color:var(--accent-2)]" />
      <span className="absolute right-4 top-3 h-6 w-6 rounded-full bg-accent-gradient" />
    </div>
  );
}

export function BubbleArt() {
  return (
    <div className="relative h-full w-full">
      <span className="absolute left-2 top-4 h-6 w-6 rounded-full bg-[color:var(--accent-1)] opacity-80" />
      <span className="absolute left-9 top-9 h-5 w-5 rounded-full bg-[color:var(--accent-2)] opacity-80" />
      <span className="absolute right-3 top-3 h-4 w-4 rounded-full bg-[color:var(--accent-3)] opacity-80" />
      <span className="absolute right-7 bottom-3 h-7 w-7 rounded-full bg-accent-gradient opacity-90" />
    </div>
  );
}

export function ChatArt() {
  return (
    <div className="relative h-full w-full p-3 flex items-center justify-center">
      <span className="absolute left-3 top-3 h-7 w-12 rounded-2xl bg-[color:var(--accent-2)] opacity-90" />
      <span className="absolute right-3 bottom-3 h-7 w-14 rounded-2xl bg-[color:var(--accent-1)] opacity-90" />
    </div>
  );
}
