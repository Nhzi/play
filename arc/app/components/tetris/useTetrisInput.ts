"use client";

import { useEffect, useRef } from "react";
import { isEditingTarget } from "@/lib/input/focus";

type Handlers = {
  onLeft: () => void;
  onRight: () => void;
  onSoftDrop: () => void;
  onHardDrop: () => void;
  onRotateCw: () => void;
  onRotateCcw: () => void;
  onHold: () => void;
  onPause: () => void;
  onRestart: () => void;
  enabled: boolean;
};

const DAS_MS = 140; // delayed auto-shift
const ARR_MS = 35;  // auto-repeat rate
const SOFT_MS = 45; // soft drop repeat

export function useTetrisInput(h: Handlers) {
  const handlersRef = useRef(h);
  // eslint-disable-next-line react-hooks/refs
  handlersRef.current = h;

  useEffect(() => {
    const heldKeys = new Set<string>();
    let leftTimer: number | null = null;
    let rightTimer: number | null = null;
    let downTimer: number | null = null;

    function clearTimer(t: number | null) {
      if (t !== null) window.clearTimeout(t);
    }

    function repeatLeft() {
      if (!handlersRef.current.enabled) return;
      handlersRef.current.onLeft();
      leftTimer = window.setTimeout(repeatLeft, ARR_MS);
    }
    function repeatRight() {
      if (!handlersRef.current.enabled) return;
      handlersRef.current.onRight();
      rightTimer = window.setTimeout(repeatRight, ARR_MS);
    }
    function repeatDown() {
      if (!handlersRef.current.enabled) return;
      handlersRef.current.onSoftDrop();
      downTimer = window.setTimeout(repeatDown, SOFT_MS);
    }

    function onKeyDown(e: KeyboardEvent) {
      // Never hijack keys while typing into an input/textarea.
      if (isEditingTarget(e.target)) return;
      // Allow these even when not 'enabled' (e.g., 'r' restarts from game over)
      if (e.key === "r" || e.key === "R") {
        handlersRef.current.onRestart();
        e.preventDefault();
        return;
      }
      if (e.key === "p" || e.key === "P") {
        handlersRef.current.onPause();
        e.preventDefault();
        return;
      }
      if (!handlersRef.current.enabled) return;
      if (heldKeys.has(e.code)) return;
      heldKeys.add(e.code);

      switch (e.code) {
        case "ArrowLeft":
          handlersRef.current.onLeft();
          clearTimer(leftTimer);
          leftTimer = window.setTimeout(repeatLeft, DAS_MS);
          e.preventDefault();
          break;
        case "ArrowRight":
          handlersRef.current.onRight();
          clearTimer(rightTimer);
          rightTimer = window.setTimeout(repeatRight, DAS_MS);
          e.preventDefault();
          break;
        case "ArrowDown":
          handlersRef.current.onSoftDrop();
          clearTimer(downTimer);
          downTimer = window.setTimeout(repeatDown, SOFT_MS);
          e.preventDefault();
          break;
        case "ArrowUp":
        case "KeyX":
          handlersRef.current.onRotateCw();
          e.preventDefault();
          break;
        case "KeyZ":
          handlersRef.current.onRotateCcw();
          e.preventDefault();
          break;
        case "Space":
          handlersRef.current.onHardDrop();
          e.preventDefault();
          break;
        case "ShiftLeft":
        case "ShiftRight":
        case "KeyC":
          handlersRef.current.onHold();
          e.preventDefault();
          break;
      }
    }

    function onKeyUp(e: KeyboardEvent) {
      heldKeys.delete(e.code);
      if (e.code === "ArrowLeft") {
        clearTimer(leftTimer);
        leftTimer = null;
      }
      if (e.code === "ArrowRight") {
        clearTimer(rightTimer);
        rightTimer = null;
      }
      if (e.code === "ArrowDown") {
        clearTimer(downTimer);
        downTimer = null;
      }
    }

    function onBlur() {
      heldKeys.clear();
      clearTimer(leftTimer);
      clearTimer(rightTimer);
      clearTimer(downTimer);
      leftTimer = rightTimer = downTimer = null;
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      onBlur();
    };
  }, []);
}

// --- Touch input ---

type TouchHandlers = {
  onLeft: () => void;
  onRight: () => void;
  onSoftDrop: () => void;
  onHardDrop: () => void;
  onRotateCw: () => void;
  onHold: () => void;
  enabled: boolean;
};

const SWIPE_THRESHOLD_PX = 22;          // px per step
const HARD_DROP_VEL_PX_PER_MS = 1.5;    // very fast downward swipe
const LONG_PRESS_MS = 280;
const TAP_MAX_MS = 200;
const TAP_MAX_PX = 12;

export function useTouchControls(
  ref: React.RefObject<HTMLElement | null>,
  h: TouchHandlers,
) {
  const handlersRef = useRef(h);
  // eslint-disable-next-line react-hooks/refs
  handlersRef.current = h;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let lastY = 0;
    let startT = 0;
    let lastT = 0;
    let longPressTimer: number | null = null;
    let didLongPress = false;
    let active = false;

    function onStart(e: TouchEvent) {
      if (!handlersRef.current.enabled) return;
      if (e.touches.length !== 1) return;
      if (isEditingTarget(e.target)) return;
      active = true;
      didLongPress = false;
      const t = e.touches[0];
      startX = lastX = t.clientX;
      startY = lastY = t.clientY;
      startT = lastT = performance.now();
      longPressTimer = window.setTimeout(() => {
        didLongPress = true;
        handlersRef.current.onHold();
      }, LONG_PRESS_MS);
    }

    function onMove(e: TouchEvent) {
      if (!active || !handlersRef.current.enabled) return;
      const t = e.touches[0];
      const x = t.clientX;
      const y = t.clientY;
      const now = performance.now();

      // Cancel long-press if we've moved.
      if (Math.abs(x - startX) > 4 || Math.abs(y - startY) > 4) {
        if (longPressTimer) {
          clearTimeout(longPressTimer);
          longPressTimer = null;
        }
      }

      // Horizontal step-based shifting.
      const dx = x - lastX;
      if (Math.abs(dx) >= SWIPE_THRESHOLD_PX) {
        const steps = Math.trunc(dx / SWIPE_THRESHOLD_PX);
        const dir = steps > 0 ? handlersRef.current.onRight : handlersRef.current.onLeft;
        for (let i = 0; i < Math.abs(steps); i++) dir();
        lastX = x;
      }

      // Vertical soft-drop step.
      const dy = y - lastY;
      if (dy >= SWIPE_THRESHOLD_PX) {
        const dt = now - lastT;
        const v = dy / Math.max(1, dt);
        if (v >= HARD_DROP_VEL_PX_PER_MS) {
          handlersRef.current.onHardDrop();
          active = false; // single hard-drop ends the gesture
          if (longPressTimer) clearTimeout(longPressTimer);
        } else {
          const steps = Math.trunc(dy / SWIPE_THRESHOLD_PX);
          for (let i = 0; i < steps; i++) handlersRef.current.onSoftDrop();
          lastY = y;
        }
      }
      lastT = now;
      e.preventDefault();
    }

    function onEnd() {
      if (!active) return;
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
      const dt = performance.now() - startT;
      const totalDx = Math.abs(lastX - startX);
      const totalDy = Math.abs(lastY - startY);
      if (
        !didLongPress &&
        dt <= TAP_MAX_MS &&
        totalDx <= TAP_MAX_PX &&
        totalDy <= TAP_MAX_PX
      ) {
        handlersRef.current.onRotateCw();
      }
      active = false;
    }

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
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
