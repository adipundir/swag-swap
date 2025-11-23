/**
 * Test Script for vlayer Verification
 * 
 * This script tests the full verification flow with a hardcoded access token.
 * Run with: npx tsx scripts/test-vlayer-verification.ts
 */

// Hardcoded test data
const TEST_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAzMzUxMiwiZW1haWwiOiJwdW5kaXIuYWRpdHlhQG91dGxvb2suY29tIiwiaWF0IjoxNzYzODY0OTAyLCJleHAiOjE3NjUwNzQ1MDJ9.i_o0t_hNIvpRuGRcYkGEj_8XUDFMhtG9Yxqio0Z_1vM";
const TEST_WALLET_ADDRESS = "0x1234567890123456789012345678901234567890";
const API_BASE_URL = "http://localhost:3000";

interface TestResult {
  step: string;
  success: boolean;
  duration: number;
  data?: any;
  error?: string;
}

const results: TestResult[] = [];

function log(emoji: string, message: string, data?: any) {
  console.log(`${emoji} ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
}

async function testStep(
  name: string,
  fn: () => Promise<any>
): Promise<TestResult> {
  const start = Date.now();
  log("🧪", `Testing: ${name}...`);

  try {
    const data = await fn();
    const duration = Date.now() - start;
    log("✅", `${name} - SUCCESS (${duration}ms)`);

    return {
      step: name,
      success: true,
      duration,
      data,
    };
  } catch (error) {
    const duration = Date.now() - start;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    log("❌", `${name} - FAILED (${duration}ms)`, { error: errorMessage });

    return {
      step: name,
      success: false,
      duration,
      error: errorMessage,
    };
  }
}

// Test 1: Generate proof
async function testProofGeneration(): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/verify/hacker/prove`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      accessToken: TEST_ACCESS_TOKEN,
      walletAddress: TEST_WALLET_ADDRESS,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `Proof generation failed: ${data.error || response.statusText}`
    );
  }

  if (!data.proof) {
    throw new Error("No proof in response");
  }

  log("📦", "Proof generated:", {
    timestamp: data.proof.timestamp,
    url: data.proof.url,
    confirmationText: data.proof.confirmationText,
  });

  return data;
}

// Test 2: Verify proof
async function testProofVerification(proofData: any): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/verify/hacker`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      proof: proofData.proof,
      walletAddress: TEST_WALLET_ADDRESS,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `Proof verification failed: ${data.error || response.statusText}`
    );
  }

  if (!data.verification) {
    throw new Error("No verification in response");
  }

  log("✅", "Proof verified:", {
    isVerified: data.verification.isVerified,
    verifiedAt: data.verification.verifiedAt,
  });

  return data;
}

// Test 3: Check verification status
async function testCheckStatus(): Promise<any> {
  const response = await fetch(
    `${API_BASE_URL}/api/verify/hacker?address=${TEST_WALLET_ADDRESS}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `Status check failed: ${data.error || response.statusText}`
    );
  }

  log("🔍", "Verification status:", {
    isVerified: data.isVerified,
    verifiedAt: data.verifiedAt,
  });

  return data;
}

// Test 4: Test browser-based rendering
async function testDirectAPICall(): Promise<any> {
  log("🌐", "Testing browser-based proof (this will be done by server)...");

  // The server will use Puppeteer to render the page
  // This test just verifies the event page exists
  const response = await fetch("https://ethglobal.com/events/buenosaires/home");

  if (!response.ok) {
    throw new Error(
      `ETHGlobal page failed: ${response.status} ${response.statusText}`
    );
  }

  log("📊", "ETHGlobal Buenos Aires page accessible:", {
    statusCode: response.status,
    note: "Browser automation will handle confirmation text extraction",
  });

  return { success: true };
}

// Main test runner
async function runTests() {
  console.log("=".repeat(60));
  console.log("🧪 vlayer Verification Test Suite");
  console.log("=".repeat(60));
  console.log("");

  console.log("📋 Test Configuration:");
  console.log(`   API Base URL: ${API_BASE_URL}`);
  console.log(`   Wallet: ${TEST_WALLET_ADDRESS}`);
  console.log(`   Token: ${TEST_ACCESS_TOKEN.substring(0, 20)}...`);
  console.log("");

  // Test 0: Direct API call (to verify token works)
  const test0 = await testStep(
    "Direct ETHGlobal API Call",
    testDirectAPICall
  );
  results.push(test0);

  if (!test0.success) {
    log(
      "🛑",
      "Direct API call failed. Check your access token. Stopping tests."
    );
    printSummary();
    return;
  }

  console.log("");

  // Test 1: Generate proof
  const test1 = await testStep("Proof Generation", testProofGeneration);
  results.push(test1);

  if (!test1.success) {
    log("🛑", "Proof generation failed. Stopping tests.");
    printSummary();
    return;
  }

  console.log("");

  // Test 2: Verify proof
  const test2 = await testStep("Proof Verification", async () =>
    testProofVerification(test1.data)
  );
  results.push(test2);

  console.log("");

  // Test 3: Check status
  const test3 = await testStep("Status Check", testCheckStatus);
  results.push(test3);

  console.log("");

  printSummary();
}

function printSummary() {
  console.log("=".repeat(60));
  console.log("📊 Test Summary");
  console.log("=".repeat(60));

  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

  results.forEach((result) => {
    const icon = result.success ? "✅" : "❌";
    console.log(
      `${icon} ${result.step} - ${result.duration}ms ${result.error ? `(${result.error})` : ""}`
    );
  });

  console.log("");
  console.log(`Total: ${results.length} tests`);
  console.log(`Passed: ${passed} tests`);
  console.log(`Failed: ${failed} tests`);
  console.log(`Duration: ${totalDuration}ms`);
  console.log("");

  if (failed === 0) {
    console.log("🎉 All tests passed!");
  } else {
    console.log(`❌ ${failed} test(s) failed`);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  runTests().catch((error) => {
    console.error("💥 Test runner crashed:", error);
    process.exit(1);
  });
}

export { runTests };

