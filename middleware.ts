import { paymentMiddleware } from "x402-next";

// Validate required environment variable
if (!process.env.RECEIVER_WALLET_ADDRESS) {
  throw new Error("RECEIVER_WALLET_ADDRESS is required in .env.local");
}

// Configure x402 payment middleware
export const middleware = paymentMiddleware(
  // Your wallet address where you receive USDC payments
  process.env.RECEIVER_WALLET_ADDRESS as `0x${string}`,
  {
    // Protected API route configuration
    "/api/listings": {
      price: "$0.0001", // Price in USD (equivalent to ~0.0001 USDC)
      network: "base-sepolia", // Base Sepolia testnet with facilitator.x402.rs
    },
  }
);

// Configure which routes the middleware should run on
// Only protect GET requests to /api/listings
// POST requests (creating listings) are not protected
export const config = {
  matcher: [
    "/api/listings",
  ],
};

