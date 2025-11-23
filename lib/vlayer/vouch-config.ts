/**
 * vlayer Vouch Configuration for ETHGlobal Verification
 * 
 * This is a custom data source for vlayer's Vouch catalog.
 * 
 * Track Eligibility:
 * - ✅ Best Vouch Integration ($2,000)
 * - ✅ BONUS: Build a Custom Vouch Data Source ($1,000)
 * Total: $3,000
 * 
 * How it works:
 * 1. User clicks "Verify Hacker"
 * 2. Vouch extension opens (client-side proof generation)
 * 3. User authenticates with ETHGlobal
 * 4. Vouch generates TLSNotary proof in browser
 * 5. Proof is sent to our server for verification
 * 6. Server validates and stores verification status
 */

/**
 * ETHGlobal Attendance Verification Data Source
 * 
 * This custom data source verifies that a user is confirmed
 * to attend an ETHGlobal hackathon event.
 */
export const ethGlobalVouchConfig = {
  // Data source metadata
  id: "ethglobal-attendance",
  name: "ETHGlobal Hackathon Attendance",
  description: "Verify you're a confirmed ETHGlobal hackathon participant",
  icon: "https://ethglobal.com/favicon.ico",
  
  // Categories for Vouch catalog
  categories: ["identity", "events"],
  tags: ["ethglobal", "hackathon", "web3", "attendance"],

  // The URL pattern to verify
  urlPattern: "https://ethglobal.com/events/*/home",
  
  // Claims that will be proven
  claims: {
    isConfirmed: {
      type: "boolean",
      description: "User is confirmed to attend the hackathon",
      required: true,
    },
    eventName: {
      type: "string", 
      description: "Name of the ETHGlobal event",
      required: false,
    },
  },

  // Proof generation instructions
  proof: {
    // What to look for on the page
    selectors: [
      {
        name: "confirmationText",
        selector: "p.font-semibold",
        extract: "textContent",
        validate: (text: string) => 
          text.trim().toLowerCase().includes("you are fully confirmed to attend this event"),
      },
    ],
    
    // Privacy: Redact sensitive data
    redact: {
      cookies: ["session", "csrf"],
      localStorage: ["auth_token"],
      elements: ["input[type='password']", ".personal-info"],
    },
  },
} as const;

/**
 * Validation function for confirmation text
 */
export function isValidETHGlobalConfirmation(text: string): boolean {
  const validPatterns = [
    "you are fully confirmed to attend this event!",
    "you are fully confirmed to attend this event",
    "you are confirmed to attend this event",
  ];
  
  const normalized = text.trim().toLowerCase();
  return validPatterns.some(pattern => normalized.includes(pattern));
}

/**
 * Extract event name from URL or page content
 */
export function extractEventName(url: string, pageContent?: string): string {
  // Try to extract from URL first
  const urlMatch = url.match(/\/events\/([^\/]+)\//);
  if (urlMatch) {
    const eventSlug = urlMatch[1];
    // Convert slug to title case (e.g., "buenosaires" -> "Buenos Aires")
    return eventSlug
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
  
  // Fallback to page content parsing if URL extraction fails
  if (pageContent) {
    // Look for event name in common patterns
    const patterns = [
      /ETHGlobal ([A-Za-z\s]+)/i,
      /<h1[^>]*>([^<]+)<\/h1>/i,
    ];
    
    for (const pattern of patterns) {
      const match = pageContent.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
  }
  
  return "Unknown Event";
}

