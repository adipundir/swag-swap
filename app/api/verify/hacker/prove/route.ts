import { NextRequest, NextResponse } from "next/server";
import {
  generateBrowserProof,
  verifyBrowserProof,
  isValidConfirmationText,
} from "@/lib/vlayer/browser-prover";

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

    // Step 1: Use browser automation to get rendered content
    const eventUrl = "https://ethglobal.com/events/buenosaires/home";
    
    console.log(`📍 Checking event page: ${eventUrl}`);
    console.log("🌐 Using headless browser to render JavaScript...");
    
    const browserProof = await generateBrowserProof({
      url: eventUrl,
      accessToken,
      waitForSelector: 'p.font-semibold',
      timeout: 30000, // 30 seconds
    });

    console.log("📦 Browser Proof generated:", {
      timestamp: browserProof.timestamp,
      url: browserProof.url,
      confirmationText: browserProof.extractedData.confirmationText,
      pageTitle: browserProof.extractedData.pageTitle,
    });

    // Step 2: Validate the extracted confirmation text
    const confirmationText = browserProof.extractedData.confirmationText;
    
    console.log("✅ Extracted confirmation text:", confirmationText);

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

    // Step 3: Return the proof
    // The frontend will then send this to the /verify endpoint
    return NextResponse.json(
      {
        success: true,
        message: "Web Proof generated successfully! You are confirmed for ETHGlobal Buenos Aires!",
        proof: {
          presentationJson: browserProof.presentationJson,
          timestamp: browserProof.timestamp,
          url: browserProof.url,
          confirmationText,
          event: "ETHGlobal Buenos Aires",
          pageTitle: browserProof.extractedData.pageTitle,
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
      } else if (errorMessage.includes("vlayer")) {
        errorMessage = "vlayer SDK not found. Please ensure @vlayer/sdk is installed.";
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
    description: "Generates Web Proofs using vlayer's Web Prover Server",
    track: "Best Server-Side Proving dApp ($3,000)",
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
    note: "This endpoint uses server-side proving with JWT authentication (more secure than cookies)",
  });
}

