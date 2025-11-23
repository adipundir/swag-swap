import { NextRequest, NextResponse } from "next/server";
import {
  generateWebProof,
  verifyWebProof,
  extractConfirmationText,
  isValidConfirmationText,
} from "@/lib/vlayer/web-prover-api";

/**
 * POST /api/verify/hacker/prove
 * 
 * Server-Side Proving Endpoint
 * 
 * Generates a Web Proof on the server using vlayer's Web Prover Server.
 * This endpoint is eligible for the "Best Server-Side Proving dApp" track ($3,000).
 * 
 * The user provides their ETHGlobal access token (JWT) to authenticate
 * the request to dashboard.ethglobal.com API.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessToken, walletAddress } = body;

    // Validate input
    if (!accessToken || !walletAddress) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: accessToken and walletAddress",
        },
        { status: 400 }
      );
    }

    // Validate JWT format
    if (!accessToken.startsWith("eyJ")) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid access token format. Please provide a valid JWT token.",
        },
        { status: 400 }
      );
    }

    // Validate wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid wallet address format",
        },
        { status: 400 }
      );
    }

    console.log(`🚀 Generating proof for wallet: ${walletAddress}`);

    // Step 1: Generate Web Proof using vlayer's REST API
    const eventUrl = "https://ethglobal.com/events/buenosaires/home";
    
    console.log(`📍 Checking event page: ${eventUrl}`);
    console.log("🔐 Using vlayer Web Prover Server (TLSNotary)...");
    
    const webProof = await generateWebProof(eventUrl, accessToken);

    console.log("📦 Web Proof generated successfully!");
    console.log("   Proof data length:", webProof.data.length, "characters");
    console.log("   TLSN version:", webProof.version);

    // Step 2: Verify the proof immediately to extract the HTTP transcript
    console.log("🔍 Verifying proof to extract HTTP transcript...");
    const verificationResult = await verifyWebProof(webProof);

    if (!verificationResult.success) {
      console.error("❌ Proof verification failed");
      return NextResponse.json(
        {
          success: false,
          error: verificationResult.error || "Proof verification failed",
        },
        { status: 400 }
      );
    }

    console.log("✅ Proof verified successfully!");
    console.log("   Server domain:", verificationResult.serverDomain);
    console.log("   Response status:", verificationResult.response.status);

    // Step 3: Extract confirmation text from the response body
    const responseBody = verificationResult.response.body;
    const confirmationText = extractConfirmationText(responseBody);

    if (!confirmationText) {
      console.error("❌ Could not find confirmation text in response");
      console.log("   Response body length:", responseBody.length, "bytes");
      console.log("   Response body (first 500 chars):", responseBody.substring(0, 500));
      
      return NextResponse.json(
        {
          success: false,
          error: "Could not find ETHGlobal attendance confirmation in the response. Make sure you're fully confirmed for the event.",
        },
        { status: 400 }
      );
    }

    console.log("✅ Extracted confirmation text:", confirmationText);

    // Step 4: Validate the confirmation text
    if (!isValidConfirmationText(confirmationText)) {
      console.error("❌ Confirmation text does not match expected format");
      console.error("   Expected: 'You are fully confirmed to attend this event!'");
      console.error("   Got:", confirmationText);
      
      return NextResponse.json(
        {
          success: false,
          error: `Found text "${confirmationText}" but it doesn't match the expected confirmation format. Make sure you're fully confirmed for ETHGlobal Buenos Aires.`,
        },
        { status: 400 }
      );
    }

    console.log("✅ Confirmation text validated successfully");
    console.log("🎯 User is confirmed for ETHGlobal Buenos Aires!");

    // Step 5: Return the proof (now includes TLSNotary cryptographic proof!)
    return NextResponse.json(
      {
        success: true,
        message: "Web Proof generated successfully! You are confirmed for ETHGlobal Buenos Aires!",
        proof: {
          // TLSNotary proof data
          data: webProof.data,
          version: webProof.version,
          meta: webProof.meta,
          // Extracted information
          confirmationText,
          event: "ETHGlobal Buenos Aires",
          url: eventUrl,
          timestamp: Date.now(),
          // Verification info
          serverDomain: verificationResult.serverDomain,
          notaryKeyFingerprint: verificationResult.notaryKeyFingerprint,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating proof:", error);
    
    let errorMessage = "Failed to generate Web Proof";
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Provide helpful error messages
      if (errorMessage.includes("Authentication") || errorMessage.includes("401") || errorMessage.includes("403")) {
        errorMessage = "Invalid or expired access token. Please get a new token from ETHGlobal dashboard.";
      } else if (errorMessage.includes("timeout")) {
        errorMessage = "Request timed out. Please try again.";
      } else if (errorMessage.includes("Web Prover Server")) {
        errorMessage = `vlayer Web Prover Server error: ${errorMessage}. The API might be experiencing issues.`;
      }
    }
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/verify/hacker/prove
 * 
 * Get information about the proving endpoint
 */
export async function GET() {
  return NextResponse.json({
    message: "Server-Side Proving Endpoint",
    description: "Generates Web Proofs using vlayer's Web Prover Server REST API",
    track: "Best Server-Side Proving dApp ($3,000)",
    implementation: "TLSNotary protocol via vlayer Web Prover Server",
    usage: {
      method: "POST",
      body: {
        accessToken: "Your ETHGlobal access token (JWT) - ethglobal_access_token from browser storage",
        walletAddress: "Your Ethereum wallet address (0x...)",
      },
      howToGetToken: [
        "1. Open dashboard.ethglobal.com and log in",
        "2. Open DevTools (F12)",
        "3. Go to Application → Local Storage → dashboard.ethglobal.com",
        "4. Copy the value of 'ethglobal_access_token'",
        "5. It should start with 'eyJ...'",
      ],
    },
    note: "This endpoint uses vlayer's official Web Prover Server REST API with TLSNotary protocol for cryptographic proof generation",
  });
}

