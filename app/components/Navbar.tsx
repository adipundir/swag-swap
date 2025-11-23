"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { Copy, LogOut, Wallet } from "lucide-react";

export function Navbar() {
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallets } = useWallets();

  const walletAddress = wallets[0]?.address || "";
  const truncatedAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : "";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 mx-auto">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
            S
          </div>
          <span className="font-bold text-xl tracking-tight">SwagSwap</span>
        </div>

        <div className="flex items-center gap-4">
          {!ready ? (
            <button
              disabled
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground h-9 px-4 py-2"
            >
              Loading...
            </button>
          ) : authenticated ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(walletAddress);
                  // Optional: Toast notification could go here
                }}
                className="group flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors bg-secondary/50 hover:bg-secondary px-3 py-1.5 rounded-md border border-transparent hover:border-border"
                title="Copy address"
              >
                <Wallet className="h-4 w-4" />
                <span className="font-mono">{truncatedAddress}</span>
                <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              
              <button
                onClick={logout}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={login}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-6 py-2 shadow-sm"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
