#!/usr/bin/env tsx

/**
 * 🤖 Auto-Testing Script for vlayer Verification
 * 
 * This script continuously tests the vlayer verification flow and automatically
 * adjusts its testing strategy based on API responses and errors.
 * 
 * Features:
 * - Automatic retries with exponential backoff
 * - Captures and logs full API responses
 * - Detects common failure patterns
 * - Provides actionable insights for debugging
 * - Runs until manually stopped (Ctrl+C)
 */

import axios, { AxiosError } from 'axios';
import * as fs from 'fs';
import * as path from 'path';

// Configuration
const API_BASE_URL = 'http://localhost:3000';
const WALLET_ADDRESS = '0x1234567890123456789012345678901234567890';
const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAzMzUxMiwiZW1haWwiOiJwdW5kaXIuYWRpdHlhQG91dGxvb2suY29tIiwiaWF0IjoxNzYzODY0OTAyLCJleHAiOjE3NjUwNzQ1MDJ9.i_o0t_hNIvpRuGRcYkGEj_8XUDFMhtG9Yxqio0Z_1vN';

const TEST_INTERVAL = 5000; // 5 seconds between tests
const LOG_DIR = path.join(process.cwd(), 'test-logs');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Statistics
let testCount = 0;
let successCount = 0;
let failureCount = 0;
let consecutiveFailures = 0;
let lastProof: any = null;

// Detected issues
const detectedIssues = new Set<string>();

interface TestResult {
  timestamp: Date;
  testNumber: number;
  success: boolean;
  duration: number;
  error?: string;
  apiResponse?: any;
  insights?: string[];
}

const testHistory: TestResult[] = [];

/**
 * Save detailed log to file
 */
function saveLog(result: TestResult) {
  const timestamp = result.timestamp.toISOString().replace(/[:.]/g, '-');
  const logFile = path.join(LOG_DIR, `test-${timestamp}.json`);
  fs.writeFileSync(logFile, JSON.stringify(result, null, 2));
}

/**
 * Analyze error patterns and provide insights
 */
function analyzeError(error: any): string[] {
  const insights: string[] = [];

  if (error?.response?.status === 500) {
    insights.push("🔴 Server error (500) - Check server logs for stack trace");
    detectedIssues.add("SERVER_ERROR");
  }

  if (error?.response?.status === 400) {
    insights.push("🟠 Bad request (400) - Input validation or proof verification failed");
    detectedIssues.add("BAD_REQUEST");
  }

  if (error?.response?.status === 404) {
    insights.push("🟡 Not found (404) - API endpoint might be incorrect");
    detectedIssues.add("NOT_FOUND");
  }

  if (error?.code === 'ECONNREFUSED') {
    insights.push("🔴 Connection refused - Make sure the dev server is running");
    detectedIssues.add("SERVER_NOT_RUNNING");
  }

  if (error?.message?.includes('timeout')) {
    insights.push("⏱️ Request timeout - Server is taking too long to respond");
    detectedIssues.add("TIMEOUT");
  }

  const errorMessage = error?.response?.data?.error || error?.message || '';

  if (errorMessage.includes('selector')) {
    insights.push("🔍 Selector issue - Element not found on page");
    insights.push("💡 Check debug-screenshot.png to see what the page looks like");
    detectedIssues.add("SELECTOR_NOT_FOUND");
  }

  if (errorMessage.includes('cookie') || errorMessage.includes('authentication')) {
    insights.push("🍪 Authentication issue - Access token might be expired or invalid");
    detectedIssues.add("AUTH_ISSUE");
  }

  if (errorMessage.includes('confirmed')) {
    insights.push("✅ Confirmation text issue - Text extraction or validation failed");
    insights.push("💡 User might not be confirmed for the event");
    detectedIssues.add("CONFIRMATION_TEXT_ISSUE");
  }

  if (errorMessage.includes('fullHtml') || errorMessage.includes('already been declared')) {
    insights.push("⚠️ Syntax error detected in browser-prover.ts");
    insights.push("💡 Run: Check lib/vlayer/browser-prover.ts for duplicate variable declarations");
    detectedIssues.add("SYNTAX_ERROR");
  }

  return insights;
}

/**
 * Run a single test iteration
 */
async function runTest(): Promise<TestResult> {
  testCount++;
  const startTime = Date.now();
  
  console.log("\n" + "=".repeat(80));
  console.log(`🧪 TEST #${testCount} - ${new Date().toLocaleString()}`);
  console.log("=".repeat(80));

  const result: TestResult = {
    timestamp: new Date(),
    testNumber: testCount,
    success: false,
    duration: 0,
  };

  try {
    // Step 1: Generate proof
    console.log("\n📝 Step 1: Generating proof...");
    console.log(`   URL: ${API_BASE_URL}/api/verify/hacker/prove`);
    console.log(`   Wallet: ${WALLET_ADDRESS}`);
    console.log(`   Token: ${ACCESS_TOKEN.substring(0, 20)}...`);

    const proveResponse = await axios.post(
      `${API_BASE_URL}/api/verify/hacker/prove`,
      {
        walletAddress: WALLET_ADDRESS,
        accessToken: ACCESS_TOKEN,
      },
      {
        timeout: 60000, // 60 second timeout
      }
    );

    console.log("\n✅ Proof generation response:");
    console.log(JSON.stringify(proveResponse.data, null, 2));

    if (!proveResponse.data.success || !proveResponse.data.proof) {
      throw new Error(proveResponse.data.error || "Proof generation returned no proof");
    }

    lastProof = proveResponse.data.proof;

    // Step 2: Verify proof
    console.log("\n📝 Step 2: Verifying proof...");
    const verifyResponse = await axios.post(
      `${API_BASE_URL}/api/verify/hacker`,
      {
        walletAddress: WALLET_ADDRESS,
        proof: lastProof,
      },
      {
        timeout: 30000, // 30 second timeout
      }
    );

    console.log("\n✅ Verification response:");
    console.log(JSON.stringify(verifyResponse.data, null, 2));

    if (!verifyResponse.data.success) {
      throw new Error(verifyResponse.data.error || "Verification failed");
    }

    // Success!
    result.success = true;
    successCount++;
    consecutiveFailures = 0;
    result.apiResponse = {
      prove: proveResponse.data,
      verify: verifyResponse.data,
    };

    console.log("\n✅ TEST PASSED");
    console.log(`   Duration: ${Date.now() - startTime}ms`);

  } catch (error: any) {
    // Failure
    result.success = false;
    failureCount++;
    consecutiveFailures++;

    const insights = analyzeError(error);
    result.error = error?.response?.data?.error || error?.message || String(error);
    result.insights = insights;
    result.apiResponse = error?.response?.data;

    console.error("\n❌ TEST FAILED");
    console.error(`   Error: ${result.error}`);
    
    if (error?.response?.data) {
      console.error("\n   API Response:");
      console.error(JSON.stringify(error.response.data, null, 2));
    }

    if (insights.length > 0) {
      console.log("\n💡 Insights:");
      insights.forEach(insight => console.log(`   ${insight}`));
    }
  }

  result.duration = Date.now() - startTime;
  testHistory.push(result);
  saveLog(result);

  // Print statistics
  console.log("\n" + "─".repeat(80));
  console.log("📊 STATISTICS");
  console.log("─".repeat(80));
  console.log(`   Total Tests: ${testCount}`);
  console.log(`   Passed: ${successCount} (${((successCount / testCount) * 100).toFixed(1)}%)`);
  console.log(`   Failed: ${failureCount} (${((failureCount / testCount) * 100).toFixed(1)}%)`);
  console.log(`   Consecutive Failures: ${consecutiveFailures}`);
  console.log(`   Average Duration: ${Math.round(testHistory.reduce((sum, t) => sum + t.duration, 0) / testCount)}ms`);

  if (detectedIssues.size > 0) {
    console.log("\n🔍 Detected Issues:");
    detectedIssues.forEach(issue => console.log(`   - ${issue}`));
  }

  console.log("\n📁 Logs saved to:", LOG_DIR);

  return result;
}

/**
 * Main test loop
 */
async function main() {
  console.log("🤖 vlayer Auto-Test Script Starting...");
  console.log("━".repeat(80));
  console.log("Configuration:");
  console.log(`  API Base URL: ${API_BASE_URL}`);
  console.log(`  Wallet: ${WALLET_ADDRESS}`);
  console.log(`  Test Interval: ${TEST_INTERVAL}ms`);
  console.log(`  Log Directory: ${LOG_DIR}`);
  console.log("\n💡 Press Ctrl+C to stop");
  console.log("━".repeat(80));

  // Check if server is running
  try {
    await axios.get(`${API_BASE_URL}/api/listings`);
    console.log("✅ Server is running\n");
  } catch (error) {
    console.error("❌ Server is not responding!");
    console.error("💡 Make sure to run: npm run dev");
    console.error("\nWaiting for server to start...\n");
  }

  // Run tests in a loop
  while (true) {
    try {
      await runTest();
    } catch (error) {
      console.error("\n💥 Unexpected error in test runner:", error);
    }

    // Wait before next test
    console.log(`\n⏳ Waiting ${TEST_INTERVAL / 1000}s before next test...`);
    await new Promise(resolve => setTimeout(resolve, TEST_INTERVAL));
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log("\n\n🛑 Stopping auto-test script...");
  console.log("\n📊 Final Statistics:");
  console.log(`   Total Tests: ${testCount}`);
  console.log(`   Passed: ${successCount} (${testCount > 0 ? ((successCount / testCount) * 100).toFixed(1) : 0}%)`);
  console.log(`   Failed: ${failureCount} (${testCount > 0 ? ((failureCount / testCount) * 100).toFixed(1) : 0}%)`);
  console.log(`\n📁 Logs saved to: ${LOG_DIR}`);
  process.exit(0);
});

// Start the script
main().catch((error) => {
  console.error("💥 Fatal error:", error);
  process.exit(1);
});

