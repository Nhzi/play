import Link from "next/link";
import { Header } from "@/components/Header";

export default function LeaderboardPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 text-center">
          <Link
            href="/"
            className="text-xs text-[color:var(--fg-muted)] hover:text-[color:var(--fg)]"
          >
            ← Home
          </Link>
          <div className="mt-8 inline-block bg-accent-gradient text-white text-[10px] uppercase tracking-[0.2em] font-semibold px-3 py-1 rounded-full">
            Coming Soon
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mt-4">
            Global <span className="text-accent-gradient">Leaderboard</span>
          </h1>
          <p className="text-[color:var(--fg-muted)] mt-4 max-w-prose mx-auto">
            We&apos;ll aggregate every minted score across the catalog and rank
            players by best run per game. Mint early — your runs already count.
          </p>
          <div className="mt-10 flex flex-wrap gap-3 justify-center">
            <Link
              href="/games/tetris"
              className="bg-accent-gradient text-white font-medium px-5 h-11 rounded-full inline-flex items-center hover:brightness-110 transition"
            >
              Play Tetris
            </Link>
            <Link
              href="/games/snake"
              className="border border-[color:var(--border)] bg-[color:var(--bg-elev)] text-[color:var(--fg)] font-medium px-5 h-11 rounded-full inline-flex items-center hover:bg-[color:var(--bg-muted)] transition"
            >
              Play Snake
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
