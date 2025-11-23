"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import type { PrivyClientConfig } from "@privy-io/react-auth";

export default function Providers({ children }: { children: React.ReactNode }) {
  const config: PrivyClientConfig = {
    loginMethods: ["email", "wallet"],
    embeddedWallets: {
      ethereum: {
        createOnLogin: "users-without-wallets",
      },
    },
    appearance: {
      theme: "light",
      accentColor: "#676FFF",
    },
    supportedChains: [
      {
        id: 84532,
        name: "Base Sepolia",
        network: "base-sepolia",
        nativeCurrency: {
          name: "ETH",
          symbol: "ETH",
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: ["https://sepolia.base.org"],
          },
        },
        blockExplorers: {
          default: {
            name: "BaseScan",
            url: "https://sepolia-explorer.base.org",
          },
        },
      },
    ],
  };

  return (
    <PrivyProvider appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!} config={config}>
      {children}
    </PrivyProvider>
  );
}

