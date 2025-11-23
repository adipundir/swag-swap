"use client";

import { useX402Fetch, useWallets, usePrivy } from "@privy-io/react-auth";
import { useState } from "react";

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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Please login to view listings
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Fetch Listings (x402 Payments)
        </h2>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              API URL
            </label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://api.example.com/listings"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Max Payment (USDC in smallest unit, 6 decimals)
            </label>
            <input
              type="text"
              value={maxPayment}
              onChange={(e) => setMaxPayment(e.target.value)}
              placeholder="1000000 = 1 USDC"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Default: 1,000,000 (1 USDC with 6 decimals)
            </p>
          </div>

          <button
            onClick={handleFetchListings}
            disabled={loading || !apiUrl}
            className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Fetching & Processing Payment..." : "Fetch Listings"}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">
              Error: {error}
            </p>
          </div>
        )}
      </div>

      {listings.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Available Listings ({listings.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      )}

      {!loading && listings.length === 0 && !error && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            No listings fetched yet. Enter an API URL and click "Fetch Listings" to view hackathon merch.
          </p>
        </div>
      )}
    </div>
  );
}

function ListingCard({ listing }: { listing: Listing }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {listing.imageUrl && (
        <img
          src={listing.imageUrl}
          alt={listing.title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {listing.title}
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {listing.description}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {listing.price}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
            {listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}
          </span>
        </div>
      </div>
    </div>
  );
}

