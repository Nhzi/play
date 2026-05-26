"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { Header } from "@/components/Header";
import { useSnake } from "@/hooks/useSnake";
import { SnakeBoard } from "@/components/snake/SnakeBoard";
import { SnakeHud } from "@/components/snake/SnakeHud";
import {
  useSnakeInput,
  useSnakeTouch,
} from "@/components/snake/useSnakeInput";
import { MintScoreButton } from "@/components/MintScoreButton";
import type { Theme } from "@/lib/snake/types";
import { recordSessionScore } from "@/lib/scores/session";
import {
  GAME_IDS,
  PLAY_ADDRESS,
  isPlayDeployed,
  playAbi,
} from "@/config/contracts";
import { PRIMARY_CHAIN } from "@/config/wagmi";

const THEME_KEY = "play:snake:theme";

export default function SnakePage() {
  const {
    state,
    start,
    togglePause,
    setDir,
    setDifficulty,
    setGrid,
  } = useSnake();

  const [theme, setTheme] = useState<Theme>("colorful");
  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(THEME_KEY) : null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored === "colorful" || stored === "classic") setTheme(stored);
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const boardRef = useRef<HTMLDivElement>(null);

  useSnakeInput({
    enabled: state.status === "playing",
    onDir: setDir,
    onPause: togglePause,
    onRestart: start,
  });

  useSnakeTouch(boardRef, {
    enabled: state.status === "playing",
    onDir: setDir,
  });

  // Compute on-screen board size: square that fits both width and viewport-h budget.
  const pixelSize = useResponsiveBoardSize();

  const { address } = useAccount();
  const bestQuery = useReadContract({
    address: PLAY_ADDRESS,
    abi: playAbi,
    functionName: "bestScore",
    args: address ? [address, GAME_IDS.snake] : undefined,
    chainId: PRIMARY_CHAIN.id,
    query: { enabled: Boolean(address) && isPlayDeployed },
  });

  useEffect(() => {
    if (state.status === "gameover") {
      recordSessionScore(address, "snake", state.s.score);
    }
  }, [state.status, state.s.score, address]);

  const disableConfig = state.status === "playing" || state.status === "paused";

  return (
    <>
      <Header />
      <main className="flex-1 no-overscroll">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-10 safe-pb">
          <div className="flex items-center justify-between mb-5 gap-2">
            <div>
              <Link
                href="/"
                className="text-xs text-[color:var(--fg-muted)] hover:text-[color:var(--fg)]"
              >
                ← All games
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">
                Snake
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {state.status === "idle" && (
                <button
                  onClick={start}
                  className="bg-accent-gradient text-white font-medium px-4 h-10 rounded-full hover:brightness-110 transition"
                >
                  Start
                </button>
              )}
              {state.status === "playing" && (
                <button
                  onClick={togglePause}
                  className="border border-[color:var(--border)] bg-[color:var(--bg-elev)] text-sm px-3 h-10 rounded-full hover:bg-[color:var(--bg-muted)]"
                >
                  Pause
                </button>
              )}
              {state.status === "paused" && (
                <button
                  onClick={togglePause}
                  className="bg-accent-gradient text-white font-medium px-4 h-10 rounded-full hover:brightness-110"
                >
                  Resume
                </button>
              )}
              {state.status === "gameover" && (
                <button
                  onClick={start}
                  className="bg-accent-gradient text-white font-medium px-4 h-10 rounded-full hover:brightness-110"
                >
                  Play again
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div
              ref={boardRef}
              className="relative mx-auto sm:mx-0"
              style={{ width: pixelSize, height: pixelSize, touchAction: "none" }}
            >
              <SnakeBoard s={state.s} theme={theme} pixelSize={pixelSize} />
              {state.status === "paused" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/55 rounded-xl">
                  <div className="text-white font-semibold tracking-wide">Paused</div>
                </div>
              )}
              {state.status === "idle" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/35 rounded-xl">
                  <button
                    onClick={start}
                    className="bg-accent-gradient text-white font-semibold px-6 h-11 rounded-full hover:brightness-110"
                  >
                    Press Start
                  </button>
                </div>
              )}
              {state.status === "gameover" && (
                <GameOverModal score={state.s.score} onReplay={start} />
              )}
            </div>

            <SnakeHud
              score={state.s.score}
              best={bestQuery.data as bigint | undefined}
              difficulty={state.difficulty}
              gridKey={state.gridKey}
              theme={theme}
              disabled={disableConfig}
              onDifficulty={setDifficulty}
              onGrid={setGrid}
              onTheme={setTheme}
            />
          </div>

          <ControlsHint />
        </div>
      </main>
    </>
  );
}

function useResponsiveBoardSize() {
  const [size, setSize] = useState(420);
  useEffect(() => {
    function recompute() {
      const w = Math.min(window.innerWidth - 32, 560);
      const h = window.innerHeight - 240;
      const candidate = Math.max(220, Math.min(w, h));
      // Snap to multiples of 8 to keep crisp cell sizes.
      setSize(Math.floor(candidate / 8) * 8);
    }
    recompute();
    window.addEventListener("resize", recompute);
    window.addEventListener("orientationchange", recompute);
    return () => {
      window.removeEventListener("resize", recompute);
      window.removeEventListener("orientationchange", recompute);
    };
  }, []);
  return size;
}

function ControlsHint() {
  const items = useMemo(
    () => [
      { k: "↑ ↓ ← →  / WASD", v: "Move" },
      { k: "P", v: "Pause" },
      { k: "R", v: "Restart" },
    ],
    [],
  );
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2">
      <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-elev)] p-4">
        <div className="text-[11px] uppercase tracking-widest text-[color:var(--fg-muted)] mb-2">
          Keyboard
        </div>
        <dl className="grid grid-cols-2 gap-y-1.5 text-sm font-mono">
          {items.map((i) => (
            <Row key={i.k} k={i.k} v={i.v} />
          ))}
        </dl>
      </div>
      <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-elev)] p-4">
        <div className="text-[11px] uppercase tracking-widest text-[color:var(--fg-muted)] mb-2">
          Touch
        </div>
        <ul className="text-sm text-[color:var(--fg-muted)] space-y-1.5">
          <li>Swipe in any direction to turn.</li>
          <li>The snake keeps moving — pace yourself.</li>
        </ul>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <>
      <dt className="text-[color:var(--fg-muted)]">{k}</dt>
      <dd className="text-[color:var(--fg)] text-right">{v}</dd>
    </>
  );
}

function GameOverModal({
  score,
  onReplay,
}: {
  score: number;
  onReplay: () => void;
}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/65 rounded-xl p-3">
      <div className="bg-[color:var(--bg-elev)] border border-[color:var(--border)] rounded-2xl p-5 w-full max-w-xs shadow-[var(--shadow)]">
        <div className="text-[11px] uppercase tracking-widest text-[color:var(--fg-muted)]">
          Game over
        </div>
        <div className="text-4xl font-bold mt-1 text-accent-gradient font-mono">
          {score.toLocaleString()}
        </div>
        <div className="mt-4 grid gap-2">
          <MintScoreButton score={score} game="snake" />
          <button
            onClick={onReplay}
            className="border border-[color:var(--border)] bg-[color:var(--bg-muted)] text-[color:var(--fg)] font-medium h-10 rounded-full hover:bg-[color:var(--border)]"
          >
            Play again
          </button>
        </div>
      </div>
    </div>
  );
}
