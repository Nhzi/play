"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { Header } from "@/components/Header";
import { useTetris } from "@/hooks/useTetris";
import { TetrisBoard } from "@/components/tetris/TetrisBoard";
import { TetrisHud } from "@/components/tetris/TetrisHud";
import {
  useTetrisInput,
  useTouchControls,
} from "@/components/tetris/useTetrisInput";
import { MintScoreButton } from "@/components/MintScoreButton";
import { recordSessionScore } from "@/lib/scores/session";

export default function TetrisPage() {
  const {
    state,
    start,
    togglePause,
    moveLeft,
    moveRight,
    softDrop,
    hardDrop,
    rotateCw,
    rotateCcw,
    hold,
  } = useTetris();

  const boardRef = useRef<HTMLDivElement>(null);

  useTetrisInput({
    enabled: state.status === "playing",
    onLeft: moveLeft,
    onRight: moveRight,
    onSoftDrop: softDrop,
    onHardDrop: hardDrop,
    onRotateCw: rotateCw,
    onRotateCcw: rotateCcw,
    onHold: hold,
    onPause: togglePause,
    onRestart: start,
  });

  useTouchControls(boardRef, {
    enabled: state.status === "playing",
    onLeft: moveLeft,
    onRight: moveRight,
    onSoftDrop: softDrop,
    onHardDrop: hardDrop,
    onRotateCw: rotateCw,
    onHold: hold,
  });

  const { address } = useAccount();
  useEffect(() => {
    if (state.status === "gameover") {
      recordSessionScore(address, "tetris", state.score);
    }
  }, [state.status, state.score, address]);

  return (
    <>
      <Header />
      <main className="flex-1 no-overscroll">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-10 safe-pb">
          <div className="flex items-center justify-between mb-5">
            <div>
              <Link
                href="/"
                className="text-xs text-[color:var(--fg-muted)] hover:text-[color:var(--fg)]"
              >
                ← All games
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">
                Tetris
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
            <div ref={boardRef} className="relative">
              <TetrisBoard
                board={state.board}
                active={state.active}
                cellPx={typeof window !== "undefined" && window.innerWidth < 480 ? 24 : 28}
              />
              {state.status === "paused" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/55 rounded-xl">
                  <div className="text-white font-semibold tracking-wide">Paused</div>
                </div>
              )}
              {state.status === "gameover" && (
                <GameOverModal score={state.score} lines={state.lines} onReplay={start} />
              )}
              {state.status === "idle" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
                  <button
                    onClick={start}
                    className="bg-accent-gradient text-white font-semibold px-6 h-11 rounded-full hover:brightness-110"
                  >
                    Press Start
                  </button>
                </div>
              )}
            </div>

            <TetrisHud
              score={state.score}
              lines={state.lines}
              level={state.level}
              next={state.next}
              hold={state.hold}
            />
          </div>

          <ControlsHint />
        </div>
      </main>
    </>
  );
}

function ControlsHint() {
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2">
      <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-elev)] p-4">
        <div className="text-[11px] uppercase tracking-widest text-[color:var(--fg-muted)] mb-2">
          Keyboard
        </div>
        <dl className="grid grid-cols-2 gap-y-1.5 text-sm font-mono">
          <Row k="← →" v="Move" />
          <Row k="↓" v="Soft drop" />
          <Row k="↑ / X" v="Rotate CW" />
          <Row k="Z" v="Rotate CCW" />
          <Row k="Space" v="Hard drop" />
          <Row k="Shift / C" v="Hold" />
          <Row k="P" v="Pause" />
          <Row k="R" v="Restart" />
        </dl>
      </div>
      <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-elev)] p-4">
        <div className="text-[11px] uppercase tracking-widest text-[color:var(--fg-muted)] mb-2">
          Touch
        </div>
        <ul className="text-sm text-[color:var(--fg-muted)] space-y-1.5">
          <li>Swipe left/right — move</li>
          <li>Swipe down (slow) — soft drop</li>
          <li>Swipe down (fast) — hard drop</li>
          <li>Tap — rotate</li>
          <li>Long-press — hold</li>
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
  lines,
  onReplay,
}: {
  score: number;
  lines: number;
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
        <div className="text-xs text-[color:var(--fg-muted)] mt-1">
          {lines} {lines === 1 ? "line" : "lines"} cleared
        </div>
        <div className="mt-4 grid gap-2">
          <MintScoreButton score={score} game="tetris" />
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
