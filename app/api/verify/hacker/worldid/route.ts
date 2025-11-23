import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/verify/hacker/worldid
 * 
 * Server-Side Verification Endpoint for World ID Proofs
 * 
 * Verifies World ID proofs off-chain using World ID Developer Portal API
 */

/**
 * Interface for World ID proof payload
 */
interface WorldIDProofPayload {
  proof: string;
  merkle_root: string;
  nullifier_hash: string;
  verification_level: string;
  walletAddress: string;
}

/**
 * Interface for user verification status
 */
interface UserVerification {
  walletAddress: string;
  isVerified: boolean;
  verifiedAt: string;
  proofHash: string;
  method: "worldid";
  nullifierHash: string;
}

// In-memory storage for verified users
// In production, use a database (PostgreSQL, MongoDB, etc.)
const verifiedUsers = new Map<string, UserVerification>();

/**
 * Verify World ID proof using World ID Developer Portal API
 */
async function verifyWorldIDProof(payload: WorldIDProofPayload): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    console.log("🔍 Verifying World ID proof...");
    console.log("   Nullifier hash:", payload.nullifier_hash);
    console.log("   Verification level:", payload.verification_level);

    const app_id = process.env.NEXT_PUBLIC_WORLD_APP_ID || process.env.WORLD_APP_ID;
    const action = "verify-hacker";

    if (!app_id) {
      return {
        success: false,
        error: "World ID app_id not configured. Please set NEXT_PUBLIC_WORLD_APP_ID in your environment.",
      };
    }

    // Verify the proof with World ID Developer Portal API
    const response = await fetch(
      `https://developer.worldcoin.org/api/v1/verify/${app_id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          merkle_root: payload.merkle_root,
          nullifier_hash: payload.nullifier_hash,
          proof: payload.proof,
          verification_level: payload.verification_level,
          action: action,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Verification failed" }));
      console.error("❌ World ID API returned error:", errorData);
      return {
        success: false,
        error: errorData.detail || errorData.error || `Verification failed with status ${response.status}`,
      };
    }

    const data = await response.json();

    if (data.success === true) {
      console.log("✅ World ID proof verified successfully");
      return { success: true };
    } else {
      console.error("❌ World ID verification failed:", data);
      return {
        success: false,
        error: data.detail || data.code || "World ID proof is invalid",
      };
    }
  } catch (error) {
    console.error("Error verifying World ID proof:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown verification error",
    };
  }
}

/**
 * POST handler
 */
export async function POST(request: NextRequest) {
  try {
    const body: WorldIDProofPayload = await request.json();

    console.log("📥 Received World ID proof for verification");
    console.log("   Wallet:", body.walletAddress);
    console.log("   Verification level:", body.verification_level);

    // Validate input
    if (!body.proof || !body.nullifier_hash || !body.merkle_root || !body.walletAddress) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
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

    // Check if this nullifier has already been used
    const existingVerification = Array.from(verifiedUsers.values()).find(
      (v) => v.nullifierHash === body.nullifier_hash
    );

    if (existingVerification) {
      console.log("⚠️ Nullifier already used by:", existingVerification.walletAddress);
      return NextResponse.json(
        {
          success: false,
          error: "This World ID has already been used for verification",
        },
        { status: 400 }
      );
    }

    // Verify the World ID proof
    const proofVerification = await verifyWorldIDProof(body);
    if (!proofVerification.success) {
      console.error("❌ Proof verification failed:", proofVerification.error);
      return NextResponse.json(
        {
          success: false,
          error: proofVerification.error || "Invalid proof",
        },
        { status: 400 }
      );
    }

    // Store verification status
    const verification: UserVerification = {
      walletAddress: body.walletAddress.toLowerCase(),
      isVerified: true,
      verifiedAt: new Date().toISOString(),
      proofHash: body.proof.substring(0, 64),
      method: "worldid",
      nullifierHash: body.nullifier_hash,
    };

    verifiedUsers.set(body.walletAddress.toLowerCase(), verification);

    console.log(`✅ User ${body.walletAddress} verified via World ID`);
    console.log(`   Verification level: ${body.verification_level}`);
    console.log(`   Method: Off-chain World ID proof`);

    // Return success
    return NextResponse.json(
      {
        success: true,
        message: "Successfully verified with World ID!",
        verification: {
          isVerified: true,
          verifiedAt: verification.verifiedAt,
          method: "worldid",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error in World ID verification:", error);
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
 * GET handler - Check verification status
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

