/**
 * ZK Proof Compression using vlayer's ZK Prover Server
 * 
 * Compresses Web Proofs into zero-knowledge proofs for:
 * - On-chain verification (more efficient)
 * - Privacy (hides Web Proof as private input)
 * - Succinctness (smaller proof size)
 */

import { WebProofResult } from "./server-prover";

/**
 * ZK Prover Server configuration
 */
const ZK_PROVER_URL = process.env.VLAYER_ZK_PROVER_URL || "https://prover.vlayer.xyz";

/**
 * Interface for compressed ZK proof
 */
export interface CompressedZKProof {
  // RISC Zero proof
  proof: string;
  
  // ABI-encoded public outputs
  journalDataAbi: string;
  
  // Guest program ID (verifier)
  guestId: string;
  
  // Original claim data (public)
  publicOutputs: {
    walletAddress: string;
    isConfirmed: boolean;
    timestamp: number;
  };
}

/**
 * Compress a Web Proof into a ZK proof
 * 
 * POST /compress-web-proof
 * 
 * @param webProof - The Web Proof to compress
 * @param walletAddress - User's wallet address (will be in public outputs)
 * @returns Compressed ZK proof
 */
export async function compressWebProofToZK(
  webProof: WebProofResult,
  walletAddress: string
): Promise<CompressedZKProof> {
  try {
    console.log("🔐 Compressing Web Proof to ZK...");

    // Call ZK Prover Server
    const response = await fetch(`${ZK_PROVER_URL}/compress-web-proof`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.VLAYER_API_KEY || ""}`,
      },
      body: JSON.stringify({
        // Web Proof input (will be hidden in ZK proof)
        webProof: webProof.presentationJson,
        
        // Public inputs (will be in proof outputs)
        publicInputs: {
          walletAddress,
          timestamp: webProof.timestamp,
        },
        
        // What we want to prove
        claims: {
          isConfirmed: true,
          url: webProof.url,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `ZK compression failed: ${error.message || response.statusText}`
      );
    }

    const zkProof = await response.json();

    console.log("✅ ZK proof generated:", {
      guestId: zkProof.guestId.substring(0, 16) + "...",
      proofSize: zkProof.proof.length,
    });

    return {
      proof: zkProof.proof,
      journalDataAbi: zkProof.journalDataAbi,
      guestId: zkProof.guestId,
      publicOutputs: {
        walletAddress,
        isConfirmed: true,
        timestamp: webProof.timestamp,
      },
    };
  } catch (error) {
    console.error("❌ ZK compression failed:", error);
    throw new Error(
      `Failed to compress Web Proof to ZK: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Get the RISC Zero guest program ID
 * 
 * GET /guest-id
 * 
 * This ID is used to verify ZK proofs on-chain
 */
export async function getZKGuestId(): Promise<string> {
  try {
    const response = await fetch(`${ZK_PROVER_URL}/guest-id`, {
      headers: {
        "Authorization": `Bearer ${process.env.VLAYER_API_KEY || ""}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get guest ID: ${response.statusText}`);
    }

    const data = await response.json();
    return data.guestId;
  } catch (error) {
    console.error("❌ Failed to get guest ID:", error);
    throw error;
  }
}

/**
 * Verify a ZK proof on-chain
 * 
 * This generates the Solidity verification call
 */
export function generateOnChainVerification(zkProof: CompressedZKProof) {
  return {
    contract: "RiscZeroVerifier",
    method: "verify",
    args: [
      zkProof.guestId,
      zkProof.journalDataAbi,
      zkProof.proof,
    ],
    
    // Solidity call
    solidityCode: `
// Verify ZK proof on-chain
IRiscZeroVerifier verifier = IRiscZeroVerifier(VERIFIER_ADDRESS);

bool isValid = verifier.verify(
    bytes32(${zkProof.guestId}),
    bytes32(${zkProof.journalDataAbi}),
    bytes(${zkProof.proof})
);

require(isValid, "Invalid ZK proof");

// Decode public outputs
(address walletAddress, bool isConfirmed, uint256 timestamp) = 
    abi.decode(journalDataAbi, (address, bool, uint256));

require(isConfirmed, "User not confirmed for hackathon");
    `.trim(),
  };
}

/**
 * Why ZK compression?
 * 
 * Web Proof (TLSN):
 * - Size: ~100-500 KB
 * - Verification: Complex (TLS signature check)
 * - Gas cost: Very high (~1M+ gas)
 * - Privacy: Selective disclosure
 * 
 * ZK Proof (RISC Zero):
 * - Size: ~5-10 KB (10-100x smaller!)
 * - Verification: Simple (single verify() call)
 * - Gas cost: Low (~200-300K gas)
 * - Privacy: Full (Web Proof is private input)
 */
export const zkCompressionBenefits = {
  sizeReduction: "10-100x smaller",
  gasReduction: "5-10x cheaper",
  privacy: "Web Proof completely hidden",
  verification: "Simple on-chain verification",
  
  useCases: [
    "On-chain identity systems",
    "DeFi protocols requiring KYC",
    "Token gating (only hackers can access)",
    "Reputation systems",
    "Governance (verified participants only)",
  ],
};

