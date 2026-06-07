import Link from "next/link";
import { Catalog } from "@/components/Catalog";
import { CursorDot } from "@/components/CursorDot";
import { Header } from "@/components/Header";
import { LandingHero } from "@/components/LandingHero";
import { Reveal } from "@/components/Reveal";
import { TangentTeaser } from "@/components/TangentTeaser";

export default function Home() {
  return (
    <>
      <CursorDot />
      <Header />
      <main className="flex-1">
        <LandingHero />

        <Reveal>
          <Catalog />
        </Reveal>

        {/* How a run feels — three numbered steps that lift on hover. */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-20 border-t border-[color:var(--border)]">
          <Reveal>
            <div className="max-w-2xl mb-10">
              <span className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[color:var(--fg-muted)]">
                How it feels
              </span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">
                Three steps. Then you&apos;re on the board.
              </h2>
            </div>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delayMs={i * 80}>
                <article
                  data-hover
                  className="group relative h-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-elev)] p-6 shadow-[var(--shadow)] overflow-hidden transition hover:-translate-y-1 hover:border-[color:var(--accent-2)]"
                >
                  <span className="absolute inset-x-0 top-0 h-0.5 bg-accent-gradient opacity-0 group-hover:opacity-100 transition" />
                  <span className="text-5xl font-bold text-accent-gradient leading-none">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-[color:var(--fg-muted)] leading-relaxed">
                    {s.body}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Identity */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-20 border-t border-[color:var(--border)]">
          <div className="grid gap-10 lg:grid-cols-2 items-center">
            <Reveal from="left">
              <span className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[color:var(--fg-muted)]">
                Identity
              </span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">
                One profile.{" "}
                <span className="text-accent-gradient">Carries everywhere.</span>
              </h2>
              <p className="mt-4 text-[color:var(--fg-muted)] leading-relaxed max-w-lg">
                Sign a message, pick a name, pick an emoji. That&apos;s the
                whole sign-up. Your profile lives on-chain, your scores live
                on-chain, and they&apos;re both yours — no server can take them
                away. The same wallet that mints your Tetris run today is the
                one that&apos;ll send USDC through Tangent tomorrow.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["Wallet sign-in", "Onchain profile", "Per-game best score", "ERC-1271 ready"].map(
                  (t) => (
                    <span
                      key={t}
                      data-hover
                      className="text-xs px-3 py-1.5 rounded-full border border-[color:var(--border)] text-[color:var(--fg-muted)] hover:border-[color:var(--accent-2)] hover:text-[color:var(--accent-2)] transition cursor-default"
                    >
                      {t}
                    </span>
                  )
                )}
              </div>
            </Reveal>

            <Reveal from="right">
              <div className="relative">
                <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--bg-elev)] p-6 shadow-[var(--shadow)] tilt-card">
                  <div className="flex items-center gap-3">
                    <span className="h-12 w-12 rounded-full bg-accent-gradient flex items-center justify-center text-2xl">
                      🎮
                    </span>
                    <div>
                      <div className="font-semibold">player.eth</div>
                      <div className="text-xs text-[color:var(--fg-muted)] font-mono">
                        0x9d5C…45a3
                      </div>
                    </div>
                    <span className="ml-auto text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full bg-accent-gradient text-white">
                      Onchain
                    </span>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <StatBox label="Tetris best" value="48,210" />
                    <StatBox label="Snake best" value="312" />
                    <StatBox label="Runs minted" value="17" />
                    <StatBox label="Network" value="Arc" />
                  </div>
                </div>
                <span aria-hidden className="absolute -z-10 inset-0 translate-x-3 translate-y-3 rounded-3xl bg-accent-gradient opacity-30 blur-2xl" />
              </div>
            </Reveal>
          </div>
        </section>

        {/* Tangent Wallet teaser */}
        <section
          id="tangent"
          className="mx-auto max-w-6xl px-4 sm:px-6 py-20 border-t border-[color:var(--border)] scroll-mt-20"
        >
          <Reveal>
            <TangentTeaser />
          </Reveal>
        </section>

        {/* AI roadmap */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-20 border-t border-[color:var(--border)]">
          <Reveal>
            <div className="max-w-2xl mb-10">
              <span className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[color:var(--fg-muted)]">
                On the AI roadmap
              </span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">
                Less typing of hex. More telling it what you want.
              </h2>
              <p className="mt-3 text-[color:var(--fg-muted)] leading-relaxed">
                AI sits underneath both Play and Tangent — turning natural
                language into onchain intent, then double-checking the result
                before you sign.
              </p>
            </div>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {AI_FEATURES.map((f, i) => (
              <Reveal key={f.title} delayMs={i * 70}>
                <article
                  data-hover
                  className="group relative h-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-elev)] p-5 shadow-[var(--shadow)] transition hover:-translate-y-1 hover:border-[color:var(--accent-2)]"
                >
                  <div className="h-8 w-8 rounded-lg bg-accent-gradient flex items-center justify-center text-base mb-3 transition group-hover:scale-110">
                    {f.icon}
                  </div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-[color:var(--fg-muted)] leading-relaxed">
                    {f.body}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-20 border-t border-[color:var(--border)]">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-[color:var(--border)] bg-[color:var(--bg-elev)] p-8 sm:p-12 text-center shadow-[var(--shadow)]">
              <span aria-hidden className="pointer-events-none absolute inset-0 opacity-30 bg-accent-gradient blur-3xl" />
              <div className="relative">
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                  Sign in.{" "}
                  <span className="text-accent-gradient">Stack blocks.</span>{" "}
                  Stack scores.
                </h2>
                <p className="mt-3 text-[color:var(--fg-muted)] max-w-xl mx-auto">
                  Sign-in is free. Mints cost a few cents of USDC. The board
                  remembers.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href="/games/tetris"
                    className="bg-accent-gradient text-white font-medium h-11 px-6 rounded-full inline-flex items-center hover:brightness-110 hover:-translate-y-0.5 transition shadow-[var(--shadow)]"
                  >
                    Start a run
                  </Link>
                  <Link
                    href="/leaderboard"
                    className="h-11 px-6 rounded-full inline-flex items-center border border-[color:var(--border)] hover:border-[color:var(--accent-2)] hover:text-[color:var(--accent-2)] hover:-translate-y-0.5 transition"
                  >
                    See the board
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>
    </>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div
      data-hover
      className="rounded-xl border border-[color:var(--border)] bg-[color:var(--bg)] px-3 py-2.5 transition hover:border-[color:var(--accent-2)]"
    >
      <div className="text-[10px] uppercase tracking-wider text-[color:var(--fg-muted)]">
        {label}
      </div>
      <div className="font-mono text-base text-[color:var(--fg)]">{value}</div>
    </div>
  );
}

const STEPS = [
  {
    title: "Connect & sign",
    body:
      "Tap connect, sign one message to prove the wallet is yours. No transaction, no gas. Your session sticks for 7 days.",
  },
  {
    title: "Register your profile",
    body:
      "Pick a name, optional bio, an emoji avatar. One transaction lives the rest of your time on Play — and on Tangent, when it lands.",
  },
  {
    title: "Mint your run",
    body:
      "Beat your high score. Hit mint. A few cents of USDC and your run is on Arc forever — visible to anyone, ready for the leaderboard.",
  },
];

const AI_FEATURES = [
  {
    icon: "💬",
    title: "Natural-language transfers",
    body:
      "“Send 10 USDC to alex.eth.” The wallet parses the intent and builds the tx — you just confirm.",
  },
  {
    icon: "🔁",
    title: "Smart swaps & bridges",
    body:
      "Tell it the asset and the destination. It picks the route, surfaces the rate, asks you once.",
  },
  {
    icon: "📊",
    title: "Conversational portfolio",
    body:
      "Ask “what changed today?” or “show my Play scores.” Balances, runs, and history in plain English.",
  },
  {
    icon: "🛡️",
    title: "Pre-sign safety checks",
    body:
      "Anomaly detection and natural-language explanations before any high-risk signature.",
  },
  {
    icon: "🤖",
    title: "AI opponents in Play",
    body:
      "Practice against a bot tuned to your level. Personalized difficulty without the grind.",
  },
  {
    icon: "✨",
    title: "Personalized recs",
    body:
      "Game suggestions and challenges based on what you actually play, not what trends.",
  },
];
