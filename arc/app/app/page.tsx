import { Catalog } from "@/components/Catalog";
import { Header } from "@/components/Header";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-12 sm:pt-20 pb-10">
          <div className="max-w-2xl">
            <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--fg-muted)] mb-3">
              Onchain arcade · Arc Testnet
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.05] text-[color:var(--fg)]">
              Bringing users together{" "}
              <span className="text-accent-gradient">onchain with Games.</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-[color:var(--fg-muted)] max-w-xl">
              Play is a small arcade where every high score is permanent.
              Connect your wallet, register a one-time profile on Arc Testnet,
              and your runs are minted as onchain records — yours forever,
              visible to anyone, and ready for the leaderboard when it lands.
              Tetris and Snake are live. More are warming up.
            </p>
          </div>
        </section>

        <Catalog />
      </main>
    </>
  );
}
