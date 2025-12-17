'use client'

import { useAccount } from 'wagmi'
import { useState } from 'react'
import TicTacToeGame from '@/components/TicTacToeGame'
import Link from 'next/link'

export default function TicTacToePage() {
  const { address, isConnected } = useAccount()
  const [gameMode, setGameMode] = useState<'mock' | 'fhe'>('fhe')

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center glass-strong rounded-2xl p-12 max-w-md w-full">
          <div className="text-6xl mb-6">🔐</div>
          <h2 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-8 text-lg">
            Connect your wallet to start playing Tic Tac Toe
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-3 rounded-xl gradient-bg text-white font-semibold hover:opacity-90 transition glow-hover"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Заголовок */}
        <div className="text-center mb-12 animate-slide-in">
          <h1 className="text-5xl md:text-7xl font-black mb-4 gradient-text">
            Tic Tac Toe
          </h1>
          <p className="text-xl text-gray-300">
            Play with full privacy on the blockchain
          </p>
        </div>

        {/* Переключатель режимов */}
        <div className="flex justify-center mb-8">
          <div className="glass-strong rounded-2xl p-2 inline-flex gap-2">
            <button
              onClick={() => setGameMode('fhe')}
              className={`px-8 py-3 rounded-xl font-bold transition-all duration-300 ${
                gameMode === 'fhe'
                  ? 'gradient-bg text-white glow scale-105'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              🔒 FHE Mode
            </button>
            <button
              onClick={() => setGameMode('mock')}
              className={`px-8 py-3 rounded-xl font-bold transition-all duration-300 ${
                gameMode === 'mock'
                  ? 'gradient-bg text-white glow scale-105'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              🎮 Mock Mode
            </button>
          </div>
        </div>

        {/* Описание режима */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="glass rounded-2xl p-6">
            {gameMode === 'mock' ? (
              <div className="text-center">
                <div className="text-4xl mb-3">🎮</div>
                <h3 className="text-xl font-bold text-white mb-2">Mock Contract Mode</h3>
                <p className="text-gray-400">
                  Simplified mode without encryption. All moves are visible in plain text.
                  Used for testing game logic. Moves are stored as regular numbers.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 rounded-lg">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-sm text-green-400">Ready to use</span>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-4xl mb-3">🔒</div>
                <h3 className="text-xl font-bold text-white mb-2">FHEVM Contract Mode</h3>
                <p className="text-gray-400">
                  Full mode using Fully Homomorphic Encryption from Zama.
                  Player moves are encrypted and not visible to opponents. Win checking happens
                  on encrypted data through the Zama relayer.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 rounded-lg">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                  <span className="text-sm text-yellow-400">Requires relayer setup</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Игровое поле */}
        <TicTacToeGame mode={gameMode} />
      </div>
    </div>
  )
}
