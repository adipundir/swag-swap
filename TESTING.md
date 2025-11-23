# 🧪 Testing vlayer Verification

## Quick Test

To test the verification flow with a hardcoded access token:

```bash
# Make sure dev server is running in another terminal
npm run dev

# In a new terminal, run the test
npm run test:vlayer
```

## What It Tests

1. **Direct ETHGlobal API Call** - Verifies your access token works
2. **Proof Generation** - Tests `/api/verify/hacker/prove` endpoint
3. **Proof Verification** - Tests `/api/verify/hacker` endpoint  
4. **Status Check** - Tests verification status retrieval

## Expected Output

```
============================================================
🧪 vlayer Verification Test Suite
============================================================

📋 Test Configuration:
   API Base URL: http://localhost:3000
   Wallet: 0x1234567890123456789012345678901234567890
   Token: eyJhbGciOiJIUzI1NiI...

🧪 Testing: Direct ETHGlobal API Call...
✅ Direct ETHGlobal API Call - SUCCESS (500ms)

🧪 Testing: Proof Generation...
✅ Proof Generation - SUCCESS (2000ms)

🧪 Testing: Proof Verification...
✅ Proof Verification - SUCCESS (100ms)

🧪 Testing: Status Check...
✅ Status Check - SUCCESS (50ms)

============================================================
📊 Test Summary
============================================================
✅ Direct ETHGlobal API Call - 500ms
✅ Proof Generation - 2000ms
✅ Proof Verification - 100ms
✅ Status Check - 50ms

Total: 4 tests
Passed: 4 tests
Failed: 0 tests
Duration: 2650ms

🎉 All tests passed!
```

## Updating the Test Token

Edit `scripts/test-vlayer-verification.ts` and update:

```typescript
const TEST_ACCESS_TOKEN = "your-new-token-here";
const TEST_WALLET_ADDRESS = "your-wallet-address";
```

## Manual Testing in UI

1. Start dev server: `npm run dev`
2. Open http://localhost:3000
3. Connect your wallet
4. Click "Verify Hacker" tab
5. Click "Show access token input"
6. Paste your token from Local Storage:
   - Open dashboard.ethglobal.com
   - F12 → Application → Local Storage
   - Copy `ethglobal_access_token`
7. Click "Verify ETHGlobal Status"
8. Wait for proof generation (~20-30 seconds)
9. See confetti! 🎉

## Troubleshooting

### Error: "Invalid or expired access token"
- Get a new token from dashboard.ethglobal.com
- Tokens expire after ~14 days

### Error: "No ETHGlobal account found"
- Make sure you're logged into dashboard.ethglobal.com
- Register for an ETHGlobal event

### Error: "Failed to fetch"
- Make sure dev server is running (`npm run dev`)
- Check that you're using `http://localhost:3000` not `https://`

### Test Script Fails
```bash
# Check if server is running
curl http://localhost:3000/api/verify/hacker/prove

# Should return:
# {"message":"Server-Side Proving Endpoint",...}
```

## Logs

The application has comprehensive logging:

```bash
# Server logs show:
🚀 Generating proof for wallet: 0x...
🔐 Generating Web Proof...
📍 URL: https://api.ethglobal.com/v1/user/me
📡 Response received: { status: 200, size: 1234 }
✅ Web Proof generated successfully
🔍 Verifying Web Proof...
✅ Web Proof verified successfully
```

All logs include emojis for easy scanning!

