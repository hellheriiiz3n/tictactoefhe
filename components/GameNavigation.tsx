'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function GameNavigation() {
  const pathname = usePathname()

  return (
    <header className="w-full border-b border-indigo-500/20 bg-black/30 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg gradient-bg flex items-center justify-center text-2xl font-bold group-hover:scale-110 transition-transform">
            ⭕
          </div>
          <span className="text-xl font-bold gradient-text">Tic Tac Toe</span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className={`px-4 py-2 rounded-lg transition-all ${
              pathname === '/'
                ? 'gradient-bg text-white glow'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Home
          </Link>
          <Link
            href="/tictactoe"
            className={`px-4 py-2 rounded-lg transition-all ${
              pathname === '/tictactoe'
                ? 'gradient-bg text-white glow'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Play
          </Link>
          <Link
            href="/about"
            className={`px-4 py-2 rounded-lg transition-all ${
              pathname === '/about'
                ? 'gradient-bg text-white glow'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            About
          </Link>
        </nav>

        {/* Connect Wallet Button */}
        <div className="flex items-center">
          <ConnectButton />
        </div>
      </div>
    </header>
  )
}

