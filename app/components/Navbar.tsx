"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { Copy, LogOut, Wallet, ShieldCheck, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { IDKitWidget, ISuccessResult, VerificationLevel } from "@worldcoin/idkit";
import confetti from "canvas-confetti";

export function Navbar() {
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const walletAddress = wallets[0]?.address || "";
  const truncatedAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : "";

  // Log environment on mount
  useEffect(() => {
    console.log("🔧 NAVBAR ENV CHECK:");
    console.log("   NEXT_PUBLIC_WORLD_APP_ID:", process.env.NEXT_PUBLIC_WORLD_APP_ID ? "✅ SET" : "❌ NOT SET");
    if (process.env.NEXT_PUBLIC_WORLD_APP_ID) {
      console.log("   Value:", process.env.NEXT_PUBLIC_WORLD_APP_ID);
    }
  }, []);

  // Check verification status
  useEffect(() => {
    if (walletAddress && authenticated) {
      checkVerificationStatus();
    }
  }, [walletAddress, authenticated]);

  const checkVerificationStatus = async () => {
    if (!walletAddress) return;
    setCheckingStatus(true);
    try {
      const response = await fetch(`/api/verify/hacker/worldid?address=${walletAddress}`);
      const data = await response.json();
      if (data.success && data.isVerified) {
        setIsVerified(true);
      }
    } catch (err) {
      console.error("Error checking verification:", err);
    } finally {
      setCheckingStatus(false);
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      zIndex: 9999,
    });
  };

  const handleVerify = async (result: ISuccessResult) => {
    if (!walletAddress) return;
    
    console.log("🎯 CLIENT: Starting verification...");
    console.log("   Wallet address:", walletAddress);
    console.log("   App ID available:", !!process.env.NEXT_PUBLIC_WORLD_APP_ID);
    console.log("   App ID value:", process.env.NEXT_PUBLIC_WORLD_APP_ID?.slice(0, 20) + "...");
    console.log("   Proof received:", {
      nullifier_hash: result.nullifier_hash?.slice(0, 20) + "...",
      merkle_root: result.merkle_root?.slice(0, 20) + "...",
      verification_level: result.verification_level,
      proof_length: result.proof?.length
    });
    
    setIsVerifying(true);
    try {
      const payload = {
        proof: result.proof,
        merkle_root: result.merkle_root,
        nullifier_hash: result.nullifier_hash,
        verification_level: result.verification_level,
        walletAddress,
      };
      
      console.log("📤 CLIENT: Sending to server...");
      
      const response = await fetch("/api/verify/hacker/worldid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      console.log("📥 CLIENT: Server response status:", response.status);
      
      const data = await response.json();
      console.log("📥 CLIENT: Server response data:", data);
      
      if (data.success) {
        console.log("✅ CLIENT: Verification successful!");
        setIsVerified(true);
        triggerConfetti();
      } else {
        console.error("❌ CLIENT: Verification failed:", data.error);
      }
    } catch (err) {
      console.error("❌ CLIENT: Verification error:", err);
    } finally {
      setIsVerifying(false);
    }
  };

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
              {/* World ID Verification Button */}
              {checkingStatus ? null : !isVerified ? (
                process.env.NEXT_PUBLIC_WORLD_APP_ID ? (
                  <IDKitWidget
                    app_id={process.env.NEXT_PUBLIC_WORLD_APP_ID as `app_${string}`}
                    action="humanhood"
                    verification_level={VerificationLevel.Orb}
                    handleVerify={handleVerify}
                    onSuccess={() => console.log("World ID success")}
                  >
                    {({ open }) => (
                      <button
                        onClick={open}
                        disabled={isVerifying}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
                        title="Verify you're human with World ID"
                      >
                        {isVerifying ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            Verify Human
                          </>
                        )}
                      </button>
                    )}
                  </IDKitWidget>
                ) : null
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-md">
                  <ShieldCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    Verified Human
                  </span>
                </div>
              )}

              <button
                onClick={() => {
                  navigator.clipboard.writeText(walletAddress);
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
