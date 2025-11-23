/**
 * ETHGlobal Dashboard Web Proof Configuration
 * 
 * This configuration defines how to verify a user's attendance status
 * on the ETHGlobal dashboard using vlayer Web Proofs.
 */

import type { WebProofStep } from "@vlayer/sdk";

/**
 * ETHGlobal dashboard URL pattern
 * This matches various ETHGlobal dashboard pages
 */
export const ETHGLOBAL_DASHBOARD_URL = "https://dashboard.ethglobal.com/**" as const;
export const ETHGLOBAL_DASHBOARD_BASE = "https://dashboard.ethglobal.com/" as const;

/**
 * Expected confirmation text variations
 * In case ETHGlobal uses slightly different wording
 */
export const expectedTextVariations = [
  'You are fully confirmed to attend this event!',
  'You are fully confirmed to attend this event',
  'You are confirmed to attend this event!',
  'Fully confirmed to attend this event!',
];

/**
 * Validation helper to check if extracted text matches any expected variation
 */
export function isValidConfirmationText(extractedText: string): boolean {
  const normalizedText = extractedText.trim().toLowerCase();
  return expectedTextVariations.some(
    (variation) => normalizedText === variation.toLowerCase()
  );
}

/**
 * Generate vlayer Web Proof steps for ETHGlobal verification
 * 
 * This creates the step-by-step configuration for the vlayer browser extension
 * to verify ETHGlobal attendance.
 */
export function generateWebProofSteps(): WebProofStep[] {
  return [
    // Step 1: Start at ETHGlobal dashboard
    {
      step: "startPage",
      url: ETHGLOBAL_DASHBOARD_BASE,
      label: "Navigate to ETHGlobal Dashboard",
    } as WebProofStep,

    // Step 2: Extract the confirmation status from the page
    {
      step: "extractVariables",
      url: ETHGLOBAL_DASHBOARD_URL,
      label: "Extract confirmation status",
      variables: [
        {
          name: "confirmationText",
          path: "p.font-semibold",
          source: "ResponseBody" as const,
        },
      ],
    } as WebProofStep,

    // Step 3: Notarize the page content
    {
      step: "notarize",
      url: ETHGLOBAL_DASHBOARD_URL,
      method: "GET",
      label: "Verify ETHGlobal attendance",
      redact: {
        // Redact sensitive personal information
        responseBody: [
          {
            jsonPath: "$.user.email",
            redactionType: "full",
          },
          {
            jsonPath: "$.user.phone",
            redactionType: "full",
          },
        ],
      },
      outputs: {
        // Extract the confirmation text as output
        responseBody: [
          {
            path: "p.font-semibold",
            name: "confirmationStatus",
          },
        ],
      },
    } as WebProofStep,
  ];
}

/**
 * Generate vlayer Web Proof request configuration
 * This is used by the client to request proof generation
 */
export function generateWebProofRequest() {
  return {
    logoUrl: "https://ethglobal.com/logo.png",
    steps: generateWebProofSteps(),
  };
}


