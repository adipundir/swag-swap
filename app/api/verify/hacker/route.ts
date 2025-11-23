import { NextRequest, NextResponse } from "next/server";
import { verifyBrowserProof, isValidConfirmationText } from "@/lib/vlayer/browser-prover";

/**
 * Interface for the proof object received from the frontend
 * Updated to support browser-based Web Proofs
 */
interface ProofPayload {
  proof: {
    presentationJson: {
      version: string;
      url: string;
      timestamp: number;
      method: string;
      selector: string;
      extractedText: string;
      screenshot: string;
      pageHash: string;
      signature: string;
    };
    timestamp: number;
    url: string;
    confirmationText: string;
  };
  walletAddress: string;
}

/**
 * Interface for user verification status (in-memory for now)
 * In production, this would be stored in a database
 */
interface UserVerification {
  walletAddress: string;
  isVerified: boolean;
  verifiedAt: string;
  proofHash: string;
}

// In-memory storage for verified users
// In production, use a database (PostgreSQL, MongoDB, etc.)
const verifiedUsers = new Map<string, UserVerification>();

/**
 * Verify the cryptographic proof using vlayer's verification
 * This uses the Web Prover Server to verify the TLSN proof
 */
async function verifyProofStructure(proof: ProofPayload["proof"]): Promise<boolean> {
  try {
    // Basic structure validation
    if (!proof.presentationJson || !proof.timestamp || !proof.url) {
      console.error("Missing required proof fields");
      return false;
    }

    // Check timestamp is recent (within last 1 hour)
    const now = Date.now();
    const proofAge = now - proof.timestamp;
    if (proofAge > 60 * 60 * 1000) {
      console.error("Proof is too old (>1 hour)");
      return false;
    }

    // Check URL is ETHGlobal dashboard
    if (!proof.url.includes("dashboard.ethglobal.com")) {
      console.error("Proof is not from ETHGlobal dashboard");
      return false;
    }

    console.log("🔍 Verifying browser-based Web Proof...");

    // Verify the cryptographic proof
    const verificationResult = await verifyBrowserProof(proof.presentationJson);

    if (!verificationResult.isValid) {
      console.error("Proof verification failed:", verificationResult.error);
      return false;
    }

    console.log("✅ Proof cryptographically verified");
    return true;
  } catch (error) {
    console.error("Error verifying proof structure:", error);
    return false;
  }
}

/**
 * Verify the claims match our expected ETHGlobal confirmation
 */
function verifyETHGlobalClaims(proof: ProofPayload["proof"]): boolean {
  try {
    // Verify the confirmation text matches expected format
    const confirmationText = proof.confirmationText;
    
    if (!confirmationText) {
      console.error("No confirmation text in proof");
      return false;
    }

    if (!isValidConfirmationText(confirmationText)) {
      console.error(
        `Extracted text "${confirmationText}" does not match expected confirmation`
      );
      return false;
    }

    console.log("✅ Confirmation text validated:", confirmationText);
    return true;
  } catch (error) {
    console.error("Error verifying claims:", error);
    return false;
  }
}

/**
 * POST /api/verify/hacker
 * 
 * Verifies a Web Proof that the user is a confirmed ETHGlobal hackathon participant
 */
export async function POST(request: NextRequest) {
  try {
    const body: ProofPayload = await request.json();

    // Validate input
    if (!body.proof || !body.walletAddress) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: proof and walletAddress",
        },
        { status: 400 }
      );
    }

    // Validate wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(body.walletAddress)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid wallet address format",
        },
        { status: 400 }
      );
    }

    // Step 1: Verify the cryptographic proof structure
    const isProofValid = await verifyProofStructure(body.proof);
    if (!isProofValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid proof structure or signature",
        },
        { status: 400 }
      );
    }

    // Step 2: Verify the claims match our ETHGlobal confirmation requirement
    const areClaimsValid = verifyETHGlobalClaims(body.proof);
    if (!areClaimsValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Proof does not show ETHGlobal attendance confirmation",
        },
        { status: 400 }
      );
    }

    // Step 3: Store verification status
    const proofHash = Buffer.from(JSON.stringify(body.proof.presentationJson)).toString("base64").substring(0, 64);
    const verification: UserVerification = {
      walletAddress: body.walletAddress.toLowerCase(),
      isVerified: true,
      verifiedAt: new Date().toISOString(),
      proofHash,
    };

    verifiedUsers.set(body.walletAddress.toLowerCase(), verification);

    console.log(
      `✅ User ${body.walletAddress} verified as ETHGlobal hacker`
    );

    // Return success
    return NextResponse.json(
      {
        success: true,
        message: "Successfully verified as ETHGlobal hacker!",
        verification: {
          isVerified: true,
          verifiedAt: verification.verifiedAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in hacker verification:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error during verification",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/verify/hacker?address=0x...
 * 
 * Check if a wallet address is verified
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing address parameter",
        },
        { status: 400 }
      );
    }

    const verification = verifiedUsers.get(address.toLowerCase());

    if (!verification) {
      return NextResponse.json(
        {
          success: true,
          isVerified: false,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        isVerified: verification.isVerified,
        verifiedAt: verification.verifiedAt,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking verification status:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}


