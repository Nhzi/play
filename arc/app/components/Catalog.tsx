"use client";

import { useState } from "react";
import {
  GameCard,
  TetrisArt,
  SnakeArt,
  UnoArt,
  BounceArt,
  BubbleArt,
  ChatArt,
} from "@/components/GameCard";

export function Catalog() {
  const [open, setOpen] = useState(false);

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[color:var(--fg-muted)]">
            Catalog
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
            {open ? "Pick a game" : "Six games, two live"}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="bg-accent-gradient text-white font-medium h-10 px-5 rounded-full hover:brightness-110 transition"
        >
          {open ? "Hide catalog" : "Browse games"}
        </button>
      </div>

      <div className="catalog-collapse" data-open={open ? "true" : "false"}>
        <div>
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <GameCard
              title="Tetris"
              blurb="Stack, rotate, clear. SRS rules with 7-bag and hold."
              href="/games/tetris"
              art={<TetrisArt />}
            />
            <GameCard
              title="Snake"
              blurb="Chase the apple, dodge yourself. Two themes, three difficulties, three grid sizes."
              href="/games/snake"
              art={<SnakeArt />}
            />
            <GameCard
              title="Uno"
              blurb="Color and number matching, classic ruleset. Singleplayer first."
              comingSoon
              art={<UnoArt />}
            />
            <GameCard
              title="Bounce"
              blurb="Keep the ball alive. Paddle physics, infinite combos."
              comingSoon
              art={<BounceArt />}
            />
            <GameCard
              title="Bubble Blast"
              blurb="Pop chains of bubbles. The bigger the chain, the bigger the score."
              comingSoon
              art={<BubbleArt />}
            />
            <GameCard
              title="Chat"
              blurb="Talk to other players between runs. Onchain identity, offchain messages."
              comingSoon
              art={<ChatArt />}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
