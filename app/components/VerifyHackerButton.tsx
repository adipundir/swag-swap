"use client";

import { useState, useEffect } from "react";
import { useWallets, usePrivy } from "@privy-io/react-auth";
import { ShieldCheck, Loader2, CheckCircle2, AlertCircle, Sparkles, Info } from "lucide-react";
import confetti from "canvas-confetti";

interface VerificationStatus {
  isVerified: boolean;
  verifiedAt?: string;
  loading: boolean;
}

export function VerifyHackerButton() {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  
  const [status, setStatus] = useState<VerificationStatus>({
    isVerified: false,
    loading: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [accessToken, setAccessToken] = useState<string>("");
  const [showTokenInput, setShowTokenInput] = useState(false);

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
        `/api/verify/hacker?address=${walletAddress}`
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

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  /**
   * Main verification flow using vlayer Server-Side Web Proofs
   * This uses the Web Prover Server (REST API) for server-side proving
   * Eligible for "Best Server-Side Proving dApp" track ($3,000)
   */
  const handleVerify = async () => {
    if (!walletAddress) {
      setError("Please connect your wallet first");
      return;
    }

    if (!accessToken) {
      setError("Please provide your ETHGlobal access token");
      setShowTokenInput(true);
      return;
    }

    // Validate JWT format
    if (!accessToken.trim().startsWith("eyJ")) {
      setError("Invalid token format. Access token should start with 'eyJ'");
      return;
    }

    setIsVerifying(true);
    setError(null);
    setStatus((prev) => ({ ...prev, loading: true }));

    try {
      console.log("🚀 Starting server-side proof generation...");

      // Step 1: Generate Web Proof on the server using vlayer's Web Prover Server
      console.log("📝 Requesting proof generation from server...");
      
      const proveResponse = await fetch("/api/verify/hacker/prove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessToken: accessToken.trim(),
          walletAddress,
        }),
      });

      const proveData = await proveResponse.json();

      if (!proveResponse.ok || !proveData.success) {
        throw new Error(proveData.error || "Failed to generate proof");
      }

      console.log("✅ Proof generated successfully:", {
        timestamp: proveData.proof.timestamp,
        confirmationText: proveData.proof.confirmationText,
      });

      // Step 2: Verify the proof
      console.log("🔍 Verifying proof...");
      
      const verifyResponse = await fetch("/api/verify/hacker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          proof: proveData.proof,
          walletAddress,
        }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok || !verifyData.success) {
        throw new Error(verifyData.error || "Verification failed");
      }

      // Step 3: Success! Update UI and trigger confetti
      setStatus({
        isVerified: true,
        verifiedAt: verifyData.verification.verifiedAt,
        loading: false,
      });

      setShowTokenInput(false);
      triggerConfetti();

      console.log("✅ Verification complete:", verifyData);
    } catch (err) {
      console.error("Verification error:", err);
      
      let errorMessage = "Failed to verify ETHGlobal status";
      
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setStatus((prev) => ({ ...prev, loading: false }));
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
          Login to verify your ETHGlobal status
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
              ✅ Verified Hacker
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              You are a confirmed ETHGlobal participant!
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

  // Verification button
  return (
    <div className="space-y-4">
      <div className="p-6 border border-border/60 rounded-lg bg-card">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Proof of Hacker</h3>
            <p className="text-sm text-muted-foreground">
              Verify you're confirmed for ETHGlobal Buenos Aires using vlayer's Server-Side Web Proofs.
              Checks for "You are fully confirmed to attend this event!" on your event page.
            </p>
          </div>
        </div>

        {/* Access Token Input Section */}
        <div className="mb-4 space-y-2">
          <button
            onClick={() => setShowTokenInput(!showTokenInput)}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <Info className="w-4 h-4" />
            {showTokenInput ? "Hide" : "Show"} access token input
          </button>
          
          {showTokenInput && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                ETHGlobal Access Token (JWT)
              </label>
              <textarea
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="Paste your ETHGlobal access token here... (starts with eyJ)"
                className="w-full min-h-[80px] px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-mono"
              />
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>How to get your access token:</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Open <strong>ethglobal.com/events/buenosaires/home</strong> and log in</li>
                  <li>Make sure you see: <strong>"You are fully confirmed to attend this event!"</strong></li>
                  <li>Press <strong>F12</strong> to open DevTools</li>
                  <li>Go to <strong>Application</strong> tab</li>
                  <li>Click <strong>Local Storage</strong> → <strong>ethglobal.com</strong></li>
                  <li>Find the key named: <code className="bg-muted px-1 rounded font-semibold">ethglobal_access_token</code></li>
                  <li>Copy the entire value (starts with <code className="bg-muted px-1">eyJ...</code>)</li>
                  <li>Paste it here!</li>
                </ol>
                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    <strong>Note:</strong> You must be registered AND confirmed for ETHGlobal Buenos Aires for verification to work.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleVerify}
          disabled={isVerifying || status.loading}
          className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          {isVerifying || status.loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Server-Side Proof...
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4 mr-2" />
              Verify ETHGlobal Status
            </>
          )}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            <strong>🏆 Server-Side Proving:</strong> This app uses vlayer's Web Prover Server
            (REST API) for server-side proof generation and verification, making it eligible
            for the "Best Server-Side Proving dApp" track ($3,000). The proof is generated
            using the TLSNotary (TLSN) protocol without exposing your credentials.
          </p>
        </div>
      </div>
    </div>
  );
}


