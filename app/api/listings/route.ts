import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

// Define the Listing type
interface Listing {
  id: string;
  title: string;
  description: string;
  price: string;
  imageUrl?: string;
  imageCid?: string; // Filecoin IPFS CID
  category: string;
  seller: string;
  createdAt: string;
}

// In-memory storage for listings (resets on server restart)
// For production, use a real database (PostgreSQL, MongoDB, etc.)
let listings: Listing[] = [
  {
    id: "1",
    title: "ETH Denver 2024 Hoodie",
    description: "Limited edition hoodie from ETH Denver 2024. Size L, barely worn.",
    price: "50 USDC",
    imageUrl: "https://via.placeholder.com/400x300?text=ETH+Denver+Hoodie",
    category: "clothing",
    seller: "0x1234567890123456789012345678901234567890",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Chainlink Fall Hackathon Cap",
    description: "Official Chainlink hackathon cap. Blue color, adjustable strap.",
    price: "15 USDC",
    imageUrl: "https://via.placeholder.com/400x300?text=Chainlink+Cap",
    category: "accessories",
    seller: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Base Hackathon T-Shirt",
    description: "Exclusive Base hackathon t-shirt. Size M, brand new condition.",
    price: "20 USDC",
    imageUrl: "https://via.placeholder.com/400x300?text=Base+Tshirt",
    category: "clothing",
    seller: "0x9876543210987654321098765432109876543210",
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    title: "Polygon zkEVM Sticker Pack",
    description: "Complete sticker pack from Polygon zkEVM hackathon. 10 unique stickers.",
    price: "5 USDC",
    imageUrl: "https://via.placeholder.com/400x300?text=Polygon+Stickers",
    category: "stickers",
    seller: "0x1111222233334444555566667777888899990000",
    createdAt: new Date().toISOString(),
  },
  {
    id: "5",
    title: "Optimism Governance Summit Jacket",
    description: "Premium jacket from Optimism Governance Summit. Size XL, excellent condition.",
    price: "80 USDC",
    imageUrl: "https://via.placeholder.com/400x300?text=Optimism+Jacket",
    category: "clothing",
    seller: "0xaaaa111122223333444455556666777788889999",
    createdAt: new Date().toISOString(),
  },
  {
    id: "6",
    title: "Arbitrum Odyssey NFT Shirt",
    description: "Commemorative shirt from Arbitrum Odyssey. Limited print, size S.",
    price: "30 USDC",
    imageUrl: "https://via.placeholder.com/400x300?text=Arbitrum+Shirt",
    category: "clothing",
    seller: "0xbbbb222233334444555566667777888899990000",
    createdAt: new Date().toISOString(),
  },
];

// GET /api/listings - Fetch all listings (protected by x402 middleware)
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    listings: listings,
    count: listings.length,
  });
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

    // Create new listing
    const newListing: Listing = {
      id: randomBytes(16).toString("hex"),
      title: title.trim(),
      description: description.trim(),
      price: price.trim(),
      imageUrl: body.imageUrl?.trim() || undefined,
      imageCid: body.imageCid?.trim() || undefined, // Store Filecoin CID
      category: category.trim(),
      seller: seller.toLowerCase(),
      createdAt: new Date().toISOString(),
    };

    // Add to in-memory storage
    listings.unshift(newListing); // Add to beginning (newest first)

    return NextResponse.json(
      {
        success: true,
        listing: newListing,
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
