# 🎒 SwagSwap

**A decentralized, trade-only marketplace for hackathon merch**

SwagSwap is a Web3 marketplace where hackathon enthusiasts can trade exclusive swag items like hoodies, t-shirts, stickers, and collectibles. Built with cutting-edge Web3 technologies including Privy authentication, x402 payment protocol, and Filecoin decentralized storage.

---

## ✨ Features

- 🔐 **Privy Authentication** - Seamless wallet connection with embedded wallets
- 🛡️ **World ID Verification** - Proof of humanity with zero-knowledge proofs
- 💳 **x402 Payments** - Pay-per-API-call using USDC stablecoins
- 📦 **Filecoin Storage** - Decentralized image storage via Synapse SDK
- 🌐 **Cross-Chain Support** - Polygon Amoy & Celo Alfajores testnets
- 🎨 **Modern UI** - Clean, responsive design with dark mode support
- ⚡ **Fast & Secure** - Built on Next.js 15 with TypeScript

---

## 🎯 Hackathon Tracks

This project qualifies for:

### **World ID Integration**
- ✅ Uses World ID IDKit widget for human verification
- ✅ Off-chain proof verification
- ✅ Zero-knowledge proofs for privacy
- ✅ Sybil-resistant (one verification per human)
- ✅ Prevents bot spam on marketplace

### **Filecoin Onchain Cloud Track** - $10,000
- ✅ Uses Synapse SDK for decentralized storage
- ✅ Deployed to Filecoin Calibration Testnet
- ✅ Real-world marketplace use case
- ✅ Full frontend demo with file upload

### **x402 Payment Protocol**
- ✅ Pay-per-use API access model
- ✅ USDC payments on Base Sepolia
- ✅ Gas-free transactions for users
- ✅ Coinbase x402 middleware integration

---

## 🏗️ Tech Stack

### Frontend
- **Next.js 15** (App Router)
- **React 18** with TypeScript
- **Tailwind CSS 4** for styling
- **Privy SDK** for authentication

### Blockchain & Web3
- **World ID** - Proof of humanity verification
- **Privy** - Embedded wallets & authentication
- **x402** - HTTP payment protocol
- **Filecoin** - Decentralized storage via Synapse SDK
- **Viem** - Ethereum interactions

### Networks
- **Polygon Amoy Testnet** (Chain ID: 80002)
- **Celo Alfajores Testnet** (Chain ID: 44787)
- **Filecoin Calibration Testnet**

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Privy account and App ID
- A Synapse API key for Filecoin

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/swagswap.git
cd swagswap
```

2. **Install dependencies**

```bash
npm install --legacy-peer-deps
```

> **Note:** The `--legacy-peer-deps` flag is required for some package compatibility. This is safe and the application works correctly.

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# Privy Authentication
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_privy_app_secret

# x402 Payment Configuration
RECEIVER_WALLET_ADDRESS=0xYourWalletAddress

# Filecoin Synapse SDK
NEXT_PUBLIC_SYNAPSE_API_KEY=your_synapse_api_key
```

4. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📖 How It Works

### For Sellers (Creating Listings)

1. **Login** - Connect your wallet via Privy (email or wallet)
2. **Create Listing** - Click "Create Listing" tab
3. **Upload Image** - Upload swag photo to Filecoin (decentralized storage)
4. **Fill Details** - Add title, description, price, and category
5. **Submit** - Your listing is created and stored

### For Buyers (Browsing Listings)

1. **Login** - Connect your wallet
2. **Fund Wallet** - Add USDC to your embedded wallet (via Apple/Google Pay)
3. **Browse Listings** - Pay $0.0001 USDC to access the listings API (x402)
4. **View Items** - Images load from Filecoin IPFS network

---

## 🔧 Key Components

### Authentication (`app/components/`)
- `Providers.tsx` - Privy configuration with embedded wallets
- `ClientProviders.tsx` - Client-side provider wrapper
- `Navbar.tsx` - Login/logout with wallet display

### Listings (`app/components/`)
- `CreateListing.tsx` - Form to create new listings
- `Listings.tsx` - Browse and display all listings
- `FileUpload.tsx` - Upload images to Filecoin

### Storage (`app/lib/`)
- `filecoin.ts` - Synapse SDK utilities for Filecoin storage

### API Routes (`app/api/`)
- `GET /api/listings` - Fetch listings (protected by x402)
- `POST /api/listings` - Create new listing (free)

### Middleware
- `middleware.ts` - x402 payment middleware configuration

---

## 💰 Payment Flow (x402)

1. User requests listings via `GET /api/listings`
2. Server responds with `402 Payment Required`
3. Client builds EIP-712 typed data for USDC transfer
4. User signs authorization with Privy wallet (no gas)
5. Client adds `X-PAYMENT` header and retries request
6. Facilitator verifies and settles payment on-chain
7. Server returns listings data

**Benefits:**
- ✅ Users only need USDC (no native tokens for gas)
- ✅ Instant micropayments
- ✅ Pay-per-use API model

---

## 📦 Filecoin Integration

SwagSwap uses **Filecoin Onchain Cloud** via **Synapse SDK** for decentralized storage.

### What's Stored on Filecoin
- Listing images (user-uploaded photos)
- IPFS CIDs stored in listing metadata
- Content accessible via IPFS gateways

### Upload Flow
1. User selects image file
2. `FileUpload` component uploads to Filecoin
3. Synapse SDK returns IPFS CID
4. Frontend constructs gateway URL
5. Listing saved with both URL and CID

### Benefits
- ✅ Decentralized - No single point of failure
- ✅ Permanent - Content stored on Filecoin network
- ✅ Fast retrieval - Hot storage with IPFS gateways
- ✅ Trustless - Content-addressable via CIDs

See [FILECOIN_SETUP.md](./FILECOIN_SETUP.md) for detailed setup instructions.

---

## 🔑 Configuration

### Privy Setup

1. Go to [privy.io](https://privy.io)
2. Create an app
3. Enable email and wallet login methods
4. Add your App ID to `.env.local`

### Synapse API Key

1. Visit [synapse.filecoin.services](https://synapse.filecoin.services/)
2. Create an account
3. Generate an API key
4. Add to `.env.local`

### x402 Receiver Wallet

- Set up a wallet address to receive USDC payments
- Add the address to `.env.local` as `RECEIVER_WALLET_ADDRESS`
- This wallet receives payments when users access the listings API

---

## 🧪 Testing

### Fund Your Wallet

1. Login to SwagSwap
2. Click "Fund Wallet with USDC" button
3. Use Apple Pay or Google Pay to add testnet USDC

### Get Testnet USDC

For Polygon Amoy:
- Use Circle's USDC faucet
- Or use Privy's built-in funding with Apple/Google Pay

### Create a Listing

1. Go to "Create Listing" tab
2. Upload an image (max 10MB)
3. Fill out the form
4. Submit and watch it upload to Filecoin!

### Browse Listings

1. Go to "Browse Listings" tab
2. Enter the API URL: `http://localhost:3000/api/listings`
3. Click "Fetch Listings"
4. Your wallet will automatically pay $0.0001 USDC via x402

---

## 📁 Project Structure

```
swagswap/
├── app/
│   ├── api/
│   │   └── listings/
│   │       └── route.ts          # Listings API (GET/POST)
│   ├── components/
│   │   ├── ClientProviders.tsx   # Client provider wrapper
│   │   ├── CreateListing.tsx     # Listing creation form
│   │   ├── FileUpload.tsx        # Filecoin image upload
│   │   ├── FundWallet.tsx        # Wallet funding component
│   │   ├── Listings.tsx          # Browse listings
│   │   ├── Navbar.tsx            # Navigation with auth
│   │   └── Providers.tsx         # Privy configuration
│   ├── hooks/
│   │   └── useListings.ts        # x402 fetch hook
│   ├── lib/
│   │   └── filecoin.ts           # Synapse SDK utilities
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
├── middleware.ts                 # x402 payment middleware
├── .env.local                    # Environment variables (create this)
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── tailwind.config.ts            # Tailwind config
├── FILECOIN_SETUP.md            # Filecoin integration docs
└── README.md                     # This file
```

---

## 🛠️ Development

### Build for Production

```bash
npm run build
```

### Run Production Server

```bash
npm start
```

### Lint Code

```bash
npm run lint
```

---

## 🌐 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy!

### Environment Variables

Make sure to add all required environment variables in your deployment platform:
- `NEXT_PUBLIC_PRIVY_APP_ID`
- `PRIVY_APP_SECRET`
- `RECEIVER_WALLET_ADDRESS`
- `NEXT_PUBLIC_SYNAPSE_API_KEY`

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is open-source and available under the MIT License.

---

## 🙏 Acknowledgments

- **Privy** - For seamless Web3 authentication
- **x402** - For the HTTP payment protocol
- **Filecoin** - For decentralized storage infrastructure
- **Polygon** - For fast and affordable testnet

---

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Built with ❤️ for hackathon enthusiasts**
