/**
 * vouch Data Source: ETHGlobal Hackathon Verification
 * 
 * This is a custom data source for the vouch catalog that verifies
 * ETHGlobal hackathon attendance without requiring manual cookie input.
 * 
 * Track Eligibility:
 * - ✅ Best vouch Integration ($2,000)
 * - ✅ BONUS: Build a Custom vouch Data Source ($1,000)
 * 
 * Total: $3,000 (same as server-side track!)
 */

import type { WebProofStep } from "@vlayer/sdk";

/**
 * vouch Data Source Configuration
 * 
 * This defines how vouch should collect and verify ETHGlobal attendance data
 */
export const ethGlobalVouchSource = {
  id: "ethglobal-attendance",
  name: "ETHGlobal Hackathon Attendance",
  description: "Verify you're a registered and confirmed ETHGlobal hackathon participant",
  version: "1.0.0",
  
  // OAuth configuration (preferred over cookie)
  auth: {
    type: "oauth2" as const,
    provider: "ethglobal",
    // Note: ETHGlobal doesn't have public OAuth yet, 
    // so we use a workaround with their session
    scopes: ["read:profile", "read:events"],
  },

  // Data to be proven
  claims: {
    isConfirmed: {
      type: "boolean",
      description: "User is confirmed to attend the hackathon",
    },
    eventName: {
      type: "string",
      description: "Name of the hackathon event",
      optional: true,
    },
    confirmationDate: {
      type: "string",
      description: "Date when user was confirmed",
      optional: true,
    },
  },

  // Logo for vouch UI
  logoUrl: "https://ethglobal.com/favicon.ico",
  
  // Privacy level
  privacy: {
    level: "selective-disclosure",
    redactedFields: ["email", "phone", "address"],
  },
};

/**
 * Web Proof steps for vouch
 * 
 * These steps are executed by vouch's proving infrastructure
 * User authenticates through vouch UI (not manual cookie paste)
 */
export function generateVouchWebProofSteps(): WebProofStep[] {
  return [
    // Step 1: Start at ETHGlobal dashboard
    {
      step: "startPage",
      url: "https://dashboard.ethglobal.com/" as any,
      label: "Navigate to ETHGlobal Dashboard",
    },

    // Step 2: Wait for user authentication
    {
      step: "userAction",
      url: "https://dashboard.ethglobal.com/**" as any,
      label: "Authenticate with ETHGlobal",
      instruction: {
        text: "Please log in to your ETHGlobal account",
      },
      assertion: {
        domElement: "p.font-semibold",
        require: {
          exist: true,
          notExist: undefined as never,
        },
      },
    },

    // Step 3: Extract confirmation status
    {
      step: "extractVariables",
      url: "https://dashboard.ethglobal.com/**" as any,
      label: "Extract confirmation status",
      variables: [
        {
          name: "confirmationText",
          path: "$.body.confirmationStatus",
          source: "ResponseBody" as const,
        },
        {
          name: "eventName",
          path: "$.body.eventName",
          source: "ResponseBody" as const,
        },
      ],
    },

    // Step 4: Notarize the confirmation
    {
      step: "notarize",
      url: "https://dashboard.ethglobal.com/**" as any,
      method: "GET",
      label: "Verify ETHGlobal attendance",
      redact: {
        responseBody: [
          {
            jsonPath: "$.user.email",
            redactionType: "full" as const,
          },
          {
            jsonPath: "$.user.phone",
            redactionType: "full" as const,
          },
          {
            jsonPath: "$.user.personalInfo",
            redactionType: "full" as const,
          },
        ],
      },
      outputs: {
        responseBody: [
          {
            path: "$.confirmationStatus",
            name: "isConfirmed",
          },
          {
            path: "$.eventName",
            name: "eventName",
          },
        ],
      },
    },
  ];
}

/**
 * vouch Webhook Handler
 * 
 * When user completes verification through vouch,
 * this receives the Web Proof payload
 */
export interface VouchWebhookPayload {
  userId: string;
  walletAddress: string;
  dataSourceId: string;
  webProof: {
    presentationJson: any;
    timestamp: number;
    claims: Record<string, any>;
  };
  signature: string;
}

/**
 * Process vouch webhook and extract claims
 */
export function processVouchWebhook(payload: VouchWebhookPayload) {
  const { webProof } = payload;
  
  // Extract the confirmation status
  const isConfirmed = webProof.claims.isConfirmed === true;
  const eventName = webProof.claims.eventName || "Unknown Event";
  
  return {
    walletAddress: payload.walletAddress,
    isVerified: isConfirmed,
    eventName,
    verifiedAt: new Date(webProof.timestamp).toISOString(),
    proofHash: payload.signature,
  };
}

/**
 * Validation helper for ETHGlobal confirmation
 */
export const EXPECTED_CONFIRMATION_TEXTS = [
  "You are fully confirmed to attend this event!",
  "You are fully confirmed to attend this event",
  "You are confirmed to attend this event!",
  "Fully confirmed to attend this event!",
];

export function isValidConfirmationText(extractedText: string): boolean {
  const normalizedText = extractedText.trim().toLowerCase();
  return EXPECTED_CONFIRMATION_TEXTS.some(
    (variation) => normalizedText === variation.toLowerCase()
  );
}

/**
 * vouch Data Source Metadata for Catalog
 * 
 * This is what gets published to the vouch catalog
 */
export const vouchCatalogEntry = {
  ...ethGlobalVouchSource,
  
  // How to use this data source
  usage: {
    install: "Add ETHGlobal Attendance verification to your app",
    integration: {
      frontend: `
import { vouch } from '@vlayer/sdk';

// Trigger vouch verification
const result = await vouch.verify({
  dataSource: 'ethglobal-attendance',
  walletAddress: userWallet,
});

if (result.claims.isConfirmed) {
  // User is a confirmed ETHGlobal hacker!
}
      `,
      backend: `
// Receive webhook from vouch
app.post('/webhook/vouch', (req, res) => {
  const { webProof } = req.body;
  const isConfirmed = webProof.claims.isConfirmed;
  // Store verification...
});
      `,
    },
  },

  // Example claims output
  exampleOutput: {
    claims: {
      isConfirmed: true,
      eventName: "ETHGlobal Buenos Aires 2025",
      confirmationDate: "2025-11-20T12:00:00Z",
    },
    walletAddress: "0x1234...5678",
    timestamp: 1700000000000,
  },

  // Supported hackathons
  supportedEvents: [
    "ETHGlobal Buenos Aires",
    "ETHGlobal San Francisco",
    "ETHGlobal Bangkok",
    "ETHGlobal Brussels",
    // Add more as needed
  ],

  // Categories for vouch catalog
  categories: ["identity", "social", "events", "hackathon"],
  tags: ["ethglobal", "hackathon", "attendance", "verification", "web3"],
};

