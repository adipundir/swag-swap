"use client";

// PRIVY CODE - COMMENTED OUT FOR CDP WALLET TESTING
// import { usePrivy, useWallets, useX402Fetch } from "@privy-io/react-auth";

// CDP WALLET - Using Coinbase Wallet SDK
import { CoinbaseWalletSDK } from "@coinbase/wallet-sdk";
// OFFICIAL CDP x402 - Using x402-fetch package
import { wrapFetchWithPayment } from "x402-fetch";
import { useState, useEffect } from "react";
import { Search, DollarSign, AlertCircle, Loader2, ShoppingBag, ArrowRight, RefreshCw } from "lucide-react";
import { createWalletClient, custom, Chain, createPublicClient, http, formatEther, type Address } from "viem";
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
  // PRIVY CODE - COMMENTED OUT FOR CDP WALLET TESTING
  // const { authenticated } = usePrivy();
  // const { wallets } = useWallets();
  // const { wrapFetchWithPayment } = useX402Fetch();
  
  // CDP WALLET STATE
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [coinbaseWallet, setCoinbaseWallet] = useState<CoinbaseWalletSDK | null>(null);
  const [provider, setProvider] = useState<any>(null);
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiUrl, setApiUrl] = useState<string>(
    process.env.NEXT_PUBLIC_LISTINGS_API_URL || "/api/listings"
  );
  const [maxPayment, setMaxPayment] = useState<string>("100000000000000"); // 0.0001 ETH default (in wei)
  const [switchingNetwork, setSwitchingNetwork] = useState(false);

  // Initialize Coinbase Wallet SDK
  useEffect(() => {
    if (typeof window !== "undefined") {
      const sdk = new CoinbaseWalletSDK({
        appName: "SwagSwap",
        appLogoUrl: typeof window !== "undefined" ? window.location.origin + "/favicon.ico" : undefined,
      });
      setCoinbaseWallet(sdk);
      const cbProvider = sdk.makeWeb3Provider();
      setProvider(cbProvider);
    }
  }, []);

  // Check if already connected
  useEffect(() => {
    if (!provider) return;

    const checkConnection = async () => {
      try {
        const accounts = await provider.request({ method: "eth_accounts" });
        if (accounts && accounts.length > 0) {
          setAccount(accounts[0]);
          setAuthenticated(true);
          await updateChainId();
          await updateBalance(accounts[0]);
        }
      } catch (err) {
        console.error("Error checking connection:", err);
      }
    };

    checkConnection();

    // Listen for account changes
    provider.on?.("accountsChanged", (accounts: string[]) => {
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        setAuthenticated(true);
        updateBalance(accounts[0]);
      } else {
        setAccount(null);
        setAuthenticated(false);
      }
    });

    // Listen for chain changes
    provider.on?.("chainChanged", () => {
      updateChainId();
      if (account) {
        updateBalance(account);
      }
    });

    return () => {
      provider.removeAllListeners?.("accountsChanged");
      provider.removeAllListeners?.("chainChanged");
    };
  }, [provider, account]);

  // Connect to Coinbase Wallet
  const connectWallet = async () => {
    if (!provider) {
      setError("Coinbase Wallet not available. Please install Coinbase Wallet extension.");
      return;
    }

    try {
      const accounts = await provider.request({ method: "eth_requestAccounts" });
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        setAuthenticated(true);
        await updateChainId();
        await updateBalance(accounts[0]);
      }
    } catch (err) {
      console.error("Error connecting to Coinbase Wallet:", err);
      setError("Failed to connect to Coinbase Wallet. Please approve the connection request.");
    }
  };

  // Update chain ID
  const updateChainId = async () => {
    if (!provider) return;

    try {
      const chainIdHex = await provider.request({ method: "eth_chainId" });
      const chainId = parseInt(chainIdHex as string, 16);
      setChainId(chainId);
    } catch (err) {
      console.error("Error getting chain ID:", err);
    }
  };

  // Update balance
  const updateBalance = async (address: string) => {
    try {
      const publicClient = createPublicClient({
        chain: baseSepolia,
        transport: http("https://sepolia.base.org"),
      });
      const balanceWei = await publicClient.getBalance({
        address: address as `0x${string}`,
      });
      setBalance(formatEther(balanceWei));
    } catch (err) {
      console.error("Error fetching balance:", err);
    }
  };

  const handleSwitchToBaseSepolia = async () => {
    // PRIVY CODE - COMMENTED OUT
    // if (!wallets[0]?.address) {
    //   setError("No wallet connected. Please login first.");
    //   return;
    // }

    // CDP WALLET CODE
    if (!account || !provider) {
      setError("No wallet connected. Please connect Coinbase Wallet first.");
      return;
    }

    setSwitchingNetwork(true);
    setError(null);

    try {
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

      // CDP WALLET CODE - provider is already set from state
      if (!provider) {
        throw new Error("Coinbase Wallet provider not available. Please connect your wallet first.");
      }

      // Try to switch chain first
      try {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: baseSepoliaChain.chainId }],
        });
        await updateChainId();
        setError(null);
      } catch (switchError: any) {
        // If chain doesn't exist (error code 4902), add it
        if (switchError.code === 4902 || switchError.code === -32603) {
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [baseSepoliaChain],
          });
          await updateChainId();
          setError(null);
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

  // Create x402-enabled fetch using official x402-fetch package
  const getX402Fetch = () => {
    if (!provider || !account) {
      throw new Error("Coinbase Wallet not connected");
    }

    // Create viem wallet client from Coinbase Wallet provider
    // x402-fetch works with viem wallet clients that implement the Signer interface
    // We need to pass the account address and use custom transport with the provider
    const walletClient = createWalletClient({
      account: account as Address,
      chain: baseSepolia,
      transport: custom(provider),
    });

    // Wrap fetch with x402 payment handling using official CDP x402-fetch package
    // This automatically handles:
    // 1. Making initial request
    // 2. Detecting 402 Payment Required responses
    // 3. Signing payment authorization with the wallet
    // 4. Retrying request with X-PAYMENT header
    const fetchWithPayment = wrapFetchWithPayment(
      fetch,
      walletClient as any, // viem wallet client implements x402 Signer interface
      BigInt(maxPayment) // maxValue in wei (0.0001 ETH = 100000000000000 wei)
    );

    return fetchWithPayment;
  };

  const handleFetchListings = async () => {
    if (!apiUrl) {
      alert("Please enter an API URL");
      return;
    }

    // PRIVY CODE - COMMENTED OUT
    // if (!wallets[0]?.address) {
    //   setError("No wallet connected. Please login first.");
    //   return;
    // }

    // CDP WALLET CODE
    if (!account || !provider) {
      setError("No wallet connected. Please connect Coinbase Wallet first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Verify network before attempting payment
      // Base Sepolia chain ID is 84532
      if (chainId !== null && chainId !== 84532) {
        throw new Error(
          `Network mismatch: Your wallet is on chain ID ${chainId}, but Base Sepolia (chain ID 84532) is required for x402 payments. Please use the "Switch Network" button above.`
        );
      }

      // CDP WALLET CODE - Using official x402-fetch package
      console.log("Making request to:", apiUrl);
      console.log("Wallet address:", account);
      console.log("Current chain ID:", chainId);
      console.log("Max payment (wei):", maxPayment);
      
      // Get x402-enabled fetch function
      const fetchWithPayment = getX402Fetch();
      
      // Make request - x402-fetch handles 402 responses automatically
      const response = await fetchWithPayment(apiUrl, {
        method: "GET",
      });
      
      console.log("Response received:", {
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        // If still 402 after payment attempt, payment failed
        if (response.status === 402) {
          const errorText = await response.text().catch(() => "");
          console.error("402 Payment Required - Payment processing failed");
          console.error("Response text:", errorText.substring(0, 500));
          console.error("Debug info:", {
            walletAddress: account,
            chainId: chainId,
            maxPayment,
            responseHeaders: Object.fromEntries(response.headers.entries())
          });
          
          // Parse error response to check for specific signature errors
          let parsedError: any = null;
          try {
            parsedError = JSON.parse(errorText);
            console.error("Parsed error:", parsedError);
          } catch (e) {
            // Not JSON, try to extract JSON if it's wrapped
            const jsonMatch = errorText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              try {
                parsedError = JSON.parse(jsonMatch[0]);
                console.error("Parsed error (extracted):", parsedError);
              } catch (e2) {
                console.error("Could not parse error response as JSON");
              }
            }
          }
          
          let detailedError = "Payment failed: Unable to process x402 payment.\n\n";
          
          // Check for signature validation errors
          if (parsedError?.error === "invalid_exact_evm_payload_signature" || 
              parsedError?.error?.includes("not valid JSON") ||
              parsedError?.error?.includes("Unexpected token")) {
            detailedError += "⚠️ Facilitator Error: The x402 facilitator is having trouble processing the payment.\n\n";
            detailedError += "Error details: " + (parsedError?.error || "Unknown error") + "\n\n";
            detailedError += "This appears to be an issue with the x402 facilitator service trying to parse the payment signature.\n";
            detailedError += "Possible causes:\n";
            detailedError += "• The facilitator may have a bug parsing signatures\n";
            detailedError += "• Network connectivity issues with the facilitator service\n";
            detailedError += "• The x402-next middleware version may have compatibility issues\n\n";
            detailedError += "Try:\n";
            detailedError += "1. Refresh the page and try again\n";
            detailedError += "2. Check your network connection\n";
            detailedError += "3. Wait a few moments and retry (facilitator may be temporarily unavailable)\n";
            detailedError += "4. Check the browser console for more detailed error information\n\n";
            detailedError += "Note: This is likely a facilitator service issue, not a problem with your wallet or signature.\n";
          } else {
            // Generic error handling
            if (chainId !== 84532) {
              detailedError += "⚠️ Network Issue: Your wallet is not on Base Sepolia (chain ID 84532).\n";
            }
            detailedError += "\nPossible causes:\n";
            detailedError += "• Network not set to Base Sepolia (chain ID 84532)\n";
            detailedError += "• Insufficient USDC balance (x402 payments require USDC, not ETH)\n";
            detailedError += "• Payment transaction was rejected or failed\n";
            detailedError += "• x402 facilitator service issue\n\n";
            detailedError += "Try:\n";
            detailedError += "1. Use the 'Switch Network' button above to switch to Base Sepolia\n";
            detailedError += "2. Ensure you have USDC tokens on Base Sepolia (not just ETH)\n";
            detailedError += "3. Get USDC from a Base Sepolia faucet or swap ETH for USDC\n";
            detailedError += "4. Approve the payment transaction when prompted\n";
            detailedError += "5. Try fetching listings again";
          }
          
          throw new Error(detailedError);
        }
        const errorText = await response.text().catch(() => "");
        console.error("API Error:", response.status, errorText);
        throw new Error(`Failed to fetch listings: ${response.statusText} (${response.status})`);
      }

      const data = await response.json();
      console.log("API Response data:", data);
      
      // Handle response format: { success: true, listings: [...], count: ... }
      let listingsData: Listing[] = [];
      if (Array.isArray(data)) {
        listingsData = data;
      } else if (data.listings && Array.isArray(data.listings)) {
        listingsData = data.listings;
      } else if (data.success && data.listings && Array.isArray(data.listings)) {
        listingsData = data.listings;
      }
      
      console.log("Parsed listings count:", listingsData.length);
      setListings(listingsData);
      
      if (listingsData.length === 0) {
        console.warn("No listings found in response");
      }
    } catch (err) {
      let errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      
      // Improve error messages for common issues
      if (errorMessage.includes("chainId") || errorMessage.includes("Network mismatch")) {
        // Error message already includes network details
      } else if (errorMessage.includes("Payment Required") || errorMessage.includes("Payment failed")) {
        // Error message already includes detailed troubleshooting
      } else if (errorMessage.includes("insufficient") || errorMessage.includes("balance")) {
        errorMessage = `Insufficient balance: ${errorMessage}\n\nPlease fund your wallet with ETH on Base Sepolia testnet. You need at least 0.0001 ETH to fetch listings.`;
      } else {
        // Add network check suggestion for other errors
        errorMessage += "\n\nTip: Make sure your wallet is connected to Base Sepolia testnet (chain ID 84532).";
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
        <h3 className="text-lg font-medium mb-2">Connect Wallet</h3>
        <p className="text-muted-foreground max-w-sm mb-4">
          Please connect your Coinbase Wallet to view and purchase exclusive listings.
        </p>
        <button
          onClick={connectWallet}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6"
        >
          Connect Coinbase Wallet
        </button>
        {!coinbaseWallet && (
          <p className="text-xs text-destructive mt-2">
            Coinbase Wallet not available. Please install the Coinbase Wallet extension.
          </p>
        )}
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
        
        {/* CDP Wallet Info */}
        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-start gap-2 text-xs text-blue-600 dark:text-blue-500">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium mb-1">Using CDP Wallet (Coinbase Wallet)</p>
              <p className="text-muted-foreground">
                Currently testing with Coinbase Wallet. Privy code is commented out and can be restored later.
              </p>
            </div>
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
              Max Payment (Wei)
            </label>
            <div className="relative">
              <input
                type="text"
                value={maxPayment}
                onChange={(e) => setMaxPayment(e.target.value)}
                placeholder="100000000000000"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-16"
              />
              <span className="absolute right-3 top-3 text-xs text-muted-foreground pointer-events-none">
                Wei
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
          Payment amount: ~0.0001 ETH ($0.0001 USD)
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
                      <li>Fund your wallet with ETH (at least 0.0001 ETH)</li>
                      <li>Use the "Fund Wallet" button above or a Base Sepolia faucet to get testnet ETH</li>
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
