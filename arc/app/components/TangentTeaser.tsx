"use client";

import { useEffect, useState } from "react";

const PROMPTS: { input: string; parsed: ParsedTx }[] = [
  {
    input: "Send 10 USDC to alex.eth",
    parsed: {
      action: "Transfer",
      token: "USDC",
      amount: "10.00",
      to: "alex.eth",
      network: "Arc",
    },
  },
  {
    input: "Swap 50 USDC for ETH at best rate",
    parsed: {
      action: "Swap",
      token: "USDC → ETH",
      amount: "50.00",
      to: "Best route",
      network: "Arc",
    },
  },
  {
    input: "Bridge 25 USDC from Arc to Base",
    parsed: {
      action: "Bridge",
      token: "USDC",
      amount: "25.00",
      to: "Base",
      network: "Arc",
    },
  },
  {
    input: "What's my Play high score worth?",
    parsed: {
      action: "Query",
      token: "—",
      amount: "—",
      to: "Portfolio",
      network: "Arc",
    },
  },
];

type ParsedTx = {
  action: string;
  token: string;
  amount: string;
  to: string;
  network: string;
};

export function TangentTeaser() {
  // `i` advances on every prompt; `parsedI` only catches up when parsing
  // completes — so during typing the card still shows the previous result
  // instead of spoiling the new one.
  const [i, setI] = useState(0);
  const [parsedI, setParsedI] = useState(0);
  const [typed, setTyped] = useState("");
  const [stage, setStage] = useState<"typing" | "parsing" | "hold">("typing");

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setTyped(PROMPTS[i].input);
      setStage("hold");
      setParsedI(i);
      return;
    }
    const target = PROMPTS[i].input;
    if (stage === "typing") {
      if (typed.length < target.length) {
        const t = setTimeout(
          () => setTyped(target.slice(0, typed.length + 1)),
          30 + Math.random() * 40
        );
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setStage("parsing"), 500);
      return () => clearTimeout(t);
    }
    if (stage === "parsing") {
      const t = setTimeout(() => {
        setParsedI(i);
        setStage("hold");
      }, 700);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setStage("typing");
      setTyped("");
      setI((n) => (n + 1) % PROMPTS.length);
    }, 2200);
    return () => clearTimeout(t);
  }, [i, stage, typed]);

  const parsed = PROMPTS[parsedI].parsed;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[color:var(--border)] bg-[color:var(--bg-elev)] p-6 sm:p-8 shadow-[var(--shadow)]">
      <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full blur-3xl opacity-40 bg-accent-gradient" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full blur-3xl opacity-30 bg-accent-gradient" />

      <div className="relative grid gap-8 lg:grid-cols-2 items-center">
        <div>
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--fg-muted)] mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent-2)] pulse-dot" />
            Coming next · Tangent Wallet
          </span>
          <h3 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
            Talk to your wallet.{" "}
            <span className="text-accent-gradient">It listens.</span>
          </h3>
          <p className="mt-4 text-[color:var(--fg-muted)] leading-relaxed max-w-md">
            Play is the front door. <strong>Tangent Wallet</strong> is the room
            it opens into — a consumer wallet where transfers, swaps, and
            bridges happen through plain language. Type what you want, confirm
            once, done. Your Play profile carries over.
          </p>
          <ul className="mt-6 space-y-2 text-sm">
            <FeatureRow>Natural-language transfers, swaps, and bridges</FeatureRow>
            <FeatureRow>Conversational balance and portfolio queries</FeatureRow>
            <FeatureRow>AI-assisted safety checks before every signature</FeatureRow>
            <FeatureRow>One identity across Play, Tangent, and beyond</FeatureRow>
          </ul>
        </div>

        <div className="relative">
          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg)] p-4 sm:p-5 shadow-[var(--shadow)] tangent-card">
            <div className="flex items-center gap-2 mb-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--accent-1)]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--accent-2)]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--accent-3)]" />
              <span className="ml-auto text-[10px] uppercase tracking-[0.18em] text-[color:var(--fg-muted)]">
                tangent · preview
              </span>
            </div>

            <div className="rounded-xl bg-[color:var(--bg-muted)] px-3 py-2.5 text-sm font-mono">
              <span className="text-[color:var(--fg-muted)] mr-2">›</span>
              <span>{typed}</span>
              <span className="caret">|</span>
            </div>

            <div className="mt-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-elev)] p-3 text-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--fg-muted)]">
                  {stage === "parsing" ? "Parsing…" : "Parsed intent"}
                </span>
                <span
                  className={
                    "h-1.5 w-1.5 rounded-full " +
                    (stage === "parsing"
                      ? "bg-[color:var(--accent-2)] pulse-dot"
                      : "bg-[color:var(--accent-3)]")
                  }
                />
              </div>
              <div
                key={parsedI}
                className={
                  "grid grid-cols-2 gap-2 " +
                  (stage === "parsing" ? "tangent-parsed--out" : "tangent-parsed--in")
                }
              >
                <ParsedRow k="Action" v={parsed.action} />
                <ParsedRow k="Token" v={parsed.token} />
                <ParsedRow k="Amount" v={parsed.amount} />
                <ParsedRow k="To" v={parsed.to} />
                <ParsedRow k="Network" v={parsed.network} />
                <div className="col-span-1 flex items-end justify-end">
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-accent-gradient text-white">
                    Confirm
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ParsedRow({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-[color:var(--fg-muted)]">
        {k}
      </div>
      <div className="font-mono text-sm text-[color:var(--fg)]">{v}</div>
    </div>
  );
}

function FeatureRow({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 group" data-hover>
      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-accent-gradient transition group-hover:scale-150" />
      <span className="text-[color:var(--fg)] group-hover:text-[color:var(--accent-2)] transition">
        {children}
      </span>
    </li>
  );
}
