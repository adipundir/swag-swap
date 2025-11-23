# 🤖 Auto-Test Script for vlayer Verification

This guide explains how to use the **automatic testing script** that continuously monitors and improves the vlayer verification protocol.

## 🎯 What It Does

The auto-test script:

1. **Continuously tests** the vlayer verification flow (every 5 seconds)
2. **Captures full API responses** including errors and success data
3. **Automatically detects** common failure patterns
4. **Provides actionable insights** for debugging
5. **Saves detailed logs** to files for later analysis
6. **Shows real-time statistics** (success rate, failure count, etc.)
7. **Never needs manual intervention** - just let it run!

## 🚀 How to Use

### Step 1: Start Your Dev Server

In one terminal, run:

```bash
npm run dev
```

### Step 2: Start the Auto-Test Script

In another terminal, run:

```bash
npm run test:vlayer:auto
```

### Step 3: Watch the Magic ✨

The script will:
- Run tests automatically every 5 seconds
- Display colored output showing test results
- Save detailed logs to `test-logs/` directory
- Detect and report issues in real-time
- Calculate statistics (success rate, average duration, etc.)

### Step 4: Stop When Done

Press `Ctrl+C` to stop the script. It will show final statistics before exiting.

## 📊 What You'll See

### Successful Test Output

```
================================================================================
🧪 TEST #1 - 11/23/2025, 3:45:30 PM
================================================================================

📝 Step 1: Generating proof...
   URL: http://localhost:3000/api/verify/hacker/prove
   Wallet: 0x1234567890123456789012345678901234567890
   Token: eyJhbGciOiJIUzI1NiI...

✅ Proof generation response:
{
  "success": true,
  "proof": {
    "timestamp": 1732389930000,
    "url": "https://ethglobal.com/events/buenosaires/home",
    "extractedText": "You are fully confirmed to attend this event!",
    "contentHash": "abc123...",
    "signature": "def456..."
  }
}

📝 Step 2: Verifying proof...

✅ Verification response:
{
  "success": true,
  "verification": {
    "isVerified": true,
    "verifiedAt": "2025-11-23T20:45:30.123Z"
  }
}

✅ TEST PASSED
   Duration: 3456ms

────────────────────────────────────────────────────────────────────────────────
📊 STATISTICS
────────────────────────────────────────────────────────────────────────────────
   Total Tests: 1
   Passed: 1 (100.0%)
   Failed: 0 (0.0%)
   Consecutive Failures: 0
   Average Duration: 3456ms

📁 Logs saved to: /path/to/test-logs
```

### Failed Test Output (with Insights)

```
================================================================================
🧪 TEST #2 - 11/23/2025, 3:45:35 PM
================================================================================

❌ TEST FAILED
   Error: Could not find element "p.font-semibold" on the page

   API Response:
{
  "success": false,
  "error": "Could not find element..."
}

💡 Insights:
   🔍 Selector issue - Element not found on page
   💡 Check debug-screenshot.png to see what the page looks like

────────────────────────────────────────────────────────────────────────────────
📊 STATISTICS
────────────────────────────────────────────────────────────────────────────────
   Total Tests: 2
   Passed: 1 (50.0%)
   Failed: 1 (50.0%)
   Consecutive Failures: 1
   Average Duration: 2890ms

🔍 Detected Issues:
   - SELECTOR_NOT_FOUND

📁 Logs saved to: /path/to/test-logs
```

## 🔍 Understanding the Insights

The script automatically detects common issues and provides insights:

| Issue | Insight | What to Do |
|-------|---------|------------|
| **SERVER_ERROR** | Server error (500) | Check server terminal logs for stack trace |
| **BAD_REQUEST** | Bad request (400) | Input validation or proof verification failed |
| **SELECTOR_NOT_FOUND** | Element not found | Check `debug-screenshot.png` to see page state |
| **AUTH_ISSUE** | Authentication failed | Token might be expired or invalid |
| **CONFIRMATION_TEXT_ISSUE** | Confirmation text not found | User might not be confirmed for event |
| **SYNTAX_ERROR** | Code syntax error | Check `lib/vlayer/browser-prover.ts` |
| **TIMEOUT** | Request timeout | Server is taking too long (>60s) |
| **SERVER_NOT_RUNNING** | Connection refused | Run `npm run dev` first |

## 📁 Log Files

Each test run saves a detailed JSON log to `test-logs/`:

```json
{
  "timestamp": "2025-11-23T20:45:30.123Z",
  "testNumber": 1,
  "success": true,
  "duration": 3456,
  "apiResponse": {
    "prove": { ... },
    "verify": { ... }
  },
  "insights": []
}
```

## 🎛️ Configuration

Edit `scripts/auto-test-vlayer.ts` to customize:

```typescript
const API_BASE_URL = 'http://localhost:3000';  // Change if using different port
const TEST_INTERVAL = 5000;                     // Change test frequency (ms)
const WALLET_ADDRESS = '0x123...';              // Your test wallet
const ACCESS_TOKEN = 'eyJ...';                  // Your ETHGlobal token
```

## 💡 Tips

1. **Run Overnight**: Let it run for hours to catch intermittent issues
2. **Monitor Patterns**: Look for trends in failure rates
3. **Check Screenshots**: The script saves `debug-screenshot.png` on errors
4. **Review Logs**: Detailed JSON logs help debug complex issues
5. **Track Success Rate**: A healthy implementation should have >95% success rate

## 🎯 Track Eligibility

This testing approach ensures you remain eligible for vlayer's **Best Server-Side Proving dApp** track because:

✅ **Server-side proof generation** - All proofs are generated on your server  
✅ **REST API usage** - Uses vlayer's Web Prover principles (Puppeteer-based)  
✅ **No client-side proving** - User never generates proofs in their browser  
✅ **Cryptographic verification** - All proofs are cryptographically signed  
✅ **Production-ready** - Automated testing ensures reliability  

## 🚨 Troubleshooting

### Script won't start
```bash
# Make sure dependencies are installed
npm install

# Make sure tsx is available
npm install -D tsx
```

### Tests keep failing with "Connection refused"
```bash
# Start the dev server first
npm run dev
```

### All tests show syntax errors
```bash
# Check for TypeScript compilation errors
npm run lint
```

## 📈 Success Metrics

For a production-ready implementation, aim for:

- ✅ **Success Rate**: >95%
- ✅ **Average Duration**: <5 seconds
- ✅ **Consecutive Failures**: <3
- ✅ **Zero syntax errors**: Always

---

**Happy Testing! 🎉**

If you encounter issues, check the detailed logs in `test-logs/` or review the insights provided by the script.

