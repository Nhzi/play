"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import {
  COLS,
  ROWS,
  TOTAL_ROWS,
  SPAWN_ROWS,
  emptyBoard,
  spawnPiece,
  collides,
  lock,
  clearLines,
  tryRotate,
  move,
  hardDropDistance,
  gravityIntervalMs,
  LINE_SCORE,
  type Active,
  type Board,
} from "@/lib/tetris/board";
import { makeBag } from "@/lib/tetris/rng";
import type { PieceId } from "@/lib/tetris/pieces";

export type Status = "idle" | "playing" | "paused" | "gameover";

export type GameState = {
  board: Board;
  active: Active | null;
  next: PieceId[]; // length 5
  hold: PieceId | null;
  canHold: boolean;
  score: number;
  lines: number;
  level: number;
  status: Status;
};

type Action =
  | { type: "start" }
  | { type: "reset" }
  | { type: "togglePause" }
  | { type: "gravity" }
  | { type: "move"; dx: number }
  | { type: "softDrop" }
  | { type: "hardDrop" }
  | { type: "rotate"; dir: -1 | 1 }
  | { type: "hold" };

function makeInitial(): GameState {
  return {
    board: emptyBoard(),
    active: null,
    next: [],
    hold: null,
    canHold: true,
    score: 0,
    lines: 0,
    level: 1,
    status: "idle",
  };
}

function withNewLevel(lines: number): number {
  return Math.floor(lines / 10) + 1;
}

// The reducer closes over a `pull` getter; the hook supplies one bound to a ref
// so resetting the bag (on a new game) cleanly takes effect without rebuilding the reducer.
function reducerFactory(pull: () => PieceId) {
  function commitLock(s: GameState, bonus: number): GameState {
    if (!s.active) return s;
    const locked = lock(s.board, s.active);
    const { board: cleared, cleared: n } = clearLines(locked);
    const newLines = s.lines + n;
    const newLevel = withNewLevel(newLines);
    const lineScore = (LINE_SCORE[n] ?? 0) * s.level;
    const queue = s.next.slice();
    const nextId = queue.shift() as PieceId;
    queue.push(pull());
    const spawn = spawnPiece(nextId);
    const topOut = collides(cleared, spawn);
    return {
      ...s,
      board: cleared,
      active: topOut ? null : spawn,
      next: queue,
      canHold: true,
      score: s.score + lineScore + bonus,
      lines: newLines,
      level: newLevel,
      status: topOut ? "gameover" : "playing",
    };
  }

  return function reducer(state: GameState, action: Action): GameState {
    switch (action.type) {
      case "reset": {
        const fresh = makeInitial();
        const queue: PieceId[] = Array.from({ length: 5 }, () => pull());
        return { ...fresh, next: queue };
      }
      case "start": {
        if (state.status === "playing") return state;
        const queue =
          state.next.length === 5
            ? state.next.slice()
            : Array.from({ length: 5 }, () => pull());
        const first = queue.shift() as PieceId;
        queue.push(pull());
        const active = spawnPiece(first);
        if (collides(state.board, active)) {
          return { ...state, status: "gameover" };
        }
        return {
          ...state,
          board:
            state.status === "gameover"
              ? emptyBoard()
              : state.board.some((row) => row.some((c) => c !== null))
                ? state.board
                : emptyBoard(),
          active,
          next: queue,
          hold: state.status === "gameover" ? null : state.hold,
          canHold: true,
          score: state.status === "gameover" ? 0 : state.score,
          lines: state.status === "gameover" ? 0 : state.lines,
          level: state.status === "gameover" ? 1 : state.level,
          status: "playing",
        };
      }
      case "togglePause": {
        if (state.status === "playing") return { ...state, status: "paused" };
        if (state.status === "paused") return { ...state, status: "playing" };
        return state;
      }
      case "gravity": {
        if (state.status !== "playing" || !state.active) return state;
        const moved = move(state.board, state.active, 0, 1);
        return moved ? { ...state, active: moved } : commitLock(state, 0);
      }
      case "move": {
        if (state.status !== "playing" || !state.active) return state;
        const moved = move(state.board, state.active, action.dx, 0);
        return moved ? { ...state, active: moved } : state;
      }
      case "softDrop": {
        if (state.status !== "playing" || !state.active) return state;
        const moved = move(state.board, state.active, 0, 1);
        return moved
          ? { ...state, active: moved, score: state.score + 1 }
          : commitLock(state, 0);
      }
      case "hardDrop": {
        if (state.status !== "playing" || !state.active) return state;
        const d = hardDropDistance(state.board, state.active);
        const dropped: Active = { ...state.active, y: state.active.y + d };
        return commitLock({ ...state, active: dropped }, d * 2);
      }
      case "rotate": {
        if (state.status !== "playing" || !state.active) return state;
        const rotated = tryRotate(state.board, state.active, action.dir);
        return rotated ? { ...state, active: rotated } : state;
      }
      case "hold": {
        if (state.status !== "playing" || !state.active || !state.canHold)
          return state;
        const heldId = state.hold;
        const currentId = state.active.id;
        const queue = state.next.slice();
        let nextId: PieceId;
        if (heldId) {
          nextId = heldId;
        } else {
          nextId = queue.shift() as PieceId;
          queue.push(pull());
        }
        const spawn = spawnPiece(nextId);
        if (collides(state.board, spawn)) {
          return { ...state, status: "gameover" };
        }
        return {
          ...state,
          active: spawn,
          hold: currentId,
          next: queue,
          canHold: false,
        };
      }
      default:
        return state;
    }
  };
}

export function useTetris() {
  const bagRef = useRef<() => PieceId>(makeBag());
  // eslint-disable-next-line react-hooks/refs
  const reducerRef = useRef(reducerFactory(() => bagRef.current()));
  // eslint-disable-next-line react-hooks/refs
  const [state, dispatch] = useReducer(reducerRef.current, undefined, makeInitial);
  const accRef = useRef(0);
  const lastRef = useRef<number | null>(null);
  const stateRef = useRef(state);
  // eslint-disable-next-line react-hooks/refs
  stateRef.current = state;

  useEffect(() => {
    let raf = 0;
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (stateRef.current.status !== "playing") {
        lastRef.current = t;
        return;
      }
      if (lastRef.current === null) lastRef.current = t;
      accRef.current += t - lastRef.current;
      lastRef.current = t;
      const interval = gravityIntervalMs(stateRef.current.level);
      let safety = 10;
      while (accRef.current >= interval && safety-- > 0) {
        accRef.current -= interval;
        dispatch({ type: "gravity" });
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const start = useCallback(() => {
    bagRef.current = makeBag(); // pull() reads through bagRef, so this resets cleanly
    dispatch({ type: "reset" });
    queueMicrotask(() => dispatch({ type: "start" }));
  }, []);

  const togglePause = useCallback(() => dispatch({ type: "togglePause" }), []);
  const moveLeft = useCallback(() => dispatch({ type: "move", dx: -1 }), []);
  const moveRight = useCallback(() => dispatch({ type: "move", dx: 1 }), []);
  const softDrop = useCallback(() => dispatch({ type: "softDrop" }), []);
  const hardDrop = useCallback(() => dispatch({ type: "hardDrop" }), []);
  const rotateCw = useCallback(() => dispatch({ type: "rotate", dir: 1 }), []);
  const rotateCcw = useCallback(() => dispatch({ type: "rotate", dir: -1 }), []);
  const hold = useCallback(() => dispatch({ type: "hold" }), []);

  return {
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
    constants: { COLS, ROWS, TOTAL_ROWS, SPAWN_ROWS },
  };
}
