"use client";

import { useFundWallet, useWallets } from "@privy-io/react-auth";
import { useState } from "react";

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
      await fundWallet(wallets[0].address, {
        chain: {
          id: 80002, // Polygon Amoy
        },
      });
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
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-600 dark:text-blue-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Need USDC for payments?
            </h3>
            <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
              Add USDC to your wallet to pay for API access and fetch listings using x402.
            </p>
            <div className="mt-3">
              <button
                onClick={handleFundWallet}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "Opening..." : "Fund Wallet with USDC"}
              </button>
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
            {success && (
              <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                Funding initiated successfully!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

