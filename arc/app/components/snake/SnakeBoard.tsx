"use client";

import { useEffect, useRef } from "react";
import type { SnakeState } from "@/lib/snake/board";
import type { Theme } from "@/lib/snake/types";

type Props = {
  s: SnakeState;
  theme: Theme;
  /** Canvas CSS size (px). Cells are drawn at size / s.size. */
  pixelSize: number;
};

export function SnakeBoard({ s, theme, pixelSize }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(2, typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1);
    const cellPx = pixelSize / s.size;

    // Resize backing store for crisp rendering.
    if (canvas.width !== pixelSize * dpr) {
      canvas.width = pixelSize * dpr;
      canvas.height = pixelSize * dpr;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;

    // Background
    const styles = getComputedStyle(canvas);
    const accent1 = styles.getPropertyValue("--accent-1").trim() || "#ff6b6b";
    const accent2 = styles.getPropertyValue("--accent-2").trim() || "#ff8a75";
    const accent3 = styles.getPropertyValue("--accent-3").trim() || "#ffb088";
    const bg = styles.getPropertyValue("--bg-elev").trim() || "#1f1731";
    const border = styles.getPropertyValue("--border").trim() || "#3a2c5a";

    if (theme === "classic") {
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, pixelSize, pixelSize);
      // subtle grid for vibe
      ctx.strokeStyle = "#062b15";
      ctx.lineWidth = 1;
      for (let i = 1; i < s.size; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellPx, 0);
        ctx.lineTo(i * cellPx, pixelSize);
        ctx.moveTo(0, i * cellPx);
        ctx.lineTo(pixelSize, i * cellPx);
        ctx.stroke();
      }
    } else {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, pixelSize, pixelSize);
      ctx.strokeStyle = border;
      ctx.lineWidth = 1;
      for (let i = 1; i < s.size; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellPx, 0);
        ctx.lineTo(i * cellPx, pixelSize);
        ctx.moveTo(0, i * cellPx);
        ctx.lineTo(pixelSize, i * cellPx);
        ctx.stroke();
      }
    }

    // Snake
    for (let i = 0; i < s.snake.length; i++) {
      const seg = s.snake[i];
      if (theme === "classic") {
        ctx.fillStyle = i === 0 ? "#aaffaa" : "#00ff66";
      } else {
        // Head uses accent-1, body fades toward accent-3.
        if (i === 0) ctx.fillStyle = accent1;
        else if (i < s.snake.length / 2) ctx.fillStyle = accent2;
        else ctx.fillStyle = accent3;
      }
      const pad = Math.max(1, Math.floor(cellPx * 0.08));
      ctx.fillRect(
        seg.x * cellPx + pad,
        seg.y * cellPx + pad,
        cellPx - pad * 2,
        cellPx - pad * 2,
      );
    }

    // Food
    if (theme === "classic") {
      ctx.fillStyle = "#ffffff";
    } else {
      const grad = ctx.createRadialGradient(
        s.food.x * cellPx + cellPx / 2,
        s.food.y * cellPx + cellPx / 2,
        1,
        s.food.x * cellPx + cellPx / 2,
        s.food.y * cellPx + cellPx / 2,
        cellPx,
      );
      grad.addColorStop(0, accent1);
      grad.addColorStop(1, accent3);
      ctx.fillStyle = grad;
    }
    const fp = Math.max(2, Math.floor(cellPx * 0.18));
    ctx.beginPath();
    ctx.arc(
      s.food.x * cellPx + cellPx / 2,
      s.food.y * cellPx + cellPx / 2,
      cellPx / 2 - fp,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }, [s, theme, pixelSize]);

  return (
    <canvas
      ref={canvasRef}
      width={pixelSize}
      height={pixelSize}
      style={{ width: pixelSize, height: pixelSize }}
      className={
        "rounded-xl block touch-none select-none " +
        (theme === "classic"
          ? "border border-[#0b3b22]"
          : "border border-[color:var(--border)]")
      }
      aria-label="Snake game board"
    />
  );
}
