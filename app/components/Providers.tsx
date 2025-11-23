"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { baseSepolia } from "viem/chains";
import { VerificationProvider } from "../contexts/VerificationContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        loginMethods: ["email", "wallet"],
        appearance: {
          theme: "light",
          accentColor: "#676FFF",
          walletList: ["detected_wallets", "metamask"],
        },
        defaultChain: baseSepolia,
        supportedChains: [baseSepolia],
      }}
    >
      <VerificationProvider>
        {children}
      </VerificationProvider>
    </PrivyProvider>
  );
}
