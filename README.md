# 🎮 Tic Tac Toe on Blockchain

> Because regular tic tac toe wasn't complicated enough, let's put it on the blockchain! 🚀

A fun little game where you can play tic tac toe with your moves encrypted using Zama's fancy FHE technology. Your opponent won't see your moves until the game ends. Pretty cool, right?

## What's this about?

Imagine playing tic tac toe, but:
- Your moves are encrypted 🔐
- Everything lives on the blockchain ⛓️
- You can't cheat (well, you can try, but good luck) 😏
- It actually works (most of the time) ✅

## Two Modes to Choose From

### 🔒 FHE Mode (The Cool One)
Your moves are encrypted. Your opponent has no idea what you're doing until the game ends. Maximum privacy, maximum confusion.

### 🎮 Mock Mode (The Simple One)
Everything is visible. Good for testing or if you're not into all that encryption stuff.

## Quick Start

1. **Get some test ETH** - You'll need Sepolia testnet ETH. Grab some from [here](https://sepoliafaucet.com/)
2. **Connect your wallet** - MetaMask works great
3. **Switch to Sepolia** - Make sure you're on the testnet
4. **Start playing** - Create a game or join one. It's that simple!

## How to Run Locally

```bash
# Install stuff
npm install

# Set up your .env.local file (see below)

# Run it
npm run dev

# Open http://localhost:3000 and have fun!
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_TICTACTOE_MOCK_ADDRESS=0x651890936De51545c05681f27CdeAeddc8df64EE
NEXT_PUBLIC_TICTACTOE_FHE_ADDRESS=0xe314f55af0a9415682c6bF47A9B17FEc8C78D65D
NEXT_PUBLIC_FHEVM_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

## Smart Contracts

We've got two contracts deployed on Sepolia:

- **Mock Contract**: `0x651890936De51545c05681f27CdeAeddc8df64EE` - Simple version
- **FHE Contract**: `0xe314f55af0a9415682c6bF47A9B17FEc8C78D65D` - Encrypted version

Check them out on [Etherscan](https://sepolia.etherscan.io/) if you're curious.

## Tech Stuff

Built with:
- Next.js (because React is cool)
- TypeScript (because JavaScript wasn't enough)
- Tailwind CSS (because writing CSS is boring)
- Wagmi & RainbowKit (for wallet stuff)
- Hardhat (for smart contracts)
- Zama FHEVM (for the encryption magic)

## Features

✨ Create games and share Game IDs  
✨ Join existing games  
✨ Resume your active games  
✨ Two modes: encrypted and plain  
✨ It's on the blockchain (so it's permanent, I guess?)  

## Important Notes

⚠️ This is on **Sepolia testnet** - use test ETH only!  
⚠️ Each move costs gas (obviously)  
⚠️ FHE mode needs the Zama relayer to work properly  
⚠️ This is a demo project - don't use it for anything super important  

## Deployment

Deployed on Vercel because it's easy and free. Check it out: [Live Demo](https://fhe-tictactoe-dapp.vercel.app)

## Contributing

Found a bug? Want to add something? Feel free to open an issue or PR. Just don't break anything, please. 😅

## License

MIT - Do whatever you want with it.

---

Made with ❤️ (and a lot of coffee ☕) using Zama FHEVM

*P.S. - If you win, you win. If you lose, blame the encryption. 😎*
