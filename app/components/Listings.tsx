"use client";

import { usePrivy, useWallets, useX402Fetch } from "@privy-io/react-auth";
import { useState } from "react";
import { Search, DollarSign, AlertCircle, Loader2, ShoppingBag, ArrowRight, RefreshCw } from "lucide-react";
import { createWalletClient, custom, Chain } from "viem";
import { baseSepolia } from "viem/chains";

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: string;
  imageUrl?: string;
  seller: string;
  createdAt: string;
}

export function Listings() {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const { wrapFetchWithPayment } = useX402Fetch();
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiUrl, setApiUrl] = useState<string>(
    process.env.NEXT_PUBLIC_LISTINGS_API_URL || "/api/listings"
  );
  const [maxPayment, setMaxPayment] = useState<string>("1000000"); // 1 USDC default
  const [switchingNetwork, setSwitchingNetwork] = useState(false);

  const handleSwitchToBaseSepolia = async () => {
    if (!wallets[0]?.address) {
      setError("No wallet connected. Please login first.");
      return;
    }

    setSwitchingNetwork(true);
    setError(null);

    try {
      const wallet = wallets[0];
      
      // Base Sepolia chain configuration
      const baseSepoliaChain = {
        chainId: "0x14A34", // 84532 in hex (0x14A34)
        chainName: "Base Sepolia",
        nativeCurrency: {
          name: "ETH",
          symbol: "ETH",
          decimals: 18,
        },
        rpcUrls: ["https://sepolia.base.org"],
        blockExplorerUrls: ["https://sepolia-explorer.base.org"],
      };

      // Try to get provider from wallet or window.ethereum
      let provider: any = null;
      
      if ((wallet as any).provider) {
        provider = (wallet as any).provider;
      } else if (typeof window !== "undefined" && (window as any).ethereum) {
        provider = (window as any).ethereum;
      }

      if (!provider) {
        // For Privy embedded wallets, try using viem with the wallet's client
        try {
          const walletClient = createWalletClient({
            chain: baseSepolia,
            transport: custom((wallet as any).provider || (window as any).ethereum),
          });
          await walletClient.switchChain({ id: baseSepolia.id });
          setSwitchingNetwork(false);
          return;
        } catch (viemError) {
          throw new Error("Unable to access wallet provider. Please switch networks manually in your wallet.");
        }
      }

      // Try to switch chain first
      try {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: baseSepoliaChain.chainId }],
        });
      } catch (switchError: any) {
        // If chain doesn't exist (error code 4902), add it
        if (switchError.code === 4902 || switchError.code === -32603) {
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [baseSepoliaChain],
          });
        } else {
          throw switchError;
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to switch network";
      setError(`Network switch failed: ${errorMessage}. Please switch manually in your wallet.`);
    } finally {
      setSwitchingNetwork(false);
    }
  };

  const handleFetchListings = async () => {
    if (!apiUrl) {
      alert("Please enter an API URL");
      return;
    }

    if (!wallets[0]?.address) {
      setError("No wallet connected. Please login first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Wrap fetch with x402 payment support
      const fetchWithPayment = wrapFetchWithPayment({
        walletAddress: wallets[0].address,
        fetch,
        maxValue: maxPayment ? BigInt(maxPayment) : undefined,
      });

      // Automatically handles 402 Payment Required
      const response = await fetchWithPayment(apiUrl);

      if (!response.ok) {
        // Check if it's still a payment required error
        if (response.status === 402) {
          throw new Error("Payment failed: Unable to process x402 payment. Please ensure you have USDC balance on Base Sepolia and try again.");
        }
        throw new Error(`Failed to fetch listings: ${response.statusText} (${response.status})`);
      }

      const data = await response.json();
      const listingsData = Array.isArray(data) ? data : data.listings || [];
      setListings(listingsData);
    } catch (err) {
      let errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      
      // Improve error messages for common issues
      if (errorMessage.includes("chainId")) {
        if (errorMessage.includes("84532")) {
          errorMessage = "Network mismatch: Please switch your wallet to Base Sepolia testnet. The app requires Base Sepolia (chainId 84532) for x402 payments.";
        } else {
          errorMessage = `Network mismatch: ${errorMessage}. Please ensure your wallet is connected to Base Sepolia testnet.`;
        }
      } else if (errorMessage.includes("Payment Required") || errorMessage.includes("Payment failed")) {
        errorMessage = `${errorMessage}\n\nPossible causes:\n• Insufficient USDC balance (need at least $0.0001 USDC)\n• Payment transaction was rejected\n• Network not set to Base Sepolia\n\nTry funding your wallet with USDC first.`;
      } else if (errorMessage.includes("insufficient") || errorMessage.includes("balance")) {
        errorMessage = `Insufficient balance: ${errorMessage}\n\nPlease fund your wallet with USDC on Base Sepolia testnet. You need at least $0.0001 USDC to fetch listings.`;
      }
      
      setError(errorMessage);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="w-full p-8 border border-dashed rounded-lg bg-muted/30 flex flex-col items-center justify-center text-center">
        <div className="bg-background p-3 rounded-full shadow-sm mb-4">
          <ShoppingBag className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">Login Required</h3>
        <p className="text-muted-foreground max-w-sm">
          Please connect your wallet to view and purchase exclusive listings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Fetch Control Panel */}
      <div className="bg-card border border-border/60 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Fetch Listings
            </h2>
            <p className="text-sm text-muted-foreground">
              Access listings via x402 micro-payments
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="px-3 py-1.5 bg-primary/10 text-primary rounded-md text-xs font-medium">
              Base Sepolia Required
            </div>
            <button
              onClick={handleSwitchToBaseSepolia}
              disabled={switchingNetwork || !authenticated}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {switchingNetwork ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Switching...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3 h-3" />
                  Switch Network
                </>
              )}
            </button>
          </div>
        </div>
        
        <div className="grid md:grid-cols-[2fr_1fr_auto] gap-4 items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              API URL
            </label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="/api/listings"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Max Payment
            </label>
            <div className="relative">
              <input
                type="text"
                value={maxPayment}
                onChange={(e) => setMaxPayment(e.target.value)}
                placeholder="1000000"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-16"
              />
              <span className="absolute right-3 top-3 text-xs text-muted-foreground pointer-events-none">
                Units
              </span>
            </div>
          </div>

          <button
            onClick={handleFetchListings}
            disabled={loading || !apiUrl}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Fetch
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </button>
        </div>
        
        <div className="mt-2 text-[10px] text-muted-foreground text-right">
          1,000,000 units = 1 USDC
        </div>

        {error && (
          <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg">
            <div className="flex items-start gap-3 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium mb-1 whitespace-pre-line">{error}</p>
                {error.includes("Network mismatch") && (
                  <div className="mt-3 pt-3 border-t border-destructive/20">
                    <p className="text-xs text-destructive/80 mb-2">
                      <strong>How to switch networks:</strong>
                    </p>
                    <ol className="text-xs text-destructive/80 space-y-1 list-decimal list-inside">
                      <li>Open your wallet extension (MetaMask, Coinbase Wallet, etc.)</li>
                      <li>Click on the network dropdown at the top</li>
                      <li>Select "Base Sepolia" testnet</li>
                      <li>If Base Sepolia is not listed, add it manually:
                        <ul className="list-disc list-inside ml-4 mt-1 space-y-0.5">
                          <li>Network Name: Base Sepolia</li>
                          <li>RPC URL: https://sepolia.base.org</li>
                          <li>Chain ID: 84532</li>
                          <li>Currency Symbol: ETH</li>
                        </ul>
                      </li>
                      <li>Try fetching listings again</li>
                    </ol>
                  </div>
                )}
                {(error.includes("Payment Required") || error.includes("Payment failed") || error.includes("Insufficient balance")) && (
                  <div className="mt-3 pt-3 border-t border-destructive/20">
                    <p className="text-xs text-destructive/80 mb-2">
                      <strong>To fix payment issues:</strong>
                    </p>
                    <ol className="text-xs text-destructive/80 space-y-1 list-decimal list-inside">
                      <li>Ensure your wallet is on Base Sepolia testnet</li>
                      <li>Fund your wallet with USDC (at least $0.0001 USDC)</li>
                      <li>Use the "Fund Wallet" button above to add testnet USDC</li>
                      <li>Approve the payment transaction when prompted</li>
                      <li>Try fetching listings again</li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Grid */}
      {listings.length > 0 && (
        <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold tracking-tight">
              Available Listings
            </h3>
            <span className="text-sm text-muted-foreground bg-secondary px-2.5 py-0.5 rounded-full">
              {listings.length} items
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      )}

      {!loading && listings.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed rounded-xl bg-muted/30">
          <div className="bg-background p-4 rounded-full shadow-sm mb-4">
            <ShoppingBag className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No listings yet</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Enter an API URL above and authorize the payment to reveal exclusive hackathon merchandise.
          </p>
        </div>
      )}
    </div>
  );
}

function ListingCard({ listing }: { listing: Listing }) {
  return (
    <div className="group relative bg-card rounded-xl border border-border/60 overflow-hidden hover:shadow-md transition-all duration-300 hover:border-border">
      <div className="aspect-[4/3] relative overflow-hidden bg-muted">
        {listing.imageUrl ? (
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary/50">
            <ShoppingBag className="w-10 h-10 text-muted-foreground/20" />
          </div>
        )}
        <div className="absolute top-2 right-2">
           <span className="inline-flex items-center rounded-md bg-background/90 backdrop-blur px-2 py-1 text-xs font-medium ring-1 ring-inset ring-gray-500/10 shadow-sm">
             {listing.price}
           </span>
        </div>
      </div>
      
      <div className="p-5 space-y-3">
        <div>
          <h4 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {listing.title}
          </h4>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {listing.description}
          </p>
        </div>
        
        <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Seller</span>
          <span className="font-mono bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground">
            {listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}
          </span>
        </div>
      </div>
    </div>
  );
}
