"use client";

import { useEffect, useRef, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  delayMs?: number;
  className?: string;
  /** Slide direction. Defaults to up. */
  from?: "up" | "down" | "left" | "right" | "none";
};

export function Reveal({
  children,
  delayMs = 0,
  className = "",
  from = "up",
}: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      el.classList.add("reveal--in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const target = e.target as HTMLElement;
            target.classList.add("reveal--in");
            io.unobserve(target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const style = delayMs ? { transitionDelay: `${delayMs}ms` } : undefined;
  const cls = `reveal reveal--${from} ${className}`.trim();

  return (
    <div ref={ref} className={cls} style={style}>
      {children}
    </div>
  );
}
