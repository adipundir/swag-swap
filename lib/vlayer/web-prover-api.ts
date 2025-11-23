/**
 * vlayer Web Prover Server REST API Integration
 * 
 * This module integrates with vlayer's Web Prover Server to generate
 * and verify cryptographic Web Proofs using TLSNotary (TLSN) protocol.
 * 
 * API Documentation: https://docs.vlayer.xyz/web-prover-server
 * 
 * Track Eligibility: ✅ Best Server-Side Proving dApp ($3,000)
 * - Uses vlayer's official Web Prover Server REST API
 * - Server-side proof generation
 * - TLSNotary protocol for cryptographic verification
 */

/**
 * Web Prover Server Configuration
 */
const WEB_PROVER_BASE_URL = process.env.VLAYER_WEB_PROVER_URL || 'https://web-prover.vlayer.xyz';
const WEB_PROVER_CLIENT_ID = process.env.VLAYER_CLIENT_ID || '4f028e97-b7c7-4a81-ade2-6b1a2917380c'; // Public test credentials
const WEB_PROVER_AUTH_TOKEN = process.env.VLAYER_AUTH_TOKEN || 'jUWXi1pVUoTHgc7MOgh5X0zMR12MHtAhtjVgMc2DM3B3Uc8WEGQAEix83VwZ'; // Public test credentials

/**
 * Request definition for POST /api/v1/prove endpoint
 */
export interface ProveRequest {
  url: string; // HTTPS URL to make a request to
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'; // HTTP method (defaults to GET)
  headers?: string[]; // Array of headers formatted as "Header-Name: Header-Value"
  body?: string; // Request body data for POST requests
  notaryUrl?: string; // URL of the notary server (optional, uses vlayer's test server by default)
  host?: string; // Optional override for the target host
  maxRecvData?: number; // Optional maximum number of bytes to receive
}

/**
 * Response from POST /api/v1/prove endpoint
 */
export interface ProveResponse {
  data: string; // Hex-encoded proof data
  version: string; // Version of the TLSN protocol used
  meta: {
    notaryUrl: string; // URL of the notary service that was used
  };
}

/**
 * Request for POST /api/v1/verify endpoint
 * Send the entire ProveResponse as the request body
 */
export type VerifyRequest = ProveResponse;

/**
 * Response from POST /api/v1/verify endpoint
 */
export interface VerifyResponse {
  success: boolean; // Whether the proof verification was successful
  serverDomain: string; // The domain name of the server that was contacted
  notaryKeyFingerprint: string; // Fingerprint of the notary's public key
  request: {
    method: string;
    url: string;
    version: string;
    headers: Array<[string, string]>; // Array of [name, value] pairs
    body: string | null; // Decoded UTF-8 string
    raw: string; // Raw transcript bytes as hex-encoded string
  };
  response: {
    status: number;
    version: string;
    headers: Array<[string, string]>; // Array of [name, value] pairs
    body: string; // Decoded UTF-8 string (automatically decoded from chunked/gzip)
    raw: string; // Raw transcript bytes as hex-encoded string
  };
  error?: string; // Error message if verification failed
}

/**
 * Generate a Web Proof using vlayer's Web Prover Server
 * 
 * @param url - The HTTPS URL to prove
 * @param accessToken - ETHGlobal access token for authentication
 * @returns Promise<ProveResponse>
 */
export async function generateWebProof(
  url: string,
  accessToken: string
): Promise<ProveResponse> {
  console.log("🔐 Generating Web Proof via vlayer Web Prover Server REST API...");
  console.log("📍 URL:", url);
  console.log("🔑 Using vlayer test credentials");

  try {
    const proveRequest: ProveRequest = {
      url: url,
      method: 'GET',
      headers: [
        `Cookie: ethglobal_access_token=${accessToken}`,
        'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language: en-US,en;q=0.9',
      ],
    };

    console.log("📤 Sending request to Web Prover Server...");
    console.log("   Endpoint: POST", `${WEB_PROVER_BASE_URL}/api/v1/prove`);
    
    const response = await fetch(`${WEB_PROVER_BASE_URL}/api/v1/prove`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': WEB_PROVER_CLIENT_ID,
        'Authorization': `Bearer ${WEB_PROVER_AUTH_TOKEN}`,
      },
      body: JSON.stringify(proveRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Web Prover Server error:", response.status, errorText);
      throw new Error(`Web Prover Server returned ${response.status}: ${errorText}`);
    }

    const result: ProveResponse = await response.json();
    
    if (!result.data || !result.version) {
      throw new Error('Invalid response from Web Prover Server');
    }

    console.log("✅ Web Proof generated successfully");
    console.log("📊 Proof data length:", result.data.length, "characters (hex)");
    console.log("🔖 TLSN version:", result.version);
    console.log("🔒 Notary URL:", result.meta.notaryUrl);

    return result;
  } catch (error) {
    console.error("❌ Failed to generate Web Proof:", error);
    throw new Error(
      `Web Proof generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Verify a Web Proof using vlayer's Web Prover Server
 * 
 * @param proof - The complete ProveResponse object from /api/v1/prove
 * @returns Promise<VerifyResponse>
 */
export async function verifyWebProof(
  proof: ProveResponse
): Promise<VerifyResponse> {
  console.log("🔍 Verifying Web Proof via vlayer Web Prover Server REST API...");
  console.log("📊 Proof data length:", proof.data.length, "characters");
  console.log("🔖 TLSN version:", proof.version);

  try {
    console.log("📤 Sending verification request...");
    console.log("   Endpoint: POST", `${WEB_PROVER_BASE_URL}/api/v1/verify`);
    
    const response = await fetch(`${WEB_PROVER_BASE_URL}/api/v1/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': WEB_PROVER_CLIENT_ID,
        'Authorization': `Bearer ${WEB_PROVER_AUTH_TOKEN}`,
      },
      body: JSON.stringify(proof), // Send the entire ProveResponse
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Verification error:", response.status, errorText);
      throw new Error(`Verification failed with ${response.status}: ${errorText}`);
    }

    const result: VerifyResponse = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Web Proof verification failed - proof is invalid');
    }

    console.log("✅ Web Proof verified successfully");
    console.log("🌐 Server domain:", result.serverDomain);
    console.log("🔑 Notary key fingerprint:", result.notaryKeyFingerprint.substring(0, 16) + "...");
    console.log("📄 HTTP Transcript:");
    console.log("   Request:", result.request.method, result.request.url);
    console.log("   Response:", result.response.status, result.response.version);
    console.log("   Response body length:", result.response.body.length, "bytes");
    
    return result;
  } catch (error) {
    console.error("❌ Failed to verify Web Proof:", error);
    throw new Error(
      `Web Proof verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Extract confirmation text from HTTP response body
 * 
 * This is a fallback in case the Web Prover Server's extractors don't work
 * 
 * @param htmlContent - The HTML response body
 * @returns string | null - The extracted confirmation text, or null if not found
 */
export function extractConfirmationText(htmlContent: string): string | null {
  console.log("📄 Parsing HTML response for confirmation text...");
  console.log(`📏 Response size: ${htmlContent.length} bytes`);

  const patterns = [
    "You are fully confirmed to attend this event!",
    "You are fully confirmed to attend this event",
    "fully confirmed to attend",
    "confirmed to attend this event",
  ];

  // Try exact text search first
  for (const pattern of patterns) {
    if (htmlContent.includes(pattern)) {
      console.log(`✅ Found exact pattern: "${pattern}"`);
      return pattern;
    }
  }

  // Try case-insensitive search
  const lowerContent = htmlContent.toLowerCase();
  for (const pattern of patterns) {
    const index = lowerContent.indexOf(pattern.toLowerCase());
    if (index !== -1) {
      const extracted = htmlContent.substring(index, index + pattern.length);
      console.log(`✅ Found case-insensitive match: "${extracted}"`);
      return extracted;
    }
  }

  console.log("❌ No confirmation text found");
  return null;
}

/**
 * Validate if extracted text is a valid confirmation
 */
export function isValidConfirmationText(text: string): boolean {
  const validTexts = [
    "You are fully confirmed to attend this event!",
    "You are fully confirmed to attend this event",
    "You are confirmed to attend this event!",
    "fully confirmed to attend",
  ];

  const normalizedText = text.trim().toLowerCase();
  return validTexts.some(
    (valid) => normalizedText.includes(valid.toLowerCase())
  );
}

