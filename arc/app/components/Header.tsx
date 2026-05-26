import Image from "next/image";
import Link from "next/link";
import { ConnectWallet } from "./ConnectWallet";
import { ThemeToggle } from "./ThemeToggle";
import { TopScoreChip } from "./TopScoreChip";

export function Header() {
  return (
    <header className="sticky top-0 z-30 bg-[color:var(--bg)]/95 border-b border-[color:var(--border)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 group">
          <Image
            src="/play.png"
            alt=""
            width={32}
            height={32}
            priority
          />
          <span className="font-semibold tracking-tight text-base sm:text-lg text-[color:var(--fg)]">
            <span className="text-accent-gradient">Play</span>
          </span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <TopScoreChip />
          <Link
            href="/leaderboard"
            className="hidden sm:inline text-sm text-[color:var(--fg-muted)] hover:text-[color:var(--fg)] transition"
          >
            Leaderboard
          </Link>
          <Link
            href="/profile"
            className="hidden sm:inline text-sm text-[color:var(--fg-muted)] hover:text-[color:var(--fg)] transition"
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
