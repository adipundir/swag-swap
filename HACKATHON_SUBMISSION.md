# 🎒 SwagSwap - Hackathon Submission

## 📹 Demonstration Link
*[Add your demo video/deployed app link here]*

Example: `https://swagswap.vercel.app` or `https://www.loom.com/share/your-demo-video`

---

## 📝 Short Description (100 chars max)

**"A Web3 marketplace for trading hackathon swag with World ID verification and x402 micropayments"**

*(99 characters)*

---

## 📄 Full Description

SwagSwap is a decentralized marketplace built exclusively for hackathon enthusiasts to trade exclusive swag and merch. Unlike traditional marketplaces, SwagSwap leverages cutting-edge Web3 technologies to create a trustless, secure, and fun trading experience.

**The Problem**: Hackathon participants accumulate tons of swag (hoodies, t-shirts, stickers, collectibles) but often can't use or need all of it. Meanwhile, collectors and enthusiasts want specific items they missed out on.

**Our Solution**: SwagSwap provides a Web3-native platform where users can:
- List their unwanted hackathon swag
- Browse and discover items from other hackathons
- Trade directly with other enthusiasts
- Verify they're real humans (not bots) using World ID
- Pay for API access with micropayments (x402 protocol)

**Key Features**:
- 🛡️ **Sybil-Resistant**: World ID integration ensures only real humans can list items, preventing bot spam
- 💳 **Pay-Per-Use**: Users only pay $0.0001 USDC when they actually fetch listings (x402 protocol)
- 🔐 **Seamless Auth**: Privy enables wallet-less onboarding with email/social login
- ⚡ **Fast & Modern**: Built with Next.js 15 and TypeScript for optimal performance
- 💸 **Gasless Payments**: Users only need USDC, no ETH required for transactions

---

## 🛠️ How It's Made

### Architecture Overview

SwagSwap is a full-stack Next.js 15 application that integrates multiple Web3 protocols to create a seamless marketplace experience.

### Technologies & Integration

#### 1. **World ID (Proof of Humanity)**
- **What**: Zero-knowledge proof system for verifying unique humans
- **How**: Integrated World ID IDKit widget in React component
- **Why**: Prevents Sybil attacks and bot spam on our marketplace
- **Implementation**:
  - User clicks "Verify Hacker Status" button
  - IDKit widget opens for World ID verification (Orb level)
  - Frontend receives proof (nullifier hash + merkle root)
  - Backend verifies proof with World ID Developer Portal API
  - Nullifier hash tracked to prevent duplicate verifications
  - Verification stored off-chain for fast access

**Benefit**: Only verified humans can create listings, ensuring marketplace quality and preventing spam.

#### 2. **Privy (Authentication & Embedded Wallets)**
- **What**: Web3 authentication with embedded wallet infrastructure
- **How**: 
  - Configured Privy provider with email and wallet login methods
  - Wrapped entire app in `PrivyProvider` with embedded wallet config
  - Used `usePrivy()` and `useWallets()` hooks throughout components
- **Why**: Lowers barrier to entry - users don't need existing wallets
- **Implementation**:
  - Email/social login creates embedded wallet automatically
  - Users can fund wallets with Apple Pay/Google Pay
  - Seamless signing of transactions without Metamask

**Benefit**: Non-crypto-native users can participate without Web3 knowledge.

#### 3. **x402 Payment Protocol (Micropayments)**
- **What**: HTTP-native payment protocol for pay-per-API-call model
- **How**:
  - Implemented x402 middleware in `middleware.ts`
  - Protected `/api/listings` GET endpoint with payment requirement
  - Built EIP-712 typed data for USDC transfer authorization
  - Used Privy wallet to sign payment authorization (gasless)
  - Added `X-PAYMENT` header to subsequent requests
- **Why**: Traditional payment rails are too expensive for micropayments
- **Implementation Details**:
  - User requests listings → receives 402 Payment Required
  - Client builds USDC transfer authorization (no ETH gas needed!)
  - User signs with Privy embedded wallet
  - Payment header added, request automatically retried
  - Facilitator verifies signature and settles on-chain
  - Server returns listings data
  - Payment cached to avoid duplicate charges

**Benefit**: Users only pay when they access data ($0.0001 per API call), enabling true pay-per-use model. No need for ETH for gas - USDC only!

**This is particularly powerful** because:
- Enables sub-cent pricing impossible with traditional payment systems
- No gas fees for users (facilitator handles settlement)
- Instant payments with no confirmation delays
- Works with Privy's embedded wallets seamlessly

#### 4. **Neon Serverless Postgres (Database)**
- **What**: Serverless PostgreSQL database
- **How**: Used `@neondatabase/serverless` for SQL queries
- **Why**: Fast, scalable, and Edge-compatible
- **Implementation**: Stores listings metadata, user verifications, World ID nullifier hashes

### Technical Challenges & Solutions

#### Challenge 1: World ID Integration
**Problem**: World ID SDK documentation was sparse for Next.js 15 App Router.

**Solution**: 
- Used `"use client"` directive for client-side components
- Cast `app_id` to proper TypeScript type: `` as `app_${string}` ``
- Implemented proper error handling for verification failures
- Created custom verification status check endpoint
- Tracked nullifier hashes to prevent duplicate verifications

#### Challenge 2: x402 Payment Flow
**Problem**: Users don't have native tokens for gas fees.

**Solution**:
- Used USDC-only payments (no ETH needed!)
- Leveraged Privy's embedded wallets for gasless signing
- Implemented EIP-712 typed data for permit-style signatures
- Added retry logic for failed payments
- Cached payment responses to avoid duplicate charges
- Clear UI feedback showing payment status and amounts

#### Challenge 3: Gasless UX with Privy + x402
**Problem**: Traditional Web3 UX requires understanding gas, tokens, networks.

**Solution**:
- Combined Privy embedded wallets with x402 USDC payments
- Users only interact with dollars ($0.0001), not wei/gwei
- One-click signing without Metamask popups
- Automatic network switching handled by Privy
- Payment happens in background, feels like Web2

### Notable Hacks & Optimizations

1. **Nullifier Tracking**: Used in-memory Map to track World ID nullifier hashes, preventing duplicate verifications without a full database (hackathon-ready!)

2. **Dual Wallet Support**: Users can connect external wallets OR use Privy's embedded wallets - whichever they prefer

3. **Payment Caching**: Cached x402 payment responses to avoid duplicate payments for same data

4. **Gasless Signature Flow**: Leveraged EIP-712 permits with Privy signing - users never pay gas, only the USDC amount

5. **Auto-Retry Logic**: If x402 payment fails, automatically retries with exponential backoff

6. **Dark Mode**: Implemented with Tailwind dark: prefix for better UX

### Development Stack

**Frontend**:
- Next.js 15 (App Router)
- React 18 with TypeScript
- Tailwind CSS 4
- Framer Motion for animations

**Web3 Stack**:
- World ID (Proof of humanity)
- Privy (Auth + Embedded Wallets)
- x402 (HTTP Payment Protocol)
- Viem (Ethereum interactions)

**Backend**:
- Next.js API Routes
- Neon Serverless Postgres
- TypeScript

**Networks**:
- Base Sepolia (x402 USDC payments)
- Polygon Amoy (alternative network)

### What Makes This Project Unique

1. **True Micropayments**: x402 enables sub-cent API pricing ($0.0001/call) that's impossible with traditional payment rails or even traditional crypto

2. **Sybil-Resistant Marketplace**: World ID prevents bots and fake accounts, ensuring only real humans can create listings

3. **Gasless Payments**: Users only need USDC - no ETH, no gas fees, no network complexity. Privy + x402 make it feel like Venmo

4. **Web3-Native UX**: Despite using advanced crypto tech, the UX feels like Web2 (thanks to Privy + x402)

5. **Pay-Per-Use Model**: Unlike subscription models, users only pay when they actually fetch data - aligned incentives

6. **Niche Focus**: Built specifically for hackathon enthusiasts, not a generic marketplace

---

## 📦 GitHub Repository

`https://github.com/adipundir/swag-swap`

*(Replace with your actual GitHub URL)*

Make sure the repository is:
- ✅ Public
- ✅ Has a detailed README
- ✅ Includes setup instructions
- ✅ Has clear commit history
- ✅ Contains all necessary code

---

## ✅ Submission Checklist

- [ ] Demo video/link added
- [ ] Short description (100 chars)
- [ ] Full description (280+ chars)
- [ ] How it's made section (280+ chars)
- [ ] GitHub repository is public
- [ ] README is comprehensive
- [ ] Environment variables documented
- [ ] Setup instructions are clear

---

## 🏆 Tracks Applying For

1. **x402** - HTTP payment protocol for micropayments (PRIMARY TRACK)
2. **World ID** - Proof of humanity verification
3. **Privy** - Web3 authentication and embedded wallets

---

## 📞 Contact

- GitHub: [@adipundir](https://github.com/adipundir)
- Project: SwagSwap
- Built at: ETHGlobal Buenos Aires 2025

---

**Built with ❤️ for the hackathon community!** 🎉

