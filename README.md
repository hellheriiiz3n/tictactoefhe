# 🎮 Tic Tac Toe on Blockchain with FHE

```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║    X │ O │ X          🔐 Fully Encrypted Moves           ║
║   ───┼───┼───         ⛓️  On-Chain Forever               ║
║    O │ X │           🎯 Two Game Modes                   ║
║   ───┼───┼───         🚀 Powered by Zama FHEVM          ║
║       │ O │                                                ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

> **Because regular tic tac toe wasn't complicated enough, let's put it on the blockchain with homomorphic encryption!** 🚀

A revolutionary decentralized application where you can play the classic game of Tic Tac Toe with **fully homomorphic encryption (FHE)**. Your moves remain encrypted throughout the game - even the smart contract can't see them until you reveal the winner!

---

## 📋 Table of Contents

- [🎯 What's This About?](#-whats-this-about)
- [✨ Key Features](#-key-features)
- [🎮 Two Game Modes](#-two-game-modes)
- [🔐 How FHE Works](#-how-fhe-works)
- [🏗️ Architecture](#️-architecture)
- [🚀 Quick Start](#-quick-start)
- [⚙️ Installation & Setup](#️-installation--setup)
- [📜 Smart Contracts](#-smart-contracts)
- [🛠️ Tech Stack](#️-tech-stack)
- [📖 How It Works](#-how-it-works)
- [🌐 Deployment](#-deployment)
- [🐛 Troubleshooting](#-troubleshooting)
- [📄 License](#-license)

---

## 🎯 What's This About?

Imagine playing tic tac toe, but:
- Your moves are encrypted 🔐
- Everything lives on the blockchain ⛓️
- You can't cheat (well, you can try, but good luck) 😏
- It actually works (most of the time) ✅

## ✨ Key Features

### 🎮 Core Gameplay
- ✅ Create new games with unique Game IDs
- ✅ Join existing games by Game ID
- ✅ Resume your active games
- ✅ Real-time board state updates
- ✅ Automatic win detection (Mock mode)
- ✅ Turn-based gameplay enforcement

### 🔐 FHE Mode Features
- ✅ End-to-end encrypted moves
- ✅ Zama Relayer SDK integration
- ✅ On-chain encrypted storage (bytes32 handles)
- ✅ Attestation-based move validation
- ✅ Privacy-preserving gameplay

### 🛡️ Security & Privacy
- ✅ Wallet-based authentication
- ✅ Smart contract enforced rules
- ✅ No centralized server required
- ✅ Immutable game records
- ✅ Cryptographic move proofs (FHE mode)

---

## 🎮 Two Game Modes

### 🔒 FHE Mode (The Encrypted One)

**Perfect for:** Privacy enthusiasts, crypto-curious players, anyone who wants to experience next-gen encryption tech.

**How it works:**
1. Your move (X or O) is encrypted client-side using Zama's FHE Relayer
2. Encrypted handle (bytes32) is sent to the smart contract
3. Contract stores encrypted move without ever seeing the actual value
4. Opponent sees only encrypted data on-chain
5. Game state remains private throughout gameplay

**Trade-offs:**
- ⚡ More gas per transaction (FHE operations)
- 🕐 Slightly slower move processing (encryption overhead)
- 🔐 Maximum privacy and security

### 🎯 Mock Mode (The Transparent One)

**Perfect for:** Quick testing, learning the game flow, when you don't care about privacy.

**How it works:**
1. Move is sent directly to contract as plain `uint8`
2. Contract stores move in readable `uint8[9]` array
3. Everyone can see the board state on-chain
4. Fast win detection and validation

**Trade-offs:**
- ⚡ Faster and cheaper (standard transactions)
- 👁️ All moves are publicly visible
- 🎯 Perfect for debugging and development

## 🔐 How FHE Works

### The Magic of Homomorphic Encryption

**Fully Homomorphic Encryption** allows computations on encrypted data without decrypting it first. Here's how it works in our game:

```
┌─────────────────────────────────────────────────────────────┐
│  FHE Flow: Your Move Journey                                │
└─────────────────────────────────────────────────────────────┘

1. Player makes move (e.g., position 4, symbol X)
   ↓
2. Client-side encryption via Zama Relayer SDK
   ↓
3. Encrypted handle (bytes32) + attestation generated
   ↓
4. Transaction sent to smart contract
   ↓
5. Contract stores encrypted handle (can't see actual move!)
   ↓
6. Opponent queries blockchain → sees only encrypted data
   ↓
7. (Future) On-chain FHE computations for win detection
```

### Zama FHEVM Relayer

The project uses **Zama's FHE Relayer SDK** which provides:

- 🔑 **Encryption services** - Convert plain data to encrypted handles
- ✅ **Attestation** - Cryptographic proof that encryption is valid
- 🌐 **Relayer infrastructure** - Handles FHE operations off-chain
- 🔐 **Sepolia integration** - Testnet-ready FHE operations

**Learn more:** [Zama FHEVM Documentation](https://docs.zama.ai/fhevm)

---

## 🏗️ Architecture

### Application Structure

```
wallet-8/
├── app/                      # Next.js app router
│   ├── page.tsx             # Main landing page
│   ├── tictactoe/           # Game page
│   │   └── page.tsx
│   └── providers.tsx        # Wagmi & RainbowKit setup
├── components/
│   └── TicTacToeGame.tsx    # Main game component
├── contracts/
│   ├── TicTacToeMock.sol    # Transparent game contract
│   └── TicTacToeFHE.sol     # Encrypted game contract
├── lib/
│   ├── provider.ts          # Ethers.js provider setup
│   └── fhevm.ts             # FHEVM utilities (legacy)
└── scripts/
    └── deploy-tictactoe.ts  # Deployment script
```

### Smart Contract Architecture

#### TicTacToeMock.sol
```solidity
struct Game {
    address player1;
    address player2;
    address currentPlayer;
    uint8[9] board;          // Plain board state
    bool isActive;
    address winner;
    uint256 createdAt;
}
```

#### TicTacToeFHE.sol
```solidity
struct Game {
    address player1;
    address player2;
    address currentPlayer;
    bytes32[9] encryptedBoard;  // Encrypted moves!
    bool isActive;
    address winner;
    uint256 createdAt;
    uint8 moveCount;
}
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **MetaMask** or compatible Web3 wallet
- **Sepolia ETH** (get some from [Sepolia Faucet](https://sepoliafaucet.com/))
- **Git** (for cloning)

### 1-Minute Setup

```bash
# Clone the repository
git clone https://github.com/hellheriiiz3n/tictactoefhe
cd tictactoefhe

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local  # Edit with your values

# Run development server
npm run dev

# Open http://localhost:3000
```

### First Game

1. **Connect Wallet** - Click "Connect Wallet" in the top right
2. **Switch to Sepolia** - MetaMask will prompt you (or do it manually)
3. **Choose Mode** - Toggle between Mock and FHE mode
4. **Create Game** - Click "Create New Game"
5. **Share Game ID** - Send the Game ID to your opponent
6. **Opponent Joins** - They enter the Game ID and click "Join Game"
7. **Play!** - Make moves by clicking the board squares

## ⚙️ Installation & Setup

### Step-by-Step Installation

#### 1. Clone Repository

```bash
git clone https://github.com/hellheriiiz3n/tictactoefhe
cd tictactoefhe
```

#### 2. Install Dependencies

```bash
npm install
```

This installs:
- Next.js 14+ (React framework)
- Wagmi & RainbowKit (Web3 connectivity)
- Ethers.js v6 (Blockchain interactions)
- @zama-fhe/relayer-sdk (FHE encryption)
- Hardhat (Smart contract development)
- TypeScript, Tailwind CSS, and more

#### 3. Environment Configuration

Create `.env.local` in the root directory:

```env
# Smart Contract Addresses (Deployed on Sepolia)
NEXT_PUBLIC_TICTACTOE_MOCK_ADDRESS=0x651890936De51545c05681f27CdeAeddc8df64EE
NEXT_PUBLIC_TICTACTOE_FHE_ADDRESS=0xe314f55af0a9415682c6bF47A9B17FEc8C78D65D

# FHEVM Contract (usually not needed for relayer mode)
NEXT_PUBLIC_FHEVM_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000

# WalletConnect (Optional - for mobile wallet support)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Hardhat Deployment (if deploying your own contracts)
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
```

**Get WalletConnect Project ID:**
1. Visit [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create a new project
3. Copy the Project ID to `.env.local`

#### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

#### 5. Build for Production

```bash
npm run build
npm start
```

## 📜 Smart Contracts

### Deployed Contracts (Sepolia Testnet)

| Contract | Address | Type | Explorer |
|----------|---------|------|----------|
| **TicTacToeMock** | `0x651890...df64EE` | Transparent | [View on Etherscan](https://sepolia.etherscan.io/address/0x651890936De51545c05681f27CdeAeddc8df64EE) |
| **TicTacToeFHE** | `0xe314f5...8C78D65D` | Encrypted | [View on Etherscan](https://sepolia.etherscan.io/address/0xe314f55af0a9415682c6bF47A9B17FEc8C78D65D) |

### Contract Functions

#### Common Functions (Both Contracts)

```solidity
// Create a new game (you become player1)
function createGame() external returns (uint256 gameId)

// Join an existing game as player2
function joinGame(uint256 gameId) external

// Get game information
function getGame(uint256 gameId) external view returns (...)
```

#### Mock Contract Specific

```solidity
// Make a move (plain uint8)
function makeMove(uint256 gameId, uint8 position) external
```

#### FHE Contract Specific

```solidity
// Make a move (encrypted)
function makeMove(
    uint256 gameId,
    uint8 position,
    bytes32 encryptedMove,  // FHE handle
    bytes calldata attestation
) external

// Get encrypted board state
function getEncryptedBoard(uint256 gameId) external view returns (bytes32[9])
```

### Deploy Your Own Contracts

```bash
# Compile contracts
npm run compile

# Deploy to Sepolia
npm run deploy:tictactoe

# Update .env.local with new addresses
```

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose | Version |
|------------|---------|---------|
| **Next.js** | React framework with SSR | 14.0+ |
| **TypeScript** | Type-safe JavaScript | 5.2+ |
| **Tailwind CSS** | Utility-first styling | 3.3+ |
| **Wagmi** | React Hooks for Ethereum | 2.5+ |
| **RainbowKit** | Wallet connection UI | 2.0+ |
| **Ethers.js** | Ethereum interactions | 6.9+ |

### Blockchain & FHE

| Technology | Purpose | Version |
|------------|---------|---------|
| **Hardhat** | Development environment | 2.19+ |
| **Solidity** | Smart contract language | 0.8.20 |
| **@zama-fhe/relayer-sdk** | FHE encryption SDK | 0.3.0-6 |
| **fhevmjs** | FHEVM utilities | 0.2.0 |

### Infrastructure

- **Sepolia Testnet** - Ethereum test network
- **Zama Relayer** - FHE operation relayer
- **Vercel** - Hosting platform

## 📖 How It Works

### Game Flow (Mock Mode)

```
1. Player 1: createGame() → Receives gameId
   ↓
2. Player 2: joinGame(gameId) → Both players ready
   ↓
3. Player 1: makeMove(gameId, 4) → X in center
   ↓
4. Player 2: makeMove(gameId, 0) → O in top-left
   ↓
5. Repeat until win detected or board full
   ↓
6. Contract emits GameEnded event → Winner determined
```

### Game Flow (FHE Mode)

```
1. Player 1: createGame() → Receives gameId
   ↓
2. Player 2: joinGame(gameId) → Both players ready
   ↓
3. Player 1 Client:
   - Encrypts move (X = 1) via Zama Relayer
   - Gets encrypted handle + attestation
   - Calls: makeMove(gameId, 4, encryptedHandle, attestation)
   ↓
4. Contract stores encrypted handle (can't see move value!)
   ↓
5. Player 2 Client:
   - Queries getEncryptedBoard() → sees encrypted handles
   - Cannot decrypt opponent's moves
   - Makes their encrypted move
   ↓
6. Repeat until game ends (9 moves = draw in current implementation)
```

### FHE Encryption Details

When you make a move in FHE mode:

1. **Client-side Encryption:**
   ```typescript
   const relayer = await createInstance(SepoliaConfig)
   const input = relayer.createEncryptedInput(contractAddress, userAddress)
   input.add8(symbol)  // symbol = 1 (X) or 2 (O)
   const encrypted = await input.encrypt()
   // Returns: { handles: [Uint8Array], inputProof: bytes }
   ```

2. **Handle Conversion:**
   ```typescript
   // Convert Uint8Array to bytes32 hex string
   const handle = encrypted.handles[0]
   const bytes32 = '0x' + Array.from(handle)
     .map(b => b.toString(16).padStart(2, '0'))
     .join('')
     .padStart(64, '0')
   ```

3. **Contract Storage:**
   ```solidity
   game.encryptedBoard[position] = encryptedMove;  // bytes32 handle
   ```

---

## 🌐 Deployment

### Deploy to Vercel

#### Option 1: Vercel CLI

```bash
# Install Vercel CLI (globally)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### Option 2: GitHub Integration

1. Push code to GitHub repository
2. Connect repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on push

#### Environment Variables (Vercel)

Add these in Vercel project settings:

- `NEXT_PUBLIC_TICTACTOE_MOCK_ADDRESS`
- `NEXT_PUBLIC_TICTACTOE_FHE_ADDRESS`
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` (optional)

### Deploy Smart Contracts

```bash
# Set up .env.local with deployment keys
PRIVATE_KEY=0x...
SEPOLIA_RPC_URL=https://...

# Compile
npm run compile

# Deploy
npm run deploy:tictactoe
```

---

## 🐛 Troubleshooting

### Common Issues

#### ❌ "FHEVM relayer not initialized"

**Cause:** Relayer SDK failed to load or initialize.

**Solutions:**
- Ensure you're on Sepolia testnet
- Check browser console for detailed errors
- Verify Zama relayer endpoint is accessible
- Try refreshing the page

#### ❌ "Transaction failed: user rejected"

**Cause:** User cancelled transaction in MetaMask.

**Solutions:**
- Make sure you have enough Sepolia ETH
- Check gas price settings
- Ensure you're on Sepolia network

#### ❌ "Invalid contract address"

**Cause:** Environment variable not set or incorrect.

**Solutions:**
- Verify `.env.local` exists and has correct addresses
- Check variable names match exactly (case-sensitive)
- Restart dev server after changing `.env.local`

#### ❌ "Failed to initialize SDK"

**Cause:** Zama SDK initialization failed.

**Solutions:**
- Check internet connection (SDK loads from CDN)
- Verify `@zama-fhe/relayer-sdk` is installed: `npm list @zama-fhe/relayer-sdk`
- Check browser console for CORS or network errors
- Ensure `window.global` is defined (auto-set in app)

---

## ⚠️ Important Notes

⚠️ This is on **Sepolia testnet** - use test ETH only!  
⚠️ Each move costs gas (obviously)  
⚠️ FHE mode needs the Zama relayer to work properly  
⚠️ This is a demo project - don't use it for anything super important

## Deployment

Deployed on Vercel because it's easy and free. Check it out: [Live Demo](https://fhe-tictactoe-dapp.vercel.app)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Zama** - For amazing FHEVM technology and Relayer SDK
- **Ethereum Foundation** - For Sepolia testnet
- **Wagmi & RainbowKit** - For excellent Web3 React tooling
- **The Open Source Community** - For all the amazing tools

---

## 🔗 Useful Links

- **Live Demo:** [Deployed on Vercel](https://fhe-tictactoe-dapp.vercel.app)
- **GitHub Repository:** [hellheriiiz3n/tictactoefhe](https://github.com/hellheriiiz3n/tictactoefhe)
- **Zama Documentation:** [docs.zama.ai/fhevm](https://docs.zama.ai/fhevm)
- **Sepolia Faucet:** [sepoliafaucet.com](https://sepoliafaucet.com/)
- **Etherscan Sepolia:** [sepolia.etherscan.io](https://sepolia.etherscan.io/)

---

<div align="center">

### Made with ❤️ (and a lot of coffee ☕) using Zama FHEVM

```
   X │   │ 
  ───┼───┼───
     │ O │ 
  ───┼───┼───
     │   │ X

     You Win! 🎉
```

**P.S.** - If you win, you win. If you lose, blame the encryption. 😎

**P.P.S.** - But seriously, this is a demonstration of cutting-edge privacy-preserving technology. Enjoy exploring FHE on the blockchain!

</div>
