import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import GameNavigation from '@/components/GameNavigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Tic-Tac-Toe on Blockchain | Zama FHEVM',
  description: 'Play Tic-Tac-Toe with full privacy using Fully Homomorphic Encryption on blockchain',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Полифилл для global в браузере */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof global === 'undefined') {
                window.global = globalThis;
              }
            `,
          }}
        />
      </head>
      <body className={`${inter.className} min-h-screen`}>
        <Providers>
          <GameNavigation />
          <main className="flex-1">{children}</main>
        </Providers>
      </body>
    </html>
  )
}
