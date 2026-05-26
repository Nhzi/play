"use client";

import { useEffect, useRef } from "react";
import type { Direction } from "@/lib/snake/types";
import { isEditingTarget } from "@/lib/input/focus";

type Handlers = {
  enabled: boolean;
  onDir: (d: Direction) => void;
  onPause: () => void;
  onRestart: () => void;
};

export function useSnakeInput(h: Handlers) {
  const ref = useRef(h);
  // eslint-disable-next-line react-hooks/refs
  ref.current = h;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Don't hijack keys when the user is typing into an input/textarea.
      if (isEditingTarget(e.target)) return;
      // When the game isn't enabled, don't preventDefault game keys either.
      if (!ref.current.enabled) return;
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          ref.current.onDir("up");
          e.preventDefault();
          break;
        case "ArrowDown":
        case "s":
        case "S":
          ref.current.onDir("down");
          e.preventDefault();
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          ref.current.onDir("left");
          e.preventDefault();
          break;
        case "ArrowRight":
        case "d":
        case "D":
          ref.current.onDir("right");
          e.preventDefault();
          break;
        case "p":
        case "P":
          ref.current.onPause();
          e.preventDefault();
          break;
        case "r":
        case "R":
          ref.current.onRestart();
          e.preventDefault();
          break;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

type TouchOpts = {
  enabled: boolean;
  onDir: (d: Direction) => void;
};

const SWIPE_MIN_PX = 18;

export function useSnakeTouch(
  ref: React.RefObject<HTMLElement | null>,
  opts: TouchOpts,
) {
  const optsRef = useRef(opts);
  // eslint-disable-next-line react-hooks/refs
  optsRef.current = opts;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let startX = 0;
    let startY = 0;
    let active = false;

    function onStart(e: TouchEvent) {
      if (!optsRef.current.enabled) return;
      if (e.touches.length !== 1) return;
      if (isEditingTarget(e.target)) return;
      active = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }
    function onMove(e: TouchEvent) {
      if (!active || !optsRef.current.enabled) return;
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      const adx = Math.abs(dx);
      const ady = Math.abs(dy);
      if (Math.max(adx, ady) < SWIPE_MIN_PX) return;
      if (adx > ady) {
        optsRef.current.onDir(dx > 0 ? "right" : "left");
      } else {
        optsRef.current.onDir(dy > 0 ? "down" : "up");
      }
      // Lock the gesture to one direction-change per swipe.
      active = false;
    }
    function onEnd() {
      active = false;
    }

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: true });
    el.addEventListener("touchend", onEnd, { passive: true });
    el.addEventListener("touchcancel", onEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onEnd);
    };
  }, [ref]);
}
