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
        id: 80002,
        name: "Polygon Amoy",
        network: "polygon-amoy",
        nativeCurrency: {
          name: "MATIC",
          symbol: "MATIC",
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: ["https://rpc-amoy.polygon.technology"],
          },
        },
        blockExplorers: {
          default: {
            name: "PolygonScan",
            url: "https://amoy.polygonscan.com",
          },
        },
      },
      {
        id: 44787,
        name: "Celo Alfajores",
        network: "celo-alfajores",
        nativeCurrency: {
          name: "CELO",
          symbol: "CELO",
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: ["https://alfajores-forno.celo-testnet.org"],
          },
        },
        blockExplorers: {
          default: {
            name: "Celo Explorer",
            url: "https://alfajores.celoscan.io",
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

