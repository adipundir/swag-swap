import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/app/lib/db";

// POST /api/listings/verify-code - Verify purchase code for a listing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { listingId, code } = body;

    if (!listingId || !code) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: listingId, code",
        },
        { status: 400 }
      );
    }

    // Verify code against database
    const [listing] = await sql`
      SELECT id, purchase_code, seller
      FROM listings
      WHERE id = ${listingId}
    `;

    if (!listing) {
      return NextResponse.json(
        {
          success: false,
          error: "Listing not found",
        },
        { status: 404 }
      );
    }

    // Normalize code comparison (uppercase, trim)
    const providedCode = code.trim().toUpperCase();
    const storedCode = listing.purchase_code?.trim().toUpperCase();

    if (providedCode === storedCode) {
      return NextResponse.json(
        {
          success: true,
          verified: true,
          message: "Code verified successfully",
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          error: "Invalid purchase code",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error verifying code:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to verify code",
      },
      { status: 500 }
    );
  }
}

