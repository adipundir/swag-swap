"use client";

import { useFundWallet, useWallets } from "@privy-io/react-auth";
import { useState, useEffect, useCallback } from "react";
import { Wallet, AlertCircle, CheckCircle2, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import { createPublicClient, http, formatEther } from "viem";
import { baseSepolia } from "viem/chains";

export function FundWallet() {
  const { wallets } = useWallets();
  const { fundWallet } = useFundWallet();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [balance, setBalance] = useState<string | null>(null);
  const [balanceLoading, setBalanceLoading] = useState<boolean>(false);
  const [currentChainId, setCurrentChainId] = useState<number | null>(null);

  // Fetch balance and network info
  const fetchBalance = useCallback(async () => {
    if (!wallets[0]?.address) return;

    setBalanceLoading(true);
    try {
      // Create a public client for Base Sepolia
      const publicClient = createPublicClient({
        chain: baseSepolia,
        transport: http("https://sepolia.base.org"),
      });

      // Get balance on Base Sepolia
      const balanceWei = await publicClient.getBalance({
        address: wallets[0].address as `0x${string}`,
      });

      const balanceEth = formatEther(balanceWei);
      setBalance(balanceEth);

      // Try to get current chain ID from wallet
      try {
        const provider = await wallets[0].getEthereumProvider();
        if (provider) {
          const chainId = await provider.request({ method: "eth_chainId" });
          setCurrentChainId(parseInt(chainId as string, 16));
        }
      } catch (e) {
        // If we can't get chain ID, assume Base Sepolia (84532)
        setCurrentChainId(84532);
      }
    } catch (err) {
      console.error("Error fetching balance:", err);
      setBalance("0");
    } finally {
      setBalanceLoading(false);
    }
  }, [wallets]);

  useEffect(() => {
    if (wallets[0]?.address) {
      fetchBalance();
      // Refresh balance every 10 seconds
      const interval = setInterval(fetchBalance, 10000);
      return () => clearInterval(interval);
    }
  }, [wallets[0]?.address, fetchBalance]);

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
      // Refresh balance after funding
      setTimeout(fetchBalance, 2000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fund wallet";
      
      // Check if it's the "not enabled" error
      if (errorMessage.includes("not enabled") || errorMessage.includes("Wallet funding")) {
        setError("Wallet funding is not enabled in Privy. Please use a Base Sepolia faucet to get testnet ETH.");
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
                Need ETH for payments?
              </h3>
              <p className="text-sm text-muted-foreground max-w-xl">
                Add ETH to your wallet to pay for API access and fetch listings using x402.
              </p>
              
              {/* Balance Display */}
              <div className="mt-3 p-3 bg-muted/50 border border-border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Current Balance (Base Sepolia)</p>
                    <p className="text-lg font-semibold text-foreground">
                      {balanceLoading ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading...
                        </span>
                      ) : balance !== null ? (
                        `${parseFloat(balance).toFixed(6)} ETH`
                      ) : (
                        "—"
                      )}
                    </p>
                  </div>
                  <button
                    onClick={fetchBalance}
                    disabled={balanceLoading}
                    className="p-2 hover:bg-background rounded-md transition-colors disabled:opacity-50"
                    title="Refresh balance"
                  >
                    <RefreshCw className={`h-4 w-4 text-muted-foreground ${balanceLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                
                {/* Network Warning */}
                {currentChainId !== null && currentChainId !== 84532 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-500">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium mb-1">⚠️ Wrong Network Detected</p>
                        <p className="text-muted-foreground">
                          Your wallet is on chain ID {currentChainId}, but this app requires <strong>Base Sepolia (chain ID 84532)</strong>.
                        </p>
                        <p className="text-muted-foreground mt-1">
                          <strong>Important:</strong> If you claimed ETH from an <strong>Ethereum Sepolia</strong> faucet, that ETH is on a different network and won't work here. You need to claim from a <strong>Base Sepolia</strong> faucet instead.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Low Balance Warning */}
                {balance !== null && parseFloat(balance) < 0.0001 && parseFloat(balance) > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-500">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <p className="text-muted-foreground">
                        Balance is low. You need at least 0.0001 ETH to fetch listings.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {error && (
                <div className="mt-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="flex items-start gap-2 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium mb-1">{error}</p>
                      {error.includes("not enabled") && (
                        <div className="mt-2 pt-2 border-t border-destructive/20">
                          <p className="text-xs text-destructive/80 mb-2">
                            <strong>Alternative ways to get testnet ETH:</strong>
                          </p>
                          <ol className="text-xs text-destructive/80 space-y-1 list-decimal list-inside">
                            <li>
                              <strong>⚠️ IMPORTANT:</strong> Use a <strong>Base Sepolia</strong> faucet (NOT Ethereum Sepolia):
                              <ul className="list-disc list-inside ml-4 mt-1 space-y-0.5">
                                <li>Base Sepolia Faucet: <a href="https://www.coinbase.com/faucets/base-ethereum-goerli-faucet" target="_blank" rel="noopener noreferrer" className="underline">Coinbase Base Sepolia Faucet</a></li>
                                <li>Or search for "Base Sepolia faucet" online</li>
                                <li><strong>Do NOT use Ethereum Sepolia faucets</strong> - that ETH is on a different network!</li>
                              </ul>
                            </li>
                            <li>Request testnet ETH from the faucet to your wallet address: <code className="bg-destructive/10 px-1 rounded">{wallets[0]?.address}</code></li>
                            <li>Ensure you're on Base Sepolia network (chainId: 84532)</li>
                            <li>You need at least 0.0001 ETH to fetch listings</li>
                            <li>After claiming, wait a few seconds and click the refresh button above to see your updated balance</li>
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
