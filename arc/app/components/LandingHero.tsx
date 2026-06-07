import Link from "next/link";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      {/* Floating accent shapes — pure CSS, theme-aware via gradient tokens. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span className="float-blob float-blob--1" />
        <span className="float-blob float-blob--2" />
        <span className="float-blob float-blob--3" />
        <span className="hero-grid" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-14 sm:pt-24 pb-16">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--fg-muted)] mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent-2)] pulse-dot" />
            Onchain arcade · Arc Testnet
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.05] text-[color:var(--fg)]">
            Bringing users together{" "}
            <span className="text-accent-gradient hero-gradient-anim">
              onchain with Games.
            </span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-[color:var(--fg-muted)] max-w-xl leading-relaxed">
            Play is a small arcade where every high score is permanent. Connect
            your wallet, register a one-time profile on Arc Testnet, and your
            runs are minted as onchain records — yours forever, visible to
            anyone, and ready for the leaderboard when it lands. Tetris and
            Snake are live. More are warming up.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/games/tetris"
              className="bg-accent-gradient text-white font-medium h-11 px-6 rounded-full inline-flex items-center hover:brightness-110 hover:-translate-y-0.5 transition shadow-[var(--shadow)]"
            >
              Play Tetris
            </Link>
            <Link
              href="/games/snake"
              className="h-11 px-6 rounded-full inline-flex items-center border border-[color:var(--border)] text-[color:var(--fg)] hover:border-[color:var(--accent-2)] hover:text-[color:var(--accent-2)] hover:-translate-y-0.5 transition"
            >
              Play Snake
            </Link>
            <span className="ml-1 text-xs text-[color:var(--fg-muted)] hidden sm:inline">
              · No gas to sign in. USDC pays gas on Arc.
            </span>
          </div>

          {/* Subtle tangent foreshadow chip in the hero */}
          <Link
            href="#tangent"
            data-hover
            className="mt-7 inline-flex items-center gap-2 text-xs text-[color:var(--fg-muted)] hover:text-[color:var(--accent-2)] transition"
          >
            <span className="h-1 w-6 rounded-full bg-accent-gradient" />
            Coming next: Tangent Wallet — type, don&apos;t click. ↓
          </Link>
        </div>

        <div aria-hidden className="scroll-hint mt-12 hidden sm:flex">
          <span className="scroll-hint__mouse">
            <span className="scroll-hint__wheel" />
          </span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--fg-muted)]">
            Scroll
          </span>
        </div>
      </div>
    </section>
  );
}
