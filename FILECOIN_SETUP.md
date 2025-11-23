# Filecoin Onchain Cloud Integration

SwagSwap uses **Filecoin Onchain Cloud** via the **Synapse SDK** for decentralized storage of listing images and metadata.

## 🎯 Track Qualification

This project qualifies for the **"Best dApps powered by Filecoin Onchain Cloud"** track ($10,000 prize pool).

### Requirements Met:
✅ Uses Synapse SDK for decentralized storage  
✅ Deployed to Filecoin Calibration Testnet  
✅ Working demo with frontend UI  
✅ Open-source code on GitHub  

## 📦 What's Stored on Filecoin

1. **Listing Images** - User-uploaded photos of hackathon swag
2. **IPFS CIDs** - Stored in the listing metadata for retrieval
3. **Decentralized Access** - Images accessible via IPFS gateways

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install @filoz/synapse-sdk --legacy-peer-deps
```

### 2. Get Synapse API Key

1. Visit [https://synapse.filecoin.services/](https://synapse.filecoin.services/)
2. Create an account and generate an API key
3. Add to your `.env.local`:

```env
NEXT_PUBLIC_SYNAPSE_API_KEY=your_api_key_here
```

### 3. Configure Filecoin Network

The app is configured to use **Filecoin Calibration Testnet** (see `app/lib/filecoin.ts`):

```typescript
new Synapse({
  apiKey: process.env.NEXT_PUBLIC_SYNAPSE_API_KEY,
  network: "calibration", // Filecoin Calibration Testnet
});
```

## 🔧 How It Works

### Upload Flow

1. User creates a new listing on the "Create Listing" tab
2. User selects an image file (max 10MB)
3. `FileUpload` component uploads to Filecoin via Synapse SDK
4. Synapse returns an IPFS CID
5. Frontend constructs IPFS gateway URL
6. Listing is saved with both the URL and CID
7. Images are stored permanently on Filecoin

### Retrieval Flow

1. User browses listings (pays via x402)
2. API returns listings with IPFS URLs
3. Images load from IPFS gateways
4. Content is served from Filecoin's decentralized network

## 📁 Key Files

- **`app/lib/filecoin.ts`** - Synapse SDK client and upload utilities
- **`app/components/FileUpload.tsx`** - Image upload component
- **`app/components/CreateListing.tsx`** - Listing form with Filecoin integration
- **`app/api/listings/route.ts`** - API that stores CIDs

## 🌐 IPFS Gateway

Images are accessible via multiple IPFS gateways:
- `https://ipfs.io/ipfs/{cid}`
- `https://gateway.pinata.cloud/ipfs/{cid}`
- `https://cloudflare-ipfs.com/ipfs/{cid}`

## 💡 Benefits

✅ **Decentralized** - No single point of failure  
✅ **Permanent** - Content stored on Filecoin network  
✅ **Fast** - Hot storage with quick retrieval  
✅ **Trustless** - Content-addressable via CIDs  
✅ **Web3 Native** - Aligns with blockchain philosophy  

## 🔗 Resources

- [Filecoin Onchain Cloud](https://www.filecoin.cloud/)
- [Synapse SDK GitHub](https://github.com/FilOzone/synapse-sdk)
- [Synapse SDK Docs](https://synapse.filecoin.services/)
- [Filecoin Docs](https://docs.filecoin.io/)

## 🏆 Hackathon Submission

This implementation showcases:
1. Real-world use case (marketplace for hackathon swag)
2. Meaningful integration (not just file upload demo)
3. User-facing feature (creators upload images to Filecoin)
4. Decentralized infrastructure (storage + blockchain payments)
5. Production-ready code (error handling, validation, UI/UX)

