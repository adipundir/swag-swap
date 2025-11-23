import { paymentMiddleware } from "x402-next";
import { NextRequest, NextResponse } from "next/server";
import { facilitatorConfig } from "@/app/lib/facilitator";

// Validate required environment variable
if (!process.env.RECEIVER_WALLET_ADDRESS) {
  throw new Error("RECEIVER_WALLET_ADDRESS is required in .env.local");
}

// Create the x402 payment middleware
// Using CDP facilitator from @coinbase/x402
const x402Middleware = paymentMiddleware(
  // Your wallet address where you receive payments
  process.env.RECEIVER_WALLET_ADDRESS as `0x${string}`,
  {
    // Protected API route configuration
    "/api/listings": {
      price: "$0.0001", // Price in USD (paid in USDC on Base Sepolia)
      network: "base-sepolia", // Base Sepolia testnet
    },
  },
  facilitatorConfig // Use public facilitator for testnet, CDP facilitator for mainnet
);

// Wrap middleware to only protect GET requests
export function middleware(request: NextRequest) {
  // Only apply x402 protection for GET requests
  // POST requests (creating listings) should be free
  if (request.method === "GET") {
    return x402Middleware(request);
  }
  
  // For POST and other methods, allow through without payment
  return NextResponse.next();
}

// Configure which routes the middleware should run on
// Only protect GET requests to /api/listings
// POST requests (creating listings) are not protected
export const config = {
  matcher: ["/api/listings"],
  runtime: "nodejs", // Use Node.js runtime instead of Edge to avoid size limits
};

