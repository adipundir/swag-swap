'use client';

import { usePrivy, useWallets } from '@privy-io/react-auth';

export function Login() {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const { wallets } = useWallets();

  if (!ready) {
    return (
      <div className="p-4">
        <button
          disabled
          className="px-4 py-2 bg-gray-300 text-gray-600 rounded cursor-not-allowed"
        >
          Loading...
        </button>
      </div>
    );
  }

  if (authenticated) {
    const walletAddress = wallets[0]?.address || user?.wallet?.address || '';

    return (
      <div className="p-4 space-y-4">
        <div className="p-4 bg-gray-100 rounded">
          <p className="text-sm text-gray-600 mb-2">Wallet Address:</p>
          <p className="font-mono text-sm break-all">{walletAddress || 'No wallet connected'}</p>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <button
        onClick={login}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Login
      </button>
    </div>
  );
}

