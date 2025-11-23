"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useWallets, usePrivy } from "@privy-io/react-auth";

interface VerificationContextType {
  isVerified: boolean;
  checkingVerification: boolean;
  checkVerificationStatus: () => Promise<void>;
  setVerified: (verified: boolean) => void;
}

const VerificationContext = createContext<VerificationContextType | undefined>(undefined);

export function VerificationProvider({ children }: { children: ReactNode }) {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const [isVerified, setIsVerified] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(false);

  const walletAddress = wallets[0]?.address;

  // Check verification status when wallet connects
  useEffect(() => {
    if (walletAddress && authenticated) {
      checkVerificationStatus();
    }
  }, [walletAddress, authenticated]);

  const checkVerificationStatus = async () => {
    if (!walletAddress) return;
    setCheckingVerification(true);
    try {
      console.log("🔍 [Context] Checking verification for:", walletAddress);
      const response = await fetch(`/api/verify/hacker/worldid?address=${walletAddress}`);
      const data = await response.json();
      console.log("📥 [Context] Verification status:", data);
      
      if (data.success && data.isVerified) {
        console.log("✅ [Context] User is verified!");
        setIsVerified(true);
      } else {
        console.log("❌ [Context] User is not verified");
        setIsVerified(false);
      }
    } catch (err) {
      console.error("[Context] Error checking verification:", err);
      setIsVerified(false);
    } finally {
      setCheckingVerification(false);
    }
  };

  const setVerified = (verified: boolean) => {
    setIsVerified(verified);
  };

  return (
    <VerificationContext.Provider
      value={{
        isVerified,
        checkingVerification,
        checkVerificationStatus,
        setVerified,
      }}
    >
      {children}
    </VerificationContext.Provider>
  );
}

export function useVerification() {
  const context = useContext(VerificationContext);
  if (context === undefined) {
    throw new Error("useVerification must be used within a VerificationProvider");
  }
  return context;
}


