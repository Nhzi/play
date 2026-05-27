import Image from "next/image";
import Link from "next/link";
import { ConnectWallet } from "./ConnectWallet";
import { ThemeToggle } from "./ThemeToggle";
import { TopScoreChip } from "./TopScoreChip";

export function Header() {
  return (
    <header className="sticky top-0 z-30 bg-[color:var(--bg)]/95 border-b border-[color:var(--border)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center group" aria-label="Play home">
          <Image
            src="/play.png"
            alt="Play"
            width={32}
            height={32}
            priority
          />
        </Link>
        <div className="flex items-center gap-3 sm:gap-5">
          <TopScoreChip />
          <Link
            href="/leaderboard"
            className="hidden sm:inline text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--fg-muted)] hover:text-[color:var(--fg)] transition"
          >
            Leaderboard
          </Link>
          <Link
            href="/profile"
            className="hidden sm:inline text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--fg-muted)] hover:text-[color:var(--fg)] transition"
          >
            Profile
          </Link>
          <ThemeToggle />
          <ConnectWallet />
        </div>
      </div>
    </header>
  );
}
