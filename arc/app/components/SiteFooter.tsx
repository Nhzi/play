import { LogoutButton } from "./LogoutButton";

export function SiteFooter() {
  return (
    <footer className="border-t border-[color:var(--border)] mt-auto">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 safe-pb flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="text-xs text-[color:var(--fg-muted)] flex flex-wrap items-center gap-2">
          <span>Built on Arc · testnet · USDC gas</span>
          <span className="opacity-60">·</span>
          <span className="font-mono">v0.2</span>
        </div>
        <LogoutButton />
      </div>
    </footer>
  );
}
