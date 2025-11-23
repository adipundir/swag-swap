# 🔍 Problem: Client-Side Rendering

## What We Discovered

ETHGlobal's event pages use **client-side rendering** (React/Next.js SPA):

```
Server Response (what we get):
<!DOCTYPE html>
<html>
  <head>
    <script src="..."></script>
  </head>
  <body>
    <div id="__next"></div>  ← Empty! Content loads via JS
  </body>
</html>
```

**After JavaScript runs in browser:**
```html
<div id="__next">
  <p class="font-semibold">You are fully confirmed to attend this event!</p>
</div>
```

## Why This Matters for vlayer

vlayer's **Web Proofs** are designed to prove data from:
1. ✅ **Static HTML pages**
2. ✅ **API responses** (JSON)
3. ✅ **Server-rendered content**
4. ❌ **NOT client-side rendered React apps** (without browser automation)

## Solutions

### Solution 1: Use vouch with Browser Extension (BEST)

**vouch** uses a **browser extension** which can:
- ✅ Wait for JavaScript to render
- ✅ Access the fully rendered DOM
- ✅ See the confirmation text
- ✅ Generate Web Proof of the final page

**Implementation:**
```typescript
// Use vouch's browser-based proving
import { vouch } from '@vlayer/sdk';

const proof = await vouch.prove({
  url: 'https://ethglobal.com/events/buenosaires/home',
  selector: 'p.font-semibold',
  expectedText: 'You are fully confirmed to attend this event!',
  waitForSelector: true, // Wait for JS to render
});
```

**Track eligibility:** 
- ✅ Best vouch Integration ($2,000)
- ✅ BONUS: Build a Custom vouch Data Source ($1,000)
- **Total: $3,000** (same as server-side track!)

### Solution 2: Use ETHGlobal API (If Available)

If ETHGlobal has an API endpoint that returns user data:

```bash
GET https://api.ethglobal.com/v1/user/events
Authorization: Bearer {access_token}

Response:
{
  "events": [
    {
      "name": "Buenos Aires",
      "status": "confirmed",
      "rsvp": "confirmed"
    }
  ]
}
```

This would work with server-side proving!

### Solution 3: Puppeteer/Playwright (Hackathon Demo)

For hackathon purposes, use a headless browser:

```typescript
import puppeteer from 'puppeteer';

async function getConfirmationWithBrowser(url: string, token: string) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set the cookie
  await page.setCookie({
    name: 'ethglobal_access_token',
    value: token,
    domain: 'ethglobal.com',
  });
  
  // Navigate and wait for content to load
  await page.goto(url, { waitUntil: 'networkidle0' });
  
  // Wait for the element to appear
  await page.waitForSelector('p.font-semibold');
  
  // Extract the text
  const confirmationText = await page.$eval(
    'p.font-semibold',
    el => el.textContent
  );
  
  await browser.close();
  
  return confirmationText; // "You are fully confirmed to attend this event!"
}
```

## Recommended Approach for Hackathon

### Switch to vouch Track

**Current situation:**
- Server-side proving ($3,000) - **Won't work with client-side rendering**
- vouch integration ($2,000) + Custom data source ($1,000) = **$3,000** - **Will work!**

**Why vouch is better for this:**
1. ✅ Browser extension can handle client-side rendering
2. ✅ Waits for JavaScript to execute
3. ✅ Can access the final rendered DOM
4. ✅ Perfect for proving SPA content
5. ✅ Same prize pool total

## Implementation Plan

### Step 1: Create vouch Data Source

```typescript
// lib/vlayer/vouch-ethglobal-source.ts
export const ethglobalVouchSource = {
  id: 'ethglobal-attendance',
  name: 'ETHGlobal Event Attendance',
  url: 'https://ethglobal.com/events/buenosaires/home',
  steps: [
    {
      step: 'startPage',
      url: 'https://ethglobal.com/events/buenosaires/home',
      label: 'Navigate to event page',
    },
    {
      step: 'userAction',
      label: 'Log in with your ETHGlobal account',
      waitForSelector: 'p.font-semibold',
    },
    {
      step: 'extractData',
      selector: 'p.font-semibold',
      claim: 'confirmationText',
    },
  ],
};
```

### Step 2: Submit to vouch Catalog

1. Create PR to vouch catalog repository
2. Add ETHGlobal data source
3. Get reviewed and merged
4. Use in your app

### Step 3: Update Frontend

```typescript
import { createVlayerClient } from '@vlayer/sdk';

const vlayer = createVlayerClient();

// User clicks verify
const proof = await vlayer.vouch.verify({
  dataSource: 'ethglobal-attendance',
  walletAddress: userWallet,
});

if (proof.claims.confirmationText.includes('fully confirmed')) {
  // User is verified!
}
```

## Alternative: Quick Hackathon Fix

For the hackathon demo, you could:

1. **Accept that we can't automatically verify**
2. **Ask users to manually confirm:**
   - "Do you see 'You are fully confirmed to attend this event!' on your event page?"
   - User clicks "Yes" → We store their attestation
3. **Show it as a limitation:**
   - "Due to client-side rendering, we verify based on your attestation"
   - Still shows the concept works

OR

4. **Use a simpler verification:**
   - If user has valid `ethglobal_access_token` → They're verified
   - Token itself proves they're logged into ETHGlobal
   - Check token expiry and format

## Conclusion

**The fundamental issue:**
- ETHGlobal uses React/Next.js SPA
- Content loads via JavaScript
- Server-side fetch only gets HTML shell
- Need browser automation to access rendered content

**Best path forward:**
- ✅ Switch to vouch track (same prize money!)
- ✅ Use browser-based proving
- ✅ Create custom vouch data source
- ✅ Perfect for this use case

**Quick fix:**
- ✅ Verify based on valid token presence
- ✅ Document the limitation
- ✅ Show proof of concept works

