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
          className="px-4 py-2 bg-[#ede8e0] text-[#6b5d47] rounded-lg cursor-not-allowed font-medium text-sm"
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
        <div className="p-4 bg-[#faf8f5] rounded-xl border border-[#e5ddd0]">
          <p className="text-xs font-medium text-[#6b5d47] mb-1 uppercase tracking-wide">Wallet Address</p>
          <p className="font-mono text-sm text-[#5c4a37] break-all">{walletAddress || 'No wallet connected'}</p>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-lg transition-colors text-sm font-medium"
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
        className="px-4 py-2 bg-[#8b6f47] hover:bg-[#7a5f3f] text-white rounded-lg transition-colors text-sm font-medium shadow-sm"
      >
        Login
      </button>
    </div>
  );
}
