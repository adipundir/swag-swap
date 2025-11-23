"use client";

import { useX402Fetch, useWallets, usePrivy } from "@privy-io/react-auth";
import { useState } from "react";
import { Search, DollarSign, AlertCircle, Loader2, ShoppingBag, ArrowRight } from "lucide-react";

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
    process.env.NEXT_PUBLIC_LISTINGS_API_URL || "http://localhost:3000/api/listings"
  );
  const [maxPayment, setMaxPayment] = useState<string>("1000000"); // 1 USDC default

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
        throw new Error(`Failed to fetch listings: ${response.statusText}`);
      }

      const data = await response.json();
      const listingsData = Array.isArray(data) ? data : data.listings || [];
      setListings(listingsData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
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
              placeholder="https://api.example.com/listings"
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
          <div className="mt-6 p-4 bg-destructive/10 text-destructive rounded-lg flex items-start gap-3 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
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
