"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";

export function Navbar() {
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallets } = useWallets();

  const walletAddress = wallets[0]?.address || "";
  const truncatedAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : "";

  if (!ready) {
    return (
      <nav className="border-b border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                SwagSwap
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                disabled
                className="px-4 py-2 bg-gray-300 text-gray-600 rounded-md cursor-not-allowed"
              >
                Loading...
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              SwagSwap
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            {authenticated ? (
              <>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(walletAddress);
                    alert("Wallet address copied to clipboard!");
                  }}
                  className="text-sm text-gray-700 dark:text-gray-300 font-mono hover:text-blue-500 dark:hover:text-blue-400 transition-colors cursor-pointer"
                  title="Click to copy full address"
                >
                  {truncatedAddress}
                </button>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={login}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

