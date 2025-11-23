'use client';

import { useX402Fetch, useWallets } from '@privy-io/react-auth';
import { useState, useCallback } from 'react';

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: string;
  imageUrl?: string;
  seller: string;
  createdAt: string;
}

interface UseListingsReturn {
  listings: Listing[];
  loading: boolean;
  error: string | null;
  fetchListings: (apiUrl: string, maxPayment?: bigint) => Promise<void>;
}

export function useListings(): UseListingsReturn {
  const { wallets } = useWallets();
  const { wrapFetchWithPayment } = useX402Fetch();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = useCallback(
    async (apiUrl: string, maxPayment?: bigint) => {
      if (!wallets[0]?.address) {
        setError('No wallet connected');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const fetchWithPayment = wrapFetchWithPayment({
          walletAddress: wallets[0].address,
          fetch,
          ...(maxPayment && { maxValue: maxPayment }),
        });

        const response = await fetchWithPayment(apiUrl);

        if (!response.ok) {
          throw new Error(`Failed to fetch listings: ${response.statusText}`);
        }

        const data = await response.json();
        setListings(Array.isArray(data) ? data : data.listings || []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        setListings([]);
      } finally {
        setLoading(false);
      }
    },
    [wallets, wrapFetchWithPayment]
  );

  return {
    listings,
    loading,
    error,
    fetchListings,
  };
}

