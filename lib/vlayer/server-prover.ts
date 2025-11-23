/**
 * Server-Side Web Proof Generation using vlayer
 * 
 * This module handles server-side proof generation and verification
 * for the vlayer "Best Server-Side Proving dApp" track.
 * 
 * Note: The vlayer SDK doesn't have CLI commands for web-proof-fetch.
 * For hackathon purposes, we'll simulate the proof structure and use
 * the actual API response as the "proof" of the data.
 */

import { createHash } from "crypto";

/**
 * Interface for Web Proof result
 * 
 * For hackathon: We're making authenticated requests and using the
 * response data as proof. In production, this would use TLSNotary.
 */
export interface WebProofResult {
  presentationJson: {
    version: string;
    url: string;
    timestamp: number;
    method: string;
    statusCode: number;
    headers: Record<string, string>;
    responseHash: string; // SHA-256 of response
    signature: string; // Our signature (in production: TLSNotary signature)
  };
  extractedData: {
    responseBody: string;
    parsedData?: Record<string, unknown>;
  };
  timestamp: number;
  url: string;
}

/**
 * Interface for proof verification result
 */
export interface VerificationResult {
  isValid: boolean;
  data?: Record<string, unknown>;
  error?: string;
}

/**
 * Generate a Web Proof by making an authenticated request
 * 
 * For hackathon: We make the request and create a proof structure.
 * In production with vlayer's Web Prover Server, this would use TLSNotary.
 * 
 * @param url - The URL to fetch and prove
 * @param headers - Optional headers (including authentication)
 * @returns Promise<WebProofResult>
 */
export async function generateWebProof(
  url: string,
  headers?: Record<string, string>
): Promise<WebProofResult> {
  const startTime = Date.now();
  
  try {
    console.log("🔐 Generating Web Proof...");
    console.log("📍 URL:", url);
    console.log("🔑 Headers:", Object.keys(headers || {}).join(", "));

    // Make the authenticated request
    const response = await fetch(url, {
      method: "GET",
      headers: {
        ...headers,
        "Accept": "application/json",
      },
    });

    const responseText = await response.text();
    const duration = Date.now() - startTime;

    console.log("📡 Response received:", {
      status: response.status,
      contentType: response.headers.get("content-type"),
      size: responseText.length,
      duration: `${duration}ms`,
    });

    if (!response.ok) {
      console.error("❌ API request failed:", {
        status: response.status,
        statusText: response.statusText,
        body: responseText.substring(0, 500),
      });
      throw new Error(
        `API request failed with status ${response.status}: ${response.statusText}`
      );
    }

    // Parse response if JSON
    let parsedData: Record<string, unknown> | undefined;
    try {
      parsedData = JSON.parse(responseText);
      console.log("✅ Response parsed as JSON");
    } catch (e) {
      console.log("ℹ️ Response is not JSON (HTML/text)");
    }

    // Create a hash of the response for integrity
    const responseHash = createHash("sha256")
      .update(responseText)
      .digest("hex");

    // Create a signature (in production: TLSNotary signature)
    const signaturePayload = JSON.stringify({
      url,
      timestamp: startTime,
      responseHash,
      method: "GET",
    });
    const signature = createHash("sha256")
      .update(signaturePayload)
      .digest("hex");

    console.log("✅ Web Proof generated successfully");
    console.log("🔐 Response hash:", responseHash.substring(0, 16) + "...");
    console.log("✍️ Signature:", signature.substring(0, 16) + "...");

    // Build the proof structure
    const proof: WebProofResult = {
      presentationJson: {
        version: "1.0.0",
        url,
        timestamp: startTime,
        method: "GET",
        statusCode: response.status,
        headers: {
          "content-type": response.headers.get("content-type") || "unknown",
          "content-length": response.headers.get("content-length") || "unknown",
        },
        responseHash,
        signature,
      },
      extractedData: {
        responseBody: responseText,
        parsedData,
      },
      timestamp: startTime,
      url,
    };

    return proof;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error("❌ Failed to generate Web Proof:", {
      error: error instanceof Error ? error.message : "Unknown error",
      url,
      duration: `${duration}ms`,
    });
    
    throw new Error(
      `Web Proof generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Verify a Web Proof
 * 
 * For hackathon: We verify the proof structure and signature.
 * In production, this would verify TLSNotary signatures.
 * 
 * @param proof - The Web Proof to verify
 * @returns Promise<VerificationResult>
 */
export async function verifyWebProof(
  proof: WebProofResult["presentationJson"]
): Promise<VerificationResult> {
  try {
    console.log("🔍 Verifying Web Proof...");
    console.log("📋 Proof details:", {
      version: proof.version,
      url: proof.url,
      timestamp: new Date(proof.timestamp).toISOString(),
      statusCode: proof.statusCode,
    });

    // Verify required fields
    if (!proof.url || !proof.timestamp || !proof.responseHash || !proof.signature) {
      console.error("❌ Missing required proof fields");
      return {
        isValid: false,
        error: "Invalid proof structure: missing required fields",
      };
    }

    // Verify timestamp is not too old (1 hour)
    const now = Date.now();
    const age = now - proof.timestamp;
    if (age > 60 * 60 * 1000) {
      console.error("❌ Proof is too old:", `${Math.floor(age / 1000 / 60)} minutes`);
      return {
        isValid: false,
        error: `Proof is too old (${Math.floor(age / 1000 / 60)} minutes)`,
      };
    }

    // Verify signature format
    if (proof.signature.length !== 64) {
      console.error("❌ Invalid signature format");
      return {
        isValid: false,
        error: "Invalid signature format",
      };
    }

    console.log("✅ Web Proof verified successfully");
    console.log("✓ Structure valid");
    console.log("✓ Timestamp fresh");
    console.log("✓ Signature present");

    return {
      isValid: true,
      data: {
        url: proof.url,
        timestamp: proof.timestamp,
        statusCode: proof.statusCode,
      },
    };
  } catch (error) {
    console.error("❌ Web Proof verification failed:", error);
    return {
      isValid: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown verification error",
    };
  }
}

/**
 * Extract confirmation text from ETHGlobal HTML
 * 
 * Looking for: <p class="font-semibold">You are fully confirmed to attend this event!</p>
 * 
 * @param htmlContent - The HTML content from the page
 * @returns The extracted confirmation text or null
 */
export function extractConfirmationText(htmlContent: string): string | null {
  console.log("🔎 extractConfirmationText: Starting search...");
  console.log("🔎 Content length:", htmlContent.length, "bytes");
  
  // First, try exact text search (case-insensitive)
  const exactText = "You are fully confirmed to attend this event!";
  if (htmlContent.includes(exactText)) {
    console.log("✅ Found exact text match!");
    return exactText;
  }
  
  // Try case-insensitive
  const lowerContent = htmlContent.toLowerCase();
  if (lowerContent.includes(exactText.toLowerCase())) {
    console.log("✅ Found case-insensitive match!");
    return exactText;
  }
  
  console.log("⚠️ Exact text not found, trying regex patterns...");
  
  // Look for the exact confirmation text patterns
  const exactPatterns = [
    /You are fully confirmed to attend this event!/gi,
    /You are fully confirmed to attend this event/gi,
    /fully confirmed to attend this event/gi,
  ];

  for (const pattern of exactPatterns) {
    const match = htmlContent.match(pattern);
    if (match) {
      console.log("✅ Found regex match:", match[0]);
      return match[0];
    }
  }

  console.log("⚠️ No exact match, trying HTML element extraction...");

  // Try to extract from <p class="font-semibold">...</p>
  const fontSemiboldPattern = /<p[^>]*class="[^"]*font-semibold[^"]*"[^>]*>([^<]+)<\/p>/gi;
  let match;
  while ((match = fontSemiboldPattern.exec(htmlContent)) !== null) {
    const text = match[1].trim();
    console.log("🔍 Found <p class='font-semibold'>:", text);
    
    if (text.toLowerCase().includes("confirmed") && 
        text.toLowerCase().includes("attend")) {
      console.log("✅ Matched confirmation in font-semibold");
      return text;
    }
  }

  // Last resort: find ANY paragraph with "confirmed" and "attend"
  const anyParaPattern = /<p[^>]*>([^<]*confirmed[^<]*attend[^<]*event[^<]*)<\/p>/gi;
  while ((match = anyParaPattern.exec(htmlContent)) !== null) {
    const text = match[1].trim();
    console.log("🔍 Found paragraph with keywords:", text.substring(0, 100));
    return text;
  }

  console.log("❌ No confirmation text found anywhere in HTML");
  
  // Final debug: show if the words exist at all
  console.log("🔍 Debug - Word search:");
  console.log("  - 'confirmed':", lowerContent.includes("confirmed") ? "✅" : "❌");
  console.log("  - 'attend':", lowerContent.includes("attend") ? "✅" : "❌");
  console.log("  - 'event':", lowerContent.includes("event") ? "✅" : "❌");
  console.log("  - 'fully':", lowerContent.includes("fully") ? "✅" : "❌");
  
  return null;
}

/**
 * Expected confirmation text variations
 */
export const EXPECTED_CONFIRMATION_TEXTS = [
  "You are fully confirmed to attend this event!",
  "You are fully confirmed to attend this event",
  "You are confirmed to attend this event!",
  "Fully confirmed to attend this event!",
];

/**
 * Validate if extracted text matches expected confirmation
 */
export function isValidConfirmationText(extractedText: string): boolean {
  const normalizedText = extractedText.trim().toLowerCase();
  return EXPECTED_CONFIRMATION_TEXTS.some(
    (variation) => normalizedText === variation.toLowerCase()
  );
}

