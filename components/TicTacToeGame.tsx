'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { ethers } from 'ethers'
import { getProvider, getSigner } from '@/lib/provider'

type GameMode = 'mock' | 'fhe'
type CellValue = 0 | 1 | 2 // 0 = empty cell, 1 = X, 2 = O
type GameStatus = 'waiting' | 'playing' | 'finished' | 'error'

interface GameState {
  gameId: number | null
  player1: string | null
  player2: string | null
  currentPlayer: string | null
  board: CellValue[]
  status: GameStatus
  winner: string | null
  isYourTurn: boolean
}

export default function TicTacToeGame({ mode }: { mode: GameMode }) {
  const { address, isConnected } = useAccount()
  const [gameState, setGameState] = useState<GameState>({
    gameId: null,
    player1: null,
    player2: null,
    currentPlayer: null,
    board: Array(9).fill(0) as CellValue[],
    status: 'waiting',
    winner: null,
    isYourTurn: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [relayerInstance, setRelayerInstance] = useState<any>(null)
  const [joinGameId, setJoinGameId] = useState<string>('')
  const [showJoinForm, setShowJoinForm] = useState(false)
  const [activeGames, setActiveGames] = useState<Array<{ gameId: number; player1: string; player2: string | null; status: string }>>([])
  const [loadingActiveGames, setLoadingActiveGames] = useState(false)

  const MOCK_CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_TICTACTOE_MOCK_ADDRESS || '').trim().replace(/\n/g, '').replace(/\r/g, '')
  const FHE_CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_TICTACTOE_FHE_ADDRESS || '').trim().replace(/\n/g, '').replace(/\r/g, '')
  const MOCK_ABI = [
    'function createGame() external returns (uint256)',
    'function joinGame(uint256 gameId) external',
    'function makeMove(uint256 gameId, uint8 position) external',
    'function getGame(uint256 gameId) external view returns (address player1, address player2, address currentPlayer, uint8[9] memory board, bool isActive, address winner)',
    'function getPlayerActiveGames(address player) external view returns (uint256[])',
    'event GameCreated(uint256 indexed gameId, address indexed player1, address indexed player2)',
    'event MoveMade(uint256 indexed gameId, address indexed player, uint8 position, uint8 symbol)',
    'event GameEnded(uint256 indexed gameId, address indexed winner)',
  ]

  const FHE_ABI = [
    'function createGame() external returns (uint256)',
    'function joinGame(uint256 gameId) external',
    'function makeMove(uint256 gameId, uint8 position, bytes32 encryptedMove, bytes calldata attestation) external',
    'function getGame(uint256 gameId) external view returns (address player1, address player2, address currentPlayer, bool isActive, address winner, uint8 moveCount)',
    'function getEncryptedBoard(uint256 gameId) external view returns (bytes32[9] memory)',
    'function getPlayerActiveGames(address player) external view returns (uint256[])',
    'event GameCreated(uint256 indexed gameId, address indexed player1, address indexed player2)',
    'event MoveMade(uint256 indexed gameId, address indexed player, uint8 position)',
    'event GameEnded(uint256 indexed gameId, address indexed winner)',
  ]

  useEffect(() => {
    if (mode === 'fhe' && isConnected && address) {
      initRelayer()
    } else if (mode === 'fhe' && !isConnected) {
      setError(null)
    }
  }, [mode, isConnected, address])

  useEffect(() => {
    if (isConnected && address && gameState.gameId === null) {
      loadActiveGames()
    } else if (!isConnected) {
      setActiveGames([])
    }
  }, [isConnected, address, gameState.gameId])
  const initRelayer = async () => {
    try {
      setError(null)
      
      if (typeof window === 'undefined') {
        throw new Error('Relayer can only be initialized in browser environment')
      }

      if (typeof global === 'undefined') {
        (window as any).global = globalThis
      }

      const relayerModule = await import('@zama-fhe/relayer-sdk/web')
      
      console.log('Initializing SDK...')
      const sdkInitialized = await relayerModule.initSDK()
      if (!sdkInitialized) {
        throw new Error('Failed to initialize SDK')
      }
      console.log('✅ SDK initialized')
      
      const config = relayerModule.SepoliaConfig as any
      console.log('SepoliaConfig:', config)
      console.log('Relayer endpoint:', config.relayerUrl)
      console.log('Chain ID:', config.chainId)
      
      if (config.relayerUrl) {
        try {
          const response = await fetch(`${config.relayerUrl}/health`, { 
            method: 'GET',
            mode: 'cors'
          })
          console.log('Relayer health check:', response.status, response.statusText)
        } catch (healthError) {
          console.warn('Relayer health check failed (may be normal):', healthError)
        }
      }
      
      console.log('Creating relayer instance...')
      const instance = await relayerModule.createInstance(relayerModule.SepoliaConfig)
      
      setRelayerInstance(instance)
      console.log('✅ Zama Relayer initialized successfully:', instance)
    } catch (err: any) {
      console.error('❌ Failed to initialize Zama relayer:', err)
      
      let errorMessage = 'Failed to initialize relayer'
      if (err.message) {
        errorMessage = err.message
      }
      if (err.cause) {
        console.error('Error cause:', err.cause)
      }
      
      if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('ENOTFOUND')) {
        errorMessage += '. Possible issue with relayer endpoint. Check connection to https://relayer.testnet.zama.org'
      }
      
      setError(`${errorMessage}. Make sure you are connected to Sepolia network.`)
    }
  }

  const createGame = async () => {
    if (!address || !isConnected) {
      setError('Please connect your wallet')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const signer = await getSigner()
      const contractAddress = mode === 'mock' ? MOCK_CONTRACT_ADDRESS : FHE_CONTRACT_ADDRESS
      const abi = mode === 'mock' ? MOCK_ABI : FHE_ABI

      if (!contractAddress) {
        throw new Error(`Contract address not set for ${mode} mode`)
      }

      const cleanAddress = contractAddress.trim().replace(/\n/g, '').replace(/\r/g, '')
      if (!ethers.isAddress(cleanAddress)) {
        throw new Error(`Invalid contract address for ${mode} mode: ${cleanAddress}`)
      }

      const contract = new ethers.Contract(cleanAddress, abi, signer)
      const tx = await contract.createGame()
      const receipt = await tx.wait()

      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log)
          return parsed?.name === 'GameCreated'
        } catch {
          return false
        }
      })

      let gameId: number
      if (event) {
        const parsed = contract.interface.parseLog(event)
        gameId = Number(parsed?.args.gameId)
      } else {
        gameId = await contract.gameCounter() - 1
      }

      setGameState({
        gameId: Number(gameId),
        player1: address,
        player2: null,
        currentPlayer: address,
        board: Array(9).fill(0) as CellValue[],
        status: 'waiting',
        winner: null,
        isYourTurn: true,
      })

      // Load game state
      await loadGameState(gameId)
      
      // Update active games list
      await loadActiveGames()
    } catch (err: any) {
      console.error('Error creating game:', err)
      setError(err.message || 'Failed to create game')
    } finally {
      setLoading(false)
    }
  }

  const joinGame = async (gameId: number) => {
    if (!address || !isConnected) {
      setError('Please connect your wallet')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const signer = await getSigner()
      const contractAddress = mode === 'mock' ? MOCK_CONTRACT_ADDRESS : FHE_CONTRACT_ADDRESS
      const abi = mode === 'mock' ? MOCK_ABI : FHE_ABI

      const cleanAddress = contractAddress.trim().replace(/\n/g, '').replace(/\r/g, '')
      if (!ethers.isAddress(cleanAddress)) {
        throw new Error(`Invalid contract address: ${cleanAddress}`)
      }
      const contract = new ethers.Contract(cleanAddress, abi, signer)
      const tx = await contract.joinGame(gameId)
      await tx.wait()

      await loadGameState(gameId)
      await loadActiveGames()
    } catch (err: any) {
      console.error('Error joining game:', err)
      setError(err.message || 'Failed to join game')
    } finally {
      setLoading(false)
    }
  }

  const loadActiveGames = async () => {
    if (!address || !isConnected) return

    setLoadingActiveGames(true)
    try {
      const provider = getProvider()
      const contractAddress = mode === 'mock' ? MOCK_CONTRACT_ADDRESS : FHE_CONTRACT_ADDRESS
      const abi = mode === 'mock' ? MOCK_ABI : FHE_ABI

      const cleanAddress = contractAddress.trim().replace(/\n/g, '').replace(/\r/g, '')
      if (!ethers.isAddress(cleanAddress)) {
        throw new Error(`Invalid contract address: ${cleanAddress}`)
      }

      const contract = new ethers.Contract(cleanAddress, abi, provider)
      
      console.log('🔍 Loading active games for address:', address)
      let gameIds: bigint[] = []
      
      try {
        const result = await contract.getPlayerActiveGames(address)
        if (result && Array.isArray(result) && result.length > 0) {
          gameIds = result
        } else if (result && typeof result === 'object' && 'length' in result) {
          gameIds = Array.from(result) as bigint[]
        }
        console.log('📋 Found game IDs:', gameIds.map(id => Number(id)))
      } catch (err: any) {
        console.log('⚠️ getPlayerActiveGames returned empty or error:', err.message)
        if (err.code === 'BAD_DATA' || err.message?.includes('could not decode')) {
          console.log('ℹ️ Player has no games yet')
          setActiveGames([])
          return
        }
        throw err
      }
      
      if (gameIds.length === 0) {
        console.log('⚠️ No games found for player')
        setActiveGames([])
        return
      }
      
      // Load info for each game
      const gamesInfo = await Promise.all(
        gameIds.map(async (gameId: bigint) => {
          try {
            if (mode === 'mock') {
              const [player1, player2, currentPlayer, board, isActive, winner] = await contract.getGame(gameId)
              
              console.log(`🎮 Game ${Number(gameId)}:`, {
                player1,
                player2,
                isActive,
                winner,
                currentAddress: address
              })
              
              if (!isActive) {
                console.log(`  ❌ Game ${Number(gameId)} is not active`)
                return null
              }
              if (player1.toLowerCase() !== address.toLowerCase() && 
                  (player2 === ethers.ZeroAddress || player2.toLowerCase() !== address.toLowerCase())) {
                console.log(`  ❌ Player ${address} is not a participant in game ${Number(gameId)}`)
                return null
              }

              let status = 'playing'
              if (player2 === ethers.ZeroAddress) {
                status = 'waiting'
              } else if (winner !== ethers.ZeroAddress) {
                status = 'finished'
              }

              return {
                gameId: Number(gameId),
                player1,
                player2: player2 === ethers.ZeroAddress ? null : player2,
                status,
              }
            } else {
              const [player1, player2, currentPlayer, isActive, winner, moveCount] = await contract.getGame(gameId)
              
              if (!isActive) return null
              if (player1.toLowerCase() !== address.toLowerCase() && 
                  (player2 === ethers.ZeroAddress || player2.toLowerCase() !== address.toLowerCase())) {
                return null
              }

              let status = 'playing'
              if (player2 === ethers.ZeroAddress) {
                status = 'waiting'
              } else if (winner !== ethers.ZeroAddress) {
                status = 'finished'
              }

              return {
                gameId: Number(gameId),
                player1,
                player2: player2 === ethers.ZeroAddress ? null : player2,
                status,
              }
            }
          } catch (err) {
            console.error(`Error loading game ${gameId}:`, err)
            return null
          }
        })
      )

      const activeGamesList = gamesInfo.filter(
        (game): game is { gameId: number; player1: string; player2: string | null; status: string } => 
          game !== null && (game.status === 'waiting' || game.status === 'playing')
      ) as Array<{ gameId: number; player1: string; player2: string | null; status: string }>

      console.log('✅ Active games list:', activeGamesList)
      setActiveGames(activeGamesList)
    } catch (err: any) {
      console.error('❌ Error loading active games:', err)
      if (err.code === 'BAD_DATA' || err.message?.includes('could not decode')) {
        console.log('ℹ️ Player has no games (empty result)')
        setActiveGames([])
        setError(null)
      } else {
        setError(`Error loading games: ${err.message || 'Unknown error'}`)
      }
    } finally {
      setLoadingActiveGames(false)
    }
  }

  const loadGameState = async (gameId: number) => {
    try {
      const provider = getProvider()
      const contractAddress = mode === 'mock' ? MOCK_CONTRACT_ADDRESS : FHE_CONTRACT_ADDRESS
      const abi = mode === 'mock' ? MOCK_ABI : FHE_ABI

      const cleanAddress = contractAddress.trim().replace(/\n/g, '').replace(/\r/g, '')
      if (!ethers.isAddress(cleanAddress)) {
        throw new Error(`Invalid contract address: ${cleanAddress}`)
      }
      const contract = new ethers.Contract(cleanAddress, abi, provider)

      if (mode === 'mock') {
        const [player1, player2, currentPlayer, board, isActive, winner] = await contract.getGame(gameId)
        
        const boardArray = board.map((v: any) => Number(v)) as CellValue[]
        const isYourTurn = currentPlayer.toLowerCase() === address?.toLowerCase()
        
        console.log('📊 Game state loaded:', {
          gameId: Number(gameId),
          player1,
          player2: player2 === ethers.ZeroAddress ? null : player2,
          currentPlayer,
          board: boardArray,
          isActive,
          winner: winner === ethers.ZeroAddress ? null : winner,
          isYourTurn,
          address
        })
        
        setGameState({
          gameId: Number(gameId),
          player1,
          player2: player2 === ethers.ZeroAddress ? null : player2,
          currentPlayer,
          board: boardArray,
          status: isActive ? (player2 === ethers.ZeroAddress ? 'waiting' : 'playing') : 'finished',
          winner: winner === ethers.ZeroAddress ? null : winner,
          isYourTurn,
        })
      } else {
        const [player1, player2, currentPlayer, isActive, winner, moveCount] = await contract.getGame(gameId)
        
        setGameState({
          gameId: Number(gameId),
          player1,
          player2: player2 === ethers.ZeroAddress ? null : player2,
          currentPlayer,
          board: Array(9).fill(0) as CellValue[],
          status: isActive ? 'playing' : 'finished',
          winner: winner === ethers.ZeroAddress ? null : winner,
          isYourTurn: currentPlayer.toLowerCase() === address?.toLowerCase(),
        })
      }
    } catch (err: any) {
      console.error('Error loading game state:', err)
      setError(err.message || 'Failed to load game state')
    }
  }

  const makeMove = async (position: number) => {
    console.log('🎯 makeMove called:', { position, gameId: gameState.gameId, isYourTurn: gameState.isYourTurn, address })
    
    if (!address || !gameState.gameId) {
      console.log('❌ Missing address or gameId')
      setError('Please connect wallet and select a game')
      return
    }

    if (!gameState.isYourTurn) {
      console.log('❌ Not your turn')
      setError('It is not your turn')
      return
    }

    if (gameState.board[position] !== 0) {
      console.log('❌ Cell already taken:', position)
      setError('This cell is already taken')
      return
    }

    if (gameState.status !== 'playing') {
      console.log('❌ Game not in playing status:', gameState.status)
      setError('Game is not active')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const signer = await getSigner()
      const contractAddress = mode === 'mock' ? MOCK_CONTRACT_ADDRESS : FHE_CONTRACT_ADDRESS
      const abi = mode === 'mock' ? MOCK_ABI : FHE_ABI

      const cleanAddress = contractAddress.trim().replace(/\n/g, '').replace(/\r/g, '')
      if (!ethers.isAddress(cleanAddress)) {
        throw new Error(`Invalid contract address: ${cleanAddress}`)
      }
      const contract = new ethers.Contract(cleanAddress, abi, signer)

      if (mode === 'mock') {
        console.log('📤 Sending move transaction...', { gameId: gameState.gameId, position })
        const tx = await contract.makeMove(gameState.gameId, position)
        console.log('⏳ Waiting for transaction confirmation...', tx.hash)
        const receipt = await tx.wait()
        console.log('✅ Transaction confirmed:', receipt.transactionHash)
      } else {
        if (!relayerInstance) {
          throw new Error('FHEVM relayer not initialized. Please wait for initialization or check configuration.')
        }

        const symbol = gameState.player1?.toLowerCase() === address.toLowerCase() ? 1 : 2

        const encryptedInput = await relayerInstance
          .createEncryptedInput(contractAddress, address)
          .add8(symbol)
          .encrypt()

        const encryptedHandle = encryptedInput.handles[0]
        const attestation = encryptedInput.inputProof

        const tx = await contract.makeMove(
          gameState.gameId,
          position,
          encryptedHandle,
          attestation
        )
        const receipt = await tx.wait()
        console.log('✅ FHE Transaction confirmed:', receipt.transactionHash)
      }

      console.log('🔄 Reloading game state...')
      await loadGameState(gameState.gameId)
      await loadActiveGames()
      console.log('✅ Move completed successfully')
    } catch (err: any) {
      console.error('❌ Error making move:', err)
      setError(err.message || 'Failed to make move')
    } finally {
      setLoading(false)
    }
  }

  const getCellSymbol = (value: CellValue, position: number): string => {
    if (mode === 'fhe' && gameState.status === 'playing') {
      if (gameState.board[position] !== 0) {
        const isPlayer1 = gameState.player1?.toLowerCase() === address?.toLowerCase()
        return isPlayer1 ? 'X' : 'O'
      }
      return ''
    }

    if (value === 1) return 'X'
    if (value === 2) return 'O'
    return ''
  }

  const getCellClass = (value: CellValue, position: number): string => {
    const baseClass = 'game-cell w-32 h-32 rounded-xl flex items-center justify-center text-6xl font-black transition-all duration-300'
    
    if (value === 0 && gameState.isYourTurn && gameState.status === 'playing') {
      return `${baseClass} cursor-pointer animate-pulse-glow`
    }
    
    if (value === 1) return `${baseClass} x`
    if (value === 2) return `${baseClass} o`
    return `${baseClass} text-gray-600`
  }

  return (
    <div className="max-w-4xl mx-auto">
      {error && (
        <div className="mb-6 glass rounded-xl p-4 border border-red-500/50 bg-red-500/10 animate-slide-in">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <p className="text-red-300 font-semibold">{error}</p>
          </div>
        </div>
      )}

      <div className="glass-strong rounded-2xl p-8 mb-8 animate-slide-in">
        {gameState.gameId === null ? (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-6">🎮</div>
            <p className="text-gray-300 mb-6 text-xl">No active game</p>
            
            {isConnected && address && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">Your Active Games</h3>
                  <button
                    onClick={loadActiveGames}
                    disabled={loadingActiveGames}
                    className="px-4 py-2 text-sm glass rounded-lg hover:bg-white/10 transition disabled:opacity-50"
                  >
                    {loadingActiveGames ? '⏳' : '🔄'}
                  </button>
                </div>
                
                {loadingActiveGames ? (
                  <div className="glass rounded-xl p-6">
                    <p className="text-gray-400">Loading games...</p>
                  </div>
                ) : activeGames.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {activeGames.map((game) => (
                      <div
                        key={game.gameId}
                        className="glass rounded-xl p-4 flex items-center justify-between hover:bg-white/5 transition cursor-pointer"
                        onClick={() => loadGameState(game.gameId)}
                      >
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">🎯</span>
                            <div>
                              <p className="text-white font-bold">Game #{game.gameId}</p>
                              <p className="text-xs text-gray-400">
                                {game.status === 'waiting' 
                                  ? '⏳ Waiting for second player'
                                  : game.status === 'playing'
                                  ? '🎮 Game in progress'
                                  : '✅ Finished'}
                              </p>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            <span>Player 1: {game.player1.slice(0, 6)}...{game.player1.slice(-4)}</span>
                            {game.player2 && (
                              <span className="ml-3">Player 2: {game.player2.slice(0, 6)}...{game.player2.slice(-4)}</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            loadGameState(game.gameId)
                          }}
                          className="px-4 py-2 gradient-bg rounded-lg text-white font-semibold hover:opacity-90 transition text-sm"
                        >
                          Continue
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="glass rounded-xl p-6">
                    <p className="text-gray-400">No active games</p>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={createGame}
                disabled={loading}
                className="px-10 py-4 rounded-xl gradient-bg text-white font-bold text-lg glow-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Creating game...
                  </span>
                ) : (
                  '✨ Create New Game'
                )}
              </button>
              
              <button
                onClick={() => setShowJoinForm(!showJoinForm)}
                disabled={loading}
                className="px-10 py-4 rounded-xl glass text-white font-bold text-lg hover:bg-white/10 transition-all disabled:opacity-50"
              >
                {showJoinForm ? '✖ Cancel' : '🔗 Join Game'}
              </button>
            </div>

            {showJoinForm && (
              <div className="mt-6 glass rounded-xl p-6 max-w-md mx-auto animate-slide-in">
                <h3 className="text-xl font-bold text-white mb-4">Join Game</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Game ID
                    </label>
                    <input
                      type="text"
                      value={joinGameId}
                      onChange={(e) => setJoinGameId(e.target.value)}
                      placeholder="Enter game ID"
                      className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      disabled={loading}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Ask the game creator for the Game ID
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const gameId = parseInt(joinGameId)
                      if (!isNaN(gameId) && gameId >= 0) {
                        joinGame(gameId)
                        setShowJoinForm(false)
                        setJoinGameId('')
                      } else {
                        setError('Please enter a valid Game ID (number)')
                      }
                    }}
                    disabled={loading || !joinGameId}
                    className="w-full px-6 py-3 rounded-xl gradient-bg text-white font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Joining...' : '🎮 Join'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="glass rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">❌</span>
                  <p className="text-gray-400 text-sm font-semibold">Player 1 (X)</p>
                </div>
                <p className="text-white font-bold text-lg font-mono">
                  {gameState.player1?.slice(0, 8)}...{gameState.player1?.slice(-6)}
                </p>
                {gameState.player1?.toLowerCase() === address?.toLowerCase() && (
                  <span className="inline-block mt-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-lg text-xs">
                    You
                  </span>
                )}
              </div>
              <div className="glass rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">⭕</span>
                  <p className="text-gray-400 text-sm font-semibold">Player 2 (O)</p>
                </div>
                {gameState.player2 ? (
                  <>
                    <p className="text-white font-bold text-lg font-mono">
                      {gameState.player2.slice(0, 8)}...{gameState.player2.slice(-6)}
                    </p>
                    {gameState.player2.toLowerCase() === address?.toLowerCase() && (
                      <span className="inline-block mt-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-lg text-xs">
                        You
                      </span>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500 font-semibold">Waiting for player...</p>
                )}
              </div>
            </div>

            {gameState.status === 'waiting' && gameState.player2 === null && (
              <div className="text-center glass rounded-xl p-6 mb-6">
                <div className="text-4xl mb-3 animate-pulse">⏳</div>
                <p className="text-gray-300 mb-2 text-lg font-semibold">Waiting for second player...</p>
                <div className="bg-gray-800 rounded-lg p-4 mb-4">
                  <p className="text-xs text-gray-400 mb-1">Game ID to join:</p>
                  <p className="text-2xl font-bold text-white font-mono">{gameState.gameId}</p>
                </div>
                <p className="text-xs text-gray-500 mb-4">Share this ID with another player</p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => {
                      if (gameState.gameId !== null) {
                        navigator.clipboard.writeText(gameState.gameId.toString())
                        setError(null)
                      }
                    }}
                    className="px-4 py-2 bg-indigo-500/20 text-indigo-300 rounded-lg hover:bg-indigo-500/30 transition text-sm"
                  >
                    📋 Copy ID
                  </button>
                  <button
                    onClick={() => {
                      setGameState({
                        gameId: null,
                        player1: null,
                        player2: null,
                        currentPlayer: null,
                        board: Array(9).fill(0) as CellValue[],
                        status: 'waiting',
                        winner: null,
                        isYourTurn: false,
                      })
                    }}
                    className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition text-sm"
                  >
                    🏠 Home
                  </button>
                </div>
              </div>
            )}

            {gameState.status === 'playing' && (
              <div className="text-center glass rounded-xl p-6 mb-6">
                {gameState.isYourTurn ? (
                  <div className="animate-pulse-glow">
                    <div className="text-4xl mb-2">✨</div>
                    <p className="text-white font-bold text-2xl gradient-text">Your turn!</p>
                  </div>
                ) : (
                  <div>
                    <div className="text-4xl mb-2">⏸️</div>
                    <p className="text-gray-400 font-semibold text-xl">Opponent's turn</p>
                  </div>
                )}
              </div>
            )}

            {gameState.status === 'finished' && (
              <div className="text-center glass rounded-xl p-6 mb-6">
                {gameState.winner ? (
                  gameState.winner.toLowerCase() === address?.toLowerCase() ? (
                    <div>
                      <div className="text-6xl mb-3">🎉</div>
                      <p className="text-white font-bold text-3xl gradient-text">You won!</p>
                    </div>
                  ) : (
                    <div>
                      <div className="text-6xl mb-3">😢</div>
                      <p className="text-white font-bold text-3xl">You lost</p>
                    </div>
                  )
                ) : (
                  <div>
                    <div className="text-6xl mb-3">🤝</div>
                    <p className="text-white font-bold text-3xl">It's a tie!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {gameState.gameId !== null && (
        <div className="glass-strong rounded-2xl p-8 animate-slide-in">
          <div className="grid grid-cols-3 gap-4 w-fit mx-auto mb-8">
            {Array.from({ length: 9 }).map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  console.log('🖱️ Cell clicked:', index, {
                    loading,
                    isYourTurn: gameState.isYourTurn,
                    status: gameState.status,
                    cellValue: gameState.board[index]
                  })
                  makeMove(index)
                }}
                disabled={loading || !gameState.isYourTurn || gameState.status !== 'playing' || gameState.board[index] !== 0}
                className={getCellClass(gameState.board[index], index)}
              >
                {getCellSymbol(gameState.board[index], index)}
              </button>
            ))}
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => gameState.gameId && loadGameState(gameState.gameId)}
              disabled={loading}
              className="px-6 py-3 glass rounded-xl text-white font-semibold hover:bg-white/10 transition disabled:opacity-50"
            >
              🔄 Refresh State
            </button>
            {gameState.status === 'finished' && (
              <button
                onClick={createGame}
                disabled={loading}
                className="px-6 py-3 gradient-bg rounded-xl text-white font-semibold glow-hover transition disabled:opacity-50"
              >
                🎮 New Game
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
