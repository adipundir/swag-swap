"use client";

import { useFundWallet, useWallets } from "@privy-io/react-auth";
import { useState } from "react";
import { Wallet, AlertCircle, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";

export function FundWallet() {
  const { wallets } = useWallets();
  const { fundWallet } = useFundWallet();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleFundWallet = async () => {
    if (!wallets[0]?.address) {
      setError("No wallet connected");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await fundWallet({ address: wallets[0].address });
      setSuccess(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fund wallet";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!wallets[0]?.address) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="bg-card border border-border/60 rounded-xl p-6 shadow-sm relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
          <div className="flex gap-4">
            <div className="mt-1 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
              <Wallet className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-foreground">
                Need USDC for payments?
              </h3>
              <p className="text-sm text-muted-foreground max-w-xl">
                Add USDC to your wallet to pay for API access and fetch listings using x402.
              </p>
              
              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive mt-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2 text-sm text-green-600 mt-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Funding initiated successfully!
                </div>
              )}
            </div>
          </div>

          <div className="flex shrink-0">
            <button
              onClick={handleFundWallet}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full md:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Opening...
                </>
              ) : (
                <>
                  Fund Wallet
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
