'use client'

import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12 animate-slide-in">
          <h1 className="text-5xl md:text-7xl font-black mb-4 gradient-text">
            About
          </h1>
          <p className="text-xl text-gray-300">
            Learn more about Tic Tac Toe on the blockchain
          </p>
        </div>

        <div className="space-y-8">
          {/* What is this */}
          <div className="glass-strong rounded-2xl p-8 animate-slide-in">
            <h2 className="text-3xl font-bold text-white mb-4">What is this?</h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              This is a decentralized Tic Tac Toe game built on Ethereum using Zama's Fully Homomorphic Encryption (FHE) technology. 
              Unlike traditional games, your moves are encrypted and stored on the blockchain, ensuring complete privacy during gameplay.
            </p>
          </div>

          {/* How it works */}
          <div className="glass-strong rounded-2xl p-8 animate-slide-in">
            <h2 className="text-3xl font-bold text-white mb-4">How it works?</h2>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">1. Connect Your Wallet</h3>
                <p>Use MetaMask or any Web3 wallet to connect to the Sepolia testnet.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">2. Choose a Mode</h3>
                <p>
                  <strong>FHE Mode:</strong> Your moves are encrypted. Opponents can't see your moves until the game ends.
                  <br />
                  <strong>Mock Mode:</strong> Simplified version for testing. All moves are visible.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">3. Create or Join a Game</h3>
                <p>Create a new game and share the Game ID, or join an existing game using a Game ID.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">4. Play</h3>
                <p>Make your moves on the 3x3 board. The game automatically detects winners and ties.</p>
              </div>
            </div>
          </div>

          {/* Technology */}
          <div className="glass-strong rounded-2xl p-8 animate-slide-in">
            <h2 className="text-3xl font-bold text-white mb-4">Technology</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Zama FHEVM</h3>
                <p className="text-gray-300">
                  Fully Homomorphic Encryption allows computations on encrypted data without decrypting it first. 
                  This means your moves stay private even on a public blockchain.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Ethereum Sepolia</h3>
                <p className="text-gray-300">
                  All games are stored as smart contracts on the Sepolia testnet. 
                  This ensures transparency and immutability of game results.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Next.js & React</h3>
                <p className="text-gray-300">
                  Built with modern web technologies for a smooth user experience. 
                  The frontend communicates with smart contracts via ethers.js.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Wagmi & RainbowKit</h3>
                <p className="text-gray-300">
                  Easy wallet connection and interaction with the Ethereum network. 
                  Supports all major Web3 wallets.
                </p>
              </div>
            </div>
          </div>

          {/* Smart Contracts */}
          <div className="glass-strong rounded-2xl p-8 animate-slide-in">
            <h2 className="text-3xl font-bold text-white mb-4">Smart Contracts</h2>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">TicTacToeMock</h3>
                <p>Simplified contract for testing. Moves are stored as plain numbers on-chain.</p>
                <p className="text-sm text-gray-400 mt-1">
                  Address: <code className="bg-gray-800 px-2 py-1 rounded">0x651890936De51545c05681f27CdeAeddc8df64EE</code>
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">TicTacToeFHE</h3>
                <p>Full FHE contract. Moves are encrypted and stored as bytes32 handles. Win checking happens on encrypted data.</p>
                <p className="text-sm text-gray-400 mt-1">
                  Address: <code className="bg-gray-800 px-2 py-1 rounded">0xe314f55af0a9415682c6bF47A9B17FEc8C78D65D</code>
                </p>
              </div>
            </div>
          </div>

          {/* Getting Started */}
          <div className="glass-strong rounded-2xl p-8 animate-slide-in">
            <h2 className="text-3xl font-bold text-white mb-4">Getting Started</h2>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">1. Get Test ETH</h3>
                <p>
                  You'll need Sepolia testnet ETH to pay for gas fees. 
                  Get some from <a href="https://sepoliafaucet.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline">Sepolia Faucet</a>.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">2. Connect Wallet</h3>
                <p>Click the "Connect Wallet" button and select your preferred wallet (MetaMask recommended).</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">3. Switch to Sepolia</h3>
                <p>Make sure your wallet is connected to the Sepolia testnet network.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">4. Start Playing</h3>
                <p>Create a new game or join an existing one. Have fun!</p>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="text-center">
            <Link
              href="/tictactoe"
              className="inline-block px-8 py-3 rounded-xl gradient-bg text-white font-semibold hover:opacity-90 transition glow-hover"
            >
              Start Playing →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
