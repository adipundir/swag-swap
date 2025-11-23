"use client";

import { useState, useEffect } from "react";
import { useWallets, usePrivy } from "@privy-io/react-auth";
import { IDKitWidget, ISuccessResult, VerificationLevel } from "@worldcoin/idkit";
import { ShieldCheck, Loader2, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

interface VerificationStatus {
  isVerified: boolean;
  verifiedAt?: string;
  loading: boolean;
}

/**
 * World ID Verification Component
 * 
 * Uses World ID for human verification with off-chain proving
 * Simple, reliable, and widely adopted
 */
export function VerifyHackerButtonWorldID() {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  
  const [status, setStatus] = useState<VerificationStatus>({
    isVerified: false,
    loading: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const walletAddress = wallets[0]?.address;

  // Check verification status on mount
  useEffect(() => {
    if (walletAddress) {
      checkVerificationStatus();
    }
  }, [walletAddress]);

  /**
   * Check if the user is already verified
   */
  const checkVerificationStatus = async () => {
    if (!walletAddress) return;

    setStatus((prev) => ({ ...prev, loading: true }));

    try {
      const response = await fetch(
        `/api/verify/hacker/worldid?address=${walletAddress}`
      );
      const data = await response.json();

      if (data.success && data.isVerified) {
        setStatus({
          isVerified: true,
          verifiedAt: data.verifiedAt,
          loading: false,
        });
      } else {
        setStatus({
          isVerified: false,
          loading: false,
        });
      }
    } catch (err) {
      console.error("Error checking verification status:", err);
      setStatus((prev) => ({ ...prev, loading: false }));
    }
  };

  /**
   * Trigger confetti animation
   */
  const triggerConfetti = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  };

  /**
   * Handle successful World ID verification
   */
  const handleVerifySuccess = async (result: ISuccessResult) => {
    if (!walletAddress) {
      setError("Please connect your wallet first");
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      console.log("✅ World ID verification successful:", result);

      // Send the proof to our server for verification
      const response = await fetch("/api/verify/hacker/worldid", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          proof: result.proof,
          merkle_root: result.merkle_root,
          nullifier_hash: result.nullifier_hash,
          verification_level: result.verification_level,
          walletAddress,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Verification failed");
      }

      // Success!
      setStatus({
        isVerified: true,
        verifiedAt: data.verification.verifiedAt,
        loading: false,
      });

      triggerConfetti();
      console.log("✅ Verification complete:", data);
    } catch (err) {
      console.error("Verification error:", err);
      
      let errorMessage = "Failed to verify with World ID";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  // Not authenticated
  if (!authenticated) {
    return (
      <div className="p-6 border border-dashed rounded-lg bg-muted/30 text-center">
        <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Login to verify your human status
        </p>
      </div>
    );
  }

  // Already verified
  if (status.isVerified) {
    return (
      <div className="p-6 border-2 border-green-500/50 rounded-lg bg-green-50 dark:bg-green-900/20">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
              ✅ Verified Human
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              You've been verified using World ID!
            </p>
            {status.verifiedAt && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                Verified on {new Date(status.verifiedAt).toLocaleDateString()}
              </p>
            )}
          </div>
          <Sparkles className="w-5 h-5 text-green-500" />
        </div>
      </div>
    );
  }

  // Verification button with World ID widget
  return (
    <div className="space-y-4">
      <div className="p-6 border border-border/60 rounded-lg bg-card">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Proof of Humanity</h3>
            <p className="text-sm text-muted-foreground">
              Verify you're a real human using World ID. Quick, secure, and privacy-preserving.
            </p>
          </div>
        </div>

        <IDKitWidget
          app_id={(process.env.NEXT_PUBLIC_WORLD_APP_ID || "app_staging_0000000000000000000000000000") as `app_${string}`}
          action="verify-hacker"
          verification_level={VerificationLevel.Orb}
          handleVerify={handleVerifySuccess}
          onSuccess={() => {
            console.log("World ID widget success");
          }}
        >
          {({ open }) => (
            <button
              onClick={open}
              disabled={isVerifying || status.loading}
              className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              {isVerifying || status.loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Verify with World ID
                </>
              )}
            </button>
          )}
        </IDKitWidget>

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">
            Proof verified off-chain • Privacy-preserving • No personal data stored
          </p>
        </div>
      </div>
    </div>
  );
}

