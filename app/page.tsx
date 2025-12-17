'use client'

import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link'
import { useState } from 'react'

export default function Home() {
  const { isConnected } = useAccount()
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      {/* Главный заголовок */}
      <div className="text-center mb-16 animate-slide-in">
        <h1 className="text-7xl md:text-9xl font-black mb-6 gradient-text">
          TIC TAC TOE
        </h1>
        <p className="text-2xl md:text-3xl text-gray-300 mb-4">
          Powered by <span className="gradient-text font-bold">Zama FHEVM</span>
        </p>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Play Tic Tac Toe with full privacy. 
          Your moves are encrypted using Fully Homomorphic Encryption.
        </p>
      </div>

      {/* Карточки режимов */}
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full mb-12">
        {/* Mock режим */}
        <div
          className={`glass-strong rounded-2xl p-8 transition-all duration-300 cursor-pointer ${
            hoveredCard === 1 ? 'scale-105 glow' : ''
          }`}
          onMouseEnter={() => setHoveredCard(1)}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div className="text-4xl mb-4">🎮</div>
          <h3 className="text-2xl font-bold text-white mb-3">Mock Mode</h3>
          <p className="text-gray-400 mb-6">
            Simplified mode for testing. All moves are visible in plain text.
            Perfect for getting familiar with the game.
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Ready to use
          </div>
        </div>

        {/* FHE режим */}
        <div
          className={`glass-strong rounded-2xl p-8 transition-all duration-300 cursor-pointer ${
            hoveredCard === 2 ? 'scale-105 glow' : ''
          }`}
          onMouseEnter={() => setHoveredCard(2)}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div className="text-4xl mb-4">🔒</div>
          <h3 className="text-2xl font-bold text-white mb-3">FHE Mode</h3>
          <p className="text-gray-400 mb-6">
            Full mode with encryption. Opponent moves are not visible until the end of the game.
            Maximum privacy.
          </p>
          <div className="flex items-center gap-2 text-sm text-yellow-500">
            <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
            Requires relayer setup
          </div>
        </div>
      </div>

      {/* Кнопка начала игры */}
      {isConnected ? (
        <Link
          href="/tictactoe"
          className="px-12 py-4 rounded-xl gradient-bg text-white font-bold text-xl glow-hover transition-all duration-300 animate-slide-in"
        >
          Start Game →
        </Link>
      ) : (
        <div className="text-center animate-slide-in">
          <p className="text-gray-400 mb-4 text-lg">
            Connect your wallet to start playing
          </p>
          <div className="flex justify-center">
            <ConnectButton />
          </div>
        </div>
      )}

      {/* Информация о технологии */}
      <div className="mt-16 max-w-3xl w-full">
        <div className="glass rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">
            How it works?
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl mb-2">🔐</div>
              <h3 className="font-semibold text-white mb-2">Encryption</h3>
              <p className="text-sm text-gray-400">
                Moves are encrypted before being sent to the blockchain
              </p>
            </div>
            <div>
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="font-semibold text-white mb-2">Blockchain</h3>
              <p className="text-sm text-gray-400">
                All games are stored on a decentralized network
              </p>
            </div>
            <div>
              <div className="text-3xl mb-2">🛡️</div>
              <h3 className="font-semibold text-white mb-2">Privacy</h3>
              <p className="text-sm text-gray-400">
                Opponents can't see your moves until the game ends
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
