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
      
      // Check if it's the "not enabled" error
      if (errorMessage.includes("not enabled") || errorMessage.includes("Wallet funding")) {
        setError("Wallet funding is not enabled in Privy. Please use a Base Sepolia faucet to get testnet USDC.");
      } else {
        setError(errorMessage);
      }
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
                <div className="mt-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="flex items-start gap-2 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium mb-1">{error}</p>
                      {error.includes("not enabled") && (
                        <div className="mt-2 pt-2 border-t border-destructive/20">
                          <p className="text-xs text-destructive/80 mb-2">
                            <strong>Alternative ways to get testnet USDC:</strong>
                          </p>
                          <ol className="text-xs text-destructive/80 space-y-1 list-decimal list-inside">
                            <li>Use a Base Sepolia faucet:
                              <ul className="list-disc list-inside ml-4 mt-1 space-y-0.5">
                                <li>Base Sepolia Faucet: <a href="https://www.coinbase.com/faucets/base-ethereum-goerli-faucet" target="_blank" rel="noopener noreferrer" className="underline">Coinbase Base Sepolia Faucet</a></li>
                                <li>Or search for "Base Sepolia faucet" online</li>
                              </ul>
                            </li>
                            <li>Request testnet USDC from the faucet to your wallet address: <code className="bg-destructive/10 px-1 rounded">{wallets[0]?.address}</code></li>
                            <li>Ensure you're on Base Sepolia network (chainId: 84532)</li>
                            <li>You need at least $0.0001 USDC to fetch listings</li>
                          </ol>
                        </div>
                      )}
                    </div>
                  </div>
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
