# Tic Tac Toe on Blockchain

A decentralized Tic Tac Toe game built with Zama's Fully Homomorphic Encryption (FHE) technology. Play with complete privacy - your moves are encrypted and stored on the Ethereum blockchain.

## What is this?

This is a Tic Tac Toe game that runs on the Ethereum Sepolia testnet. It has two modes:

- **FHE Mode**: Your moves are encrypted using Zama's FHE technology. Opponents can't see your moves until the game ends.
- **Mock Mode**: Simplified version for testing. All moves are visible in plain text.

## Features

- 🔐 **Encrypted Moves**: In FHE mode, your moves are encrypted before being sent to the blockchain
- 🎮 **Two Game Modes**: Switch between FHE and Mock modes
- 📱 **Web3 Wallet Support**: Connect with MetaMask or any Web3 wallet
- 🔄 **Resume Games**: Your active games are saved and you can continue them anytime
- 🎯 **Smart Contracts**: All game logic runs on-chain via Ethereum smart contracts

## How to Play

1. **Connect Your Wallet**: Click "Connect Wallet" and select your wallet (MetaMask recommended)
2. **Switch to Sepolia**: Make sure your wallet is connected to the Sepolia testnet
3. **Get Test ETH**: You'll need Sepolia testnet ETH for gas fees. Get some from [Sepolia Faucet](https://sepoliafaucet.com/)
4. **Choose Mode**: Select FHE Mode (encrypted) or Mock Mode (plain text)
5. **Create or Join**: Create a new game or join an existing one using a Game ID
6. **Play**: Make your moves on the 3x3 board. The game automatically detects winners

## Smart Contracts

### TicTacToeMock
Simplified contract for testing. Moves are stored as plain numbers.

- **Address**: `0x651890936De51545c05681f27CdeAeddc8df64EE`
- **Network**: Sepolia Testnet
- **Etherscan**: [View on Etherscan](https://sepolia.etherscan.io/address/0x651890936De51545c05681f27CdeAeddc8df64EE)

### TicTacToeFHE
Full FHE contract. Moves are encrypted and stored as bytes32 handles.

- **Address**: `0xe314f55af0a9415682c6bF47A9B17FEc8C78D65D`
- **Network**: Sepolia Testnet
- **Etherscan**: [View on Etherscan](https://sepolia.etherscan.io/address/0xe314f55af0a9415682c6bF47A9B17FEc8C78D65D)

## Tech Stack

- **Next.js 14**: React framework for the frontend
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Styling
- **Wagmi v2**: Ethereum hooks and utilities
- **RainbowKit**: Wallet connection UI
- **Hardhat**: Smart contract development
- **Solidity**: Smart contract language
- **Zama FHEVM**: Fully Homomorphic Encryption

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Web3 wallet (MetaMask recommended)
- Sepolia testnet ETH

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd fhe_chat
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:

```env
# Tic-Tac-Toe Contracts
NEXT_PUBLIC_TICTACTOE_MOCK_ADDRESS=0x651890936De51545c05681f27CdeAeddc8df64EE
NEXT_PUBLIC_TICTACTOE_FHE_ADDRESS=0xe314f55af0a9415682c6bF47A9B17FEc8C78D65D

# FHEVM
NEXT_PUBLIC_FHEVM_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000

# WalletConnect (get from https://cloud.walletconnect.com/)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add the environment variables from `.env.local` to Vercel
4. Deploy!

See [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md) for detailed instructions.

## How It Works

### FHE Mode

1. When you make a move, it's encrypted using Zama's relayer
2. The encrypted move (as a bytes32 handle) is sent to the smart contract
3. The contract stores the encrypted move on-chain
4. Win checking happens on encrypted data through the Zama relayer
5. Only at the end of the game can moves be decrypted

### Mock Mode

1. Moves are sent as plain numbers (1 for X, 2 for O)
2. The contract stores moves in a regular array
3. Win checking happens on plain data
4. All moves are visible to everyone

## Important Notes

- This runs on Sepolia testnet - use test ETH only
- Each transaction costs gas (obviously)
- FHE mode requires the Zama relayer to be properly configured
- This is a demo project - don't use for production without proper security audits

## Links

- [Zama Protocol Documentation](https://docs.zama.org)
- [Sepolia Faucet](https://sepoliafaucet.com/) - Get test ETH
- [About Page](./app/about/page.tsx) - Learn more about the project

## License

MIT

---

Made with ❤️ using Zama FHEVM
