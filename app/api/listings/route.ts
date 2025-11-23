import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/app/lib/db";

// Define the Listing type (matches API response format)
interface Listing {
  id: string;
  title: string;
  description: string;
  price: string;
  imageUrl?: string;
  category: string;
  seller: string;
  createdAt: string;
}

// GET /api/listings - Fetch all listings (protected by x402 middleware)
export async function GET(request: NextRequest) {
  try {
    const rows = await sql`
      SELECT 
        id,
        title,
        description,
        price,
        image_url as "imageUrl",
        category,
        seller,
        created_at as "createdAt"
      FROM listings
      ORDER BY created_at DESC
    `;

    const listings: Listing[] = rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      price: row.price,
      imageUrl: row.imageUrl || undefined,
      category: row.category,
      seller: row.seller,
      createdAt: row.createdAt,
    }));

    return NextResponse.json({
      success: true,
      listings: listings,
      count: listings.length,
    });
  } catch (error) {
    console.error("Error fetching listings:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch listings",
      },
      { status: 500 }
    );
  }
}

// POST /api/listings - Create a new listing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { title, description, price, category, seller } = body;

    if (!title || !description || !price || !category || !seller) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: title, description, price, category, seller",
        },
        { status: 400 }
      );
    }

    // Validate seller address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(seller)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid seller address format",
        },
        { status: 400 }
      );
    }

    // Insert into Neon database
    const [newListing] = await sql`
      INSERT INTO listings (title, description, price, image_url, category, seller)
      VALUES (${title.trim()}, ${description.trim()}, ${price.trim()}, ${body.imageUrl?.trim() || null}, ${category.trim()}, ${seller.toLowerCase()})
      RETURNING 
        id,
        title,
        description,
        price,
        image_url as "imageUrl",
        category,
        seller,
        created_at as "createdAt"
    `;

    const listing: Listing = {
      id: newListing.id,
      title: newListing.title,
      description: newListing.description,
      price: newListing.price,
      imageUrl: newListing.imageUrl || undefined,
      category: newListing.category,
      seller: newListing.seller,
      createdAt: newListing.createdAt,
    };

    return NextResponse.json(
      {
        success: true,
        listing: listing,
        message: "Listing created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating listing:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create listing",
      },
      { status: 500 }
    );
  }
}
