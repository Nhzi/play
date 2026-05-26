"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import {
  newGame,
  queueDirection,
  step,
  tickIntervalMs,
  type SnakeState,
} from "@/lib/snake/board";
import {
  GRID_SIZES,
  type Difficulty,
  type Direction,
  type GridSizeKey,
} from "@/lib/snake/types";

export type Status = "idle" | "playing" | "paused" | "gameover";

export type GameState = {
  s: SnakeState;
  status: Status;
  difficulty: Difficulty;
  gridKey: GridSizeKey;
};

type Action =
  | { type: "start" }
  | { type: "togglePause" }
  | { type: "tick" }
  | { type: "queueDir"; dir: Direction }
  | { type: "setDifficulty"; v: Difficulty }
  | { type: "setGrid"; v: GridSizeKey }
  | { type: "reset" };

function initial(difficulty: Difficulty, gridKey: GridSizeKey): GameState {
  return {
    s: newGame(GRID_SIZES[gridKey]),
    status: "idle",
    difficulty,
    gridKey,
  };
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "start":
      return {
        ...state,
        s: newGame(GRID_SIZES[state.gridKey]),
        status: "playing",
      };
    case "reset":
      return initial(state.difficulty, state.gridKey);
    case "togglePause":
      if (state.status === "playing") return { ...state, status: "paused" };
      if (state.status === "paused") return { ...state, status: "playing" };
      return state;
    case "tick": {
      if (state.status !== "playing") return state;
      const next = step(state.s);
      if (!next.alive) return { ...state, s: next, status: "gameover" };
      return { ...state, s: next };
    }
    case "queueDir":
      return { ...state, s: queueDirection(state.s, action.dir) };
    case "setDifficulty":
      if (state.status === "playing") return state;
      return { ...state, difficulty: action.v };
    case "setGrid":
      if (state.status === "playing") return state;
      return {
        ...state,
        gridKey: action.v,
        s: newGame(GRID_SIZES[action.v]),
      };
    default:
      return state;
  }
}

export function useSnake(initialDifficulty: Difficulty = "medium", initialGrid: GridSizeKey = "medium") {
  const [state, dispatch] = useReducer(
    reducer,
    undefined,
    () => initial(initialDifficulty, initialGrid),
  );

  const stateRef = useRef(state);
  // eslint-disable-next-line react-hooks/refs
  stateRef.current = state;

  // rAF-driven tick loop using accumulator and per-difficulty interval.
  useEffect(() => {
    let raf = 0;
    let last: number | null = null;
    let acc = 0;
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (stateRef.current.status !== "playing") {
        last = t;
        return;
      }
      if (last === null) last = t;
      acc += t - last;
      last = t;
      const interval = tickIntervalMs(
        stateRef.current.difficulty,
        stateRef.current.s.foodEaten,
      );
      // Bound the inner loop so a tab-switch pause can't fire dozens of ticks.
      let safety = 4;
      while (acc >= interval && safety-- > 0) {
        acc -= interval;
        dispatch({ type: "tick" });
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const start = useCallback(() => dispatch({ type: "start" }), []);
  const reset = useCallback(() => dispatch({ type: "reset" }), []);
  const togglePause = useCallback(() => dispatch({ type: "togglePause" }), []);
  const setDir = useCallback(
    (dir: Direction) => dispatch({ type: "queueDir", dir }),
    [],
  );
  const setDifficulty = useCallback(
    (v: Difficulty) => dispatch({ type: "setDifficulty", v }),
    [],
  );
  const setGrid = useCallback(
    (v: GridSizeKey) => dispatch({ type: "setGrid", v }),
    [],
  );

  return {
    state,
    start,
    reset,
    togglePause,
    setDir,
    setDifficulty,
    setGrid,
  };
}
