"use client";

// PRIVY with x402 support
import { usePrivy, useWallets, useX402Fetch } from "@privy-io/react-auth";
import { useState, useEffect } from "react";
import { Search, DollarSign, AlertCircle, Loader2, ShoppingBag, ArrowRight, RefreshCw } from "lucide-react";
import { ListingDetailModal } from "./ListingDetailModal";

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
  // PRIVY with x402 support
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const { wrapFetchWithPayment } = useX402Fetch();
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiUrl, setApiUrl] = useState<string>(
    process.env.NEXT_PUBLIC_LISTINGS_API_URL || "/api/listings"
  );
  const [maxPayment, setMaxPayment] = useState<string>("1000000"); // 1 USDC (6 decimals)
  const [switchingNetwork, setSwitchingNetwork] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Prefer embedded wallet over external wallets like MetaMask
  const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === "privy");
  const activeWallet = embeddedWallet || wallets[0];
  
  const walletAddress = activeWallet?.address;
  const chainId = activeWallet?.chainId;

  // No useEffect needed - Privy handles wallet connection

  const handleSwitchToBaseSepolia = async () => {
    if (!walletAddress) {
      setError("No wallet connected. Please login first.");
      return;
    }

    setSwitchingNetwork(true);
    setError(null);

    try {
      await activeWallet?.switchChain(84532); // Base Sepolia chain ID
      setError(null);
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

    if (!walletAddress) {
      setError("No wallet connected. Please login first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Verify network before attempting payment
      // Base Sepolia chain ID is 84532
      if (chainId !== "eip155:84532") {
        throw new Error(
          `Network mismatch: Your wallet is on ${chainId}, but Base Sepolia (chain ID 84532) is required for x402 payments. Please use the "Switch Network" button above.`
        );
      }

      console.log("Making x402 request to:", apiUrl);
      console.log("Wallet address:", walletAddress);
      console.log("Current chain:", chainId);
      console.log("Max payment (USDC wei):", maxPayment);
      
      // Use Privy's x402 fetch - automatically handles 402 payment flow
      const fetchWithPayment = wrapFetchWithPayment({
        walletAddress,
        fetch,
        maxValue: BigInt(maxPayment), // 1 USDC = 1000000 wei (6 decimals)
      });
      
      // Make request - Privy handles 402 responses automatically
      const response = await fetchWithPayment(apiUrl, {
        method: "GET",
      });
      
      console.log("Response received:", {
        status: response.status,
        ok: response.ok,
      });

      if (!response.ok) {
        if (response.status === 402) {
          const errorText = await response.text().catch(() => "");
          console.error("402 Payment Required - Payment processing failed");
          console.error("Response text:", errorText.substring(0, 500));
          
          let detailedError = "Payment failed: Unable to process x402 payment.\n\n";
          detailedError += "⚠️ Make sure you have USDC on Base Sepolia.\n\n";
          detailedError += "x402 payments require USDC (stablecoin), not ETH.\n\n";
          detailedError += "To get USDC on Base Sepolia:\n";
          detailedError += "1. Get testnet USDC from Circle's faucet: https://faucet.circle.com/\n";
          detailedError += "2. Use Privy's 'Fund Wallet' feature\n";
          detailedError += "3. Bridge USDC from another network\n\n";
          detailedError += `Required amount: ~${maxPayment} USDC wei (${Number(maxPayment) / 1000000} USDC)\n`;
          
          throw new Error(detailedError);
        }
        const errorText = await response.text().catch(() => "");
        console.error("API Error:", response.status, errorText);
        throw new Error(`Failed to fetch listings: ${response.statusText} (${response.status})`);
      }

      const data = await response.json();
      console.log("API Response data:", data);
      
      // Handle response format
      let listingsData: Listing[] = [];
      if (Array.isArray(data)) {
        listingsData = data;
      } else if (data.listings && Array.isArray(data.listings)) {
        listingsData = data.listings;
      } else if (data.success && data.listings && Array.isArray(data.listings)) {
        listingsData = data.listings;
      }
      
      console.log("✅ Fetched listings count:", listingsData.length);
      setListings(listingsData);
      
      if (listingsData.length === 0) {
        console.warn("No listings found in response");
      }
    } catch (err) {
      // User rejected - don't show error
      if (err instanceof Error && err.message.includes("rejected")) {
        console.log("User rejected the transaction");
        setError(null);
      } else {
        let errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
        // Only log to console, don't show UI error for user rejections
        console.error("Fetch error:", errorMessage);
      }
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (listingId: string) => {
    // Simulate purchase process - in a real app, this would interact with a smart contract or API
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        // Simulate success/failure (90% success rate for demo)
        if (Math.random() > 0.1) {
          resolve();
        } else {
          reject(new Error("Purchase failed. Please try again."));
        }
      }, 1500);
    });
  };

  const handleListingClick = (listing: Listing) => {
    setSelectedListing(listing);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedListing(null);
  };

  if (!authenticated) {
    return (
      <div className="w-full p-8 border border-dashed rounded-lg bg-muted/30 flex flex-col items-center justify-center text-center">
        <div className="bg-background p-3 rounded-full shadow-sm mb-4">
          <ShoppingBag className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">Login Required</h3>
        <p className="text-muted-foreground max-w-sm">
          Please login to view and purchase exclusive listings with x402 payments.
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
          <div className="flex-1">
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[2fr_1fr_auto] gap-4 items-end">
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
              Max Payment (USDC)
            </label>
            <div className="relative">
              <input
                type="text"
                value={maxPayment}
                onChange={(e) => setMaxPayment(e.target.value)}
                placeholder="1000000"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-20"
              />
              <span className="absolute right-3 top-3 text-xs text-muted-foreground pointer-events-none">
                USDC (wei)
              </span>
            </div>
          </div>

          <button
            onClick={handleFetchListings}
            disabled={loading || !apiUrl}
            className="sm:col-span-2 md:col-span-1 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6"
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
          Payment amount: ~1 USDC per request
        </div>

        {error && (
          <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg">
            <div className="flex items-start gap-3 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
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
                {(error.includes("Payment Required") || error.includes("Payment failed") || error.includes("Insufficient balance") || error.includes("USDC")) && (
                  <div className="mt-3 pt-3 border-t border-destructive/20">
                    <p className="text-xs text-destructive/80 mb-2">
                      <strong>To fix payment issues:</strong>
                    </p>
                    <ol className="text-xs text-destructive/80 space-y-1 list-decimal list-inside">
                      <li>Ensure your wallet is on Base Sepolia testnet</li>
                      <li>Fund your wallet with USDC (testnet USDC required, not ETH)</li>
                      <li>Get testnet USDC from Circle's faucet: https://faucet.circle.com/</li>
                      <li>Approve the payment authorization when prompted (no gas needed)</li>
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {listings.map((listing) => (
              <ListingCard 
                key={listing.id} 
                listing={listing} 
                onClick={() => handleListingClick(listing)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Listing Detail Modal */}
      {selectedListing && (
        <ListingDetailModal
          listing={selectedListing}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          account={walletAddress}
          onPurchase={handlePurchase}
        />
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

function ListingCard({ listing, onClick }: { listing: Listing; onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="group relative bg-card rounded-xl border border-border/60 overflow-hidden hover:shadow-md transition-all duration-300 hover:border-border cursor-pointer"
    >
      <div className="aspect-4/3 relative overflow-hidden bg-muted">
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
