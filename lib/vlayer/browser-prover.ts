/**
 * Browser-Based Web Proof Generation using Puppeteer
 * 
 * This module uses a headless browser to:
 * 1. Navigate to ETHGlobal event pages
 * 2. Wait for JavaScript to render
 * 3. Extract the confirmation text from the DOM
 * 4. Generate cryptographic proof of the rendered content
 * 
 * This solves the client-side rendering problem where content
 * is loaded via JavaScript after initial page load.
 */

import puppeteer, { Browser, Page } from "puppeteer";
import { createHash } from "crypto";

/**
 * Browser proof configuration
 */
export interface BrowserProofConfig {
  url: string;
  accessToken: string;
  waitForSelector?: string;
  timeout?: number;
}

/**
 * Browser proof result
 */
export interface BrowserProofResult {
  presentationJson: {
    version: string;
    url: string;
    timestamp: number;
    method: string;
    selector: string;
    extractedText: string;
    screenshot: string; // base64 screenshot as proof
    pageHash: string; // SHA-256 of full HTML
    signature: string; // Our signature
  };
  extractedData: {
    confirmationText: string;
    pageTitle: string;
    fullHtml: string;
  };
  timestamp: number;
  url: string;
}

let browserInstance: Browser | null = null;

/**
 * Get or create browser instance (reuse for performance)
 */
async function getBrowser(): Promise<Browser> {
  if (browserInstance && browserInstance.connected) {
    console.log("♻️ Reusing existing browser instance");
    return browserInstance;
  }

  console.log("🌐 Launching headless browser...");
  browserInstance = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
    ],
  });

  // Handle browser disconnect
  browserInstance.on('disconnected', () => {
    console.log("🔌 Browser disconnected");
    browserInstance = null;
  });

  console.log("✅ Browser launched successfully");
  return browserInstance;
}

/**
 * Generate a Web Proof using browser automation
 * 
 * @param config - Configuration for proof generation
 * @returns Promise<BrowserProofResult>
 */
export async function generateBrowserProof(
  config: BrowserProofConfig
): Promise<BrowserProofResult> {
  const startTime = Date.now();
  const { url, accessToken, waitForSelector = 'p.font-semibold', timeout = 30000 } = config;

  let page: Page | null = null;

  try {
    console.log("🚀 Starting browser-based proof generation...");
    console.log("📍 URL:", url);
    console.log("🎯 Wait for selector:", waitForSelector);

    // Get browser instance
    const browser = await getBrowser();

    // Create new page
    page = await browser.newPage();

    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });

    console.log("🍪 Setting authentication cookie...");

    // Set the access token cookie
    await page.setCookie({
      name: 'ethglobal_access_token',
      value: accessToken,
      domain: '.ethglobal.com',
      path: '/',
      httpOnly: false,
      secure: true,
      sameSite: 'Lax',
    });

    console.log("🔗 Navigating to page...");

    // Navigate to the page and wait for network to be idle
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: timeout,
    });

    console.log("⏳ Waiting for content to render...");

    // Get the full HTML to see what we're working with
    console.log("📄 Getting page HTML...");
    const fullHtml = await page.content();
    console.log("📏 Full HTML size:", fullHtml.length, "bytes");
    
    // Log first 2000 characters of HTML
    console.log("\n=== PAGE HTML (first 2000 chars) ===");
    console.log(fullHtml.substring(0, 2000));
    console.log("=== END HTML ===\n");
    
    // Search for any <p> tags
    console.log("🔍 Searching for <p> tags...");
    const pTags = await page.$$eval('p', (elements) => 
      elements.map(el => ({
        text: el.textContent?.trim() || '',
        className: el.className,
        id: el.id,
      })).slice(0, 20) // First 20 p tags
    );
    console.log("📊 Found", pTags.length, "<p> tags:");
    pTags.forEach((tag, i) => {
      console.log(`  ${i + 1}. class="${tag.className}" id="${tag.id}" text="${tag.text.substring(0, 100)}"`);
    });
    
    // Search for "confirmed" text anywhere
    console.log("\n🔍 Searching for 'confirmed' text on page...");
    const confirmedElements = await page.$$eval('*', (elements) => 
      elements
        .filter(el => el.textContent?.toLowerCase().includes('confirmed'))
        .map(el => ({
          tag: el.tagName,
          text: el.textContent?.trim().substring(0, 200) || '',
          className: el.className,
          id: el.id,
        }))
        .slice(0, 10) // First 10 matches
    );
    console.log("📊 Found", confirmedElements.length, "elements with 'confirmed':");
    confirmedElements.forEach((el, i) => {
      console.log(`  ${i + 1}. <${el.tag}> class="${el.className}" text="${el.text}"`);
    });
    
    // Save screenshot to file
    console.log("\n📸 Taking screenshot and saving to file...");
    await page.screenshot({ 
      path: 'debug-screenshot.png',
      fullPage: true 
    });
    console.log("✅ Screenshot saved to: debug-screenshot.png");
    
    // Wait for the selector to appear (JavaScript has rendered)
    console.log("\n⏳ Now waiting for selector:", waitForSelector);
    try {
      await page.waitForSelector(waitForSelector, { timeout: timeout });
      console.log("✅ Selector found:", waitForSelector);
    } catch (e) {
      console.error("❌ Selector not found after timeout:", waitForSelector);
      console.log("💡 Check debug-screenshot.png to see what the page actually looks like");
      
      throw new Error(
        `Could not find element "${waitForSelector}" on the page. ` +
        `Check debug-screenshot.png to see what the browser rendered. ` +
        `This might mean you're not confirmed for the event, or the page structure changed.`
      );
    }

    // Extract the confirmation text
    console.log("📝 Extracting confirmation text...");
    
    const confirmationText = await page.$eval(
      waitForSelector,
      (el) => el.textContent?.trim() || ''
    );

    if (!confirmationText) {
      throw new Error(`Element "${waitForSelector}" found but has no text content`);
    }

    console.log("✅ Extracted text:", confirmationText);

    // Get page title
    const pageTitle = await page.title();
    console.log("📄 Page title:", pageTitle);

    // Get full rendered HTML (already extracted earlier)
    console.log("📏 Full HTML size:", fullHtml.length, "bytes");

    // Take screenshot as visual proof
    console.log("📸 Capturing screenshot...");
    const screenshot = await page.screenshot({
      encoding: 'base64',
      fullPage: false, // Just viewport
    });
    console.log("✅ Screenshot captured:", screenshot.length, "bytes (base64)");

    // Create hash of the page content
    const pageHash = createHash('sha256')
      .update(fullHtml)
      .digest('hex');

    // Create signature
    const signaturePayload = JSON.stringify({
      url,
      timestamp: startTime,
      pageHash,
      confirmationText,
      selector: waitForSelector,
    });
    const signature = createHash('sha256')
      .update(signaturePayload)
      .digest('hex');

    const duration = Date.now() - startTime;
    console.log(`✅ Browser proof generated successfully in ${duration}ms`);

    // Close the page
    await page.close();
    page = null;

    return {
      presentationJson: {
        version: '1.0.0',
        url,
        timestamp: startTime,
        method: 'BROWSER_AUTOMATION',
        selector: waitForSelector,
        extractedText: confirmationText,
        screenshot: screenshot.substring(0, 1000) + '...', // Truncate for logs
        pageHash,
        signature,
      },
      extractedData: {
        confirmationText,
        pageTitle,
        fullHtml,
      },
      timestamp: startTime,
      url,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Browser proof generation failed after ${duration}ms:`, error);

    // Clean up page if still open
    if (page) {
      try {
        await page.close();
      } catch (e) {
        console.error("Error closing page:", e);
      }
    }

    throw new Error(
      `Browser-based proof generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Verify a browser-based Web Proof
 * 
 * @param proof - The proof to verify
 * @returns Promise<boolean>
 */
export async function verifyBrowserProof(
  proof: BrowserProofResult['presentationJson']
): Promise<{ isValid: boolean; error?: string }> {
  try {
    console.log("🔍 Verifying browser-based proof...");

    // Verify required fields
    if (!proof.url || !proof.timestamp || !proof.pageHash || !proof.signature) {
      return {
        isValid: false,
        error: "Missing required proof fields",
      };
    }

    // Verify timestamp is not too old (1 hour)
    const now = Date.now();
    const age = now - proof.timestamp;
    if (age > 60 * 60 * 1000) {
      return {
        isValid: false,
        error: `Proof is too old (${Math.floor(age / 1000 / 60)} minutes)`,
      };
    }

    // Verify signature format
    if (proof.signature.length !== 64) {
      return {
        isValid: false,
        error: "Invalid signature format",
      };
    }

    // Verify extracted text exists
    if (!proof.extractedText || proof.extractedText.length === 0) {
      return {
        isValid: false,
        error: "No extracted text in proof",
      };
    }

    console.log("✅ Browser proof verified successfully");
    return { isValid: true };
  } catch (error) {
    console.error("❌ Proof verification failed:", error);
    return {
      isValid: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Close browser instance (cleanup)
 */
export async function closeBrowser(): Promise<void> {
  if (browserInstance && browserInstance.connected) {
    console.log("🔒 Closing browser instance...");
    await browserInstance.close();
    browserInstance = null;
    console.log("✅ Browser closed");
  }
}

/**
 * Check if confirmation text is valid
 */
export function isValidConfirmationText(text: string): boolean {
  const validTexts = [
    "You are fully confirmed to attend this event!",
    "You are fully confirmed to attend this event",
    "You are confirmed to attend this event!",
  ];

  const normalizedText = text.trim().toLowerCase();
  return validTexts.some(
    (valid) => normalizedText === valid.toLowerCase()
  );
}

// Cleanup on process exit
process.on('exit', () => {
  if (browserInstance && browserInstance.connected) {
    browserInstance.close();
  }
});

process.on('SIGINT', async () => {
  await closeBrowser();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeBrowser();
  process.exit(0);
});

