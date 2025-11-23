import { facilitator } from "@coinbase/x402";

// Facilitator configuration
// For testnet: Use public facilitator URL (works without API keys) - this is what was working before
// For mainnet: Use CDP facilitator with API keys
const isMainnet = process.env.NEXT_PUBLIC_NETWORK === "mainnet";

// For testnet (base-sepolia), use the public facilitator URL that was working before
// For mainnet (base), use the CDP facilitator (requires CDP_API_KEY_ID and CDP_API_KEY_SECRET)
export const facilitatorConfig = isMainnet 
  ? facilitator // CDP facilitator for mainnet (requires CDP_API_KEY_ID and CDP_API_KEY_SECRET)
  : { url: "https://x402.org/facilitator" }; // Public facilitator for testnet - this was working before

